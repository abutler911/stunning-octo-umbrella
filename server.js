require('dotenv').config();
const express = require('express');
const { getPersona, listPersonas } = require('./src/personas');
const { initiateCall } = require('./src/caller');
const logger = require('./src/logger');
const { clearConversation } = require('./src/ai');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Initial TwiML when the call is answered
app.post('/voice', async (req, res) => {
  const persona = req.query.persona || 'grandma';
  const callSid = req.body.CallSid;
  const handler = getPersona(persona);

  if (!handler) {
    res.type('text/xml').send(fallbackTwiml());
    return;
  }

  if (callSid) {
    logger.startLog(callSid, req.body.To, persona);
  }

  try {
    const twiml = await handler.answer();
    res.type('text/xml').send(twiml);
  } catch (err) {
    console.error('Answer error:', err.message);
    res.type('text/xml').send(fallbackTwiml());
  }
});

// Gather callback — Twilio posts here after speech/DTMF is collected
app.post('/voice/gather', async (req, res) => {
  const persona = req.query.persona || 'grandma';
  const step = parseInt(req.query.step || '0', 10);
  const speechResult = req.body.SpeechResult || '';
  const digits = req.body.Digits || '';
  const callSid = req.body.CallSid;
  const handler = getPersona(persona);

  if (!handler) {
    res.type('text/xml').send(fallbackTwiml());
    return;
  }

  if (callSid && speechResult) {
    logger.addTranscriptEntry(callSid, 'caller', speechResult);
  }

  try {
    const twiml = await handler.respond({ step, speechResult, digits, callSid });
    res.type('text/xml').send(twiml);
  } catch (err) {
    console.error('Respond error:', err.message);
    res.type('text/xml').send(fallbackTwiml());
  }
});

// Twilio status callback — fires when call ends
app.post('/voice/status', (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  if (CallSid) {
    logger.endLog(CallSid, CallDuration, CallStatus);
    clearConversation(CallSid);
  }
  res.sendStatus(200);
});

// API: initiate a call from the web UI
app.post('/api/call', async (req, res) => {
  const { number, persona } = req.body;
  const publicUrl = process.env.PUBLIC_URL;

  if (!publicUrl) {
    return res.status(500).json({ error: 'PUBLIC_URL not set in .env' });
  }
  if (!number) {
    return res.status(400).json({ error: 'number is required' });
  }
  if (!listPersonas().includes(persona)) {
    return res.status(400).json({ error: `Unknown persona. Available: ${listPersonas().join(', ')}` });
  }

  try {
    const call = await initiateCall(number, persona, publicUrl);
    res.json({ sid: call.sid, status: call.status, number, persona });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: recent call logs
app.get('/api/calls', (req, res) => {
  res.json(logger.getRecentLogs(50));
});

// API: available personas
app.get('/api/personas', (req, res) => {
  res.json(listPersonas());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', personas: listPersonas() });
});

function fallbackTwiml() {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Goodbye.</Say><Hangup/></Response>`;
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server running on port ${port}`);
  console.log(`Web UI: http://localhost:${port}`);
  console.log(`Personas: ${listPersonas().join(', ')}`);
});
