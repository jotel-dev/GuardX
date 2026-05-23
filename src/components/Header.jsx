import React from 'react';

function Header({ title, description }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="header-right">
        <div className="status-indicator">
          <span className="pulse-dot green" />
          <span className="status-text">API Online (8ms)</span>
        </div>
        <div className="user-profile">
          <i className="fa-solid fa-user-shield" />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
