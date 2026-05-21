import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html, etc.)

// OpenRouter API handler (converted from api/server.js)
app.post('/api/server', async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(200).json({
        reply: '⚠️ Add OPENROUTER_API_KEY to .env file'
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        // Conversation-quality prompting: keep responses direct and context-aware.
        messages: [
          {
            role: 'system',
            content:
              'You are SmartTalk AI, a helpful conversational assistant. ' +
              'Respond in a natural, human-like way. ' +
              'Do NOT ask generic clarifying questions unless the user explicitly needs missing critical information. ' +
              'When the user requests a rewrite, improvement, or a “proper/professional version”, treat it as a refinement of the immediately preceding relevant content and produce the improved output directly. ' +
              'Maintain conversational context across turns: if the user continues the same task, keep the same topic and format. ' +
              'Avoid tutorial-style explanations. Do not begin with introductions like “Sure, here is”. ' +
              'Be concise by default; only add extra explanation if the user asks for it or if it materially improves the deliverable. ' +
              'If the user asks for content (e.g., an application letter), generate the content directly.'
          },
          { role: 'user', content: message }
        ],
      }),
    });


    const data = await response.json();
    console.log('OpenRouter response:', data);

    let reply = '⚠️ No response';

    if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ reply: '⚠️ Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('✅ Chat: POST /api/server');
  console.log('ℹ️  Set OPENROUTER_API_KEY in .env');
});

