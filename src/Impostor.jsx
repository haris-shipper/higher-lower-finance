import { useState, useEffect } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { ROUNDS } from "./impostorData.js";

const BG = "#141413";
const C = "#48D7FF";
const ERR = "#FF2D2D";
const WIN = "#2DFF72";
const CARD_BG = "#1A1A18";

const TIERS = [
  { min: 0,  mult: 1,  color: C },
  { min: 3,  mult: 2,  color: "#FFD166" },
  { min: 5,  mult: 4,  color: "#FF972D" },
  { min: 8,  mult: 8,  color: "#FF6B6B" },
  { min: 10, mult: 16, color: "#C44BFF" },
  { min: 13, mult: 32, color: "#FF2D2D" },
];
const getTier = (combo) => [...TIERS].reverse().find(t => combo >= t.min) || TIERS[0];

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function HighlightTerm({ text, term, color }) {
  if (!term) return <span>{text}</span>;
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return (
    <span>
      {parts.map((p, i) =>
        re.test(p) ? <span key={i} style={{ color, fontWeight: 700 }}>{p}</span> : <span key={i}>{p}</span>
      )}
    </span>
  );
}

function TopBar({ tick }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0, fontSize: 9, letterSpacing: 2, color: C }}>
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
            <span key={label}>{label} <span style={{ color: open ? WIN : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>
          );
        })}
      </div>
    </div>
  );
}

function BottomBar({ onBack }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0, color: C }}>
      <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={onBack}>← HOME</span>
      <span>QUARTR LABS GAMES</span>
      <span>○ IMPOSTOR</span>
    </div>
  );
}

export default function Impostor({ onBack }) {
  const [phase, setPhase] = useState("menu");
  const [rounds, setRounds] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [sentenceOrder, setSentenceOrder] = useState([0, 1, 2, 3]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stampKey, setStampKey] = useState(0);
  const [history, setHistory] = useState([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const currentRound = rounds[roundIdx];
  const tier = getTier(combo);

  function startGame() {
    const pool = shuffle([...ROUNDS]).slice(0, 40);
    setRounds(pool);
    setRoundIdx(0);
    setSentenceOrder(shuffle([0, 1, 2, 3]));
    setSelected(null);
    setScore(0);
    setCombo(0);
    setHistory([]);
    setPhase("playing");
  }

  function pick(displayIdx) {
    if (phase !== "playing" || selected !== null) return;
    const sentIdx = sentenceOrder[displayIdx];
    const s = currentRound.sentences[sentIdx];
    setSelected(displayIdx);

    if (s.isImpostor) {
      const newCombo = combo + 1;
      const pts = 100 * tier.mult;
      setScore(sc => sc + pts);
      setCombo(newCombo);
      if (getTier(newCombo).mult !== tier.mult) setStampKey(k => k + 1);
      setHistory(h => [...h, { round: currentRound, sentenceOrder, selectedDisplayIdx: displayIdx, correct: true }]);
      setTimeout(() => {
        setSelected(null);
        setRoundIdx(prev => {
          const next = prev + 1;
          if (next >= rounds.length) { setPhase("debrief"); return prev; }
          setSentenceOrder(shuffle([0, 1, 2, 3]));
          return next;
        });
      }, 1200);
    } else {
      setHistory(h => [...h, { round: currentRound, sentenceOrder, selectedDisplayIdx: displayIdx, correct: false }]);
      setTimeout(() => setPhase("dead"), 400);
    }
  }

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        `}</style>
        <TopBar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, padding: "40px 20px" }}>
          <div style={{ maxWidth: 440, width: "100%" }}>
            <PixelDisplay color={C} text="IMPOSTOR" shape="decagon" />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.55, textAlign: "center", maxWidth: 420, lineHeight: 2 }}>
            FOUR SENTENCES. ONE USES THE TERM WRONG.<br />SPOT THE IMPOSTOR.
          </div>
          <button
            onClick={startGame}
            style={{ background: "transparent", border: `1px solid ${C}`, color: C, fontFamily: "inherit", fontSize: 11, letterSpacing: 3, padding: "12px 40px", cursor: "pointer" }}
          >
            START
          </button>
        </div>
        <BottomBar onBack={onBack} />
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (phase === "playing" && currentRound) {
    const tierColor = tier.color;
    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes stampIn{0%{transform:scale(3);opacity:0}60%{transform:scale(0.9);opacity:1}100%{transform:scale(1);opacity:1}}
          @keyframes cardFlash{0%{background:#1A1A18}50%{background:#0D2E1A}100%{background:#1A1A18}}
        `}</style>
        <TopBar />

        {/* HUD */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${C}22`, fontSize: 10, letterSpacing: 2 }}>
          <div>
            <span style={{ opacity: 0.5 }}>ROUND </span>
            <span style={{ fontWeight: 700 }}>{roundIdx + 1}</span>
            <span style={{ opacity: 0.5 }}> / {rounds.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ opacity: 0.5, fontSize: 8, letterSpacing: 3 }}>COMBO</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: tierColor }}>{combo}</div>
            </div>
            <div key={stampKey} style={{ fontSize: 22, fontWeight: 700, color: tierColor, animation: stampKey > 0 ? "stampIn 0.5s ease forwards" : "none", letterSpacing: 1 }}>
              ×{tier.mult}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ opacity: 0.5, fontSize: 8, letterSpacing: 3 }}>SCORE</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Instruction */}
        <div style={{ textAlign: "center", padding: "16px 20px 8px", fontSize: 9, letterSpacing: 3, opacity: 0.4 }}>
          WHICH SENTENCE USES THE HIGHLIGHTED TERM INCORRECTLY?
        </div>

        {/* Cards */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 24px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 860, width: "100%" }}>
            {sentenceOrder.map((sentIdx, displayIdx) => {
              const s = currentRound.sentences[sentIdx];
              let borderColor = `${C}33`;
              let bg = CARD_BG;
              let opacity = 1;
              let textDecoration = "none";

              if (selected !== null) {
                if (displayIdx === selected) {
                  // What player clicked
                  borderColor = s.isImpostor ? WIN : ERR;
                  bg = s.isImpostor ? "#0D2A1A" : "#2A0D0D";
                } else if (s.isImpostor && !currentRound.sentences[sentenceOrder[selected]].isImpostor) {
                  // Real impostor not clicked — stay neutral
                }
              }

              return (
                <div
                  key={displayIdx}
                  onClick={() => pick(displayIdx)}
                  style={{
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 3,
                    padding: "22px 24px",
                    cursor: selected === null ? "pointer" : "default",
                    fontSize: 13,
                    lineHeight: 1.75,
                    letterSpacing: 0.3,
                    opacity,
                    transition: "border-color 0.2s ease, background 0.2s ease",
                    minHeight: 120,
                  }}
                  onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = C; }}
                  onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = `${C}33`; }}
                >
                  <HighlightTerm text={s.text} term={s.term} color={selected !== null ? (s.isImpostor ? ERR : C) : C} />
                </div>
              );
            })}
          </div>
        </div>

        <BottomBar onBack={onBack} />
      </div>
    );
  }

  // ── DEAD ──────────────────────────────────────────────────────────────────
  if (phase === "dead" && currentRound) {
    const wrongDisplayIdx = history[history.length - 1]?.selectedDisplayIdx;
    const wrongSentIdx = sentenceOrder[wrongDisplayIdx];
    const impostorDisplayIdx = sentenceOrder.findIndex(si => currentRound.sentences[si].isImpostor);
    const impostorSentence = currentRound.sentences.find(s => s.isImpostor);

    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        `}</style>
        <TopBar />

        <div style={{ padding: "20px 28px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: ERR, fontWeight: 700 }}>× WRONG</div>
          <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.5 }}>ROUND {roundIdx + 1} · SCORE {score.toLocaleString()}</div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 860, width: "100%" }}>
            {sentenceOrder.map((sentIdx, displayIdx) => {
              const s = currentRound.sentences[sentIdx];
              const isPlayerPick = displayIdx === wrongDisplayIdx;
              const isRealImpostor = s.isImpostor;

              let borderColor = `${C}22`;
              let bg = CARD_BG;
              let termColor = `${C}55`;
              let textStyle = {};

              if (isPlayerPick && !isRealImpostor) {
                borderColor = ERR;
                bg = "#2A0D0D";
                termColor = ERR;
                textStyle = { textDecoration: "line-through", opacity: 0.7 };
              } else if (isRealImpostor) {
                borderColor = "#FFD16699";
                bg = "#2A220D";
                termColor = "#FFD166";
              }

              return (
                <div key={displayIdx} style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: 3, padding: "18px 20px", fontSize: 12, lineHeight: 1.75, letterSpacing: 0.3, ...textStyle }}>
                  <HighlightTerm text={s.text} term={s.term} color={termColor} />
                  {isRealImpostor && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderColor}`, fontSize: 10, letterSpacing: 0.5, color: "#FFD166", textDecoration: "none" }}>
                      ← THE IMPOSTOR
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div style={{ maxWidth: 860, width: "100%", margin: "0 auto", padding: "0 24px 16px" }}>
          <div style={{ border: `1px solid ${C}22`, borderRadius: 3, padding: "18px 20px", background: CARD_BG }}>
            <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.5, marginBottom: 8 }}>WHY IT'S WRONG</div>
            <div style={{ fontSize: 12, lineHeight: 1.8, letterSpacing: 0.3, opacity: 0.9 }}>{impostorSentence?.reason}</div>
            {impostorSentence?.fix && (
              <>
                <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.5, marginTop: 14, marginBottom: 6 }}>CORRECT VERSION</div>
                <div style={{ fontSize: 12, lineHeight: 1.8, letterSpacing: 0.3, color: WIN }}>{impostorSentence.fix}</div>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "8px 24px 20px" }}>
          <button onClick={startGame} style={{ background: "transparent", border: `1px solid ${C}`, color: C, fontFamily: "inherit", fontSize: 10, letterSpacing: 3, padding: "10px 28px", cursor: "pointer" }}>
            PLAY AGAIN
          </button>
          <button onClick={() => setPhase("debrief")} style={{ background: "transparent", border: `1px solid ${C}44`, color: C, fontFamily: "inherit", fontSize: 10, letterSpacing: 3, padding: "10px 28px", cursor: "pointer", opacity: 0.6 }}>
            DEBRIEF
          </button>
        </div>

        <BottomBar onBack={onBack} />
      </div>
    );
  }

  // ── DEBRIEF ───────────────────────────────────────────────────────────────
  if (phase === "debrief") {
    const roundsCompleted = history.length;
    const correct = history.filter(h => h.correct).length;

    return (
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        `}</style>
        <TopBar />

        {/* Summary */}
        <div style={{ padding: "20px 28px 16px", borderBottom: `1px solid ${C}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 3 }}>DEBRIEF</div>
          <div style={{ display: "flex", gap: 32, fontSize: 10, letterSpacing: 2 }}>
            <span><span style={{ opacity: 0.5 }}>SCORE </span><span style={{ fontWeight: 700 }}>{score.toLocaleString()}</span></span>
            <span><span style={{ opacity: 0.5 }}>CORRECT </span><span style={{ fontWeight: 700, color: WIN }}>{correct}</span><span style={{ opacity: 0.4 }}>/{roundsCompleted}</span></span>
          </div>
          <button onClick={startGame} style={{ background: "transparent", border: `1px solid ${C}`, color: C, fontFamily: "inherit", fontSize: 9, letterSpacing: 3, padding: "8px 20px", cursor: "pointer" }}>
            PLAY AGAIN
          </button>
        </div>

        {/* Rounds */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {history.map((entry, hi) => {
            const { round, sentenceOrder: so, selectedDisplayIdx, correct: wasCorrect } = entry;
            const impostorSentence = round.sentences.find(s => s.isImpostor);

            return (
              <div key={hi} style={{ borderBottom: `1px solid ${C}11`, paddingBottom: 20 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.4, marginBottom: 10 }}>
                  ROUND {hi + 1} · TIER {round.tier} · {wasCorrect ? <span style={{ color: WIN }}>✓ CORRECT</span> : <span style={{ color: ERR }}>✗ WRONG</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {so.map((sentIdx, displayIdx) => {
                    const s = round.sentences[sentIdx];
                    const isPlayerPick = displayIdx === selectedDisplayIdx;
                    const isRealImpostor = s.isImpostor;

                    let borderColor = `${C}18`;
                    let bg = "#16160F";
                    let termColor = `${C}66`;

                    if (isRealImpostor && wasCorrect && isPlayerPick) {
                      borderColor = WIN + "88";
                      bg = "#0D1F0D";
                      termColor = WIN;
                    } else if (isRealImpostor && !wasCorrect) {
                      borderColor = "#FFD16666";
                      bg = "#1F1A0D";
                      termColor = "#FFD166";
                    } else if (isPlayerPick && !wasCorrect) {
                      borderColor = ERR + "66";
                      bg = "#1F0D0D";
                      termColor = ERR;
                    }

                    return (
                      <div key={displayIdx} style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: 3, padding: "12px 14px", fontSize: 11, lineHeight: 1.7, letterSpacing: 0.2 }}>
                        <HighlightTerm text={s.text} term={s.term} color={termColor} />
                      </div>
                    );
                  })}
                </div>

                {!wasCorrect && (
                  <div style={{ marginTop: 10, padding: "12px 14px", background: "#1A1A18", border: `1px solid ${C}18`, borderRadius: 3, fontSize: 10, lineHeight: 1.7, letterSpacing: 0.3, opacity: 0.8 }}>
                    <span style={{ color: "#FFD166", fontWeight: 700 }}>WHY: </span>{impostorSentence?.reason}
                  </div>
                )}

                {wasCorrect && (
                  <div style={{ marginTop: 8, padding: "8px 14px", fontSize: 10, lineHeight: 1.6, letterSpacing: 0.3, opacity: 0.6 }}>
                    <span style={{ color: "#FFD166" }}>{impostorSentence?.term}: </span>{impostorSentence?.reason?.split(".")[0]}.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <BottomBar onBack={onBack} />
      </div>
    );
  }

  return null;
}
