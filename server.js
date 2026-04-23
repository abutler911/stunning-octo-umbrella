require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const { getPersona, listPersonas } = require('./src/personas');
const { initiateCall } = require('./src/caller');
const logger = require('./src/logger');
const { clearConversation } = require('./src/ai');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Twilio webhooks (no auth — Twilio must reach these freely) ──────────────

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

app.post('/voice/status', (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  if (CallSid) {
    logger.endLog(CallSid, CallDuration, CallStatus);
    clearConversation(CallSid);
  }
  res.sendStatus(200);
});

// ── Basic auth — everything below this line is protected ───────────────────

if (process.env.UI_USER && process.env.UI_PASS) {
  app.use(basicAuth({
    users: { [process.env.UI_USER]: process.env.UI_PASS },
    challenge: true,
    realm: 'Spam Callback Tool',
  }));
  console.log('Basic auth enabled');
} else {
  console.warn('Warning: UI_USER / UI_PASS not set — web UI is unprotected');
}

app.use(express.static('public'));

// ── Protected API + UI routes ───────────────────────────────────────────────

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

app.get('/api/calls', (req, res) => {
  res.json(logger.getRecentLogs(50));
});

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
  console.log(`Server running on port ${port}`);
  console.log(`Web UI: http://localhost:${port}`);
  console.log(`Personas: ${listPersonas().join(', ')}`);
});
