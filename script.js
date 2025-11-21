/* ============================================================
   WEB3 + FIREBASE REAL DEPOSIT LOGIC
============================================================ */

// 🔥 CONFIG: BUYER SOL ADDRESS (where all deposits must go)
const RECEIVER_ADDRESS = "HTUduW42xDZNiVf9NejQSCms9YqCDHgD1sdfeUEvtrHo";

// 🔥 Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ============================================================
   PHANTOM WALLET DETECTION
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

/* ============================================================
   REAL SOLANA DEPOSIT FUNCTION
============================================================ */

async function depositSOL() {
  try {
    const provider = window.phantom?.solana;

    if (!provider) {
      alert("Phantom wallet is required.");
      return;
    }

    // Get Amount
    const amountInput = document.getElementById("depositInput");
    let amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < 1) {
      alert("Minimum deposit is 1 SOL.");
      return;
    }

    // Convert to lamports
    const lamports = amount * 1_000_000_000;

    // Ensure wallet connected
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
        lamports: lamports,
      })
    );

    transaction.feePayer = new solanaWeb3.PublicKey(publicKey);
    let blockhashObj = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhashObj.blockhash;

    // SIGN & SEND
    const signedTx = await provider.signTransaction(transaction);
    const txSignature = await connection.sendRawTransaction(signedTx.serialize());

    console.log("TX Sent:", txSignature);

    // Save to Firebase DB
    saveDeposit(publicKey, amount, txSignature);

    alert(`Deposit successful! TX: ${txSignature}`);

  } catch (err) {
    console.error("Deposit error:", err);
    alert("Transaction failed.");
  }
}

/* ============================================================
   SAVE DEPOSIT TO FIREBASE
============================================================ */

function saveDeposit(sender, amount, signature) {
  const depositRef = push(ref(db, "deposits/"));

  set(depositRef, {
    sender: sender,
    amount: amount,
    signature: signature,
    status: "pending",
    timestamp: Date.now()
  });
}

/* ============================================================
   BUTTON WIRING
============================================================ */

document.getElementById("depositBtn").addEventListener("click", depositSOL);

