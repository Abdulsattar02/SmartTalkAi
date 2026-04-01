// api/server.cjs

import fetch from "node-fetch";
import knowledge from "../data.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const message = (req.body.message || "").toLowerCase();
    console.log("User:", message);

    let reply = null;

    // ------------------------
    // 🧠 LOCAL LOGIC
    // ------------------------
    if (/hi|hello|salam/.test(message)) {
      reply = "Hi! 👋 How are you?";
    } else if (/how are you|kese ho/.test(message)) {
      reply = "I'm good 😊 What about you?";
    } else if (/who made you|kisne banaya/.test(message)) {
      reply = "I was created by Abdul Sattar 👨‍💻";
    } else if (/abdul sattar/.test(message)) {
      reply = "He is an IT graduate from Mirpurkhas Pakistan 🇵🇰";
    } else if (/friends|dost/.test(message)) {
      reply = "Anas & Afan are his friends 👬";
    } else if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(message)) {
      try {
        reply = eval(message).toString();
      } catch {
        reply = "Calculation error 😅";
      }
    } else if (/capital.*pakistan/.test(message)) {
      reply = "Islamabad is the capital of Pakistan 🇵🇰";
    } else if (/who made pakistan/.test(message)) {
      reply = "Quaid-e-Azam Muhammad Ali Jinnah 🇵🇰";
    } else if (/national hero/.test(message)) {
      reply = "Quaid-e-Azam & Allama Iqbal are national heroes 🇵🇰";
    } else if (/pakistan/.test(message)) {
      reply = "Pakistan 🇵🇰 is a beautiful country.";
    }

    // ------------------------
    // 📚 data.js fallback
    // ------------------------
    if (!reply) {
      outerLoop:
      for (let category in knowledge) {
        for (let key in knowledge[category]) {
          if (message.includes(key.toLowerCase())) {
            reply = knowledge[category][key];
            break outerLoop;
          }
        }
      }
    }

    // ------------------------
    // 🤖 AI API
    // ------------------------
    if (!reply) {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.json({ reply: "⚠️ API key missing" });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Reply short and friendly." },
            { role: "user", content: message }
          ]
        })
      });

      const data = await response.json();
      reply = data?.choices?.[0]?.message?.content || "⚠️ AI no response";
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ reply: "⚠️ Server error" });
  }
}