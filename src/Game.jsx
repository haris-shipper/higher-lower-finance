import { useState, useEffect, useCallback, useRef } from "react";

const QS = [
  { a: { l: "SaaS EBITDA Margin", v: 25, u: "%" }, b: { l: "Oil & Gas EBITDA Margin", v: 45, u: "%" }, c: "MARGINS" },
  { a: { l: "Apple P/E Ratio", v: 30, u: "x" }, b: { l: "JPMorgan P/E Ratio", v: 12, u: "x" }, c: "VALUATION" },
  { a: { l: "Global PE AUM", v: 8, u: "T$" }, b: { l: "Global Hedge Fund AUM", v: 4, u: "T$" }, c: "MKT SIZE" },
  { a: { l: "S&P 500 Avg Return/yr", v: 10, u: "%" }, b: { l: "US 10Y Treasury Yield", v: 4, u: "%" }, c: "RETURNS" },
  { a: { l: "Netflix Revenue", v: 39, u: "B$" }, b: { l: "Spotify Revenue", v: 16, u: "B$" }, c: "REVENUE" },
  { a: { l: "PE Fund Lifecycle", v: 10, u: "yr" }, b: { l: "VC Fund Lifecycle", v: 12, u: "yr" }, c: "FUNDS" },
  { a: { l: "NYSE Listed Cos", v: 2400, u: "" }, b: { l: "NASDAQ Listed Cos", v: 3700, u: "" }, c: "EXCHANGES" },
  { a: { l: "BlackRock AUM", v: 10, u: "T$" }, b: { l: "Vanguard AUM", v: 8, u: "T$" }, c: "ASSET MGMT" },
  { a: { l: "Hedge Fund Mgmt Fee", v: 1.5, u: "%" }, b: { l: "Avg ETF Expense Ratio", v: 0.4, u: "%" }, c: "FEES" },
  { a: { l: "US IPOs in 2021", v: 1000, u: "" }, b: { l: "US IPOs in 2023", v: 150, u: "" }, c: "IPO MKT" },
  { a: { l: "M&A Advisory Fee", v: 2, u: "%" }, b: { l: "PE Carry Rate", v: 20, u: "%" }, c: "FEES" },
  { a: { l: "Amazon Gross Margin", v: 48, u: "%" }, b: { l: "Walmart Gross Margin", v: 24, u: "%" }, c: "MARGINS" },
  { a: { l: "S&P500 Calls/Quarter", v: 500, u: "" }, b: { l: "Analysts per S&P500 Co", v: 20, u: "" }, c: "RESEARCH" },
  { a: { l: "Days to Close PE Deal", v: 180, u: "d" }, b: { l: "Days to IPO Process", v: 120, u: "d" }, c: "TIMELINES" },
  { a: { l: "US Equity Mkt Cap", v: 50, u: "T$" }, b: { l: "US Bond Mkt Size", v: 55, u: "T$" }, c: "MKT SIZE" },
  { a: { l: "CAPEX/Rev Tech", v: 8, u: "%" }, b: { l: "CAPEX/Rev Telecom", v: 18, u: "%" }, c: "CAPEX" },
  { a: { l: "Buy-Side Firms", v: 15000, u: "" }, b: { l: "Sell-Side Firms", v: 5000, u: "" }, c: "STRUCTURE" },
  { a: { l: "LBO Debt Ratio", v: 65, u: "%" }, b: { l: "Public Co Debt Ratio", v: 35, u: "%" }, c: "LEVERAGE" },
  { a: { l: "Top Quartile ROIC", v: 25, u: "%" }, b: { l: "Average WACC", v: 9, u: "%" }, c: "RETURNS" },
  { a: { l: "SaaS Rev Multiple", v: 8, u: "x" }, b: { l: "Banking Rev Multiple", v: 3, u: "x" }, c: "VALUATION" },
  { a: { l: "Institutional Own SP500", v: 80, u: "%" }, b: { l: "Retail Own SP500", v: 20, u: "%" }, c: "OWNERSHIP" },
  { a: { l: "Bloomberg Terminal/yr", v: 25000, u: "$" }, b: { l: "Refinitiv Eikon/yr", v: 15000, u: "$" }, c: "TOOLS" },
  { a: { l: "PE Dry Powder", v: 4, u: "T$" }, b: { l: "VC Dry Powder", v: 0.5, u: "T$" }, c: "DRY POWDER" },
  { a: { l: "Buybacks SP500 2023", v: 800, u: "B$" }, b: { l: "Dividends SP500 2023", v: 600, u: "B$" }, c: "CAP RETURN" },
  { a: { l: "EV/EBITDA Tech", v: 20, u: "x" }, b: { l: "EV/EBITDA Banks", v: 8, u: "x" }, c: "VALUATION" },
  { a: { l: "US Public Companies", v: 4000, u: "" }, b: { l: "US Private Cos >100M", v: 18000, u: "" }, c: "STRUCTURE" },
  { a: { l: "Buy-Side Analyst Pay", v: 150, u: "K$" }, b: { l: "Sell-Side Analyst Pay", v: 100, u: "K$" }, c: "CAREERS" },
  { a: { l: "Global ESG AUM", v: 30, u: "T$" }, b: { l: "Crypto Market Cap", v: 2, u: "T$" }, c: "TRENDS" },
  { a: { l: "Avg CEO Tenure", v: 7, u: "yr" }, b: { l: "Avg CFO Tenure", v: 5, u: "yr" }, c: "LEADERSHIP" },
  { a: { l: "FCF Yield Tech", v: 4, u: "%" }, b: { l: "Div Yield Utilities", v: 3.5, u: "%" }, c: "YIELDS" },
];

function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function fmt(v, u) {
  if (u === "T$") return "$" + v + "T"; if (u === "B$") return "$" + v + "B"; if (u === "K$") return "$" + v + "K";
  if (u === "$") return "$" + v.toLocaleString(); if (u === "%") return v + "%"; if (u === "x") return v + "x";
  if (u) return v.toLocaleString() + " " + u; return v.toLocaleString();
}

const BG = "#141413";
const C = "#FF972D";

// Gamification: streak colors REPLACE the base orange
const TIERS = [
  { min: 0, color: C, label: "" },
  { min: 3, color: "#D1FF2D", label: "STREAK" },
  { min: 5, color: "#2DFBFF", label: "HOT" },
  { min: 8, color: "#2D70FF", label: "ON FIRE" },
  { min: 10, color: "#D82DFF", label: "LEGENDARY" },
  { min: 13, color: "#FF2D50", label: "GODMODE" },
];
function getTier(s) { let t = TIERS[0]; for (const c of TIERS) if (s >= c.min) t = c; return t; }

const FONT = {
  H: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  G: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  O: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
};
const _PX_TEXT = "HIGHER OR LOWER?";
const _PS = 4, _PG = 1, _LG = 5;
const _buildPx = () => {
  const pxs = [], cw = 5 * _PS + 4 * _PG; let xOff = 0;
  for (let ci = 0; ci < _PX_TEXT.length; ci++) {
    const grid = FONT[_PX_TEXT[ci]] || FONT[' '];
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 5; c++)
        if (grid[r][c]) pxs.push({ key: `${ci}-${r}-${c}`, x: xOff + c * (_PS + _PG), y: r * (_PS + _PG) });
    xOff += cw + _LG;
  }
  return { pxs, w: xOff - _LG, h: 7 * _PS + 6 * _PG };
};
const { pxs: PX_PIXELS, w: PX_W, h: PX_H } = _buildPx();

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

function PixelDisplay({ color }) {
  const [dim, setDim] = useState(() => new Set());
  useEffect(() => {
    const iv = setInterval(() => {
      setDim(prev => {
        const next = new Set(prev);
        const n = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < n; i++) {
          const px = PX_PIXELS[Math.floor(Math.random() * PX_PIXELS.length)];
          next.has(px.key) ? next.delete(px.key) : next.add(px.key);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(iv);
  }, []);
  return (
    <svg viewBox={`0 0 ${PX_W} ${PX_H}`} style={{ width: "100%", display: "block", marginBottom: 28 }}>
      {PX_PIXELS.map(({ key, x, y }) => (
        <rect key={key} x={x} y={y} width={_PS} height={_PS} fill={color}
          opacity={dim.has(key) ? 0.07 : 1} style={{ transition: "opacity 0.55s ease" }} />
      ))}
    </svg>
  );
}

export default function Game() {
  const [ph, setPh] = useState("menu");
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [sc, setSc] = useState(0);
  const [st, setSt] = useState(0);
  const [best, setBest] = useState(0);
  const [hi, setHi] = useState(0);
  const [res, setRes] = useState(null);
  const [cmb, setCmb] = useState(1);
  const [shake, setShake] = useState(false);
  const [pts, setPts] = useState(0);
  const [stmp, setStmp] = useState(null);
  const [tick, setTick] = useState(0);
  const tmr = useRef(null);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  const start = useCallback(() => {
    setQs(shuf(QS).slice(0, 20).map(q => Math.random() > 0.5 ? { ...q, a: q.b, b: q.a } : q));
    setI(0); setSc(0); setSt(0); setCmb(1); setRes(null); setPh("play");
  }, []);

  const pick = useCallback((higher) => {
    if (ph !== "play") return;
    const q = qs[i], ok = higher ? q.b.v >= q.a.v : q.b.v < q.a.v;
    setRes(ok); setPh("reveal");
    if (ok) {
      const ns = st + 1, m = Math.min(Math.floor(ns / 3) + 1, 5), p = 100 * m;
      setSt(ns); setCmb(m); setSc(s => s + p); setPts(p);
      if (ns > best) setBest(ns);
      if (ns >= 3 && ns % 3 === 0) { setStmp(m + "x"); setTimeout(() => setStmp(null), 1200); }
      tmr.current = setTimeout(() => {
        if (i + 1 < qs.length) { setI(j => j + 1); setRes(null); setPh("play"); }
        else { setHi(h => Math.max(h, sc + p)); setPh("end"); }
      }, 1500);
    } else {
      setSt(0); setCmb(1); setShake(true); setTimeout(() => setShake(false), 400);
      tmr.current = setTimeout(() => { setHi(h => Math.max(h, sc)); setPh("end"); }, 1600);
    }
  }, [ph, qs, i, st, best, sc]);

  useEffect(() => () => { if (tmr.current) clearTimeout(tmr.current); }, []);

  const t = getTier(st);
  const q = qs[i];
  const rv = ph === "reveal";
  const ac = t.color;
  const ERR = "#FF2D2D";

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
        @keyframes revealV{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes stampIn{0%{opacity:0;transform:translate(-50%,-50%) scale(5)}30%{opacity:1;transform:translate(-50%,-50%) scale(0.95)}100%{transform:translate(-50%,-50%) scale(1)}}
        @keyframes stampOut{from{opacity:1}to{opacity:0;transform:translate(-50%,-50%) scale(0.85) translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        .gb{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;letter-spacing:0.15em;padding:16px 0;background:transparent;color:${C};border:1px solid ${C};cursor:pointer;transition:all 0.12s;}
        .gb:hover{background:${C};color:${BG};}
        .gb:active{transform:scale(0.96);}
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 20px", borderBottom: `1px solid ${C}`, flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, lineHeight: 2 }}>
          {[["STOCKHOLM", "Europe/Stockholm"], ["DUBLIN", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
            <div key={label} style={{ display: "flex", gap: 10 }}>
              <span style={{ minWidth: 72 }}>{label}</span>
              <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, textAlign: "center", alignSelf: "center" }}>
          A QUARTR LABS GAME
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2, textAlign: "right", lineHeight: 2 }}>
          {[
            { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
            { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
            { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
          ].map(({ label, tz, oh, om, ch, cm }) => {
            const open = isMktOpen(tz, oh, om, ch, cm);
            return (
              <div key={label} style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <span>{label}</span>
                <span style={{ color: open ? "#2DFF72" : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none", minWidth: 50, textAlign: "right" }}>
                  {open ? "OPEN" : "CLOSED"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", position: "relative" }}>

        {stmp && (
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            fontSize: 80, fontWeight: 700, color: ac,
            textShadow: `0 0 60px ${ac}80, 0 0 120px ${ac}30`,
            animation: "stampIn 0.2s ease forwards, stampOut 0.3s ease 0.9s forwards",
            pointerEvents: "none", zIndex: 30, letterSpacing: 8,
          }}>{stmp}</div>
        )}

        {/* ── MENU ── */}
        {ph === "menu" && (
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <PixelDisplay color={C} />

            <div style={{ border: `1px solid ${C}`, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>─ BRIEFING ─</div>
              {["Two metrics displayed side by side", "One value known, one classified", "Determine: HIGHER or LOWER?", "Streaks unlock combo multipliers", "One wrong answer ends session"].map((txt, j) => (
                <div key={j} style={{ fontSize: 11, lineHeight: 2.2, display: "flex", gap: 10 }}>
                  <span>{String(j + 1).padStart(2, "0")}</span><span>{txt}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 20 }}>
              <span>HIGH SCORE: {hi}</span><span>BEST STREAK: {best}</span>
            </div>

            <button className="gb" onClick={start} style={{ width: "100%", letterSpacing: 8 }}>INITIATE</button>
          </div>
        )}

        {/* ── GAME OVER ── */}
        {ph === "end" && (
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 6, marginBottom: 20 }}>─ SESSION TERMINATED ─</div>
            <div style={{ fontSize: 72, fontWeight: 700, fontFeatureSettings: "'tnum'", letterSpacing: 4 }}>{sc}</div>
            <div style={{ fontSize: 10, letterSpacing: 5, marginBottom: 28 }}>TOTAL POINTS</div>

            <div style={{ border: `1px solid ${C}`, marginBottom: 20 }}>
              {[["BEST STREAK", best], ["CORRECT", (i + (res ? 1 : 0)) + " / " + qs.length], ["MAX MULTI", Math.min(Math.floor(best / 3) + 1, 5) + "x"]].map(([l, v], j) => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: j < 2 ? `1px solid ${C}` : "none", fontSize: 12 }}>
                  <span>{l}</span><span style={{ fontWeight: 600, fontFeatureSettings: "'tnum'" }}>{v}</span>
                </div>
              ))}
            </div>

            {sc > 0 && sc >= hi && (
              <div style={{ fontSize: 11, letterSpacing: 6, marginBottom: 16, padding: "8px", border: `1px solid ${C}` }}>
                ◆ NEW HIGH SCORE ◆
              </div>
            )}

            <button className="gb" onClick={start} style={{ width: "100%", letterSpacing: 6 }}>REINITIATE</button>
          </div>
        )}

        {/* ── PLAY / REVEAL ── */}
        {(ph === "play" || ph === "reveal") && q && (
          <div style={{ width: "100%", maxWidth: 600, animation: shake ? "shake 0.35s ease" : "none" }}>

            {/* HUD row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 12, fontFeatureSettings: "'tnum'" }}>
              <div>
                <span>SCORE </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: st >= 3 ? ac : C, transition: "color 0.3s" }}>{sc}</span>
                {rv && res && <span style={{ fontSize: 12, marginLeft: 8, color: ac, animation: "fadeUp 1s ease forwards" }}>+{pts}</span>}
              </div>
              <div>
                <span>STREAK </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: st >= 3 ? ac : C, textShadow: st >= 3 ? `0 0 12px ${ac}60` : "none", transition: "all 0.3s" }}>{st}</span>
                {st >= 3 && <span style={{ fontSize: 9, marginLeft: 6, letterSpacing: 3, color: ac, animation: "blink 1.5s step-end infinite" }}>{t.label}</span>}
              </div>
              <div>
                <span>MULTI </span>
                <span style={{ fontWeight: 700, fontSize: 18, color: cmb > 1 ? ac : C }}>{cmb}x</span>
              </div>
            </div>

            {/* Category + counter */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 10, letterSpacing: 4 }}>
              <span>─ {q.c} ─</span>
              <span style={{ fontFeatureSettings: "'tnum'" }}>{String(i + 1).padStart(2, "0")}/{String(qs.length).padStart(2, "0")}</span>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${rv ? (res ? ac : ERR) : C}`, transition: "border-color 0.3s" }}>
              {/* KNOWN */}
              <div style={{ borderRight: `1px solid ${rv ? (res ? ac : ERR) : C}`, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "border-color 0.3s" }}>
                <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 14 }}>KNOWN</div>
                <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.5, marginBottom: 20 }}>{q.a.l}</div>
                <div style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, fontFeatureSettings: "'tnum'", letterSpacing: 2 }}>
                  {fmt(q.a.v, q.a.u)}
                </div>
              </div>

              {/* UNKNOWN */}
              <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 14, color: rv ? (res ? ac : ERR) : C, transition: "color 0.3s" }}>
                  {rv ? (res ? "✓ CORRECT" : "✗ WRONG") : "CLASSIFIED"}
                </div>
                <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.5, marginBottom: 20 }}>{q.b.l}</div>

                {rv ? (
                  <div style={{
                    fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, fontFeatureSettings: "'tnum'", letterSpacing: 2,
                    color: res ? ac : ERR,
                    textShadow: `0 0 20px ${res ? ac : ERR}40`,
                    animation: "revealV 0.2s ease",
                  }}>{fmt(q.b.v, q.b.u)}</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 240 }}>
                    <button className="gb" onClick={() => pick(true)} style={{ padding: "14px 0", fontSize: 13 }}>▲ HIGHER</button>
                    <button className="gb" onClick={() => pick(false)} style={{ padding: "14px 0", fontSize: 13 }}>▼ LOWER</button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div style={{ height: 2, background: `${C}30`, marginTop: 1 }}>
              <div style={{ height: "100%", width: `${((i + (rv && res ? 1 : 0)) / qs.length) * 100}%`, background: st >= 3 ? ac : C, transition: "all 0.5s", boxShadow: st >= 3 ? `0 0 8px ${ac}60` : "none" }} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span>QUARTR</span>
        <span>HIGHER/LOWER V1.0</span>
        <span>{(ph === "play" || ph === "reveal") ? "● ACTIVE" : "○ STANDBY"}</span>
      </div>
    </div>
  );
}
