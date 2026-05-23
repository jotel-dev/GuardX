const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Keep track of active alert subscriptions in memory
let subscriptions = [];
const startTime = Date.now();

// Mock Transaction Database for demo hashes
const mockTransactions = {
  "0xsafe": {
    verdict: "SAFE",
    risk_score: 12,
    flags: [],
    stage: 5,
    estimated_time: "Confirmed 5 minutes ago",
    ai_summary: "This transaction is completely safe. It interacts with a well-known, highly verified contract (Uniswap Router) with standard gas parameters and no suspicious calls."
  },
  "0xscam": {
    verdict: "SCAM",
    risk_score: 95,
    flags: [
      "Unlimited ERC-20 approval requested for an unverified contract",
      "Contract creator wallet matches known drainer signature",
      "LP tokens removed immediately prior to transaction execution"
    ],
    stage: 4,
    estimated_time: "Reverted",
    ai_summary: "CRITICAL ALERT: This transaction attempted to grant unlimited ERC-20 token approval to an unverified smart contract matching a known phishing signature. Fortunately, the execution reverted, but you must revoke any permissions to this address immediately."
  },
  "0xstuck": {
    verdict: "WARNING",
    risk_score: 45,
    flags: [
      "Gas price (12 Gwei) is significantly below the current base fee (45 Gwei)"
    ],
    stage: 2, // Mempool
    estimated_time: "Est. > 2 hours",
    ai_summary: "This transaction is currently stuck in the mempool because the offered priority fee is too low for current network congestion. To resolve this, use your wallet to speed up the transaction by increasing the gas price to at least 48 Gwei."
  }
};

// Mock Contract Database for demo addresses
const mockContracts = {
  "0xtrusted": {
    verified: true,
    trust_level: "Trusted",
    dangerous_functions: [],
    notes: "Interacts with standard OpenZeppelin ERC-20 implementation. Code is fully verified on-chain."
  },
  "0xdangerous": {
    verified: false,
    trust_level: "Dangerous",
    dangerous_functions: [
      "selfdestruct() — contract can be destroyed by owner",
      "mint() with no cap — unlimited token supply risk",
      "owner-only withdraw — funds can be drained by owner"
    ],
    notes: "WARNING: This contract is unverified, contains selfdestruct capabilities, and allows the owner to mint unlimited tokens, which is a common rugpull vector."
  }
};

// Helper to generate dynamic/randomized mock gas rates
function getGasRates(chain) {
  const normChain = (chain || "ethereum").toLowerCase();
  const now = Date.now();
  
  if (normChain === "solana") {
    return {
      slow: { gwei: "0.000005 SOL", time: "~5 sec" },
      standard: { gwei: "0.000005 SOL", time: "~2 sec" },
      fast: { gwei: "0.000010 SOL", time: "~1 sec" },
      updated_at: new Date(now).toISOString()
    };
  }

  // Generate slightly fluctuating prices based on chain
  let baseFee = 30;
  if (normChain === "polygon") baseFee = 80;
  else if (normChain === "bsc") baseFee = 3;

  // Add random fluctuation of +/- 10%
  const fluctuation = (Math.sin(now / 30000) * 0.1 * baseFee);
  const currentBase = Math.max(1, Math.round(baseFee + fluctuation));

  return {
    slow: { gwei: `${currentBase} Gwei`, time: "~5–10 min" },
    standard: { gwei: `${Math.round(currentBase + 1.5)} Gwei`, time: "~30–60 sec" },
    fast: { gwei: `${Math.round(currentBase + 3.0)} Gwei`, time: "~10–15 sec" },
    updated_at: new Date(now).toISOString()
  };
}

// ════════════════════════════════════════════════════
// REST API ENDPOINTS
// ════════════════════════════════════════════════════

// GET /v1/status
app.get("/v1/status", (req, res) => {
  res.json({
    api_version: "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    supported_chains: ["ethereum", "bsc", "polygon", "solana"],
    status: "operational"
  });
});

// GET /v1/gas/:chain
app.get("/v1/gas/:chain", (req, res) => {
  const chain = req.params.chain;
  res.json(getGasRates(chain));
});

// POST /v1/analyze
app.post("/v1/analyze", (req, res) => {
  const { chain, tx_hash } = req.body;
  if (!tx_hash) {
    return res.status(400).json({ error: "Missing tx_hash in request body" });
  }

  // Look up in mock database, or generate a randomized result
  const key = tx_hash.toLowerCase().trim();
  let result = mockTransactions[key];

  if (!result) {
    // Generate simulated dynamic result based on hash value length
    const score = Math.floor(Math.random() * 100);
    let verdict = "SAFE";
    let flags = [];
    if (score > 75) {
      verdict = "SCAM";
      flags = ["Suspicious interactions with unverified contract", "Matches common honeypot signature"];
    } else if (score > 25) {
      verdict = "WARNING";
      flags = ["Newly created contract address (< 15 days old)"];
    }
    
    result = {
      verdict,
      risk_score: score,
      flags,
      stage: Math.floor(Math.random() * 5) + 1,
      estimated_time: score > 75 ? "Reverted" : "~45 seconds",
      ai_summary: `This is a generated analysis for hash ${tx_hash}. Risk level is ${verdict} with a score of ${score}/100. Always check the contract verification status before interacting.`
    };
  }

  res.json(result);
});

// POST /v1/contract
app.post("/v1/contract", (req, res) => {
  const { chain, contract_address } = req.body;
  if (!contract_address) {
    return res.status(400).json({ error: "Missing contract_address in request body" });
  }

  const key = contract_address.toLowerCase().trim();
  let result = mockContracts[key];

  if (!result) {
    const isVerified = Math.random() > 0.3;
    const trust = isVerified ? "Trusted" : "Dangerous";
    const dangerFuncs = isVerified ? [] : ["mint() with no cap — unlimited supply risk"];
    result = {
      verified: isVerified,
      trust_level: trust,
      dangerous_functions: dangerFuncs,
      notes: isVerified 
        ? "This contract appears to be safe and code is verified on the blockchain explorer." 
        : "Caution: Code is not verified. Avoid interacting if you are unsure of the origin."
    };
  }

  res.json(result);
});

// POST /v1/alerts/subscribe
app.post("/v1/alerts/subscribe", (req, res) => {
  const { target, channels } = req.body;
  if (!target || !channels || !channels.length) {
    return res.status(400).json({ error: "Missing target or channels in request body" });
  }

  const id = "sub_" + Math.random().toString(36).substr(2, 9);
  const newSub = { id, target, channels, created_at: new Date().toISOString() };
  subscriptions.push(newSub);
  
  res.json({ subscription_id: id, status: "active", details: newSub });
});

// DELETE /v1/alerts/:id
app.delete("/v1/alerts/:id", (req, res) => {
  const id = req.params.id;
  const initialLength = subscriptions.length;
  subscriptions = subscriptions.filter(sub => sub.id !== id);
  
  if (subscriptions.length === initialLength) {
    return res.status(404).json({ error: "Subscription not found" });
  }
  
  res.json({ cancelled: true });
});

// GET /v1/alerts
app.get("/v1/alerts", (req, res) => {
  res.json(subscriptions);
});

// POST /v1/chat
// Conversational AI agent endpoint
app.post("/v1/chat", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing message in request body" });
  }

  const msg = message.toLowerCase().trim();
  let reply = "";

  // 1. Check for transaction hash patterns (e.g. 0x...)
  const txRegex = /(0x[a-fA-F0-9]{4,})/g;
  const foundHashes = msg.match(txRegex);

  if (foundHashes) {
    const hash = foundHashes[0];
    const key = hash.toLowerCase();
    
    // Check if it matches contract or tx database
    if (mockContracts[key] || msg.includes("contract") || msg.includes("audit")) {
      const result = mockContracts[key] || {
        verified: false,
        trust_level: "Dangerous",
        dangerous_functions: ["selfdestruct() — contract can be destroyed by owner"],
        notes: "Unverified contract scanned by AI agent."
      };
      reply = `🛡️ **GuardX Contract Audit for ${hash}**\n\n` +
              `• **Trust Level**: ${result.trust_level === "Trusted" ? "🟢 Trusted" : "🔴 Dangerous"}\n` +
              `• **Verified**: ${result.verified ? "Yes" : "No"}\n` +
              `• **Notes**: ${result.notes}\n\n` +
              (result.dangerous_functions.length > 0 
                ? `⚠️ **Dangerous Functions Found**:\n${result.dangerous_functions.map(f => `  - ${f}`).join("\n")}`
                : `✅ No dangerous functions detected in this scan.`);
    } else {
      const result = mockTransactions[key] || {
        verdict: "WARNING",
        risk_score: 55,
        flags: ["Newly deployed contract interaction"],
        stage: 3,
        estimated_time: "~2 minutes",
        ai_summary: "This transaction is under diagnostic assessment. It seems standard, but it represents an interaction with a relatively new contract."
      };
      
      const badge = result.verdict === "SAFE" ? "🟢" : result.verdict === "SCAM" ? "🔴" : "🟡";
      reply = `🛡️ **GuardX Shield Transaction Diagnosis: ${hash}**\n\n` +
              `• **Verdict**: ${badge} **${result.verdict}**\n` +
              `• **Risk Score**: ${result.risk_score}/100\n` +
              `• **Current Stage**: Stage ${result.stage} (${["Submitted", "Mempool", "Gas Estimation", "Contract Execution", "Bridge Relay"][result.stage - 1]})\n` +
              `• **Est. Time**: ${result.estimated_time}\n\n` +
              `💬 **AI Security Summary**:\n${result.ai_summary}\n\n` +
              (result.flags.length > 0 
                ? `⚠️ **Identified Security Flags**:\n${result.flags.map(f => `  - ${f}`).join("\n")}`
                : `✅ No malicious patterns matched.`);
    }
  }
  // 2. Check for gas questions
  else if (msg.includes("gas") || msg.includes("fee") || msg.includes("gwei")) {
    let chain = "ethereum";
    if (msg.includes("solana") || msg.includes("sol")) chain = "solana";
    else if (msg.includes("polygon") || msg.includes("matic")) chain = "polygon";
    else if (msg.includes("bsc") || msg.includes("binance")) chain = "bsc";

    const rates = getGasRates(chain);
    reply = `⛽ **Live Gas Rates for ${chain.toUpperCase()}**\n\n` +
            `• **Slow**: ${rates.slow.gwei} (${rates.slow.time})\n` +
            `• **Standard**: ${rates.standard.gwei} (${rates.standard.time}) — *Recommended*\n` +
            `• **Fast**: ${rates.fast.gwei} (${rates.fast.time})\n\n` +
            `🕒 *Last updated: ${new Date(rates.updated_at).toLocaleTimeString()}*`;
  }
  // 3. General greeting/help
  else if (msg.includes("hello") || msg.includes("hi") || msg.includes("help") || msg.includes("start")) {
    reply = `👋 **Hello! I am GuardX Shield, your cybersecurity AI assistant.**\n\n` +
            `You can talk to me directly, or command me to analyze things for you. Try asking:\n` +
            `• "Is transaction \`0xscam\` safe?"\n` +
            `• "Audit smart contract \`0xdangerous\`"\n` +
            `• "What is the standard gas on Ethereum?"\n` +
            `• "Check if \`0xsafe\` is stuck"`;
  }
  // 4. Fallback conversational reply
  else {
    reply = `🤖 **GuardX Shield Agent**:\n` +
            `I received your query: "${message}".\n\n` +
            `To scan a transaction or contract, please include a hash starting with \`0x\` (for example, \`0xscam\` or \`0xdangerous\` for a demo). You can also ask me about gas fees on Ethereum, Solana, BSC, or Polygon!`;
  }

  res.json({ reply });
});

// Serve frontend SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GuardX Security Agent running at http://localhost:${PORT}`);
});
