import { useState, useEffect, useRef } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { PEOPLE } from "./facesData.js";
import { submitScore } from "./supabase.js";

const BG  = "#1F1F1F";
const C   = "#FF2C2F";
const WIN = "#2DFF72";

const TIERS = [
  { min: 0,  color: C,         label: "" },
  { min: 3,  color: "#D1FF2D", label: "STREAK" },
  { min: 5,  color: "#2DFBFF", label: "HOT" },
  { min: 8,  color: "#2D70FF", label: "ON FIRE" },
  { min: 10, color: "#D82DFF", label: "LEGENDARY" },
  { min: 13, color: "#FF2D50", label: "GODMODE" },
];
function getTier(s) { let t = TIERS[0]; for (const c of TIERS) if (s >= c.min) t = c; return t; }
function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function getMaxTier(streak) {
  if (streak < 5)  return 1;
  if (streak < 10) return 2;
  if (streak < 15) return 3;
  if (streak < 20) return 4;
  if (streak < 25) return 5;
  return 6;
}

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

// Module-level image cache — persists across re-renders and game sessions
const IMG_CACHE = {};
async function fetchWikiImage(wiki) {
  if (wiki in IMG_CACHE) return IMG_CACHE[wiki];
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki.replace(/_/g, " "))}`);
    if (!r.ok) { IMG_CACHE[wiki] = null; return null; }
    const d = await r.json();
    // Bump Wikipedia thumbnail resolution from default 320px → 480px
    const src = d.thumbnail?.source?.replace(/\/\d+px-/, "/480px-") || null;
    IMG_CACHE[wiki] = src;
    return src;
  } catch { IMG_CACHE[wiki] = null; return null; }
}

function pickCard(streak, usedIds) {
  const maxTier = getMaxTier(streak);
  const usedSet = new Set(usedIds);
  let pool = PEOPLE.filter(p => p.tier <= maxTier && !usedSet.has(p.id));
  if (pool.length === 0) pool = PEOPLE.filter(p => p.tier <= maxTier);
  const person = pool[Math.floor(Math.random() * pool.length)];

  // Wrong options: plausible people from ±1 tier
  let wrongPool = shuf(PEOPLE.filter(p => p.id !== person.id && Math.abs(p.tier - person.tier) <= 1));
  if (wrongPool.length < 3) wrongPool = shuf(PEOPLE.filter(p => p.id !== person.id));
  const wrongs = wrongPool.slice(0, 3);
  return { person, options: shuf([person, ...wrongs]) };
}

const SHARED_CSS = (ac) => `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes fadeUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}
  @keyframes stampIn{0%{opacity:0;transform:translate(-50%,-50%) scale(5)}30%{opacity:1;transform:translate(-50%,-50%) scale(0.95)}100%{transform:translate(-50%,-50%) scale(1)}}
  @keyframes stampOut{from{opacity:1}to{opacity:0;transform:translate(-50%,-50%) scale(0.85) translateY(-10px)}}
  @keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes revealIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
  @keyframes imgPulse{0%,100%{opacity:0.3}50%{opacity:0.6}}
  .fb{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;letter-spacing:0.1em;padding:18px 8px;background:transparent;color:${C};border:1px solid ${C}40;cursor:pointer;transition:border-color 0.12s,background 0.12s,color 0.12s;width:100%;text-align:center;line-height:1.35;}
  .fb:hover{border-color:${C};background:${C}10;}
  .fb.correct{border-color:${WIN}!important;color:${WIN}!important;background:${WIN}10!important;}
  .fb.wrong{border-color:${C}!important;color:${C}!important;background:${C}15!important;}
  .fb.dim{border-color:${C}15!important;color:${C}30!important;}
  .xb{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.12em;padding:14px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;width:100%;}
  .xb:hover{background:${C};color:${BG};}
  .xb:active{transform:scale(0.97);}
`;

// ── Small face image component ──────────────────────────────────────────────
function FaceImg({ wiki, size = 280, animate = false, accent }) {
  const [url, setUrl]   = useState(IMG_CACHE[wiki] ?? undefined);
  const [loading, setLoading] = useState(!(wiki in IMG_CACHE));

  useEffect(() => {
    if (wiki in IMG_CACHE) { setUrl(IMG_CACHE[wiki]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchWikiImage(wiki).then(u => { if (!cancelled) { setUrl(u); setLoading(false); } });
    return () => { cancelled = true; };
  }, [wiki]);

  const border = `2px solid ${accent}`;
  const base = { width: size, height: Math.round(size * 1.2), overflow: "hidden", border, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}08`, animation: animate ? "cardIn 0.2s ease" : "none" };

  if (loading) return (
    <div style={base}>
      <div style={{ fontSize: 8, letterSpacing: 4, animation: "imgPulse 1.2s ease-in-out infinite" }}>LOADING</div>
    </div>
  );
  if (!url) return (
    <div style={base}>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>?</div>
    </div>
  );
  return (
    <div style={base}>
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
    </div>
  );
}

export default function Faces({ onBack, username, topPlayer, onLeaderboard }) {
  const [phase,    setPhase]    = useState("menu");
  const [target,   setTarget]   = useState(null);
  const [options,  setOptions]  = useState([]);
  const [chosen,   setChosen]   = useState(null);   // person id user clicked
  const [streak,   setStreak]   = useState(0);
  const [score,    setScore]    = useState(0);
  const [cmb,      setCmb]      = useState(1);
  const [stamp,    setStamp]    = useState(null);
  const [lastPts,  setLastPts]  = useState(null);
  const [history,  setHistory]  = useState([]);     // { target, wasCorrect, chosenId, imgUrl }
  const [usedIds,  setUsedIds]  = useState([]);
  const [cardKey,  setCardKey]  = useState(0);
  const [, setTick] = useState(0);
  const tmr  = useRef(null);
  const scoreSubmitted = useRef(false);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => () => { if (tmr.current) clearTimeout(tmr.current); }, []);

  // Submit score on death
  useEffect(() => {
    if (phase !== "dead" || scoreSubmitted.current) return;
    scoreSubmitted.current = true;
    if (username) submitScore(username, "faces", score);
  }, [phase, score, username]);

  function startGame() {
    scoreSubmitted.current = false;
    if (tmr.current) clearTimeout(tmr.current);
    const { person, options: opts } = pickCard(0, []);
    setTarget(person);
    setOptions(opts);
    setChosen(null);
    setStreak(0);
    setScore(0);
    setCmb(1);
    setStamp(null);
    setLastPts(null);
    setHistory([]);
    setUsedIds([person.id]);
    setCardKey(k => k + 1);
    setPhase("playing");
  }

  function pick(personId) {
    if (chosen !== null || phase !== "playing") return;
    setChosen(personId);
    const wasCorrect = personId === target.id;
    const imgUrl = IMG_CACHE[target.wiki] ?? null;

    if (wasCorrect) {
      const ns  = streak + 1;
      const nm  = Math.min(Math.floor(ns / 3) + 1, 5);
      const pts = 100 * cmb;
      setStreak(ns);
      setCmb(nm);
      setScore(s => s + pts);
      setLastPts(pts);
      if (ns >= 3 && ns % 3 === 0) {
        setStamp(nm + "x");
        tmr.current = setTimeout(() => setStamp(null), 1200);
      }
      setHistory(h => [...h, { target, wasCorrect: true, chosenId: personId, imgUrl }]);

      tmr.current = setTimeout(() => {
        const newUsed = [...usedIds.slice(-25), target.id];
        const { person, options: opts } = pickCard(ns, newUsed);
        setUsedIds([...newUsed, person.id]);
        setTarget(person);
        setOptions(opts);
        setChosen(null);
        setLastPts(null);
        setCardKey(k => k + 1);
      }, 700);
    } else {
      setHistory(h => [...h, { target, wasCorrect: false, chosenId: personId, imgUrl }]);
      tmr.current = setTimeout(() => setPhase("dead"), 800);
    }
  }

  const t  = getTier(streak);
  const ac = t.color;

  // ── Shared top bar ─────────────────────────────────────────────────────────
  function TopBar() {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
          <span onClick={onLeaderboard} style={{ cursor: "pointer", letterSpacing: 3, transition: "opacity 0.15s", flexShrink: 0 }} onMouseEnter={e => e.target.style.opacity = 0.7} onMouseLeave={e => e.target.style.opacity = 1}>SEE LEADERBOARD</span>
          <span style={{ opacity: 0.25 }}>|</span>
          {[["STO","Europe/Stockholm"],["DUB","Europe/Dublin"],["NYC","America/New_York"]].map(([label, tz]) => (
            <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>
        <div className="topbar-ctr" style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 1}>QUARTR LABS GAME STUDIO</div>
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
          {topPlayer && (
            <><span style={{ whiteSpace: "nowrap" }}>№1 <span style={{ fontWeight: 700 }}>{topPlayer}</span></span><span style={{ opacity: 0.25 }}>|</span></>
          )}
          {[
            { label: "NASDAQ", tz: "America/New_York", oh: 9,  om: 30, ch: 16, cm: 0  },
            { label: "LSE",    tz: "Europe/London",    oh: 8,  om: 0,  ch: 16, cm: 30 },
            { label: "STO",    tz: "Europe/Stockholm", oh: 9,  om: 0,  ch: 17, cm: 30 },
          ].map(({ label, tz, oh, om, ch, cm }) => {
            const open = isMktOpen(tz, oh, om, ch, cm);
            return <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ color: open ? WIN : C, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
          })}
        </div>
      </div>
    );
  }

  function BottomBar({ right }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span style={{ cursor: "pointer", transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 0.7} onMouseLeave={e => e.target.style.opacity = 1}>← HOME</span>
        <span>FACES V1.0</span>
        <span>{right}</span>
      </div>
    );
  }

  // ── MENU ───────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div className="page-root" style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{SHARED_CSS(C)}</style>
        <TopBar />
        <div className="scroll-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <div style={{ maxWidth: 200, margin: "0 auto 32px" }}>
              <PixelDisplay color={C} text="FACES" shape="square" />
            </div>
            <div style={{ border: `1px solid ${C}`, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>─ BRIEFING ─</div>
              {[
                "A face appears. Four names below it.",
                "Tap the correct name. One shot only.",
                "Right answer → next face, combo builds.",
                "Wrong answer → session terminated.",
                "Gets harder as your streak climbs.",
                "Streaks unlock score multipliers.",
              ].map((txt, i) => (
                <div key={i} style={{ fontSize: 11, lineHeight: 2.2, display: "flex", gap: 10 }}>
                  <span>{String(i + 1).padStart(2, "0")}</span><span>{txt}</span>
                </div>
              ))}
            </div>
            <button className="xb" onClick={startGame} style={{ letterSpacing: 8 }}>INITIATE</button>
          </div>
        </div>
        <BottomBar right="○ STANDBY" />
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  if (phase === "playing" && target) {
    return (
      <div className="page-root" style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: ac, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none", transition: "color 0.3s" }}>
        <style>{SHARED_CSS(ac)}</style>

        <TopBar />

        <div className="scroll-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflowY: "auto" }}>

          {stamp && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 80, fontWeight: 700, color: ac, textShadow: `0 0 60px ${ac}80`, animation: "stampIn 0.2s ease forwards, stampOut 0.3s ease 0.9s forwards", pointerEvents: "none", zIndex: 30, letterSpacing: 8 }}>{stamp}</div>
          )}

          <div style={{ width: "100%", maxWidth: 480 }}>

            {/* HUD */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 12, fontFeatureSettings: "'tnum'" }}>
              <div>
                <span style={{ color: ac }}>SCORE </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: ac }}>{score}</span>
                {lastPts && <span style={{ fontSize: 11, marginLeft: 8, color: ac, animation: "fadeUp 0.9s ease forwards" }}>+{lastPts}</span>}
              </div>
              <div>
                <span style={{ color: ac }}>STREAK </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: ac, textShadow: streak >= 3 ? `0 0 12px ${ac}60` : "none" }}>{streak}</span>
                {streak >= 3 && <span style={{ fontSize: 9, marginLeft: 6, letterSpacing: 3, color: ac, animation: "blink 1.5s step-end infinite" }}>{t.label}</span>}
              </div>
              <div>
                <span style={{ color: ac }}>MULTI </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: ac }}>{cmb}x</span>
              </div>
            </div>

            {/* Face image */}
            <div key={cardKey} style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <FaceImg wiki={target.wiki} size={Math.min(280, typeof window !== "undefined" ? window.innerWidth - 80 : 280)} animate accent={ac} />
            </div>

            {/* WHO IS THIS label */}
            <div style={{ fontSize: 9, letterSpacing: 5, textAlign: "center", marginBottom: 12, color: ac }}>─ WHO IS THIS? ─</div>

            {/* 4 name buttons (2×2 grid) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {options.map(p => {
                let cls = "fb";
                if (chosen !== null) {
                  if (p.id === target.id) cls = "fb correct";
                  else if (p.id === chosen) cls = "fb wrong";
                  else cls = "fb dim";
                }
                return (
                  <button key={p.id} className={cls} onClick={() => pick(p.id)} disabled={chosen !== null}>
                    {p.name}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        <BottomBar right="● ACTIVE" />
      </div>
    );
  }

  // ── DEAD ───────────────────────────────────────────────────────────────────
  if (phase === "dead") {
    const lastEntry   = history[history.length - 1];
    const wrongPerson = lastEntry?.target;
    const deadImg     = lastEntry?.imgUrl;
    const theyPicked  = PEOPLE.find(p => p.id === lastEntry?.chosenId);
    const correctCount = history.filter(h => h.wasCorrect).length;

    return (
      <div className="page-root" style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{SHARED_CSS(C)}</style>
        <TopBar />

        <div className="scroll-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "20px 16px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 480, animation: "revealIn 0.2s ease" }}>

            {/* Header */}
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 20, textAlign: "center" }}>─ TERMINATED ─</div>

            {/* Score */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 4, fontFeatureSettings: "'tnum'" }}>{score}</div>
              <div style={{ fontSize: 9, letterSpacing: 5 }}>TOTAL SCORE · {correctCount} CORRECT</div>
            </div>

            {/* Death card — who they got wrong */}
            {wrongPerson && (
              <div style={{ border: `1px solid ${C}`, marginBottom: 20, padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 0 }}>
                  {/* Mini face */}
                  {deadImg ? (
                    <img src={deadImg} alt="" style={{ width: 100, height: 120, objectFit: "cover", objectPosition: "center top", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 100, height: 120, background: `${C}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, fontWeight: 700 }}>?</div>
                  )}
                  {/* Info */}
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                    {theyPicked && theyPicked.id !== wrongPerson.id && (
                      <div style={{ fontSize: 8, letterSpacing: 3, marginBottom: 6, color: C }}>YOU SAID: {theyPicked.name}</div>
                    )}
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, color: WIN }}>{wrongPerson.name}</div>
                    <div style={{ fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>{wrongPerson.firm}</div>
                    <div style={{ fontSize: 10, lineHeight: 1.7 }}>{wrongPerson.bio}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 24 }}>
              <button className="xb" onClick={startGame} style={{ fontSize: 11, letterSpacing: 4 }}>PLAY AGAIN</button>
              <button className="xb" onClick={onBack}    style={{ fontSize: 11, letterSpacing: 4 }}>← HOME</button>
            </div>

            {/* Full run debrief */}
            {history.length > 0 && (
              <>
                <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 12 }}>─ FULL RUN ─</div>
                {history.map((entry, i) => {
                  const p   = entry.target;
                  const img = entry.imgUrl;
                  const ok  = entry.wasCorrect;
                  const picked = !ok ? PEOPLE.find(x => x.id === entry.chosenId) : null;

                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C}12` }}>
                      {/* Thumbnail */}
                      {img ? (
                        <img src={img} alt="" style={{ width: 36, height: 44, objectFit: "cover", objectPosition: "center top", flexShrink: 0, border: `1px solid ${ok ? WIN : C}40` }} />
                      ) : (
                        <div style={{ width: 36, height: 44, background: `${C}08`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700, border: `1px solid ${ok ? WIN : C}30` }}>?</div>
                      )}
                      {/* Name + result */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: ok ? WIN : C }}>
                          {p.name}
                        </div>
                        {!ok && picked && (
                          <div style={{ fontSize: 8, letterSpacing: 2, marginTop: 2 }}>you said: {picked.name}</div>
                        )}
                        <div style={{ fontSize: 8, letterSpacing: 2, marginTop: 2 }}>{p.firm}</div>
                      </div>
                      {/* Tick or X */}
                      <span style={{ color: ok ? WIN : C, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{ok ? "✓" : "✗"}</span>
                    </div>
                  );
                })}
              </>
            )}

          </div>
        </div>

        <BottomBar right="○ STANDBY" />
      </div>
    );
  }

  return null;
}
