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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient red glow — top left */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            left: "-140px",
            width: "800px",
            height: "560px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239, 68, 68, 0.10) 0%, transparent 60%)",
          }}
        />
        {/* Ambient blue glow — top right */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-80px",
            width: "600px",
            height: "420px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.07) 0%, transparent 65%)",
          }}
        />
        {/* Subtle warm glow behind redicle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239, 68, 68, 0.04) 0%, transparent 60%)",
          }}
        />

        {/* Redicle assembly */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Top guide line */}
          <div
            style={{
              width: "2px",
              height: "36px",
              backgroundColor: "#dc2626",
            }}
          />

          {/* Redicle — word display window */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #3f3f46",
              borderBottom: "1px solid #3f3f46",
              width: "1000px",
              height: "170px",
            }}
          >
            {/* Before pivot */}
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  color: "#e4e4e7",
                  fontSize: 96,
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                sti
              </span>
            </div>

            {/* Pivot character */}
            <span
              style={{
                color: "#dc2626",
                fontSize: 96,
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              l
            </span>

            {/* After pivot */}
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <span
                style={{
                  color: "#e4e4e7",
                  fontSize: 96,
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                lReading
              </span>
            </div>
          </div>

          {/* Bottom guide line */}
          <div
            style={{
              width: "2px",
              height: "36px",
              backgroundColor: "#dc2626",
            }}
          />
        </div>

        {/* URL */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
          }}
        >
          <span
            style={{
              color: "#52525b",
              fontSize: 22,
              letterSpacing: "0.08em",
            }}
          >
            stillreading.xyz
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
