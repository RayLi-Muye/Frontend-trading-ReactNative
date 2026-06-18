import type { EquityAsset, Holding, WalletAccount } from "../data/portfolio";
import type { SimulatedOrderSide } from "../domain/simulated-trading";

export type DemoPositionSizingCoachCheckTone = "negative" | "neutral" | "positive" | "warning";

export type DemoPositionSizingCoachCheck = {
  detail: string;
  label: string;
  tone: DemoPositionSizingCoachCheckTone;
  value: string;
};

export type DemoPositionSizingGuardrail = {
  message: string;
  tone: "blocking" | "neutral" | "warning";
};

export type DemoPositionSizingPreview = {
  blockingReason?: {
    code: string;
    message: string;
  };
  canSubmit: boolean;
  cashAfter: number;
  cashBefore: number;
  estimatedNotional: number;
  ledgerEffect: number;
  positionAfter: number;
  positionBefore: number;
  warningMessages: Array<{
    code: string;
    message: string;
  }>;
};

export type DemoPositionSizingCoachInput = {
  asset: EquityAsset;
  holdings: Holding[];
  orderPreview: DemoPositionSizingPreview;
  side: SimulatedOrderSide;
  walletAccounts: WalletAccount[];
};

export type DemoPositionSizingCoach = {
  checks: DemoPositionSizingCoachCheck[];
  currentAccountValue: number;
  disclosure: string;
  guardrails: DemoPositionSizingGuardrail[];
  hasBlockingGuardrail: boolean;
  positionSizePercent: number;
  projectedAccountValue: number;
  projectedAllocationPercent: number;
  projectedSymbolValue: number;
  symbol: string;
};

export const demoPositionSizingCoachDisclosure =
  "Position sizing coach is local simulation only. Not financial advice; no real assets, broker routes, or live orders are involved.";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function formatSignedCurrency(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";

  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatUnits(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function cashTotal(walletAccounts: WalletAccount[]) {
  return roundCurrency(walletAccounts.reduce((total, account) => total + account.available, 0));
}

function holdingsTotal(holdings: Holding[]) {
  return roundCurrency(holdings.reduce((total, holding) => total + holding.value, 0));
}

function getHolding(holdings: Holding[], symbol: string) {
  const normalized = normalizeSymbol(symbol);

  return holdings.find((holding) => normalizeSymbol(holding.symbol) === normalized);
}

function projectedSymbolValue(input: DemoPositionSizingCoachInput, currentSymbolValue: number) {
  const preview = input.orderPreview;

  if (input.side === "buy") {
    return roundCurrency(currentSymbolValue + preview.estimatedNotional);
  }

  if (preview.positionAfter <= 0 || preview.positionBefore <= 0 || currentSymbolValue <= 0) {
    return 0;
  }

  return roundCurrency(currentSymbolValue * (preview.positionAfter / preview.positionBefore));
}

function createGuardrails(
  input: DemoPositionSizingCoachInput,
  projectedAllocationPercent: number,
): DemoPositionSizingGuardrail[] {
  const guardrails: DemoPositionSizingGuardrail[] = [];

  if (input.orderPreview.blockingReason) {
    guardrails.push({
      message: input.orderPreview.blockingReason.message,
      tone: "blocking",
    });
  }

  input.orderPreview.warningMessages.forEach((warning) => {
    guardrails.push({
      message: warning.message,
      tone: "warning",
    });
  });

  const hasConcentrationWarning = input.orderPreview.warningMessages.some((warning) => warning.code === "CONCENTRATION");

  if (!hasConcentrationWarning && projectedAllocationPercent >= 35) {
    guardrails.push({
      message: `High concentration practice note: ${normalizeSymbol(input.asset.symbol)} would be ${formatPercent(projectedAllocationPercent)} of projected virtual account value.`,
      tone: "warning",
    });
  }

  if (guardrails.length === 0) {
    guardrails.push({
      message: "Within local practice budget: no blocking guardrail for this preview.",
      tone: "neutral",
    });
  }

  return guardrails;
}

export function createDemoPositionSizingCoach(input: DemoPositionSizingCoachInput): DemoPositionSizingCoach {
  const symbol = normalizeSymbol(input.asset.symbol);
  const cashValue = cashTotal(input.walletAccounts);
  const positionsValue = holdingsTotal(input.holdings);
  const currentAccountValue = roundCurrency(cashValue + positionsValue);
  const currentHolding = getHolding(input.holdings, symbol);
  const currentSymbolValue = roundCurrency(currentHolding?.value ?? 0);
  const otherPositionsValue = roundCurrency(positionsValue - currentSymbolValue);
  const nonUsdCashValue = roundCurrency(cashValue - input.orderPreview.cashBefore);
  const nextSymbolValue = projectedSymbolValue(input, currentSymbolValue);
  const projectedAccountValue = roundCurrency(input.orderPreview.cashAfter + nonUsdCashValue + otherPositionsValue + nextSymbolValue);
  const positionSizePercent = currentAccountValue > 0 ? roundPercent((Math.abs(input.orderPreview.estimatedNotional) / currentAccountValue) * 100) : 0;
  const projectedAllocationPercent = projectedAccountValue > 0 ? roundPercent((nextSymbolValue / projectedAccountValue) * 100) : 0;
  const cashImpactTone = input.orderPreview.ledgerEffect < 0 ? "negative" : input.orderPreview.ledgerEffect > 0 ? "positive" : "neutral";
  const sideLabel = input.side === "buy" ? "cost" : "proceeds";
  const guardrails = createGuardrails(input, projectedAllocationPercent);

  return {
    checks: [
      {
        detail: `Virtual USD cash moves from ${formatCurrency(input.orderPreview.cashBefore)} to ${formatCurrency(input.orderPreview.cashAfter)}.`,
        label: "Cash impact",
        tone: cashImpactTone,
        value: formatSignedCurrency(input.orderPreview.ledgerEffect),
      },
      {
        detail: `Estimated ${sideLabel} equals ${formatPercent(positionSizePercent)} of current virtual account value ${formatCurrency(currentAccountValue)}.`,
        label: "Size vs account",
        tone: positionSizePercent >= 25 ? "warning" : "neutral",
        value: formatPercent(positionSizePercent),
      },
      {
        detail: `${symbol} position after ${formatUnits(input.orderPreview.positionAfter)} units; projected account value ${formatCurrency(projectedAccountValue)}.`,
        label: "Projected allocation",
        tone: projectedAllocationPercent >= 35 ? "warning" : "neutral",
        value: `${symbol} ${formatPercent(projectedAllocationPercent)}`,
      },
    ],
    currentAccountValue,
    disclosure: demoPositionSizingCoachDisclosure,
    guardrails,
    hasBlockingGuardrail: guardrails.some((guardrail) => guardrail.tone === "blocking"),
    positionSizePercent,
    projectedAccountValue,
    projectedAllocationPercent,
    projectedSymbolValue: nextSymbolValue,
    symbol,
  };
}
