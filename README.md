# ptrst102-blog

`Astro`と`TypeScript`で作成したptrst102の個人ブログです。

## 必要環境

- Node.js
- pnpm（Corepack経由）

Node.jsのバージョン管理ツールとしてVoltaを想定しています。

## セットアップと開発

リポジトリのルートで次のコマンドを実行します。

```bash
corepack enable
pnpm install
pnpm run dev
```

開発用サーバーが起動し、`http://localhost:4321`で確認できます。

## ビルドとプレビュー

```bash
pnpm run build
pnpm run preview
```

`pnpm run build`で公開用のファイルを`dist/`に生成します。生成されたファイルは`pnpm run preview`で動作確認できます。

## コードチェック

```bash
pnpm run lint
pnpm run check
pnpm run fix
pnpm run build
```

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

フロントマターの下に記事本文を`Markdown`で記述します。
