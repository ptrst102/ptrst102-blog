# ptrst102-blog

このブログはptrst102の個人ブログです。
AstroとTypeScriptで構築された個人ブログのソースコードです。

## 必要環境

- Node.js24系（`package.json`の`volta.node`参照）
- pnpm12.11.2（`package.json`の`packageManager`参照）
- Volta（任意）

Node.jsは`.node-version`と`volta.node`に固定しています。pnpmを準備する前に、標準のNode.jsだけで公開日時を検証します。

## セットアップと開発

```bash
node tools/dependency-policy.mjs
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

開発用サーバーが起動し、`http://localhost:4321`で確認できます。

## ビルドとプレビュー

```bash
pnpm run build
pnpm run preview
```

`build`で型チェック後に静的ファイルを生成し、`preview`で生成物をローカル確認できます。

## コードチェック

- `pnpm run lint`でBiome、Prettierによる検証
- `pnpm run check`でAstroとTypeScriptの型検査
- `pnpm test`で公開日時の検証と、ローカルレジストリを使ったインストール拒否テスト
- `pnpm run fix`で自動整形（記事を変更しない作業では対象ファイルを限定する）

`pnpm-lock.yaml`はpnpmの標準生成形式で管理し、Prettierの対象から除外します。通常のインストールやRenovateのロック再生成後も、手動で整形する必要はありません。ロックの整合性と公開後24時間の制限は、CIとNetlifyの`pnpm install --frozen-lockfile`で引き続き検証します。

## ディレクトリ概要

- `src/content/blog/`: Markdown形式の記事
- `src/pages/`: ページ定義
- `src/components/`: 共有コンポーネント
- `tools/remark-ogp-card/`: URLからOGPカードを生成する remarkプラグイン
- `src/components/OgImage.tsx`: 記事のOG画像生成処理

Netlify用のビルド・キャッシュ設定は`netlify.toml`、TailwindCSSの設定は
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

## 依存関係の更新

`pnpm-workspace.yaml`の`minimumReleaseAge: 1440`と`minimumReleaseAgeStrict: true`により、直接・推移依存とも公開後24時間未満のバージョンを拒否します。公開日時がない場合も許可せず、`trustLockfile: false`で既存ロックからのインストールも検証します。除外設定は設けていません。更新できない場合は公開後24時間が経過するまで待ちます。

```bash
node tools/dependency-policy.mjs
pnpm update -r --no-save
pnpm run lint
pnpm test
pnpm run build
pnpm audit
```

直接依存のメジャー更新は互換性を確認して`package.json`を変更し、`pnpm install`でロックを更新します。TypeScriptは`@astrojs/check`の対応範囲である6系を維持します。

Renovateにも1日の待機を設定し、セキュリティ更新にも同じ制限を適用します。ロックの定期更新で推移依存を更新します。CIはpnpm本体とその実行ファイルの公開日時を先に検証し、固定ロックでインストールしてlint・テスト・ビルドを実行します。

Netlifyは依存定義のない`.netlify-build`を起点にし、自動インストールより前に同じ公開日時検証を行います。その後リポジトリルートでpnpmのインストール検証と各チェックを実行し、`dist`を公開します。
