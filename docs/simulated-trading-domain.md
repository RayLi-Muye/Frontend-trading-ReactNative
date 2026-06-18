# Simulated Trading Domain Contract

This contract is the first code-level boundary for the product vision in `docs/product-vision.md`. It models user trading interaction as app-owned simulation only: real market data may provide quote snapshots, but virtual funds, simulated orders, fills, positions, and ledger entries remain independent product records.

## Current Scope

The initial contract supports one operation:

```text
simulated market order + quote snapshot -> immediate simulated fill + virtual-cash ledger entry + updated position state
```

The contract intentionally supports only simulated market buy/sell orders with immediate simulated fills. It does not model limit orders, partial fills, routing venues, broker order states, settlement, fees, margin, or tax lots.

## Inputs

- Simulated account id, virtual USD cash balance, and current positions.
- User-submitted simulated order id, fill id, ledger entry id, side, symbol, quantity, and timestamp.
- Quote snapshot with bid, ask, last price, source label, and data timestamp.

The quote snapshot is an input. This module does not fetch market data and must not hold market-data provider credentials.

## Outputs

- A `SimulatedOrder` with `orderType: "market"` and `status: "filled"`.
- A `SimulatedFill` priced from the quote snapshot.
- A signed virtual-cash `SimulatedLedgerEntry` linked to the order and fill.
- Updated simulated account cash and positions.

Buy orders use the quote ask when available, otherwise the last price. Sell orders use the quote bid when available, otherwise the last price.

## Rejections

The contract rejects:

- Account/order mismatches.
- Missing or invalid identifiers.
- Invalid quantity or quote prices.
- Buy orders with insufficient virtual funds.
- Sell orders that exceed the current simulated position.

## Product Boundaries

- No real money moves.
- No broker, exchange, market maker, or paper-trading broker order is created.
- No provider API, paid API, credentialed API, or API key is used.
- Ledger entries are virtual cash effects only.
- Positions are derived from simulated fills and should become backend-owned before production distribution.

## Future Backend Ownership

Production backend work should preserve this boundary while replacing local state with durable records:

- Simulated account and virtual cash balance.
- Simulated order and fill records.
- Virtual-cash ledger entries.
- Position derivation or position snapshots.
- Portfolio snapshots from positions and market data.

Any future order type beyond immediate simulated market orders needs an explicit product and ledger model before implementation.

## Local Demo Adapter

`src/services/demo-simulated-trading.ts` is a local adapter for the existing Expo demo state. It converts demo wallet accounts and holdings into `SimulatedAccountState`, submits a simulated market order through `applySimulatedMarketOrder`, and returns updated wallet accounts, holdings, order, fill, and accumulated virtual-cash ledger entries.

The adapter is not the production backend. It exists so the current prototype can move toward the production boundary without introducing Supabase, broker routing, market-data provider calls, paid APIs, or credentials.

Current limitation: the domain contract stores quote prices as integer cents. The local adapter rounds demo quote prices to cents, so sub-cent instruments need an explicit price-precision decision before broad trade-ticket adoption.

## Local Order Preview

`previewDemoSimulatedMarketOrder` uses the same domain order application path as the local adapter, but it returns a read-only preview instead of mutating local demo state. The trade ticket can show estimated cost or proceeds, virtual cash after, position after, ledger effect, and guardrails before submission.

Current local guardrails include:

- insufficient virtual funds;
- overselling beyond the current simulated position;
- concentration-style warning when a buy order would use more than 25% of current virtual cash.

The preview is educational simulation feedback only. It does not route a real order, reserve funds, call a broker, call an AI API, use credentials, or provide financial advice.
