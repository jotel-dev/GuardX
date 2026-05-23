import React from 'react';

const navItems = [
  { key: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
  { key: 'scanner', icon: 'fa-magnifying-glass-chart', label: 'Scam & Stuck Scanner' },
  { key: 'auditor', icon: 'fa-file-shield', label: 'Smart Contract Audit' },
  { key: 'gas', icon: 'fa-gas-pump', label: 'Gas Optimizer' },
  { key: 'alerts', icon: 'fa-bell', label: 'Real-time Alerts' },
  { key: 'chatbot', icon: 'fa-user-astronaut', label: 'Shield AI Agent' }
];

function Sidebar({ activeTab, onChangeTab, activeChain, onChangeChain }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <i className="fa-solid fa-shield-halved logo-icon" />
        </div>
        <div className="brand-text">
          <h1>GuardX</h1>
          <span>Shield AI Agent v1.0</span>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => onChangeTab(item.key)}
          >
            <i className={`fa-solid ${item.icon}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="chain-selector-wrapper">
          <label htmlFor="global-chain-select">
            <i className="fa-solid fa-network-wired" /> Network
          </label>
          <select
            id="global-chain-select"
            className="chain-dropdown"
            value={activeChain}
            onChange={(event) => onChangeChain(event.target.value)}
          >
            <option value="ethereum">Ethereum Mainnet</option>
            <option value="solana">Solana</option>
            <option value="bsc">BNB Smart Chain</option>
            <option value="polygon">Polygon PoS</option>
          </select>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
