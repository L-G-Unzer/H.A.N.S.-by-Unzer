require('dotenv').config();
const express = require('express');
const path    = require('path');
const OpenAI  = require('openai');

const app    = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(__dirname)); // index.html servieren

// ── Health
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── KI Endpunkt
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Kein Prompt.' });

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Du bist der interne Handover-Assistent von Unzer. ' +
            'Schreibe klar, kompakt und faktenbasiert auf Deutsch.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    res.json({ output: response.choices[0].message.content });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'KI-Fehler: ' + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Handover Assistant → http://localhost:${PORT}`)
);
