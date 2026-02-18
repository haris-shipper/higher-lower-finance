import { useState, useEffect } from "react";
import { fetchAllScores, processScores } from "./supabase.js";

const BG  = "#141413";
const C   = "#FBFBFB";
const WIN = "#2DFF72";
const ERR = "#FF2D2D";
const DIM = "rgba(251,251,251,0.35)";

const GAMES = [
  { key: "finance",     label: "HIGHER OR LOWER" },
  { key: "connections", label: "CONNECTIONS"      },
  { key: "inbox",       label: "INBOX"            },
  { key: "impostor",    label: "IMPOSTOR"         },
];

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

export default function Leaderboard({ onBack, username }) {
  const [tab,     setTab]     = useState("overall");
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  useEffect(() => {
    setLoading(true);
    fetchAllScores().then(data => { setScores(data); setLoading(false); });
  }, []);

  const { byGame, overall } = processScores(scores);

  function getRanked(tabKey) {
    if (tabKey === "overall") {
      return Object.entries(overall)
        .map(([user, score]) => ({ username: user, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }
    const gameData = byGame[tabKey] || {};
    return Object.entries(gameData)
      .map(([user, score]) => ({ username: user, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  const ranked = getRanked(tab);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes revealIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        .ltab{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;letter-spacing:0.15em;padding:8px 14px;background:transparent;border:1px solid ${C}30;color:${DIM};cursor:pointer;transition:all 0.12s;}
        .ltab:hover{border-color:${C}80;color:${C};}
        .ltab.active{background:${C};color:${BG};border-color:${C};}
      `}</style>

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
        <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-start" }}>
          {[["STOCKHOLM","Europe/Stockholm"],["DUBLIN","Europe/Dublin"],["NYC","America/New_York"]].map(([label, tz]) => (
            <span key={label}>{label} <span style={{ fontFeatureSettings:"'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4 }}>QUARTR LABS GAME STUDIO</div>
        <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
          {[
            { label:"NASDAQ", tz:"America/New_York", oh:9,  om:30, ch:16, cm:0  },
            { label:"LSE",    tz:"Europe/London",    oh:8,  om:0,  ch:16, cm:30 },
            { label:"STO",    tz:"Europe/Stockholm", oh:9,  om:0,  ch:17, cm:30 },
          ].map(({ label, tz, oh, om, ch, cm }) => {
            const open = isMktOpen(tz, oh, om, ch, cm);
            return <span key={label}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
          })}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 4, textAlign: "center" }}>─ LEADERBOARD ─</div>
          {username && (
            <div style={{ fontSize: 9, letterSpacing: 3, marginBottom: 20, textAlign: "center", color: DIM }}>
              PLAYING AS <span style={{ color: C, fontWeight: 700 }}>{username}</span>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
            <button className={`ltab${tab === "overall" ? " active" : ""}`} onClick={() => setTab("overall")}>OVERALL</button>
            {GAMES.map(g => (
              <button key={g.key} className={`ltab${tab === g.key ? " active" : ""}`} onClick={() => setTab(g.key)}>{g.label}</button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", fontSize: 9, letterSpacing: 4, color: DIM, padding: "40px 0" }}>─ LOADING ─</div>
          ) : ranked.length === 0 ? (
            <div style={{ textAlign: "center", fontSize: 9, letterSpacing: 4, color: DIM, padding: "40px 0" }}>─ NO SCORES YET ─</div>
          ) : (
            <div style={{ animation: "revealIn 0.2s ease" }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, letterSpacing: 3, color: DIM, padding: "0 0 8px", borderBottom: `1px solid ${C}20`, marginBottom: 4 }}>
                <span style={{ width: 28 }}>RNK</span>
                <span style={{ flex: 1 }}>OPERATOR</span>
                <span>SCORE</span>
              </div>

              {ranked.map((entry, i) => {
                const isMe = entry.username === username;
                const isFirst = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "9px 0",
                      borderBottom: `1px solid ${C}10`,
                      fontSize: isFirst ? 12 : 10,
                      fontWeight: isMe || isFirst ? 700 : 400,
                      color: isMe ? WIN : C,
                      animation: `revealIn 0.15s ease ${i * 0.03}s both`,
                    }}
                  >
                    <span style={{ width: 28, fontSize: 9, letterSpacing: 2, opacity: 0.5 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ flex: 1, letterSpacing: isFirst ? 3 : 1 }}>
                      {entry.username}
                      {isMe && <span style={{ fontSize: 8, letterSpacing: 2, marginLeft: 8, opacity: 0.6 }}>← YOU</span>}
                    </span>
                    <span style={{ fontFeatureSettings: "'tnum'", letterSpacing: 1 }}>
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
        <span>QUARTR LABS GAME STUDIO</span>
        <span>○ LEADERBOARD</span>
      </div>
    </div>
  );
}
