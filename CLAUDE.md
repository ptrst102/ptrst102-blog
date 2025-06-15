# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

個人ブログサイト - Astro v5.9.3とTypeScriptで構築された静的サイトジェネレータベースのブログ。

## 開発コマンド

```bash
# 開発サーバー起動（http://localhost:4321）
pnpm run dev

# 型チェック＋本番ビルド
pnpm run build

# ビルド結果のプレビュー
pnpm run preview

# コード品質チェック（必ず実行）
pnpm run lint

# 自動修正
pnpm run fix
```

## アーキテクチャ

### モノレポ構成

- メインブログ: ルートディレクトリ
- ツール: `tools/remark-ogp-card/` - URLからOGPカードを生成するカスタムremarkプラグイン

### 主要ディレクトリ

- `src/content/blog/`: ブログ記事（Markdown）- YYYY-MM-DD形式のディレクトリ内にindex.md
- `src/pages/`: Astroページ - ファイルベースルーティング
- `src/components/`: コンポーネント - .astro（Astro）と.tsx（React）を使い分け
- `src/lib/`: 共有ライブラリ（Markdownパーサー、コンテンツユーティリティ）
- `src/utils/`: ヘルパー関数

### 技術スタック

- **フレームワーク**: Astro（SSG）
- **UI**: React v19 + TailwindCSS v4 + DaisyUI v5
- **型システム**: TypeScript（strict mode、パスエイリアス`@/*`）
- **リンター**: Biome（コード）+ Prettier（フォーマット）+ textlint（日本語記事）
- **デプロイ**: Netlify

### 特徴的な機能

1. **OGP画像の動的生成**: `src/components/OgImage.tsx`でSatoriを使用して記事ごとのOG画像を生成
2. **OGPカード自動生成**: Markdown内のURLを自動でOGPカードに変換（`tools/remark-ogp-card/`）
3. **日本語記事の品質管理**: textlintで日本語の文章品質をチェック

## コーディング規約

### TypeScript

- `any`禁止 - 必要時は`unknown`で型絞り込み
- 関数定義は`const fn = () => {}`形式
- 変数は`const`優先、再代入必要時のみ`let`
- インポートは`@/`エイリアス使用

### Astro

- ページ: `src/pages/`
- コンポーネント: `src/components/`（.astro/.tsx）
- コンテンツ取得: `getCollection()`等のユーティリティ活用

### 日本語記述

- 半角/全角間の空白なし
- 英単語・コードはバッククォート
- 簡潔で一貫性のある文体

## 記事の追加方法

1. `src/content/blog/YYYY-MM-DD/`ディレクトリ作成
2. `index.md`を配置
3. フロントマター記述:

```yaml
---
title: 記事タイトル
publishDate: YYYY-MM-DD
updateDate: YYYY-MM-DD # 任意
tags: ["タグ"]
---
```

## 注意事項

- 変更後は必ず`pnpm run lint`を実行
- エラーがある場合は`pnpm run fix`で自動修正
- 日本語で返信・コメント記述
- 既存のコード規約・スタイルに従う
