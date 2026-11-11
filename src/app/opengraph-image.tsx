import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "CyberAFX — Premium Forex & Gold Trading Signals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: `radial-gradient(circle at 20% 0%, #25307a 0%, ${SITE.themeColor} 60%)`, color: "#f5f7ff" }}>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 8, color: SITE.brandColor, fontWeight: 700 }}>TRADE TO ELEVATE</div>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 900, letterSpacing: -4, marginTop: 20 }}>
          CYBER<span style={{ color: SITE.brandColor }}>AFX</span>
        </div>
        <div style={{ display: "flex", fontSize: 44, marginTop: 10, color: "#c9d0f0" }}>Premium Forex &amp; Gold Trading Signals</div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 40, color: "#8b93bd" }}>VIP Membership · Mentorship · AI Chart Analysis · Copy Trading</div>
      </div>
    ),
    size,
  );
}
