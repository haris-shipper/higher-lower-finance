import { useState, useEffect, useCallback, useRef } from "react";
import PixelDisplay from "./PixelDisplay.jsx";
import { submitScore } from "./supabase.js";

const QS = [
  // ── ORIGINAL 30 ──────────────────────────────────────────────────────────
  { a: { l: "SaaS EBITDA Margin (2024)", v: 25, u: "%" }, b: { l: "Oil & Gas EBITDA Margin (2024)", v: 40, u: "%" }, c: "MARGINS",
    e: { w: "EBITDA margin = operating profit ÷ revenue. Higher means more of each dollar sold becomes profit before financing costs.", d: "Oil & Gas has high commodity prices vs relatively fixed extraction costs. SaaS spends heavily on R&D and sales to acquire customers, compressing margins. O&G margins moderated to ~40% in 2024 as oil prices eased from 2022 highs." } },
  { a: { l: "Apple P/E (fwd 2025)", v: 32, u: "x" }, b: { l: "JPMorgan P/E (fwd 2025)", v: 14, u: "x" }, c: "VALUATION",
    e: { w: "Forward P/E = stock price ÷ expected next-year earnings. Higher means investors pay more for each dollar of future profit.", d: "Apple commands a premium for ecosystem lock-in and expected services growth. Banks are regulated, cyclical, and grow slowly — investors pay far less per dollar of earnings." } },
  { a: { l: "Global PE AUM (2024)", v: 9, u: "T$" }, b: { l: "Global HF AUM (2024)", v: 4.5, u: "T$" }, c: "MKT SIZE",
    e: { w: "AUM = assets under management — total capital a firm or industry deploys on behalf of investors.", d: "Private equity has grown explosively over 20 years, reaching $9T by 2024. Hedge funds stagnated after 2008 — many underperformed public markets, triggering institutional outflows." } },
  { a: { l: "S&P 500 Avg Return/yr", v: 10, u: "%" }, b: { l: "US 10Y Yield (2025)", v: 4.5, u: "%" }, c: "RETURNS",
    e: { w: "S&P 500 avg return = long-run historical annual gain from US stocks. Treasury yield = risk-free interest the US government pays on 10-year bonds.", d: "Stocks are risky — you can lose everything. The ~5.5% excess above the 2025 yield is the 'equity risk premium.' Yields rose sharply as the Fed hiked rates in 2022-2024." } },
  { a: { l: "Netflix Revenue (FY24)", v: 39, u: "B$" }, b: { l: "Spotify Revenue (FY24)", v: 16, u: "B$" }, c: "REVENUE",
    e: { w: "Revenue = total sales. Both are global subscription streaming companies.", d: "Netflix charges more per user (~$15-22/mo vs ~$11) and has far more paying subscribers globally. Higher price × more users = far larger revenue." } },
  { a: { l: "PE Fund Lifecycle", v: 10, u: "yr" }, b: { l: "VC Fund Lifecycle", v: 12, u: "yr" }, c: "FUNDS",
    e: { w: "Fund lifecycle = time from first close to final wind-down, when all investments are exited and capital returned to investors.", d: "VC backs early-stage startups that need years to reach IPO or acquisition. PE buys mature businesses that can be restructured and exited on a shorter timeline." } },
  { a: { l: "NYSE Listed Cos (2024)", v: 2300, u: "" }, b: { l: "NASDAQ Listed Cos (2024)", v: 3300, u: "" }, c: "EXCHANGES",
    e: { w: "Listed companies = businesses whose shares publicly trade on that exchange.", d: "NASDAQ has lower listing requirements and became the home of tech startups. NYSE is older with stricter standards — fewer but typically larger, more established companies." } },
  { a: { l: "BlackRock AUM (2024)", v: 11.5, u: "T$" }, b: { l: "Vanguard AUM (2024)", v: 9, u: "T$" }, c: "ASSET MGMT",
    e: { w: "Both are the world's two largest asset managers, running trillions across index funds, ETFs, and institutional mandates.", d: "BlackRock crossed $11.5T in 2024, managing active and passive strategies across more asset classes. Vanguard is primarily passive retail index funds — massive but narrower in scope." } },
  { a: { l: "Hedge Fund Mgmt Fee", v: 1.5, u: "%" }, b: { l: "Avg ETF Expense Ratio", v: 0.4, u: "%" }, c: "FEES",
    e: { w: "Annual fee charged as a % of AUM. Compounds significantly over time — a key reason most active managers fail to outperform after fees.", d: "Hedge funds charge for active management and claimed alpha. ETFs passively track an index — no stock-picking, minimal overhead, so cost is a fraction." } },
  { a: { l: "US IPOs in 2021", v: 1000, u: "" }, b: { l: "US IPOs in 2023", v: 150, u: "" }, c: "IPO MKT",
    e: { w: "IPO = Initial Public Offering. A private company lists on a stock exchange and sells shares to the public for the first time.", d: "2021 was an all-time boom driven by SPACs and near-zero interest rates. By 2023, rate hikes and falling valuations shut the IPO window almost entirely." } },
  { a: { l: "M&A Advisory Fee", v: 2, u: "%" }, b: { l: "PE Carry Rate", v: 20, u: "%" }, c: "FEES",
    e: { w: "M&A advisory fee = % of deal value banks charge for advising a transaction. PE carry = % of fund profits PE managers take above a minimum return hurdle (~8%).", d: "Banks earn fees regardless of outcome. PE carry is pure upside — managers only earn it if investors make strong returns. Different structures, wildly different incentives." } },
  { a: { l: "Amazon Gross Margin (FY24)", v: 48, u: "%" }, b: { l: "Walmart Gross Margin (FY25)", v: 24, u: "%" }, c: "MARGINS",
    e: { w: "Gross margin = (revenue − cost of goods sold) ÷ revenue. What remains after direct product costs, before operating expenses.", d: "Amazon blends high-margin AWS cloud and marketplace fees into its retail business. Walmart is almost entirely retail, competing on price — thin margins are the business model." } },
  { a: { l: "S&P500 Calls/Quarter", v: 500, u: "" }, b: { l: "Analysts per S&P500 Co", v: 20, u: "" }, c: "RESEARCH",
    e: { w: "Earnings calls = quarterly calls where companies discuss results with analysts and investors. Sell-side analysts = bank researchers who publish stock recommendations.", d: "~500 S&P500 companies each hold ~1 call per quarter. Large-cap stocks attract ~20 analysts on average, all competing to publish differentiated research." } },
  { a: { l: "Days to Close PE Deal", v: 180, u: "d" }, b: { l: "Days to IPO Process", v: 120, u: "d" }, c: "TIMELINES",
    e: { w: "Deal close = time from signing to completing a PE acquisition. IPO process = time from selecting banks to first trading day.", d: "PE deals involve bilateral negotiations, deep due diligence, and arranging debt financing — slow and complex. IPOs follow a structured roadshow that is faster but market-dependent." } },
  { a: { l: "US Equity Mkt Cap (2024)", v: 57, u: "T$" }, b: { l: "US Bond Mkt Size (2024)", v: 55, u: "T$" }, c: "MKT SIZE",
    e: { w: "Equity market cap = total value of publicly traded shares. Bond market size = total outstanding debt from governments, corporations, and agencies.", d: "A historic shift: US stocks overtook the bond market in 2024, powered by a surging bull run. For decades bonds were larger — continuous government debt issuance vs volatile equity prices. The 2023-2024 rally flipped the balance." } },
  { a: { l: "CAPEX/Rev Tech (2024)", v: 8, u: "%" }, b: { l: "CAPEX/Rev Telecom (2024)", v: 18, u: "%" }, c: "CAPEX",
    e: { w: "CAPEX/Revenue = capital expenditure on physical assets ÷ total sales. Measures how asset-intensive a business model is.", d: "Telecom requires massive physical infrastructure — towers, fiber, spectrum licenses — needing constant investment. Software businesses are largely asset-light; engineers replace factories." } },
  { a: { l: "Buy-Side Firms", v: 15000, u: "" }, b: { l: "Sell-Side Firms", v: 5000, u: "" }, c: "STRUCTURE",
    e: { w: "Buy-side = firms that invest capital (pension funds, PE, hedge funds). Sell-side = firms that advise and facilitate transactions (investment banks, brokers).", d: "The buy-side is fragmented — thousands of boutique funds exist globally. The sell-side is concentrated: a handful of large banks dominate advisory and trading." } },
  { a: { l: "LBO Debt Ratio (2024)", v: 60, u: "%" }, b: { l: "Public Co Debt Ratio", v: 35, u: "%" }, c: "LEVERAGE",
    e: { w: "Debt ratio = debt ÷ total capital. Shows how much of a business is financed by borrowing vs equity.", d: "In an LBO, PE loads companies with debt to amplify equity returns. Leverage declined to ~60% in 2024 as rising interest rates made heavy debt expensive. Public companies stay conservative — excessive debt spooks investors and credit agencies." } },
  { a: { l: "Top Quartile ROIC", v: 25, u: "%" }, b: { l: "Avg WACC (2024)", v: 10, u: "%" }, c: "RETURNS",
    e: { w: "ROIC = return on invested capital (profit ÷ capital employed). WACC = weighted average cost of capital — the minimum return needed to satisfy debt and equity holders.", d: "The best companies generate returns far above their cost of capital. That spread is how economic value is created. WACC rose to ~10% in 2024 as higher interest rates pushed up the cost of both debt and equity." } },
  { a: { l: "SaaS Rev Multiple (2024)", v: 6, u: "x" }, b: { l: "Banking Rev Multiple (2024)", v: 3, u: "x" }, c: "VALUATION",
    e: { w: "Revenue multiple = enterprise value ÷ annual revenue. Investors pay X dollars per dollar of annual sales.", d: "SaaS multiples compressed from peaks of 15-20x in 2021 to ~6x by 2024 as rising rates made high-multiple growth stocks expensive. Banking revenue is cyclical, regulated, and capital-intensive — discounted heavily." } },
  { a: { l: "Institutional Own SP500", v: 80, u: "%" }, b: { l: "Retail Own SP500", v: 20, u: "%" }, c: "OWNERSHIP",
    e: { w: "Institutional investors = pension funds, endowments, mutual funds, insurers. Retail = individual investors buying stocks directly.", d: "Most retail wealth flows into markets through institutional vehicles (401k, mutual funds). Institutions dominate because of scale, resources, and professional mandates." } },
  { a: { l: "Bloomberg Terminal/yr (2025)", v: 27000, u: "$" }, b: { l: "LSEG Workspace/yr (2025)", v: 22000, u: "$" }, c: "TOOLS",
    e: { w: "Both are professional financial data platforms for real-time market data and analytics. LSEG Workspace (formerly Refinitiv Eikon) was rebranded after LSEG's 2021 acquisition of Refinitiv.", d: "Bloomberg is the dominant industry standard — its network effect, data depth, and messaging system (Bloomberg Chat) justify the premium. LSEG Workspace is a capable challenger but hasn't broken Bloomberg's grip on institutional finance." } },
  { a: { l: "PE Dry Powder (2024)", v: 4, u: "T$" }, b: { l: "VC Dry Powder (2024)", v: 0.3, u: "T$" }, c: "DRY POWDER",
    e: { w: "Dry powder = capital that LPs (investors) have committed to a fund but that hasn't been deployed into investments yet.", d: "PE dry powder held near $4T in 2024 as dealmaking lagged fundraising. VC dry powder contracted to ~$300B as fundraising slowed sharply from the 2021 boom — LPs pulled back hard." } },
  { a: { l: "Buybacks SP500 (2024)", v: 930, u: "B$" }, b: { l: "Dividends SP500 (2024)", v: 620, u: "B$" }, c: "CAP RETURN",
    e: { w: "Buybacks = companies repurchase own shares, reducing share count and boosting EPS. Dividends = direct cash payments to shareholders.", d: "S&P 500 buybacks hit a record ~$930B in 2024 — flexible, tax-efficient, and signalling confidence. Dividend cuts are seen as red flags, so companies overwhelmingly prefer buybacks for excess capital." } },
  { a: { l: "EV/EBITDA Tech (2024)", v: 20, u: "x" }, b: { l: "EV/EBITDA Banks (2024)", v: 8, u: "x" }, c: "VALUATION",
    e: { w: "EV/EBITDA = enterprise value ÷ operating earnings. Shows what the market pays per dollar of profit.", d: "Tech trades at premium multiples for growth, scalability, and high margins. Banks face regulatory caps, credit cycle risks, and slower growth — valued cheaply vs earnings." } },
  { a: { l: "US Public Companies", v: 5000, u: "" }, b: { l: "US Private Cos >$100M", v: 18000, u: "" }, c: "STRUCTURE",
    e: { w: "Public companies trade on stock exchanges — anyone can buy shares. Private companies don't list publicly — owned by founders, PE, or other private investors.", d: "Going public requires expensive compliance, quarterly reporting, and constant scrutiny. Most large companies stay private — cheaper, less burdensome, and allows longer-term thinking." } },
  { a: { l: "Buy-Side Analyst Pay", v: 150, u: "K$" }, b: { l: "Sell-Side Analyst Pay", v: 100, u: "K$" }, c: "CAREERS",
    e: { w: "Buy-side analysts research investments for funds (directly impacting portfolio decisions). Sell-side analysts publish research for banks and brokers.", d: "Buy-side analysts are paid on portfolio performance — their edge translates directly to returns. Sell-side earns from commissions and banking fees, not investment outcomes, so comp is lower." } },
  { a: { l: "Global ESG AUM (2024)", v: 35, u: "T$" }, b: { l: "Crypto Market Cap (2025)", v: 3, u: "T$" }, c: "TRENDS",
    e: { w: "ESG AUM = capital in funds applying environmental, social, and governance filters. Crypto market cap = total value of all digital asset tokens.", d: "ESG is embedded in trillions of institutional mandates — pension funds, sovereign wealth funds. Crypto surged past $3T in 2025 as Bitcoin crossed $100K, yet remains small compared to traditional institutional finance." } },
  { a: { l: "Avg CEO Tenure", v: 7, u: "yr" }, b: { l: "Avg CFO Tenure", v: 5, u: "yr" }, c: "LEADERSHIP",
    e: { w: "Tenure = how long executives typically hold their role before leaving or being replaced.", d: "CEOs set long-term strategy — boards value stability. CFOs move faster: many get promoted to CEO, recruited away by larger companies, or replaced as financial complexity grows." } },
  { a: { l: "FCF Yield Tech (2024)", v: 3, u: "%" }, b: { l: "Div Yield Utilities (2024)", v: 3.5, u: "%" }, c: "YIELDS",
    e: { w: "FCF yield = free cash flow ÷ market cap. Dividend yield = annual dividend ÷ stock price. Both measure cash return relative to company value.", d: "Tech FCF yields compressed to ~3% in 2024 as surging valuations outpaced cash generation. Utilities raised dividends steadily; with higher rates lifting bond yields, utility payouts now match or edge out large-cap tech on this measure." } },

  // ── NEW 20 ───────────────────────────────────────────────────────────────
  { a: { l: "Apple Revenue (FY24)", v: 391, u: "B$" }, b: { l: "Microsoft Revenue (FY24)", v: 245, u: "B$" }, c: "REVENUE",
    e: { w: "Revenue = total annual sales. Both rank among the two largest companies in the world by market cap.", d: "Apple's iPhone + Mac + Services ecosystem generates more raw revenue than Microsoft's cloud and software empire. Microsoft is more profitable per dollar; Apple sells more in absolute terms." } },

  { a: { l: "Pharma Gross Margin (2024)", v: 70, u: "%" }, b: { l: "Consumer Goods Margin (2024)", v: 40, u: "%" }, c: "MARGINS",
    e: { w: "Gross margin = (revenue − cost of goods sold) ÷ revenue. What's left after direct production costs.", d: "Pharma prices reflect decades of R&D and patent monopolies — once a drug is developed, it costs little to manufacture. Consumer goods compete on volume with structurally thin margins." } },

  { a: { l: "Meta Op. Margin (FY24)", v: 42, u: "%" }, b: { l: "Google Op. Margin (FY24)", v: 32, u: "%" }, c: "MARGINS",
    e: { w: "Operating margin = operating profit ÷ revenue. Shows core business efficiency before interest and tax.", d: "Meta's revenue is almost entirely advertising on owned platforms — lean and highly profitable. Google invests heavily in cloud (lower margins), hardware, and moonshots, compressing the overall number." } },

  { a: { l: "FX Daily Volume (2022)", v: 7.5, u: "T$" }, b: { l: "Global Equity Daily Vol (2024)", v: 0.5, u: "T$" }, c: "MKT SIZE",
    e: { w: "Daily trading volume = total dollar value of transactions per day across all participants and venues. FX figure from BIS 2022 Triennial Survey, the most recent authoritative measure.", d: "Currency markets operate 24/7 — banks, corporates, and central banks transact continuously worldwide. Equity markets are restricted to business hours with far fewer participants per geography." } },

  { a: { l: "Derivatives Notional (2024)", v: 700, u: "T$" }, b: { l: "Global GDP (2024)", v: 110, u: "T$" }, c: "SCALE",
    e: { w: "Derivatives notional = face value of all outstanding contracts (BIS data). GDP = total global economic output per year (IMF WEO 2024).", d: "Notional vastly overstates true exposure — the same underlying risk is hedged multiple times across counterparties. It illustrates the extraordinary scale of financial engineering built on top of the real economy." } },

  { a: { l: "Norway GPFG AUM (2024)", v: 1.8, u: "T$" }, b: { l: "Saudi Arabia PIF (2024)", v: 0.9, u: "T$" }, c: "ASSET MGMT",
    e: { w: "Sovereign wealth fund AUM = state-owned investment capital managed on behalf of a nation.", d: "Norway's Government Pension Fund Global, built on North Sea oil revenues since the 1990s, is the world's largest SWF at ~$1.8T. Saudi Arabia's PIF grew rapidly to ~$0.9T through Vision 2030 but started much later." } },

  { a: { l: "Blackstone AUM (2024)", v: 1.1, u: "T$" }, b: { l: "KKR AUM (2024)", v: 0.6, u: "T$" }, c: "ASSET MGMT",
    e: { w: "AUM = assets under management — total capital deployed across all funds on behalf of institutional investors.", d: "Blackstone reached $1.1T by end 2024, the first alternatives manager to cross $1T. KKR is a close rival with the same PE heritage but manages less capital — both have diversified well beyond pure buyouts." } },

  { a: { l: "Berkshire CAGR '65–'24", v: 20, u: "%" }, b: { l: "S&P 500 CAGR '65–'24", v: 10, u: "%" }, c: "RETURNS",
    e: { w: "CAGR = compound annual growth rate. Berkshire's per-share book value vs S&P 500 total return, both since 1965 per Berkshire's 2024 Annual Report.", d: "Warren Buffett's compounding machine nearly doubles the S&P 500 annually over 60 years — an almost impossible feat and the central argument for quality long-term investing." } },

  { a: { l: "Nvidia P/E (fwd 2025)", v: 40, u: "x" }, b: { l: "S&P 500 P/E (fwd 2025)", v: 22, u: "x" }, c: "VALUATION",
    e: { w: "Forward P/E = stock price ÷ expected next-year earnings. Higher = investors pay more for future profits.", d: "Nvidia trades at a massive premium as markets price in years of AI-driven demand growth. The S&P 500 average blends growth and value companies — far more moderate expectations." } },

  { a: { l: "CFA Avg Completion", v: 4, u: "yr" }, b: { l: "Full-Time MBA", v: 2, u: "yr" }, c: "CAREERS",
    e: { w: "CFA = Chartered Financial Analyst, three levels of exams taken while working. MBA = full-time postgraduate degree.", d: "Most CFA candidates take 4+ years to pass all three levels while employed. An MBA is a 2-year full-time programme — faster but far more expensive and career-disruptive." } },

  { a: { l: "Global VC Funding 2021", v: 620, u: "B$" }, b: { l: "Global VC Funding 2023", v: 285, u: "B$" }, c: "TRENDS",
    e: { w: "Total global venture capital invested in each year across all stages and geographies (PitchBook data).", d: "2021 was a historic anomaly — near-zero rates and tech mania flooded startups with capital. 2023 saw a brutal correction: rate hikes and LP caution cut investment by more than half." } },

  { a: { l: "Amazon Revenue (FY24)", v: 638, u: "B$" }, b: { l: "Walmart Revenue (FY25)", v: 680, u: "B$" }, c: "REVENUE",
    e: { w: "Annual net revenue = total sales. Amazon FY24 = calendar year 2024. Walmart FY25 = fiscal year ending January 2025.", d: "Most assume Amazon is bigger, but Walmart's physical retail scale still edges it out. Amazon has caught up fast — primarily via AWS and marketplace fees — but Walmart moves more goods in dollar terms." } },

  { a: { l: "Active Fund Expense Ratio", v: 0.6, u: "%" }, b: { l: "Index Fund Expense Ratio", v: 0.05, u: "%" }, c: "FEES",
    e: { w: "Expense ratio = annual fee as % of AUM, automatically deducted from fund returns each year.", d: "Active managers charge for stock-picking skill. Most fail to outperform net of fees over a 10-year horizon. Index funds are mechanically cheap — no research team, minimal trading, no discretion." } },

  { a: { l: "IB Analyst Base NY", v: 110, u: "K$" }, b: { l: "MBB Consulting Base", v: 100, u: "K$" }, c: "CAREERS",
    e: { w: "Starting base salary: bulge bracket IB analyst (NYC) vs McKinsey/BCG/Bain undergrad hire.", d: "Both attract the same candidate pool. IB pays slightly more base, but bonuses diverge significantly — IB bonuses can equal or exceed base. The real difference is lifestyle: IB hours are punishing." } },

  { a: { l: "Amazon CAPEX (2024)", v: 78, u: "B$" }, b: { l: "Meta CAPEX (2024)", v: 39, u: "B$" }, c: "CAPEX",
    e: { w: "CAPEX = capital expenditure, annual spend on physical infrastructure including data centres, servers, and property.", d: "Amazon nearly doubled its CAPEX in 2024 to $78B as AWS builds AI infrastructure at extraordinary scale. Meta spent $39B on compute — heavily AI-focused — but at roughly half Amazon's rate." } },

  { a: { l: "US Mortgage Market (2024)", v: 13, u: "T$" }, b: { l: "US Auto Loans (2024)", v: 1.6, u: "T$" }, c: "MKT SIZE",
    e: { w: "Outstanding market size = total debt currently owed by all borrowers in each category (Federal Reserve Z.1 data).", d: "US housing is the largest single consumer asset class — mortgages dwarf all other personal debt. Auto loans are large in absolute terms but tied to depreciating assets with far shorter durations." } },

  { a: { l: "Microsoft Gross Margin (FY24)", v: 70, u: "%" }, b: { l: "Apple Gross Margin (FY24)", v: 46, u: "%" }, c: "MARGINS",
    e: { w: "Gross margin = (revenue − cost of goods sold) ÷ revenue. What remains after direct product costs.", d: "Microsoft sells mostly software and cloud — near-zero marginal cost to distribute another licence. Apple sells premium hardware alongside software — even at premium prices, hardware has real material costs." } },

  { a: { l: "Berkshire P/B (2025)", v: 1.7, u: "x" }, b: { l: "S&P 500 Avg P/B (2025)", v: 4.5, u: "x" }, c: "VALUATION",
    e: { w: "Price-to-book = market cap ÷ book value of net assets. Measures the premium markets pay above accounting value.", d: "Berkshire owns real assets — insurers, railroads, manufacturers — so book value is close to intrinsic value. The tech-heavy S&P trades at a massive premium to book because intangibles like brands and IP dominate." } },

  { a: { l: "Goldman Revenue (FY24)", v: 53, u: "B$" }, b: { l: "JPMorgan Revenue (FY24)", v: 177, u: "B$" }, c: "REVENUE",
    e: { w: "Net revenue = total income from all business lines including trading, advisory, and interest income.", d: "JPMorgan is a universal bank — consumer, commercial, and investment banking combined. Goldman is almost purely wholesale: trading, advisory, and asset management. The retail banking machine makes JPMorgan's revenues enormous." } },

  { a: { l: "Global Bond Market (2024)", v: 140, u: "T$" }, b: { l: "Global Equity Market (2024)", v: 115, u: "T$" }, c: "MKT SIZE",
    e: { w: "Total outstanding size — all bonds in circulation vs total market cap of all listed companies globally (BIS and WFE 2024 data).", d: "Most investors think of stocks first, but the bond market is larger globally. Governments and corporations issue debt continuously. Bonds are the deeper, quieter engine powering global finance." } },
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

export default function Game({ onBack, username, topPlayer, onLeaderboard }) {
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
  const scoreSubmitted = useRef(false);

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  // Submit score when game ends
  useEffect(() => {
    if (ph === "end" && !scoreSubmitted.current) {
      scoreSubmitted.current = true;
      submitScore(username, "finance", sc);
    }
  }, [ph, sc, username]);

  const start = useCallback(() => {
    scoreSubmitted.current = false;
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
    <div className="page-root" style={{ fontFamily: "'IBM Plex Mono',monospace", background: BG, color: C, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", userSelect: "none" }}>
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
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
          <span onClick={onLeaderboard} style={{ cursor: "pointer", letterSpacing: 3, opacity: 0.7, transition: "opacity 0.15s", flexShrink: 0 }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7}>SEE LEADERBOARD</span>
          <span style={{ opacity: 0.25 }}>|</span>
          {[["STO", "Europe/Stockholm"], ["DUB", "Europe/Dublin"], ["NYC", "America/New_York"]].map(([label, tz]) => (
            <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ fontFeatureSettings: "'tnum'" }}>{getTZTime(tz)}</span></span>
          ))}
        </div>
        <div className="topbar-ctr" style={{ fontSize: 10, letterSpacing: 4, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" }} onClick={onBack} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>QUARTR LABS GAME STUDIO</div>
        <div className="mob-hide" style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
          {topPlayer && (
            <>
              <span style={{ whiteSpace: "nowrap", opacity: 0.7 }}>№1 <span style={{ fontWeight: 700, opacity: 1 }}>{topPlayer}</span></span>
              <span style={{ opacity: 0.25 }}>|</span>
            </>
          )}
          {[
            { label: "NASDAQ", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
            { label: "LSE",    tz: "Europe/London",    oh: 8, om: 0,  ch: 16, cm: 30 },
            { label: "STO",    tz: "Europe/Stockholm", oh: 9, om: 0,  ch: 17, cm: 30 },
          ].map(({ label, tz, oh, om, ch, cm }) => {
            const open = isMktOpen(tz, oh, om, ch, cm);
            return (
              <span key={label} style={{ whiteSpace: "nowrap" }}>{label} <span style={{ color: open ? "#2DFF72" : ERR, animation: open ? "pulse 1.5s ease-in-out infinite" : "none" }}>{open ? "OPEN" : "CLOSED"}</span></span>
            );
          })}
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div className="scroll-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: showExp ? "flex-start" : "center", padding: "20px 16px", position: "relative", overflowY: "auto" }}>

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
              <div className="g-card" style={{ borderRight: `1px solid ${rv ? (res ? ac : ERR) : C}`, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "border-color 0.3s" }}>
                <div style={{ fontSize: 9, letterSpacing: 5, marginBottom: 14 }}>KNOWN</div>
                <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.5, marginBottom: 20 }}>{q.a.l}</div>
                <div style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, fontFeatureSettings: "'tnum'", letterSpacing: 2 }}>
                  {fmt(q.a.v, q.a.u)}
                </div>
              </div>

              {/* UNKNOWN */}
              <div className="g-card" style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
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
