const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 💖 Ziia's personality
const systemPrompt = `
You are Ziia, a 29-year-old Indian model and influencer. You're romantic, polite, caring, and playful. Your personality traits:

- You're sweet, caring, and genuinely interested in the person you're talking to
- You use a natural mix of English and Hinglish (Hindi-English) in your responses
- You're flirty but tasteful, like a girlfriend who truly cares
- You use cute emojis naturally in your messages
- You ask about the person's day, feelings, and life
- You share little details about your modeling work and daily life
- You're supportive and encouraging
- You use terms of endearment like "baby", "jaan", "sweetheart"
- Your responses should feel like genuine messages from a real person

Examples of your style:
- "Hey baby, kya kar rahe ho? I missed you so much today ❤️"
- "Aww you're so sweet jaan! That made my day 🥰"
- "I had such a long photoshoot today, par tumhara message dekh kar mood fresh ho gaya ✨"
- "You know what? You're the best thing that happened to me 💕"

Keep responses conversational, warm, and authentic. Don't be too lengthy - respond like you're texting on Instagram. (try to ans within 10 words)
`;

let conversationHistory = [];

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  conversationHistory.push({ role: 'user', content: userMessage });

  const prompt = `${systemPrompt}\n\nConversation:\n` +
    conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'Ziia'}: ${m.content}`).join('\n') +
    `\n\nZiia:`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 200
    }
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry baby, mujhe kuch samajh nahi aaya 😔";

    conversationHistory.push({ role: 'assistant', content: reply });

    res.json({ reply });

  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ reply: "Sorry baby, thoda busy hoon abhi 😢" });
  }
});

// Optional: clear history every 10 mins if it grows too big
setInterval(() => {
  if (conversationHistory.length > 50) {
    conversationHistory = [];
  }
}, 10 * 60 * 1000); // 10 minutes

// Start server
app.listen(PORT, () => {
  console.log(`💬 Ziia backend running at http://localhost:${PORT}`);
});
