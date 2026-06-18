const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
  strict: true,
};

Module._extensions[".ts"] = function loadTsModule(module, filename) {
  const transpiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions,
    fileName: filename,
    reportDiagnostics: true,
  });
  const diagnostics = transpiled.diagnostics || [];

  assert.equal(diagnostics.length, 0, diagnostics.map((diagnostic) => diagnostic.messageText).join("\n"));
  module._compile(transpiled.outputText, filename);
};

const { SimulatedTradingError, applySimulatedMarketOrder } = require("../src/domain/simulated-trading.ts");
const { createDemoInstrumentPositionSummary } = require("../src/services/demo-instrument-position-summary.ts");
const { createDemoPortfolioLearningInsights } = require("../src/services/demo-portfolio-insights.ts");
const { applyDemoSimulatedMarketOrder, previewDemoSimulatedMarketOrder } = require("../src/services/demo-simulated-trading.ts");
const { createDemoTradeJournal } = require("../src/services/demo-trade-journal.ts");
const { createDemoWatchlistCompare } = require("../src/services/demo-watchlist-compare.ts");

const quote = {
  symbol: "NVDA",
  bidPriceCents: 9_950,
  askPriceCents: 10_000,
  lastPriceCents: 9_980,
  asOf: "2026-06-17T14:30:00.000Z",
  source: "fixture",
  feedLabel: "fixture quote",
};

const emptyAccount = {
  accountId: "acct_1",
  currency: "USD",
  virtualCashCents: 100_000,
  positions: [],
};

const buy = applySimulatedMarketOrder(emptyAccount, {
  orderId: "ord_buy_1",
  fillId: "fill_buy_1",
  ledgerEntryId: "ledger_buy_1",
  accountId: "acct_1",
  symbol: "nvda",
  side: "buy",
  quantity: 2,
  submittedAt: "2026-06-17T14:31:00.000Z",
  quote,
});

assert.equal(buy.account.virtualCashCents, 80_000);
assert.deepEqual(buy.account.positions, [{ symbol: "NVDA", quantity: 2, averageCostCents: 10_000 }]);
assert.equal(buy.order.orderType, "market");
assert.equal(buy.order.status, "filled");
assert.equal(buy.fill.priceCents, 10_000);
assert.equal(buy.fill.notionalCents, 20_000);
assert.deepEqual(buy.ledgerEntries, [
  {
    id: "ledger_buy_1",
    accountId: "acct_1",
    orderId: "ord_buy_1",
    fillId: "fill_buy_1",
    type: "virtual_cash_debit",
    currency: "USD",
    amountCents: -20_000,
    balanceAfterCents: 80_000,
    occurredAt: "2026-06-17T14:31:00.000Z",
  },
]);
assert.equal(Object.hasOwn(buy.order, "brokerOrderId"), false);
assert.equal(Object.hasOwn(buy.fill, "brokerExecutionId"), false);

const sell = applySimulatedMarketOrder(buy.account, {
  orderId: "ord_sell_1",
  fillId: "fill_sell_1",
  ledgerEntryId: "ledger_sell_1",
  accountId: "acct_1",
  symbol: "NVDA",
  side: "sell",
  quantity: 0.5,
  submittedAt: "2026-06-17T14:32:00.000Z",
  quote,
});

assert.equal(sell.account.virtualCashCents, 84_975);
assert.deepEqual(sell.account.positions, [{ symbol: "NVDA", quantity: 1.5, averageCostCents: 10_000 }]);
assert.equal(sell.fill.priceCents, 9_950);
assert.equal(sell.fill.notionalCents, 4_975);
assert.equal(sell.ledgerEntries[0].type, "virtual_cash_credit");
assert.equal(sell.ledgerEntries[0].amountCents, 4_975);

assert.throws(
  () =>
    applySimulatedMarketOrder({ ...emptyAccount, virtualCashCents: 1_000 }, {
      orderId: "ord_reject_cash",
      fillId: "fill_reject_cash",
      ledgerEntryId: "ledger_reject_cash",
      accountId: "acct_1",
      symbol: "NVDA",
      side: "buy",
      quantity: 1,
      submittedAt: "2026-06-17T14:33:00.000Z",
      quote,
    }),
  (error) => error instanceof SimulatedTradingError && error.code === "INSUFFICIENT_VIRTUAL_FUNDS",
);

assert.throws(
  () =>
    applySimulatedMarketOrder(emptyAccount, {
      orderId: "ord_reject_position",
      fillId: "fill_reject_position",
      ledgerEntryId: "ledger_reject_position",
      accountId: "acct_1",
      symbol: "NVDA",
      side: "sell",
      quantity: 1,
      submittedAt: "2026-06-17T14:34:00.000Z",
      quote,
    }),
  (error) => error instanceof SimulatedTradingError && error.code === "INSUFFICIENT_POSITION",
);

const fixtureAsset = {
  symbol: "AMD",
  name: "Advanced Micro Devices",
  price: 50,
  change: 1.2,
  changePercent: 2.46,
  bid: 49.9,
  ask: 50.1,
  logoLabel: "AMD",
  logoBackground: "#303236",
  logoColor: "#ffffff",
  sparkline: [48, 49, 50],
};
const fixtureWalletAccounts = [
  {
    code: "USD",
    name: "US Dollar",
    balance: 1_000,
    available: 1_000,
    accent: "#05b83f",
  },
];

const emptyLearningInsights = createDemoPortfolioLearningInsights({
  holdings: [],
  ledgerEntries: [],
  walletAccounts: fixtureWalletAccounts,
});

assert.equal(emptyLearningInsights.positionCount, 0);
assert.equal(emptyLearningInsights.cashAllocationPercent, 100);
assert.equal(emptyLearningInsights.recentActivity.entryCount, 0);
assert.equal(emptyLearningInsights.recentActivity.label, "No simulated ledger entries yet");
assert.equal(emptyLearningInsights.topExposure, undefined);
assert.match(emptyLearningInsights.disclosure, /Not financial advice/);

const emptyInstrumentPositionSummary = createDemoInstrumentPositionSummary({
  asset: fixtureAsset,
  holdings: [],
  ledgerEntries: [],
  walletAccounts: fixtureWalletAccounts,
});

assert.equal(emptyInstrumentPositionSummary.hasPosition, false);
assert.equal(emptyInstrumentPositionSummary.quantity, 0);
assert.equal(emptyInstrumentPositionSummary.marketValue, 0);
assert.equal(emptyInstrumentPositionSummary.averageCost, null);
assert.equal(emptyInstrumentPositionSummary.recentActivity.label, "No simulated activity");
assert.match(emptyInstrumentPositionSummary.disclosure, /Not financial advice/);

const emptyTradeJournal = createDemoTradeJournal({
  ledgerEntries: [],
});

assert.equal(emptyTradeJournal.entries.length, 0);
assert.equal(emptyTradeJournal.emptyMessage, "No simulated journal entries yet.");
assert.match(emptyTradeJournal.disclosure, /Not financial advice/);

const demoBuy = applyDemoSimulatedMarketOrder(
  {
    holdings: [],
    ledgerEntries: [],
    walletAccounts: fixtureWalletAccounts,
  },
  {
    asset: fixtureAsset,
    ids: {
      fillId: "demo_fill_buy_1",
      ledgerEntryId: "demo_ledger_buy_1",
      orderId: "demo-order-1-1-amd-buy",
    },
    quantity: 2,
    side: "buy",
    submittedAt: "2026-06-17T15:00:00.000Z",
  },
);

assert.equal(demoBuy.walletAccounts[0].available, 899.8);
assert.deepEqual(demoBuy.holdings.map(({ symbol, units, value }) => ({ symbol, units, value })), [
  { symbol: "AMD", units: 2, value: 100 },
]);
assert.equal(demoBuy.ledgerEntries.length, 1);
assert.equal(demoBuy.ledgerEntries[0].amountCents, -10_020);
assert.equal(demoBuy.order.status, "filled");
assert.equal(demoBuy.fill.priceCents, 5_010);

const populatedLearningInsights = createDemoPortfolioLearningInsights(demoBuy);

assert.equal(populatedLearningInsights.positionCount, 1);
assert.equal(populatedLearningInsights.topExposure.symbol, "AMD");
assert.equal(populatedLearningInsights.topExposure.value, 100);
assert.equal(populatedLearningInsights.recentActivity.entryCount, 1);
assert.equal(populatedLearningInsights.recentActivity.label, "Latest simulated ledger");
assert.match(populatedLearningInsights.recentActivity.summary, /virtual cash debit/);
assert(populatedLearningInsights.cashAllocationPercent > 80);

const populatedInstrumentPositionSummary = createDemoInstrumentPositionSummary({
  asset: fixtureAsset,
  holdings: demoBuy.holdings,
  ledgerEntries: demoBuy.ledgerEntries,
  walletAccounts: demoBuy.walletAccounts,
});

assert.equal(populatedInstrumentPositionSummary.hasPosition, true);
assert.equal(populatedInstrumentPositionSummary.quantity, 2);
assert.equal(populatedInstrumentPositionSummary.marketValue, 100);
assert.equal(populatedInstrumentPositionSummary.costBasis, 100);
assert.equal(populatedInstrumentPositionSummary.averageCost, 50);
assert.equal(populatedInstrumentPositionSummary.unrealizedPnl, 0);
assert(populatedInstrumentPositionSummary.allocationPercent > 9);
assert.equal(populatedInstrumentPositionSummary.recentActivity.label, "Latest simulated activity");
assert.match(populatedInstrumentPositionSummary.recentActivity.summary, /AMD simulated buy/);

const buyTradeJournal = createDemoTradeJournal({
  filter: { action: "buy", symbol: "AMD" },
  ledgerEntries: demoBuy.ledgerEntries,
});

assert.equal(buyTradeJournal.entries.length, 1);
assert.equal(buyTradeJournal.entries[0].symbol, "AMD");
assert.equal(buyTradeJournal.entries[0].action, "buy");
assert(buyTradeJournal.entries[0].cashFlow < 0);
assert.match(buyTradeJournal.entries[0].cashFlowLabel, /debit/);
assert.match(buyTradeJournal.entries[0].positionImpact, /increased/);
assert.match(buyTradeJournal.entries[0].recapPrompt, /Entry recap checklist/);
assert.deepEqual(buyTradeJournal.filterOptions.symbols, ["AMD"]);
assert.deepEqual(buyTradeJournal.filterOptions.actions, ["buy"]);

const allFilteredTradeJournal = createDemoTradeJournal({
  filter: { action: "all", symbol: "all" },
  ledgerEntries: demoBuy.ledgerEntries,
});

assert.equal(allFilteredTradeJournal.entries.length, 1);
assert.equal(allFilteredTradeJournal.entries[0].symbol, "AMD");

const sellFilteredTradeJournal = createDemoTradeJournal({
  filter: { action: "sell", symbol: "AMD" },
  ledgerEntries: demoBuy.ledgerEntries,
});

assert.equal(sellFilteredTradeJournal.entries.length, 0);

const watchlistCompare = createDemoWatchlistCompare({
  assets: [
    fixtureAsset,
    {
      ...fixtureAsset,
      name: "Oracle",
      price: 190,
      symbol: "ORCL",
    },
    {
      ...fixtureAsset,
      name: "Meta Platforms",
      price: 617,
      symbol: "META",
    },
  ],
  holdings: demoBuy.holdings,
  selectedSymbols: ["amd", "orcl", "meta", "amd", "missing"],
});

assert.equal(watchlistCompare.rows.length, 3);
assert.equal(watchlistCompare.rows[0].symbol, "AMD");
assert.equal(watchlistCompare.rows[0].holdingStatus, "Held");
assert.equal(watchlistCompare.rows[0].positionValue, 100);
assert(watchlistCompare.rows[0].exposurePercent > 0);
assert.equal(watchlistCompare.rows[1].holdingStatus, "Not held");
assert.match(watchlistCompare.disclosure, /Not financial advice/);

const demoPreview = previewDemoSimulatedMarketOrder(
  {
    holdings: [],
    ledgerEntries: [],
    walletAccounts: fixtureWalletAccounts,
  },
  {
    asset: fixtureAsset,
    ids: {
      fillId: "demo_preview_fill_buy_1",
      ledgerEntryId: "demo_preview_ledger_buy_1",
      orderId: "demo_preview_order_buy_1",
    },
    quantity: 6,
    side: "buy",
    submittedAt: "2026-06-17T15:00:30.000Z",
  },
);

assert.equal(demoPreview.canSubmit, true);
assert.equal(demoPreview.estimatedNotionalCents, 30_060);
assert.equal(demoPreview.cashBeforeCents, 100_000);
assert.equal(demoPreview.cashAfterCents, 69_940);
assert.equal(demoPreview.ledgerEffectCents, -30_060);
assert.equal(demoPreview.positionBeforeQuantity, 0);
assert.equal(demoPreview.positionAfterQuantity, 6);
assert.equal(demoPreview.warningMessages[0].code, "CONCENTRATION");

const insufficientPreview = previewDemoSimulatedMarketOrder(
  {
    holdings: [],
    ledgerEntries: [],
    walletAccounts: fixtureWalletAccounts,
  },
  {
    asset: fixtureAsset,
    ids: {
      fillId: "demo_preview_fill_reject_cash",
      ledgerEntryId: "demo_preview_ledger_reject_cash",
      orderId: "demo_preview_order_reject_cash",
    },
    quantity: 40,
    side: "buy",
    submittedAt: "2026-06-17T15:00:45.000Z",
  },
);

assert.equal(insufficientPreview.canSubmit, false);
assert.equal(insufficientPreview.blockingReason.code, "INSUFFICIENT_VIRTUAL_FUNDS");

const demoSell = applyDemoSimulatedMarketOrder(demoBuy, {
  asset: fixtureAsset,
  ids: {
    fillId: "demo_fill_sell_1",
    ledgerEntryId: "demo_ledger_sell_1",
    orderId: "demo-order-1-2-amd-sell",
  },
  quantity: 0.5,
  side: "sell",
  submittedAt: "2026-06-17T15:01:00.000Z",
});

assert.equal(demoSell.walletAccounts[0].available, 924.75);
assert.deepEqual(demoSell.holdings.map(({ symbol, units, value }) => ({ symbol, units, value })), [
  { symbol: "AMD", units: 1.5, value: 75 },
]);
assert.equal(demoSell.ledgerEntries.length, 2);
assert.equal(demoSell.ledgerEntries[1].type, "virtual_cash_credit");
assert.equal(demoSell.ledgerEntries[1].amountCents, 2_495);

const sellTradeJournal = createDemoTradeJournal({
  filter: { action: "sell", symbol: "amd" },
  ledgerEntries: demoSell.ledgerEntries,
});

assert.equal(sellTradeJournal.entries.length, 1);
assert.equal(sellTradeJournal.entries[0].action, "sell");
assert.equal(sellTradeJournal.entries[0].cashFlow, 24.95);
assert.match(sellTradeJournal.entries[0].cashFlowLabel, /credit/);
assert.match(sellTradeJournal.entries[0].positionImpact, /reduced or closed/);
assert.match(sellTradeJournal.entries[0].recapPrompt, /Exit recap checklist/);

const oversellPreview = previewDemoSimulatedMarketOrder(demoSell, {
  asset: fixtureAsset,
  ids: {
    fillId: "demo_preview_fill_reject_position",
    ledgerEntryId: "demo_preview_ledger_reject_position",
    orderId: "demo_preview_order_reject_position",
  },
  quantity: 5,
  side: "sell",
  submittedAt: "2026-06-17T15:02:00.000Z",
});

assert.equal(oversellPreview.canSubmit, false);
assert.equal(oversellPreview.blockingReason.code, "INSUFFICIENT_POSITION");

console.log("Simulated trading domain and demo service checks passed.");
