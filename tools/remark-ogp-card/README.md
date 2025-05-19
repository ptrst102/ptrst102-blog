# remark-ogp-card

## 概要

このREADMEでは、Markdown上の段落に単一のURLだけが含まれている場合、そのURLからOGP情報を取得しカード形式のHTMLに変換するremarkプラグイン`remark-ogp-card`について説明します。Astroプロジェクトの`remarkPlugins`に組み込むことで、OGPカードを自動生成できます。

## 使い方

1. プラグインをインポートします。
   ```js
   import ogpCardPlugin from "./tools/remark-ogp-card";
   ```
2. `astro.config.mjs`などでremarkプラグインとして登録します。
   ```js
   export default defineConfig({
     markdown: {
       remarkPlugins: ["remark-gfm", ogpCardPlugin],
     },
   });
   ```

Markdown内で単一URLの段落が見つかると、以下のようなカードが生成されます。

```html
<div class="not-prose remark-card">
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">
    <p class="title">Example Title</p>
    <div class="site">
      <img src="https://s2.googleusercontent.com/s2/favicons?domain=example.com" alt="favicon" class="favicon" />
      <p class="domain">example.com</p>
    </div>
  </a>
</div>
```

## 今後の課題

このプラグインはバグ発生率を下げるため本来はTypeScriptで書くべきですが、コードが非常に簡単であることと、Astroのビルド時にTypeScriptをコンパイルする方法がまだ分からなかったため、現状はJavaScriptで実装しています。将来的にはTypeScript化を検討しています。
