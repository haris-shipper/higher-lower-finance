import { useState, useEffect, useCallback } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { CARDS, CATEGORIES, SOURCES } from "./dossierData.js";

const BG = "#1F1F1F";
const C  = "#AF02FF";
const DIM = "rgba(175,2,255,0.4)";

function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

export default function Dossier({ onBack, username, topPlayer, onLeaderboard }) {
  const [phase,       setPhase]       = useState("menu");
  const [catFilter,   setCatFilter]   = useState("all");
  const [srcFilter,   setSrcFilter]   = useState("all");
  const [deck,        setDeck]        = useState([]);   // active queue
  const [flipped,     setFlipped]     = useState(false);
  const [animKey,     setAnimKey]     = useState(0);
  const [flipAnim,    setFlipAnim]    = useState(false);
  const [stats,       setStats]       = useState({ known: 0, unsure: 0, noclue: 0, reviewed: 0, noclueByCategory: {} });
  const [, setTick]   = useState(0);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  const filteredCount = CARDS.filter(c =>
    (catFilter === "all" || c.category === catFilter) &&
    (srcFilter === "all" || c.source    === srcFilter)
  ).length;

  function startSession() {
    const pool = shuf(CARDS.filter(c =>
      (catFilter === "all" || c.category === catFilter) &&
      (srcFilter === "all" || c.source    === srcFilter)
    ));
    setDeck(pool);
    setFlipped(false);
    setAnimKey(k => k + 1);
    setStats({ known: 0, unsure: 0, noclue: 0, reviewed: 0, noclueByCategory: {} });
    setPhase("playing");
  }

  function flipCard() {
    if (flipped) return;
    setFlipAnim(true);
    setTimeout(() => {
      setFlipped(true);
      setFlipAnim(false);
    }, 180);
  }

  const rate = useCallback((rating) => {
    if (!flipped) return;
    const card = deck[0];
    const rest = deck.slice(1);

    setStats(s => {
      const nbc = { ...s.noclueByCategory };
      if (rating === "noclue") nbc[card.category] = (nbc[card.category] || 0) + 1;
      return {
        known:   s.known   + (rating === "known"  ? 1 : 0),
        unsure:  s.unsure  + (rating === "unsure" ? 1 : 0),
        noclue:  s.noclue  + (rating === "noclue" ? 1 : 0),
        reviewed: s.reviewed + 1,
        noclueByCategory: nbc,
      };
    });

    let newDeck;
    if (rating === "known") {
      newDeck = rest;
    } else {
      const insertAfter = rating === "unsure"
        ? 5 + Math.floor(Math.random() * 4)   // 5-8
        : 2 + Math.floor(Math.random() * 2);  // 2-3
      const pos = Math.min(insertAfter, rest.length);
      newDeck = [...rest.slice(0, pos), card, ...rest.slice(pos)];
    }

    if (newDeck.length === 0) {
      setPhase("end");
    } else {
      setDeck(newDeck);
      setFlipped(false);
      setAnimKey(k => k + 1);
    }
  }, [flipped, deck]);

  // Top bar — shared across all phases
  function TopBar() {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
          <span onClick={onLeaderboard} style={{ cursor: "pointer", letterSpacing: 3, opacity: 0.7, transition: "opacity 0.15s", flexShrink: 0 }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7}>SEE LEADERBOARD</span>
          <span style={{ opacity: 0.25 }}>|</span>
          {[["STO","Europe/Stockholm"],["DUB","Europe/Dublin"],["NYC","America/New_York"]].map(([label, tz]) => (
            <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ fontFeatureSettings:"'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>
        <div className="topbar-ctr" style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>QUARTR LABS GAME STUDIO</div>
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
            return <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ color: open ? "#2DFF72" : "#FF2D2D", animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
          })}
        </div>
      </div>
    );
  }

  function BottomBar({ right }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
        <span>DOSSIER V1.0</span>
        <span>{right}</span>
      </div>
    );
  }

  // ── MENU ────────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div className="page-root" style={{ fontFamily:"'IBM Plex Mono',monospace", background:BG, color:C, minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:0.4}94%{opacity:1}97%{opacity:0.7}98%{opacity:1}}
          .db{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;letter-spacing:0.15em;padding:7px 12px;background:transparent;border:1px solid ${C}30;color:${DIM};cursor:pointer;transition:all 0.12s;}
          .db:hover{border-color:${C}80;color:${C};}
          .db.active{background:${C};color:${BG};border-color:${C};}
          .dstart{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.15em;padding:16px 0;width:100%;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
          .dstart:hover{background:${C};color:${BG};}
          .dstart:disabled{opacity:0.3;cursor:default;}
        `}</style>
        <TopBar />
        <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 20px", overflowY:"auto" }}>
          <div style={{ maxWidth:520, width:"100%" }}>
            <div style={{ maxWidth:360, margin:"0 auto 32px" }}>
              <PixelDisplay color={C} text="DOSSIER" shape="square" />
            </div>

            <div style={{ fontSize:9, letterSpacing:5, marginBottom:12, opacity:0.5 }}>─ FILTER BY CATEGORY ─</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:20 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} className={`db${catFilter === cat.key ? " active" : ""}`} onClick={() => setCatFilter(cat.key)}>{cat.label}</button>
              ))}
            </div>

            <div style={{ fontSize:9, letterSpacing:5, marginBottom:12, opacity:0.5 }}>─ FILTER BY SOURCE GAME ─</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:28 }}>
              {SOURCES.map(src => (
                <button key={src.key} className={`db${srcFilter === src.key ? " active" : ""}`} onClick={() => setSrcFilter(src.key)}>{src.label}</button>
              ))}
            </div>

            <div style={{ fontSize:9, letterSpacing:4, marginBottom:20, textAlign:"center", opacity:0.5 }}>
              {filteredCount === 0
                ? "─ NO CARDS MATCH ─"
                : `─ ${filteredCount} CARD${filteredCount !== 1 ? "S" : ""} SELECTED ─`}
            </div>

            <button className="dstart" disabled={filteredCount === 0} onClick={startSession}>INITIATE SESSION</button>

            <div style={{ marginTop:20, border:`1px solid ${C}20`, padding:"14px 16px" }}>
              <div style={{ fontSize:9, letterSpacing:4, marginBottom:10, opacity:0.5 }}>─ HOW IT WORKS ─</div>
              {[
                "Tap the card to reveal the answer",
                "KNEW IT → card removed from session",
                "UNSURE  → resurfaces after 5-8 cards",
                "NO CLUE → resurfaces after 2-3 cards",
                "Session ends when all cards are mastered",
              ].map((txt, i) => (
                <div key={i} style={{ fontSize:10, lineHeight:2.2, display:"flex", gap:10 }}>
                  <span style={{ opacity:0.4 }}>{String(i+1).padStart(2,"0")}</span><span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomBar right="○ SELECT DECK" />
      </div>
    );
  }

  // ── PLAYING ─────────────────────────────────────────────────────────────────
  if (phase === "playing") {
    const card = deck[0];
    const total = stats.known + deck.length;
    const masteredPct = total > 0 ? (stats.known / total) * 100 : 0;

    return (
      <div className="page-root" style={{ fontFamily:"'IBM Plex Mono',monospace", background:BG, color:C, minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes cardIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          @keyframes flipOut{from{opacity:1;transform:rotateX(0deg)}to{opacity:0;transform:rotateX(-70deg)}}
          @keyframes flipReveal{from{opacity:0;transform:rotateX(70deg)}to{opacity:1;transform:rotateX(0deg)}}
          .drate{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;letter-spacing:0.12em;padding:14px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
          .drate:hover{background:${C};color:${BG};}
          .drate:active{transform:scale(0.97);}
        `}</style>
        <TopBar />
        <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:560 }}>

            {/* Counter + progress */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, fontSize:9, letterSpacing:3 }}>
              <span style={{ opacity:0.5 }}>MASTERED <span style={{ color:C, fontWeight:700, opacity:1 }}>{stats.known}</span></span>
              <span style={{ opacity:0.5 }}>REMAINING <span style={{ color:C, fontWeight:700, opacity:1 }}>{deck.length}</span></span>
            </div>
            <div style={{ height:2, background:`${C}20`, marginBottom:20 }}>
              <div style={{ height:"100%", width:`${masteredPct}%`, background:C, transition:"width 0.4s" }} />
            </div>

            {/* Card */}
            <div
              key={animKey}
              onClick={flipCard}
              style={{
                border:`1px solid ${C}`,
                padding:"32px 24px",
                minHeight:180,
                cursor: flipped ? "default" : "pointer",
                display:"flex",
                flexDirection:"column",
                justifyContent:"center",
                alignItems:"center",
                textAlign:"center",
                marginBottom:16,
                transition:"border-color 0.15s",
                animation: flipAnim ? "flipOut 0.18s ease forwards" : `cardIn 0.2s ease`,
              }}
              onMouseEnter={e => { if (!flipped) e.currentTarget.style.borderColor = `${C}80`; }}
              onMouseLeave={e => { if (!flipped) e.currentTarget.style.borderColor = C; }}
            >
              {/* Category tag */}
              <div style={{ fontSize:8, letterSpacing:4, opacity:0.4, marginBottom:16 }}>
                {card.category.toUpperCase()} · {card.source.toUpperCase()}
              </div>

              {!flipped ? (
                <div style={{ animation:"cardIn 0.2s ease" }}>
                  <div style={{ fontSize:14, lineHeight:1.9, letterSpacing:0.3, fontWeight:500 }}>{card.front}</div>
                  <div style={{ fontSize:8, letterSpacing:3, marginTop:20, opacity:0.35 }}>TAP TO REVEAL</div>
                </div>
              ) : (
                <div style={{ animation:"flipReveal 0.2s ease" }}>
                  <div style={{ fontSize:13, lineHeight:1.9, letterSpacing:0.3 }}>{card.back}</div>
                </div>
              )}
            </div>

            {/* Rating buttons — only after flip */}
            {flipped ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
                <button className="drate" onClick={() => rate("noclue")} style={{ borderColor:"#FF2D2D", color:"#FF2D2D" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#FF2D2D"; e.currentTarget.style.color=BG; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#FF2D2D"; }}>
                  NO CLUE
                </button>
                <button className="drate" onClick={() => rate("unsure")} style={{ borderColor:`${C}80`, color:`${C}80` }}
                  onMouseEnter={e => { e.currentTarget.style.background=C; e.currentTarget.style.color=BG; e.currentTarget.style.borderColor=C; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=`${C}80`; e.currentTarget.style.borderColor=`${C}80`; }}>
                  UNSURE
                </button>
                <button className="drate" onClick={() => rate("known")} style={{ borderColor:"#2DFF72", color:"#2DFF72" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#2DFF72"; e.currentTarget.style.color=BG; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#2DFF72"; }}>
                  KNEW IT
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, opacity:0.2, pointerEvents:"none" }}>
                <div style={{ border:`1px solid ${C}`, padding:"14px 0", textAlign:"center", fontSize:10, letterSpacing:2 }}>NO CLUE</div>
                <div style={{ border:`1px solid ${C}`, padding:"14px 0", textAlign:"center", fontSize:10, letterSpacing:2 }}>UNSURE</div>
                <div style={{ border:`1px solid ${C}`, padding:"14px 0", textAlign:"center", fontSize:10, letterSpacing:2 }}>KNEW IT</div>
              </div>
            )}

          </div>
        </div>
        <BottomBar right="● STUDYING" />
      </div>
    );
  }

  // ── END ─────────────────────────────────────────────────────────────────────
  if (phase === "end") {
    const total = stats.reviewed;
    const pct   = total > 0 ? Math.round((stats.known / total) * 100) : 0;
    const weakCategories = Object.entries(stats.noclueByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return (
      <div className="page-root" style={{ fontFamily:"'IBM Plex Mono',monospace", background:BG, color:C, minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes revealIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
          .dend{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;letter-spacing:0.15em;padding:14px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
          .dend:hover{background:${C};color:${BG};}
        `}</style>
        <TopBar />
        <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"28px 16px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:520, animation:"revealIn 0.2s ease" }}>

            <div style={{ fontSize:10, letterSpacing:6, marginBottom:20, textAlign:"center" }}>─ SESSION COMPLETE ─</div>

            {/* Big score */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:64, fontWeight:700, letterSpacing:4, fontFeatureSettings:"'tnum'" }}>{pct}%</div>
              <div style={{ fontSize:9, letterSpacing:5, opacity:0.5 }}>MASTERY RATE · {total} CARDS REVIEWED</div>
            </div>

            {/* Breakdown */}
            <div style={{ border:`1px solid ${C}20`, marginBottom:20 }}>
              {[
                { label:"KNEW IT",  value:stats.known,  color:"#2DFF72" },
                { label:"UNSURE",   value:stats.unsure, color:C         },
                { label:"NO CLUE",  value:stats.noclue, color:"#FF2D2D" },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom:`1px solid ${C}10` }}>
                  <span style={{ fontSize:9, letterSpacing:3, color:row.color }}>{row.label}</span>
                  <span style={{ fontWeight:700, fontSize:16, color:row.color, fontFeatureSettings:"'tnum'" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Weak spots */}
            {weakCategories.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:9, letterSpacing:4, marginBottom:10, opacity:0.5 }}>─ FOCUS AREAS (MOST NO CLUE HITS) ─</div>
                {weakCategories.map(([cat, count]) => (
                  <div key={cat} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C}10`, fontSize:10, letterSpacing:2 }}>
                    <span style={{ opacity:0.7 }}>{cat.toUpperCase()}</span>
                    <span style={{ fontFeatureSettings:"'tnum'", opacity:0.9 }}>{count} miss{count !== 1 ? "es" : ""}</span>
                  </div>
                ))}
              </div>
            )}

            {pct < 100 && (
              <div style={{ fontSize:10, lineHeight:1.9, marginBottom:20, padding:"12px 14px", border:`1px solid ${C}20`, opacity:0.7 }}>
                {pct >= 80
                  ? "Strong session. Review the weak categories before your next call."
                  : pct >= 50
                  ? "Solid progress. Repeat this deck until all cards reach KNEW IT."
                  : "Keep going — repetition is the only way. Run the session again."
                }
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              <button className="dend" onClick={startSession}>RUN AGAIN</button>
              <button className="dend" onClick={() => setPhase("menu")}>CHANGE DECK</button>
            </div>
          </div>
        </div>
        <BottomBar right="○ DEBRIEF" />
      </div>
    );
  }

  return null;
}
