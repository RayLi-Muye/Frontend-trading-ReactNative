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
const { applyDemoSimulatedMarketOrder } = require("../src/services/demo-simulated-trading.ts");

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
      orderId: "demo_order_buy_1",
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

const demoSell = applyDemoSimulatedMarketOrder(demoBuy, {
  asset: fixtureAsset,
  ids: {
    fillId: "demo_fill_sell_1",
    ledgerEntryId: "demo_ledger_sell_1",
    orderId: "demo_order_sell_1",
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

console.log("Simulated trading domain and demo service checks passed.");
