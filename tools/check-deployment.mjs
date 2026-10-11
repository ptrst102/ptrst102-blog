import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";

const base = new URL(process.argv[2]);
const previous = process.argv[3] ? new URL(process.argv[3]) : undefined;
const expectedCommit = process.argv[4];
assert(
  /^[a-f0-9]{40}$/.test(expectedCommit ?? ""),
  "公開コミットの指定が必要です",
);
const manifest = JSON.parse(await readFile("package.json", "utf8"));
const generator = `Astro v${manifest.dependencies.astro}`;

const fetchPage = async (path, origin = base) => {
  const url = new URL(path, origin);
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
      assert(
        response.ok || (path === "/404.html" && response.status === 404),
        `${response.url}: HTTP ${response.status}`,
      );
      return response;
    } catch (error) {
      if (attempt >= 2)
        throw new Error(`${url}: ${error.message}`, { cause: error });
      await setTimeout(1_000);
    }
  }
};

// Netlifyの公開完了を待ち、旧Astroの成果物を成功扱いしない。
for (let attempt = 0; ; attempt++) {
  try {
    const deployed = await (
      await fetchPage(`/.well-known/deployment.json?commit=${expectedCommit}`)
    ).json();
    assert.equal(deployed.commit, expectedCommit, "対象コミットの公開を待機中");
    const html = await (await fetchPage("/")).text();
    assert(html.includes(generator), `${generator}の公開を待機中`);
    break;
  } catch (error) {
    if (attempt >= 29) throw error;
    console.log(`デプロイ待機: ${error.message}`);
    await setTimeout(10_000);
  }
}

const files = await readdir("dist", { recursive: true });
const pages = files.filter((file) => file.endsWith(".html"));
const cardLinks = (html) =>
  [
    ...html.matchAll(
      /<div\b[^>]*\bremark-card\b[^>]*>[\s\S]*?<a\b[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/g,
    ),
  ]
    .map((match) => match[1] ?? match[2] ?? match[3])
    .sort();

for (const file of pages) {
  const path = `/${file}`.replace(/index\.html$/, "");
  const expected = await readFile(join("dist", file), "utf8");
  const actual = await (await fetchPage(path)).text();
  assert(actual.includes(generator), `${path}: Astroの版が一致しません`);
  assert.equal(
    actual.match(/<title>([\s\S]*?)<\/title>/)?.[1],
    expected.match(/<title>([\s\S]*?)<\/title>/)?.[1],
    `${path}: タイトルが一致しません`,
  );
  if (previous && file.startsWith("blog/")) {
    const old = await (await fetchPage(path, previous)).text();
    const before = cardLinks(old);
    const after = cardLinks(actual);
    assert.deepEqual(
      after,
      before,
      `${path}: 公開中の記事とOGPカードが異なります`,
    );
    console.log(`OGPカード ${path}: ${before.length} → ${after.length}`);
  }
}

const images = files.filter(
  (file) => file.startsWith("og/") && file.endsWith(".png"),
);
for (const file of images) {
  const data = Buffer.from(await (await fetchPage(`/${file}`)).arrayBuffer());
  assert.equal(
    data.subarray(1, 4).toString(),
    "PNG",
    `${file}: PNGではありません`,
  );
  assert.equal(data.readUInt32BE(16), 1200);
  assert.equal(data.readUInt32BE(20), 630);
}

const assets = files.filter(
  (file) =>
    file.startsWith("_astro/") && /\.(css|js|webp|png|jpg|svg)$/.test(file),
);
for (const file of assets) {
  const response = await fetchPage(`/${file}`);
  await response.body.cancel();
}
console.log(
  `公開確認成功: ${base.href} @ ${expectedCommit} / ${pages.length}ページ・OG画像${images.length}枚・アセット${assets.length}件`,
);
