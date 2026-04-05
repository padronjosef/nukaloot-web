import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nuka Loot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OgImage = () => {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          gap: 24,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 12h0.01"/>
          <path d="M7.5 4.2c-.3-.5-.9-.7-1.3-.4C3.9 5.5 2.3 8.1 2 11c0 .5.4 1 1 1h5c0-1.5.8-2.8 2-3.4-1.1-.8-1.8-2.2-1.5-3.5.1-.3 0-.7-.2-.9z"/>
          <path d="M21 12c.6 0 1-.4 1-1-.3-2.9-1.8-5.5-4.1-7.1-.4-.3-1.1-.2-1.3.3-.6 1.3-.5 2.7.2 3.8.2.2.2.6.1.9A4 4 0 0 0 15 12z"/>
          <path d="M7.5 19.8c-.3.5-.1 1.1.4 1.3 1.2.6 2.5.9 4.1.9 1.6 0 2.9-.3 4.1-.9.5-.2.7-.8.4-1.3-.7-1.1-2-1.8-3.3-1.8h-2.4c-1.3 0-2.5.7-3.3 1.8z"/>
        </svg>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
          }}
        >
          Nuka Loot
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          Find the cheapest price across multiple stores
        </div>
      </div>
    ),
    { ...size },
  );
};

export default OgImage;
