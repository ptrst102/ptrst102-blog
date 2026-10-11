import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const MINIMUM_RELEASE_AGE_MS = 24 * 60 * 60 * 1000;

const exactVersion = /^\d+\.\d+\.\d+(?:-[\da-z.-]+)?(?:\+[\da-z.-]+)?$/i;

// pnpm自体のインストール前に実行するため、外部依存を使わない。
export const fetchPackageMetadata = async (name) => {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    throw new Error(`${name}: 公開日時を取得できません (${response.status})`);
  }
  return response.json();
};

export const checkPackageManager = async (
  packageManager,
  { now = Date.now(), fetchMetadata = fetchPackageMetadata } = {},
) => {
  const match = /^pnpm@([^+]+)(?:\+sha(?:224|256|384|512)\.[a-f\d]+)?$/i.exec(
    packageManager ?? "",
  );
  if (!match || !exactVersion.test(match[1])) {
    throw new Error("packageManagerにはpnpmの正確なバージョンが必要です");
  }

  const releases = new Map();
  const visit = async (name, version) => {
    if (!exactVersion.test(version)) {
      throw new Error(
        `${name}: 固定されていない依存バージョンです (${version})`,
      );
    }
    const key = `${name}@${version}`;
    if (releases.has(key)) return;
    const metadata = await fetchMetadata(name);
    const manifest = metadata.versions?.[version];
    const published = metadata.time?.[version];
    const timestamp =
      typeof published === "string" ? Date.parse(published) : NaN;
    if (!manifest || !Number.isFinite(timestamp)) {
      throw new Error(`${key}: 公開日時またはバージョン情報がありません`);
    }
    if (now - timestamp < MINIMUM_RELEASE_AGE_MS) {
      throw new Error(`${key}: 公開後24時間未満です (${published})`);
    }
    releases.set(key, published);

    // pnpm 12のプラットフォーム別実行ファイルも、例外なく検証する。
    for (const [dependency, dependencyVersion] of Object.entries({
      ...manifest.dependencies,
      ...manifest.optionalDependencies,
    })) {
      await visit(dependency, dependencyVersion);
    }
  };
  await visit("pnpm", match[1]);
  return releases;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const manifest = JSON.parse(await readFile("package.json", "utf8"));
    const releases = await checkPackageManager(manifest.packageManager);
    console.log(
      `公開後24時間以上: ${manifest.packageManager}と実行時依存の計${releases.size}件`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
