import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import Scanner from './components/Scanner.jsx';
import Auditor from './components/Auditor.jsx';
import Gas from './components/Gas.jsx';
import Alerts from './components/Alerts.jsx';
import Chatbot from './components/Chatbot.jsx';

const tabHeaders = {
  dashboard: { title: 'Dashboard Overview', desc: 'Cybersecurity status and real-time blockchain analytics.' },
  scanner: { title: 'Scam & Stuck Scanner', desc: 'Assigns risk scores and identifies stuck stages in plain English.' },
  auditor: { title: 'Smart Contract Audit', desc: 'Scans smart contracts for verification and dangerous functions.' },
  gas: { title: 'Gas Optimizer Engine', desc: 'Analyzes mempool traffic density to compute optimal transaction pricing.' },
  alerts: { title: 'Real-time Alerts', desc: 'Configure monitoring alerts for transaction confirmations and threats.' },
  chatbot: { title: 'Shield AI Agent', desc: 'Interactive conversational co-pilot for cybersecurity advice.' }
};

const initialChat = [
  {
    sender: 'agent',
    content:
      '👋 Hello! I am GuardX Shield, your cybersecurity AI assistant.\n\nI\'m here to help you audit smart contracts, check stuck transactions, and monitor live gas prices. Try typing:\n• "Is transaction 0xscam safe?"\n• "Audit contract 0xdangerous"\n• "Ethereum gas fee"'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChain, setActiveChain] = useState('ethereum');
  const [dashGasData, setDashGasData] = useState(null);
  const [gasData, setGasData] = useState(null);
  const [gasTimer, setGasTimer] = useState(30);
  const [alertSubs, setAlertSubs] = useState([]);
  const [scanState, setScanState] = useState({ loading: false, result: null });
  const [auditState, setAuditState] = useState({ loading: false, result: null });
  const [chatMessages, setChatMessages] = useState(initialChat);

  useEffect(() => {
    fetchDashboardGas(activeChain);
    loadAlertSubscriptions();
    const interval = setInterval(() => {
      setGasTimer((current) => {
        if (current <= 1) {
          fetchDashboardGas(activeChain);
          if (activeTab === 'gas') fetchGasData(activeChain);
          return 30;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeChain, activeTab]);

  useEffect(() => {
    if (activeTab === 'gas') {
      fetchGasData(activeChain);
    }
  }, [activeTab, activeChain]);

  const header = useMemo(() => tabHeaders[activeTab] || tabHeaders.dashboard, [activeTab]);

  const fetchDashboardGas = async (chain) => {
    try {
      const response = await fetch(`/v1/gas/${chain}`);
      const data = await response.json();
      setDashGasData(data);
    } catch (error) {
      setDashGasData(null);
      console.error('Failed to load dashboard gas', error);
    }
  };

  const fetchGasData = async (chain) => {
    try {
      const response = await fetch(`/v1/gas/${chain}`);
      const data = await response.json();
      setGasData(data);
    } catch (error) {
      setGasData(null);
      console.error('Failed to load gas data', error);
    }
  };

  const loadAlertSubscriptions = async () => {
    try {
      const response = await fetch('/v1/alerts');
      const subs = await response.json();
      setAlertSubs(subs || []);
    } catch (error) {
      console.error('Failed to load alert subscriptions', error);
    }
  };

  const runDiagnosis = async (txHash, chain = activeChain) => {
    if (!txHash) return;
    setScanState({ loading: true, result: null });
    try {
      const response = await fetch('/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain, tx_hash: txHash })
      });
      const result = await response.json();
      setTimeout(() => {
        setScanState({ loading: false, result });
      }, 800);
    } catch (error) {
      setScanState({ loading: false, result: null });
      console.error('Diagnosis failed', error);
    }
  };

  const runAudit = async (address) => {
    if (!address) return;
    setAuditState({ loading: true, result: null });
    try {
      const response = await fetch('/v1/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: activeChain, contract_address: address })
      });
      const result = await response.json();
      setTimeout(() => {
        setAuditState({ loading: false, result });
      }, 700);
    } catch (error) {
      setAuditState({ loading: false, result: null });
      console.error('Audit failed', error);
    }
  };

  const submitAlert = async (target, channels) => {
    if (!target || channels.length === 0) return;
    try {
      await fetch('/v1/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, channels })
      });
      loadAlertSubscriptions();
    } catch (error) {
      console.error('Failed to create alert', error);
    }
  };

  const cancelAlert = async (id) => {
    try {
      await fetch(`/v1/alerts/${id}`, { method: 'DELETE' });
      loadAlertSubscriptions();
    } catch (error) {
      console.error('Failed to cancel alert', error);
    }
  };

  const sendChat = async (message) => {
    if (!message) return;
    const userMessage = { sender: 'user', content: message };
    setChatMessages((current) => [...current, userMessage]);
    const typingMessage = { sender: 'agent', content: 'Shield Agent typing...' };
    setChatMessages((current) => [...current, typingMessage]);

    try {
      const response = await fetch('/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      setChatMessages((current) => current.slice(0, -1).concat({ sender: 'agent', content: data.reply }));
    } catch (error) {
      setChatMessages((current) => current.slice(0, -1).concat({ sender: 'agent', content: '⚠️ Connection error to GuardX Agent Core.' }));
      console.error('Chat failed', error);
    }
  };

  const activeTabCount = alertSubs.length;

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeChain={activeChain}
        onChangeChain={setActiveChain}
      />
      <main className="main-content">
        <Header title={header.title} description={header.desc} />
        <div className="view-viewport">
          <Dashboard
            isActive={activeTab === 'dashboard'}
            dashGasData={dashGasData}
            alertCount={activeTabCount}
            onQuickScan={(value) => {
              if (!value) return;
              if (value.toLowerCase().startsWith('0xdangerous') || value.toLowerCase().startsWith('0xtrusted')) {
                setActiveTab('auditor');
                runAudit(value);
              } else {
                setActiveTab('scanner');
                runDiagnosis(value);
              }
            }}
            onDemoSelect={(value) => {
              setActiveTab('scanner');
              runDiagnosis(value);
            }}
          />
          <Scanner
            isActive={activeTab === 'scanner'}
            activeChain={activeChain}
            onChainChange={setActiveChain}
            scanState={scanState}
            onRunDiagnosis={runDiagnosis}
          />
          <Auditor
            isActive={activeTab === 'auditor'}
            auditState={auditState}
            onRunAudit={runAudit}
          />
          <Gas
            isActive={activeTab === 'gas'}
            activeChain={activeChain}
            gasData={gasData}
            gasTimer={gasTimer}
            onChainChange={setActiveChain}
          />
          <Alerts
            isActive={activeTab === 'alerts'}
            subscriptions={alertSubs}
            onSubmit={submitAlert}
            onCancel={cancelAlert}
          />
          <Chatbot
            isActive={activeTab === 'chatbot'}
            messages={chatMessages}
            onSendMessage={sendChat}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
