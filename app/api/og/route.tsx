import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "2px", height: "24px", backgroundColor: "#dc2626", opacity: 0.6 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #222228",
              borderBottom: "1px solid #222228",
              width: "900px",
              height: "160px",
            }}
          >
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <span style={{ color: "#e4e4e7", fontSize: 72, fontWeight: 500, letterSpacing: "0.03em" }}>sti</span>
            </div>
            <span style={{ color: "#dc2626", fontSize: 72, fontWeight: 700, letterSpacing: "0.03em" }}>l</span>
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
              <span style={{ color: "#e4e4e7", fontSize: 72, fontWeight: 500, letterSpacing: "0.03em" }}>lReading</span>
            </div>
          </div>
          <div style={{ width: "2px", height: "24px", backgroundColor: "#dc2626", opacity: 0.6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 48, gap: 16 }}>
          <span style={{ color: "#52525b", fontSize: 28 }}>Speed read anything. Word by word.</span>
          <div style={{ display: "flex", gap: 32, color: "#3f3f46", fontSize: 20 }}>
            <span>1. Paste markdown</span>
            <span style={{ color: "#222228" }}>|</span>
            <span>2. Hit play</span>
            <span style={{ color: "#222228" }}>|</span>
            <span>3. Read faster</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
