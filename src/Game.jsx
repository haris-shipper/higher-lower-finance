import { useState, useEffect, useCallback, useRef } from "react";
import PixelDisplay from "./PixelDisplay.jsx";

const QS = [
  { a: { l: "SaaS EBITDA Margin", v: 25, u: "%" }, b: { l: "Oil & Gas EBITDA Margin", v: 45, u: "%" }, c: "MARGINS",
    e: { w: "EBITDA margin = operating profit ÷ revenue. Higher means more of each dollar sold becomes profit before financing costs.", d: "Oil & Gas has high commodity prices vs relatively fixed extraction costs. SaaS spends heavily on R&D and sales to acquire customers, compressing margins." } },
  { a: { l: "Apple P/E Ratio", v: 30, u: "x" }, b: { l: "JPMorgan P/E Ratio", v: 12, u: "x" }, c: "VALUATION",
    e: { w: "P/E = stock price ÷ earnings per share. Higher means investors pay more for each dollar of current profit.", d: "Apple commands a premium for expected growth and ecosystem lock-in. Banks are regulated, cyclical, and grow slowly — investors pay less per dollar of earnings." } },
  { a: { l: "Global PE AUM", v: 8, u: "T$" }, b: { l: "Global Hedge Fund AUM", v: 4, u: "T$" }, c: "MKT SIZE",
    e: { w: "AUM = assets under management — total capital a firm or industry deploys on behalf of investors.", d: "Private equity has grown explosively over 20 years. Hedge funds stagnated after 2008 — many underperformed public markets, triggering institutional outflows." } },
  { a: { l: "S&P 500 Avg Return/yr", v: 10, u: "%" }, b: { l: "US 10Y Treasury Yield", v: 4, u: "%" }, c: "RETURNS",
    e: { w: "S&P 500 avg return = historical long-run annual gain from US stocks. Treasury yield = risk-free interest the US government pays on 10-year bonds.", d: "Stocks are risky — you can lose everything. The ~6% excess over treasuries is the 'equity risk premium,' compensation investors demand for bearing that risk." } },
  { a: { l: "Netflix Revenue", v: 39, u: "B$" }, b: { l: "Spotify Revenue", v: 16, u: "B$" }, c: "REVENUE",
    e: { w: "Revenue = total sales. Both are global subscription streaming companies.", d: "Netflix charges more per user (~$15-22/mo vs ~$10) and has more paying subscribers globally. Higher price × more users = far larger revenue." } },
  { a: { l: "PE Fund Lifecycle", v: 10, u: "yr" }, b: { l: "VC Fund Lifecycle", v: 12, u: "yr" }, c: "FUNDS",
    e: { w: "Fund lifecycle = time from first close to final wind-down, when all investments are exited and capital returned to investors.", d: "VC backs early-stage startups that need years to reach IPO or acquisition. PE buys mature businesses that can be restructured and exited on a shorter timeline." } },
  { a: { l: "NYSE Listed Cos", v: 2400, u: "" }, b: { l: "NASDAQ Listed Cos", v: 3700, u: "" }, c: "EXCHANGES",
    e: { w: "Listed companies = businesses whose shares publicly trade on that exchange.", d: "NASDAQ has lower listing requirements and became the home of tech startups. NYSE is older with stricter standards — fewer but typically larger, more established companies." } },
  { a: { l: "BlackRock AUM", v: 10, u: "T$" }, b: { l: "Vanguard AUM", v: 8, u: "T$" }, c: "ASSET MGMT",
    e: { w: "Both are the world's two largest asset managers, running trillions across index funds, ETFs, and institutional mandates.", d: "BlackRock manages active and passive strategies across more asset classes and geographies. Vanguard is primarily passive retail index funds — large but narrower in scope." } },
  { a: { l: "Hedge Fund Mgmt Fee", v: 1.5, u: "%" }, b: { l: "Avg ETF Expense Ratio", v: 0.4, u: "%" }, c: "FEES",
    e: { w: "Annual fee charged as a % of AUM. Compounds significantly over time — a key reason most active managers fail to outperform after fees.", d: "Hedge funds charge for active management and claimed alpha. ETFs passively track an index — no stock-picking, minimal overhead, so cost is a fraction." } },
  { a: { l: "US IPOs in 2021", v: 1000, u: "" }, b: { l: "US IPOs in 2023", v: 150, u: "" }, c: "IPO MKT",
    e: { w: "IPO = Initial Public Offering. A private company lists on a stock exchange and sells shares to the public for the first time.", d: "2021 was an all-time boom driven by SPACs and near-zero interest rates. By 2023, rate hikes and falling valuations shut the IPO window almost entirely." } },
  { a: { l: "M&A Advisory Fee", v: 2, u: "%" }, b: { l: "PE Carry Rate", v: 20, u: "%" }, c: "FEES",
    e: { w: "M&A advisory fee = % of deal value banks charge for advising a transaction. PE carry = % of fund profits PE managers take above a minimum return hurdle (~8%).", d: "Banks earn fees regardless of outcome. PE carry is pure upside — managers only earn it if investors make strong returns. Different structures, wildly different incentives." } },
  { a: { l: "Amazon Gross Margin", v: 48, u: "%" }, b: { l: "Walmart Gross Margin", v: 24, u: "%" }, c: "MARGINS",
    e: { w: "Gross margin = (revenue − cost of goods sold) ÷ revenue. What remains after direct product costs, before operating expenses.", d: "Amazon blends high-margin AWS cloud and marketplace fees into its retail business. Walmart is almost entirely retail, competing on price — thin margins are the business model." } },
  { a: { l: "S&P500 Calls/Quarter", v: 500, u: "" }, b: { l: "Analysts per S&P500 Co", v: 20, u: "" }, c: "RESEARCH",
    e: { w: "Earnings calls = quarterly calls where companies discuss results with analysts and investors. Sell-side analysts = bank researchers who publish stock recommendations.", d: "~500 S&P500 companies each hold ~1 call per quarter. Large-cap stocks attract ~20 analysts on average, all competing to publish differentiated research." } },
  { a: { l: "Days to Close PE Deal", v: 180, u: "d" }, b: { l: "Days to IPO Process", v: 120, u: "d" }, c: "TIMELINES",
    e: { w: "Deal close = time from signing to completing a PE acquisition. IPO process = time from selecting banks to first trading day.", d: "PE deals involve bilateral negotiations, deep due diligence, and arranging debt financing — slow and complex. IPOs follow a structured roadshow that is faster but market-dependent." } },
  { a: { l: "US Equity Mkt Cap", v: 50, u: "T$" }, b: { l: "US Bond Mkt Size", v: 55, u: "T$" }, c: "MKT SIZE",
    e: { w: "Equity market cap = total value of publicly traded shares. Bond market size = total outstanding debt from governments, corporations, and agencies.", d: "Surprising to most — the US bond market is slightly larger. Governments and corporations issue trillions in debt continuously. Bonds are the plumbing of global finance." } },
  { a: { l: "CAPEX/Rev Tech", v: 8, u: "%" }, b: { l: "CAPEX/Rev Telecom", v: 18, u: "%" }, c: "CAPEX",
    e: { w: "CAPEX/Revenue = capital expenditure on physical assets ÷ total sales. Measures how asset-intensive a business model is.", d: "Telecom requires massive physical infrastructure — towers, fiber, spectrum licenses — needing constant investment. Software businesses are largely asset-light; engineers replace factories." } },
  { a: { l: "Buy-Side Firms", v: 15000, u: "" }, b: { l: "Sell-Side Firms", v: 5000, u: "" }, c: "STRUCTURE",
    e: { w: "Buy-side = firms that invest capital (pension funds, PE, hedge funds). Sell-side = firms that advise and facilitate transactions (investment banks, brokers).", d: "The buy-side is fragmented — thousands of boutique funds exist globally. The sell-side is concentrated: a handful of large banks dominate advisory and trading." } },
  { a: { l: "LBO Debt Ratio", v: 65, u: "%" }, b: { l: "Public Co Debt Ratio", v: 35, u: "%" }, c: "LEVERAGE",
    e: { w: "Debt ratio = debt ÷ total capital. Shows how much of a business is financed by borrowing vs equity.", d: "In an LBO, PE deliberately loads companies with debt to amplify equity returns — leverage is the point. Public companies are more conservative; excessive debt spooks investors and credit agencies." } },
  { a: { l: "Top Quartile ROIC", v: 25, u: "%" }, b: { l: "Average WACC", v: 9, u: "%" }, c: "RETURNS",
    e: { w: "ROIC = return on invested capital (profit ÷ capital employed). WACC = weighted average cost of capital — the minimum return needed to satisfy debt and equity holders.", d: "The best companies generate returns far above their cost of capital. That spread is how economic value is created. Companies below WACC are actively destroying value." } },
  { a: { l: "SaaS Rev Multiple", v: 8, u: "x" }, b: { l: "Banking Rev Multiple", v: 3, u: "x" }, c: "VALUATION",
    e: { w: "Revenue multiple = enterprise value ÷ annual revenue. Investors pay X dollars per dollar of annual sales.", d: "SaaS revenue is recurring, high-margin, and scalable — investors pay a premium. Banking revenue is cyclical, regulated, and capital-intensive — discounted heavily." } },
  { a: { l: "Institutional Own SP500", v: 80, u: "%" }, b: { l: "Retail Own SP500", v: 20, u: "%" }, c: "OWNERSHIP",
    e: { w: "Institutional investors = pension funds, endowments, mutual funds, insurers. Retail = individual investors buying stocks directly.", d: "Most retail wealth flows into markets through institutional vehicles (401k, mutual funds). Institutions dominate because of scale, resources, and professional mandates." } },
  { a: { l: "Bloomberg Terminal/yr", v: 25000, u: "$" }, b: { l: "Refinitiv Eikon/yr", v: 15000, u: "$" }, c: "TOOLS",
    e: { w: "Both are professional financial data platforms used by traders, analysts, and portfolio managers for real-time market data and analytics.", d: "Bloomberg is the dominant industry standard — its network effect, data depth, and messaging system (Bloomberg Chat) justify the premium. Refinitiv is a capable #2 but hasn't broken Bloomberg's grip." } },
  { a: { l: "PE Dry Powder", v: 4, u: "T$" }, b: { l: "VC Dry Powder", v: 0.5, u: "T$" }, c: "DRY POWDER",
    e: { w: "Dry powder = capital that LPs (investors) have committed to a fund but that hasn't been deployed into investments yet.", d: "PE manages far more total capital than VC — its dry powder reflects that scale. VC is a smaller, earlier-stage market focused on startups vs PE's large buyouts." } },
  { a: { l: "Buybacks SP500 2023", v: 800, u: "B$" }, b: { l: "Dividends SP500 2023", v: 600, u: "B$" }, c: "CAP RETURN",
    e: { w: "Buybacks = companies repurchase own shares, reducing share count and boosting EPS. Dividends = direct cash payments to shareholders.", d: "Buybacks are flexible (no obligation to maintain), tax-efficient, and signal confidence. Dividend cuts are seen as red flags, so companies increasingly prefer buybacks." } },
  { a: { l: "EV/EBITDA Tech", v: 20, u: "x" }, b: { l: "EV/EBITDA Banks", v: 8, u: "x" }, c: "VALUATION",
    e: { w: "EV/EBITDA = enterprise value ÷ operating earnings. Shows what the market pays per dollar of profit.", d: "Tech trades at premium multiples for growth, scalability, and high margins. Banks face regulatory caps, credit cycle risks, and slower growth — valued cheaply vs earnings." } },
  { a: { l: "US Public Companies", v: 4000, u: "" }, b: { l: "US Private Cos >100M", v: 18000, u: "" }, c: "STRUCTURE",
    e: { w: "Public companies trade on stock exchanges — anyone can buy shares. Private companies don't list publicly — owned by founders, PE, or other private investors.", d: "Going public requires expensive compliance, quarterly reporting, and constant scrutiny. Most large companies stay private — cheaper, less burdensome, and allows longer-term thinking." } },
  { a: { l: "Buy-Side Analyst Pay", v: 150, u: "K$" }, b: { l: "Sell-Side Analyst Pay", v: 100, u: "K$" }, c: "CAREERS",
    e: { w: "Buy-side analysts research investments for funds (directly impacting portfolio decisions). Sell-side analysts publish research for banks and brokers.", d: "Buy-side analysts are paid on portfolio performance — their edge translates directly to returns. Sell-side earns from commissions and banking fees, not investment outcomes, so comp is lower." } },
  { a: { l: "Global ESG AUM", v: 30, u: "T$" }, b: { l: "Crypto Market Cap", v: 2, u: "T$" }, c: "TRENDS",
    e: { w: "ESG AUM = capital in funds applying environmental, social, and governance filters. Crypto market cap = total value of all digital asset tokens.", d: "ESG is embedded in trillions of institutional mandates globally — pension funds, sovereign wealth. Crypto is large in absolute terms but tiny compared to traditional institutional finance." } },
  { a: { l: "Avg CEO Tenure", v: 7, u: "yr" }, b: { l: "Avg CFO Tenure", v: 5, u: "yr" }, c: "LEADERSHIP",
    e: { w: "Tenure = how long executives typically hold their role before leaving or being replaced.", d: "CEOs set long-term strategy — boards value stability. CFOs move faster: many get promoted to CEO, recruited away by larger companies, or replaced as financial complexity grows." } },
  { a: { l: "FCF Yield Tech", v: 4, u: "%" }, b: { l: "Div Yield Utilities", v: 3.5, u: "%" }, c: "YIELDS",
    e: { w: "FCF yield = free cash flow ÷ market cap. Dividend yield = annual dividend ÷ stock price. Both measure cash return relative to company value.", d: "Tech generates strong cash flows but reinvests most into growth, keeping yield lower than it could be. Utilities have predictable regulated revenues and pay out the majority as dividends." } },
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

const getTZTime = (tz) => new Date().toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const isMktOpen = (tz, oh, om, ch, cm) => {
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const day = local.getDay();
  if (day === 0 || day === 6) return false;
  const mins = local.getHours() * 60 + local.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};

export default function Game({ onBack }) {
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
  const [showExp, setShowExp] = useState(false);
  const [tick, setTick] = useState(0);
  const tmr = useRef(null);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  const start = useCallback(() => {
    setQs(shuf(QS).slice(0, 20).map(q => Math.random() > 0.5 ? { ...q, a: q.b, b: q.a } : q));
    setI(0); setSc(0); setSt(0); setCmb(1); setRes(null); setShowExp(false); setPh("play");
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
      setTimeout(() => setShowExp(true), 500);
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
            return (
              <span key={label}>{label} <span style={{ color: open ? "#2DFF72" : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>
            );
          })}
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: showExp ? "flex-start" : "center", padding: "20px 16px", position: "relative", overflowY: "auto" }}>

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
            <PixelDisplay color={C} style={{ marginBottom: 28 }} />

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

            {/* Debrief panel — shown on wrong answer */}
            {showExp && !res && q && q.e && (
              <div style={{ marginTop: 16, border: `1px solid ${ERR}`, padding: "18px 20px", animation: "revealV 0.25s ease" }}>
                <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 14, color: ERR }}>─ DEBRIEF ─</div>
                <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.45, marginBottom: 5 }}>WHAT ARE THESE</div>
                <div style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 14 }}>{q.e.w}</div>
                <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.45, marginBottom: 5 }}>WHY THE DIFFERENCE</div>
                <div style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 18 }}>{q.e.d}</div>
                <button className="gb" onClick={() => { setHi(h => Math.max(h, sc)); setShowExp(false); setPh("end"); }} style={{ width: "100%", letterSpacing: 5, fontSize: 12, borderColor: ERR, color: ERR }}>
                  END SESSION
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderTop: `1px solid ${C}`, fontSize: 9, letterSpacing: 3, flexShrink: 0 }}>
        <span style={{ cursor: "pointer", opacity: 0.6, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>← HOME</span>
        <span>HIGHER/LOWER V1.0</span>
        <span>{(ph === "play" || ph === "reveal") ? "● ACTIVE" : "○ STANDBY"}</span>
      </div>
    </div>
  );
}
