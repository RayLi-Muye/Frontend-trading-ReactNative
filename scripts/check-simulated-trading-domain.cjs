const assert = require("node:assert/strict");
const path = require("node:path");
const ts = require("typescript");

const sourcePath = path.join(__dirname, "..", "src", "domain", "simulated-trading.ts");
const transpiled = ts.transpileModule(require("node:fs").readFileSync(sourcePath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: sourcePath,
  reportDiagnostics: true,
});

const diagnostics = transpiled.diagnostics || [];
assert.equal(diagnostics.length, 0, diagnostics.map((diagnostic) => diagnostic.messageText).join("\n"));

const moduleShim = { exports: {} };
const runModule = new Function("exports", "require", "module", "__filename", "__dirname", transpiled.outputText);
runModule(moduleShim.exports, require, moduleShim, sourcePath, path.dirname(sourcePath));

const { SimulatedTradingError, applySimulatedMarketOrder } = moduleShim.exports;

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

console.log("Simulated trading domain contract check passed.");
