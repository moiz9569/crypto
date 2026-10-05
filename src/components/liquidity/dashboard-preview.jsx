const rows = [72, 48, 83, 60, 91, 67];

export function DashboardPreview() {
  return (
    <div
      className="preview-shell"
      aria-label="Liquidity Bias dashboard preview"
    >
      <aside className="preview-side">
        <div className="preview-logo">
          <span>L</span> LIQUIDITY BIAS
        </div>
        {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].map((coin, index) => (
          <div
            key={coin}
            className={index === 0 ? "preview-coin active" : "preview-coin"}
          >
            <i>{coin[0]}</i>
            <span>{coin}</span>
            <b>{index === 2 ? "BEAR" : index === 1 ? "RANGE" : "BULL"}</b>
          </div>
        ))}
      </aside>
      <div className="preview-main">
        <div className="preview-top">
          <strong>
            BTC<span>USDT</span>
          </strong>
          <em>$68,420.50</em>
          <div>
            5m&nbsp;&nbsp; <b>15m</b>&nbsp;&nbsp; 1H&nbsp;&nbsp; 4H
          </div>
        </div>
        <div className="preview-content">
          <div className="preview-bias">
            <small>BULLISH BIAS · BOS CONFIRMED</small>
            <strong>Market is targeting upside liquidity</strong>
          </div>
          <div className="preview-setup">
            <small>SUGGESTED SETUP · 15m</small>
            <div>
              {["ENTRY", "STOP LOSS", "TAKE PROFIT 1", "TAKE PROFIT 2"].map(
                (label, index) => (
                  <span key={label}>
                    <i>{label}</i>
                    <b>{["$68,460", "$67,050", "$68,910", "$69,140"][index]}</b>
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="preview-grid">
            {rows.slice(0, 3).map((width, index) => (
              <div key={width}>
                <small>
                  {
                    ["LIQUIDITY ABOVE", "LIQUIDITY BELOW", "FAIR VALUE GAP"][
                      index
                    ]
                  }
                </small>
                <strong>
                  {["$68,910", "$67,180", "$68,210 – $68,510"][index]}
                </strong>
                <i>
                  <span style={{ width: `${width}%` }} />
                </i>
              </div>
            ))}
          </div>
          <div className="preview-lower">
            <div>
              {rows.map((width, index) => (
                <span key={index}>
                  <i style={{ width: `${width}%` }} />
                </span>
              ))}
            </div>
            <div>
              {[
                "5m  BULLISH",
                "15m  BULLISH",
                "1H  RANGING",
                "4H  BEARISH",
              ].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
