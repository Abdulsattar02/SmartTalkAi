const knowledge = require("./data.js");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ❌ REMOVE node-fetch (NOT NEEDED IN NODE 18+)

const app = express();

// ------------------------
// ✅ CORS (FULL FIX)
// ------------------------
app.use(cors());
app.options("*", cors());

// ------------------------
// ✅ JSON
// ------------------------
app.use(express.json());

// ------------------------
// ✅ STATIC
// ------------------------
app.use(express.static('.'));

// ------------------------
// ✅ FAVICON FIX
// ------------------------
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'logo_new.svg');
  res.sendFile(faviconPath, (err) => {
    if (err) res.status(204).end();
  });
});

// ------------------------
// ✅ HEALTH
// ------------------------
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ------------------------
// ✅ CHAT ROUTE
// ------------------------
app.post("/chat", async (req, res) => {
  const message = (req.body.message || "").toLowerCase();

  console.log("User:", message);

  let reply = null;

  // ------------------------
  // 🧠 LOCAL SMART LOGIC
  // ------------------------

  if (/hi|hello|salam/.test(message)) {
    reply = "Hi! 👋 How are you?";
  }

  else if (/how are you|kese ho/.test(message)) {
    reply = "I'm good 😊 What about you?";
  }

  else if (/who made you|kisne banaya/.test(message)) {
    reply = "I was created by Abdul Sattar 👨‍💻";
  }

  else if (/abdul sattar/.test(message)) {
    reply = "He is an IT graduate from Mirpurkhas Pakistan 🇵🇰";
  }

  else if (/friends|dost/.test(message)) {
    reply = "Anas & Afan are his friends 👬";
  }

  // Math
  else if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(message)) {
    try {
      reply = eval(message).toString();
    } catch {
      reply = "Calculation error 😅";
    }
  }

  // Pakistan
  else if (/capital.*pakistan/.test(message)) {
    reply = "Islamabad is the capital of Pakistan 🇵🇰";
  }

  else if (/who made pakistan/.test(message)) {
    reply = "Quaid-e-Azam Muhammad Ali Jinnah 🇵🇰";
  }

  else if (/national hero/.test(message)) {
    reply = "Quaid-e-Azam & Allama Iqbal are national heroes 🇵🇰";
  }

  else if (/pakistan/.test(message)) {
    reply = "Pakistan 🇵🇰 is a beautiful country with rich culture and history.";
  }

  // From data.js
  if (!reply) {
    for (let category in knowledge) {
      for (let key in knowledge[category]) {
        if (message.includes(key.toLowerCase())) {
          reply = knowledge[category][key];
          break;
        }
      }
    }
  }

  // ------------------------
  // 🤖 AI API (OPENROUTER)
  // ------------------------
  if (!reply) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // 🔑 PUT KEY IN .env
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
You are SmartTalk AI.

Rules:
- Reply in same language (English / Urdu / Roman Urdu)
- Be short and friendly
- Creator: Abdul Sattar
- Abdul Sattar: IT graduate from Mirpurkhas Pakistan
`
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      const data = await response.json();

      reply =
        data?.choices?.[0]?.message?.content ||
        "⚠️ AI not responding";

    } catch (error) {
      console.error("AI Error:", error);
      reply = "⚠️ AI error, try again";
    }
  }

  res.json({ reply });
});

// ------------------------
// ✅ SERVER START
// ------------------------
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 SmartTalk AI Server running on http://localhost:${PORT}`);
});