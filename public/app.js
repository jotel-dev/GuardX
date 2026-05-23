document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = ""; // Local relative API requests
  
  // Navigation elements
  const navItems = document.querySelectorAll(".nav-item");
  const tabViews = document.querySelectorAll(".tab-view");
  const pageTitle = document.getElementById("page-title");
  const pageDescription = document.getElementById("page-description");
  const globalChainSelect = document.getElementById("global-chain-select");

  // Tab configurations for headers
  const tabHeaders = {
    dashboard: { title: "Dashboard Overview", desc: "Cybersecurity status and real-time blockchain analytics." },
    scanner: { title: "Scam & Stuck Scanner", desc: "Assigns risk scores and identifies stuck stages in plain English." },
    auditor: { title: "Smart Contract Audit", desc: "Scans smart contracts for verification and dangerous functions." },
    gas: { title: "Gas Optimizer Engine", desc: "Analyzes mempool traffic density to compute optimal transaction pricing." },
    alerts: { title: "Real-time Alerts", desc: "Configure monitoring alerts for transaction confirmations and threats." },
    chatbot: { title: "Shield AI Agent", desc: "Interactive conversational co-pilot for cybersecurity advice." }
  };

  // State
  let activeTab = "dashboard";
  let activeChain = "ethereum";
  let gasInterval = null;
  let gasTimer = 30;

  // ════════════════════════════════════════════════════
  // NAVIGATION & TAB SWITCHING
  // ════════════════════════════════════════════════════
  function switchTab(tabId) {
    activeTab = tabId;
    navItems.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    tabViews.forEach(view => {
      if (view.id === `tab-${tabId}`) view.classList.add("active");
      else view.classList.remove("active");
    });

    // Update Header
    const config = tabHeaders[tabId] || { title: "GuardX", desc: "" };
    pageTitle.textContent = config.title;
    pageDescription.textContent = config.desc;

    // Trigger tab-specific initializations
    if (tabId === "gas") {
      fetchGasData(activeChain);
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      switchTab(item.getAttribute("data-tab"));
    });
  });

  globalChainSelect.addEventListener("change", (e) => {
    activeChain = e.target.value;
    // Sync other chain selects in forms if visible
    const scanChain = document.getElementById("scan-chain-select");
    if (scanChain) scanChain.value = activeChain;

    const gasRadio = document.querySelector(`input[name="gas-chain-radio"][value="${activeChain}"]`);
    if (gasRadio) {
      gasRadio.checked = true;
      fetchGasData(activeChain);
    }

    if (activeTab === "dashboard") {
      fetchDashboardGas();
    }
  });

  // Demo Chips Auto-filler
  document.querySelectorAll(".chip-btn").forEach(chip => {
    chip.addEventListener("click", () => {
      const targetInput = chip.getAttribute("data-input");
      const targetTab = chip.getAttribute("data-tab") || "dashboard";
      
      if (targetTab === "scanner") {
        document.getElementById("scan-hash-input").value = targetInput;
        document.getElementById("scan-submit-btn").click();
      } else if (targetTab === "auditor") {
        document.getElementById("audit-address-input").value = targetInput;
        document.getElementById("audit-submit-btn").click();
      } else {
        // Quick scan from Dashboard
        document.getElementById("quick-scan-input").value = targetInput;
        document.getElementById("quick-scan-btn").click();
      }
    });
  });

  // ════════════════════════════════════════════════════
  // DASHBOARD TAB
  // ════════════════════════════════════════════════════
  const quickScanInput = document.getElementById("quick-scan-input");
  const quickScanBtn = document.getElementById("quick-scan-btn");

  quickScanBtn.addEventListener("click", () => {
    const val = quickScanInput.value.trim();
    if (!val) return;

    if (val.includes("contract") || val.toLowerCase().startsWith("0xdangerous") || val.toLowerCase().startsWith("0xtrusted")) {
      // Switch to Auditor
      switchTab("auditor");
      document.getElementById("audit-address-input").value = val;
      runAudit(val);
    } else {
      // Switch to Scanner
      switchTab("scanner");
      document.getElementById("scan-hash-input").value = val;
      runDiagnosis(val);
    }
  });

  // Dashboard Live Gas
  async function fetchDashboardGas() {
    try {
      const res = await fetch(`${API_BASE}/v1/gas/${activeChain}`);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      const dashGasGrid = document.getElementById("dash-gas-grid");
      dashGasGrid.innerHTML = `
        <div class="gas-card accent-green">
          <h4>Slow</h4>
          <div class="gas-price">${data.slow.gwei}</div>
          <div class="gas-time">${data.slow.time}</div>
        </div>
        <div class="gas-card accent-amber">
          <h4>Standard</h4>
          <div class="gas-price">${data.standard.gwei}</div>
          <div class="gas-time">${data.standard.time}</div>
        </div>
        <div class="gas-card accent-red">
          <h4>Fast</h4>
          <div class="gas-price">${data.fast.gwei}</div>
          <div class="gas-time">${data.fast.time}</div>
        </div>
      `;
    } catch (e) {
      console.error(e);
      document.getElementById("dash-gas-grid").innerHTML = `
        <div class="gas-loader"><i class="fa-solid fa-circle-exclamation"></i> Error loading Gas Rates.</div>
      `;
    }
  }

  // ════════════════════════════════════════════════════
  // SCAM & STUCK SCANNER (F1, F2, F3)
  // ════════════════════════════════════════════════════
  const scanSubmitBtn = document.getElementById("scan-submit-btn");
  const scanHashInput = document.getElementById("scan-hash-input");
  const scanChainSelect = document.getElementById("scan-chain-select");
  const scanLoader = document.getElementById("scan-loader");
  const scanResult = document.getElementById("scan-result");

  async function runDiagnosis(txHash) {
    if (!txHash) return;
    scanResult.classList.add("hidden");
    scanLoader.classList.remove("hidden");

    const chain = scanChainSelect.value;

    try {
      const res = await fetch(`${API_BASE}/v1/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, tx_hash: txHash })
      });
      const data = await res.json();
      
      setTimeout(() => {
        // Render Results
        scanLoader.classList.add("hidden");
        scanResult.classList.remove("hidden");

        // Verdict Badge
        const vCard = document.getElementById("verdict-card");
        const vBadge = document.getElementById("scan-verdict-badge");
        const vTitle = document.getElementById("scan-verdict-title");
        const vDesc = document.getElementById("scan-verdict-desc");

        vCard.className = `result-card verdict-block ${data.verdict.toLowerCase()}`;
        vBadge.textContent = data.verdict;
        vTitle.textContent = `Transaction ${data.verdict.toUpperCase()}`;
        
        if (data.verdict === "SAFE") {
          vDesc.textContent = "GuardX Shield has marked this transaction profile as secure.";
        } else if (data.verdict === "SCAM") {
          vDesc.textContent = "WARNING: Phishing signatures detected. Avoid approving interactions.";
        } else {
          vDesc.textContent = "Caution: Anomalies detected, such as low fees or unverified creators.";
        }

        // Score Gauge
        const scoreText = document.getElementById("risk-score-text");
        const scoreCircle = document.getElementById("risk-score-circle");
        scoreText.textContent = data.risk_score;
        
        // Circular dasharray mapping (Circumference ~100)
        scoreCircle.setAttribute("stroke-dasharray", `${data.risk_score}, 100`);
        if (data.risk_score > 75) scoreCircle.style.stroke = "var(--red)";
        else if (data.risk_score > 25) scoreCircle.style.stroke = "var(--amber)";
        else scoreCircle.style.stroke = "var(--green)";

        // Metadata
        document.getElementById("scan-meta-est").textContent = data.estimated_time;
        document.getElementById("scan-meta-stage").textContent = `Stage ${data.stage} (${["Submitted", "Mempool", "Gas Estimation", "Contract Execution", "Bridge Relay"][data.stage - 1]})`;

        // Interactive Timeline Nodes
        for (let i = 1; i <= 5; i++) {
          const stepEl = document.getElementById(`step-${i}`);
          stepEl.className = "timeline-step"; // Reset classes
          
          if (i < data.stage) {
            stepEl.classList.add("completed");
          } else if (i === data.stage) {
            if (data.verdict === "SCAM") {
              stepEl.classList.add("active-reverted");
            } else if (data.verdict === "WARNING") {
              stepEl.classList.add("active-stuck");
            } else {
              stepEl.classList.add("completed");
            }
          }
        }

        // AI Narrative
        document.getElementById("scan-narrative").textContent = data.ai_summary;

        // Flags
        const flagsList = document.getElementById("scan-flags-list");
        flagsList.innerHTML = "";
        if (data.flags.length === 0) {
          flagsList.innerHTML = `<li><span style="color:var(--green)">✅ No vulnerability patterns detected in this transaction parameters.</span></li>`;
        } else {
          data.flags.forEach(flag => {
            flagsList.innerHTML += `<li>${flag}</li>`;
          });
        }

      }, 800); // Small delay to feel active

    } catch (e) {
      console.error(e);
      scanLoader.classList.add("hidden");
      alert("Error reaching scanner API endpoint");
    }
  }

  scanSubmitBtn.addEventListener("click", () => {
    runDiagnosis(scanHashInput.value.trim());
  });

  // ════════════════════════════════════════════════════
  // SMART CONTRACT AUDIT (F4)
  // ════════════════════════════════════════════════════
  const auditSubmitBtn = document.getElementById("audit-submit-btn");
  const auditAddressInput = document.getElementById("audit-address-input");
  const auditLoader = document.getElementById("audit-loader");
  const auditResult = document.getElementById("audit-result");

  async function runAudit(address) {
    if (!address) return;
    auditResult.classList.add("hidden");
    auditLoader.classList.remove("hidden");

    try {
      const res = await fetch(`${API_BASE}/v1/contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain: activeChain, contract_address: address })
      });
      const data = await res.json();

      setTimeout(() => {
        auditLoader.classList.add("hidden");
        auditResult.classList.remove("hidden");

        const trustCard = document.getElementById("audit-trust-card");
        const trustTitle = document.getElementById("audit-trust-title");
        const verifiedBadge = document.getElementById("audit-verified-badge");
        const auditIcon = document.getElementById("audit-trust-icon");

        verifiedBadge.textContent = `Verification: ${data.verified ? "Verified Explorer Code" : "Unverified Bytecode Only"}`;
        
        if (data.trust_level === "Trusted") {
          trustCard.className = "audit-card-verdict trusted";
          trustTitle.textContent = "Trusted Contract";
          auditIcon.className = "fa-solid fa-shield-halved trust-icon";
        } else {
          trustCard.className = "audit-card-verdict dangerous";
          trustTitle.textContent = "Dangerous Contract";
          auditIcon.className = "fa-solid fa-triangle-exclamation trust-icon";
        }

        document.getElementById("audit-notes").textContent = data.notes;

        const funcsList = document.getElementById("audit-funcs-list");
        funcsList.innerHTML = "";
        if (data.dangerous_functions.length === 0) {
          funcsList.innerHTML = `<li style="background-color:rgba(46,196,182,0.08); border-color:rgba(46,196,182,0.2); color:var(--mint)">No dangerous signatures found. Owner withdrawal triggers or infinite token generation controls are secure.</li>`;
        } else {
          data.dangerous_functions.forEach(func => {
            funcsList.innerHTML += `<li>${func}</li>`;
          });
        }

      }, 1000);

    } catch (e) {
      console.error(e);
      auditLoader.classList.add("hidden");
      alert("Error reaching contract audit API");
    }
  }

  auditSubmitBtn.addEventListener("click", () => {
    runAudit(auditAddressInput.value.trim());
  });

  // ════════════════════════════════════════════════════
  // GAS OPTIMIZER TAB (F6)
  // ════════════════════════════════════════════════════
  const gasDetailsGrid = document.getElementById("gas-details-grid");
  const gasTabRefresh = document.getElementById("gas-tab-refresh-label");
  const gasDashRefresh = document.getElementById("gas-refresh-label");

  async function fetchGasData(chain) {
    try {
      const res = await fetch(`${API_BASE}/v1/gas/${chain}`);
      const data = await res.json();

      gasDetailsGrid.innerHTML = `
        <div class="gas-card accent-green">
          <h4>Slow</h4>
          <div class="gas-price">${data.slow.gwei}</div>
          <div class="gas-time">${data.slow.time}</div>
          <p style="font-size: 11px; color: var(--gray); margin-top: 10px;">Best for non-urgent tasks. Lowest priority fee.</p>
        </div>
        <div class="gas-card accent-amber">
          <h4>Standard</h4>
          <div class="gas-price">${data.standard.gwei}</div>
          <div class="gas-time">${data.standard.time}</div>
          <p style="font-size: 11px; color: var(--gray); margin-top: 10px;">Best for standard DeFi swaps. Recommened default.</p>
        </div>
        <div class="gas-card accent-red">
          <h4>Fast</h4>
          <div class="gas-price">${data.fast.gwei}</div>
          <div class="gas-time">${data.fast.time}</div>
          <p style="font-size: 11px; color: var(--gray); margin-top: 10px;">Best for urgent execution. Outbids congestion pools.</p>
        </div>
      `;
    } catch (e) {
      console.error(e);
      gasDetailsGrid.innerHTML = `<div class="gas-loader">Error fetching gas records.</div>`;
    }
  }

  // Live timer polling logic
  function startGasTicker() {
    clearInterval(gasInterval);
    gasInterval = setInterval(() => {
      gasTimer--;
      
      const text = `Updates in ${gasTimer}s`;
      if (gasTabRefresh) gasTabRefresh.textContent = text;
      if (gasDashRefresh) gasDashRefresh.textContent = text;

      if (gasTimer <= 0) {
        gasTimer = 30;
        fetchGasData(activeChain);
        fetchDashboardGas();
      }
    }, 1000);
  }

  // Handle radio select changes on gas tab
  document.querySelectorAll('input[name="gas-chain-radio"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      fetchGasData(e.target.value);
    });
  });

  // ════════════════════════════════════════════════════
  // REAL-TIME ALERTS (F5)
  // ════════════════════════════════════════════════════
  const alertTarget = document.getElementById("alert-target");
  const alertSubmitBtn = document.getElementById("alert-submit-btn");
  const activeSubsContainer = document.getElementById("active-subs-container");
  const dashActiveAlertsCount = document.getElementById("dash-active-alerts-count");

  async function loadAlertSubscriptions() {
    try {
      const res = await fetch(`${API_BASE}/v1/alerts`);
      const subs = await res.json();
      
      // Update count on dashboard stat card
      dashActiveAlertsCount.textContent = subs.length;

      if (subs.length === 0) {
        activeSubsContainer.innerHTML = `<p class="empty-list">No active transaction watchers. Configure a target to start monitoring.</p>`;
        return;
      }

      activeSubsContainer.innerHTML = "";
      subs.forEach(sub => {
        const channelsHtml = sub.channels.map(ch => `<span class="chan-badge">${ch}</span>`).join("");
        activeSubsContainer.innerHTML += `
          <div class="sub-item">
            <div class="sub-details">
              <h5>${sub.target}</h5>
              <div class="sub-channels">${channelsHtml}</div>
              <p>Registered: ${new Date(sub.created_at).toLocaleTimeString()}</p>
            </div>
            <button class="cancel-sub-btn" data-id="${sub.id}"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        `;
      });

      // Bind delete button listeners
      document.querySelectorAll(".cancel-sub-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          cancelSubscription(btn.getAttribute("data-id"));
        });
      });

    } catch (e) {
      console.error(e);
    }
  }

  async function cancelSubscription(id) {
    try {
      const res = await fetch(`${API_BASE}/v1/alerts/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadAlertSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  }

  alertSubmitBtn.addEventListener("click", async () => {
    const targetVal = alertTarget.value.trim();
    if (!targetVal) {
      alert("Please enter a target hash or wallet address");
      return;
    }

    const channels = [];
    if (document.getElementById("channel-email").checked) channels.push("email");
    if (document.getElementById("channel-telegram").checked) channels.push("telegram");
    if (document.getElementById("channel-browser").checked) channels.push("browser");

    if (channels.length === 0) {
      alert("Please choose at least one notification channel");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/v1/alerts/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetVal, channels })
      });
      if (res.ok) {
        alertTarget.value = "";
        loadAlertSubscriptions();
        alert("Alert watcher registered successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  });

  // ════════════════════════════════════════════════════
  // SHIELD AI AGENT (CHATBOT)
  // ════════════════════════════════════════════════════
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatThreadContainer = document.getElementById("chat-thread-container");

  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    
    // Parse line breaks and bold tags safely
    let formatted = text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/🟢/g, "🟢")
      .replace(/🔴/g, "🔴")
      .replace(/🟡/g, "🟡");

    msgDiv.innerHTML = `<div class="msg-bubble">${formatted}</div>`;
    chatThreadContainer.appendChild(msgDiv);
    chatThreadContainer.scrollTop = chatThreadContainer.scrollHeight;
  }

  async function handleChatSubmit() {
    const message = chatInput.value.trim();
    if (!message) return;

    chatInput.value = "";
    appendChatMessage("user", message);

    // Show temporary typing status from Shield Agent
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-message agent typing-msg";
    typingBubble.innerHTML = `<div class="msg-bubble"><i class="fa-solid fa-ellipsis fa-fade"></i> Shield Agent typing...</div>`;
    chatThreadContainer.appendChild(typingBubble);
    chatThreadContainer.scrollTop = chatThreadContainer.scrollHeight;

    try {
      const res = await fetch(`${API_BASE}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      
      // Clear typing
      typingBubble.remove();
      appendChatMessage("agent", data.reply);
    } catch (e) {
      console.error(e);
      typingBubble.remove();
      appendChatMessage("agent", "⚠️ Connection error to GuardX Agent Core.");
    }
  }

  chatSendBtn.addEventListener("click", handleChatSubmit);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleChatSubmit();
  });

  // Short shortcut queries
  document.querySelectorAll(".shortcut-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chatInput.value = btn.getAttribute("data-cmd");
      handleChatSubmit();
    });
  });

  // ════════════════════════════════════════════════════
  // APP INITIALIZATION
  // ════════════════════════════════════════════════════
  fetchDashboardGas();
  loadAlertSubscriptions();
  startGasTicker();

});
