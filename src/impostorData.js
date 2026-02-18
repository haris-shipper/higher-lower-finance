// IMPOSTOR — Spot the Fake
// Each round: 4 sentences, 3 correct uses of a finance term, 1 plausible misuse.
// Tier 1 (12): obvious wrong category/actor
// Tier 2 (12): right category, wrong application
// Tier 3 (12): corporate/IR terms
// Tier 4 (12): harder finance/valuation terms
// Tier 5 (12): subtle, mixed-category impostor

export const ROUNDS = [
  // ─── TIER 1 ────────────────────────────────────────────────────────────────
  {
    id: 1, tier: 1,
    sentences: [
      { text: "The hedge fund's AUM grew to $4.2B after strong inflows this quarter.", term: "AUM", isImpostor: false },
      { text: "Investors compare AUM across funds to gauge the manager's scale and resources.", term: "AUM", isImpostor: false },
      { text: "A fund with declining AUM may struggle to cover its fixed operating costs.", term: "AUM", isImpostor: false },
      { text: "The sell-side analyst reported AUM of $800M in her latest equity research note.", term: "AUM", isImpostor: true, reason: "AUM (Assets Under Management) is a buy-side metric — it describes the value of assets a fund manages on behalf of clients. Sell-side analysts don't manage assets; they publish research.", fix: "The fund manager reported AUM of $800M in his quarterly investor letter." },
    ],
  },
  {
    id: 2, tier: 1,
    sentences: [
      { text: "The sell-side analyst initiated COVERAGE on the biotech with a Buy rating.", term: "COVERAGE", isImpostor: false },
      { text: "COVERAGE was dropped when the broker lost the corporate banking mandate.", term: "COVERAGE", isImpostor: false },
      { text: "The company gained two new COVERAGE analysts after the investor day.", term: "COVERAGE", isImpostor: false },
      { text: "The hedge fund published COVERAGE on ASML with a 12-month price target.", term: "COVERAGE", isImpostor: true, reason: "Equity research COVERAGE is a sell-side product — published by sell-side analysts at brokers. Buy-side funds write internal investment memos when initiating positions; they don't publish public coverage.", fix: "The sell-side analyst published COVERAGE on ASML with a 12-month price target." },
    ],
  },
  {
    id: 3, tier: 1,
    sentences: [
      { text: "The fund generated ALPHA by building positions before consensus shifted.", term: "ALPHA", isImpostor: false },
      { text: "Generating ALPHA consistently requires a genuine information or analytical edge.", term: "ALPHA", isImpostor: false },
      { text: "A fund up 8% in a flat market is delivering significant ALPHA over the benchmark.", term: "ALPHA", isImpostor: false },
      { text: "The PM adjusted his ALPHA to 12% ahead of the earnings season.", term: "ALPHA", isImpostor: true, reason: "ALPHA is a performance measure — excess return versus the benchmark. It's an outcome of investing, not a dial you can manually adjust or target like a setting on a machine.", fix: "The PM targeted 12% annualised returns by adjusting his portfolio positioning." },
    ],
  },
  {
    id: 4, tier: 1,
    sentences: [
      { text: "The fund suffered a DRAWDOWN of 22% before recovering in Q3.", term: "DRAWDOWN", isImpostor: false },
      { text: "Risk limits are often set based on maximum acceptable DRAWDOWN thresholds.", term: "DRAWDOWN", isImpostor: false },
      { text: "The manager reviewed DRAWDOWN history to assess the portfolio's resilience.", term: "DRAWDOWN", isImpostor: false },
      { text: "The company reported a DRAWDOWN in customer acquisition after the campaign ended.", term: "DRAWDOWN", isImpostor: true, reason: "DRAWDOWN measures peak-to-trough decline in a fund or portfolio. It's an investment term, not used to describe corporate business metrics like customer acquisition trends.", fix: "The company reported a decline in customer acquisition after the campaign ended." },
    ],
  },
  {
    id: 5, tier: 1,
    sentences: [
      { text: "The fund's MANDATE restricted exposure to illiquid small-cap stocks.", term: "MANDATE", isImpostor: false },
      { text: "LPs review the MANDATE carefully before committing capital to a fund.", term: "MANDATE", isImpostor: false },
      { text: "The MANDATE was amended to allow up to 20% allocation to emerging market bonds.", term: "MANDATE", isImpostor: false },
      { text: "The sell-side analyst exceeded her MANDATE by publishing notes on biotech stocks.", term: "MANDATE", isImpostor: true, reason: "MANDATE refers to a buy-side fund's investment guidelines set by LPs. Sell-side analysts operate under sector remits and editorial/compliance policies — not investment mandates.", fix: "The sell-side analyst exceeded her sector remit by publishing notes on biotech stocks." },
    ],
  },
  {
    id: 6, tier: 1,
    sentences: [
      { text: "The analyst pulled the earnings TRANSCRIPT to review management's exact wording.", term: "TRANSCRIPT", isImpostor: false },
      { text: "TRANSCRIPT analysis revealed a shift in CFO tone around capital expenditure guidance.", term: "TRANSCRIPT", isImpostor: false },
      { text: "The TRANSCRIPT confirmed guidance had been raised for the third consecutive quarter.", term: "TRANSCRIPT", isImpostor: false },
      { text: "The IR team published a TRANSCRIPT of their internal board meeting for shareholders.", term: "TRANSCRIPT", isImpostor: true, reason: "In finance, TRANSCRIPT refers to earnings call transcripts — public records of investor-facing calls. Internal board meeting minutes are confidential and legally privileged; they are never published.", fix: "The IR team published a TRANSCRIPT of the quarterly earnings call for investors." },
    ],
  },
  {
    id: 7, tier: 1,
    sentences: [
      { text: "The fund went SHORT the retailer after spotting deteriorating inventory trends.", term: "SHORT", isImpostor: false },
      { text: "SHORT positions profit when the underlying stock declines in price.", term: "SHORT", isImpostor: false },
      { text: "The manager disclosed a 3% SHORT position in the regulatory filing.", term: "SHORT", isImpostor: false },
      { text: "The CFO explained that going SHORT on operational costs would improve margins.", term: "SHORT", isImpostor: true, reason: "SHORT is an investment position — borrowing and selling a security expecting it to fall. It is not an operational strategy. Companies reduce costs, they don't 'go short' on them.", fix: "The CFO explained that reducing operational costs would improve the company's margins." },
    ],
  },
  {
    id: 8, tier: 1,
    sentences: [
      { text: "The portfolio has a BETA of 1.4, meaning it amplifies market moves significantly.", term: "BETA", isImpostor: false },
      { text: "Low BETA stocks are favoured during periods of elevated market uncertainty.", term: "BETA", isImpostor: false },
      { text: "The manager reduced BETA by increasing allocation to defensive sectors.", term: "BETA", isImpostor: false },
      { text: "The company lowered its BETA by divesting cyclical business units last year.", term: "BETA", isImpostor: true, reason: "BETA measures a portfolio's or stock's sensitivity to market movements — it's a market-derived metric. A company can't 'lower its beta' by divesting units; beta changes based on how the market perceives the stock.", fix: "The company reduced its earnings cyclicality by divesting cyclical business units." },
    ],
  },
  {
    id: 9, tier: 1,
    sentences: [
      { text: "Management raised full-year GUIDANCE to €2.1B in revenue on the earnings call.", term: "GUIDANCE", isImpostor: false },
      { text: "GUIDANCE was withdrawn as visibility into Q4 remained too limited.", term: "GUIDANCE", isImpostor: false },
      { text: "The analyst revised her estimates after GUIDANCE came in ahead of consensus.", term: "GUIDANCE", isImpostor: false },
      { text: "The PM issued GUIDANCE to investors recommending they buy the stock immediately.", term: "GUIDANCE", isImpostor: true, reason: "GUIDANCE is forward-looking information issued by company management about their own business performance. Buy-side PMs share investment views via investment memos or letters — not public guidance.", fix: "The PM issued a recommendation to investors outlining his investment thesis on the stock." },
    ],
  },
  {
    id: 10, tier: 1,
    sentences: [
      { text: "The analyst dialled into the EARNINGS CALL to hear management's prepared remarks.", term: "EARNINGS CALL", isImpostor: false },
      { text: "The CFO addressed supply chain concerns during the EARNINGS CALL Q&A segment.", term: "EARNINGS CALL", isImpostor: false },
      { text: "The EARNINGS CALL transcript was published within two hours of the call ending.", term: "EARNINGS CALL", isImpostor: false },
      { text: "The sell-side analyst hosted an EARNINGS CALL to present his new price target.", term: "EARNINGS CALL", isImpostor: true, reason: "EARNINGS CALL is hosted by company management and the IR team to report results to investors. Sell-side analysts host teach-ins, client calls, or roadshow presentations — not earnings calls.", fix: "The sell-side analyst hosted a TEACH-IN to present his new price target to clients." },
    ],
  },
  {
    id: 11, tier: 1,
    sentences: [
      { text: "The fund built a LONG position in the software company after the earnings beat.", term: "LONG", isImpostor: false },
      { text: "Being LONG a cyclical stock in a downturn can cause significant drawdown.", term: "LONG", isImpostor: false },
      { text: "The fund manager disclosed a LONG position of 5.2% in the quarterly filing.", term: "LONG", isImpostor: false },
      { text: "The IR director went LONG on the company's narrative by extending the investor day.", term: "LONG", isImpostor: true, reason: "LONG is an investment position — owning a security expecting it to appreciate. It is not used to describe corporate communication strategies or presentation lengths.", fix: "The IR director extended the investor day to allow more time for the company's narrative." },
    ],
  },
  {
    id: 12, tier: 1,
    sentences: [
      { text: "The analyst used BOTTOM-UP research to build his model from individual company data.", term: "BOTTOM-UP", isImpostor: false },
      { text: "BOTTOM-UP investing ignores macro trends in favour of company-specific fundamentals.", term: "BOTTOM-UP", isImpostor: false },
      { text: "A BOTTOM-UP approach requires deep knowledge of individual business models.", term: "BOTTOM-UP", isImpostor: false },
      { text: "The CFO took a BOTTOM-UP approach to setting the company's share price target.", term: "BOTTOM-UP", isImpostor: true, reason: "BOTTOM-UP is an investment research methodology used by analysts and fund managers. Companies don't set share price targets — sell-side analysts do, based on their own valuation models.", fix: "The analyst took a BOTTOM-UP approach to deriving his share price target." },
    ],
  },

  // ─── TIER 2 ────────────────────────────────────────────────────────────────
  {
    id: 13, tier: 2,
    sentences: [
      { text: "The stock dropped 8% after earnings missed CONSENSUS by more than 10%.", term: "CONSENSUS", isImpostor: false },
      { text: "The fund built a position expecting a CONSENSUS revision cycle upward.", term: "CONSENSUS", isImpostor: false },
      { text: "CONSENSUS revenue estimates for the sector were revised down across the board.", term: "CONSENSUS", isImpostor: false },
      { text: "The company adjusted its strategy specifically to beat CONSENSUS analyst forecasts.", term: "CONSENSUS", isImpostor: true, reason: "Companies set strategy based on operational and commercial logic, not to beat external CONSENSUS forecasts. Deliberately managing to beat consensus would mean optimising for short-term optics, not genuine business performance.", fix: "The company adjusted its strategy after analysts flagged concerns about its growth trajectory." },
    ],
  },
  {
    id: 14, tier: 2,
    sentences: [
      { text: "The analyst published an INITIATION OF COVERAGE on the stock with a Buy rating.", term: "INITIATION OF COVERAGE", isImpostor: false },
      { text: "INITIATION OF COVERAGE reports are typically longer and more detailed than regular notes.", term: "INITIATION OF COVERAGE", isImpostor: false },
      { text: "The stock re-rated after a top-tier bank published an INITIATION OF COVERAGE.", term: "INITIATION OF COVERAGE", isImpostor: false },
      { text: "The fund manager published an INITIATION OF COVERAGE after building a large position.", term: "INITIATION OF COVERAGE", isImpostor: true, reason: "INITIATION OF COVERAGE is a sell-side product — an analyst's first published research note on a company. Buy-side managers write internal investment memos when initiating positions, not public research.", fix: "The fund manager published an internal investment memo after initiating a large position." },
    ],
  },
  {
    id: 15, tier: 2,
    sentences: [
      { text: "The analyst raised her PRICE TARGET on the stock from €45 to €62 after the beat.", term: "PRICE TARGET", isImpostor: false },
      { text: "A consensus of PRICE TARGETS puts fair value at approximately €55 per share.", term: "PRICE TARGET", isImpostor: false },
      { text: "The PRICE TARGET was set using a blended DCF and peer multiple approach.", term: "PRICE TARGET", isImpostor: false },
      { text: "The company issued a PRICE TARGET of €70 per share in its annual report.", term: "PRICE TARGET", isImpostor: true, reason: "PRICE TARGET is set by sell-side analysts based on their independent valuation models. Companies issue guidance on revenue, profit, and growth — they never set PRICE TARGETS on their own stock.", fix: "The analyst issued a PRICE TARGET of €70 per share after reviewing the annual report." },
    ],
  },
  {
    id: 16, tier: 2,
    sentences: [
      { text: "His VARIANT VIEW was that margins would expand despite sector-wide headwinds.", term: "VARIANT VIEW", isImpostor: false },
      { text: "A strong VARIANT VIEW gives a fund the conviction to hold through volatility.", term: "VARIANT VIEW", isImpostor: false },
      { text: "She built her VARIANT VIEW by finding primary data the sell-side had overlooked.", term: "VARIANT VIEW", isImpostor: false },
      { text: "The IR team promoted their VARIANT VIEW to attract long-only investors.", term: "VARIANT VIEW", isImpostor: true, reason: "VARIANT VIEW is a buy-side concept — a fund's differentiated, non-consensus perspective underpinning an investment thesis. IR teams present the company's equity story and strategy; they don't hold or promote investment views.", fix: "The IR team promoted the company's long-term equity story to attract long-only investors." },
    ],
  },
  {
    id: 17, tier: 2,
    sentences: [
      { text: "Her INVESTMENT THESIS rested on margin recovery being under-appreciated by the market.", term: "INVESTMENT THESIS", isImpostor: false },
      { text: "A strong INVESTMENT THESIS must identify precisely what the market is getting wrong.", term: "INVESTMENT THESIS", isImpostor: false },
      { text: "The fund's INVESTMENT THESIS on the stock played out exactly as expected over two years.", term: "INVESTMENT THESIS", isImpostor: false },
      { text: "The CFO outlined his INVESTMENT THESIS for the company's expansion into Asia.", term: "INVESTMENT THESIS", isImpostor: true, reason: "INVESTMENT THESIS is a buy-side framework for why a stock should outperform. CFOs present strategic rationale, business case, or capital allocation logic — not investment theses.", fix: "The CFO outlined the strategic rationale for the company's expansion into Asia." },
    ],
  },
  {
    id: 18, tier: 2,
    sentences: [
      { text: "The upcoming FDA decision was the key CATALYST for the biotech position.", term: "CATALYST", isImpostor: false },
      { text: "Without a near-term CATALYST, the stock could remain range-bound for months.", term: "CATALYST", isImpostor: false },
      { text: "The fund timed its entry to coincide with an expected CATALYST in Q2.", term: "CATALYST", isImpostor: false },
      { text: "The company announced a CATALYST program to accelerate its R&D spending.", term: "CATALYST", isImpostor: true, reason: "In investment contexts, CATALYST means an event expected to unlock value in a stock — an earnings beat, product launch, or regulatory decision. It is not a term for a corporate initiative or program name.", fix: "The company announced an accelerated R&D program to drive product development." },
    ],
  },
  {
    id: 19, tier: 2,
    sentences: [
      { text: "FUNDAMENTAL ANALYSIS focuses on financials, management quality, and competitive position.", term: "FUNDAMENTAL ANALYSIS", isImpostor: false },
      { text: "He relied on FUNDAMENTAL ANALYSIS rather than technical charts to size the position.", term: "FUNDAMENTAL ANALYSIS", isImpostor: false },
      { text: "FUNDAMENTAL ANALYSIS takes months; the fund accordingly had a 3-year time horizon.", term: "FUNDAMENTAL ANALYSIS", isImpostor: false },
      { text: "The IR team conducted FUNDAMENTAL ANALYSIS to assess their peer group's valuation.", term: "FUNDAMENTAL ANALYSIS", isImpostor: true, reason: "FUNDAMENTAL ANALYSIS is performed by buy-side investors to evaluate stocks. IR teams conduct peer benchmarking and shareholder analysis — they're on the company side, not running investor-style analysis.", fix: "The IR team conducted a peer benchmarking exercise to assess their relative valuation." },
    ],
  },
  {
    id: 20, tier: 2,
    sentences: [
      { text: "The fund's high CONVICTION in the position was reflected in a 6% portfolio weight.", term: "CONVICTION", isImpostor: false },
      { text: "CONVICTION builds as primary research confirms the investment thesis over time.", term: "CONVICTION", isImpostor: false },
      { text: "Without strong CONVICTION, the fund trimmed the position during the volatile period.", term: "CONVICTION", isImpostor: false },
      { text: "The CEO expressed CONVICTION that the stock would outperform its peers this year.", term: "CONVICTION", isImpostor: true, reason: "CONVICTION is a buy-side term for the strength of belief in an investment position. CEOs expressing views on their own stock's relative performance raises serious forward guidance and selective disclosure concerns.", fix: "The CEO expressed confidence that the business would deliver on its full-year targets." },
    ],
  },
  {
    id: 21, tier: 2,
    sentences: [
      { text: "The company launched a ROADSHOW ahead of the equity offering to meet investors.", term: "ROADSHOW", isImpostor: false },
      { text: "The CFO spent two weeks on a ROADSHOW visiting funds across New York and London.", term: "ROADSHOW", isImpostor: false },
      { text: "The ROADSHOW generated strong demand and the book was oversubscribed by 4x.", term: "ROADSHOW", isImpostor: false },
      { text: "The sell-side analyst hosted a ROADSHOW to present his new coverage thesis to clients.", term: "ROADSHOW", isImpostor: true, reason: "ROADSHOW is a company-led event where management meets investors, typically around capital raises or IPOs. Analysts host teach-ins, client events, or investor calls to share research — not roadshows.", fix: "The sell-side analyst hosted a TEACH-IN to present his new coverage thesis to clients." },
    ],
  },
  {
    id: 22, tier: 2,
    sentences: [
      { text: "CHANNEL CHECKS with retailers revealed inventory was normalising faster than expected.", term: "CHANNEL CHECKS", isImpostor: false },
      { text: "The analyst conducted CHANNEL CHECKS before revising her margin estimates upward.", term: "CHANNEL CHECKS", isImpostor: false },
      { text: "CHANNEL CHECKS are a common form of primary research for consumer-facing businesses.", term: "CHANNEL CHECKS", isImpostor: false },
      { text: "The IR manager performed CHANNEL CHECKS to validate his investor outreach strategy.", term: "CHANNEL CHECKS", isImpostor: true, reason: "CHANNEL CHECKS are primary research conducted by sell-side analysts — gathering intelligence from distributors, retailers, or customers. IR teams manage investor relations; they don't conduct supply chain intelligence.", fix: "The IR manager reviewed CRM data to assess the effectiveness of his investor outreach." },
    ],
  },
  {
    id: 23, tier: 2,
    sentences: [
      { text: "The fund paid for research access using SOFT DOLLAR arrangements with the broker.", term: "SOFT DOLLAR", isImpostor: false },
      { text: "MiFID II significantly restricted the use of SOFT DOLLAR payments for research.", term: "SOFT DOLLAR", isImpostor: false },
      { text: "SOFT DOLLAR agreements allow funds to pay for services via trading commissions.", term: "SOFT DOLLAR", isImpostor: false },
      { text: "The company paid its IR consultant in SOFT DOLLARS to avoid disclosure requirements.", term: "SOFT DOLLAR", isImpostor: true, reason: "SOFT DOLLAR arrangements are strictly between buy-side funds and brokers — commissions used to pay for research and services. Companies pay IR consultants directly with cash retainers, not soft dollar agreements.", fix: "The company paid the IR consultant on a monthly retainer to manage investor outreach." },
    ],
  },
  {
    id: 24, tier: 2,
    sentences: [
      { text: "The analyst published an EARNINGS PREVIEW the week before the quarterly results.", term: "EARNINGS PREVIEW", isImpostor: false },
      { text: "EARNINGS PREVIEW notes outline analyst expectations for revenue, margins, and guidance.", term: "EARNINGS PREVIEW", isImpostor: false },
      { text: "The EARNINGS PREVIEW flagged upside risk to consensus margin estimates.", term: "EARNINGS PREVIEW", isImpostor: false },
      { text: "The CFO issued an EARNINGS PREVIEW to prime the market before the results call.", term: "EARNINGS PREVIEW", isImpostor: true, reason: "EARNINGS PREVIEW is a sell-side research product published by analysts ahead of results. Companies communicate via guidance updates, trading statements, or pre-announcements — not earnings previews.", fix: "The CFO issued a trading update with revised guidance to prime the market before results." },
    ],
  },

  // ─── TIER 3 ────────────────────────────────────────────────────────────────
  {
    id: 25, tier: 3,
    sentences: [
      { text: "The company entered QUIET PERIOD two weeks before the earnings release.", term: "QUIET PERIOD", isImpostor: false },
      { text: "During QUIET PERIOD, IR staff decline to discuss financial performance with investors.", term: "QUIET PERIOD", isImpostor: false },
      { text: "The investor's meeting request was declined — the company was in QUIET PERIOD.", term: "QUIET PERIOD", isImpostor: false },
      { text: "The analyst checked QUIET PERIOD expiry to assess if the stock was liquid enough to trade.", term: "QUIET PERIOD", isImpostor: true, reason: "QUIET PERIOD restricts what company insiders can communicate before results — it's about communications, not trading liquidity. Stock liquidity is a function of trading volume and market depth, unrelated to quiet periods.", fix: "The analyst checked the earnings release date to assess the timing for entering the position." },
    ],
  },
  {
    id: 26, tier: 3,
    sentences: [
      { text: "The presentation opened with a SAFE HARBOR statement covering forward-looking remarks.", term: "SAFE HARBOR", isImpostor: false },
      { text: "SAFE HARBOR language protects companies from liability if projections prove inaccurate.", term: "SAFE HARBOR", isImpostor: false },
      { text: "The CFO reminded the audience of the SAFE HARBOR statement before discussing guidance.", term: "SAFE HARBOR", isImpostor: false },
      { text: "The fund used SAFE HARBOR rules to shield their short position from public disclosure.", term: "SAFE HARBOR", isImpostor: true, reason: "SAFE HARBOR protects companies from liability over forward-looking statements in investor communications. Investment funds disclose positions under separate regulatory frameworks — 13F filings, short position reporting — not safe harbor provisions.", fix: "The fund reviewed disclosure thresholds to understand their short position reporting obligations." },
    ],
  },
  {
    id: 27, tier: 3,
    sentences: [
      { text: "The IR director refused to share MATERIAL INFORMATION before the public announcement.", term: "MATERIAL INFORMATION", isImpostor: false },
      { text: "Trading on MATERIAL INFORMATION before it is publicly disclosed is illegal.", term: "MATERIAL INFORMATION", isImpostor: false },
      { text: "The legal team reviewed whether the partnership deal constituted MATERIAL INFORMATION.", term: "MATERIAL INFORMATION", isImpostor: false },
      { text: "The analyst labelled his channel check findings as MATERIAL INFORMATION in his research note.", term: "MATERIAL INFORMATION", isImpostor: true, reason: "MATERIAL INFORMATION refers specifically to non-public company information that could move the stock — sharing it selectively is illegal. Analyst channel checks are independent research from semi-public sources, not material non-public information.", fix: "The analyst labelled his channel check findings as market-moving intelligence in his research note." },
    ],
  },
  {
    id: 28, tier: 3,
    sentences: [
      { text: "The CAPITAL MARKETS DAY featured three hours of management presentations and Q&A.", term: "CAPITAL MARKETS DAY", isImpostor: false },
      { text: "The stock re-rated after CAPITAL MARKETS DAY delivered clear medium-term financial targets.", term: "CAPITAL MARKETS DAY", isImpostor: false },
      { text: "Over 200 analysts and fund managers attended the CAPITAL MARKETS DAY in person.", term: "CAPITAL MARKETS DAY", isImpostor: false },
      { text: "The fund hosted a CAPITAL MARKETS DAY to pitch their new strategy to limited partners.", term: "CAPITAL MARKETS DAY", isImpostor: true, reason: "CAPITAL MARKETS DAY is hosted by listed companies to update investors on strategy and targets. Buy-side funds hold LP Days or Annual Meetings to update their limited partners — not capital markets days.", fix: "The fund hosted an LP Day to pitch their new strategy to their limited partners." },
    ],
  },
  {
    id: 29, tier: 3,
    sentences: [
      { text: "The analyst reviewed the 10-K to assess goodwill impairment risk in the balance sheet.", term: "10-K", isImpostor: false },
      { text: "The 10-K contains audited financials, risk factors, and detailed management commentary.", term: "10-K", isImpostor: false },
      { text: "The entity structure was buried in the 10-K's footnotes on page 84.", term: "10-K", isImpostor: false },
      { text: "The PM filed a 10-K to disclose the fund's annual performance to the SEC.", term: "10-K", isImpostor: true, reason: "10-K is an annual report filed by publicly listed companies with the SEC. Investment funds file different forms — hedge funds submit 13F filings for holdings disclosure, not 10-Ks.", fix: "The PM filed a 13F to disclose the fund's equity holdings to the SEC." },
    ],
  },
  {
    id: 30, tier: 3,
    sentences: [
      { text: "The CFO went on a NON-DEAL ROADSHOW to update investors between capital raises.", term: "NON-DEAL ROADSHOW", isImpostor: false },
      { text: "A NON-DEAL ROADSHOW focuses on strategy and performance updates, not raising equity.", term: "NON-DEAL ROADSHOW", isImpostor: false },
      { text: "The IR team booked 40 one-on-one meetings for the NON-DEAL ROADSHOW in New York.", term: "NON-DEAL ROADSHOW", isImpostor: false },
      { text: "The sell-side analyst coordinated a NON-DEAL ROADSHOW to promote his latest research note.", term: "NON-DEAL ROADSHOW", isImpostor: true, reason: "NON-DEAL ROADSHOW is led by company management — IR and CFO — to meet investors without a capital raise. Sell-side analysts arrange corporate access events and teach-ins to share research.", fix: "The sell-side analyst coordinated a CORPORATE ACCESS event to promote his latest research note." },
    ],
  },
  {
    id: 31, tier: 3,
    sentences: [
      { text: "The company guided for EBITDA of €350M, ahead of consensus at €320M.", term: "EBITDA", isImpostor: false },
      { text: "EBITDA strips out financing costs and tax to show operational profitability.", term: "EBITDA", isImpostor: false },
      { text: "The EV/EBITDA multiple contracted from 18x to 14x as earnings disappointed.", term: "EBITDA", isImpostor: false },
      { text: "The fund valued the company at 15x EBITDA, then adjusted for the hedge book directly.", term: "EBITDA", isImpostor: true, reason: "You don't adjust the EBITDA multiple itself for a hedge book. Hedge liabilities are separate — they flow into the net debt adjustment to Enterprise Value, not into the EBITDA multiple.", fix: "The fund valued the company at 15x EBITDA, then adjusted Enterprise Value for net debt and hedge book liabilities." },
    ],
  },
  {
    id: 32, tier: 3,
    sentences: [
      { text: "The company generated FCF of $420M despite heavy reinvestment in the platform.", term: "FCF", isImpostor: false },
      { text: "FCF yield of 8% made the stock attractive relative to bond market alternatives.", term: "FCF", isImpostor: false },
      { text: "FCF conversion of 85% indicated most EBITDA was flowing through to cash.", term: "FCF", isImpostor: false },
      { text: "The analyst adjusted FCF upward to account for the company's brand value.", term: "FCF", isImpostor: true, reason: "FCF (Free Cash Flow) is a cash-based metric: operating cash flow minus capital expenditure. Brand value is an intangible asset — it has no direct effect on cash generation and is not an FCF adjustment.", fix: "The analyst applied a premium to the EV/Sales multiple to account for the company's superior brand value." },
    ],
  },
  {
    id: 33, tier: 3,
    sentences: [
      { text: "The EQUITY STORY centred on a margin recovery the market had not yet priced in.", term: "EQUITY STORY", isImpostor: false },
      { text: "IR's job is to ensure the EQUITY STORY is consistent across all investor touchpoints.", term: "EQUITY STORY", isImpostor: false },
      { text: "The new CEO refreshed the EQUITY STORY after the strategic review was completed.", term: "EQUITY STORY", isImpostor: false },
      { text: "The analyst rewrote the EQUITY STORY after initiating coverage with a Sell rating.", term: "EQUITY STORY", isImpostor: true, reason: "EQUITY STORY is owned by the company — the narrative management and IR craft to explain their investment case. Analysts write their own investment thesis or research note, independent of the company's equity story.", fix: "The analyst outlined a bearish INVESTMENT THESIS after initiating coverage with a Sell rating." },
    ],
  },
  {
    id: 34, tier: 3,
    sentences: [
      { text: "The company introduced new KPIs at the CMD to track its platform transition.", term: "KPIs", isImpostor: false },
      { text: "KPIs were restated when the business model shifted from hardware to SaaS.", term: "KPIs", isImpostor: false },
      { text: "Investors monitored KPIs like net revenue retention and monthly churn closely.", term: "KPIs", isImpostor: false },
      { text: "The analyst set KPIs for management to hit before upgrading the stock to Buy.", term: "KPIs", isImpostor: true, reason: "KPIs are defined by company management to track their own business performance. Analysts may set upgrade conditions or milestones for a rating change — but they don't set company KPIs.", fix: "The analyst outlined the conditions management needed to meet before he would upgrade the stock to Buy." },
    ],
  },
  {
    id: 35, tier: 3,
    sentences: [
      { text: "The IR team mapped the SHAREHOLDER BASE to identify target long-only funds.", term: "SHAREHOLDER BASE", isImpostor: false },
      { text: "After the sell-off, the SHAREHOLDER BASE had shifted heavily toward short-term traders.", term: "SHAREHOLDER BASE", isImpostor: false },
      { text: "A stable SHAREHOLDER BASE of long-term holders reduces unnecessary stock volatility.", term: "SHAREHOLDER BASE", isImpostor: false },
      { text: "The fund restructured its SHAREHOLDER BASE by onboarding new limited partners in Q3.", term: "SHAREHOLDER BASE", isImpostor: true, reason: "SHAREHOLDER BASE refers to the composition of investors in a publicly listed company. Funds have an LP base (limited partners) — they are not listed companies and don't have shareholders in this sense.", fix: "The fund expanded its LP base by onboarding new limited partners in Q3." },
    ],
  },
  {
    id: 36, tier: 3,
    sentences: [
      { text: "The company gained two new SELL-SIDE COVERAGE analysts after the investor day.", term: "SELL-SIDE COVERAGE", isImpostor: false },
      { text: "Broader SELL-SIDE COVERAGE improves stock liquidity and institutional awareness.", term: "SELL-SIDE COVERAGE", isImpostor: false },
      { text: "SELL-SIDE COVERAGE was discontinued when the broker lost the corporate mandate.", term: "SELL-SIDE COVERAGE", isImpostor: false },
      { text: "The PM relied on SELL-SIDE COVERAGE to execute large trades without market impact.", term: "SELL-SIDE COVERAGE", isImpostor: true, reason: "SELL-SIDE COVERAGE is research published by analysts. Order execution — trading large blocks without moving the market — is handled by the sell-side trading desk or algorithmic execution, entirely separate from research.", fix: "The PM relied on the sell-side trading desk to execute large trades without market impact." },
    ],
  },

  // ─── TIER 4 ────────────────────────────────────────────────────────────────
  {
    id: 37, tier: 4,
    sentences: [
      { text: "The fund's SHARPE RATIO of 1.8 indicated strong risk-adjusted returns.", term: "SHARPE RATIO", isImpostor: false },
      { text: "A SHARPE RATIO below 1.0 suggests the portfolio isn't adequately compensating for risk.", term: "SHARPE RATIO", isImpostor: false },
      { text: "The SHARPE RATIO fell as volatility increased, even though absolute returns held up.", term: "SHARPE RATIO", isImpostor: false },
      { text: "The fund measured its DRAWDOWN using the SHARPE RATIO as the primary metric.", term: "SHARPE RATIO", isImpostor: true, reason: "SHARPE RATIO measures risk-adjusted return — excess return divided by the standard deviation of returns. DRAWDOWN (peak-to-trough decline) is a completely separate metric measuring loss magnitude, not return efficiency.", fix: "The fund measured its DRAWDOWN as the peak-to-trough decline during the volatile quarter." },
    ],
  },
  {
    id: 38, tier: 4,
    sentences: [
      { text: "The fund's ACTIVE SHARE of 82% confirmed it was a genuinely active manager.", term: "ACTIVE SHARE", isImpostor: false },
      { text: "ACTIVE SHARE measures how much a portfolio's holdings differ from its benchmark index.", term: "ACTIVE SHARE", isImpostor: false },
      { text: "Low ACTIVE SHARE funds are often described as 'closet indexers' by critics.", term: "ACTIVE SHARE", isImpostor: false },
      { text: "The company's ACTIVE SHARE increased after acquiring a competitor in the sector.", term: "ACTIVE SHARE", isImpostor: true, reason: "ACTIVE SHARE is a portfolio management metric — it measures how much a fund's holdings differ from its benchmark. Corporate acquisitions have nothing to do with ACTIVE SHARE, which is a property of an investment portfolio.", fix: "The company's market share increased after acquiring a competitor in the sector." },
    ],
  },
  {
    id: 39, tier: 4,
    sentences: [
      { text: "The analyst built a DCF model using a 10% discount rate and 3% terminal growth.", term: "DCF", isImpostor: false },
      { text: "DCF valuation is highly sensitive to assumptions around the long-term growth rate.", term: "DCF", isImpostor: false },
      { text: "The DCF implied fair value of €48 versus the current market price of €41.", term: "DCF", isImpostor: false },
      { text: "The company published a DCF to justify its acquisition price to shareholders.", term: "DCF", isImpostor: true, reason: "DCF models are built by analysts, investors, and investment bankers — not published by companies. When justifying acquisitions to shareholders, companies reference board-approved fairness opinions from independent advisors.", fix: "The company's financial advisor published a fairness opinion including DCF analysis to justify the acquisition price." },
    ],
  },
  {
    id: 40, tier: 4,
    sentences: [
      { text: "The analyst used a WACC of 9.5% to discount projected free cash flows in the model.", term: "WACC", isImpostor: false },
      { text: "A higher WACC results in a lower DCF valuation, all else being equal.", term: "WACC", isImpostor: false },
      { text: "WACC incorporates the blended cost of equity and debt, weighted by capital structure.", term: "WACC", isImpostor: false },
      { text: "The CFO lowered WACC directly by cutting the dividend to retain more cash.", term: "WACC", isImpostor: true, reason: "WACC is a valuation input calculated by analysts from market data and capital structure — not a metric CFOs directly target. Dividend cuts alone don't straightforwardly reduce WACC.", fix: "The CFO aimed to reduce the cost of capital by refinancing debt at lower rates and improving the credit rating." },
    ],
  },
  {
    id: 41, tier: 4,
    sentences: [
      { text: "TERMINAL VALUE accounted for 78% of the total DCF, making growth assumptions critical.", term: "TERMINAL VALUE", isImpostor: false },
      { text: "The analyst used a perpetuity growth model to calculate TERMINAL VALUE.", term: "TERMINAL VALUE", isImpostor: false },
      { text: "Sensitivity analysis on TERMINAL VALUE assumptions drove a wide fair value range.", term: "TERMINAL VALUE", isImpostor: false },
      { text: "The company disclosed its TERMINAL VALUE in the annual report to help investors with valuation.", term: "TERMINAL VALUE", isImpostor: true, reason: "TERMINAL VALUE is calculated by analysts within their own DCF models — it's a modelling output, not a corporate disclosure. Companies provide financial guidance and targets; they don't disclose valuation components.", fix: "The company disclosed its long-term revenue growth targets to help analysts calibrate their valuation models." },
    ],
  },
  {
    id: 42, tier: 4,
    sentences: [
      { text: "The fund's HURDLE RATE was 8% — below which no performance fee was charged.", term: "HURDLE RATE", isImpostor: false },
      { text: "The LP agreement set a HURDLE RATE of LIBOR + 300bps.", term: "HURDLE RATE", isImpostor: false },
      { text: "The PM only accepts positions where expected return clearly exceeds the HURDLE RATE.", term: "HURDLE RATE", isImpostor: false },
      { text: "The company used a HURDLE RATE of 12% to set its minimum acceptable dividend yield.", term: "HURDLE RATE", isImpostor: true, reason: "In corporate finance, HURDLE RATE is the minimum acceptable return on capital investment projects, not a dividend yield target. Dividend policy is set based on cash generation, payout ratios, and capital allocation priorities.", fix: "The company targeted a minimum dividend yield of 3% as part of its shareholder returns policy." },
    ],
  },
  {
    id: 43, tier: 4,
    sentences: [
      { text: "IMPLIED VOLATILITY on the options spiked in the week ahead of the earnings announcement.", term: "IMPLIED VOLATILITY", isImpostor: false },
      { text: "The analyst used IMPLIED VOLATILITY to estimate the market's expected move on results.", term: "IMPLIED VOLATILITY", isImpostor: false },
      { text: "High IMPLIED VOLATILITY made the protective options strategy expensive to execute.", term: "IMPLIED VOLATILITY", isImpostor: false },
      { text: "The fund reduced risk by purchasing shares when IMPLIED VOLATILITY was at its lowest.", term: "IMPLIED VOLATILITY", isImpostor: true, reason: "IMPLIED VOLATILITY is derived from options pricing and reflects expected future price movement. It doesn't directly measure or govern equity investment risk — buying shares in a low-IV environment can still carry significant downside risk.", fix: "The fund reduced risk by purchasing put options as a hedge when IMPLIED VOLATILITY was relatively low." },
    ],
  },
  {
    id: 44, tier: 4,
    sentences: [
      { text: "MARGIN COMPRESSION hit the sector as input costs rose faster than selling prices.", term: "MARGIN COMPRESSION", isImpostor: false },
      { text: "The company guided for MARGIN COMPRESSION of 150bps due to labour cost inflation.", term: "MARGIN COMPRESSION", isImpostor: false },
      { text: "MARGIN COMPRESSION was the key bear case for the consumer staples position.", term: "MARGIN COMPRESSION", isImpostor: false },
      { text: "MARGIN COMPRESSION means the company is becoming more profitable as costs fall.", term: "MARGIN COMPRESSION", isImpostor: true, reason: "MARGIN COMPRESSION means margins are shrinking — profit as a percentage of revenue is declining, typically because costs are rising faster than revenue. This is the exact opposite of increasing profitability.", fix: "MARGIN EXPANSION means the company is becoming more profitable as revenue grows faster than costs." },
    ],
  },
  {
    id: 45, tier: 4,
    sentences: [
      { text: "MULTIPLE EXPANSION drove most of the sector's returns as sentiment improved.", term: "MULTIPLE EXPANSION", isImpostor: false },
      { text: "The re-rating required MULTIPLE EXPANSION from 12x to 18x EV/EBITDA.", term: "MULTIPLE EXPANSION", isImpostor: false },
      { text: "MULTIPLE EXPANSION can amplify investment returns even when earnings growth is modest.", term: "MULTIPLE EXPANSION", isImpostor: false },
      { text: "MULTIPLE EXPANSION occurs when a company grows earnings faster than its peers.", term: "MULTIPLE EXPANSION", isImpostor: true, reason: "MULTIPLE EXPANSION happens when investors pay a higher price per unit of earnings — a market sentiment or re-rating effect. Growing earnings faster than peers drives earnings growth, not necessarily multiple expansion.", fix: "EARNINGS OUTPERFORMANCE occurs when a company grows earnings faster than its peers." },
    ],
  },
  {
    id: 46, tier: 4,
    sentences: [
      { text: "The analyst used SOTP to value each business unit separately before summing them.", term: "SOTP", isImpostor: false },
      { text: "SOTP valuation revealed significant hidden value in the company's real estate division.", term: "SOTP", isImpostor: false },
      { text: "The conglomerate traded at a 30% discount to SOTP — a classic 'conglomerate discount'.", term: "SOTP", isImpostor: false },
      { text: "The IR team presented SOTP analysis to demonstrate each segment was meeting budget.", term: "SOTP", isImpostor: true, reason: "SOTP (Sum of the Parts) is a valuation methodology used by analysts and investors to value diversified businesses. IR teams present divisional KPIs and segment performance — not SOTP analysis, which is an output of external investor models.", fix: "The IR team presented divisional KPIs to demonstrate that each segment was meeting its targets." },
    ],
  },
  {
    id: 47, tier: 4,
    sentences: [
      { text: "The MARKET NEUTRAL strategy aimed for zero beta exposure to the benchmark index.", term: "MARKET NEUTRAL", isImpostor: false },
      { text: "A MARKET NEUTRAL fund profits from stock selection regardless of market direction.", term: "MARKET NEUTRAL", isImpostor: false },
      { text: "The fund shifted to MARKET NEUTRAL positioning ahead of the volatile macro event.", term: "MARKET NEUTRAL", isImpostor: false },
      { text: "The company went MARKET NEUTRAL by hedging all its foreign exchange exposure.", term: "MARKET NEUTRAL", isImpostor: true, reason: "MARKET NEUTRAL is an investment fund strategy — zero net market exposure achieved through balanced long/short positions. Companies hedging FX risk are doing currency risk management, not adopting a market-neutral investment stance.", fix: "The company reduced currency risk by hedging its foreign exchange exposure through forward contracts." },
    ],
  },
  {
    id: 48, tier: 4,
    sentences: [
      { text: "MAINTENANCE CAPEX of $80M was required just to keep the existing assets operational.", term: "MAINTENANCE CAPEX", isImpostor: false },
      { text: "Stripping out MAINTENANCE CAPEX shows how much capital is available for growth.", term: "MAINTENANCE CAPEX", isImpostor: false },
      { text: "The analyst separated MAINTENANCE CAPEX from growth capex to assess true free cash flow.", term: "MAINTENANCE CAPEX", isImpostor: false },
      { text: "The fund deducted MAINTENANCE CAPEX from its AUM to calculate net asset value.", term: "MAINTENANCE CAPEX", isImpostor: true, reason: "MAINTENANCE CAPEX is a company-level metric. AUM (Assets Under Management) is calculated from the market value of securities a fund holds — MAINTENANCE CAPEX is entirely unrelated to fund net asset calculations.", fix: "The analyst deducted MAINTENANCE CAPEX from EBITDA to calculate true Free Cash Flow." },
    ],
  },

  // ─── TIER 5 ────────────────────────────────────────────────────────────────
  {
    id: 49, tier: 5,
    sentences: [
      { text: "The CHINESE WALL prevented the research analyst from accessing deal-related information.", term: "CHINESE WALL", isImpostor: false },
      { text: "The CHINESE WALL stops non-public information flowing from banking to research teams.", term: "CHINESE WALL", isImpostor: false },
      { text: "Compliance reinforced the CHINESE WALL after a potential information breach was flagged.", term: "CHINESE WALL", isImpostor: false },
      { text: "The IR team erected a CHINESE WALL to separate investor communications from press releases.", term: "CHINESE WALL", isImpostor: true, reason: "CHINESE WALL (information barrier) separates investment banking from research within a sell-side firm to prevent insider trading. IR teams use disclosure policies and quiet periods to manage communications — a different concept entirely.", fix: "The IR team enforced a strict disclosure protocol to separate investor guidance from public press releases." },
    ],
  },
  {
    id: 50, tier: 5,
    sentences: [
      { text: "The CORRELATION between the two positions was 0.85, reducing diversification benefit.", term: "CORRELATION", isImpostor: false },
      { text: "The fund reduced CORRELATION to the index by adding commodity exposure to the portfolio.", term: "CORRELATION", isImpostor: false },
      { text: "Low CORRELATION between strategies is the foundation of a well-built multi-strategy fund.", term: "CORRELATION", isImpostor: false },
      { text: "The analyst updated CORRELATION to reflect the company's improved EBITDA margins.", term: "CORRELATION", isImpostor: true, reason: "CORRELATION measures the statistical relationship between two return series — it's calculated from price and return data. EBITDA margins are a business fundamental and have no direct effect on the correlation between asset returns.", fix: "The analyst updated his margin assumptions to reflect the company's improved EBITDA performance." },
    ],
  },
  {
    id: 51, tier: 5,
    sentences: [
      { text: "The RISK-FREE RATE input rose as central banks tightened monetary policy.", term: "RISK-FREE RATE", isImpostor: false },
      { text: "A higher RISK-FREE RATE reduces the present value of long-duration cash flows in a DCF.", term: "RISK-FREE RATE", isImpostor: false },
      { text: "The RISK-FREE RATE is typically proxied by the 10-year government bond yield.", term: "RISK-FREE RATE", isImpostor: false },
      { text: "The company benchmarked executive bonuses against the RISK-FREE RATE to align incentives.", term: "RISK-FREE RATE", isImpostor: true, reason: "RISK-FREE RATE is a valuation input used in DCF and CAPM models. Executive bonuses are benchmarked against total shareholder return, hurdle rates, or peer group performance — not the risk-free rate.", fix: "The company benchmarked executive bonuses against total shareholder return to align with investors." },
    ],
  },
  {
    id: 52, tier: 5,
    sentences: [
      { text: "The analyst lowered the DISCOUNT RATE from 10% to 8.5% as business visibility improved.", term: "DISCOUNT RATE", isImpostor: false },
      { text: "A lower DISCOUNT RATE raises the net present value of long-duration cash flows.", term: "DISCOUNT RATE", isImpostor: false },
      { text: "The DISCOUNT RATE in the DCF reflected the analyst's required return threshold.", term: "DISCOUNT RATE", isImpostor: false },
      { text: "The IR team applied a DISCOUNT RATE to historical revenue figures to adjust for inflation.", term: "DISCOUNT RATE", isImpostor: true, reason: "DISCOUNT RATE is applied to future cash flows to calculate their present value in a DCF. Adjusting historical revenue for inflation uses a deflator or constant currency methodology — not a discount rate.", fix: "The IR team expressed historical revenue in constant currency terms to adjust for inflation." },
    ],
  },
  {
    id: 53, tier: 5,
    sentences: [
      { text: "Management delivered PREPARED REMARKS for 20 minutes before opening the Q&A.", term: "PREPARED REMARKS", isImpostor: false },
      { text: "Analysts parse PREPARED REMARKS carefully for changes in tone or emphasis.", term: "PREPARED REMARKS", isImpostor: false },
      { text: "PREPARED REMARKS are scripted and reviewed by legal before the earnings call.", term: "PREPARED REMARKS", isImpostor: false },
      { text: "The PM issued PREPARED REMARKS ahead of the fund's quarterly position update.", term: "PREPARED REMARKS", isImpostor: true, reason: "PREPARED REMARKS is specific to company earnings calls — scripted statements from management reviewed by legal. Fund managers communicate via investor letters, quarterly updates, or factsheets, not prepared remarks.", fix: "The PM issued a quarterly investor letter ahead of the fund's portfolio update." },
    ],
  },
  {
    id: 54, tier: 5,
    sentences: [
      { text: "The sell-side analyst arranged CORPORATE ACCESS for top clients to meet the CFO.", term: "CORPORATE ACCESS", isImpostor: false },
      { text: "CORPORATE ACCESS is increasingly valuable as senior management time becomes scarcer.", term: "CORPORATE ACCESS", isImpostor: false },
      { text: "The fund rated the broker highly for the quality of CORPORATE ACCESS provided.", term: "CORPORATE ACCESS", isImpostor: false },
      { text: "The IR team billed investors for CORPORATE ACCESS services after the roadshow.", term: "CORPORATE ACCESS", isImpostor: true, reason: "CORPORATE ACCESS is a sell-side service — brokers arrange meetings between buy-side clients and company management. IR teams facilitate investor meetings as part of their own function; they don't independently bill investors for corporate access.", fix: "The broker billed buy-side clients for CORPORATE ACCESS services following the roadshow schedule." },
    ],
  },
  {
    id: 55, tier: 5,
    sentences: [
      { text: "ORGANIC GROWTH of 9% showed the business was performing well ex-acquisitions.", term: "ORGANIC GROWTH", isImpostor: false },
      { text: "Analysts stripped out acquisitions and FX to isolate ORGANIC GROWTH and underlying momentum.", term: "ORGANIC GROWTH", isImpostor: false },
      { text: "The company guided for 6-8% ORGANIC GROWTH in the coming financial year.", term: "ORGANIC GROWTH", isImpostor: false },
      { text: "The fund delivered ORGANIC GROWTH in AUM through strong investment performance.", term: "ORGANIC GROWTH", isImpostor: true, reason: "ORGANIC GROWTH is a corporate revenue metric that excludes acquisitions and FX effects. For funds, AUM growth comes from investment performance and net inflows — described separately, not as organic growth.", fix: "The fund grew AUM through strong investment performance and positive net new inflows." },
    ],
  },
  {
    id: 56, tier: 5,
    sentences: [
      { text: "POSITION SIZING was driven by conviction level and available stock liquidity.", term: "POSITION SIZING", isImpostor: false },
      { text: "Strict POSITION SIZING rules prevented any single stock exceeding 5% of the portfolio.", term: "POSITION SIZING", isImpostor: false },
      { text: "The analyst's high conviction in the thesis directly influenced the PM's POSITION SIZING.", term: "POSITION SIZING", isImpostor: false },
      { text: "The IR director reviewed POSITION SIZING to ensure the company owned enough of its own shares.", term: "POSITION SIZING", isImpostor: true, reason: "POSITION SIZING is a buy-side portfolio management concept — allocating fund capital to an investment. Companies manage buybacks and treasury shares through separate governance processes, not position sizing frameworks.", fix: "The IR director reviewed the buyback program to ensure the repurchase target was on track." },
    ],
  },
  {
    id: 57, tier: 5,
    sentences: [
      { text: "MANAGEMENT COMMENTARY on pricing power was notably more cautious than last quarter.", term: "MANAGEMENT COMMENTARY", isImpostor: false },
      { text: "Analysts review MANAGEMENT COMMENTARY for early signals about business trajectory.", term: "MANAGEMENT COMMENTARY", isImpostor: false },
      { text: "The fund's thesis was validated by constructive MANAGEMENT COMMENTARY at the investor day.", term: "MANAGEMENT COMMENTARY", isImpostor: false },
      { text: "The PM wrote MANAGEMENT COMMENTARY summarising his views on the portfolio's positioning.", term: "MANAGEMENT COMMENTARY", isImpostor: true, reason: "MANAGEMENT COMMENTARY refers to company management's qualitative discussion of their business performance in reports and calls. A PM sharing views on portfolio positioning writes a manager's commentary or investment letter.", fix: "The PM wrote a manager's commentary summarising his views on the portfolio's positioning." },
    ],
  },
  {
    id: 58, tier: 5,
    sentences: [
      { text: "Quartr aggregates FIRST-PARTY IR MATERIAL directly from company investor relations pages.", term: "FIRST-PARTY IR MATERIAL", isImpostor: false },
      { text: "FIRST-PARTY IR MATERIAL includes earnings transcripts, presentations, and annual reports.", term: "FIRST-PARTY IR MATERIAL", isImpostor: false },
      { text: "The analyst relied on FIRST-PARTY IR MATERIAL rather than media summaries for accuracy.", term: "FIRST-PARTY IR MATERIAL", isImpostor: false },
      { text: "The fund published its own FIRST-PARTY IR MATERIAL to update shareholders on strategy.", term: "FIRST-PARTY IR MATERIAL", isImpostor: true, reason: "FIRST-PARTY IR MATERIAL is content produced by a company's investor relations function — earnings calls, presentations, transcripts. Funds communicate with investors via letters, factsheets, and LP updates, not IR material.", fix: "The fund published a quarterly letter to update its limited partners on strategy." },
    ],
  },
  {
    id: 59, tier: 5,
    sentences: [
      { text: "The fund paid a 22x VALUATION MULTIPLE for the position, justified by the growth profile.", term: "VALUATION MULTIPLE", isImpostor: false },
      { text: "VALUATION MULTIPLE compression drove underperformance despite solid earnings growth.", term: "VALUATION MULTIPLE", isImpostor: false },
      { text: "Comparing VALUATION MULTIPLES across peers helps identify relative mispricing.", term: "VALUATION MULTIPLE", isImpostor: false },
      { text: "The company set its own VALUATION MULTIPLE to guide investors toward fair value.", term: "VALUATION MULTIPLE", isImpostor: true, reason: "VALUATION MULTIPLES are determined by the market and investors based on earnings, cash flows, and sentiment. Companies provide financial targets and guidance — they don't dictate what multiple investors should apply.", fix: "The company provided long-term financial targets to help investors form their own view on fair value." },
    ],
  },
  {
    id: 60, tier: 5,
    sentences: [
      { text: "His CONTRARIAN VIEW was that rising rates would actually benefit the insurance sector.", term: "CONTRARIAN VIEW", isImpostor: false },
      { text: "A CONTRARIAN VIEW is only valuable if backed by specific evidence the consensus is wrong.", term: "CONTRARIAN VIEW", isImpostor: false },
      { text: "The fund's 18-month CONTRARIAN VIEW on the retailer finally paid off in Q3.", term: "CONTRARIAN VIEW", isImpostor: false },
      { text: "The IR team promoted a CONTRARIAN VIEW to reframe how investors saw their stock.", term: "CONTRARIAN VIEW", isImpostor: true, reason: "CONTRARIAN VIEW is a buy-side concept — an investor's differentiated stance versus market consensus. IR teams articulate the company's equity story and strategic narrative; they don't position themselves as having contrarian investment views.", fix: "The IR team reframed the equity story to correct what they felt was a market misperception." },
    ],
  },
];
