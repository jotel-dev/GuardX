import React, { useState } from 'react';

function Chatbot({ isActive, messages, onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  return (
    <section className={`tab-view ${isActive ? 'active' : ''}`}>
      <div className="card glass chat-card">
        <div className="card-header chat-header">
          <div className="agent-avatar">
            <i className="fa-solid fa-user-astronaut" />
          </div>
          <div className="agent-name-wrap">
            <h3>GuardX Shield Agent</h3>
            <span>Security Intelligence Co-pilot</span>
          </div>
        </div>
        <div className="chat-thread" id="chat-thread-container">
          {messages.map((item, index) => (
            <div className={`chat-message ${item.sender}`} key={`${item.sender}-${index}`}>
              <div className="msg-bubble">
                {item.content.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-shortcuts">
          <button className="shortcut-btn" onClick={() => onSendMessage('Is 0xstuck transaction stuck?')}>
            Check 0xstuck
          </button>
          <button className="shortcut-btn" onClick={() => onSendMessage('Audit contract 0xdangerous')}>
            Audit 0xdangerous
          </button>
          <button className="shortcut-btn" onClick={() => onSendMessage('Show Ethereum gas rates')}>
            Show Gas Rates
          </button>
        </div>
        <div className="chat-input-bar">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask GuardX Agent anything about transaction safety, gas, or addresses..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === 'Enter') handleSend();
            }}
          />
          <button id="chat-send-btn" onClick={handleSend}>
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Chatbot;
