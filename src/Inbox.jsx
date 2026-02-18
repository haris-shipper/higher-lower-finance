import { useState, useEffect, useCallback, useRef } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { MESSAGES, TIER_TIME, BUCKETS } from "./inboxData.js";

const BG = "#141413";
const C = "#EC49D3";
const ERR = "#FF2D2D";

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

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

// Highlight signal words in message text
function HighlightText({ text, signals, color }) {
  let parts = [text];
  for (const sig of (signals || [])) {
    const escaped = sig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    parts = parts.flatMap(part => {
      if (typeof part !== "string") return [part];
      return part.split(regex).map((p, i) =>
        i % 2 === 1 ? <span key={`${sig}-${i}`} style={{ color, fontWeight: 700 }}>{p}</span> : p
      );
    });
  }
  return <>{parts}</>;
}

export default function Inbox({ onBack }) {
  const [phase, setPhase] = useState("menu");   // menu | playing | dead | debrief
  const [msgIdx, setMsgIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [maxTime, setMaxTime] = useState(15);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [mult, setMult] = useState(1);
  const [history, setHistory] = useState([]);   // { message, playerBucket, correct }
  const [wrongBucket, setWrongBucket] = useState(null);
  const [stamp, setStamp] = useState(null);
  const [lastPts, setLastPts] = useState(null);
  const [, setTick] = useState(0);

  // Refs hold volatile values safe to read in callbacks without stale closures
  const R = useRef({ messages: [], idx: 0, phase: "menu", tl: 15, ml: 15, streak: 0, mult: 1 });

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  // Timer — self-scheduling setTimeout, decrement 10× per second
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      if (R.current.phase !== "playing") return;
      R.current.phase = "dead";
      const msg = R.current.messages[R.current.idx];
      setHistory(h => [...h, { message: msg, playerBucket: null, correct: false }]);
      setWrongBucket("__timeout__");
      setPhase("dead");
      return;
    }
    const id = setTimeout(() => {
      const next = Math.max(0, +(timeLeft - 0.1).toFixed(1));
      R.current.tl = next;
      setTimeLeft(next);
    }, 100);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  const startSession = useCallback(() => {
    const ordered = [
      ...shuf(MESSAGES.filter(m => m.tier === 1)),
      ...shuf(MESSAGES.filter(m => m.tier === 2)),
      ...shuf(MESSAGES.filter(m => m.tier === 3)),
      ...shuf(MESSAGES.filter(m => m.tier === 4)),
      ...shuf(MESSAGES.filter(m => m.tier === 5)),
    ];
    const t = TIER_TIME[ordered[0].tier];
    R.current = { messages: ordered, idx: 0, phase: "playing", tl: t, ml: t, streak: 0, mult: 1 };
    setMsgIdx(0);
    setStreak(0);
    setScore(0);
    setMult(1);
    setHistory([]);
    setWrongBucket(null);
    setLastPts(null);
    setMaxTime(t);
    setTimeLeft(t);
    setPhase("playing");
  }, []);

  const pickBucket = useCallback((bucket) => {
    if (R.current.phase !== "playing") return;
    R.current.phase = "transitioning";

    const msg = R.current.messages[R.current.idx];
    const tl = R.current.tl;
    const ml = R.current.ml;
    const correct = bucket === msg.bucket;

    if (correct) {
      const newStreak = R.current.streak + 1;
      const newMult = Math.min(Math.floor(newStreak / 3) + 1, 5);
      const speedBonus = Math.floor((tl / ml) * 100);
      const pts = (100 + speedBonus) * newMult;
      R.current.streak = newStreak;
      R.current.mult = newMult;

      setHistory(h => [...h, { message: msg, playerBucket: bucket, correct: true }]);
      setStreak(newStreak);
      setMult(newMult);
      setScore(s => s + pts);
      setLastPts(pts);

      if (newStreak >= 3 && newStreak % 3 === 0) {
        setStamp(newMult + "x");
        setTimeout(() => setStamp(null), 1200);
      }

      const nextIdx = R.current.idx + 1;
      if (nextIdx < R.current.messages.length) {
        const nextMsg = R.current.messages[nextIdx];
        const t = TIER_TIME[nextMsg.tier];
        R.current.idx = nextIdx;
        R.current.tl = t;
        R.current.ml = t;
        R.current.phase = "playing";
        setMsgIdx(nextIdx);
        setMaxTime(t);
        setTimeLeft(t);
        setPhase(p => p); // keep "playing", force re-render to restart timer
        // need a fresh phase cycle — toggle off then on
        setPhase("__next__");
        setTimeout(() => setPhase("playing"), 0);
      } else {
        R.current.phase = "debrief";
        setPhase("debrief");
      }
    } else {
      setHistory(h => [...h, { message: msg, playerBucket: bucket, correct: false }]);
      setWrongBucket(bucket);
      R.current.phase = "dead";
      setPhase("dead");
    }
  }, []);

  const t = getTier(streak);
  const ac = t.color;
  const currentMsg = R.current.messages[msgIdx] || null;
  const timerPct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
  const nearEnd = timeLeft <= 3 && timeLeft > 0;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes stampIn{0%{opacity:0;transform:translate(-50%,-50%) scale(5)}30%{opacity:1;transform:translate(-50%,-50%) scale(0.95)}100%{transform:translate(-50%,-50%) scale(1)}}
        @keyframes stampOut{from{opacity:1}to{opacity:0;transform:translate(-50%,-50%) scale(0.85) translateY(-10px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}
        @keyframes revealIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .ib{font-family:'IBM Plex Mono',monospace;font-weight:600;letter-spacing:0.12em;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
        .ib:hover{background:${C};color:${BG};}
        .ib:active{transform:scale(0.96);}
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
            return <span key={label}>{label} <span style={{ color: open ? "#2DFF72" : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
          })}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: (phase === "dead" || phase === "debrief") ? "flex-start" : "center", padding: "20px 16px", overflowY: "auto", position: "relative" }}>

        {/* Multiplier stamp */}
        {stamp && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 80, fontWeight: 700, color: ac, textShadow: `0 0 60px ${ac}80`, animation: "stampIn 0.2s ease forwards, stampOut 0.3s ease 0.9s forwards", pointerEvents: "none", zIndex: 30, letterSpacing: 8 }}>{stamp}</div>
        )}

        {/* ── MENU ── */}
        {phase === "menu" && (
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <PixelDisplay color={C} text="INBOX" shape="triangle" style={{ marginBottom: 28 }} />
            <div style={{ border: `1px solid ${C}`, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>─ BRIEFING ─</div>
              {[
                "A message arrives. Read it fast.",
                "Tap the correct ICP bucket to advance",
                "One wrong answer ends the run",
                "Timer tightens with every message",
                "Speed and streaks multiply your score",
                "Death screen explains what you missed",
              ].map((txt, j) => (
                <div key={j} style={{ fontSize: 11, lineHeight: 2.2, display: "flex", gap: 10 }}>
                  <span>{String(j + 1).padStart(2, "0")}</span><span>{txt}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 20 }}>
              {BUCKETS.slice(0, 3).map(b => <div key={b.key} style={{ border: `1px solid ${C}30`, padding: "6px 4px", fontSize: 8, letterSpacing: 2, textAlign: "center", opacity: 0.5 }}>{b.label}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 20 }}>
              {BUCKETS.slice(3).map(b => <div key={b.key} style={{ border: `1px solid ${C}30`, padding: "6px 4px", fontSize: 8, letterSpacing: 2, textAlign: "center", opacity: 0.5 }}>{b.label}</div>)}
            </div>
            <button className="ib" onClick={startSession} style={{ width: "100%", letterSpacing: 8, padding: "16px 0", fontSize: 13 }}>INITIATE</button>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && currentMsg && (
          <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 0 }}>

            {/* HUD */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12, fontFeatureSettings: "'tnum'" }}>
              <div>
                <span>SCORE </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: streak >= 3 ? ac : C, transition: "color 0.3s" }}>{score}</span>
                {lastPts && <span style={{ fontSize: 11, marginLeft: 8, color: ac, animation: "fadeUp 1s ease forwards" }}>+{lastPts}</span>}
              </div>
              <div>
                <span>STREAK </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: streak >= 3 ? ac : C, textShadow: streak >= 3 ? `0 0 12px ${ac}60` : "none", transition: "all 0.3s" }}>{streak}</span>
                {streak >= 3 && <span style={{ fontSize: 9, marginLeft: 6, letterSpacing: 3, color: ac, animation: "blink 1.5s step-end infinite" }}>{t.label}</span>}
              </div>
              <div>
                <span>MULTI </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: mult > 1 ? ac : C }}>{mult}x</span>
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ height: 2, background: `${C}20`, marginBottom: 16 }}>
              <div style={{
                height: "100%",
                width: `${timerPct}%`,
                background: nearEnd ? ERR : ac,
                transition: "width 0.1s linear, background 0.3s",
                animation: nearEnd ? "timerPulse 0.5s step-end infinite" : "none",
              }} />
            </div>

            {/* Message label */}
            <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 12, display: "flex", justifyContent: "space-between", opacity: 0.5 }}>
              <span>─ INCOMING ─</span>
              <span style={{ fontFeatureSettings: "'tnum'" }}>MSG {String(msgIdx + 1).padStart(2, "0")} · TIER {currentMsg.tier}</span>
            </div>

            {/* Message text */}
            <div style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24, padding: "20px", border: `1px solid ${C}30`, minHeight: 100 }}>
              {currentMsg.text}
            </div>

            {/* Bucket buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 4 }}>
              {BUCKETS.slice(0, 3).map(b => (
                <button key={b.key} className="ib" onClick={() => pickBucket(b.key)} style={{ padding: "14px 4px", fontSize: 10, letterSpacing: 2 }}>{b.label}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {BUCKETS.slice(3).map(b => (
                <button key={b.key} className="ib" onClick={() => pickBucket(b.key)} style={{ padding: "14px 4px", fontSize: 10, letterSpacing: 2 }}>{b.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── DEAD ── */}
        {phase === "dead" && currentMsg && (
          <div style={{ width: "100%", maxWidth: 600, animation: "revealIn 0.2s ease" }}>
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 16, color: ERR, textAlign: "center" }}>─ TERMINATED ─</div>

            {/* Score */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: 4, fontFeatureSettings: "'tnum'" }}>{score}</div>
              <div style={{ fontSize: 9, letterSpacing: 5, opacity: 0.5 }}>TOTAL SCORE · {msgIdx + 1} MESSAGE{msgIdx !== 0 ? "S" : ""}</div>
            </div>

            {/* Message with signals highlighted */}
            <div style={{ fontSize: 13, lineHeight: 1.9, padding: "16px", border: `1px solid ${ERR}40`, marginBottom: 12 }}>
              {wrongBucket === "__timeout__"
                ? <span style={{ opacity: 0.5, fontStyle: "italic" }}>Time ran out.</span>
                : <HighlightText text={currentMsg.text} signals={currentMsg.signals} color={C} />
              }
            </div>

            {/* Bucket verdict */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 4 }}>
              {BUCKETS.slice(0, 3).map(b => {
                const isCorrect = b.key === currentMsg.bucket;
                const isWrong = b.key === wrongBucket;
                return (
                  <div key={b.key} style={{
                    padding: "10px 4px", fontSize: 9, letterSpacing: 2, textAlign: "center",
                    border: `1px solid ${isCorrect ? C : isWrong ? ERR : `${C}15`}`,
                    background: isCorrect ? C : "transparent",
                    color: isCorrect ? BG : isWrong ? ERR : `${C}30`,
                    textDecoration: isWrong && !isCorrect ? "line-through" : "none",
                    fontWeight: isCorrect ? 700 : 400,
                  }}>{b.label}</div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 16 }}>
              {BUCKETS.slice(3).map(b => {
                const isCorrect = b.key === currentMsg.bucket;
                const isWrong = b.key === wrongBucket;
                return (
                  <div key={b.key} style={{
                    padding: "10px 4px", fontSize: 9, letterSpacing: 2, textAlign: "center",
                    border: `1px solid ${isCorrect ? C : isWrong ? ERR : `${C}15`}`,
                    background: isCorrect ? C : "transparent",
                    color: isCorrect ? BG : isWrong ? ERR : `${C}30`,
                    textDecoration: isWrong && !isCorrect ? "line-through" : "none",
                    fontWeight: isCorrect ? 700 : 400,
                  }}>{b.label}</div>
                );
              })}
            </div>

            {/* Signal words callout */}
            {currentMsg.signals?.length > 0 && wrongBucket !== "__timeout__" && (
              <div style={{ fontSize: 9, letterSpacing: 2, marginBottom: 8, opacity: 0.5 }}>
                SIGNAL WORDS: {currentMsg.signals.map((s, i) => <span key={i} style={{ color: C, fontWeight: 700 }}>{i > 0 ? " · " : ""}{s.toUpperCase()}</span>)}
              </div>
            )}

            {/* Explanation */}
            <div style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 20, padding: "12px 14px", border: `1px solid ${C}25` }}>
              {currentMsg.explanation}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button className="ib" onClick={startSession} style={{ padding: "14px 0", fontSize: 11, letterSpacing: 4 }}>PLAY AGAIN</button>
              <button className="ib" onClick={() => setPhase("debrief")} style={{ padding: "14px 0", fontSize: 11, letterSpacing: 4 }}>DEBRIEF</button>
            </div>
          </div>
        )}

        {/* ── DEBRIEF ── */}
        {phase === "debrief" && (
          <div style={{ width: "100%", maxWidth: 600 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 4, textAlign: "center" }}>─ FULL RUN DEBRIEF ─</div>
            <div style={{ fontSize: 9, letterSpacing: 3, marginBottom: 20, textAlign: "center", opacity: 0.4 }}>{history.length} MESSAGE{history.length !== 1 ? "S" : ""} · SCORE {score}</div>

            {history.map((entry, i) => {
              const isDeath = !entry.correct;
              const correctBucket = BUCKETS.find(b => b.key === entry.message.bucket);
              return (
                <div key={i} style={{ marginBottom: isDeath ? 16 : 3 }}>
                  {isDeath ? (
                    <div style={{ border: `1px solid ${ERR}50`, padding: "14px", animation: "revealIn 0.3s ease" }}>
                      <div style={{ fontSize: 8, letterSpacing: 4, color: ERR, marginBottom: 10 }}>✗ FAILED — MSG {String(i + 1).padStart(2, "0")}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 12 }}>
                        <HighlightText text={entry.message.text} signals={entry.message.signals} color={C} />
                      </div>
                      <div style={{ fontSize: 9, letterSpacing: 2, marginBottom: 8, opacity: 0.5 }}>
                        SIGNALS: {entry.message.signals?.map((s, si) => <span key={si} style={{ color: C, fontWeight: 700 }}>{si > 0 ? " · " : ""}{s.toUpperCase()}</span>)}
                      </div>
                      <div style={{ fontSize: 10, lineHeight: 1.7, marginBottom: 10, opacity: 0.65 }}>{entry.message.explanation}</div>
                      <div style={{ fontSize: 9, letterSpacing: 2 }}>CORRECT: <span style={{ color: C, fontWeight: 700 }}>{correctBucket?.label}</span></div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, padding: "5px 0", borderBottom: `1px solid ${C}10`, gap: 12 }}>
                      <span style={{ opacity: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{entry.message.text}</span>
                      <span style={{ color: C, flexShrink: 0, letterSpacing: 2 }}>✓ {correctBucket?.label}</span>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 16 }}>
              <button className="ib" onClick={startSession} style={{ padding: "14px 0", fontSize: 11, letterSpacing: 4 }}>PLAY AGAIN</button>
              <button className="ib" onClick={onBack} style={{ padding: "14px 0", fontSize: 11, letterSpacing: 4 }}>← HOME</button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
        <span>INBOX V1.0</span>
        <span>{phase === "playing" ? "● ACTIVE" : "○ STANDBY"}</span>
      </div>
    </div>
  );
}
