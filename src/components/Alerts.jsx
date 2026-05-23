import React, { useState } from 'react';

function Alerts({ isActive, subscriptions, onSubmit, onCancel }) {
  const [target, setTarget] = useState('');
  const [channels, setChannels] = useState({ email: true, telegram: false, browser: false });

  const handleSubmit = () => {
    const selectedChannels = Object.entries(channels)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    onSubmit(target, selectedChannels);
    setTarget('');
  };

  return (
    <section className={`tab-view ${isActive ? 'active' : ''}`}>
      <div className="card glass">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-bell" /> Real-time Security Subscriptions
          </h3>
        </div>
        <div className="card-body">
          <p className="subtitle">
            Subscribe transaction hashes or wallets. Receive automated reports on confirmation or threat flags.
          </p>
          <div className="alert-form-split">
            <div className="alert-form-panel">
              <h4>Configure Alert Rule</h4>
              <div className="form-group">
                <label htmlFor="alert-target">Target Hash or Wallet Address</label>
                <input
                  id="alert-target"
                  type="text"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="e.g. 0xstuck or 0x..."
                />
              </div>
              <div className="form-group">
                <label>Select Notification Channels</label>
                <div className="checkbox-group">
                  {['email', 'telegram', 'browser'].map((channel) => (
                    <label className="check-container" key={channel}>
                      <input
                        type="checkbox"
                        checked={channels[channel]}
                        onChange={() => setChannels((current) => ({ ...current, [channel]: !current[channel] }))}
                      />
                      <span className="checkmark" />
                      <i className={`fa-solid ${channel === 'email' ? 'fa-envelope' : channel === 'telegram' ? 'fa-paper-plane' : 'fa-desktop'}`} />
                      {channel === 'email' ? 'Email Notification' : channel === 'telegram' ? 'Telegram Bot Alert' : 'Browser Push Notify'}
                    </label>
                  ))}
                </div>
              </div>
              <button id="alert-submit-btn" className="glow-button" onClick={handleSubmit}>
                <i className="fa-solid fa-bell-plus" /> Subscribe Watcher
              </button>
            </div>
            <div className="alert-list-panel">
              <h4>Active Security Watchers</h4>
              <div className="active-subs-list" id="active-subs-container">
                {subscriptions.length === 0 ? (
                  <p className="empty-list">No active transaction watchers. Configure a target to start monitoring.</p>
                ) : (
                  subscriptions.map((sub) => (
                    <div className="sub-item" key={sub.id}>
                      <div className="sub-details">
                        <h5>{sub.target}</h5>
                        <div className="sub-channels">
                          {sub.channels.map((channel) => (
                            <span className="chan-badge" key={channel}>{channel}</span>
                          ))}
                        </div>
                        <p>Registered: {new Date(sub.created_at).toLocaleTimeString()}</p>
                      </div>
                      <button className="cancel-sub-btn" onClick={() => onCancel(sub.id)}>
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Alerts;
