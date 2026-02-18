import { useState, useEffect, useRef, useCallback } from "react";

const BG  = "#141413";
const FG  = "#FBFBFB";
const WIN = "#2DFF72";
const DIM = "rgba(251,251,251,0.4)";

const BOOT_LINES = [
  ["INITIALIZING QUARTR LABS INTERFACE v2.1",  "...OK"],
  ["LOADING CRYPTOGRAPHIC MODULES",             "..........OK"],
  ["ESTABLISHING SECURE CONNECTION",            ".........OK"],
  ["VERIFYING OPERATOR CLEARANCE LEVEL",        ".....OK"],
  ["LOADING FINANCIAL INTELLIGENCE DATABASE",   "..OK"],
  ["CALIBRATING DIFFICULTY PARAMETERS",         ".......OK"],
  ["ESTABLISHING LEADERBOARD SYNC",             "..........OK"],
  ["LOADING OPERATOR PROFILE DATABASE",         ".......OK"],
  ["RUNNING SYSTEM INTEGRITY CHECKS",           "......PASS"],
  ["COMPILING IMPOSTOR SCENARIO POOL",          ".......OK"],
  ["LOADING REAL-TIME MARKET DATA FEEDS",       "...OK"],
  ["SYNCHRONIZING GLOBAL TIMESTAMPS",           "........OK"],
  ["LOADING CONNECTIONS INTELLIGENCE",          ".......OK"],
  ["INITIALIZING INBOX CLASSIFICATION ENGINE",  "..OK"],
  ["COMPILING FINANCE QUESTION POOL",           "........OK"],
  ["RUNNING ANTI-TAMPER VERIFICATION",          ".....PASS"],
  ["ESTABLISHING ENCRYPTED SESSION",            "..........OK"],
  ["ALL SYSTEMS NOMINAL",                       ""],
  ["",                                          ""],
  ["READY FOR OPERATOR AUTHENTICATION",         ""],
];

const GLITCH_CHARS = "!@#$%^&*<>?/\\|[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const WELCOME_TEXT = "WELCOME — YOU HAVE ENTERED QUARTR LABS GAME STUDIO";
const PROMPT_TEXT  = "ENTER PLAYING NAME";

export default function Intro({ onComplete }) {
  const [phase,       setPhase]       = useState("boot");
  const [bootCount,   setBootCount]   = useState(0);
  const [mainText,    setMainText]    = useState("");
  const [inputName,   setInputName]   = useState("");
  const [glitch,      setGlitch]      = useState(null);
  const [grantedText, setGrantedText] = useState("");
  const inputRef     = useRef(null);
  const textRef      = useRef("");   // current text for glitch without stale closure

  // ── BOOT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "boot") return;
    let i = 0;
    const id = setInterval(() => {
      setBootCount(i + 1);
      i++;
      if (i >= BOOT_LINES.length) {
        clearInterval(id);
        setTimeout(() => setPhase("welcome"), 380);
      }
    }, 65);
    return () => clearInterval(id);
  }, [phase]);

  // ── WELCOME TYPING ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "welcome") return;
    setMainText("");
    let idx = 0;
    const id = setInterval(() => {
      const t = WELCOME_TEXT.slice(0, idx + 1);
      setMainText(t);
      textRef.current = t;
      idx++;
      if (idx >= WELCOME_TEXT.length) {
        clearInterval(id);
        setTimeout(() => {
          setMainText("");
          textRef.current = "";
          setPhase("prompt");
        }, 1300);
      }
    }, 42);
    return () => clearInterval(id);
  }, [phase]);

  // ── PROMPT TYPING ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "prompt") return;
    setMainText("");
    let idx = 0;
    const id = setInterval(() => {
      const t = PROMPT_TEXT.slice(0, idx + 1);
      setMainText(t);
      textRef.current = t;
      idx++;
      if (idx >= PROMPT_TEXT.length) {
        clearInterval(id);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    }, 55);
    return () => clearInterval(id);
  }, [phase]);

  // ── GLITCH (only during typing phases) ───────────────────────────────────
  useEffect(() => {
    if (phase !== "welcome" && phase !== "prompt") return;
    const id = setInterval(() => {
      const t = textRef.current;
      if (t.length < 4) return;
      const pos  = Math.floor(Math.random() * (t.length - 1));
      const char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      setGlitch({ pos, char });
      setTimeout(() => setGlitch(null), 85);
    }, 340);
    return () => clearInterval(id);
  }, [phase]);

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const name = inputName.trim().toUpperCase().slice(0, 16);
    if (!name) return;
    localStorage.setItem("qlg_username", name);
    setPhase("granted");
    const GRANTED = `ACCESS GRANTED. WELCOME, ${name}.`;
    let idx = 0;
    const id = setInterval(() => {
      setGrantedText(GRANTED.slice(0, idx + 1));
      idx++;
      if (idx >= GRANTED.length) {
        clearInterval(id);
        setTimeout(() => onComplete(name), 950);
      }
    }, 36);
  }, [inputName, onComplete]);

  function applyGlitch(text) {
    if (!glitch || glitch.pos >= text.length) return text;
    return text.slice(0, glitch.pos) + glitch.char + text.slice(glitch.pos + 1);
  }

  const visibleLines = BOOT_LINES.slice(0, bootCount);

  return (
    <div
      style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: FG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", userSelect: "none", position: "relative", overflow: "hidden" }}
      onClick={() => phase === "prompt" && inputRef.current?.focus()}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes reticleIn{from{opacity:0;transform:scale(1.35)}to{opacity:0.7;transform:scale(1)}}
        @keyframes blinkBlock{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes bootFade{from{opacity:0;transform:translateX(-3px)}to{opacity:1;transform:translateX(0)}}
        @keyframes phaseIn{from{opacity:0}to{opacity:1}}
        @keyframes pulseBorder{0%,100%{opacity:0.4}50%{opacity:1}}
      `}</style>


      {/* ── BOOT PHASE ── */}
      {phase === "boot" && (
        <div style={{ width: "100%", maxWidth: 620, padding: "0 40px", animation: "phaseIn 0.2s ease" }}>
          {visibleLines.map((_, li) => {
            const [label, status] = BOOT_LINES[li];
            if (!label && !status) return <div key={li} style={{ height: "1.4em" }} />;
            const isPass = status.includes("OK") || status.includes("PASS");
            const isLast = li === visibleLines.length - 1;
            return (
              <div key={li} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: 0.5, lineHeight: 1.9, animation: "bootFade 0.08s ease", opacity: isLast ? 1 : 0.5 }}>
                <span>{label}</span>
                {status && <span style={{ color: isPass ? WIN : FG, marginLeft: 16, flexShrink: 0 }}>{status}</span>}
              </div>
            );
          })}
          {/* blinking prompt cursor at end */}
          {bootCount < BOOT_LINES.length && (
            <span style={{ display: "inline-block", width: 8, height: 14, background: FG, verticalAlign: "middle", animation: "blinkBlock 0.8s step-end infinite", marginTop: 2 }} />
          )}
        </div>
      )}

      {/* ── WELCOME PHASE ── */}
      {phase === "welcome" && (
        <div style={{ maxWidth: 620, padding: "0 40px", textAlign: "center", animation: "phaseIn 0.15s ease" }}>
          <div style={{ fontSize: 13, letterSpacing: 4, lineHeight: 2, fontWeight: 500 }}>
            {applyGlitch(mainText)}
            <span style={{ display: "inline-block", width: 9, height: 15, background: FG, verticalAlign: "middle", marginLeft: 3, animation: "blinkBlock 0.7s step-end infinite" }} />
          </div>
        </div>
      )}

      {/* ── PROMPT PHASE ── */}
      {phase === "prompt" && (
        <div style={{ textAlign: "center", animation: "phaseIn 0.15s ease" }}>
          {/* Prompt label */}
          <div style={{ fontSize: 9, letterSpacing: 5, color: DIM, marginBottom: 36 }}>
            {applyGlitch(mainText)}
          </div>

          {/* Name input display */}
          <div style={{ border: `1px solid ${FG}`, padding: "18px 32px", minWidth: 280, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pulseBorder 2s ease-in-out infinite" }}>
            <span style={{ fontSize: 20, letterSpacing: 6, fontWeight: 600 }}>{inputName}</span>
            <span style={{ display: "inline-block", width: 10, height: 20, background: FG, marginLeft: inputName ? 4 : 0, animation: "blinkBlock 1s step-end infinite" }} />
          </div>

          <div style={{ marginTop: 20, fontSize: 8, letterSpacing: 4, color: DIM }}>PRESS ENTER TO CONFIRM</div>

          {/* Hidden real input */}
          <input
            ref={inputRef}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={inputName}
            onChange={e => setInputName(e.target.value.toUpperCase().replace(/[^A-Z0-9_\-]/g, "").slice(0, 16))}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ position: "fixed", top: -200, left: -200, opacity: 0, width: 1, height: 1 }}
          />
        </div>
      )}

      {/* ── GRANTED PHASE ── */}
      {phase === "granted" && (
        <div style={{ textAlign: "center", animation: "phaseIn 0.15s ease" }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: WIN, fontWeight: 600, lineHeight: 2 }}>
            {grantedText}
            <span style={{ display: "inline-block", width: 9, height: 15, background: WIN, verticalAlign: "middle", marginLeft: 3, animation: "blinkBlock 0.5s step-end infinite" }} />
          </div>
        </div>
      )}

      {/* Attribution */}
      <div style={{ position: "fixed", bottom: 36, left: 0, right: 0, textAlign: "center", fontSize: 8, letterSpacing: 5, color: DIM, pointerEvents: "none" }}>
        QUARTR LABS GAME STUDIO
      </div>
    </div>
  );
}
