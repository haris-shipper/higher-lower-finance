import { useState, useEffect, useRef, useCallback } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { EVENTS } from "./whatYearData.js";
import { submitScore } from "./supabase.js";

const BG   = "#1F1F1F";
const C    = "#E1D41B";
const FADE = "rgba(225,212,27,0.18)";

const YEAR_MIN       = 1970;
const YEAR_MAX       = 2025;
const CLUE_SECS      = 8;          // seconds per clue window
const NUM_CLUES      = 5;
const TOTAL_SECS     = CLUE_SECS * NUM_CLUES; // 40s total
const ROUNDS         = 16;
const DEFAULT_GUESS  = 1998;

// Multiplier for each clue window (0-indexed): 5x, 4x, 3x, 2x, 1x
function getMultiplier(clueIdx) { return Math.max(1, 5 - clueIdx); }

// Score = proximity (0-100) × multiplier
function calcScore(guess, year, mult) {
  const diff = Math.abs(guess - year);
  const proximity = Math.max(0, 100 - diff * 10);
  return proximity * mult;
}

const TIERS = [
  { min: 0,  color: C,         label: "" },
  { min: 3,  color: "#D1FF2D", label: "STREAK" },
  { min: 5,  color: "#2DFBFF", label: "HOT" },
  { min: 8,  color: "#2D70FF", label: "ON FIRE" },
  { min: 10, color: "#D82DFF", label: "LEGENDARY" },
  { min: 13, color: "#FF2D50", label: "GODMODE" },
];
function getTier(streak) { let t = TIERS[0]; for (const x of TIERS) if (streak >= x.min) t = x; return t; }

const MULT_COLORS = ["#E1D41B","#FF972D","#FF6020","#FF3020","#FF2020"];

function shuf(arr) {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

// ── Custom Year Slider ──────────────────────────────────────────────────────
function YearSlider({ value, onChange, disabled }) {
  const trackRef = useRef(null);
  const pct = (value - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);

  function valueFromX(clientX) {
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(YEAR_MIN + p * (YEAR_MAX - YEAR_MIN));
  }

  function onMouseDown(e) {
    if (disabled) return;
    onChange(valueFromX(e.clientX));
    const move = (me) => onChange(valueFromX(me.clientX));
    const up   = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  function onTouchStart(e) {
    if (disabled) return;
    onChange(valueFromX(e.touches[0].clientX));
  }
  function onTouchMove(e) {
    if (disabled) return;
    e.preventDefault();
    onChange(valueFromX(e.touches[0].clientX));
  }

  const decades = [1970, 1980, 1990, 2000, 2010, 2020];

  return (
    <div style={{ userSelect: "none", width: "100%" }}>
      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{ position: "relative", height: 32, cursor: disabled ? "default" : "pointer", padding: "14px 0" }}
      >
        {/* Rail */}
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 4, background: "rgba(225,212,27,0.2)", borderRadius: 2 }} />
        {/* Fill */}
        <div style={{ position: "absolute", top: 14, left: 0, width: `${pct * 100}%`, height: 4, background: C, borderRadius: 2, transition: disabled ? "none" : "none" }} />
        {/* Thumb */}
        <div style={{
          position: "absolute", top: 7, left: `${pct * 100}%`,
          transform: "translateX(-50%)",
          width: 18, height: 18,
          background: disabled ? "rgba(225,212,27,0.4)" : C,
          border: `2px solid ${BG}`,
          borderRadius: 2,
          boxShadow: disabled ? "none" : `0 0 12px ${C}`,
          transition: disabled ? "background 0.3s" : "none",
        }} />
        {/* Decade tick marks */}
        {decades.map(d => {
          const tp = (d - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
          return (
            <div key={d} style={{ position: "absolute", top: 20, left: `${tp * 100}%`, transform: "translateX(-50%)", width: 1, height: 6, background: "rgba(225,212,27,0.3)" }} />
          );
        })}
      </div>
      {/* Decade labels */}
      <div style={{ position: "relative", height: 16 }}>
        {decades.map(d => {
          const tp = (d - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
          return (
            <span key={d} style={{ position: "absolute", left: `${tp * 100}%`, transform: "translateX(-50%)", fontSize: 9, color: "rgba(225,212,27,0.4)", letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace" }}>{d}</span>
          );
        })}
      </div>
    </div>
  );
}

export default function WhatYear({ onBack, username, topPlayer, onLeaderboard }) {
  const [phase,    setPhase]    = useState("menu");   // menu | playing | reveal | gameover
  const [events,   setEvents]   = useState([]);        // 16 shuffled events
  const [roundIdx, setRoundIdx] = useState(0);
  const [guess,    setGuess]    = useState(DEFAULT_GUESS);
  const [elapsed,  setElapsed]  = useState(0);
  const [locked,   setLocked]   = useState(false);     // player locked in
  const [streak,   setStreak]   = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);     // for reveal phase
  const [roundMult,  setRoundMult]  = useState(0);     // for reveal phase
  const [scores,   setScores]   = useState([]);        // per-round scores
  const [, setTick] = useState(0);                     // clock tick

  const startTimeRef = useRef(null);
  const intervalRef  = useRef(null);
  const lockedRef    = useRef(false);
  const guessRef     = useRef(DEFAULT_GUESS);
  const roundIdxRef  = useRef(0);

  // Keep refs in sync
  useEffect(() => { guessRef.current = guess; }, [guess]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { roundIdxRef.current = roundIdx; }, [roundIdx]);

  // Clock tick for top bar
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  function startGame() {
    const picked = shuf(EVENTS).slice(0, ROUNDS);
    setEvents(picked);
    setRoundIdx(0);
    roundIdxRef.current = 0;
    setGuess(DEFAULT_GUESS);
    guessRef.current = DEFAULT_GUESS;
    setStreak(0);
    setTotalScore(0);
    setScores([]);
    setPhase("playing");
  }

  // Start timer for each round
  useEffect(() => {
    if (phase !== "playing") return;
    setElapsed(0);
    setLocked(false);
    lockedRef.current = false;
    setGuess(DEFAULT_GUESS);
    guessRef.current = DEFAULT_GUESS;
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (lockedRef.current) return;
      const el = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(el);
      if (el >= TOTAL_SECS) {
        clearInterval(intervalRef.current);
        handleSubmit(0, 0); // timeout = 0 pts
      }
    }, 80);

    return () => clearInterval(intervalRef.current);
  }, [phase, roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback((score, mult) => {
    if (lockedRef.current && score !== 0) return; // already locked
    clearInterval(intervalRef.current);
    lockedRef.current = true;
    setLocked(true);
    setRoundScore(score);
    setRoundMult(mult);

    const newStreak = score > 0 ? streak + 1 : 0;
    setStreak(newStreak);
    setTotalScore(prev => prev + score);
    setScores(prev => [...prev, score]);

    setPhase("reveal");
  }, [streak]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLockIn() {
    if (lockedRef.current) return;
    clearInterval(intervalRef.current);
    const el = (Date.now() - startTimeRef.current) / 1000;
    const clueIdx = Math.min(NUM_CLUES - 1, Math.floor(el / CLUE_SECS));
    const mult = getMultiplier(clueIdx);
    const score = calcScore(guessRef.current, events[roundIdxRef.current].year, mult);
    handleSubmit(score, mult);
  }

  function nextRound() {
    const nextIdx = roundIdx + 1;
    if (nextIdx >= ROUNDS) {
      // Game over
      if (username) {
        submitScore(username, "whyear", totalScore + roundScore);
      }
      setPhase("gameover");
    } else {
      setRoundIdx(nextIdx);
      roundIdxRef.current = nextIdx;
      setPhase("playing");
    }
  }

  // Auto-advance reveal after 3.5s
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(nextRound, 3500);
    return () => clearTimeout(t);
  }, [phase, roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ────────────────────────────────────────────────────────
  const clueIdx     = Math.min(NUM_CLUES - 1, Math.floor(elapsed / CLUE_SECS));
  const multiplier  = locked ? roundMult : getMultiplier(clueIdx);
  const multColor   = MULT_COLORS[Math.min(4, clueIdx)];
  const barPct      = locked ? 0 : Math.max(0, 1 - elapsed / TOTAL_SECS);
  const clueBarPct  = locked ? 0 : Math.max(0, 1 - (elapsed % CLUE_SECS) / CLUE_SECS);
  const timedOut    = elapsed >= TOTAL_SECS && !locked;
  const tier        = getTier(streak);
  const event       = events[roundIdx];
  const revealedClues = event ? event.clues.slice(0, clueIdx + 1) : [];

  const isWarn = elapsed >= TOTAL_SECS - CLUE_SECS && !locked; // last clue window

  // ── MENU ────────────────────────────────────────────────────────────────
  if (phase === "menu") return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes flicker{0%,100%{opacity:1}40%{opacity:0.7}60%{opacity:0.9}}
      `}</style>

      {/* TOP BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px", borderBottom:`1px solid ${C}`, fontSize:9, letterSpacing:2, flexShrink:0 }}>
        <div className="mob-hide" style={{ display:"flex", gap:12, flex:1, alignItems:"center" }}>
          <span onClick={onBack} style={{ cursor:"pointer", opacity:0.7 }} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.7}>← BACK</span>
          <span style={{ opacity:0.25 }}>|</span>
          {[["STO","Europe/Stockholm"],["DUB","Europe/Dublin"],["NYC","America/New_York"]].map(([l,tz])=>(
            <span key={l}>{l} <span style={{ fontFeatureSettings:"'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>
        <div className="topbar-ctr" style={{ fontSize:10, letterSpacing:4, flexShrink:0, padding:"0 20px" }}>QUARTR LABS GAME STUDIO</div>
        <div className="mob-hide" style={{ display:"flex", gap:12, flex:1, justifyContent:"flex-end", alignItems:"center" }}>
          {topPlayer && <span style={{ opacity:0.7 }}>№1 <b>{topPlayer}</b></span>}
          {topPlayer && <span style={{ opacity:0.25 }}>|</span>}
          {[{label:"NASDAQ",tz:"America/New_York",oh:9,om:30,ch:16,cm:0},{label:"LSE",tz:"Europe/London",oh:8,om:0,ch:16,cm:30},{label:"STO",tz:"Europe/Stockholm",oh:9,om:0,ch:17,cm:30}].map(({label,tz,oh,om,ch,cm})=>{
            const open = isMktOpen(tz,oh,om,ch,cm);
            return <span key={label}>{label} <span style={{ color: open?"#2DFF72":"#FF2D2D", animation: open?"pulse 1.5s ease-in-out infinite":"none" }}>{open?"OPEN":"CLOSED"}</span></span>;
          })}
        </div>
      </div>

      {/* MENU CONTENT */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:40, padding:"40px 20px" }}>
        <div style={{ maxWidth:323, width:"100%" }}>
          <PixelDisplay color={C} isHovered={false} text="WHAT YEAR?" shape="square" />
        </div>

        <div style={{ maxWidth:480, width:"100%", textAlign:"center", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontSize:11, letterSpacing:3, opacity:0.6, lineHeight:1.8 }}>
            16 ROUNDS · 5 CLUES PER EVENT · TIMER DROPS YOUR MULTIPLIER<br />
            GUESS THE YEAR · LOCK IN EARLY FOR MAXIMUM POINTS
          </div>

          {/* Multiplier preview */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, margin:"8px 0" }}>
            {[5,4,3,2,1].map((m,i) => (
              <div key={m} style={{ width:44, textAlign:"center", padding:"8px 0", border:`1px solid ${MULT_COLORS[i]}`, color:MULT_COLORS[i], fontSize:16, fontWeight:700, letterSpacing:1 }}>
                {m}×
              </div>
            ))}
          </div>
          <div style={{ fontSize:9, letterSpacing:2, opacity:0.5, marginTop:-4 }}>CLUE 1 → 2 → 3 → 4 → 5 (8s EACH)</div>
        </div>

        <button
          onClick={startGame}
          style={{ background:"transparent", border:`1px solid ${C}`, color:C, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:4, padding:"14px 48px", cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.target.style.background=C; e.target.style.color=BG; }}
          onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.color=C; }}
        >
          START GAME
        </button>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${C}`, fontSize:9, letterSpacing:3, flexShrink:0 }}>
        <span onClick={onLeaderboard} style={{ cursor:"pointer", opacity:0.7 }} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.7}>LEADERBOARD</span>
        <span>QUARTR LABS GAME STUDIO</span>
        <span>WHAT YEAR?</span>
      </div>
    </div>
  );

  // ── GAME OVER ─────────────────────────────────────────────────────────────
  if (phase === "gameover") {
    const finalScore = scores.reduce((a, b) => a + b, 0);
    return (
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", background:BG, color:C, minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px", borderBottom:`1px solid ${C}`, fontSize:9, letterSpacing:2, flexShrink:0 }}>
          <span onClick={onBack} style={{ cursor:"pointer", opacity:0.7 }}>← BACK</span>
          <div style={{ fontSize:10, letterSpacing:4 }}>QUARTR LABS GAME STUDIO</div>
          <span onClick={onLeaderboard} style={{ cursor:"pointer", opacity:0.7 }}>LEADERBOARD</span>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32, padding:"40px 20px" }}>
          <div style={{ fontSize:9, letterSpacing:4, opacity:0.6 }}>GAME OVER</div>
          <div style={{ fontSize:64, fontWeight:700, letterSpacing:2, lineHeight:1 }}>{finalScore.toLocaleString()}</div>
          <div style={{ fontSize:9, letterSpacing:3, opacity:0.5 }}>FINAL SCORE · {ROUNDS} ROUNDS</div>
          {/* Round breakdown */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4, maxWidth:360, width:"100%" }}>
            {scores.map((s, i) => (
              <div key={i} style={{ border:`1px solid ${s>0?C:"rgba(225,212,27,0.2)"}`, padding:"6px 0", textAlign:"center", fontSize:10, fontWeight:700, color:s>0?C:"rgba(225,212,27,0.3)" }}>
                {s > 0 ? s : "—"}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:16 }}>
            <button onClick={startGame} style={{ background:"transparent", border:`1px solid ${C}`, color:C, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:3, padding:"12px 32px", cursor:"pointer" }}
              onMouseEnter={e=>{ e.target.style.background=C; e.target.style.color=BG; }}
              onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.color=C; }}
            >PLAY AGAIN</button>
            <button onClick={onLeaderboard} style={{ background:"transparent", border:`1px solid rgba(225,212,27,0.4)`, color:"rgba(225,212,27,0.6)", fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:3, padding:"12px 32px", cursor:"pointer" }}
              onMouseEnter={e=>{ e.target.style.borderColor=C; e.target.style.color=C; }}
              onMouseLeave={e=>{ e.target.style.borderColor="rgba(225,212,27,0.4)"; e.target.style.color="rgba(225,212,27,0.6)"; }}
            >LEADERBOARD</button>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${C}`, fontSize:9, letterSpacing:3, flexShrink:0 }}>
          <span>OPERATOR: {username || "QUARTR"}</span>
          <span>QUARTR LABS GAME STUDIO</span>
          <span>WHAT YEAR?</span>
        </div>
      </div>
    );
  }

  // ── PLAYING / REVEAL ──────────────────────────────────────────────────────
  const isReveal   = phase === "reveal";
  const currEvent  = event;
  const displayClues = isReveal ? currEvent.clues : revealedClues;
  const diff        = isReveal ? Math.abs(guess - currEvent.year) : null;

  return (
    <div className="page-root" style={{ fontFamily:"'IBM Plex Mono',monospace", background:BG, color:C, minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.15}}
        @keyframes multDrop{0%{transform:scale(1.4)}100%{transform:scale(1)}}
        @keyframes warn{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes clueIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        @keyframes revealPop{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:none}}
      `}</style>

      {/* TOP BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px", borderBottom:`1px solid ${C}`, fontSize:9, letterSpacing:2, flexShrink:0 }}>
        <div className="mob-hide" style={{ display:"flex", gap:12, flex:1, alignItems:"center" }}>
          <span onClick={onBack} style={{ cursor:"pointer", opacity:0.7 }} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.7}>← BACK</span>
          <span style={{ opacity:0.25 }}>|</span>
          <span>ROUND {roundIdx + 1} / {ROUNDS}</span>
        </div>
        <div className="topbar-ctr" style={{ fontSize:10, letterSpacing:4, flexShrink:0, padding:"0 20px" }}>QUARTR LABS GAME STUDIO</div>
        <div className="mob-hide" style={{ display:"flex", gap:12, flex:1, justifyContent:"flex-end", alignItems:"center" }}>
          {tier.label && <span style={{ color: tier.color, fontWeight:700 }}>{tier.label}</span>}
          {tier.label && <span style={{ opacity:0.25 }}>|</span>}
          <span>STREAK {streak}</span>
          <span style={{ opacity:0.25 }}>|</span>
          <span style={{ fontWeight:700 }}>{totalScore.toLocaleString()} PTS</span>
        </div>
      </div>

      {/* CONTINUOUS TIMER BAR */}
      <div style={{ height:4, background:"rgba(225,212,27,0.12)", flexShrink:0 }}>
        <div style={{
          height:"100%",
          width:`${barPct * 100}%`,
          background: isWarn ? "#FF2D2D" : C,
          transition:"width 0.08s linear",
          animation: isWarn ? "warn 0.6s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* MAIN CONTENT */}
      <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", padding:"0 20px 20px", gap:0, maxWidth:700, width:"100%", margin:"0 auto" }}>

        {/* MULTIPLIER HUD */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 12px" }}>
          {/* Clue indicator dots */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {Array.from({length: NUM_CLUES}).map((_, i) => {
              const active = i <= (isReveal ? NUM_CLUES - 1 : clueIdx);
              return (
                <div key={i} style={{ width:8, height:8, borderRadius:1, background: active ? C : "rgba(225,212,27,0.15)", transition:"background 0.3s" }} />
              );
            })}
            <span style={{ fontSize:9, letterSpacing:2, marginLeft:6, opacity:0.5 }}>
              {isReveal ? "ALL REVEALED" : `CLUE ${clueIdx + 1} OF ${NUM_CLUES}`}
            </span>
          </div>

          {/* Big multiplier badge */}
          {!isReveal && (
            <div key={`mult-${clueIdx}`} style={{
              fontSize:40, fontWeight:700, lineHeight:1,
              color: elapsed >= TOTAL_SECS ? "rgba(225,212,27,0.2)" : multColor,
              animation: "multDrop 0.25s ease-out",
              letterSpacing:2,
              textShadow: elapsed < TOTAL_SECS ? `0 0 24px ${multColor}` : "none",
            }}>
              {elapsed >= TOTAL_SECS ? "0×" : `${multiplier}×`}
            </div>
          )}

          {/* Clue window sub-timer */}
          {!isReveal && (
            <div style={{ width:60, textAlign:"right" }}>
              <div style={{ height:3, background:"rgba(225,212,27,0.12)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${clueBarPct * 100}%`, background: isWarn ? "#FF2D2D" : C, transition:"width 0.08s linear" }} />
              </div>
              <div style={{ fontSize:9, letterSpacing:1, opacity:0.4, marginTop:4 }}>
                {Math.max(0, Math.ceil(CLUE_SECS - (elapsed % CLUE_SECS)))}s
              </div>
            </div>
          )}
        </div>

        {/* CLUE BOX */}
        <div style={{ border:`1px solid rgba(225,212,27,0.3)`, background:FADE, padding:"20px 24px", display:"flex", flexDirection:"column", gap:14, minHeight:160, flex:"0 0 auto" }}>
          {displayClues.length === 0 && (
            <div style={{ opacity:0.3, fontSize:12, letterSpacing:2 }}>WAITING...</div>
          )}
          {displayClues.map((clue, i) => {
            const isCurrent = !isReveal && i === clueIdx;
            return (
              <div key={`${roundIdx}-${i}`} style={{
                fontSize: isCurrent ? 14 : 12,
                lineHeight: 1.6,
                opacity: isReveal ? 1 : (isCurrent ? 1 : 0.45),
                fontWeight: isCurrent ? 600 : 400,
                letterSpacing: isCurrent ? 0.5 : 0,
                color: C,
                animation: i === clueIdx && !isReveal ? "clueIn 0.3s ease-out" : "none",
                borderLeft: isCurrent ? `2px solid ${C}` : "2px solid transparent",
                paddingLeft: 10,
              }}>
                {clue}
              </div>
            );
          })}
        </div>

        {/* REVEAL RESULT */}
        {isReveal && (
          <div style={{ animation:"revealPop 0.35s ease-out", border:`1px solid ${roundScore > 0 ? C : "rgba(225,212,27,0.3)"}`, marginTop:12, padding:"16px 24px", display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <div>
                <div style={{ fontSize:9, letterSpacing:3, opacity:0.5, marginBottom:4 }}>THE YEAR WAS</div>
                <div style={{ fontSize:32, fontWeight:700, letterSpacing:2 }}>{currEvent.year}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:9, letterSpacing:3, opacity:0.5, marginBottom:4 }}>YOU GUESSED</div>
                <div style={{ fontSize:24, fontWeight:700, letterSpacing:2, opacity: diff === 0 ? 1 : 0.8 }}>{guess}</div>
                {diff !== null && <div style={{ fontSize:9, letterSpacing:2, opacity:0.5 }}>{diff === 0 ? "EXACT!" : `OFF BY ${diff} YEAR${diff !== 1 ? "S" : ""}`}</div>}
              </div>
            </div>
            <div style={{ height:1, background:"rgba(225,212,27,0.2)" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:9, letterSpacing:3, opacity:0.5 }}>{roundMult}× MULTIPLIER</div>
              <div style={{ fontSize:20, fontWeight:700, color: roundScore > 0 ? C : "rgba(225,212,27,0.3)" }}>
                {roundScore > 0 ? `+${roundScore}` : "NO SCORE"}
              </div>
            </div>
          </div>
        )}

        {/* SLIDER AREA */}
        <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
          {/* Year display */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ fontSize:48, fontWeight:700, letterSpacing:4, color: isReveal ? "rgba(225,212,27,0.4)" : C, transition:"color 0.3s", lineHeight:1 }}>
              {guess}
            </div>
          </div>
          <YearSlider value={guess} onChange={(v) => { setGuess(v); guessRef.current = v; }} disabled={isReveal} />
        </div>

        {/* LOCK IN BUTTON */}
        {!isReveal && (
          <button
            onClick={handleLockIn}
            style={{
              marginTop:16,
              background: "transparent",
              border: `1px solid ${elapsed >= TOTAL_SECS ? "rgba(225,212,27,0.2)" : C}`,
              color: elapsed >= TOTAL_SECS ? "rgba(225,212,27,0.2)" : C,
              fontFamily:"'IBM Plex Mono',monospace",
              fontSize:11, letterSpacing:4, padding:"14px 0",
              cursor: elapsed >= TOTAL_SECS ? "default" : "pointer",
              width:"100%",
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>{ if(elapsed < TOTAL_SECS){ e.target.style.background=C; e.target.style.color=BG; } }}
            onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.color= elapsed >= TOTAL_SECS ? "rgba(225,212,27,0.2)" : C; }}
            disabled={elapsed >= TOTAL_SECS}
          >
            {elapsed >= TOTAL_SECS ? "TIME'S UP" : `LOCK IN — ${multiplier}× MULTIPLIER`}
          </button>
        )}

        {/* NEXT button during reveal */}
        {isReveal && (
          <button
            onClick={nextRound}
            style={{ marginTop:16, background:"transparent", border:`1px solid rgba(225,212,27,0.4)`, color:"rgba(225,212,27,0.6)", fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:4, padding:"12px 0", cursor:"pointer", width:"100%" }}
            onMouseEnter={e=>{ e.target.style.borderColor=C; e.target.style.color=C; }}
            onMouseLeave={e=>{ e.target.style.borderColor="rgba(225,212,27,0.4)"; e.target.style.color="rgba(225,212,27,0.6)"; }}
          >
            {roundIdx + 1 >= ROUNDS ? "SEE RESULTS →" : "NEXT →"}
          </button>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${C}`, fontSize:9, letterSpacing:3, flexShrink:0 }}>
        <span>OPERATOR: {username || "QUARTR"}</span>
        <span style={{ color: tier.color }}>{totalScore.toLocaleString()} PTS</span>
        <span>ROUND {roundIdx + 1} / {ROUNDS}</span>
      </div>
    </div>
  );
}
