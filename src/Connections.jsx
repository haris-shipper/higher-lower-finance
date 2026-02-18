import { useState, useEffect, useCallback, useRef } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { ZONES } from "./connectionsData.js";

const BG = "#141413";
const C = "#2DDEA0";
const ERR = "#FF2D2D";
const GROUP_COLORS = ["#FFD166", "#2DDEA0", "#4AB5FF", "#C44BFF"];

function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

function buildTiles(round) {
  return shuf(
    round.groups.flatMap((group, gi) =>
      group.tiles.map((tile) => ({ ...tile, groupIdx: gi }))
    )
  ).map((tile, id) => ({ ...tile, id }));
}

export default function Connections({ onBack }) {
  const [phase, setPhase] = useState("menu");
  const [session, setSession] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState(new Set());   // stores tile.id
  const [revealed, setRevealed] = useState(new Set());   // stores groupIdx
  const [lives, setLives] = useState(4);
  const [shake, setShake] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const [, setTick] = useState(0);
  const tmr = useRef(null);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => () => { if (tmr.current) clearTimeout(tmr.current); }, []);

  const startSession = useCallback(() => {
    const rounds = ZONES.map(zone => zone[Math.floor(Math.random() * zone.length)]);
    const firstTiles = buildTiles(rounds[0]);
    setSession(rounds);
    setRoundIdx(0);
    setRoundResults([]);
    setTiles(firstTiles);
    setSelected(new Set());
    setRevealed(new Set());
    setLives(4);
    setPhase("playing");
  }, []);

  const toggleTile = useCallback((id) => {
    if (phase !== "playing") return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 4) { next.add(id); }
      return next;
    });
  }, [phase]);

  const submit = useCallback(() => {
    if (selected.size !== 4 || phase !== "playing") return;
    const selArr = [...selected];
    const groupIdxs = selArr.map(id => tiles[id].groupIdx);
    const allSame = groupIdxs.every(g => g === groupIdxs[0]);

    if (allSame) {
      const newRevealed = new Set(revealed);
      newRevealed.add(groupIdxs[0]);
      setRevealed(newRevealed);
      setSelected(new Set());
      if (newRevealed.size === 4) {
        tmr.current = setTimeout(() => {
          setRoundResults(prev => [...prev, { won: true }]);
          setPhase("debrief");
        }, 400);
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setShake(true);
      setWrongFlash(true);
      setTimeout(() => { setShake(false); setWrongFlash(false); setSelected(new Set()); }, 500);
      if (newLives === 0) {
        tmr.current = setTimeout(() => {
          setRoundResults(prev => [...prev, { won: false }]);
          setPhase("debrief");
        }, 700);
      }
    }
  }, [selected, phase, tiles, revealed, lives]);

  const nextRound = useCallback(() => {
    const nextIdx = roundIdx + 1;
    if (nextIdx >= 4) {
      setPhase("end");
    } else {
      setRoundIdx(nextIdx);
      setTiles(buildTiles(session[nextIdx]));
      setSelected(new Set());
      setRevealed(new Set());
      setLives(4);
      setPhase("playing");
    }
  }, [roundIdx, session]);

  const currentRound = session?.[roundIdx];
  const remainingTiles = tiles.filter(t => !revealed.has(t.groupIdx));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes revealIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        .cb{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.12em;padding:14px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
        .cb:hover{background:${C};color:${BG};}
        .cb:active{transform:scale(0.96);}
        .cb:disabled{opacity:0.25;cursor:default;}
        .cb:disabled:hover{background:transparent;color:${C};}
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: (phase === "debrief" || phase === "end") ? "flex-start" : "center", padding: "20px 16px", overflowY: "auto" }}>

        {/* ── MENU ── */}
        {phase === "menu" && (
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <PixelDisplay color={C} text="CONNECTIONS" shape="dot" style={{ marginBottom: 28 }} />
            <div style={{ border: `1px solid ${C}`, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>─ BRIEFING ─</div>
              {[
                "16 tiles hide 4 groups of 4",
                "Select 4 tiles that belong together",
                "Submit — correct groups reveal in colour",
                "4 lives per round, wrong guess costs one",
                "4 rounds per session, one from each zone",
                "Every round ends with a full debrief",
              ].map((txt, j) => (
                <div key={j} style={{ fontSize: 11, lineHeight: 2.2, display: "flex", gap: 10 }}>
                  <span>{String(j + 1).padStart(2, "0")}</span><span>{txt}</span>
                </div>
              ))}
            </div>
            <button className="cb" onClick={startSession} style={{ width: "100%", letterSpacing: 8 }}>INITIATE</button>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && currentRound && (
          <div style={{ width: "100%", maxWidth: 640 }}>

            {/* HUD */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: 10, letterSpacing: 3 }}>
              <span>ROUND {String(roundIdx + 1).padStart(2, "0")} / 04 — {currentRound.zoneName}</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ marginRight: 4 }}>LIVES</span>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < lives ? C : `${C}20`, border: `1px solid ${C}40`, transition: "background 0.25s" }} />
                ))}
              </div>
            </div>

            {/* Revealed group banners */}
            {[...revealed].sort().map(gi => (
              <div key={gi} style={{ background: GROUP_COLORS[gi], color: BG, padding: "9px 14px", marginBottom: 4, animation: "revealIn 0.3s ease", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, fontWeight: 700, letterSpacing: 3 }}>
                <span>{currentRound.groups[gi].name}</span>
                <span style={{ fontWeight: 400, fontSize: 8, letterSpacing: 1, opacity: 0.7 }}>{currentRound.groups[gi].tiles.map(t => t.name).join(" · ")}</span>
              </div>
            ))}

            {/* Tile grid — only remaining (unrevealed) tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, animation: shake ? "shake 0.4s ease" : "none" }}>
              {remainingTiles.map(tile => {
                const isSel = selected.has(tile.id);
                const isWrong = wrongFlash && isSel;
                return (
                  <button
                    key={tile.id}
                    onClick={() => toggleTile(tile.id)}
                    style={{
                      padding: "14px 8px",
                      fontSize: 9,
                      letterSpacing: 1,
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontWeight: 700,
                      textAlign: "center",
                      cursor: "pointer",
                      border: `1px solid ${isWrong ? ERR : isSel ? C : `${C}30`}`,
                      background: isSel ? C : "transparent",
                      color: isSel ? BG : C,
                      transition: "all 0.12s",
                      lineHeight: 1.4,
                      minHeight: 68,
                      wordBreak: "break-word",
                    }}
                  >
                    {tile.name}
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 6, marginTop: 6 }}>
              <button className="cb" onClick={() => setSelected(new Set())} disabled={selected.size === 0} style={{ fontSize: 10, letterSpacing: 4, padding: "11px 0" }}>CLEAR</button>
              <button className="cb" onClick={submit} disabled={selected.size !== 4} style={{ fontSize: 10, letterSpacing: 6, padding: "11px 0" }}>SUBMIT</button>
            </div>
          </div>
        )}

        {/* ── DEBRIEF ── */}
        {phase === "debrief" && currentRound && (
          <div style={{ width: "100%", maxWidth: 640 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 4, textAlign: "center" }}>─ ROUND {roundIdx + 1} DEBRIEF ─</div>
            <div style={{ fontSize: 9, letterSpacing: 3, marginBottom: 20, textAlign: "center", opacity: 0.45 }}>{currentRound.zoneName}</div>

            {currentRound.groups.map((group, gi) => {
              const playerFound = revealed.has(gi);
              return (
                <div key={gi} style={{ marginBottom: 12 }}>
                  <div style={{ background: GROUP_COLORS[gi], color: BG, padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: 3 }}>{group.name}</span>
                    <span style={{ fontSize: 9, letterSpacing: 1, opacity: 0.7 }}>{playerFound ? "✓ FOUND" : "✗ MISSED"}</span>
                  </div>
                  <div style={{ border: `1px solid ${GROUP_COLORS[gi]}40`, borderTop: "none", padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, lineHeight: 1.8, marginBottom: 10, opacity: 0.6 }}>{group.explanation}</div>
                    {group.tiles.map((tile, ti) => (
                      <div key={ti} style={{ fontSize: 10, lineHeight: 1.7, display: "flex", gap: 8, marginBottom: 5 }}>
                        <span style={{ color: GROUP_COLORS[gi], flexShrink: 0 }}>▸</span>
                        <span><span style={{ fontWeight: 700 }}>{tile.name}</span> — {tile.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button className="cb" onClick={nextRound} style={{ width: "100%", letterSpacing: 6, marginTop: 8 }}>
              {roundIdx < 3 ? "NEXT ROUND →" : "VIEW RESULTS"}
            </button>
          </div>
        )}

        {/* ── END ── */}
        {phase === "end" && session && (
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 20 }}>─ SESSION COMPLETE ─</div>

            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 4, marginBottom: 4 }}>
              {roundResults.filter(r => r.won).length} / 4
            </div>
            <div style={{ fontSize: 10, letterSpacing: 5, marginBottom: 28 }}>ROUNDS COMPLETED</div>

            <div style={{ border: `1px solid ${C}`, marginBottom: 24 }}>
              {session.map((round, ri) => (
                <div key={ri} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: ri < 3 ? `1px solid ${C}15` : "none", fontSize: 11 }}>
                  <span style={{ fontSize: 9, letterSpacing: 2, opacity: 0.5 }}>{round.zoneName}</span>
                  <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: 3, color: roundResults[ri]?.won ? C : ERR }}>
                    {roundResults[ri]?.won ? "COMPLETE" : "FAILED"}
                  </span>
                </div>
              ))}
            </div>

            <button className="cb" onClick={startSession} style={{ width: "100%", letterSpacing: 6 }}>PLAY AGAIN</button>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
        <span>CONNECTIONS V1.0</span>
        <span>{phase === "playing" ? "● ACTIVE" : "○ STANDBY"}</span>
      </div>
    </div>
  );
}
