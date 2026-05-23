import React, { useState } from 'react';

function Scanner({ isActive, activeChain, onChainChange, scanState, onRunDiagnosis }) {
  const [scanValue, setScanValue] = useState('');

  return (
    <section className={`tab-view ${isActive ? 'active' : ''}`}>
      <div className="card glass">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-magnifying-glass-chart" /> Scam & Stuck Transaction Diagnosis
          </h3>
        </div>
        <div className="card-body">
          <p className="subtitle">
            Assigns risk scores, identifies stuck stages in plain English, and outlines recommended actions.
          </p>
          <div className="form-container">
            <div className="form-group flex-row">
              <div className="flex-input">
                <label htmlFor="scan-hash-input">Transaction Hash</label>
                <input
                  id="scan-hash-input"
                  type="text"
                  value={scanValue}
                  onChange={(event) => setScanValue(event.target.value)}
                  placeholder="e.g. 0xstuck, 0xsafe, 0xscam or random hash..."
                />
              </div>
              <div className="flex-select">
                <label htmlFor="scan-chain-select">Blockchain</label>
                <select
                  id="scan-chain-select"
                  className="theme-select"
                  value={activeChain}
                  onChange={(event) => onChainChange(event.target.value)}
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="solana">Solana</option>
                  <option value="bsc">BNB Chain</option>
                  <option value="polygon">Polygon</option>
                </select>
              </div>
              <button
                id="scan-submit-btn"
                className="glow-button"
                onClick={() => {
                  onRunDiagnosis(scanValue, activeChain);
                  setScanValue('');
                }}
              >
                <i className="fa-solid fa-shield-halved" /> Run Diagnosis
              </button>
            </div>

            <div className="demo-chips">
              <span>Try Demo:</span>
              <button className="chip-btn" onClick={() => onRunDiagnosis('0xscam', activeChain)}>
                🔴 Phishing Tx
              </button>
              <button className="chip-btn" onClick={() => onRunDiagnosis('0xstuck', activeChain)}>
                🟡 Stuck Gas Tx
              </button>
              <button className="chip-btn" onClick={() => onRunDiagnosis('0xsafe', activeChain)}>
                🟢 Safe Tx
              </button>
            </div>
          </div>

          {scanState.loading && (
            <div id="scan-loader" className="view-loader">
              <i className="fa-solid fa-shield-halved fa-spin loading-logo" />
              <h4>GuardX Shield Diagnostics Running...</h4>
              <p>Analyzing node RPC state, security signatures, and priority fees.</p>
            </div>
          )}

          {scanState.result && (
            <div id="scan-result" className="result-details">
              <div className="result-summary-grid">
                <div className={`result-card verdict-block ${scanState.result.verdict.toLowerCase()}`}>
                  <span className="badge" id="scan-verdict-badge">{scanState.result.verdict}</span>
                  <h2 id="scan-verdict-title">Transaction {scanState.result.verdict}</h2>
                  <p id="scan-verdict-desc">
                    {scanState.result.verdict === 'SAFE'
                      ? 'GuardX Shield has marked this transaction profile as secure.'
                      : scanState.result.verdict === 'SCAM'
                      ? 'WARNING: Phishing signatures detected. Avoid approving interactions.'
                      : 'Caution: Anomalies detected, such as low fees or unverified creators.'}
                  </p>
                </div>
                <div className="result-card score-block">
                  <h4>Risk Assessment Score</h4>
                  <div className="score-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path
                        className="circle"
                        strokeDasharray={`${scanState.result.risk_score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        style={{ stroke: scanState.result.risk_score > 75 ? 'var(--red)' : scanState.result.risk_score > 25 ? 'var(--amber)' : 'var(--green)' }}
                      />
                      <text x="18" y="20.35" className="percentage" id="risk-score-text">
                        {scanState.result.risk_score}
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="result-card meta-block">
                  <div className="meta-row">
                    <span className="lbl">Confirmation:</span>
                    <span className="val" id="scan-meta-est">{scanState.result.estimated_time}</span>
                  </div>
                  <div className="meta-row">
                    <span className="lbl">Current Stage:</span>
                    <span className="val" id="scan-meta-stage">
                      Stage {scanState.result.stage} ({['Submitted', 'Mempool', 'Gas Estimation', 'Contract Execution', 'Bridge Relay'][scanState.result.stage - 1]})
                    </span>
                  </div>
                </div>
              </div>

              <div className="timeline-container">
                <h4>Transaction Flow Diagnostics</h4>
                <div className="flow-timeline">
                  {[1, 2, 3, 4, 5].map((step) => {
                    const isCompleted = step <= scanState.result.stage;
                    return (
                      <React.Fragment key={step}>
                        <div className={`timeline-step ${isCompleted ? 'completed' : ''}`}>
                          <div className="step-dot">{step}</div>
                          <div className="step-label">{['Submitted', 'Mempool', 'Gas Est.', 'Execution', 'Relay'][step - 1]}</div>
                        </div>
                        {step < 5 && <div className="timeline-connector" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="analysis-details-grid">
                <div className="analysis-card bg-glass">
                  <h4>💬 AI Security Narrative</h4>
                  <p className="narrative-text" id="scan-narrative">
                    {scanState.result.ai_summary}
                  </p>
                </div>
                <div className="analysis-card bg-glass">
                  <h4>⚠️ Security Flag Report</h4>
                  <ul className="flags-list" id="scan-flags-list">
                    {scanState.result.flags.length > 0 ? (
                      scanState.result.flags.map((flag, index) => <li key={index}>{flag}</li>)
                    ) : (
                      <li>✅ No security flags triggered.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Scanner;
