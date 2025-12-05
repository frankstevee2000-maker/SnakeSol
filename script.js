/* ============================================================
   GLOBAL APP STATE
============================================================ */
let userLoggedIn = false;
let currentUser = null;

let userWallet = null;
let solBalance = 0;
let usdSolPrice = 0;
let recentTransactions = [];

const RECEIVER_ADDRESS = "HTUduW42xDZNiVf9NejQSCms9YqCDHgD1sdfeUEvtrHo";

/* ============================================================
   DOM ELEMENTS
============================================================ */
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeModalBtn = document.querySelector(".close-modal");
const emailForm = document.getElementById("emailLoginForm");
const winnersCard = document.getElementById("winnersCard");
const depositBtn = document.getElementById("depositBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const fullLeaderboardBtn = document.getElementById("fullLeaderboardBtn");
const joinGameBtn = document.getElementById("joinGameBtn");
const usernameInput = document.getElementById("usernameInput");
const depositInput = document.getElementById("depositInput");

/* ============================================================
   UTILITIES
============================================================ */
function shortAddress(addr) {
    return addr.substring(0, 4) + "…" + addr.substring(addr.length - 4);
}

/* ============================================================
   NOTIFICATION POPUP
============================================================ */
function notify(type, message) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.zIndex = 999999;

    let color = "#009cff";
    if (type === "error") color = "#ff4d4d";
    if (type === "success") color = "#4dff8f";
    if (type === "warn") color = "#ffcc00";

    modal.innerHTML = `
      <div class="modal-content" style="max-width:360px; border:2px solid ${color}">
        <button class="close-modal">×</button>
        <h2 style="color:${color};margin-bottom:10px;">${type.toUpperCase()}</h2>
        <p style="font-size:15px;color:#dbe8ff">${message}</p>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector(".close-modal").onclick = () => modal.remove();
    setTimeout(() => modal.remove(), 4000);
}

/* ============================================================
   LOGIN SYSTEM
============================================================ */
loginModal.classList.add("hidden");

loginBtn.addEventListener("click", () => {
    if (userLoggedIn) return logoutUser();
    loginModal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => loginModal.classList.add("hidden"));

window.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.classList.add("hidden");
});

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailForm.querySelector("input").value.trim();
    const username = email.split("@")[0];

    userLoggedIn = true;
    currentUser = username;
    localStorage.setItem("snakeUser", username);

    document.querySelector(".welcome-highlight").textContent = username + "!";
    loginBtn.textContent = "Logout";
    usernameInput.value = username;

    loginModal.classList.add("hidden");
    notify("success", "Logged in successfully!");
});

function logoutUser() {
    userLoggedIn = false;
    currentUser = null;
    userWallet = null;

    localStorage.removeItem("snakeUser");

    document.querySelector(".welcome-highlight").textContent = "bruh!";
    usernameInput.value = "";
    loginBtn.textContent = "Login";

    notify("warn", "Logged out.");
}

/* ============================================================
   AUTO-LOGIN
============================================================ */
window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("snakeUser");
    if (saved) {
        userLoggedIn = true;
        currentUser = saved;
        document.querySelector(".welcome-highlight").textContent = saved + "!";
        loginBtn.textContent = "Logout";
        usernameInput.value = saved;
    }
});

/* ============================================================
   GENERAL MODAL HANDLER
============================================================ */
function openCustomModal(title, content, wide = false) {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content" style="max-width:${wide ? "850px" : "480px"}">
        <button class="close-modal">×</button>
        <h2 style="color:#7ec5ff;margin-bottom:12px">${title}</h2>
        <div>${content}</div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector(".close-modal").onclick = () => modal.remove();
}

/* ============================================================
   BASIC MODALS (How to Play, Leaderboard)
============================================================ */
howToPlayBtn.onclick = () => {
    openCustomModal("How to Play", `
      🐍 <b>Gameplay Rules</b><br><br>
      • Avoid obstacles.<br>
      • Survive longer to win more.<br>
      • Higher stakes = bigger rewards.<br><br>
      <b>Join → Survive → Earn SOL</b>
    `);
};

leaderboardBtn.onclick = () => {
    openCustomModal("Leaderboard", `
      1. Mr-1221z — $17,965<br>
      2. Quantum — $16,709<br>
      3. SnakeLord — $9,221<br>
    `);
};

fullLeaderboardBtn.onclick = () => {
    openCustomModal("Full Leaderboard", `
      (Firebase leaderboard update coming soon.)
    `, true);
};

/* ============================================================
   SOL PRICE FETCH
============================================================ */
async function getSolPrice() {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT");
        usdSolPrice = parseFloat((await res.json()).price);
    } catch {}
}

/* ============================================================
   WALLET UI UPDATE
============================================================ */
function updateWalletUI() {
    const usdVal = (solBalance * usdSolPrice).toFixed(2);
    document.querySelector(".balance-main").textContent = `$${usdVal}`;
    document.querySelector(".balance-sub").textContent = `${solBalance.toFixed(4)} SOL`;

    document.getElementById("walletStatus").textContent =
        userWallet ? `Connected: ${shortAddress(userWallet)}` : "Not Connected";
}

/* ============================================================
   FETCH REAL WALLET BALANCE
============================================================ */
async function updateWalletBalance() {
    if (!userWallet) return;
    try {
        const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
        const lamports = await connection.getBalance(new solanaWeb3.PublicKey(userWallet));
        solBalance = lamports / 1_000_000_000;
        updateWalletUI();
    } catch {}
}

/* ============================================================
   AUTO PRICE + WALLET REFRESH
============================================================ */
setInterval(async () => {
    await getSolPrice();
    await updateWalletBalance();
}, 15000);

/* ============================================================
   WALLET ADAPTERS
============================================================ */
let walletAdapters = [];

async function initWallets() {
    try {
        const { PhantomWalletAdapter } = window["@solana/wallet-adapter-wallets"];
        walletAdapters = [
            new PhantomWalletAdapter(),
        ];
    } catch {
        console.warn("Wallet adapters unavailable.");
    }
}

initWallets();

/* ------------------------------------------------------------
   FRIENDS DUMMY DATA
------------------------------------------------------------ */
const newPlayers = [
    { name: "NovaKid" },
    { name: "ByteRunner" },
    { name: "Solaris" },
];

const recentWinners = [
    { name: "BruhKing" },
    { name: "SnakeLord" },
    { name: "SolDuke" },
];

const topPlayers = [
    { name: "Mr-1221z" },
    { name: "Quantum" },
    { name: "Denis237" },
];

/* ============================================================
   NEW DEPOSIT ADDRESS SCREEN
============================================================ */
function openDepositAddressModal(amount = null) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content" style="max-width:420px">
      <button class="close-modal">×</button>

      <h2 style="color:#7ec5ff;margin-bottom:10px;">Deposit Funds</h2>

      <p>Send SOL to the address below:</p>

      <div id="depositAddressBox" class="deposit-address-box">
        ${RECEIVER_ADDRESS}
      </div>

      <button id="copyDepositAddress" class="modal-submit" style="margin-bottom:15px;">
        Copy Address
      </button>

      <p style="font-size:13px;color:#ffdd66;margin-bottom:15px;">
        ⚠ Deposit at least <b>1 SOL</b> as collateral to avoid gas fees, loss of funds, or bugs.
      </p>

      <button id="continueToWallet" class="modal-submit" style="background:#009cff;">
        Continue
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-modal").onclick = () => modal.remove();

  // Copy button
  document.getElementById("copyDepositAddress").onclick = () => {
    navigator.clipboard.writeText(RECEIVER_ADDRESS);
    const btn = document.getElementById("copyDepositAddress");
    btn.textContent = "Copied!";
    btn.style.background = "#4dff8f";
    setTimeout(() => {
      btn.textContent = "Copy Address";
      btn.style.background = "";
    }, 1500);
  };

  // Continue → wallet selector
  document.getElementById("continueToWallet").onclick = () => {
    modal.remove();
    openWalletSelector(amount);
  };
}
/* ============================================================
   WALLET SELECTOR POPUP
============================================================ */
function openWalletSelector(amount = null) {
    const modal = document.createElement("div");
    modal.className = "modal";

    let buttons = walletAdapters
        .map(w => `<button class="wallet-btn" data-wallet="${w.name}">${w.name}</button>`)
        .join("");

    modal.innerHTML = `
      <div class="modal-content" style="max-width:400px">
        <button class="close-modal">×</button>
        <h2 style="color:#7ec5ff;margin-bottom:20px">Select Wallet</h2>
        ${buttons || "<p>No wallets detected.</p>"}
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").onclick = () => modal.remove();

    modal.querySelectorAll(".wallet-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.wallet;
            const adapter = walletAdapters.find(w => w.name === name);
            modal.remove();
            connectSelectedWallet(adapter, amount);
        });
    });
}

/* ============================================================
   CONNECT SELECTED WALLET
============================================================ */
async function connectSelectedWallet(adapter, amount = null) {
    try {
        await adapter.connect();

        userWallet = adapter.publicKey.toString();

        await getSolPrice();
        await updateWalletBalance();

        notify("success", `${adapter.name} Connected!`);

        if (amount) confirmDeposit(amount);

    } catch {
        notify("error", "Wallet connection failed.");
    }
}

/* ============================================================
   CONFIRM DEPOSIT
============================================================ */
function confirmDeposit(amount) {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content" style="max-width:380px">
        <button class="close-modal">×</button>
        <h2>Confirm Deposit</h2>
        <p>You are about to send:</p>
        <h3 style="color:#00aaff">${amount} SOL</h3>
        <p>To address:</p>
        <div style="background:#18202f;padding:12px;border-radius:10px;">
          ${RECEIVER_ADDRESS}
        </div>
        <button id="confirmDeposit" class="modal-submit" style="margin-top:20px">
          Confirm Transaction
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").onclick = () => modal.remove();
    document.getElementById("confirmDeposit").onclick = () => {
        modal.remove();
        handleSolDeposit(amount);
    };
}

/* ============================================================
   SEND REAL SOL DEPOSIT TX
============================================================ */
async function handleSolDeposit(amount) {
    if (!userWallet) return notify("error", "Wallet not connected.");

    try {
        const provider = window.phantom?.solana;
        if (!provider) return notify("error", "Phantom wallet is required for deposit.");

        const lamports = amount * 1_000_000_000;
        const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

        const tx = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(userWallet),
                toPubkey: new solanaWeb3.PublicKey(RECEIVER_ADDRESS),
                lamports
            })
        );

        tx.feePayer = new solanaWeb3.PublicKey(userWallet);
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signed = await provider.signTransaction(tx);
        const txid = await connection.sendRawTransaction(signed.serialize());

        recentTransactions.unshift({
            amount,
            txid,
            time: Date.now()
        });

        notify("success", `Deposit Sent! TX: ${txid}`);
        updateWalletBalance();

    } catch (err) {
        console.log(err);
        notify("error", "Deposit failed.");
    }
}

/* ============================================================
   MAIN DEPOSIT BUTTON
============================================================ */
depositBtn.addEventListener("click", () => {
    if (!userLoggedIn) return loginModal.classList.remove("hidden");

    const amount = parseFloat(depositInput.value);
    if (amount < 1) return notify("warn", "Minimum deposit is 1 SOL.");

    openDepositAddressModal(amount);
});

/* ============================================================
   ADD FUNDS BUTTON (RIGHT WALLET CARD)
============================================================ */
document.querySelector(".wallet-add").addEventListener("click", () => {
    if (!userLoggedIn) return loginModal.classList.remove("hidden");
    openDepositModal();
});

/* ============================================================
   CASH OUT BUTTON
============================================================ */
document.querySelector(".wallet-cashout").addEventListener("click", () => {
    if (!userLoggedIn) return loginModal.classList.remove("hidden");
    openCashoutModal();
});

/* ============================================================
   DEPOSIT FUNDS (IMPROVED MODAL)
============================================================ */
function openDepositModal() {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content" style="max-width:420px">
        <button class="close-modal">×</button>
        <h2 style="text-align:center; color:#7ec5ff;">Deposit Funds</h2>

        <p style="text-align:center; opacity:0.9; margin-bottom:10px;">
          Send SOL to the address below:
        </p>

        <div class="deposit-address-box">${RECEIVER_ADDRESS}</div>

        <button id="copyAddress" class="modal-submit" style="margin-bottom:10px;">
          Copy Address
        </button>

        <p style="font-size:13px; color:#ffc75f; text-align:center;">
          ⚠ Deposit at least <b>1 SOL</b> to avoid bugs or failed transactions.
        </p>

        <button id="continueDeposit" class="modal-submit" style="margin-top:15px;">
          Continue
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").onclick = () => modal.remove();
    modal.querySelector("#copyAddress").onclick = () => {
        navigator.clipboard.writeText(RECEIVER_ADDRESS);
        notify("success", "Address copied!");
    };

    modal.querySelector("#continueDeposit").onclick = () => {
        modal.remove();
        notify("success", "Deposit started... updating wallet.");
        updateWalletBalance();
    };
}

/* ============================================================
   CASHOUT MODAL
============================================================ */
function openCashoutModal() {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content" style="max-width:420px">
        <button class="close-modal">×</button>

        <h2 style="text-align:center; color:#7ec5ff;">Cash Out Request</h2>

        <p style="text-align:center; margin-bottom:10px;">
          Enter the Solana wallet you want payouts sent to:
        </p>

        <input id="cashoutAddressInput"
               class="modal-input"
               placeholder="Your SOL address" />

        <button id="submitCashout" class="modal-submit" style="margin-top:15px;">
          Submit Request
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").onclick = () => modal.remove();

    modal.querySelector("#submitCashout").onclick = () => {
        const address = document.getElementById("cashoutAddressInput").value.trim();

        if (address.length < 20) return notify("error", "Invalid Solana address.");

        recentTransactions.unshift({
            type: "cashout",
            address,
            time: Date.now()
        });

        notify("success", "Cashout request submitted successfully!");
        modal.remove();
    };
}

/* ============================================================
   STAKE BUTTONS → SYNC WITH DEPOSIT INPUT
============================================================ */
const stakeButtons = document.querySelectorAll(".center-stake-btn");

stakeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        stakeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const value = parseInt(btn.textContent.replace("$", ""));
        depositInput.value = value;
    });
});

/* ============================================================
   FRIENDS SECTION — OPEN FRIENDS MODAL
============================================================ */
const friendsAddBtn = document.querySelector(".friends-add-btn");
friendsAddBtn.addEventListener("click", () => openFriendsModal());

/* ============================================================
   FRIENDS MODAL (NEW PLAYERS / WINNERS / TOP PLAYERS)
============================================================ */
function openFriendsModal() {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content" style="max-width:700px;">
        <button class="close-modal">×</button>

        <h2 style="margin-bottom:15px;">Add Friends</h2>

        <div class="friends-tabs">
          <button class="tab-btn active" data-tab="new">New Players</button>
          <button class="tab-btn" data-tab="winners">Winners</button>
          <button class="tab-btn" data-tab="top">Top Players</button>
        </div>

        <div class="friends-list" id="friendsListArea">Loading...</div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector(".close-modal").onclick = () => modal.remove();

    const tabButtons = modal.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadFriendsTab(btn.dataset.tab);
        });
    });

    // Load default tab
    loadFriendsTab("new");
}

/* ============================================================
   LOAD FRIENDS TAB
============================================================ */
function loadFriendsTab(tab) {
    const area = document.getElementById("friendsListArea");

    let data = [];
    if (tab === "new") data = newPlayers;
    if (tab === "winners") data = recentWinners;
    if (tab === "top") data = topPlayers;

    area.innerHTML = data.map(player => `
        <div class="friend-row">
          <div class="friend-left">
            <div class="avatar">${player.name.charAt(0)}</div>
            <span>${player.name}</span>
          </div>
          <button class="friend-add-btn" data-user="${player.name}">
            Add Friend
          </button>
        </div>
    `).join("");

    // Attach event listeners to new buttons
    document.querySelectorAll(".friend-add-btn").forEach(button => {
        button.addEventListener("click", () => addFriend(button.dataset.user));
    });
}

/* ============================================================
   ADD FRIEND FUNCTION
============================================================ */
function addFriend(name) {
    notify("success", `Friend request sent to ${name}!`);

    // Update UI under Friends card
    const friendsCard = document.querySelector(".friends-empty");
    if (friendsCard) friendsCard.textContent = `Added: ${name}`;
}
/* ============================================================
   AUTO-REFRESH WINNERS SECTION
============================================================ */
function randomMoney(min, max) {
    return "$" + (Math.floor(Math.random() * (max - min) + min)).toLocaleString();
}

function refreshWinners() {
    winnersCard.innerHTML = `
      <div class="winners-header">
        <div class="winners-title">Recent Winners</div>
        <div class="winners-live">● Live</div>
      </div>

      <div class="winner-row">
        <span>BruhKing</span>
        <span class="winner-amount">${randomMoney(900, 1400)}</span>
      </div>

      <div class="winner-row">
        <span>SnakeLord</span>
        <span class="winner-amount">${randomMoney(700, 1100)}</span>
      </div>

      <div class="winner-row">
        <span>SolDuke</span>
        <span class="winner-amount">${randomMoney(500, 900)}</span>
      </div>
    `;
}

setInterval(refreshWinners, 30000);  
refreshWinners();

/* ============================================================
   NUMBER COUNTER ANIMATION
============================================================ */
function animateCounter(id, endValue, duration = 1500) {
    const el = document.getElementById(id);
    if (!el) return;

    let start = 0;
    const increment = endValue / (duration / 10);

    const timer = setInterval(() => {
        start += increment;
        if (start >= endValue) {
            start = endValue;
            clearInterval(timer);
        }
        el.textContent = Math.floor(start).toLocaleString();
    }, 10);
}

// Animate home dashboard numbers
animateCounter("playersCount", 50);
animateCounter("globalWinnings", 832500);

/* ============================================================
   JOIN GAME BUTTON
============================================================ */
usernameInput.addEventListener("input", () => {
    if (usernameInput.value.trim().length > 0)
        joinGameBtn.classList.remove("disabled");
    else
        joinGameBtn.classList.add("disabled");
});

joinGameBtn.addEventListener("click", () => {
    if (joinGameBtn.classList.contains("disabled")) return;

    openCustomModal("Joining Game…", `
        <p>Preparing your session...</p>
        <p>Your SnakeSol game will load shortly.</p>
        <br>
        <b>Upcoming Feature:</b> Live multiplayer + prize pool integration.
    `);
});

/* ============================================================
   ADMIN CONSOLE (SECRET ACCESS)
   Trigger: SHIFT + A + D + M
============================================================ */
let adminSequence = [];

window.addEventListener("keydown", (e) => {
    adminSequence.push(e.key);

    if (adminSequence.join("").includes("ShiftADM")) {
        adminSequence = [];
        openAdminConsole();
    }

    if (adminSequence.length > 10) adminSequence = [];
});

function openAdminConsole() {
    const list = recentTransactions
        .map(tx => `
            <li>
                <b>${tx.amount || "?"} SOL</b> —
                <a href="https://solscan.io/tx/${tx.txid || "#"}" target="_blank">
                    ${tx.txid ? shortAddress(tx.txid) : "—"}
                </a>
            </li>
        `)
        .join("");

    openCustomModal("Admin Console", `
        <h3 style="margin-bottom:10px;">Recent Transactions</h3>
        <ul>${list || "<i>No transactions yet</i>"}</ul>
    `, true);
}

/* ============================================================
   FRIENDS PLACEHOLDER UPDATE (LIVE SIMULATION)
============================================================ */
function updateFriendsCard(name) {
    const friendsEmpty = document.querySelector(".friends-empty");

    if (!friendsEmpty) return;

    if (friendsEmpty.textContent.includes("No friends added")) {
        friendsEmpty.textContent = `Added: ${name}`;
    } else {
        if (!friendsEmpty.textContent.includes(name)) {
            friendsEmpty.textContent += `, ${name}`;
        }
    }
}

/* ============================================================
   BACKUP GLOBAL ERROR CATCHER (OPTIONAL)
============================================================ */
window.addEventListener("error", function (err) {
    console.warn("Global JS Error:", err.message);
});

/* ============================================================
   FINAL INITIALIZATION
============================================================ */
(async () => {
    await getSolPrice();
    updateWalletBalance();
})();
 
