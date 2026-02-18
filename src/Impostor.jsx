import { useState, useEffect, useCallback, useRef } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { ROUNDS } from "./impostorData.js";
import { submitScore } from "./supabase.js";

const BG = "#141413";
const C = "#48D7FF";
const ERR = "#FF2D2D";
const WIN = "#2DFF72";

// Exact same tier system as every other game
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

function HighlightTerm({ text, term, color }) {
  if (!term) return <span>{text}</span>;
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return (
    <span>
      {parts.map((p, i) =>
        re.test(p)
          ? <span key={i} style={{ color, fontWeight: 700 }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

export default function Impostor({ onBack, username }) {
  const [phase, setPhase] = useState("menu");
  const [rounds, setRounds] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [sentenceOrder, setSentenceOrder] = useState([0, 1, 2, 3]);
  const [selected, setSelected] = useState(null);      // display index of clicked card
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [cmb, setCmb] = useState(1);
  const [stamp, setStamp] = useState(null);
  const [lastPts, setLastPts] = useState(null);
  const [history, setHistory] = useState([]);           // { round, sentenceOrder, selectedDisplayIdx, correct }
  const [, setTick] = useState(0);
  const tmr = useRef(null);
  const scoreSubmitted = useRef(false);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => () => { if (tmr.current) clearTimeout(tmr.current); }, []);

  const currentRound = rounds[roundIdx];
  const t = getTier(streak);
  const ac = t.color;

  useEffect(() => {
    if ((phase !== "dead" && phase !== "debrief") || scoreSubmitted.current) return;
    scoreSubmitted.current = true;
    if (username) submitScore(username, "impostor", score);
  }, [phase, score, username]);

  function startGame() {
    scoreSubmitted.current = false;
    const pool = shuf([...ROUNDS]).slice(0, 40);
    setRounds(pool);
    setRoundIdx(0);
    setSentenceOrder(shuf([0, 1, 2, 3]));
    setSelected(null);
    setStreak(0);
    setScore(0);
    setCmb(1);
    setStamp(null);
    setLastPts(null);
    setHistory([]);
    setPhase("playing");
  }

  const pick = useCallback((displayIdx) => {
    if (phase !== "playing" || selected !== null) return;
    const sentIdx = sentenceOrder[displayIdx];
    const s = currentRound.sentences[sentIdx];
    setSelected(displayIdx);

    if (s.isImpostor) {
      const newStreak = streak + 1;
      const newMult = Math.min(Math.floor(newStreak / 3) + 1, 5);
      const pts = 100 * cmb;
      setStreak(newStreak);
      setCmb(newMult);
      setScore(sc => sc + pts);
      setLastPts(pts);
      if (newStreak >= 3 && newStreak % 3 === 0) {
        setStamp(newMult + "x");
        tmr.current = setTimeout(() => setStamp(null), 1200);
      }
      setHistory(h => [...h, { round: currentRound, sentenceOrder, selectedDisplayIdx: displayIdx, correct: true }]);

      tmr.current = setTimeout(() => {
        setSelected(null);
        setLastPts(null);
        setRoundIdx(prev => {
          const next = prev + 1;
          if (next >= rounds.length) { setPhase("debrief"); return prev; }
          setSentenceOrder(shuf([0, 1, 2, 3]));
          return next;
        });
      }, 1200);
    } else {
      setStreak(0);
      setCmb(1);
      setHistory(h => [...h, { round: currentRound, sentenceOrder, selectedDisplayIdx: displayIdx, correct: false }]);
      tmr.current = setTimeout(() => setPhase("dead"), 350);
    }
  }, [phase, selected, sentenceOrder, currentRound, streak, cmb, rounds.length]);

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          .xb{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;letter-spacing:0.15em;padding:16px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
          .xb:hover{background:${C};color:${BG};}
          .xb:active{transform:scale(0.96);}
        `}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-start" }}>
            {[["STOCKHOLM", "Europe/Stockholm"], ["DUBLIN", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
              <span key={label}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>QUARTR LABS GAME STUDIO</div>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
            {[
              { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
              { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
              { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
            ].map(({ label, tz, oh, om, ch, cm }) => {
              const open = isMktOpen(tz, oh, om, ch, cm);
              return <span key={label}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <PixelDisplay color={C} text="IMPOSTOR" shape="decagon" style={{ marginBottom: 28 }} />
            <div style={{ border: `1px solid ${C}`, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>─ BRIEFING ─</div>
              {[
                "Four sentences, each using a finance term",
                "Three use the term correctly. One does not.",
                "Tap the sentence where the term is wrong",
                "No timer — read carefully, think clearly",
                "Correct streaks unlock score multipliers",
                "One wrong answer ends the session",
              ].map((txt, j) => (
                <div key={j} style={{ fontSize: 11, lineHeight: 2.2, display: "flex", gap: 10 }}>
                  <span>{String(j + 1).padStart(2, "0")}</span><span>{txt}</span>
                </div>
              ))}
            </div>
            <button className="xb" onClick={startGame} style={{ width: "100%", letterSpacing: 8 }}>INITIATE</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
          <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
          <span>IMPOSTOR V1.0</span>
          <span>○ STANDBY</span>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (phase === "playing" && currentRound) {
    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes fadeUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}
          @keyframes stampIn{0%{opacity:0;transform:translate(-50%,-50%) scale(5)}30%{opacity:1;transform:translate(-50%,-50%) scale(0.95)}100%{transform:translate(-50%,-50%) scale(1)}}
          @keyframes stampOut{from{opacity:1}to{opacity:0;transform:translate(-50%,-50%) scale(0.85) translateY(-10px)}}
          @keyframes revealV{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-start" }}>
            {[["STOCKHOLM", "Europe/Stockholm"], ["DUBLIN", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
              <span key={label}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>QUARTR LABS GAME STUDIO</div>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
            {[
              { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
              { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
              { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
            ].map(({ label, tz, oh, om, ch, cm }) => {
              const open = isMktOpen(tz, oh, om, ch, cm);
              return <span key={label}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", position: "relative" }}>

          {stamp && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 80, fontWeight: 700, color: ac, textShadow: `0 0 60px ${ac}80, 0 0 120px ${ac}30`, animation: "stampIn 0.2s ease forwards, stampOut 0.3s ease 0.9s forwards", pointerEvents: "none", zIndex: 30, letterSpacing: 8 }}>{stamp}</div>
          )}

          <div style={{ width: "100%", maxWidth: 600 }}>

            {/* HUD — exact same layout as other games */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 12, fontFeatureSettings: "'tnum'" }}>
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
                <span style={{ fontWeight: 700, fontSize: 18, color: cmb > 1 ? ac : C }}>{cmb}x</span>
              </div>
            </div>

            {/* Round label + counter */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 10, letterSpacing: 4 }}>
              <span>─ SPOT THE IMPOSTOR ─</span>
              <span style={{ fontFeatureSettings: "'tnum'", opacity: 0.5 }}>{String(roundIdx + 1).padStart(2, "0")}/{String(rounds.length).padStart(2, "0")}</span>
            </div>

            {/* 2×2 sentence card grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {sentenceOrder.map((sentIdx, displayIdx) => {
                const s = currentRound.sentences[sentIdx];
                let borderColor = `${C}20`;
                let termColor = C;

                if (selected !== null) {
                  if (displayIdx === selected) {
                    const wasCorrect = s.isImpostor;
                    borderColor = wasCorrect ? WIN : ERR;
                    termColor = wasCorrect ? WIN : ERR;
                  }
                }

                return (
                  <div
                    key={displayIdx}
                    onClick={() => pick(displayIdx)}
                    style={{
                      border: `1px solid ${borderColor}`,
                      padding: "20px 18px",
                      cursor: selected === null ? "pointer" : "default",
                      fontSize: 12,
                      lineHeight: 1.8,
                      letterSpacing: 0.2,
                      transition: "border-color 0.15s ease",
                      minHeight: 110,
                    }}
                    onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = `${C}70`; }}
                    onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = `${C}20`; }}
                  >
                    <HighlightTerm text={s.text} term={s.term} color={termColor} />
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: `${C}15`, marginTop: 6 }}>
              <div style={{ height: "100%", width: `${((roundIdx + (selected !== null ? 1 : 0)) / rounds.length) * 100}%`, background: streak >= 3 ? ac : C, transition: "all 0.5s", boxShadow: streak >= 3 ? `0 0 8px ${ac}60` : "none" }} />
            </div>

          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
          <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
          <span>IMPOSTOR V1.0</span>
          <span>● ACTIVE</span>
        </div>
      </div>
    );
  }

  // ── DEAD ──────────────────────────────────────────────────────────────────
  if (phase === "dead" && currentRound) {
    const lastEntry = history[history.length - 1];
    const wrongDisplayIdx = lastEntry?.selectedDisplayIdx;
    const impostorSentence = currentRound.sentences.find(s => s.isImpostor);

    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes revealV{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
          .xb{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.12em;padding:14px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
          .xb:hover{background:${C};color:${BG};}
          .xb:active{transform:scale(0.96);}
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-start" }}>
            {[["STOCKHOLM", "Europe/Stockholm"], ["DUBLIN", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
              <span key={label}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>QUARTR LABS GAME STUDIO</div>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
            {[
              { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
              { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
              { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
            ].map(({ label, tz, oh, om, ch, cm }) => {
              const open = isMktOpen(tz, oh, om, ch, cm);
              return <span key={label}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "20px 16px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 600, animation: "revealV 0.2s ease" }}>

            {/* Score */}
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 16, color: ERR, textAlign: "center" }}>─ TERMINATED ─</div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: 4, fontFeatureSettings: "'tnum'" }}>{score}</div>
              <div style={{ fontSize: 9, letterSpacing: 5, opacity: 0.5 }}>TOTAL SCORE · {roundIdx + 1} ROUND{roundIdx !== 0 ? "S" : ""}</div>
            </div>

            {/* 4 cards — outline only, no fill */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              {sentenceOrder.map((sentIdx, displayIdx) => {
                const s = currentRound.sentences[sentIdx];
                const isPlayerPick = displayIdx === wrongDisplayIdx;
                const isRealImpostor = s.isImpostor;

                let borderColor = `${C}15`;
                let termColor = `${C}40`;

                if (isPlayerPick && !isRealImpostor) {
                  borderColor = ERR;
                  termColor = ERR;
                } else if (isRealImpostor) {
                  borderColor = `${C}60`;
                  termColor = C;
                }

                return (
                  <div key={displayIdx} style={{ border: `1px solid ${borderColor}`, padding: "16px 16px", fontSize: 11, lineHeight: 1.8, letterSpacing: 0.2, transition: "none" }}>
                    <HighlightTerm text={s.text} term={s.term} color={termColor} />
                    {isPlayerPick && !isRealImpostor && (
                      <div style={{ marginTop: 8, fontSize: 9, letterSpacing: 3, color: ERR }}>← YOU ACCUSED THIS</div>
                    )}
                    {isRealImpostor && (
                      <div style={{ marginTop: 8, fontSize: 9, letterSpacing: 3, color: C }}>← THE IMPOSTOR</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation — same as H/L debrief panel */}
            <div style={{ border: `1px solid ${ERR}`, padding: "18px 20px", marginBottom: 16, animation: "revealV 0.25s ease" }}>
              <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 14, color: ERR }}>─ DEBRIEF ─</div>
              <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.45, marginBottom: 5 }}>WHY IT'S WRONG</div>
              <div style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 14 }}>{impostorSentence?.reason}</div>
              {impostorSentence?.fix && (
                <>
                  <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.45, marginBottom: 5 }}>CORRECT VERSION</div>
                  <div style={{ fontSize: 11, lineHeight: 1.8, color: WIN }}>{impostorSentence.fix}</div>
                </>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button className="xb" onClick={startGame} style={{ letterSpacing: 4, fontSize: 11 }}>PLAY AGAIN</button>
              <button className="xb" onClick={() => setPhase("debrief")} style={{ letterSpacing: 4, fontSize: 11 }}>DEBRIEF</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
          <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
          <span>IMPOSTOR V1.0</span>
          <span>○ STANDBY</span>
        </div>
      </div>
    );
  }

  // ── DEBRIEF ───────────────────────────────────────────────────────────────
  if (phase === "debrief") {
    const correctCount = history.filter(h => h.correct).length;

    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes revealV{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
          .xb{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.12em;padding:14px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
          .xb:hover{background:${C};color:${BG};}
          .xb:active{transform:scale(0.96);}
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2 }}>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-start" }}>
            {[["STOCKHOLM", "Europe/Stockholm"], ["DUBLIN", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
              <span key={label}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>QUARTR LABS GAME STUDIO</div>
          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
            {[
              { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
              { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
              { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
            ].map(({ label, tz, oh, om, ch, cm }) => {
              const open = isMktOpen(tz, oh, om, ch, cm);
              return <span key={label}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>;
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "20px 16px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 600 }}>

            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 4, textAlign: "center" }}>─ FULL RUN DEBRIEF ─</div>
            <div style={{ fontSize: 9, letterSpacing: 3, marginBottom: 20, textAlign: "center", opacity: 0.4 }}>
              {history.length} ROUND{history.length !== 1 ? "S" : ""} · SCORE {score} · {correctCount} CORRECT
            </div>

            {history.map((entry, hi) => {
              const { round, sentenceOrder: so, selectedDisplayIdx, correct: wasCorrect } = entry;
              const impostorSentence = round.sentences.find(s => s.isImpostor);
              const isDeath = !wasCorrect;

              if (isDeath) {
                return (
                  <div key={hi} style={{ border: `1px solid ${ERR}50`, padding: "14px", marginBottom: 16, animation: "revealV 0.3s ease" }}>
                    <div style={{ fontSize: 8, letterSpacing: 4, color: ERR, marginBottom: 10 }}>✗ WRONG — ROUND {String(hi + 1).padStart(2, "0")}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 10 }}>
                      {so.map((sentIdx, displayIdx) => {
                        const s = round.sentences[sentIdx];
                        const isPlayerPick = displayIdx === selectedDisplayIdx;
                        const isRealImpostor = s.isImpostor;
                        let borderColor = `${C}12`;
                        let termColor = `${C}35`;
                        if (isPlayerPick && !isRealImpostor) { borderColor = ERR + "80"; termColor = ERR; }
                        else if (isRealImpostor) { borderColor = `${C}50`; termColor = C; }
                        return (
                          <div key={displayIdx} style={{ border: `1px solid ${borderColor}`, padding: "10px 12px", fontSize: 10, lineHeight: 1.7, letterSpacing: 0.2 }}>
                            <HighlightTerm text={s.text} term={s.term} color={termColor} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: 2, marginBottom: 6, opacity: 0.45 }}>WHY IT'S WRONG</div>
                    <div style={{ fontSize: 10, lineHeight: 1.7, marginBottom: 8, opacity: 0.75 }}>{impostorSentence?.reason}</div>
                    <div style={{ fontSize: 9, letterSpacing: 2 }}>CORRECT: <span style={{ color: C, fontWeight: 700 }}>{impostorSentence?.fix}</span></div>
                  </div>
                );
              }

              // Correct — compact row, like Inbox debrief
              return (
                <div key={hi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, padding: "5px 0", borderBottom: `1px solid ${C}10`, gap: 12 }}>
                  <span style={{ opacity: 0.35, fontFeatureSettings: "'tnum'" }}>{String(hi + 1).padStart(2, "0")}</span>
                  <span style={{ opacity: 0.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {impostorSentence?.term}
                  </span>
                  <span style={{ color: C, flexShrink: 0, letterSpacing: 2 }}>✓</span>
                </div>
              );
            })}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 16 }}>
              <button className="xb" onClick={startGame} style={{ letterSpacing: 4, fontSize: 11 }}>PLAY AGAIN</button>
              <button className="xb" onClick={onBack} style={{ letterSpacing: 4, fontSize: 11 }}>← HOME</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
          <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
          <span>IMPOSTOR V1.0</span>
          <span>○ STANDBY</span>
        </div>
      </div>
    );
  }

  return null;
}
