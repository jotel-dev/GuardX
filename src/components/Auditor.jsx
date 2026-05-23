import React, { useState } from 'react';

function Auditor({ isActive, auditState, onRunAudit }) {
  const [address, setAddress] = useState('');

  return (
    <section className={`tab-view ${isActive ? 'active' : ''}`}>
      <div className="card glass">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-file-shield" /> Smart Contract Audit
          </h3>
        </div>
        <div className="card-body">
          <p className="subtitle">
            Scans smart contracts for verification and dangerous functions.
          </p>
          <div className="form-container">
            <div className="form-group flex-row">
              <div className="flex-input">
                <label htmlFor="audit-address-input">Smart Contract Address</label>
                <input
                  id="audit-address-input"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="e.g. 0xdangerous, 0xtrusted, or contract address..."
                />
              </div>
              <button
                id="audit-submit-btn"
                className="glow-button"
                onClick={() => {
                  onRunAudit(address);
                  setAddress('');
                }}
              >
                <i className="fa-solid fa-bug-slash" /> Audit Code
              </button>
            </div>
            <div className="demo-chips">
              <span>Try Demo:</span>
              <button className="chip-btn" onClick={() => onRunAudit('0xdangerous')}>
                🔴 honeypot/unverified
              </button>
              <button className="chip-btn" onClick={() => onRunAudit('0xtrusted')}>
                🟢 Verified Token Contract
              </button>
            </div>
          </div>

          {auditState.loading && (
            <div id="audit-loader" className="view-loader">
              <i className="fa-solid fa-microchip fa-spin loading-logo" />
              <h4>Auditing Contract Bytecode...</h4>
              <p>Checking Etherscan code registration, owner controls, and potential backdoors.</p>
            </div>
          )}

          {auditState.result && (
            <div id="audit-result" className="result-details">
              <div className="audit-outcome-grid">
                <div className={`audit-card-verdict ${auditState.result.trust_level === 'Trusted' ? 'trusted' : 'dangerous'}`}>
                  <i className={`fa-solid ${auditState.result.trust_level === 'Trusted' ? 'fa-shield-halved' : 'fa-triangle-exclamation'} trust-icon`} />
                  <h2 id="audit-trust-title">{auditState.result.trust_level} Contract</h2>
                  <p id="audit-verified-badge">
                    Verification: {auditState.result.verified ? 'Verified Explorer Code' : 'Unverified Bytecode Only'}
                  </p>
                </div>
                <div className="audit-details-panel">
                  <h4>Vulnerabilities Scan Report</h4>
                  <div className="audit-notes" id="audit-notes">
                    {auditState.result.notes}
                  </div>
                  <h5 className="findings-header">Dangerous Functions Detected:</h5>
                  <ul className="danger-funcs-list" id="audit-funcs-list">
                    {auditState.result.dangerous_functions.length > 0 ? (
                      auditState.result.dangerous_functions.map((func, index) => <li key={index}>{func}</li>)
                    ) : (
                      <li>No dangerous signatures found. Owner withdrawal triggers or infinite token generation controls are secure.</li>
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

export default Auditor;
