import { SITE_TITLE } from "@/config";
import satori from "satori";
import sharp from "sharp";

const fontFamily = "Noto Sans JP";

export const getOgImage = async (text: string) => {
  const fontData = await fetchFont();

  const MAX_LENGTH = 40;
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
        backgroundColor: "#059669",
        padding: "32px",
        fontFamily: `"${fontFamily}", sans-serif`,
      }}
    >
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          rowGap: "32px",
          height: "100%",
          width: "100%",
          border: "3px solid #333",
          borderRadius: "12px",
          backgroundColor: "#FFF",
          padding: "32px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            fontSize: "32px",
            color: "#555",
          }}
        >
          <span>{SITE_TITLE}</span>
        </div>
        <div
          style={{
            flexGrow: "1",
            fontSize: "72px",
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
            fontSize: "32px",
            color: "#555",
          }}
        >
          <span>https://ptrst102.com</span>
        </div>
      </section>
    </main>,
    {
      width: 1200,
      height: 630,
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
