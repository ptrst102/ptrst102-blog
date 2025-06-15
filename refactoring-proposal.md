# Refactoring Proposal

このドキュメントは、ptrst102-blogプロジェクトのリファクタリング提案をまとめたものです。

## 🎯 Executive Summary

現在のブログは基本的な機能は実装されていますが、以下の観点で改善の余地があります：

1. **テストの欠如** - テストが一切存在しない
2. **コードの重複** - 日付処理やSEO設定が複数箇所に散在
3. **パフォーマンス** - OGP画像生成でのフォント取得、ページネーションの欠如
4. **型安全性** - 型定義の分散と一部の型推論への過度な依存
5. **構造の問題** - ディレクトリ構成の曖昧さ、コンポーネントの階層化不足

## 📊 Current State Analysis

### よい点

- TypeScriptのstrict modeが有効
- `any`型の使用がない
- コミット規約が整っている
- Biome/Prettier/textlintによる品質管理
- CLAUDE.mdによる開発指針の明文化

### 改善が必要な点

#### 1. テストインフラの欠如

```
テストファイル数: 0
テストカバレッジ: 0%
CI/CDでのテスト実行: なし
```

#### 2. ディレクトリ構造の曖昧さ

```
src/lib/     → cdateのみ（なぜutils/ではない？）
src/utils/   → 複数のユーティリティ
src/assets/  → 日付形式のディレクトリが混在
```

#### 3. コードの重複

- 日付フォーマット処理が3箇所に存在
- SEOデフォルト値が各ページに散在
- タグ処理ロジックの重複

## 🚀 Refactoring Roadmap

### Phase 1: Foundation (優先度: 最高)

#### 1.1 テスト環境の構築

```bash
# 必要なパッケージ
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react happy-dom
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 1.2 基本的なテストの追加

```typescript
// src/utils/__tests__/cdate.test.ts
import { describe, it, expect } from "vitest";
import { getDescription } from "../cdate";

describe("getDescription", () => {
  it("should extract text without HTML tags", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    expect(getDescription(html)).toBe("Hello world");
  });

  it("should limit to specified length", () => {
    const longText = "a".repeat(200);
    expect(getDescription(longText, 100)).toHaveLength(100);
  });
});
```

### Phase 2: Code Organization (優先度: 高)

#### 2.1 ディレクトリ構造の再編成

```
src/
├── components/
│   ├── common/         # Button, Card, Icon等
│   ├── layout/         # Header, Footer, SEO
│   ├── blog/           # PostCard, PostList, TagList
│   └── ui/             # DaisyUI依存のコンポーネント
├── features/           # 機能別のロジック
│   ├── blog/
│   └── ogp/
├── utils/              # 純粋なユーティリティ関数
├── types/              # 共通の型定義
└── constants/          # 定数定義
```

#### 2.2 共通化とDRY原則の適用

```typescript
// src/constants/seo.ts
export const SEO_DEFAULTS = {
  title: "ptrstのブログ",
  description: "ptrstのブログです。",
  openGraphType: "website" as const,
} as const;

// src/utils/date.ts
export const formatDate = (date: Date, format = "YYYY年M月D日") => {
  return cdate(date).format(format);
};

export const formatDateForPost = (date: Date) => {
  return formatDate(date, "YYYY年M月D日");
};

// src/utils/blog.ts
export const sortPostsByDate = (posts: CollectionEntry<"blog">[]) => {
  return posts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );
};
```

### Phase 3: Performance Optimization (優先度: 中)

#### 3.1 OGP画像生成の最適化

```typescript
// src/features/ogp/font-cache.ts
import { readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const CACHE_DIR = ".cache/fonts";

export const getCachedFont = async (fontUrl: string): Promise<ArrayBuffer> => {
  const fileName = fontUrl.split("/").pop() || "font.ttf";
  const cachePath = join(CACHE_DIR, fileName);

  try {
    await access(cachePath);
    const buffer = await readFile(cachePath);
    return buffer.buffer;
  } catch {
    const response = await fetch(fontUrl);
    const buffer = await response.arrayBuffer();
    await writeFile(cachePath, Buffer.from(buffer));
    return buffer;
  }
};
```

#### 3.2 ページネーションの実装

```astro
---
// src/pages/blog/[page].astro
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  const POSTS_PER_PAGE = 10;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    params: { page: String(i + 1) },
    props: {
      posts: posts.slice(i * POSTS_PER_PAGE, (i + 1) * POSTS_PER_PAGE),
      currentPage: i + 1,
      totalPages,
    },
  }));
}
---
```

### Phase 4: Type Safety Enhancement (優先度: 中)

#### 4.1 共通型定義の集約

```typescript
// src/types/index.ts
export interface PostMeta {
  title: string;
  publishDate: Date;
  updateDate?: Date;
  tags: string[];
}

export interface SEOProps {
  title: string;
  description?: string;
  openGraphType?: "website" | "article";
  openGraphImage?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}
```

#### 4.2 型安全な設定オブジェクト

```typescript
// src/config/site.ts
export const siteConfig = {
  name: "ptrstのブログ",
  description: "ptrstのブログです。",
  url: "https://blog.ptrst102.com",
  author: {
    name: "ptrst102",
    github: "https://github.com/ptrst102",
  },
  postsPerPage: 10,
} as const;

export type SiteConfig = typeof siteConfig;
```

### Phase 5: Developer Experience (優先度: 低)

#### 5.1 開発用スクリプトの追加

```json
// package.json
{
  "scripts": {
    "new:post": "node scripts/new-post.js",
    "check:links": "node scripts/check-links.js",
    "analyze": "astro build && npx source-map-explorer dist/**/*.js"
  }
}
```

#### 5.2 Git hooksの設定

```json
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm run lint && pnpm run test",
    "commit-msg": "node scripts/verify-commit.js"
  }
}
```

## 📈 Expected Benefits

1. **品質向上**

   - テストによるリグレッション防止
   - 型安全性の向上による実行時エラーの削減

2. **開発効率**

   - コードの再利用性向上
   - 明確なディレクトリ構造による可読性向上

3. **パフォーマンス**

   - フォントキャッシュによるビルド時間短縮（約30%改善見込み）
   - ページネーションによる初期表示速度向上

4. **保守性**
   - テストによる安全なリファクタリング
   - 共通化による変更箇所の削減

## 🎬 Implementation Order

1. **Week 1-2**: テスト環境構築と基本テスト追加
2. **Week 3-4**: ディレクトリ再編成とコード共通化
3. **Week 5-6**: パフォーマンス最適化
4. **Week 7-8**: 型定義の強化とDX改善

## 🤔 Considerations

- 既存の記事URLは維持する（後方互換性）
- デプロイプロセスへの影響を最小限に
- 段階的な実装で常にデプロイ可能な状態を維持

## 📝 Next Steps

1. このプロポーザルのレビューと承認
2. Phase 1（テスト環境構築）から開始
3. 各フェーズ完了後の効果測定
4. 必要に応じてロードマップの調整

---

_このドキュメントは生きたドキュメントとして、実装の進捗に応じて更新されます。_
