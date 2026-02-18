import { useState, useEffect } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { fetchAllScores, topOverallPlayer } from "./supabase.js";

const BG  = "#141413";
const C   = "#FBFBFB";
const ERR = "#FF2D2D";
const WIN = "#2DFF72";

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

export default function Landing({ onPlay, username }) {
  const [hovered,   setHovered]   = useState(null);
  const [topPlayer, setTopPlayer] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  useEffect(() => {
    fetchAllScores().then(scores => setTopPlayer(topOverallPlayer(scores)));
  }, []);

  return (
    <div className="page-root" style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
      `}</style>

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>

        {/* LEFT: leaderboard link + clocks */}
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
          <span
            onClick={() => onPlay("leaderboard")}
            style={{ cursor: "pointer", letterSpacing: 3, opacity: 0.7, transition: "opacity 0.15s", flexShrink: 0 }}
            onMouseEnter={e => e.target.style.opacity = 1}
            onMouseLeave={e => e.target.style.opacity = 0.7}
          >
            SEE LEADERBOARD
          </span>
          <span style={{ opacity: 0.25 }}>|</span>
          {[["STO","Europe/Stockholm"],["DUB","Europe/Dublin"],["NYC","America/New_York"]].map(([label, tz]) => (
            <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ fontFeatureSettings:"'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>

        {/* CENTER */}
        <div className="topbar-ctr" style={{ fontSize: 10, letterSpacing: 4, flexShrink: 0, padding: "0 20px" }}>QUARTR LABS GAME STUDIO</div>

        {/* RIGHT: #1 player + market status */}
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
          {topPlayer && (
            <>
              <span style={{ whiteSpace: "nowrap", opacity: 0.7 }}>№1 <span style={{ fontWeight: 700, opacity: 1 }}>{topPlayer}</span></span>
              <span style={{ opacity: 0.25 }}>|</span>
            </>
          )}
          {[
            { label:"NASDAQ", tz:"America/New_York", oh:9,  om:30, ch:16, cm:0  },
            { label:"LSE",    tz:"Europe/London",    oh:8,  om:0,  ch:16, cm:30 },
            { label:"STO",    tz:"Europe/Stockholm", oh:9,  om:0,  ch:17, cm:30 },
          ].map(({ label, tz, oh, om, ch, cm }) => {
            const open = isMktOpen(tz, oh, om, ch, cm);
            return (
              <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>
            );
          })}
        </div>
      </div>

      {/* MAIN — stacked logos */}
      <div className="land-main scroll-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48, padding: "40px 20px" }}>

        {/* maxWidth = viewBoxWidth × (520/459) so every logo renders at the same pixel height */}
        <div className="logo-hl" style={{ maxWidth: 520, width: "100%", cursor: "pointer", margin: "0 auto" }} onMouseEnter={() => setHovered("finance")} onMouseLeave={() => setHovered(null)} onClick={() => onPlay("finance")}>
          <PixelDisplay color="#FF972D" isHovered={hovered === "finance"} text="HIGHER OR LOWER?" shape="square" />
        </div>

        <div className="logo-cn" style={{ maxWidth: 355, width: "100%", cursor: "pointer", margin: "0 auto" }} onMouseEnter={() => setHovered("connections")} onMouseLeave={() => setHovered(null)} onClick={() => onPlay("connections")}>
          <PixelDisplay color="#2DDEA0" isHovered={hovered === "connections"} text="CONNECTIONS" shape="dot" />
        </div>

        <div className="logo-ib" style={{ maxWidth: 159, width: "100%", cursor: "pointer", margin: "0 auto" }} onMouseEnter={() => setHovered("inbox")} onMouseLeave={() => setHovered(null)} onClick={() => onPlay("inbox")}>
          <PixelDisplay color="#EC49D3" isHovered={hovered === "inbox"} text="INBOX" shape="triangle" />
        </div>

        <div className="logo-im" style={{ maxWidth: 257, width: "100%", cursor: "pointer", margin: "0 auto" }} onMouseEnter={() => setHovered("impostor")} onMouseLeave={() => setHovered(null)} onClick={() => onPlay("impostor")}>
          <PixelDisplay color="#48D7FF" isHovered={hovered === "impostor"} text="IMPOSTOR" shape="decagon" />
        </div>

        <div className="logo-ds" style={{ maxWidth: 224, width: "100%", cursor: "pointer", margin: "0 auto" }} onMouseEnter={() => setHovered("dossier")} onMouseLeave={() => setHovered(null)} onClick={() => onPlay("dossier")}>
          <PixelDisplay color="#BC34FB" isHovered={hovered === "dossier"} text="DOSSIER" shape="square" />
        </div>

        <div className="logo-fc" style={{ maxWidth: 159, width: "100%", cursor: "pointer", margin: "0 auto" }} onMouseEnter={() => setHovered("faces")} onMouseLeave={() => setHovered(null)} onClick={() => onPlay("faces")}>
          <PixelDisplay color="#FF2C2F" isHovered={hovered === "faces"} text="FACES" shape="square" />
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span>{username ? `OPERATOR: ${username}` : "QUARTR"}</span>
        <span>QUARTR LABS GAME STUDIO</span>
        <span>○ SELECT GAME</span>
      </div>
    </div>
  );
}
