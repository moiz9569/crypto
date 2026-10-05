"use client";
import { useState } from "react";

const COINS = {
  BTCUSDT: {
    symbol: "BTCUSDT",
    price: 68420.5,
    change: 1.24,
    bias: "bullish",
    confirmation: "BOS CONFIRMED",
    headline: "Market is targeting upside liquidity",
    setup: { entry: 68460, stopLoss: 67050, tp1: 68910, tp2: 69140 },
    liquidityAbove: 68910,
    liquidityBelow: 67180,
    fvg: "$68,210 – $68,510",
    contexts: {
      "5m": "BULLISH",
      "15m": "BULLISH",
      "1h": "RANGING",
      "4h": "BEARISH",
    },
    signals: [72, 48, 83, 60, 91, 67],
  },
  ETHUSDT: {
    symbol: "ETHUSDT",
    price: 3542.8,
    change: -0.42,
    bias: "ranging",
    confirmation: "NO CONFIRMATION",
    headline: "Price remains inside active structural boundaries",
    setup: null,
    liquidityAbove: 3598.0,
    liquidityBelow: 3480.0,
    fvg: "$3,510 – $3,560",
    contexts: {
      "5m": "RANGING",
      "15m": "BULLISH",
      "1h": "RANGING",
      "4h": "RANGING",
    },
    signals: [45, 62, 38, 71, 55, 48],
  },
  SOLUSDT: {
    symbol: "SOLUSDT",
    price: 172.35,
    change: -2.15,
    bias: "bearish",
    confirmation: "CHoCH CONFIRMED",
    headline: "Market is targeting liquidity below",
    setup: { entry: 173.1, stopLoss: 178.4, tp1: 168.2, tp2: 165.5 },
    liquidityAbove: 179.8,
    liquidityBelow: 166.1,
    fvg: "$171.20 – $173.60",
    contexts: {
      "5m": "BEARISH",
      "15m": "BEARISH",
      "1h": "BEARISH",
      "4h": "RANGING",
    },
    signals: [38, 55, 42, 68, 51, 30],
  },
  BNBUSDT: {
    symbol: "BNBUSDT",
    price: 598.4,
    change: 0.87,
    bias: "bullish",
    confirmation: "BOS CONFIRMED",
    headline: "Market is targeting upside liquidity",
    setup: { entry: 599.2, stopLoss: 585.0, tp1: 612.5, tp2: 620.0 },
    liquidityAbove: 610.0,
    liquidityBelow: 585.4,
    fvg: "$594.10 – $601.30",
    contexts: {
      "5m": "BULLISH",
      "15m": "BULLISH",
      "1h": "RANGING",
      "4h": "BULLISH",
    },
    signals: [66, 58, 74, 52, 81, 62],
  },
  XRPUSDT: {
    symbol: "XRPUSDT",
    price: 0.584,
    change: 0.31,
    bias: "ranging",
    confirmation: "NO CONFIRMATION",
    headline: "Price remains inside active structural boundaries",
    setup: null,
    liquidityAbove: 0.598,
    liquidityBelow: 0.568,
    fvg: "$0.5820 – $0.5860",
    contexts: {
      "5m": "RANGING",
      "15m": "RANGING",
      "1h": "BULLISH",
      "4h": "RANGING",
    },
    signals: [50, 44, 60, 38, 72, 55],
  },
};

const TIMEFRAMES = ["5m", "15m", "1h", "4h"];

function money(v) {
  let s;
  if (v >= 1) {
    s = v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    s = v.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }
  if (s.endsWith(".00")) s = s.slice(0, -3);
  return `$${s}`;
}

function biasClass(b) {
  return b === "bullish" ? "bull" : b === "bearish" ? "bear" : "range";
}

function shortBias(b) {
  return b === "bullish" ? "BULL" : b === "bearish" ? "BEAR" : "RANGE";
}

function tfLabel(tf) {
  return tf === "1h" ? "1H" : tf === "4h" ? "4H" : tf;
}

export function DashboardPreview() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const coin = COINS[symbol];

  return (
    <div className="preview-shell" aria-label="Interactive dashboard preview">
      <aside className="preview-side">
        <div className="preview-logo">
          <span>L</span> LIQUIDITY BIAS
        </div>
        {Object.values(COINS).map((c) => (
          <button
            key={c.symbol}
            type="button"
            className={`preview-coin ${c.symbol === symbol ? "active" : ""}`}
            onClick={() => setSymbol(c.symbol)}
          >
            <i>{c.symbol[0]}</i>
            <span>{c.symbol}</span>
            <b className={`bias-${biasClass(c.bias)}`}>{shortBias(c.bias)}</b>
          </button>
        ))}
      </aside>

      <div className="preview-main">
        <div className="preview-top">
          <strong>
            {symbol.replace("USDT", "")}
            <span>USDT</span>
          </strong>
          <em className={coin.change >= 0 ? "positive" : "negative"}>
            {money(coin.price)}
          </em>
          <div>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                className={timeframe === tf ? "selected" : ""}
                onClick={() => setTimeframe(tf)}
              >
                {tfLabel(tf)}
              </button>
            ))}
          </div>
        </div>

        <div className="preview-content">
          <div className={`preview-bias ${biasClass(coin.bias)}`}>
            <small>
              {coin.bias.toUpperCase()} BIAS · {coin.confirmation}
            </small>
            <strong>{coin.headline}</strong>
          </div>

          {coin.setup ? (
            <div className="preview-setup">
              <small>SUGGESTED SETUP · {tfLabel(timeframe)}</small>
              <div>
                {[
                  ["ENTRY", coin.setup.entry],
                  ["STOP LOSS", coin.setup.stopLoss],
                  ["TAKE PROFIT 1", coin.setup.tp1],
                  ["TAKE PROFIT 2", coin.setup.tp2],
                ].map(([label, value]) => (
                  <span key={label}>
                    <i>{label}</i>
                    <b>{money(value)}</b>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="preview-setup preview-setup-empty">
              <small>SUGGESTED SETUP · {tfLabel(timeframe)}</small>
              <strong>No clear setup</strong>
              <p>Confluence is insufficient. The engine waits.</p>
            </div>
          )}

          <div className="preview-grid">
            {[
              ["LIQUIDITY ABOVE", money(coin.liquidityAbove)],
              ["LIQUIDITY BELOW", money(coin.liquidityBelow)],
              ["FAIR VALUE GAP", coin.fvg],
            ].map(([label, value], i) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
                <i>
                  <span style={{ width: `${coin.signals[i]}%` }} />
                </i>
              </div>
            ))}
          </div>

          <div className="preview-lower">
            <div>
              {coin.signals.map((w, i) => (
                <span key={i}>
                  <i style={{ width: `${w}%` }} />
                </span>
              ))}
            </div>
            <div>
              {TIMEFRAMES.map((tf) => {
                const label = coin.contexts[tf];
                return (
                  <span
                    key={tf}
                    className={`bias-${biasClass(label.toLowerCase())}`}
                  >
                    {tfLabel(tf)} {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
