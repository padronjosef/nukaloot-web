import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Game Price Finder";
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
          viewBox="-33 0 255 255"
          fill="white"
        >
          <path d="M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z" />
        </svg>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
          }}
        >
          Game Price Finder
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
