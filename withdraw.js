// Vercel serverless function – demo only
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { wallet, amount } = req.body || {};
  if (!wallet || !amount) {
    return res.status(400).json({ error: "wallet and amount required" });
  }

  return res.status(200).json({
    success: true,
    message: "Withdrawal request received (demo only).",
    wallet,
    amount,
  });
}
