// api/server.js
import fetch from "node-fetch";   // Node 18+ me optional, use only if needed
import knowledge from "../data.js";  // optional local logic

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const message = (req.body.message || "").toLowerCase();
    let reply = null;

    // LOCAL LOGIC
    if (/hi|hello|salam/.test(message)) reply = "Hi! 👋 How are you?";
    else if (/how are you|kese ho/.test(message)) reply = "I'm good 😊 What about you?";

    // AI CALL
    if (!reply) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }]
        })
      });

      const data = await response.json();
      reply = data?.choices?.[0]?.message?.content || "No response";
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ reply: "Server error" });
  }
}