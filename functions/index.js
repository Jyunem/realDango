const functions = require('firebase-functions');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });

const API_KEY = functions.config().openai.key;

exports.chatGPT = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { messages, parameters = {} } = req.body;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, ...parameters }),
      });
      const data = await response.json();
      if (data?.error?.message) {
        throw new Error(data.error.message);
      }
      res.json({ message: data.choices[0].message.content.trim() });
    } catch (error) {
      res.status(500).send(error.toString());
    }
  });
});
