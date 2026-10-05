const key = (...parts) => parts.join("-");
const pctDistance = (price, level) => Math.abs(((level - price) / price) * 100);

export function detectSwings(candles, radius = 3) {
  const points = [];
  for (let i = radius; i < candles.length - radius; i += 1) {
    const candle = candles[i];
    if (!candle) continue;
    const neighbors = candles.slice(i - radius, i + radius + 1);
    if (neighbors.every((item) => candle.high >= item.high)) {
      points.push({
        index: i,
        timestamp: candle.closeTime,
        price: candle.high,
        kind: "high",
      });
    }
    if (neighbors.every((item) => candle.low <= item.low)) {
      points.push({
        index: i,
        timestamp: candle.closeTime,
        price: candle.low,
        kind: "low",
      });
    }
  }
  return points;
}

function structureFromSwings(candles, swings, timeframe) {
  const events = [];
  let bias = "ranging";
  let lastBrokenHigh = null;
  let lastBrokenLow = null;
  for (let index = 1; index < candles.length; index += 1) {
    const candle = candles[index];
    if (!candle) continue;
    const prior = swings.filter((point) => point.index < index);
    const high = [...prior].reverse().find((point) => point.kind === "high");
    const low = [...prior].reverse().find((point) => point.kind === "low");
    if (high && candle.close > high.price && lastBrokenHigh !== high.price) {
      const type = bias === "bearish" ? "CHoCH" : "BOS";
      bias = "bullish";
      lastBrokenHigh = high.price;
      events.push({
        id: key(timeframe, type, candle.closeTime),
        timestamp: candle.closeTime,
        timeframe,
        type,
        direction: "bullish",
        price: high.price,
        detail: `closed above ${high.price}`,
      });
    }
    if (low && candle.close < low.price && lastBrokenLow !== low.price) {
      const type = bias === "bullish" ? "CHoCH" : "BOS";
      bias = "bearish";
      lastBrokenLow = low.price;
      events.push({
        id: key(timeframe, type, candle.closeTime),
        timestamp: candle.closeTime,
        timeframe,
        type,
        direction: "bearish",
        price: low.price,
        detail: `closed below ${low.price}`,
      });
    }
  }
  if (bias === "ranging" && swings.length >= 4) {
    const highs = swings.filter((point) => point.kind === "high").slice(-2);
    const lows = swings.filter((point) => point.kind === "low").slice(-2);
    const firstHigh = highs[0];
    const secondHigh = highs[1];
    const firstLow = lows[0];
    const secondLow = lows[1];
    if (firstHigh && secondHigh && firstLow && secondLow) {
      if (
        secondHigh.price > firstHigh.price &&
        secondLow.price > firstLow.price
      )
        bias = "bullish";
      if (
        secondHigh.price < firstHigh.price &&
        secondLow.price < firstLow.price
      )
        bias = "bearish";
    }
  }
  return { bias, events };
}

function detectLiquidity(
  candles,
  swings,
  currentPrice,
  previousDayHigh,
  previousDayLow,
  timeframe,
) {
  const levels = [];
  const tolerance = 0.0015;
  const recent = swings.slice(-12);
  recent.forEach((point, index) => {
    const matching = recent
      .slice(0, index)
      .find(
        (candidate) =>
          candidate.kind === point.kind &&
          Math.abs(candidate.price - point.price) / point.price <= tolerance,
      );
    const type = matching
      ? point.kind === "high"
        ? "Equal High"
        : "Equal Low"
      : point.kind === "high"
        ? "Swing High"
        : "Swing Low";
    const later = candles.slice(point.index + 1);
    const sweep = later.find((candle) =>
      point.kind === "high"
        ? candle.high > point.price && candle.close < point.price
        : candle.low < point.price && candle.close > point.price,
    );
    levels.push({
      id: key(timeframe, type, point.timestamp),
      price: point.price,
      type,
      direction: point.price >= currentPrice ? "above" : "below",
      createdAt: point.timestamp,
      swept: Boolean(sweep),
      sweepTimestamp: sweep?.closeTime ?? null,
      distancePct: pctDistance(currentPrice, point.price),
    });
  });
  const daily = [
    { price: previousDayHigh, type: "Previous Day High" },
    { price: previousDayLow, type: "Previous Day Low" },
  ];
  daily.forEach(({ price, type }) => {
    const sweep = candles.find((candle) =>
      type.endsWith("High")
        ? candle.high > price && candle.close < price
        : candle.low < price && candle.close > price,
    );
    levels.push({
      id: key(timeframe, type),
      price,
      type,
      direction: price >= currentPrice ? "above" : "below",
      createdAt: candles[0]?.openTime ?? Date.now(),
      swept: Boolean(sweep),
      sweepTimestamp: sweep?.closeTime ?? null,
      distancePct: pctDistance(currentPrice, price),
    });
  });
  return levels.sort((a, b) => a.distancePct - b.distancePct);
}

export function detectFvgs(candles, currentPrice, timeframe) {
  const gaps = [];
  for (let i = 2; i < candles.length; i += 1) {
    const first = candles[i - 2];
    const third = candles[i];
    if (!first || !third) continue;
    if (first.high < third.low) {
      const later = candles.slice(i + 1);
      gaps.push({
        id: key(timeframe, "fvg", third.closeTime),
        direction: "bullish",
        lower: first.high,
        upper: third.low,
        createdAt: third.closeTime,
        filled: later.some((item) => item.low <= first.high),
        distancePct: pctDistance(currentPrice, (first.high + third.low) / 2),
      });
    } else if (first.low > third.high) {
      const later = candles.slice(i + 1);
      gaps.push({
        id: key(timeframe, "fvg", third.closeTime),
        direction: "bearish",
        lower: third.high,
        upper: first.low,
        createdAt: third.closeTime,
        filled: later.some((item) => item.high >= first.low),
        distancePct: pctDistance(currentPrice, (third.high + first.low) / 2),
      });
    }
  }
  return gaps.sort((a, b) => a.distancePct - b.distancePct).slice(0, 8);
}

function detectOrderBlocks(candles, events, currentPrice, timeframe) {
  return events.slice(-8).flatMap((event) => {
    const breakIndex = candles.findIndex(
      (item) => item.closeTime === event.timestamp,
    );
    if (breakIndex < 1) return [];
    const before = candles
      .slice(Math.max(0, breakIndex - 8), breakIndex)
      .reverse()
      .find((item) =>
        event.direction === "bullish"
          ? item.close < item.open
          : item.close > item.open,
      );
    if (!before) return [];
    const lower = before.low;
    const upper = before.high;
    const later = candles.slice(breakIndex + 1);
    const mitigated = later.some(
      (item) => item.low <= upper && item.high >= lower,
    );
    return [
      {
        id: key(timeframe, "ob", before.closeTime),
        direction: event.direction,
        lower,
        upper,
        createdAt: event.timestamp,
        mitigated,
        relevant: currentPrice >= lower * 0.98 && currentPrice <= upper * 1.02,
      },
    ];
  });
}

function createSetup(bias, liquidity, gaps, blocks, price) {
  if (bias === "ranging") return null;
  const direction = bias === "bullish" ? "long" : "short";
  const zone =
    gaps.find((gap) => !gap.filled && gap.direction === bias) ??
    blocks.find((block) => !block.mitigated && block.direction === bias);
  const targets = liquidity
    .filter(
      (level) =>
        !level.swept &&
        (bias === "bullish" ? level.price > price : level.price < price),
    )
    .sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price));
  const invalidation = liquidity
    .filter((level) =>
      bias === "bullish" ? level.price < price : level.price > price,
    )
    .sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price))[0];
  if (!zone || !invalidation || targets.length < 1) return null;
  const entry = "lower" in zone ? (zone.lower + zone.upper) / 2 : price;
  const stopLoss = invalidation.price * (bias === "bullish" ? 0.999 : 1.001);
  const tp1 = targets[0]?.price;
  const tp2 = targets[1]?.price ?? tp1;
  if (!tp1 || !tp2 || Math.abs(entry - stopLoss) === 0) return null;
  const riskReward = Math.abs((tp1 - entry) / (entry - stopLoss));
  if (riskReward < 1) return null;
  return {
    direction,
    entry,
    stopLoss,
    tp1,
    tp2,
    riskReward,
    explanation: `${bias === "bullish" ? "Sell-side" : "Buy-side"} liquidity and ${bias} structure align with an active ${
      "filled" in zone ? "fair value gap" : "order block"
    }.`,
  };
}

export function analyzeTimeframe(input) {
  const closed = input.candles.filter((candle) => candle.closed);
  const currentPrice = closed.at(-1)?.close ?? input.candles.at(-1)?.close ?? 0;
  const swings = detectSwings(closed);
  const structure = structureFromSwings(closed, swings, input.timeframe);
  const liquidity = detectLiquidity(
    closed,
    swings,
    currentPrice,
    input.previousDayHigh,
    input.previousDayLow,
    input.timeframe,
  );
  const fairValueGaps = detectFvgs(closed, currentPrice, input.timeframe);
  const orderBlocks = detectOrderBlocks(
    closed,
    structure.events,
    currentPrice,
    input.timeframe,
  );
  const sweeps = liquidity
    .filter((level) => level.swept && level.sweepTimestamp)
    .map((level) => ({
      id: key(input.timeframe, "sweep", level.id),
      timestamp: level.sweepTimestamp ?? level.createdAt,
      timeframe: input.timeframe,
      type: "Liquidity Sweep",
      direction: level.direction === "above" ? "bearish" : "bullish",
      price: level.price,
      detail: `${level.type} swept and reclaimed`,
    }));
  const timeline = [...structure.events, ...sweeps]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);
  const lastStructure = structure.events.at(-1);
  return {
    timeframe: input.timeframe,
    bias: structure.bias,
    confirmation:
      lastStructure?.type === "BOS" || lastStructure?.type === "CHoCH"
        ? lastStructure.type
        : "No confirmation",
    lastEventAt: timeline[0]?.timestamp ?? null,
    liquidity,
    fairValueGaps,
    orderBlocks,
    timeline,
    setup: createSetup(
      structure.bias,
      liquidity,
      fairValueGaps,
      orderBlocks,
      currentPrice,
    ),
  };
}
