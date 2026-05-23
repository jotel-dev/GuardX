import React from 'react';

function Gas({ isActive, activeChain, gasData, gasTimer, onChainChange }) {
  return (
    <section className={`tab-view ${isActive ? 'active' : ''}`}>
      <div className="card glass">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-gas-pump" /> Gas Optimizer Engine
          </h3>
          <div className="header-controls">
            <span className="refresh-badge" id="gas-tab-refresh-label">
              Updates in {gasTimer}s
            </span>
          </div>
        </div>
        <div className="card-body">
          <p className="subtitle">
            Analyzes mempool traffic density to compute optimal transaction pricing tiers.
          </p>

          <div className="gas-selector-bar">
            <span>Select Target Network:</span>
            <div className="radio-group">
              {['ethereum', 'solana', 'bsc', 'polygon'].map((chain) => (
                <React.Fragment key={chain}>
                  <input
                    type="radio"
                    id={`gas-radio-${chain}`}
                    name="gas-chain-radio"
                    value={chain}
                    checked={activeChain === chain}
                    onChange={(event) => onChainChange(event.target.value)}
                  />
                  <label htmlFor={`gas-radio-${chain}`}>{chain === 'bsc' ? 'BNB Chain' : chain.charAt(0).toUpperCase() + chain.slice(1)}</label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="gas-cards-container" id="gas-details-grid">
            {gasData ? (
              ['slow', 'standard', 'fast'].map((tier) => (
                <div
                  key={tier}
                  className={`gas-card accent-${tier === 'standard' ? 'amber' : tier === 'fast' ? 'red' : 'green'}`}
                >
                  <h4>{tier.charAt(0).toUpperCase() + tier.slice(1)}</h4>
                  <div className="gas-price">{gasData[tier].gwei}</div>
                  <div className="gas-time">{gasData[tier].time}</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '10px' }}>
                    {tier === 'slow'
                      ? 'Best for non-urgent tasks. Lowest priority fee.'
                      : tier === 'standard'
                      ? 'Best for standard DeFi swaps. Recommended default.'
                      : 'Best for urgent execution. Outbids congestion pools.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="gas-loader">Loading gas records...</div>
            )}
          </div>

          <div className="gas-calc-info">
            <h4>
              <i className="fa-solid fa-brain" /> Optimizer Calculation Logic
            </h4>
            <div className="calc-steps-grid">
              <div className="calc-step-item">
                <h5>1. Block Base Fee</h5>
                <p>Polls network RPC nodes directly for the minimum required fee parameter in the upcoming block header.</p>
              </div>
              <div className="calc-step-item">
                <h5>2. Priority Fee Profile</h5>
                <p>Analyzes the distribution of tip margins paid across the last 10 mined blocks to establish current demand.</p>
              </div>
              <div className="calc-step-item">
                <h5>3. Urgency Calibration</h5>
                <p>Applies standard multiplier metrics to generate 3 clearance speeds (Slow / Standard / Fast).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gas;
