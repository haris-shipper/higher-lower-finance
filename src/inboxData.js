// INBOX — ICP Triage Game
// Buckets: buy-side | sell-side | ir | api | not-icp
// Tiers: 1 (obvious, 15s) → 5 (edge case, 6s)

export const MESSAGES = [

  // ─── TIER 1 — Obvious (15s) ───────────────────────────────────────────────

  { id: 1, tier: 1, bucket: "buy-side",
    text: "We manage a $4B long-only equity fund focused on European equities. Our analysts are on every earnings call.",
    signals: ["long-only equity fund"],
    explanation: "Long-only equity funds are classic buy-side — they invest client capital in public stocks and need deep company research." },

  { id: 2, tier: 1, bucket: "sell-side",
    text: "I'm an equity research analyst at SEB. I cover 15 Nordic consumer companies and publish weekly.",
    signals: ["equity research analyst", "cover"],
    explanation: "Equity research analysts at banks like SEB are sell-side — they produce company-specific reports for institutional clients." },

  { id: 3, tier: 1, bucket: "ir",
    text: "I'm the head of IR at a Stockholm-listed mid-cap. We just wrapped our Q3 earnings and need better investor insights.",
    signals: ["head of IR", "Stockholm-listed"],
    explanation: "IR leads at listed companies use Quartr to understand how investors engage with their earnings content." },

  { id: 4, tier: 1, bucket: "api",
    text: "We're building a financial data platform. We need a reliable API for earnings call transcripts at scale.",
    signals: ["API", "transcripts at scale"],
    explanation: "Companies building financial data products need programmatic access to earnings content, not individual user licenses." },

  { id: 5, tier: 1, bucket: "not-icp",
    text: "I trade crypto full time and I'm looking for tools to track sentiment and macro signals.",
    signals: ["crypto", "trade full time"],
    explanation: "Crypto-focused retail traders aren't Quartr's ICP — the platform is built for institutional public equity research workflows." },

  { id: 6, tier: 1, bucket: "buy-side",
    text: "Our pension fund manages retirement savings for 80,000 Swedish workers. We run a diversified global equity portfolio in-house.",
    signals: ["pension fund", "global equity portfolio"],
    explanation: "Pension funds investing pooled capital in public equities are core buy-side institutions." },

  { id: 7, tier: 1, bucket: "sell-side",
    text: "We're a team of 12 analysts at a bulge bracket bank covering European healthcare companies.",
    signals: ["bulge bracket bank", "covering"],
    explanation: "Sell-side analysts at investment banks produce company research reports for their institutional clients." },

  { id: 8, tier: 1, bucket: "ir",
    text: "We're the CFO's office at a listed Swedish industrial company. We manage all IR in-house and are preparing for our first analyst day.",
    signals: ["CFO's office", "listed", "IR in-house"],
    explanation: "A listed company's finance team managing investor relations is a direct IR use case." },

  { id: 9, tier: 1, bucket: "api",
    text: "We aggregate public company data for enterprise financial clients. We have a gap in earnings call transcripts and need an API.",
    signals: ["aggregate", "enterprise", "API"],
    explanation: "Data aggregators serving enterprise clients need programmatic access to earnings content to fill coverage gaps." },

  { id: 10, tier: 1, bucket: "not-icp",
    text: "We're a VC fund. We lead Series A and B rounds in Nordic SaaS and fintech startups.",
    signals: ["VC fund", "Series A", "startups"],
    explanation: "VC funds investing in private companies don't use public earnings call research — their workflow is around private company diligence." },

  { id: 11, tier: 1, bucket: "buy-side",
    text: "Our family office manages $600M for a Swedish industrial family. Three portfolio managers, all running fundamental equity strategies.",
    signals: ["family office", "portfolio managers", "fundamental equity"],
    explanation: "Family offices with internal fundamental equity teams are buy-side institutions." },

  { id: 12, tier: 1, bucket: "sell-side",
    text: "We publish independent equity research on Nordic small caps. Our 600 institutional subscribers pay an annual licence.",
    signals: ["publish", "equity research", "institutional subscribers"],
    explanation: "Independent research firms selling analysis to institutional investors are sell-side." },

  { id: 13, tier: 1, bucket: "ir",
    text: "We're a recently IPO'd medtech company on Nasdaq Stockholm. This is our first earnings season and we're figuring everything out.",
    signals: ["recently IPO'd", "first earnings season"],
    explanation: "Newly listed companies managing their first investor relations cycle are a high-value IR use case." },

  { id: 14, tier: 1, bucket: "api",
    text: "Our investment platform wants to embed live earnings call audio and transcripts directly into the product for our institutional users.",
    signals: ["embed", "earnings call", "for our users"],
    explanation: "Platforms embedding earnings content into their own product need API access, not direct user seats." },

  { id: 15, tier: 1, bucket: "not-icp",
    text: "I'm an independent financial advisor managing portfolios for 45 private clients. AUM around €80M.",
    signals: ["financial advisor", "private clients"],
    explanation: "Independent advisors serving retail clients aren't in Quartr's core ICP — the platform is optimised for institutional research workflows." },

  // ─── TIER 2 — Clearer with context (12s) ─────────────────────────────────

  { id: 16, tier: 2, bucket: "buy-side",
    text: "We run a $1.2B hedge fund focused on European small caps. Very bottoms-up, highly concentrated. Our PMs listen to every call in the companies we own.",
    signals: ["hedge fund", "bottoms-up"],
    explanation: "Fundamental bottoms-up hedge funds need deep company content — earnings calls are core to their process." },

  { id: 17, tier: 2, bucket: "sell-side",
    text: "Our bank covers 120 Nordic companies. We have 15 analysts and distribute research to 600 institutional clients globally.",
    signals: ["covers", "distribute research to institutional clients"],
    explanation: "Banks covering companies and distributing research to institutions are textbook sell-side." },

  { id: 18, tier: 2, bucket: "ir",
    text: "Our company has 400+ institutional shareholders. We have two dedicated IR people who manage all investor engagement year-round.",
    signals: ["institutional shareholders", "IR people", "investor engagement"],
    explanation: "A public company with a dedicated IR team managing institutional relationships is a core IR use case." },

  { id: 19, tier: 2, bucket: "api",
    text: "We're building a Bloomberg Terminal alternative for institutional investors in emerging markets. Earnings call data is one of our key modules.",
    signals: ["Bloomberg Terminal alternative", "earnings call data"],
    explanation: "Companies building financial terminals for institutions need data infrastructure — an API relationship is the right fit." },

  { id: 20, tier: 2, bucket: "not-icp",
    text: "We run a retail investment app. 200,000 users tracking their stock portfolios and learning about investing.",
    signals: ["retail investment app", "200,000 users"],
    explanation: "Consumer apps for retail investors aren't Quartr's target — the platform is built for institutional research workflows." },

  { id: 21, tier: 2, bucket: "buy-side",
    text: "We're a systematic long/short equity fund based in Stockholm. AUM around €800M. We run quantitative signals but our PMs still review earnings content.",
    signals: ["long/short equity fund"],
    explanation: "Long/short equity funds — even systematic ones — are buy-side institutions that manage capital in public markets." },

  { id: 22, tier: 2, bucket: "sell-side",
    text: "We service 300 institutional clients with daily research on Nordic equities. Our team of 20 analysts covers 200 names.",
    signals: ["service institutional clients", "research"],
    explanation: "Producing and distributing research to institutional clients is the sell-side business model." },

  { id: 23, tier: 2, bucket: "ir",
    text: "We're a Nordic holding company listed on Nasdaq Stockholm with 14 operating subsidiaries. Our parent IR team handles all 14 entities.",
    signals: ["listed on Nasdaq Stockholm", "IR team handles"],
    explanation: "A holding company's IR team managing investor relations across multiple listed entities is a complex IR use case." },

  { id: 24, tier: 2, bucket: "api",
    text: "We're a news analytics company. We ingest earnings call audio for NLP-based sentiment analysis. Need a reliable feed for 3,000 companies.",
    signals: ["ingest earnings call", "sentiment analysis", "feed"],
    explanation: "Analytics companies processing earnings content programmatically at scale need API access to audio and transcripts." },

  { id: 25, tier: 2, bucket: "not-icp",
    text: "We do management consulting for FTSE100 companies on operational efficiency and digital transformation.",
    signals: ["management consulting", "operational efficiency"],
    explanation: "Management consultants working on operations and transformation don't use earnings call research as a primary workflow." },

  { id: 26, tier: 2, bucket: "buy-side",
    text: "Our endowment fund has a 35% allocation to global public equities. All research is done internally by our six-person investment team.",
    signals: ["endowment fund", "public equities", "internal research"],
    explanation: "Endowment funds with internal equity research teams are buy-side institutions." },

  { id: 27, tier: 2, bucket: "sell-side",
    text: "We're an agency broker. We execute trades and bundle in proprietary research for our hedge fund and asset manager clients.",
    signals: ["agency broker", "research", "hedge fund and asset manager clients"],
    explanation: "Agency brokers providing research alongside trade execution are sell-side." },

  { id: 28, tier: 2, bucket: "ir",
    text: "We manage investor relations for a Swedish pharma group. We have three separately listed entities across different exchanges.",
    signals: ["investor relations", "separately listed entities"],
    explanation: "Managing IR across multiple listed entities under one group is a complex, high-value IR use case." },

  { id: 29, tier: 2, bucket: "api",
    text: "We build portfolio management software for wealth managers. We'd like to enrich our data layer with real-time earnings call content.",
    signals: ["portfolio management software", "real-time earnings call content"],
    explanation: "Software companies enriching their product with earnings data need API access to integrate it at scale." },

  { id: 30, tier: 2, bucket: "not-icp",
    text: "We offer prime brokerage services to 80 hedge fund clients across Europe — clearing, financing, and reporting.",
    signals: ["prime brokerage", "clearing, financing"],
    explanation: "Prime brokers provide operational infrastructure to hedge funds — not a research content use case." },

  { id: 31, tier: 2, bucket: "buy-side",
    text: "Our sovereign wealth fund runs a $60B diversified portfolio. The listed equities sleeve is managed entirely in-house by a 30-person team.",
    signals: ["sovereign wealth fund", "listed equities", "managed in-house"],
    explanation: "Sovereign wealth funds with internal listed equity management teams are large buy-side institutions." },

  { id: 32, tier: 2, bucket: "ir",
    text: "We recently dual-listed on both Nasdaq Stockholm and NYSE. Our IR team is now managing two separate investor communities and disclosure requirements.",
    signals: ["dual-listed", "IR team", "two investor communities"],
    explanation: "A dual-listed company managing IR across two exchanges is a sophisticated, high-priority IR use case." },

  { id: 33, tier: 2, bucket: "api",
    text: "We're an AI research startup building a tool that summarises earnings calls for sell-side analysts. We need audio and transcript feeds.",
    signals: ["AI", "summarises earnings calls", "transcript feeds"],
    explanation: "AI tools processing earnings calls for analysts need API access to audio and transcript data at scale." },

  { id: 34, tier: 2, bucket: "not-icp",
    text: "We're a fintech lending platform. We assess creditworthiness of corporate borrowers using alternative data.",
    signals: ["lending platform", "creditworthiness", "corporate borrowers"],
    explanation: "Credit lending platforms using alternative data for loan decisions don't use earnings call research as a core tool." },

  { id: 35, tier: 2, bucket: "sell-side",
    text: "We're a boutique M&A advisory firm. We also publish sector research to differentiate with our 200 institutional advisory clients.",
    signals: ["publish sector research", "institutional advisory clients"],
    explanation: "Producing and distributing research to institutional clients is sell-side, even when M&A advisory is also part of the business." },

  // ─── TIER 3 — Moderately ambiguous (10s) ─────────────────────────────────

  { id: 36, tier: 3, bucket: "buy-side",
    text: "We're a multi-family office. 12 ultra-high-net-worth families, around €2B in total AUM. We do fundamental public equity research in-house.",
    signals: ["multi-family office", "fundamental public equity"],
    explanation: "Multi-family offices with internal equity research teams are buy-side institutions, not wealth advisors." },

  { id: 37, tier: 3, bucket: "sell-side",
    text: "We're a quantitative research firm. We sell factor models, systematic signals, and earnings revision data to institutional asset managers.",
    signals: ["sell factor models", "to institutional asset managers"],
    explanation: "Selling research products to asset managers is sell-side even when the research is quantitative rather than fundamental." },

  { id: 38, tier: 3, bucket: "ir",
    text: "We provide outsourced investor relations to 25 listed Nordic companies. Full-service IR agency — we act as their IR department.",
    signals: ["outsourced investor relations", "listed Nordic companies", "IR agency"],
    explanation: "Outsourced IR agencies have the same content and analytics needs as in-house IR teams." },

  { id: 39, tier: 3, bucket: "api",
    text: "We're a data vendor. We license and redistribute financial data to 200+ enterprise clients globally. We're missing an earnings call layer.",
    signals: ["data vendor", "redistribute", "enterprise clients"],
    explanation: "Data vendors redistributing content to enterprise clients need API or data licensing — not user seats." },

  { id: 40, tier: 3, bucket: "not-icp",
    text: "We do financial due diligence for private equity firms. We're independent — not the PE firm — and work on buyout transactions.",
    signals: ["financial due diligence", "private equity", "buyout transactions"],
    explanation: "Third-party due diligence advisors work on private transactions — public earnings research isn't central to their workflow." },

  { id: 41, tier: 3, bucket: "buy-side",
    text: "We run an event-driven strategy. We build positions around earnings releases, M&A announcements, and corporate spin-offs.",
    signals: ["event-driven strategy", "positions around earnings releases"],
    explanation: "Event-driven funds trading around earnings catalysts are heavy users of earnings content — core buy-side." },

  { id: 42, tier: 3, bucket: "sell-side",
    text: "Our independent research platform has 40 analysts covering European equities. Institutional clients pay an annual subscription to access all reports.",
    signals: ["independent research platform", "institutional clients pay", "subscription"],
    explanation: "A subscription research platform selling to institutional clients is sell-side — they produce analysis, not manage capital." },

  { id: 43, tier: 3, bucket: "ir",
    text: "I'm a communications advisor. About half my practice is working with listed company management teams on investor messaging and narrative.",
    signals: ["listed company management teams", "investor messaging"],
    explanation: "Communications advisors crafting investor messaging for listed companies are doing outsourced IR work." },

  { id: 44, tier: 3, bucket: "api",
    text: "We build equity research productivity tools for sell-side analysts. We'd want to pull Quartr's earnings content directly into our workflow platform.",
    signals: ["tools for sell-side analysts", "pull earnings content", "into our platform"],
    explanation: "Companies building software for analysts need API access to embed earnings data into their product." },

  { id: 45, tier: 3, bucket: "not-icp",
    text: "We run an algorithmic trading desk. Our edge is latency and market microstructure — fundamental research isn't part of our process.",
    signals: ["algorithmic trading", "latency", "market microstructure"],
    explanation: "Algo traders focused on speed and microstructure don't use fundamental earnings call research." },

  { id: 46, tier: 3, bucket: "buy-side",
    text: "Our real assets fund has a 20% sleeve in listed equities. That team does deep fundamental work before every position.",
    signals: ["listed equities", "deep fundamental work"],
    explanation: "A listed equities team doing fundamental research is buy-side regardless of the parent fund's broader mandate." },

  { id: 47, tier: 3, bucket: "sell-side",
    text: "We're a think tank producing macroeconomic and sector analysis specifically for institutional investor subscribers.",
    signals: ["analysis for institutional investor subscribers"],
    explanation: "Producing and selling analysis to institutional investors is a sell-side model, even under a think-tank structure." },

  { id: 48, tier: 3, bucket: "ir",
    text: "We're a capital markets advisory firm. A key deliverable for our listed clients is IR process optimisation — how they communicate, who they target, what content they produce.",
    signals: ["capital markets advisory", "IR process optimisation", "listed clients"],
    explanation: "Capital markets advisors helping listed companies optimise IR are doing IR advisory work." },

  { id: 49, tier: 3, bucket: "api",
    text: "We run an alternative data platform serving quantitative investors. Earnings call audio is a signal layer our clients want. Looking for a feed covering European companies.",
    signals: ["alternative data platform", "earnings call audio", "feed"],
    explanation: "Alternative data platforms serving quant investors need programmatic access to earnings call feeds." },

  { id: 50, tier: 3, bucket: "not-icp",
    text: "We're a sovereign debt advisory firm. We advise Nordic governments and municipalities on bond issuance strategy.",
    signals: ["sovereign debt advisory", "bond issuance"],
    explanation: "Sovereign debt advisors work with governments on public borrowing — not a public equity research workflow." },

  { id: 51, tier: 3, bucket: "buy-side",
    text: "We're an insurance company. Our internal investment team manages €8B in listed equities and corporate bonds.",
    signals: ["insurance company", "internal investment team", "listed equities"],
    explanation: "Insurers with substantial internal equity portfolios are buy-side institutions with real research needs." },

  { id: 52, tier: 3, bucket: "sell-side",
    text: "We produce sector thematic reports on European tech and consumer. Asset managers pay per-report or take an annual subscription.",
    signals: ["thematic reports", "asset managers pay"],
    explanation: "Selling research to asset managers on a paid basis is sell-side, even when packaged as thematic content." },

  // ─── TIER 4 — Tricky (8s) ─────────────────────────────────────────────────

  { id: 53, tier: 4, bucket: "buy-side",
    text: "We're a family office that migrated from private to public markets two years ago. We now run €300M in listed equities with a five-person fundamental team.",
    signals: ["migrated to public markets", "listed equities", "fundamental team"],
    explanation: "A family office that has moved into listed equities with internal analysts is now buy-side — same need as any fund." },

  { id: 54, tier: 4, bucket: "sell-side",
    text: "We're a financial media company. We produce video analysis and written sector breakdowns, and institutional investors are our primary audience.",
    signals: ["produce video analysis", "institutional investors are our primary audience"],
    explanation: "Financial media producing content sold to institutional investors operates as sell-side even without a bank or broker structure." },

  { id: 55, tier: 4, bucket: "ir",
    text: "We're a financial PR agency. About 60% of our clients are listed companies, and for those clients we handle investor communications end to end.",
    signals: ["financial PR agency", "listed companies", "investor communications"],
    explanation: "Financial PR agencies running investor communications for listed companies have the same analytics needs as in-house IR." },

  { id: 56, tier: 4, bucket: "api",
    text: "We build compliance and surveillance tools for financial regulators. We want to ingest earnings call transcripts for disclosure monitoring.",
    signals: ["compliance tools", "financial regulators", "transcripts for disclosure monitoring"],
    explanation: "Regulatory tech platforms processing earnings transcripts for surveillance and compliance need API access." },

  { id: 57, tier: 4, bucket: "not-icp",
    text: "We're a credit hedge fund. We trade corporate bonds and CDS, with no equity exposure in the book.",
    signals: ["credit hedge fund", "corporate bonds and CDS", "no equity exposure"],
    explanation: "Credit-only funds that don't hold equities have limited use for equity earnings research — wrong product fit." },

  { id: 58, tier: 4, bucket: "buy-side",
    text: "We manage a registered UCITS fund distributed across Europe. Fundamental long-only equity strategy, €600M AUM.",
    signals: ["UCITS fund", "fundamental long-only equity"],
    explanation: "A registered UCITS fund with a fundamental equity strategy is buy-side — they invest in public companies." },

  { id: 59, tier: 4, bucket: "sell-side",
    text: "We're a consultancy that produces annual industry benchmarks. They're sold to both institutional investors and corporate strategy teams.",
    signals: ["produces benchmarks sold to institutional investors"],
    explanation: "Producing and selling research products to institutional investors is sell-side, regardless of the 'consultancy' label." },

  { id: 60, tier: 4, bucket: "ir",
    text: "We help companies with pre-IPO investor positioning and post-listing IR setup. Currently 8 clients across the Nordics preparing to go public.",
    signals: ["pre-IPO investor positioning", "post-listing IR setup"],
    explanation: "Firms helping companies structure and launch their IR function are doing IR advisory work." },

  { id: 61, tier: 4, bucket: "api",
    text: "We're building an AI assistant for fundamental equity analysts. It needs to process earnings calls, transcripts, and Q&A sections as core inputs.",
    signals: ["AI assistant for fundamental analysts", "process earnings calls"],
    explanation: "AI tools for analysts processing earnings calls at scale need API access to audio and transcript data." },

  { id: 62, tier: 4, bucket: "not-icp",
    text: "We're a fund administrator. We calculate NAV and handle back-office reporting, compliance, and accounting for 40 hedge fund clients.",
    signals: ["fund administrator", "NAV", "back-office reporting"],
    explanation: "Fund administrators handle operational functions for funds — earnings call research isn't part of their workflow." },

  { id: 63, tier: 4, bucket: "buy-side",
    text: "We run a long/short equity sleeve within a larger multi-strategy fund. Our sleeve is €400M, fully discretionary. We go deep on every name we own.",
    signals: ["long/short equity sleeve", "discretionary"],
    explanation: "A discretionary long/short equity sleeve doing deep fundamental work is buy-side, regardless of the parent structure." },

  { id: 64, tier: 4, bucket: "sell-side",
    text: "We're a macro research firm. We produce global macro and cross-asset views, and sell them to sovereign wealth funds and large institutional asset managers.",
    signals: ["sell macro views", "sovereign wealth funds and institutional asset managers"],
    explanation: "Selling research to asset managers and sovereign wealth funds is sell-side even if the content is macro rather than equity-specific." },

  { id: 65, tier: 4, bucket: "ir",
    text: "We're a listed company. Our IR is currently handled by the CFO directly — we haven't hired a dedicated IR person yet, but we want better tools.",
    signals: ["listed company", "IR handled by the CFO"],
    explanation: "Any listed company managing investor relations — even without dedicated IR staff — is an IR use case." },

  { id: 66, tier: 4, bucket: "api",
    text: "We're a financial data reseller. We license primary source content and distribute it to 400 enterprise clients who use it in their own products.",
    signals: ["financial data reseller", "distribute to enterprise clients"],
    explanation: "Data resellers serving enterprise clients need data licensing or API access — not direct user seats." },

  { id: 67, tier: 4, bucket: "not-icp",
    text: "We run a distressed debt fund. We focus exclusively on restructuring situations, pre-bankruptcy bonds, and creditor negotiations.",
    signals: ["distressed debt fund", "pre-bankruptcy bonds", "creditor negotiations"],
    explanation: "Distressed debt funds focused on credit restructuring and legal processes have limited use for equity earnings research." },

  // ─── TIER 5 — Edge cases (6s) ─────────────────────────────────────────────

  { id: 68, tier: 5, bucket: "buy-side",
    text: "We're a long-only fund but our sole LP is one Nordic family. €150M AUM. We run an independent mandate with full discretion.",
    signals: ["long-only fund", "sole LP", "independent mandate"],
    explanation: "A long-only equity fund with full investment discretion is buy-side, even with a single family as LP." },

  { id: 69, tier: 5, bucket: "sell-side",
    text: "Our eight-person team produces daily earnings previews and post-results notes on Nordic companies. Institutional clients subscribe at €20K per year.",
    signals: ["earnings previews and post-results notes", "institutional clients subscribe"],
    explanation: "Selling earnings research on subscription to institutional clients is sell-side, even from a small or independent shop." },

  { id: 70, tier: 5, bucket: "ir",
    text: "We're the listed parent of a PE firm. We have public shareholders, file quarterly reports, and our IR team manages all external investor communications.",
    signals: ["listed parent", "IR team", "external investor communications"],
    explanation: "Any listed entity with an IR team managing public investor relations is an IR use case, whatever their underlying business is." },

  { id: 71, tier: 5, bucket: "api",
    text: "We build software specifically for IR teams at listed companies. We'd want to pull Quartr's analytics data directly into our IR management platform.",
    signals: ["software for IR teams", "pull Quartr's analytics", "IR management platform"],
    explanation: "Software companies building IR platforms need API access to embed earnings analytics — not IR team seats themselves." },

  { id: 72, tier: 5, bucket: "not-icp",
    text: "We're a retail trading platform with 500,000 users. Our users trade equities but we don't provide institutional-grade research or content.",
    signals: ["retail trading platform", "500,000 users"],
    explanation: "Retail trading platforms for individual investors aren't Quartr's ICP — the product is built for institutional research workflows." },

  { id: 73, tier: 5, bucket: "buy-side",
    text: "We're a GARP fund. We go deep on fundamentals before every position — quality earnings call analysis is central to how we form conviction.",
    signals: ["GARP fund", "deep on fundamentals", "earnings call analysis"],
    explanation: "A GARP fund doing deep fundamental research is core buy-side — earnings calls are a primary research tool." },

  { id: 74, tier: 5, bucket: "sell-side",
    text: "We produce custom earnings analysis for institutional clients on a per-request basis — modelling, scenarios, post-call summaries.",
    signals: ["custom earnings analysis for institutional clients", "per-request"],
    explanation: "Producing and selling custom earnings analysis to institutional clients is sell-side research, even when delivered on demand." },

  { id: 75, tier: 5, bucket: "ir",
    text: "We're a PE-backed company actively preparing to IPO. We're building our IR infrastructure now — messaging, targeting, processes — before listing.",
    signals: ["preparing to IPO", "building IR infrastructure"],
    explanation: "Pre-IPO companies building investor relations capability before listing will immediately become IR users at listing." },

  { id: 76, tier: 5, bucket: "api",
    text: "We're a portfolio analytics platform for institutional asset managers. We want to surface earnings call metadata and speaker sentiment in our risk dashboard.",
    signals: ["portfolio analytics platform", "earnings call metadata", "risk dashboard"],
    explanation: "Analytics platforms embedding earnings metadata into their product need API access to integrate at their required scale." },

  { id: 77, tier: 5, bucket: "not-icp",
    text: "We do forensic accounting work for litigation support. We analyse financial statements in dispute cases — no investment research involved.",
    signals: ["forensic accounting", "litigation support", "no investment research"],
    explanation: "Forensic accountants working on legal disputes analyse historical filings, not earnings call research tools." },

  { id: 78, tier: 5, bucket: "buy-side",
    text: "We're a university endowment. €3B portfolio. The listed equity allocation runs €800M managed by an internal team of six analysts.",
    signals: ["university endowment", "listed equity", "internal team of analysts"],
    explanation: "University endowments with internal equity analysts are buy-side institutions — same research needs as any asset manager." },

  { id: 79, tier: 5, bucket: "sell-side",
    text: "I'm a former hedge fund analyst. I now run a paid research newsletter on Nordic equities with 200 institutional subscribers.",
    signals: ["paid research newsletter", "institutional subscribers"],
    explanation: "Selling earnings research on subscription to institutional investors is sell-side — even as a solo operator." },

  { id: 80, tier: 5, bucket: "ir",
    text: "We're a Nordic bank with an active capital markets division. Part of what we do is coaching listed company management teams on investor communications and IR strategy.",
    signals: ["coaching listed company management", "investor communications", "IR strategy"],
    explanation: "Banks coaching listed companies on IR strategy are doing IR advisory work — they need the same content as IR teams." },

  { id: 81, tier: 5, bucket: "api",
    text: "We're a regulatory data provider. We compile public company disclosures for supervisory authorities in the Nordics. Earnings transcripts are a gap we need to fill.",
    signals: ["regulatory data provider", "public company disclosures", "supervisory authorities"],
    explanation: "Regulatory data providers compiling public disclosures need data licensing or API access, not user seats." },

  { id: 82, tier: 5, bucket: "not-icp",
    text: "We run a credit rating agency for Scandinavian corporate issuers. We rate bonds and publish credit opinions — equity research isn't part of what we do.",
    signals: ["credit rating agency", "rate bonds", "equity research isn't part of what we do"],
    explanation: "Credit rating agencies focus on debt quality, not equity earnings research — wrong product fit." },

  { id: 83, tier: 5, bucket: "buy-side",
    text: "We manage a long-biased equity fund of €900M. We don't have a strong view, so we typically hold 40-60 names. We rely heavily on earnings call access.",
    signals: ["long-biased equity fund", "rely heavily on earnings call access"],
    explanation: "A long-biased equity fund that relies on earnings call content is core buy-side — exactly Quartr's target user." },

  { id: 84, tier: 5, bucket: "sell-side",
    text: "We're an analytics consultancy. Our institutional investor clients pay us to run custom earnings revision models and flag signal changes in our coverage universe.",
    signals: ["institutional investor clients pay", "earnings revision models", "coverage universe"],
    explanation: "Producing custom analytics sold to institutional investors is sell-side research, regardless of the 'consultancy' label." },

  { id: 85, tier: 5, bucket: "ir",
    text: "We're a strategic communications firm. About half our clients are listed companies. For those, we do everything from press releases to analyst day prep and investor targeting.",
    signals: ["listed companies", "analyst day prep", "investor targeting"],
    explanation: "A comms firm running analyst days and investor targeting for listed companies is doing outsourced IR — same needs as an in-house team." },
];

export const TIER_TIME = { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6 };

export const BUCKETS = [
  { key: "buy-side",  label: "BUY-SIDE" },
  { key: "sell-side", label: "SELL-SIDE" },
  { key: "ir",        label: "IR" },
  { key: "api",       label: "API" },
  { key: "not-icp",   label: "NOT OUR ICP" },
];
