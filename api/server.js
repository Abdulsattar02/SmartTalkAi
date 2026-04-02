export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const message = req.body.message;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(200).json({
        reply: "⚠️ API key missing"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",   // 🔥 IMPORTANT FIX
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    console.log("FULL DATA:", JSON.stringify(data, null, 2)); // DEBUG

    let reply = "⚠️ No response";

    if (data?.choices?.length > 0) {
      const msg = data.choices[0].message;

      // 🔥 SAFE EXTRACTION
      if (typeof msg === "string") {
        reply = msg;
      } else if (msg?.content) {
        reply = msg.content;
      } else if (Array.isArray(msg?.content)) {
        reply = msg.content.map(c => c.text || "").join("");
      }
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      reply: "⚠️ Server error"
    });
  }
}