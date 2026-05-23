# 🛡️ GuardX — Shield AI Agent & Security Dashboard

GuardX is a premium, real-time Web3 security dashboard and AI co-pilot designed to diagnose smart contracts, estimate transaction times, optimize gas parameters, and audit protocol addresses on EVM chains and Solana.

---

## 🚀 Key Features

* **F1: Scam Detection**: Evaluates transaction parameters for honeypot indicators, signature exploits, and unverified creators to assign a security risk score (0–100).
* **F2: Stuck TX Diagnosis**: Pinpoints exactly where a transaction is stalled within a 5-stage pipeline (*Submitted ➔ Mempool ➔ Gas Estimation ➔ Contract Execution ➔ Bridge Relay*) and delivers clear resolution steps.
* **F3: Completion Time Estimate**: Computes live confirmation durations based on queue depth and priorities.
* **F4: Smart Contract Audit**: Scans contracts for structural vulnerabilities and dangerous functions (e.g. `selfdestruct()`, `mint()` without limits, or owner drain permissions).
* **F5: Real-time Alerts**: Allows users to watch transactions and receive updates across Email, Telegram, and Browser notifications.
* **F6: Gas Optimizer**: Provides 3 clearance speeds (Slow, Standard, Fast) updated every 30 seconds based on live RPC block statistics.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js + Express (serving the public REST API and simulated chain analytics engine).
- **Frontend**: Single-Page App (SPA) styled with vanilla CSS glassmorphism, responsive navigation grids, dynamic circular SVG charts, and interactive step-by-step flowchart timelines.

---

## ⚡ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* npm (comes with Node)

### Installation & Launch

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/jotel-dev/GuardX.git
   cd GuardX
   npm install
   ```

2. **Start the Security Server**:
   ```bash
   npm start
   ```

3. **Access the Dashboard**:
   Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🔬 Demo Scenarios
To verify the engine, use the following preloaded diagnostic keywords in the Dashboard or Scanner input fields:

| Input Keywords | Type | Simulated Result | Key Behavior Shown |
| :--- | :--- | :--- | :--- |
| `0xsafe` | Transaction | 🟢 **SAFE** (12/100) | Completes full 5-stage relay flow. |
| `0xstuck` | Transaction | 🟡 **WARNING** (45/100) | Stalls at the **Mempool** stage due to insufficient gas tip. |
| `0xscam` | Transaction | 🔴 **SCAM** (95/100) | Reverted at **Contract Execution** with drainer signatures. |
| `0xtrusted` | Contract | 🟢 **Trusted** | Clear audit notes with zero dangerous functions. |
| `0xdangerous`| Contract | 🔴 **Dangerous** | Flags `selfdestruct()` and unverified creator bytecodes. |

---

## 🌐 Public API Specifications

### System Info
* **`GET /v1/status`**: Returns operational status, current uptime, and supported chain lists.

### Diagnostics
* **`POST /v1/analyze`**: Request transaction threat checks.
  * *Request Body*: `{ "chain": "ethereum", "tx_hash": "0xstuck" }`
  * *Returns*: `verdict`, `risk_score`, `flags[]`, `stage`, `estimated_time`, `ai_summary`
* **`POST /v1/contract`**: Run smart contract auditing.
  * *Request Body*: `{ "chain": "ethereum", "contract_address": "0xdangerous" }`
  * *Returns*: `verified`, `trust_level`, `dangerous_functions[]`, `notes`
* **`GET /v1/gas/:chain`**: Retrieve optimal priority gas tiers.
  * *Returns*: `slow{gwei, time}`, `standard{gwei, time}`, `fast{gwei, time}`, `updated_at`

### Notifications
* **`POST /v1/alerts/subscribe`**: Create subscription watches.
  * *Request Body*: `{ "target": "0x...", "channels": ["email", "telegram"] }`
* **`DELETE /v1/alerts/:id`**: Cancel an active watch using its subscription ID.

### GuardX Shield AI Chatbot
* **`POST /v1/chat`**: Process conversational queries and return smart security recommendations.
  * *Request Body*: `{ "message": "Is transaction 0xscam safe?" }`
