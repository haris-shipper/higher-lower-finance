// ─────────────────────────────────────────────────────────────────────────────
// CONNECTIONS — Finance Training Edition
// Each zone has 2 rounds. A session picks 1 from each zone at random.
// Round structure: { zone, zoneName, groups: [{ name, explanation, tiles: [{ name, explanation }] }] }
// ─────────────────────────────────────────────────────────────────────────────

const ZONE1 = [
  {
    zone: 1, zoneName: "THE THINKERS",
    groups: [
      {
        name: "WROTE THE DEFINING BOOK",
        explanation: "Each wrote a book that became required reading across the investment world.",
        tiles: [
          { name: "BENJAMIN GRAHAM", explanation: "Wrote Security Analysis and The Intelligent Investor, establishing the intellectual foundations of value investing." },
          { name: "PETER LYNCH", explanation: "Wrote One Up on Wall Street, arguing that everyday investors have an edge over Wall Street by observing daily life." },
          { name: "HOWARD MARKS", explanation: "Wrote The Most Important Thing, distilling his famous Oaktree memos into a masterclass on risk and market cycles." },
          { name: "MORGAN HOUSEL", explanation: "Wrote The Psychology of Money, arguing that behaviour and temperament matter more than raw financial intelligence." },
        ],
      },
      {
        name: "MACRO HEDGE FUND LEGENDS",
        explanation: "Each built their reputation making large directional bets on currencies, interest rates, or entire economies.",
        tiles: [
          { name: "GEORGE SOROS", explanation: "Made $1B in a day by shorting the British pound in 1992, and is famous for his theory of reflexivity in markets." },
          { name: "RAY DALIO", explanation: "Founded Bridgewater Associates, the world's largest hedge fund, and authored Principles on economics and life." },
          { name: "STAN DRUCKENMILLER", explanation: "Ran Duquesne Capital for 30+ years without a losing year, known for high-conviction macro bets and sizing big." },
          { name: "PAUL TUDOR JONES", explanation: "Predicted and profited from the 1987 crash and is known for strict risk management — never averaging down on a loser." },
        ],
      },
      {
        name: "FINANCE PROFESSORS WHO PUBLISH FREELY",
        explanation: "Each holds a major university position and shares research, models, and teaching materials publicly at no cost.",
        tiles: [
          { name: "ASWATH DAMODARAN", explanation: "NYU professor who posts all valuation models and course materials free online — widely called the Dean of Valuation." },
          { name: "JOEL GREENBLATT", explanation: "Columbia adjunct professor who created the Magic Formula and wrote The Little Book That Beats the Market." },
          { name: "JEREMY SIEGEL", explanation: "Wharton professor famous for Stocks for the Long Run, making the empirical case that equities beat every other asset class over time." },
          { name: "ROBERT SHILLER", explanation: "Yale Nobel laureate who created the CAPE ratio and wrote Irrational Exuberance on asset price bubbles." },
        ],
      },
      {
        name: "KNOWN FOR A SPECIFIC MENTAL MODEL",
        explanation: "Each is best associated with a distinctive intellectual framework that changed how investors think about risk or decision-making.",
        tiles: [
          { name: "CHARLIE MUNGER", explanation: "Berkshire vice chairman who popularized building a latticework of mental models drawn from multiple disciplines." },
          { name: "NASSIM TALEB", explanation: "Wrote The Black Swan and Antifragile, focusing on fat-tail risk, fragility, and how rare events dominate outcomes." },
          { name: "MICHAEL MAUBOUSSIN", explanation: "Known for base rate thinking, expectations investing, and separating process quality from outcome quality." },
          { name: "DANIEL KAHNEMAN", explanation: "Nobel-winning psychologist who wrote Thinking, Fast and Slow — foundational to understanding cognitive bias in finance." },
        ],
      },
    ],
  },
  {
    zone: 1, zoneName: "THE THINKERS",
    groups: [
      {
        name: "LONG-TERM QUALITY INVESTORS",
        explanation: "Each runs or ran a concentrated fund buying high-quality businesses and holding them for years or decades.",
        tiles: [
          { name: "TERRY SMITH", explanation: "Runs Fundsmith with a simple mantra: buy high-quality businesses, don't overpay, and then do nothing." },
          { name: "NICK SLEEP", explanation: "Ran Nomad Investment Partnership and was among the first institutions to identify Amazon's scale-economics model." },
          { name: "CHUCK AKRE", explanation: "Runs Akre Capital using a three-legged stool: exceptional business, skilled management, and reinvestment at high rates." },
          { name: "TOM GAYNER", explanation: "Markel's longtime CIO who has compounded capital for decades by focusing on quality businesses at sensible prices." },
        ],
      },
      {
        name: "ACTIVIST INVESTORS",
        explanation: "Each takes large public-company stakes and uses shareholder pressure to force strategic or operational change.",
        tiles: [
          { name: "BILL ACKMAN", explanation: "Runs Pershing Square with high-conviction positions and has run very public campaigns including the Herbalife short." },
          { name: "CARL ICAHN", explanation: "Corporate raider turned activist, known for forcing buybacks, board changes, and asset sales at dozens of major companies." },
          { name: "DAN LOEB", explanation: "Runs Third Point, famous for aggressive public letters demanding strategic change at Yahoo!, Nestlé, and Disney." },
          { name: "NELSON PELTZ", explanation: "Runs Trian Partners, known for operational activism at Procter & Gamble, Unilever, and most recently Disney." },
        ],
      },
      {
        name: "VENTURE CAPITAL LEGENDS",
        explanation: "Each helped shape the VC industry and made foundational early bets that defined modern technology.",
        tiles: [
          { name: "PETER THIEL", explanation: "Co-founded PayPal, wrote Zero to One, and made the first outside investment in Facebook as an angel." },
          { name: "MARC ANDREESSEN", explanation: "Co-invented the web browser, co-founded a16z, and wrote the seminal essay 'Why Software Is Eating the World'." },
          { name: "JOHN DOERR", explanation: "Kleiner Perkins partner who backed Google and Amazon early and popularised OKRs through Measure What Matters." },
          { name: "FRED WILSON", explanation: "Co-founded Union Square Ventures and was an early backer of Twitter, Tumblr, Etsy, and Kickstarter." },
        ],
      },
      {
        name: "CONTRARIAN VALUE INVESTORS",
        explanation: "Each built a track record buying deeply out-of-favour securities and waiting for the market to catch up.",
        tiles: [
          { name: "SETH KLARMAN", explanation: "Runs Baupost Group with extreme focus on margin of safety — wrote the out-of-print classic Margin of Safety." },
          { name: "MOHNISH PABRAI", explanation: "Runs Pabrai Funds as a self-described shameless cloner of Buffett — concentrated bets, dhandho philosophy, low fees." },
          { name: "GUY SPIER", explanation: "Runs Aquamarine Fund and wrote The Education of a Value Investor about transforming from Wall Street to Zurich." },
          { name: "FRANCIS CHOU", explanation: "Toronto-based deep value investor who has compounded capital for 40+ years by buying deeply out-of-favour securities." },
        ],
      },
    ],
  },
];

const ZONE2 = [
  {
    zone: 2, zoneName: "THE CONCEPTS",
    groups: [
      {
        name: "TYPES OF COMPETITIVE ADVANTAGE",
        explanation: "These are the four most cited forms of economic moat — structural reasons a company can sustain high returns on capital.",
        tiles: [
          { name: "NETWORK EFFECT", explanation: "The product becomes more valuable as more people use it — every new user strengthens the moat for all existing users." },
          { name: "SWITCHING COST", explanation: "It's expensive, painful, or risky for a customer to leave — locking them in even if a competitor offers something better." },
          { name: "PRICING POWER", explanation: "The ability to raise prices without losing customers — a sign the product has no close substitute and buyers have few alternatives." },
          { name: "SCALE ADVANTAGE", explanation: "At sufficient size, cost per unit falls below what any competitor can match — a structural cost moat built through volume." },
        ],
      },
      {
        name: "METHODS USED TO VALUE A COMPANY",
        explanation: "Each is a distinct methodology used in investment banking and investing to determine what a company is worth.",
        tiles: [
          { name: "DCF ANALYSIS", explanation: "Discounts all future free cash flows back to the present using a cost of capital — theoretically the purest valuation method." },
          { name: "COMPARABLE COMPANIES", explanation: "Values a company by applying multiples from similar publicly traded peers — also called trading comps or public market comps." },
          { name: "PRECEDENT TRANSACTIONS", explanation: "Values a company based on what acquirers paid for similar companies historically — includes a control premium over trading price." },
          { name: "LBO ANALYSIS", explanation: "Models how much a PE firm could pay for a business and still hit its return hurdle — sets a valuation floor in M&A." },
        ],
      },
      {
        name: "PROFITABILITY METRICS",
        explanation: "Each measures a different layer of how much profit a business earns — from raw production through to owner earnings.",
        tiles: [
          { name: "EBITDA", explanation: "Earnings before interest, taxes, depreciation, and amortisation — a proxy for operating cash profit used widely in M&A and lending." },
          { name: "GROSS MARGIN", explanation: "Revenue minus cost of goods sold, divided by revenue — what remains after direct production costs before operating expenses." },
          { name: "NET MARGIN", explanation: "Profit after all costs, interest, and taxes divided by revenue — the bottom-line measure of how much of each sale becomes profit." },
          { name: "FREE CASH FLOW", explanation: "Operating cash flow minus capital expenditure — the actual cash a business generates that belongs to its owners." },
        ],
      },
      {
        name: "RETURN METRICS",
        explanation: "Each expresses how much an investment earns relative to what was put in, adjusted for time or risk.",
        tiles: [
          { name: "ROIC", explanation: "Return on invested capital — measures how efficiently a company generates profit from the total capital it has deployed." },
          { name: "IRR", explanation: "Internal rate of return — the annualised return of an investment that makes the net present value of all cash flows equal zero." },
          { name: "CAGR", explanation: "Compound annual growth rate — the smoothed annual return over a period, making returns comparable across different time horizons." },
          { name: "ALPHA", explanation: "Return earned above a risk-adjusted benchmark — the holy grail metric for active managers justifying their fees." },
        ],
      },
    ],
  },
  {
    zone: 2, zoneName: "THE CONCEPTS",
    groups: [
      {
        name: "RISK CONCEPTS",
        explanation: "Each describes a distinct way investors think about, measure, or protect against the possibility of losing money.",
        tiles: [
          { name: "MARGIN OF SAFETY", explanation: "Buying at a significant discount to intrinsic value to create a cushion against errors in analysis or unexpected bad outcomes." },
          { name: "DIVERSIFICATION", explanation: "Spreading capital across uncorrelated assets so no single position failure can destroy the overall portfolio." },
          { name: "CORRELATION", explanation: "A statistical measure of how closely two assets move together — low correlation is what makes diversification actually work." },
          { name: "DRAWDOWN", explanation: "The peak-to-trough decline in an investment's value — a critical measure of downside risk that many investors ignore until too late." },
        ],
      },
      {
        name: "HOW EXPENSIVE IS THE STOCK",
        explanation: "Each is a valuation multiple — a ratio that tells you what the market is paying per unit of a company's financial output.",
        tiles: [
          { name: "P/E RATIO", explanation: "Stock price divided by earnings per share — the most widely cited multiple, showing what investors pay per dollar of current profit." },
          { name: "EV/EBITDA", explanation: "Enterprise value divided by EBITDA — the most common M&A valuation multiple, comparable across different capital structures." },
          { name: "PRICE-TO-BOOK", explanation: "Market cap divided by book value — most useful for banks and financial firms where assets are marked close to market value." },
          { name: "FCF YIELD", explanation: "Free cash flow divided by market cap — shows how much cash a business generates per dollar you pay for it today." },
        ],
      },
      {
        name: "PARTS OF A CAPITAL STRUCTURE",
        explanation: "These are the layers of financing that sit in order of priority — each has different risk, return, and claim on the business.",
        tiles: [
          { name: "COMMON EQUITY", explanation: "Residual ownership after all other stakeholders are paid — highest risk, highest potential return, last in the waterfall." },
          { name: "PREFERRED EQUITY", explanation: "Sits above common equity but below debt — typically pays a fixed dividend and may convert to common shares in certain events." },
          { name: "SENIOR DEBT", explanation: "First to be repaid in any scenario, usually secured against specific assets — lowest yield, lowest risk in the structure." },
          { name: "SUBORDINATED DEBT", explanation: "Below senior debt but above equity in the repayment waterfall — earns more yield as compensation for higher default risk." },
        ],
      },
      {
        name: "TYPES OF INVESTMENT ANALYSIS",
        explanation: "Each is a distinct school of thought for how to generate investment decisions — with different data inputs and assumptions.",
        tiles: [
          { name: "TECHNICAL ANALYSIS", explanation: "Analyses price charts and trading volume to predict future movements — widely used in short-term trading and macro." },
          { name: "FUNDAMENTAL ANALYSIS", explanation: "Studies financial statements, competitive position, and management quality to assess a company's true intrinsic value." },
          { name: "QUANTITATIVE ANALYSIS", explanation: "Uses statistical models, algorithms, and large datasets to find repeatable patterns and generate systematic trading signals." },
          { name: "MACRO ANALYSIS", explanation: "Focuses on economies, interest rates, currencies, and policy as the primary drivers of asset price movements." },
        ],
      },
    ],
  },
];

const ZONE3 = [
  {
    zone: 3, zoneName: "THE ECOSYSTEM",
    groups: [
      {
        name: "BUY-SIDE INSTITUTIONS",
        explanation: "Each is an institution that manages capital on behalf of investors — they buy and hold assets rather than advise on transactions.",
        tiles: [
          { name: "HEDGE FUND", explanation: "Pooled investment vehicle for sophisticated investors that can use leverage, short selling, and derivatives freely." },
          { name: "PENSION FUND", explanation: "Manages retirement assets for workers, typically required to invest conservatively and maintain actuarial liability coverage." },
          { name: "MUTUAL FUND", explanation: "Registered public investment vehicle bought and sold at NAV at end of each trading day — highly regulated and widely accessible." },
          { name: "FAMILY OFFICE", explanation: "Manages the wealth of a single ultra-high-net-worth family with maximum flexibility and no outside investor obligations." },
        ],
      },
      {
        name: "SELL-SIDE ACTIVITIES",
        explanation: "Each is a core revenue-generating activity at investment banks and brokers — they serve institutional clients rather than invest themselves.",
        tiles: [
          { name: "EQUITY RESEARCH", explanation: "Publishing stock recommendations and financial models to institutional investors to help them make better allocation decisions." },
          { name: "MARKET MAKING", explanation: "Standing ready to buy and sell securities at all times, providing liquidity to markets in exchange for capturing the bid-ask spread." },
          { name: "UNDERWRITING", explanation: "Taking financial responsibility for a new stock or bond issuance — committing to sell shares and absorbing unsold inventory risk." },
          { name: "SALES & TRADING", explanation: "Executing large transactions for institutional clients, providing market intelligence, pricing, and risk-management services." },
        ],
      },
      {
        name: "STAGES OF AN IPO",
        explanation: "These happen in strict sequence when a private company takes itself public — each step must be completed before the next begins.",
        tiles: [
          { name: "S-1 FILING", explanation: "The registration statement filed with the SEC — full financial and business disclosure required before any public marketing can begin." },
          { name: "ROADSHOW", explanation: "The two-week marketing sprint where company management presents to institutional investors globally to build order demand." },
          { name: "BOOK BUILDING", explanation: "Collecting investor orders at various price levels during the roadshow to determine the final IPO price the market will support." },
          { name: "FIRST DAY OF TRADING", explanation: "Shares open on the public exchange and the offering price is tested against real supply and demand for the first time." },
        ],
      },
      {
        name: "THINGS AN IR TEAM DOES",
        explanation: "Investor Relations teams at public companies do all of these to manage their ongoing relationship with the investment community.",
        tiles: [
          { name: "EARNINGS PREPARATION", explanation: "Coordinating financial results, management commentary, and Q&A materials for the quarterly earnings event." },
          { name: "INVESTOR TARGETING", explanation: "Identifying and approaching institutional investors whose mandate and investment style match the company's profile." },
          { name: "PERCEPTION STUDY", explanation: "Surveying current and potential investors on how they view the company's strategy, management credibility, and valuation." },
          { name: "ANNUAL REPORT", explanation: "Producing the yearly summary of performance, strategy, and governance required for shareholders and regulators." },
        ],
      },
    ],
  },
  {
    zone: 3, zoneName: "THE ECOSYSTEM",
    groups: [
      {
        name: "EARNINGS CYCLE EVENTS",
        explanation: "These happen in a fixed sequence every quarter at every public company — missing one has legal and reputational consequences.",
        tiles: [
          { name: "QUIET PERIOD", explanation: "The weeks before earnings release when management cannot discuss financial results publicly to prevent selective disclosure." },
          { name: "EARNINGS RELEASE", explanation: "The press release publishing full quarterly financial results, typically issued after market close or before market open." },
          { name: "EARNINGS CALL", explanation: "The live conference call where management presents results and sell-side analysts ask questions in real time." },
          { name: "10-Q FILING", explanation: "The full quarterly financial report filed with the SEC within 40–45 days of quarter end, containing audited statements." },
        ],
      },
      {
        name: "INVESTMENT VEHICLE TYPES",
        explanation: "Each is a distinct legal and structural wrapper for pooling capital — each has different rules, access, and trading mechanics.",
        tiles: [
          { name: "ETF", explanation: "Exchange-traded fund that trades like a stock intraday, typically tracks an index at very low cost and high tax efficiency." },
          { name: "SPAC", explanation: "Special Purpose Acquisition Company — a blank-check shell that raises capital via IPO to acquire a private company within two years." },
          { name: "CLOSED-END FUND", explanation: "A fund with a fixed number of shares trading on an exchange — often at a persistent discount or premium to its underlying NAV." },
          { name: "BDC", explanation: "Business Development Company — a publicly traded vehicle that lends to or invests in private middle-market companies." },
        ],
      },
      {
        name: "ROLES IN A PE BUYOUT",
        explanation: "Each is a distinct party in a leveraged buyout — each has different incentives, risks, and claims on the business.",
        tiles: [
          { name: "FINANCIAL SPONSOR", explanation: "The PE firm itself — provides equity capital, controls the board, and is responsible for driving the value creation plan." },
          { name: "MANAGEMENT TEAM", explanation: "Executives who run the business day-to-day, typically given equity co-investment to align their incentives with the PE firm." },
          { name: "SENIOR LENDER", explanation: "Usually a bank or institutional lender providing the largest debt tranche at the lowest rate, secured against company assets." },
          { name: "LEGAL COUNSEL", explanation: "Law firms on both buy-side and sell-side managing all deal documentation, due diligence coordination, and regulatory filings." },
        ],
      },
      {
        name: "TERMS ON A VC TERM SHEET",
        explanation: "Each is a standard clause in early-stage financing — together they define who gets what and when in an exit scenario.",
        tiles: [
          { name: "VALUATION CAP", explanation: "The maximum company valuation at which a convertible note or SAFE converts into equity — protects early investors from dilution." },
          { name: "LIQUIDATION PREFERENCE", explanation: "Ensures investors get paid before founders in an exit — a 1x preference means they recover their investment first." },
          { name: "ANTI-DILUTION", explanation: "Protects investors from value loss if the next funding round is at a lower valuation than the one they invested in." },
          { name: "PRO-RATA RIGHTS", explanation: "The right for existing investors to participate in future funding rounds to maintain their percentage ownership in the company." },
        ],
      },
    ],
  },
];

const ZONE4 = [
  {
    zone: 4, zoneName: "THE REAL WORLD",
    groups: [
      {
        name: "FAMOUS FOR CAPITAL ALLOCATION",
        explanation: "Each company is studied as an archetype of how to intelligently deploy and reinvest capital at scale over decades.",
        tiles: [
          { name: "BERKSHIRE HATHAWAY", explanation: "Under Buffett, defined intelligent capital allocation — buying great businesses, holding permanently, and deploying cash at the right moment." },
          { name: "DANAHER", explanation: "Built a $50B+ science and industrial empire through systematic M&A and operational improvement via the Danaher Business System." },
          { name: "CONSTELLATION SOFTWARE", explanation: "Canadian serial acquirer of vertical market software businesses, held permanently — 100+ acquisitions with disciplined capital deployment." },
          { name: "ROPER TECHNOLOGIES", explanation: "Pivoted from industrial conglomerate to software-focused compounder through highly selective, niche acquisitions over 20 years." },
        ],
      },
      {
        name: "NETWORK EFFECT BUSINESSES",
        explanation: "Each company's core value derives from the size of its network — more users makes the product more valuable for every other user.",
        tiles: [
          { name: "VISA", explanation: "Every new card issuer and merchant strengthens the network for all others — a classic two-sided payments moat built over 60 years." },
          { name: "META", explanation: "Facebook's value comes from the billions of people already on it — the single largest social graph ever assembled." },
          { name: "AIRBNB", explanation: "More hosts attract more guests, which attract more hosts — each new geography reinforces itself through the two-sided platform." },
          { name: "LINKEDIN", explanation: "A professional network where value scales with the number of professionals — nearly impossible to replicate from a standing start." },
        ],
      },
      {
        name: "EXTREME PRICING POWER",
        explanation: "Each can raise prices annually without losing customers — demand is driven by desire and exclusivity, not price sensitivity.",
        tiles: [
          { name: "HERMÈS", explanation: "Maintains years-long waitlists for Birkin bags — customers chase the brand, not the other way around." },
          { name: "FERRARI", explanation: "Deliberately restricts production below demand every year to protect exclusivity and justify raising prices regardless of cost inflation." },
          { name: "LVMH", explanation: "A portfolio of luxury brands built on heritage and scarcity — customers pay for the identity the brand confers, not just the product." },
          { name: "BRUNELLO CUCINELLI", explanation: "Raises prices each year citing artisanal craft — sells humanistic capitalism and quiet luxury as the product itself." },
        ],
      },
      {
        name: "FINANCIAL DATA OLIGOPOLIES",
        explanation: "Each dominates a critical data or ratings market where switching costs and regulatory embedding make meaningful competition nearly impossible.",
        tiles: [
          { name: "MSCI", explanation: "Provides the indices that trillions of dollars benchmark against — charging for the right to use MSCI World or EM as your reference." },
          { name: "S&P GLOBAL", explanation: "Runs credit ratings and market intelligence — embedded in every fixed-income deal globally and required by most bond covenants." },
          { name: "MOODY'S", explanation: "One of the three major rating agencies — issuers must pay for a rating or risk being locked out of institutional debt markets entirely." },
          { name: "FACTSET", explanation: "Financial data terminal and analytics platform used by analysts who are deeply unwilling to retrain on any alternative system." },
        ],
      },
    ],
  },
  {
    zone: 4, zoneName: "THE REAL WORLD",
    groups: [
      {
        name: "SERIAL ACQUIRERS",
        explanation: "Each company's primary growth strategy is acquiring niche businesses and holding them permanently — not integrating or flipping them.",
        tiles: [
          { name: "CONSTELLATION SOFTWARE", explanation: "Acquires vertical market software companies across niche industries and holds them forever — over 100 acquisitions and counting." },
          { name: "LIFCO", explanation: "Swedish serial acquirer of niche B2B businesses following a decentralised model — subsidiaries operate independently within a capital framework." },
          { name: "ADDTECH", explanation: "Swedish technology trading company that acquires and operates niche component distributors across the Nordic industrial market." },
          { name: "HALMA", explanation: "British safety-focused serial acquirer making dozens of small bolt-on acquisitions per year across niche markets globally." },
        ],
      },
      {
        name: "PLATFORM / MARKETPLACE BUSINESSES",
        explanation: "Each operates a two-sided platform where value is created by matching supply and demand — the platform itself owns no inventory.",
        tiles: [
          { name: "AMAZON", explanation: "The world's largest two-sided marketplace — buyers attract sellers, sellers attract buyers, generating a compounding flywheel." },
          { name: "SHOPIFY", explanation: "Powers independent merchants as a counterweight to Amazon — aggregating the long tail of commerce onto a single platform." },
          { name: "UBER", explanation: "Two-sided marketplace where driver density attracts riders and rider demand attracts drivers — a local winner-take-most dynamic." },
          { name: "DOORDASH", explanation: "Food delivery marketplace where restaurant selection attracts dashers and dasher density enables faster delivery — dominates US market." },
        ],
      },
      {
        name: "FAMOUS FRAUD / SHORT SELLER TARGETS",
        explanation: "Each company was exposed as having fundamentally misrepresented its business — and became a canonical case study in financial fraud.",
        tiles: [
          { name: "ENRON", explanation: "Energy giant whose fraudulent mark-to-market accounting hid massive losses for years before collapsing spectacularly in 2001." },
          { name: "WIRECARD", explanation: "German payments company that fabricated €1.9B of cash on its balance sheet before collapsing in 2020, shaking European regulators." },
          { name: "THERANOS", explanation: "Silicon Valley blood-testing startup whose technology never worked — raised $700M+ on fraudulent claims before being exposed." },
          { name: "LUCKIN COFFEE", explanation: "Chinese coffee chain that fabricated over 40% of its 2019 revenue — exposed by Muddy Waters Research in 2020." },
        ],
      },
      {
        name: "RECURRING REVENUE MODEL PIONEERS",
        explanation: "Each either built their business on subscriptions or made a celebrated transition from one-time sales to predictable recurring revenue.",
        tiles: [
          { name: "ADOBE", explanation: "Converted creative software from perpetual licences to monthly subscriptions in 2013 — the stock quadrupled in five years." },
          { name: "SALESFORCE", explanation: "Pioneered SaaS CRM, proving that enterprise software could be delivered via browser subscription rather than on-premise installation." },
          { name: "AUTODESK", explanation: "Transitioned from perpetual CAD licences to subscriptions, dramatically improving revenue predictability and customer lifetime value." },
          { name: "VEEVA SYSTEMS", explanation: "Cloud software built exclusively for life sciences — sticky subscriptions with near-100% gross retention and high switching costs." },
        ],
      },
    ],
  },
];

export const ZONES = [ZONE1, ZONE2, ZONE3, ZONE4];
export const ZONE_NAMES = ["THE THINKERS", "THE CONCEPTS", "THE ECOSYSTEM", "THE REAL WORLD"];
