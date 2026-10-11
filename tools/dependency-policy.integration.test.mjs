import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = new URL("../", import.meta.url);
const workspace = await readFile(new URL("pnpm-workspace.yaml", root), "utf8");
const { packageManager } = JSON.parse(
  await readFile(new URL("package.json", root), "utf8"),
);
const executable = process.env.npm_execpath ?? "pnpm";
const command = /\.[cm]?js$/.test(executable)
  ? [process.execPath, executable]
  : [executable];

// 実際のpnpmとリポジトリ設定を使い、外部レジストリには接続しない。
test("pnpmの公開待機を直接依存・推移依存・固定ロックで強制する", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "dependency-policy-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const now = Date.now();
  const old = new Date(now - 48 * 60 * 60 * 1000).toISOString();
  const recent = new Date(now - 60 * 60 * 1000).toISOString();
  const packages = new Map();
  const requests = [];
  const server = createServer((request, response) => {
    const path = decodeURIComponent(request.url.split("?")[0]);
    requests.push(path);
    const entry = packages.get(path.replace(/^\//, "").replace(/\.tgz$/, ""));
    if (!entry) {
      response.writeHead(404).end();
    } else if (path.endsWith(".tgz")) {
      response.writeHead(200, { "Content-Type": "application/octet-stream" });
      response.end(entry.tarball);
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(entry.metadata));
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const registry = `http://127.0.0.1:${server.address().port}/`;

  const addPackage = async (name, time, dependencies = {}) => {
    const staging = join(directory, "archives", name);
    await mkdir(join(staging, "package"), { recursive: true });
    const manifest = { name, version: "1.0.0", dependencies };
    await writeFile(
      join(staging, "package/package.json"),
      JSON.stringify(manifest),
    );
    await run("tar", [
      "-czf",
      join(staging, "package.tgz"),
      "-C",
      staging,
      "package",
    ]);
    const tarball = await readFile(join(staging, "package.tgz"));
    const integrity = `sha512-${createHash("sha512").update(tarball).digest("base64")}`;
    packages.set(name, {
      tarball,
      metadata: {
        name,
        "dist-tags": { latest: "1.0.0" },
        ...(time ? { time: { "1.0.0": time } } : {}),
        versions: {
          "1.0.0": {
            ...manifest,
            dist: { integrity, tarball: `${registry}${name}.tgz` },
          },
        },
      },
    });
  };
  const createProject = async (name, dependencies) => {
    const path = join(directory, name);
    await mkdir(path);
    await writeFile(
      join(path, "package.json"),
      JSON.stringify({ name, private: true, packageManager, dependencies }),
    );
    await writeFile(join(path, "pnpm-workspace.yaml"), workspace);
    await writeFile(join(path, ".npmrc"), `registry=${registry}\n`);
    return path;
  };
  let invocation = 0;
  const install = async (cwd, ...args) => {
    const cache = join(directory, `cache-${invocation++}`);
    const result = await run(
      command[0],
      [
        ...command.slice(1),
        "install",
        "--ignore-scripts",
        "--reporter=append-only",
        ...args,
      ],
      {
        cwd,
        timeout: 30_000,
        env: {
          ...process.env,
          CI: "true",
          PNPM_HOME: join(cache, "pnpm"),
          XDG_CACHE_HOME: join(cache, "cache"),
          XDG_CONFIG_HOME: join(cache, "config"),
          XDG_DATA_HOME: join(cache, "data"),
          XDG_STATE_HOME: join(cache, "state"),
        },
      },
    ).catch((error) => ({
      code: error.code ?? 1,
      stdout: error.stdout,
      stderr: error.stderr,
    }));
    return {
      code: result.code ?? 0,
      output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
    };
  };
  const rejectAge = (result) => {
    assert.notEqual(result.code, 0, result.output);
    assert.match(
      result.output,
      /MINIMUM_RELEASE_AGE|minimumReleaseAge|too (?:new|recent)/i,
    );
  };

  await addPackage("policy-recent-direct", recent);
  await addPackage("policy-recent-child", recent);
  await addPackage("policy-parent", old, { "policy-recent-child": "1.0.0" });
  await addPackage("policy-no-time", undefined);
  await addPackage("policy-range", old);
  const range = packages.get("policy-range").metadata;
  range["dist-tags"].latest = "1.1.0";
  range.time["1.1.0"] = recent;
  range.versions["1.1.0"] = { ...range.versions["1.0.0"], version: "1.1.0" };

  await t.test("範囲指定では新しいlatestを避けて古い版を選ぶ", async () => {
    const project = await createProject("range", { "policy-range": "^1.0.0" });
    const result = await install(
      project,
      "--no-frozen-lockfile",
      "--lockfile-only",
    );
    assert.equal(result.code, 0, result.output);
    const lockfile = await readFile(join(project, "pnpm-lock.yaml"), "utf8");
    assert.match(lockfile, /policy-range@1\.0\.0/);
    assert.doesNotMatch(lockfile, /policy-range@1\.1\.0/);
  });
  await t.test("公開後1時間の直接依存を拒否する", async () => {
    const project = await createProject("direct", {
      "policy-recent-direct": "1.0.0",
    });
    rejectAge(
      await install(project, "--no-frozen-lockfile", "--lockfile-only"),
    );
  });
  await t.test("古い親パッケージの新しい推移依存を拒否する", async () => {
    const project = await createProject("transitive", {
      "policy-parent": "1.0.0",
    });
    rejectAge(
      await install(project, "--no-frozen-lockfile", "--lockfile-only"),
    );
  });
  await t.test("公開日時のない依存を拒否する", async () => {
    const project = await createProject("missing-time", {
      "policy-no-time": "1.0.0",
    });
    const result = await install(
      project,
      "--no-frozen-lockfile",
      "--lockfile-only",
    );
    assert.notEqual(result.code, 0, result.output);
    assert.match(result.output, /MISSING_TIME|publish time|time field/i);
  });
  await t.test(
    "固定ロック内の新しい推移依存をインストール前に拒否する",
    async () => {
      const child = packages.get("policy-recent-child").metadata;
      child.time["1.0.0"] = old;
      const project = await createProject("frozen", {
        "policy-parent": "1.0.0",
      });
      const locked = await install(
        project,
        "--no-frozen-lockfile",
        "--lockfile-only",
      );
      assert.equal(locked.code, 0, locked.output);
      // モックの時刻だけを変え、新しいパッケージを含む固定ロックを再現する。
      child.time["1.0.0"] = recent;
      requests.length = 0;
      rejectAge(await install(project, "--frozen-lockfile"));
      await assert.rejects(access(join(project, "node_modules/policy-parent")));

      delete child.time["1.0.0"];
      const missingTime = await install(project, "--frozen-lockfile");
      assert.notEqual(missingTime.code, 0, missingTime.output);
      assert.match(
        missingTime.output,
        /MISSING_TIME|minimumReleaseAge \(version not present in registry manifest\)/i,
      );

      child.time["1.0.0"] = old;
      const installed = await install(project, "--frozen-lockfile");
      assert.equal(installed.code, 0, installed.output);
      assert(requests.some((path) => path.endsWith(".tgz")));
    },
  );
});
