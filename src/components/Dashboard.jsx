import React, { useState } from 'react';

function Dashboard({ isActive, dashGasData, alertCount, onQuickScan, onDemoSelect }) {
  const [quickInput, setQuickInput] = useState('');

  return (
    <section className={`tab-view ${isActive ? 'active' : ''}`}>
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa-solid fa-gauge-high" />
          </div>
          <div className="stat-info">
            <h3>99.9%</h3>
            <p>Threat Detection Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <i className="fa-solid fa-bug" />
          </div>
          <div className="stat-info">
            <h3>2,481</h3>
            <p>Malicious Contracts Blocked</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">
            <i className="fa-solid fa-tower-broadcast" />
          </div>
          <div className="stat-info">
            <h3>{alertCount}</h3>
            <p>Active Watch Subscriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa-solid fa-bolt" />
          </div>
          <div className="stat-info">
            <h3>60 req/m</h3>
            <p>Public API Rate Limit</p>
          </div>
        </div>
      </div>

      <div className="dashboard-split">
        <div className="split-left">
          <div className="card glass">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-shield-halved" /> GuardX Quick Analysis
              </h3>
            </div>
            <div className="card-body">
              <p className="subtitle">
                Quickly diagnose any transaction or smart contract address across EVM chains or Solana.
              </p>
              <div className="search-box">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(event) => setQuickInput(event.target.value)}
                  placeholder="Enter Transaction Hash or Address (e.g. 0xscam, 0xtrusted)..."
                />
                <button
                  id="quick-scan-btn"
                  onClick={() => {
                    onQuickScan(quickInput);
                    setQuickInput('');
                  }}
                >
                  <i className="fa-solid fa-bolt" /> Scan
                </button>
              </div>
              <div className="demo-chips">
                <span>Quick Demo:</span>
                <button className="chip-btn" onClick={() => onDemoSelect('0xscam')}>
                  🔴 0xscam (Phishing)
                </button>
                <button className="chip-btn" onClick={() => onDemoSelect('0xstuck')}>
                  🟡 0xstuck (Low Gas)
                </button>
                <button className="chip-btn" onClick={() => onDemoSelect('0xtrusted')}>
                  🟢 0xtrusted (Uniswap)
                </button>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-gas-pump" /> Network Gas Tracker
              </h3>
              <span className="refresh-badge">Updates in 30s</span>
            </div>
            <div className="card-body">
              <div className="gas-flex-grid" id="dash-gas-grid">
                {dashGasData ? (
                  ['slow', 'standard', 'fast'].map((tier) => (
                    <div key={tier} className={`gas-card accent-${tier === 'standard' ? 'amber' : tier === 'fast' ? 'red' : 'green'}`}>
                      <h4>{tier.charAt(0).toUpperCase() + tier.slice(1)}</h4>
                      <div className="gas-price">{dashGasData[tier].gwei}</div>
                      <div className="gas-time">{dashGasData[tier].time}</div>
                    </div>
                  ))
                ) : (
                  <div className="gas-loader">
                    <i className="fa-solid fa-circle-notch fa-spin" /> Loading Gas Rates...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="split-right">
          <div className="card glass security-feed">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-rss" /> Live Security Alerts
              </h3>
            </div>
            <div className="card-body list-scroll">
              <div className="feed-item danger">
                <div className="feed-icon">
                  <i className="fa-solid fa-triangle-exclamation" />
                </div>
                <div className="feed-content">
                  <h4>New Phishing Drainer Active</h4>
                  <p>Fake token swap contracts detected mimicking Uniswap v4 on Ethereum. Score: 98/100.</p>
                  <span>10 minutes ago</span>
                </div>
              </div>
              <div className="feed-item warning">
                <div className="feed-icon">
                  <i className="fa-solid fa-circle-info" />
                </div>
                <div className="feed-content">
                  <h4>Solana Congestion Alert</h4>
                  <p>RPC latency elevated by 24%. Recommend standard priority fee adjustments.</p>
                  <span>1 hour ago</span>
                </div>
              </div>
              <div className="feed-item success">
                <div className="feed-icon">
                  <i className="fa-solid fa-circle-check" />
                </div>
                <div className="feed-content">
                  <h4>Gas Optimizer Rebalanced</h4>
                  <p>Priority rates successfully adjusted to match lower block congestion averages.</p>
                  <span>3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
