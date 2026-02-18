import { useState, useEffect } from "react";
import PixelDisplay from "./PixelDisplay.jsx";

const BG = "#141413";
const C = "#FF972D";
const ERR = "#FF2D2D";

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

export default function Landing({ onPlay }) {
  const [hovered, setHovered] = useState(false);
  // tick forces re-render every second so clocks and market status stay live
  const [, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
      `}</style>

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
        <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-start" }}>
          {[["STOCKHOLM", "Europe/Stockholm"], ["DUBLIN", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
            <span key={label}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4 }}>A QUARTR LABS GAME</div>
        <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
          {[
            { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
            { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
            { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
          ].map(({ label, tz, oh, om, ch, cm }) => {
            const open = isMktOpen(tz, oh, om, ch, cm);
            return (
              <span key={label}>{label} <span style={{ color: open ? "#2DFF72" : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>
            );
          })}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div
          style={{ maxWidth: 560, width: "100%", cursor: "pointer" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onPlay("finance")}
        >
          <PixelDisplay color={C} isHovered={hovered} />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span>QUARTR</span>
        <span>HIGHER/LOWER V1.0</span>
        <span>○ SELECT GAME</span>
      </div>
    </div>
  );
}
