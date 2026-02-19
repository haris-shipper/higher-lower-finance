import { useState, useEffect, useRef, useCallback } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { EVENTS } from "./whatYearData.js";
import { submitScore } from "./supabase.js";

const BG  = "#141413";
const C   = "#E1D41B";
const ERR = "#FF2D2D";
const WIN = "#2DFF72";

const YEAR_MIN    = 1970;
const YEAR_MAX    = 2025;
const CLUE_SECS   = 8;
const NUM_CLUES   = 5;
const TOTAL_SECS  = CLUE_SECS * NUM_CLUES; // 40s
const ROUNDS      = 16;
const DEF_GUESS   = 1998;

const TIERS = [
  { min: 0,  color: C,         label: "" },
  { min: 3,  color: "#D1FF2D", label: "STREAK" },
  { min: 5,  color: "#2DFBFF", label: "HOT" },
  { min: 8,  color: "#2D70FF", label: "ON FIRE" },
  { min: 10, color: "#D82DFF", label: "LEGENDARY" },
  { min: 13, color: "#FF2D50", label: "GODMODE" },
];
function getTier(s) { let t = TIERS[0]; for (const x of TIERS) if (s >= x.min) t = x; return t; }

const MULT_COLORS = [C, "#FF972D", "#FF6020", "#FF3020", "#FF2020"];

function shuf(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function getMult(clueIdx) { return Math.max(1, 5 - clueIdx); }
function calcProximity(guess, year) { return Math.max(0, 100 - Math.abs(guess - year) * 10); }

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

const CLOCKS   = [["STO","Europe/Stockholm"],["DUB","Europe/Dublin"],["NYC","America/New_York"]];
const MARKETS  = [
  { label:"NASDAQ", tz:"America/New_York", oh:9,  om:30, ch:16, cm:0  },
  { label:"LSE",    tz:"Europe/London",    oh:8,  om:0,  ch:16, cm:30 },
  { label:"STO",    tz:"Europe/Stockholm", oh:9,  om:0,  ch:17, cm:30 },
];

function TopBar({ onLeaderboard, onBack, topPlayer }) {
  const [, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px", borderBottom:`1px solid ${C}`, flexShrink:0, fontSize:9, letterSpacing:2 }}>
      <div className="mob-hide" style={{ display:"flex", gap:12, flex:1, alignItems:"center" }}>
        <span onClick={onLeaderboard} style={{ cursor:"pointer", letterSpacing:3, opacity:0.7, transition:"opacity 0.15s", flexShrink:0 }} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.7}>SEE LEADERBOARD</span>
        <span style={{ opacity:0.25 }}>|</span>
        {CLOCKS.map(([label,tz])=>(
          <span key={label} style={{ whiteSpace:"nowrap" }}>{label} <span style={{ fontFeatureSettings:"'tnum'" }}>{getTZTime(tz)}</span></span>
        ))}
      </div>
      <div className="topbar-ctr" style={{ fontSize:10, letterSpacing:4, cursor:"pointer", opacity:0.7, transition:"opacity 0.15s" }} onClick={onBack} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.7}>QUARTR LABS GAME STUDIO</div>
      <div className="mob-hide" style={{ display:"flex", gap:12, flex:1, justifyContent:"flex-end", alignItems:"center" }}>
        {topPlayer && (<><span style={{ whiteSpace:"nowrap", opacity:0.7 }}>№1 <span style={{ fontWeight:700, opacity:1 }}>{topPlayer}</span></span><span style={{ opacity:0.25 }}>|</span></>)}
        {MARKETS.map(({label,tz,oh,om,ch,cm})=>{
          const open = isMktOpen(tz,oh,om,ch,cm);
          return <span key={label} style={{ whiteSpace:"nowrap" }}>{label} <span style={{ color:open?WIN:ERR, animation:open?"pulse 1.5s ease-in-out infinite":"none" }}>{open?"OPEN":"CLOSED"}</span></span>;
        })}
      </div>
    </div>
  );
}

// ── Custom draggable year slider ────────────────────────────────────────────
function YearSlider({ value, onChange, disabled }) {
  const trackRef = useRef(null);
  const pct = (value - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
  const decades = [1970,1980,1990,2000,2010,2020];

  function valueFromX(clientX) {
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(YEAR_MIN + p * (YEAR_MAX - YEAR_MIN));
  }
  function onMouseDown(e) {
    if (disabled) return;
    onChange(valueFromX(e.clientX));
    const move = (me) => onChange(valueFromX(me.clientX));
    const up   = () => { document.removeEventListener("mousemove",move); document.removeEventListener("mouseup",up); };
    document.addEventListener("mousemove",move);
    document.addEventListener("mouseup",up);
  }
  function onTouchStart(e) { if (!disabled) onChange(valueFromX(e.touches[0].clientX)); }
  function onTouchMove(e)  { if (!disabled){ e.preventDefault(); onChange(valueFromX(e.touches[0].clientX)); } }

  return (
    <div style={{ userSelect:"none", width:"100%" }}>
      <div ref={trackRef} onMouseDown={onMouseDown} onTouchStart={onTouchStart} onTouchMove={onTouchMove}
        style={{ position:"relative", height:32, cursor:disabled?"default":"pointer", padding:"14px 0" }}>
        {/* Rail */}
        <div style={{ position:"absolute", top:14, left:0, right:0, height:3, background:`${C}20`, borderRadius:2 }} />
        {/* Fill */}
        <div style={{ position:"absolute", top:14, left:0, width:`${pct*100}%`, height:3, background:disabled?`${C}40`:C, borderRadius:2 }} />
        {/* Thumb */}
        <div style={{ position:"absolute", top:8, left:`${pct*100}%`, transform:"translateX(-50%)", width:16, height:16, background:disabled?`${C}40`:C, border:`2px solid ${BG}`, borderRadius:2, boxShadow:disabled?"none":`0 0 10px ${C}60` }} />
        {/* Tick marks */}
        {decades.map(d=>{
          const tp = (d-YEAR_MIN)/(YEAR_MAX-YEAR_MIN);
          return <div key={d} style={{ position:"absolute", top:21, left:`${tp*100}%`, transform:"translateX(-50%)", width:1, height:5, background:`${C}30` }} />;
        })}
      </div>
      {/* Labels */}
      <div style={{ position:"relative", height:14 }}>
        {decades.map(d=>{
          const tp = (d-YEAR_MIN)/(YEAR_MAX-YEAR_MIN);
          return <span key={d} style={{ position:"absolute", left:`${tp*100}%`, transform:"translateX(-50%)", fontSize:8, color:`${C}40`, letterSpacing:1, fontFamily:"'IBM Plex Mono',monospace" }}>{d}</span>;
        })}
      </div>
    </div>
  );
}

export default function WhatYear({ onBack, username, topPlayer, onLeaderboard }) {
  const [phase,      setPhase]      = useState("menu");
  const [events,     setEvents]     = useState([]);
  const [roundIdx,   setRoundIdx]   = useState(0);
  const [guess,      setGuess]      = useState(DEF_GUESS);
  const [elapsed,    setElapsed]    = useState(0);
  const [locked,     setLocked]     = useState(false);
  const [streak,     setStreak]     = useState(0);
  const [score,      setScore]      = useState(0);
  const [lastPts,    setLastPts]    = useState(null);
  const [revealMult, setRevealMult] = useState(0);
  const [revealScore,setRevealScore]= useState(0);
  const [scores,     setScores]     = useState([]);
  const scoreSubmitted = useRef(false);

  const startTimeRef = useRef(null);
  const intervalRef  = useRef(null);
  const lockedRef    = useRef(false);
  const guessRef     = useRef(DEF_GUESS);
  const streakRef    = useRef(0);
  const scoreRef     = useRef(0);

  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { guessRef.current = guess; }, [guess]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if ((phase !== "gameover") || scoreSubmitted.current) return;
    scoreSubmitted.current = true;
    if (username) submitScore(username, "whyear", scoreRef.current);
  }, [phase, username]);

  function startGame() {
    scoreSubmitted.current = false;
    const picked = shuf(EVENTS).slice(0, ROUNDS);
    setEvents(picked);
    setRoundIdx(0);
    setGuess(DEF_GUESS); guessRef.current = DEF_GUESS;
    setStreak(0); streakRef.current = 0;
    setScore(0);  scoreRef.current = 0;
    setScores([]);
    setLastPts(null);
    setPhase("playing");
  }

  // Start timer each round
  useEffect(() => {
    if (phase !== "playing") return;
    setElapsed(0);
    setLocked(false); lockedRef.current = false;
    setGuess(DEF_GUESS); guessRef.current = DEF_GUESS;
    setLastPts(null);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (lockedRef.current) return;
      const el = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(el);
      if (el >= TOTAL_SECS) {
        clearInterval(intervalRef.current);
        commitAnswer(0, 0);
      }
    }, 80);

    return () => clearInterval(intervalRef.current);
  }, [phase, roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const commitAnswer = useCallback((pts, mult) => {
    clearInterval(intervalRef.current);
    lockedRef.current = true;
    setLocked(true);
    setRevealScore(pts);
    setRevealMult(mult);

    const newStreak = pts > 0 ? streakRef.current + 1 : 0;
    setStreak(newStreak); streakRef.current = newStreak;
    const newScore = scoreRef.current + pts;
    setScore(newScore); scoreRef.current = newScore;
    setLastPts(pts > 0 ? pts : null);
    setScores(prev => [...prev, pts]);

    setPhase("reveal");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLockIn() {
    if (lockedRef.current) return;
    const el = (Date.now() - startTimeRef.current) / 1000;
    if (el >= TOTAL_SECS) return;
    const clueIdx = Math.min(NUM_CLUES - 1, Math.floor(el / CLUE_SECS));
    const mult    = getMult(clueIdx);
    const pts     = calcProximity(guessRef.current, events[roundIdx].year) * mult;
    commitAnswer(pts, mult);
  }

  function nextRound() {
    const next = roundIdx + 1;
    if (next >= ROUNDS) {
      setPhase("gameover");
    } else {
      setRoundIdx(next);
      setPhase("playing");
    }
  }

  // Auto-advance reveal after 3.5s
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(nextRound, 3500);
    return () => clearTimeout(t);
  }, [phase, roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const SHARED_STYLE = {
    fontFamily:"'IBM Plex Mono',monospace", background:BG, color:C, minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none",
  };
  const GLOBAL_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
    @keyframes fadeUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}
    @keyframes clueSlide{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
    @keyframes revealV{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
    @keyframes multDrop{0%{transform:scale(1.3)}100%{transform:scale(1)}}
    @keyframes warn{0%,100%{opacity:1}50%{opacity:0.35}}
    .wyb{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;letter-spacing:0.15em;padding:16px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
    .wyb:hover{background:${C};color:${BG};}
    .wyb:active{transform:scale(0.96);}
    .wyb-dim{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.12em;padding:14px 0;background:transparent;color:${C}60;border:1px solid ${C}30;cursor:pointer;transition:all 0.12s;}
    .wyb-dim:hover{color:${C};border-color:${C};}
  `;

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase === "menu") return (
    <div className="page-root" style={SHARED_STYLE}>
      <style>{GLOBAL_CSS}</style>
      <TopBar onLeaderboard={onLeaderboard} onBack={onBack} topPlayer={topPlayer} />

      <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
        <div style={{ maxWidth:460, width:"100%", textAlign:"center" }}>

          <PixelDisplay color={C} text="WHAT YEAR?" shape="square" style={{ marginBottom:28 }} />

          <div style={{ border:`1px solid ${C}`, padding:"16px 20px", marginBottom:20, textAlign:"left" }}>
            <div style={{ fontSize:10, letterSpacing:4, marginBottom:10 }}>─ BRIEFING ─</div>
            {[
              "16 events drawn from finance, business & tech history",
              "Each event has 5 clues — they auto-reveal on a timer",
              "Drag the slider to your year guess",
              "Lock in early for a higher multiplier",
              "5× on clue 1 drops to 1× by clue 5 — then zero",
              "Score = accuracy × multiplier. 16 rounds, no second chances",
            ].map((txt, j) => (
              <div key={j} style={{ fontSize:11, lineHeight:2.2, display:"flex", gap:10 }}>
                <span style={{ opacity:0.4 }}>{String(j+1).padStart(2,"0")}</span><span>{txt}</span>
              </div>
            ))}
          </div>

          {/* Multiplier preview strip */}
          <div style={{ border:`1px solid ${C}20`, padding:"12px 16px", marginBottom:20, textAlign:"left" }}>
            <div style={{ fontSize:9, letterSpacing:4, opacity:0.5, marginBottom:10 }}>─ MULTIPLIER TABLE ─</div>
            <div style={{ display:"flex", gap:6 }}>
              {[5,4,3,2,1].map((m,i)=>(
                <div key={m} style={{ flex:1, textAlign:"center", padding:"8px 0", border:`1px solid ${MULT_COLORS[i]}40`, color:MULT_COLORS[i], fontSize:15, fontWeight:700 }}>{m}×</div>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, marginTop:4 }}>
              {["CL.1","CL.2","CL.3","CL.4","CL.5"].map((l,i)=>(
                <div key={i} style={{ flex:1, textAlign:"center", fontSize:8, letterSpacing:1, color:`${C}40` }}>{l}</div>
              ))}
            </div>
          </div>

          <button className="wyb" onClick={startGame} style={{ width:"100%", letterSpacing:8 }}>BEGIN</button>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${C}`, fontSize:9, letterSpacing:3, flexShrink:0 }}>
        <span style={{ cursor:"pointer", opacity:0.6 }} onClick={onBack} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.6}>← HOME</span>
        <span>WHAT YEAR? V1.0</span>
        <span>○ STANDBY</span>
      </div>
    </div>
  );

  // ── GAMEOVER ──────────────────────────────────────────────────────────────
  if (phase === "gameover") {
    const finalScore = scores.reduce((a,b)=>a+b,0);
    const perfect = scores.filter(s=>s===500).length;
    return (
      <div className="page-root" style={SHARED_STYLE}>
        <style>{GLOBAL_CSS}</style>
        <TopBar onLeaderboard={onLeaderboard} onBack={onBack} topPlayer={topPlayer} />

        <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"20px 16px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:520, animation:"revealV 0.25s ease" }}>

            <div style={{ fontSize:10, letterSpacing:6, marginBottom:16, color:C, textAlign:"center" }}>─ SESSION COMPLETE ─</div>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:56, fontWeight:700, letterSpacing:4, fontFeatureSettings:"'tnum'" }}>{finalScore.toLocaleString()}</div>
              <div style={{ fontSize:9, letterSpacing:5, opacity:0.5 }}>FINAL SCORE · {ROUNDS} ROUNDS{perfect > 0 ? ` · ${perfect} PERFECT` : ""}</div>
            </div>

            {/* Round score grid */}
            <div style={{ border:`1px solid ${C}20`, padding:"12px 16px", marginBottom:16 }}>
              <div style={{ fontSize:9, letterSpacing:4, opacity:0.5, marginBottom:10 }}>─ ROUND BREAKDOWN ─</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
                {scores.map((s,i)=>(
                  <div key={i} style={{ border:`1px solid ${s>0?C+40:"rgba(225,212,27,0.1)"}`, padding:"6px 0", textAlign:"center", fontSize:10, fontWeight:700, color:s===500?WIN:(s>0?C:`${C}30`) }}>
                    {s>0?s:"—"}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              <button className="wyb" onClick={startGame} style={{ letterSpacing:4, fontSize:11 }}>PLAY AGAIN</button>
              <button className="wyb" onClick={onLeaderboard} style={{ letterSpacing:4, fontSize:11 }}>LEADERBOARD</button>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${C}`, fontSize:9, letterSpacing:3, flexShrink:0 }}>
          <span style={{ cursor:"pointer", opacity:0.6 }} onClick={onBack} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.6}>← HOME</span>
          <span>WHAT YEAR? V1.0</span>
          <span>○ COMPLETE</span>
        </div>
      </div>
    );
  }

  // ── PLAYING / REVEAL ──────────────────────────────────────────────────────
  const isReveal  = phase === "reveal";
  const ev        = events[roundIdx];
  if (!ev) return null;

  const clueIdx   = Math.min(NUM_CLUES-1, Math.floor(elapsed/CLUE_SECS));
  const mult      = isReveal ? revealMult : (elapsed>=TOTAL_SECS?0:getMult(clueIdx));
  const multColor = MULT_COLORS[Math.min(4, clueIdx)];
  const barPct    = Math.max(0, 1 - elapsed/TOTAL_SECS);         // global bar 100→0%
  const subPct    = Math.max(0, 1-(elapsed%CLUE_SECS)/CLUE_SECS); // per-clue bar
  const timedOut  = elapsed >= TOTAL_SECS;
  const isWarn    = elapsed >= TOTAL_SECS - CLUE_SECS && !isReveal;
  const t         = getTier(streak);
  const ac        = t.color;

  const visibleClues = isReveal ? ev.clues : ev.clues.slice(0, clueIdx+1);
  const diff         = isReveal ? Math.abs(guess - ev.year) : null;

  return (
    <div className="page-root" style={SHARED_STYLE}>
      <style>{GLOBAL_CSS}</style>
      <TopBar onLeaderboard={onLeaderboard} onBack={onBack} topPlayer={topPlayer} />

      {/* Burning timer bar — full width, just below top bar */}
      <div style={{ height:3, background:`${C}15`, flexShrink:0 }}>
        <div style={{
          height:"100%",
          width:`${barPct*100}%`,
          background: isWarn ? ERR : C,
          transition:"width 0.08s linear",
          animation: isWarn && !isReveal ? "warn 0.55s ease-in-out infinite" : "none",
          boxShadow: isWarn ? `0 0 8px ${ERR}` : `0 0 6px ${C}60`,
        }} />
      </div>

      <div className="scroll-main" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"20px 16px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:560 }}>

          {/* HUD — SCORE / ROUND / STREAK */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:12, fontFeatureSettings:"'tnum'" }}>
            <div>
              <span>SCORE </span>
              <span style={{ fontWeight:700, fontSize:18, color:streak>=3?ac:C, transition:"color 0.3s" }}>{score}</span>
              {lastPts && <span style={{ fontSize:11, marginLeft:8, color:ac, animation:"fadeUp 1s ease forwards" }}>+{lastPts}</span>}
            </div>
            <div style={{ textAlign:"center" }}>
              <span style={{ opacity:0.5 }}>ROUND </span>
              <span style={{ fontWeight:700, fontSize:18 }}>{String(roundIdx+1).padStart(2,"0")}</span>
              <span style={{ opacity:0.3, fontSize:12 }}>/{ROUNDS}</span>
            </div>
            <div style={{ textAlign:"right" }}>
              <span>STREAK </span>
              <span style={{ fontWeight:700, fontSize:18, color:streak>=3?ac:C, textShadow:streak>=3?`0 0 12px ${ac}60`:"none", transition:"all 0.3s" }}>{streak}</span>
              {streak>=3 && <span style={{ fontSize:9, marginLeft:5, letterSpacing:3, color:ac, animation:"blink 1.5s step-end infinite" }}>{t.label}</span>}
            </div>
          </div>

          {/* Multiplier + clue dots row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, fontSize:10, letterSpacing:4 }}>
            <span style={{ opacity:0.5 }}>─ GUESS THE YEAR ─</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Clue dots */}
              <div style={{ display:"flex", gap:4 }}>
                {Array.from({length:NUM_CLUES}).map((_,i)=>{
                  const lit = i <= (isReveal ? NUM_CLUES-1 : clueIdx);
                  return <div key={i} style={{ width:6, height:6, borderRadius:1, background:lit?C:`${C}20`, transition:"background 0.2s" }} />;
                })}
              </div>
              {/* Multiplier badge */}
              {!isReveal && (
                <div key={`m${clueIdx}`} style={{
                  fontSize:13, fontWeight:700, letterSpacing:2,
                  color: timedOut ? `${C}20` : multColor,
                  animation:"multDrop 0.2s ease-out",
                  textShadow: !timedOut ? `0 0 16px ${multColor}60` : "none",
                  padding:"2px 6px", border:`1px solid ${timedOut?`${C}15`:multColor+"40"}`,
                }}>
                  {timedOut ? "0×" : `${mult}×`}
                </div>
              )}
              {/* Per-clue countdown + bar */}
              {!isReveal && (
                <div style={{ textAlign:"right", minWidth:32 }}>
                  <div style={{ height:2, background:`${C}15`, borderRadius:1, overflow:"hidden", marginBottom:2 }}>
                    <div style={{ height:"100%", width:`${subPct*100}%`, background:isWarn?ERR:C, transition:"width 0.08s linear" }} />
                  </div>
                  <div style={{ fontSize:8, letterSpacing:1, opacity:0.4 }}>
                    {Math.max(0,Math.ceil(CLUE_SECS-(elapsed%CLUE_SECS)))}s
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clue box */}
          <div style={{ border:`1px solid ${C}20`, padding:"18px 20px", marginBottom:12, minHeight:140, display:"flex", flexDirection:"column", gap:12 }}>
            {visibleClues.length === 0 && <div style={{ opacity:0.25, fontSize:11, letterSpacing:2 }}>LOADING CLUE...</div>}
            {visibleClues.map((clue, i) => {
              const isCurrent = !isReveal && i === clueIdx;
              return (
                <div key={`${roundIdx}-${i}`} style={{
                  fontSize:12, lineHeight:1.7, letterSpacing:0.2,
                  opacity: isReveal ? 1 : (isCurrent ? 1 : 0.38),
                  fontWeight: isCurrent ? 600 : 400,
                  color: C,
                  animation: i===clueIdx && !isReveal ? "clueSlide 0.3s ease-out" : "none",
                  borderLeft: isCurrent ? `2px solid ${C}` : "2px solid transparent",
                  paddingLeft:10,
                  transition:"opacity 0.3s",
                }}>
                  {clue}
                </div>
              );
            })}
          </div>

          {/* Reveal result panel */}
          {isReveal && (
            <div style={{ border:`1px solid ${revealScore>0?C:ERR}40`, padding:"16px 20px", marginBottom:12, animation:"revealV 0.25s ease" }}>
              <div style={{ fontSize:9, letterSpacing:5, opacity:0.5, marginBottom:12 }}>─ RESULT ─</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:9, letterSpacing:3, opacity:0.5, marginBottom:4 }}>CORRECT YEAR</div>
                  <div style={{ fontSize:36, fontWeight:700, letterSpacing:3, fontFeatureSettings:"'tnum'" }}>{ev.year}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:9, letterSpacing:3, opacity:0.5, marginBottom:4 }}>YOUR GUESS</div>
                  <div style={{ fontSize:28, fontWeight:700, letterSpacing:2, fontFeatureSettings:"'tnum'", opacity:0.75 }}>{guess}</div>
                </div>
              </div>
              <div style={{ height:1, background:`${C}15`, marginBottom:10 }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:10, letterSpacing:2, opacity:0.5 }}>
                  {diff===0 ? "EXACT YEAR!" : `OFF BY ${diff} YEAR${diff!==1?"S":""}`}
                  {revealMult > 0 && ` · ${revealMult}× MULTIPLIER`}
                </div>
                <div style={{ fontSize:22, fontWeight:700, color:revealScore>0?(diff===0?WIN:C):`${C}30`, textShadow:revealScore>0?`0 0 16px ${diff===0?WIN:C}60`:"none" }}>
                  {revealScore>0?`+${revealScore}`:"NO SCORE"}
                </div>
              </div>
            </div>
          )}

          {/* Year slider */}
          <div style={{ border:`1px solid ${C}20`, padding:"16px 20px 12px", marginBottom:12 }}>
            <div style={{ textAlign:"center", marginBottom:8 }}>
              <span style={{ fontSize:40, fontWeight:700, letterSpacing:4, fontFeatureSettings:"'tnum'", color:isReveal?`${C}40`:C, transition:"color 0.3s" }}>{guess}</span>
            </div>
            <YearSlider value={guess} onChange={(v)=>{ setGuess(v); guessRef.current=v; }} disabled={isReveal} />
          </div>

          {/* Lock-in button */}
          {!isReveal && (
            <button
              onClick={handleLockIn}
              disabled={timedOut}
              style={{
                width:"100%", padding:"16px 0", marginBottom:8,
                background:"transparent",
                border:`1px solid ${timedOut?`${C}20`:C}`,
                color: timedOut?`${C}20`:C,
                fontFamily:"'IBM Plex Mono',monospace",
                fontSize:13, fontWeight:600, letterSpacing:6,
                cursor: timedOut?"default":"pointer",
                transition:"all 0.12s",
              }}
              onMouseEnter={e=>{ if(!timedOut){ e.target.style.background=C; e.target.style.color=BG; } }}
              onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.color=timedOut?`${C}20`:C; }}
            >
              {timedOut ? "TIME'S UP" : `LOCK IN  ${mult}×`}
            </button>
          )}

          {/* Next button during reveal */}
          {isReveal && (
            <button className="wyb-dim" onClick={nextRound} style={{ width:"100%", marginBottom:8 }}>
              {roundIdx+1>=ROUNDS ? "SEE RESULTS →" : "NEXT ROUND →"}
            </button>
          )}

          {/* Progress bar */}
          <div style={{ height:2, background:`${C}12`, marginTop:4 }}>
            <div style={{ height:"100%", width:`${((roundIdx+(isReveal?1:0))/ROUNDS)*100}%`, background:streak>=3?ac:C, transition:"all 0.5s", boxShadow:streak>=3?`0 0 8px ${ac}60`:"none" }} />
          </div>

        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${C}`, fontSize:9, letterSpacing:3, flexShrink:0 }}>
        <span style={{ cursor:"pointer", opacity:0.6 }} onClick={onBack} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.6}>← HOME</span>
        <span>WHAT YEAR? V1.0</span>
        <span>{isReveal?"○ RESULT":"● ACTIVE"}</span>
      </div>
    </div>
  );
}
