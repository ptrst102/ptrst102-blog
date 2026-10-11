import assert from "node:assert/strict";
import test from "node:test";
import {
  checkPackageManager,
  MINIMUM_RELEASE_AGE_MS,
} from "./dependency-policy.mjs";

const now = Date.parse("2026-10-11T12:00:00Z");
const metadata = (age, dependencies = {}) => ({
  time: { "12.11.2": new Date(now - age).toISOString() },
  versions: { "12.11.2": { optionalDependencies: dependencies } },
});

test("公開後ちょうど24時間のpnpmと実行ファイルを許可する", async () => {
  const packages = {
    pnpm: metadata(MINIMUM_RELEASE_AGE_MS, {
      "@pnpm/exe.linux-x64": "12.11.2",
    }),
    "@pnpm/exe.linux-x64": metadata(MINIMUM_RELEASE_AGE_MS),
  };
  const releases = await checkPackageManager("pnpm@12.11.2", {
    now,
    fetchMetadata: async (name) => packages[name],
  });
  assert.equal(releases.size, 2);
});

test("24時間に1ミリ秒足りないpnpmを拒否する", async () => {
  await assert.rejects(
    checkPackageManager("pnpm@12.11.2", {
      now,
      fetchMetadata: async () => metadata(MINIMUM_RELEASE_AGE_MS - 1),
    }),
    /公開後24時間未満/,
  );
});

test("pnpmが古くても新しい実行ファイルを拒否する", async () => {
  await assert.rejects(
    checkPackageManager("pnpm@12.11.2", {
      now,
      fetchMetadata: async (name) =>
        name === "pnpm"
          ? metadata(MINIMUM_RELEASE_AGE_MS * 2, {
              "@pnpm/exe.linux-x64": "12.11.2",
            })
          : metadata(60_000),
    }),
    /@pnpm\/exe.linux-x64@12.11.2: 公開後24時間未満/,
  );
});

test("公開日時が不明・不正・未来の場合は拒否する", async () => {
  for (const published of [undefined, null, "不明", "2026-10-12T12:00:00Z"]) {
    await assert.rejects(
      checkPackageManager("pnpm@12.11.2", {
        now,
        fetchMetadata: async () => ({
          versions: { "12.11.2": {} },
          time: { "12.11.2": published },
        }),
      }),
      /公開日時|公開後24時間未満/,
    );
  }
});

test("バージョン不明・範囲指定・取得失敗を許可しない", async () => {
  for (const packageManager of [undefined, "npm@12.11.2", "pnpm@^12.11.2"]) {
    await assert.rejects(
      checkPackageManager(packageManager),
      /正確なバージョン/,
    );
  }
  await assert.rejects(
    checkPackageManager("pnpm@12.11.2", {
      now,
      fetchMetadata: async () =>
        metadata(MINIMUM_RELEASE_AGE_MS, { foo: "^1" }),
    }),
    /固定されていない依存/,
  );
  await assert.rejects(
    checkPackageManager("pnpm@12.11.2", {
      now,
      fetchMetadata: async () => {
        throw new Error("レジストリへの接続失敗");
      },
    }),
    /レジストリへの接続失敗/,
  );
});
