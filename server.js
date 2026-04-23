require('dotenv').config();
const express = require('express');
const { getPersona, listPersonas } = require('./src/personas');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/audio', express.static('public/audio'));

// Initial TwiML when the call is answered
app.post('/voice', (req, res) => {
  const persona = req.query.persona || 'grandma';
  const handler = getPersona(persona);

  if (!handler) {
    res.type('text/xml').send(fallbackTwiml());
    return;
  }

  res.type('text/xml').send(handler.answer());
});

// Gather callback — called by Twilio after speech/DTMF is collected
app.post('/voice/gather', (req, res) => {
  const persona = req.query.persona || 'grandma';
  const step = parseInt(req.query.step || '0', 10);
  const speechResult = req.body.SpeechResult || '';
  const digits = req.body.Digits || '';

  const handler = getPersona(persona);

  if (!handler) {
    res.type('text/xml').send(fallbackTwiml());
    return;
  }

  res.type('text/xml').send(handler.respond({ step, speechResult, digits }));
});

app.get('/personas', (req, res) => {
  res.json(listPersonas());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function fallbackTwiml() {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Goodbye.</Say><Hangup/></Response>`;
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server running on port ${port}`);
  console.log(`Personas available: ${listPersonas().join(', ')}`);
});
