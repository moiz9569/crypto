"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Menu,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketAnalysis } from "./use-market-analysis";
import { SYMBOLS, TIMEFRAMES } from "@/lib/market/types";
import { Brand } from "./brand";
import { LogoutButton } from "../auth/logout-button";

const coinNames = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  SOLUSDT: "Solana",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
};

const money = (value) =>
  value >= 1000
    ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
    : `$${value.toLocaleString("en-US", {
        minimumFractionDigits: value < 1 ? 4 : 2,
        maximumFractionDigits: value < 1 ? 4 : 2,
      })}`;

const compact = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

const since = (timestamp) => {
  if (!timestamp) return "No recent event";
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  return minutes < 60
    ? `${minutes}m ago`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
};

const biasClass = (bias) =>
  bias === "bullish" ? "bull" : bias === "bearish" ? "bear" : "range";

function StatusBadge({ bias }) {
  return (
    <span className={`status-badge ${biasClass(bias)}`}>
      {bias === "ranging" ? "RANGE" : bias.toUpperCase()}
    </span>
  );
}

function LoadingDashboard() {
  return (
    <div className="dashboard-loading">
      <RefreshCw className="animate-spin" />
      <strong>Initializing market structure</strong>
      <span>Loading live Binance Futures candles and market statistics.</span>
    </div>
  );
}

export function DashboardPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const query = useMarketAnalysis(symbol);
  const filtered = SYMBOLS.filter((item) =>
    item.includes(search.toUpperCase()),
  );
  const selected = query.data?.analyses[timeframe];

  const nearestAbove = selected?.liquidity.find(
    (level) => level.direction === "above",
  );
  const nearestBelow = selected?.liquidity.find(
    (level) => level.direction === "below",
  );
  const fvg =
    selected?.fairValueGaps.find((gap) => !gap.filled) ??
    selected?.fairValueGaps[0];
  const orderBlock =
    selected?.orderBlocks.find((block) => !block.mitigated) ??
    selected?.orderBlocks[0];

  const disagreement = useMemo(
    () =>
      query.data
        ? new Set(Object.values(query.data.analyses).map((item) => item.bias))
            .size > 1
        : false,
    [query.data],
  );

  const choose = (item) => {
    setSymbol(item);
    setMobileOpen(false);
  };

  return (
    <div className="dashboard-page">
      {mobileOpen && (
        <button
          className="drawer-scrim"
          aria-label="Close watchlist"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`watchlist ${mobileOpen ? "open" : ""}`}>
        <div className="watchlist-head">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close watchlist"
          >
            <X />
          </Button>
        </div>
        <label className="symbol-search">
          <Search />
          <input
            aria-label="Search symbol"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search symbol"
          />
        </label>
        <div className="watch-label">Watchlist · USDT-M</div>
        <div className="coin-list">
          {filtered.map((item) => {
            const ticker = query.data?.watchlist.find(
              (entry) => entry.symbol === item,
            );
            const bias = query.data?.analyses[timeframe].bias ?? "ranging";
            return (
              <button
                key={item}
                className={symbol === item ? "coin-row active" : "coin-row"}
                onClick={() => choose(item)}
              >
                <span className="coin-mark">{item[0]}</span>
                <span>
                  <strong>
                    {item.replace("USDT", "")}
                    <i>USDT</i>
                  </strong>
                  <small>
                    {ticker ? money(ticker.price) : coinNames[item]}
                  </small>
                </span>
                <StatusBadge bias={bias} />
              </button>
            );
          })}
        </div>
        <div className="data-source">
          <i
            className={
              query.isError ? "error" : query.isFetching ? "pending" : "live"
            }
          />
          {query.isError
            ? "Data temporarily unavailable"
            : query.isFetching
              ? "Refreshing market data"
              : "Binance Futures · Live"}
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-top">
          <div className="market-title">
            <Button
              variant="ghost"
              size="icon"
              className="menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open watchlist"
            >
              <Menu />
            </Button>
            <div>
              <strong>
                {symbol.replace("USDT", "")}
                <span>USDT</span>
              </strong>
              {query.data && (
                <>
                  <em>{money(query.data.price)}</em>
                  <i
                    className={
                      query.data.change24h >= 0 ? "positive" : "negative"
                    }
                  >
                    {query.data.change24h >= 0 ? "+" : ""}
                    {query.data.change24h.toFixed(2)}%
                  </i>
                </>
              )}
            </div>
          </div>
          {/* <div className="timeframe-tabs">
            {TIMEFRAMES.map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                className={timeframe === item ? "selected" : ""}
                onClick={() => setTimeframe(item)}
              >
                {item === "1h" ? "1H" : item === "4h" ? "4H" : item}
              </Button>
            ))}
          </div> */}
          <div className="dash-top-right">
            <div className="timeframe-tabs">
              {TIMEFRAMES.map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  size="sm"
                  className={timeframe === item ? "selected" : ""}
                  onClick={() => setTimeframe(item)}
                >
                  {item === "1h" ? "1H" : item === "4h" ? "4H" : item}
                </Button>
              ))}
            </div>
            <LogoutButton />
          </div>
        </header>

        {query.isPending && <LoadingDashboard />}

        {query.isError && (
          <div className="error-state">
            <strong>Live data is temporarily unavailable</strong>
            <p>
              The exchange connection could not be established. No stale values
              are being shown.
            </p>
            <Button onClick={() => query.refetch()}>
              <RefreshCw />
              Try again
            </Button>
          </div>
        )}

        {query.data && selected && (
          <div className="dashboard-content">
            <section className={`bias-banner ${biasClass(selected.bias)}`}>
              <div className="bias-icon">
                <ArrowUpRight />
              </div>
              <div>
                <small>
                  {selected.bias} bias · {selected.confirmation}{" "}
                  {selected.confirmation !== "No confirmation" && "confirmed"}
                </small>
                <h1>
                  {nearestAbove && selected.bias === "bullish"
                    ? `Market is targeting liquidity above ${money(nearestAbove.price)}`
                    : nearestBelow && selected.bias === "bearish"
                      ? `Market is targeting liquidity below ${money(nearestBelow.price)}`
                      : "Price remains inside active structural boundaries"}
                </h1>
              </div>
              <span>
                <small>Latest structure event</small>
                <b>{since(selected.lastEventAt)}</b>
              </span>
            </section>

            <section className="setup-panel">
              <div className="panel-heading">
                <span>Suggested setup · {timeframe}</span>
                {selected.setup ? (
                  <>
                    <StatusBadge
                      bias={
                        selected.setup.direction === "long"
                          ? "bullish"
                          : "bearish"
                      }
                    />
                    <b>R:R 1 : {selected.setup.riskReward.toFixed(1)}</b>
                  </>
                ) : (
                  <StatusBadge bias="ranging" />
                )}
              </div>
              {selected.setup ? (
                <>
                  <div className="setup-grid">
                    {[
                      { l: "Entry", v: selected.setup.entry },
                      { l: "Stop loss", v: selected.setup.stopLoss },
                      { l: "Take profit 1", v: selected.setup.tp1 },
                      { l: "Take profit 2", v: selected.setup.tp2 },
                    ].map((item, index) => (
                      <div key={item.l}>
                        <small>{item.l}</small>
                        <strong
                          className={
                            index === 1
                              ? "negative"
                              : index > 1
                                ? "positive"
                                : ""
                          }
                        >
                          {money(item.v)}
                        </strong>
                      </div>
                    ))}
                  </div>
                  <p>
                    {selected.setup.explanation} This is a rule-based structural
                    readout, not a signal to execute blindly.
                  </p>
                </>
              ) : (
                <div className="no-setup">
                  <strong>No clear setup</strong>
                  <span>
                    Current confluence does not meet the engine’s minimum
                    conditions.
                  </span>
                </div>
              )}
            </section>

            <div className="analysis-grid">
              <MetricCard
                title="Liquidity above"
                badge={nearestAbove?.swept ? "SWEPT" : "RESTING"}
                value={nearestAbove ? money(nearestAbove.price) : "—"}
                copy={nearestAbove?.type ?? "No nearby level"}
                footer={
                  nearestAbove
                    ? `${nearestAbove.distancePct.toFixed(2)}% from price`
                    : "Awaiting level"
                }
                tone="amber"
              />
              <MetricCard
                title="Liquidity below"
                badge={nearestBelow?.swept ? "SWEPT" : "RESTING"}
                value={nearestBelow ? money(nearestBelow.price) : "—"}
                copy={nearestBelow?.type ?? "No nearby level"}
                footer={
                  nearestBelow?.swept
                    ? "Swept and reclaimed"
                    : nearestBelow
                      ? `${nearestBelow.distancePct.toFixed(2)}% from price`
                      : "Awaiting level"
                }
                tone="red"
              />
              <MetricCard
                title="Fair value gap"
                badge={fvg?.filled ? "FILLED" : "UNFILLED"}
                value={fvg ? `${money(fvg.lower)} – ${money(fvg.upper)}` : "—"}
                copy={
                  fvg
                    ? `${fvg.direction} three-candle imbalance`
                    : "No active imbalance"
                }
                footer={
                  fvg
                    ? `${fvg.distancePct.toFixed(2)}% from price`
                    : "Awaiting gap"
                }
                tone="green"
              />
              <MetricCard
                title="Order block"
                badge={orderBlock?.mitigated ? "MITIGATED" : "ACTIVE"}
                value={
                  orderBlock
                    ? `${money(orderBlock.lower)} – ${money(orderBlock.upper)}`
                    : "—"
                }
                copy={
                  orderBlock
                    ? `${orderBlock.direction} origin candle`
                    : "No relevant block"
                }
                footer={
                  orderBlock?.relevant
                    ? "Relevant to current price"
                    : "Context level"
                }
                tone="blue"
              />
            </div>

            <div className="stats-grid">
              <Stat
                label="Funding rate"
                value={`${query.data.fundingRate >= 0 ? "+" : ""}${query.data.fundingRate.toFixed(4)}%`}
                note={
                  query.data.fundingRate > 0
                    ? "Longs paying shorts"
                    : "Shorts paying longs"
                }
              />
              <Stat
                label="Open interest"
                value={compact(query.data.openInterest)}
                note="USD notional"
              />
              <Stat
                label="Prev. day high"
                value={money(query.data.previousDayHigh)}
                note="Reference liquidity"
              />
              <Stat
                label="Prev. day low"
                value={money(query.data.previousDayLow)}
                note="Reference liquidity"
              />
            </div>

            <div className="lower-grid">
              <section className="timeline-panel">
                <div className="section-title">
                  Structure timeline · {timeframe}
                </div>
                {selected.timeline.length ? (
                  selected.timeline.map((event, index) => (
                    <div className="timeline-row" key={event.id}>
                      <i className={event.direction} />
                      <div>
                        <strong>
                          {event.direction} {event.type}
                        </strong>
                        <span> · {event.detail}</span>
                        <small>
                          {since(event.timestamp)} · {money(event.price)}
                        </small>
                      </div>
                      {index < selected.timeline.length - 1 && <b />}
                    </div>
                  ))
                ) : (
                  <div className="empty-row">
                    No confirmed events in the current lookback.
                  </div>
                )}
              </section>
              <section className="context-panel">
                <div className="section-title">
                  Multi-timeframe context{" "}
                  {disagreement && <span>DISAGREEMENT</span>}
                </div>
                <div className="context-grid">
                  {TIMEFRAMES.map((item) => {
                    const analysis = query.data.analyses[item];
                    return (
                      <button
                        key={item}
                        className={timeframe === item ? "selected" : ""}
                        onClick={() => setTimeframe(item)}
                      >
                        <small>{item.toUpperCase()}</small>
                        <strong className={biasClass(analysis.bias)}>
                          {analysis.bias}
                        </strong>
                        <span>{analysis.confirmation}</span>
                      </button>
                    );
                  })}
                </div>
                <p>
                  {disagreement
                    ? "Timeframes disagree. Treat lower-timeframe direction as contextual until higher-timeframe structure confirms."
                    : "Structure is aligned across all tracked timeframes."}
                </p>
              </section>
            </div>

            <footer className="dash-footer">
              <Link href="/">
                <ArrowLeft />
                Back to overview
              </Link>
              <span>
                Updated {since(query.data.updatedAt)} · Analysis is
                informational, not financial advice.
              </span>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ title, badge, value, copy, footer, tone }) {
  return (
    <article className="metric-card">
      <div>
        <span>{title}</span>
        <b className={tone}>{badge}</b>
      </div>
      <strong>{value}</strong>
      <p>{copy}</p>
      <div className={`metric-line ${tone}`}>
        <i />
      </div>
      <small>{footer}</small>
    </article>
  );
}

function Stat({ label, value, note }) {
  return (
    <article className="stat-card">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}
