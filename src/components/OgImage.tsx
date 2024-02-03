import { BLOG_TITLE } from "@/config";
import satori from "satori";
import sharp from "sharp";

const fontFamily = "Noto Sans JP";

export const getOgImage = async (text: string) => {
  const fontData = await fetchFont();

  const MAX_LENGTH = 27;
  const truncatedText =
    text.length > MAX_LENGTH ? text.substring(0, MAX_LENGTH - 1) + "…" : text;

  const svg = await satori(
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        backgroundColor: "#083D77",
        padding: "24px",
        fontFamily: `"${fontFamily}", sans-serif`,
      }}
    >
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          rowGap: "24px",
          height: "100%",
          width: "100%",
          border: "2px solid #333",
          borderRadius: "8px",
          backgroundColor: "#FFF",
          padding: "24px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            fontSize: "24px",
            color: "#555",
          }}
        >
          <span>{BLOG_TITLE}</span>
        </div>
        <div
          style={{
            flexGrow: "1",
            fontSize: "48px",
            fontWeight: 700,
            color: "#333",
            alignItems: "center",
          }}
        >
          {truncatedText}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
            fontSize: "24px",
            color: "#555",
          }}
        >
          <span>https://ptrst102.com</span>
        </div>
      </section>
    </main>,
    {
      width: 800,
      height: 400,
      fonts: [
        {
          name: "Noto Sans JP",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
};

const fetchFont = async (): Promise<ArrayBuffer> => {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700`;

  const css = await (
    await fetch(API, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (!resource) {
    throw new Error("Failed to fetch font");
  }

  const res = await fetch(resource[1]);

  return res.arrayBuffer();
};
