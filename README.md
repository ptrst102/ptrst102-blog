# ptrst102-blog

このブログはptrst102の個人ブログです。
AstroとTypeScriptで構築された個人ブログのソースコードです。

## 必要環境

- Node.js22系（`package.json`の`volta.node`参照）
- pnpm
- Volta

Node.jsとpnpmはVoltaでインストールすることを推奨します。Voltaを使うと想定バージョンのNode.jsが自動適用されます。

## セットアップと開発

```bash
pnpm i
pnpm run dev
```

開発用サーバーが起動し、`http://localhost:4321`で確認できます。

## ビルドとプレビュー

```bash
pnpm run build
pnpm run preview
```

`build`で静的ファイルを生成し、`preview`で生成物をローカル確認できます。

## コードチェック

- `pnpm run lint`でBiome、Prettier、textlintによる検証
- `pnpm run fix`で自動整形

## ディレクトリ概要

- `src/content/blog/`: Markdown形式の記事
- `src/pages/`: ページ定義
- `src/components/`: 共有コンポーネント
- `tools/remark-ogp-card/`: URLからOGPカードを生成する remarkプラグイン
- `src/components/OgImage.tsx`: 記事のOG画像生成処理

Netlify用のキャッシュ設定は`netlify.toml`、TailwindCSSの設定は
`src/styles/tailwind.config.mjs`を参照してください。

## 新しい記事の追加

`src/content/blog/`に`YYYY-MM-DD`形式のディレクトリを作り、その中に`index.md`を配置します。フロントマターには次の項目を記述します。

```md
---
title: 記事タイトル
publishDate: YYYY-MM-DD
updateDate: YYYY-MM-DD # 任意
tags: ["タグ"]
---
```

本文はこの下にMarkdownで書きます。

