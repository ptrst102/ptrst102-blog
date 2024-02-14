import ogs from "open-graph-scraper";
import { visit } from "unist-util-visit";

const ogpCardPlugin = () => {
  return async (tree) => {
    const transformers = [];
    visit(tree, "paragraph", (paragraphNode, index) => {
      if (paragraphNode.children.length !== 1) {
        return tree;
      }

      if (paragraphNode && paragraphNode.data !== undefined) {
        return tree;
      }

      visit(paragraphNode, "text", (textNode) => {
        const urls = textNode.value.match(
          /(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g,
        );

        if (!urls || urls.length !== 1) {
          return;
        }

        const url = urls[0];
        transformers.push(async () => {
          const { result } = await ogs({ url });

          const cardNode = {
            type: "html",
            value: createCard(url, extractDomain(url), result),
          };

          tree.children.splice(index, 1, cardNode);
        });
      });
    });

    try {
      await Promise.all(transformers.map((t) => t()));
    } catch (error) {
      console.error(`remark-ogp-card: ${error}`);
    }

    return tree;
  };
};

export default ogpCardPlugin;

const createCard = (url, domain, result) => {
  return `
<div class="not-prose remark-card">
  <a
    href="${url}"
    target="_blank"
    rel="noopener noreferrer"
  >
    <p class="title">${result.ogTitle}</p>
    <p class="description">${result.ogDescription}</p>
    <div class="site">
      <img
        src="https://s2.googleusercontent.com/s2/favicons?domain=${domain}"
        alt="favicon"
        class="favicon"
      />
      <p class="domain">${domain}</p>
    </div>
  </a>
</div>
`;
};

const extractDomain = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return "";
  }
};
