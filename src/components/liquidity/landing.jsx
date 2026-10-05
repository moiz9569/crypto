"use client";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDot,
  Radar,
  Route as RouteIcon,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./brand";
import { DashboardPreview } from "./dashboard-preview";

const features = [
  {
    eyebrow: "Structure",
    title: "Bias without the noise",
    copy: "Liquidity Bias turns raw futures data into a clear bullish, bearish, or ranging read across every supported timeframe.",
    icon: RouteIcon,
    list: [
      "Close-confirmed BOS and CHoCH",
      "Independent 5m, 15m, 1H and 4H structure",
      "Clear disagreement between timeframes",
    ],
  },
  {
    eyebrow: "Liquidity",
    title: "Know where price is drawn",
    copy: "Track unswept swing levels, equal highs and lows, previous-day levels, and reclaimed liquidity without reading another chart.",
    icon: Radar,
    list: [
      "Liquidity above and below price",
      "Sweep and reclaim detection",
      "Distance and status for every level",
    ],
  },
  {
    eyebrow: "Setups",
    title: "Confluence, explained",
    copy: "When structure, liquidity, imbalances, and order blocks align, the engine presents a concise plan with its invalidation and targets.",
    icon: ShieldCheck,
    list: [
      "Entry, stop loss, TP1 and TP2",
      "Calculated risk-to-reward",
      "No setup when evidence is insufficient",
    ],
  },
];

const evidence = [
  {
    label: "Structure event",
    value: "BOS confirmed",
    detail: "15m close above prior swing",
    tone: "positive",
  },
  {
    label: "Liquidity below",
    value: "$67,180",
    detail: "Equal lows · unswept",
    tone: "warning",
  },
  {
    label: "Higher-timeframe context",
    value: "4H bearish",
    detail: "Lower timeframe disagrees",
    tone: "negative",
  },
];

export function LandingPage() {
  return (
    <div className="site-page">
      <header className="site-nav">
        <Brand />
        <nav>
          <a href="#method">Method</a>
          <a href="#insights">Insights</a>
          <a href="#principles">Principles</a>
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button> */}
          <Button asChild size="sm">
            <Link href="/dashboard">
              Open dashboard <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <p className="eyebrow">
            Market structure intelligence for crypto futures
          </p>
          <h1>
            See the market structure
            <br />
            before you make a decision.
          </h1>
          <p className="hero-copy">
            A focused read on structure, liquidity, imbalances, and
            multi-timeframe context—built from live Binance Futures data.
          </p>
          <div className="hero-actions">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Explore the dashboard <ArrowRight />
              </Link>
            </Button>
            <a href="#method">Review the methodology</a>
          </div>
          <div className="hero-preview">
            <DashboardPreview />
          </div>
        </section>

        <section className="trust-band">
          <p>One normalized read across the markets traders watch</p>
          <div>
            {["BINANCE FUTURES", "BTC", "ETH", "SOL", "BNB", "XRP"].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <dl>
            <div>
              <dt>5</dt>
              <dd>Liquid futures markets</dd>
            </div>
            <div>
              <dt>4</dt>
              <dd>Independent timeframes</dd>
            </div>
            <div>
              <dt>15s</dt>
              <dd>Automated refresh cycle</dd>
            </div>
          </dl>
        </section>

        <section className="evidence-band" aria-label="Analysis examples">
          <div className="evidence-intro">
            <p className="eyebrow">A decision layer, not another chart</p>
            <h2>Every readout shows what happened—and why it matters.</h2>
          </div>
          <div className="evidence-list">
            {evidence.map((item) => (
              <article key={item.label}>
                <CircleDot className={item.tone} />
                <div>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="solutions" id="method">
          <p className="eyebrow">The analysis layer</p>
          <h2>Complex inputs. One clear view.</h2>
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={index % 2 ? "feature-row reverse" : "feature-row"}
            >
              <div className={`feature-visual readout-${index}`}>
                <div className="readout-head">
                  <feature.icon />
                  <span>{feature.eyebrow} readout</span>
                  <b>LIVE</b>
                </div>
                {index === 0 && (
                  <div className="structure-readout">
                    <small>LATEST CONFIRMATION · 15M</small>
                    <strong>Bullish BOS</strong>
                    <p>Closed above $68,465.8</p>
                    <div>
                      <i className="done" />
                      <i className="done" />
                      <i />
                      <i />
                    </div>
                    <footer>
                      <span>
                        5m <b>BULLISH</b>
                      </span>
                      <span>
                        15m <b>BULLISH</b>
                      </span>
                      <span>
                        1H <b>RANGING</b>
                      </span>
                      <span>
                        4H <b>BEARISH</b>
                      </span>
                    </footer>
                  </div>
                )}
                {index === 1 && (
                  <div className="liquidity-readout">
                    <div>
                      <small>LIQUIDITY ABOVE</small>
                      <strong>$68,910</strong>
                      <span>Equal high · unswept</span>
                    </div>
                    <div>
                      <small>LIQUIDITY BELOW</small>
                      <strong>$67,180</strong>
                      <span>Previous day low</span>
                    </div>
                    <p>Price is 0.72% from the nearest active pool.</p>
                  </div>
                )}
                {index === 2 && (
                  <div className="setup-readout">
                    <small>CONFLUENCE CHECK · 15M</small>
                    <strong>No clear setup</strong>
                    <p>
                      Structure and liquidity are not yet aligned. The engine
                      waits instead of manufacturing conviction.
                    </p>
                    <div>
                      <span>
                        Structure <b>CONFIRMED</b>
                      </span>
                      <span>
                        Liquidity <b>PENDING</b>
                      </span>
                      <span>
                        Imbalance <b>ABSENT</b>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="feature-copy">
                <span>{feature.eyebrow}</span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
                <ul>
                  {feature.list.map((item) => (
                    <li key={item}>
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="insights" id="insights">
          <p className="eyebrow">Inside the readout</p>
          <h2>Every conclusion keeps its context.</h2>
          <div className="insight-grid">
            {[
              {
                tag: "STRUCTURE",
                title: "Why a wick is not a break",
                copy: "The engine confirms structural breaks with candle closes, reducing false signals around obvious swing levels.",
              },
              {
                tag: "LIQUIDITY",
                title: "A sweep is only the beginning",
                copy: "Liquidity events are retained in the timeline and evaluated alongside the structure that follows.",
              },
              {
                tag: "RISK",
                title: "A setup can be absent",
                copy: "When confluence is weak, Liquidity Bias says “No clear setup” instead of manufacturing conviction.",
              },
              {
                tag: "CONTEXT",
                title: "Timeframes stay independent",
                copy: "Lower-timeframe momentum can be seen for what it is—even inside opposing higher-timeframe structure.",
              },
            ].map((item) => (
              <article key={item.title}>
                <small>{item.tag}</small>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta" id="principles">
          <p className="eyebrow">Decision-first by design</p>
          <h2>Read structure, not noise.</h2>
          <p>Live market context in a concise institutional interface.</p>
          <Button asChild size="lg">
            <Link href="/dashboard">
              Open Liquidity Bias <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="site-footer">
        <Brand />
        <p>
          Rule-based market analysis. Not financial advice or a guarantee of
          future outcomes.
        </p>
        <span>© 2026 Liquidity Bias</span>
      </footer>
    </div>
  );
}
