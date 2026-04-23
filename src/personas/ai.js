/**
 * Persona: AI Edna — same confused grandma character as grandma.js but powered
 * by Claude (claude-haiku-4-5) so she actually reacts to what the scammer says.
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const { getAIResponse } = require('../ai');

const VOICE = 'Polly.Joanna';
const GATHER_URL_BASE = '/voice/gather?persona=ai';

function answer() {
  const response = new VoiceResponse();
  response.pause({ length: 2 });
  const gather = response.gather({
    input: 'speech',
    action: `${GATHER_URL_BASE}&step=0`,
    method: 'POST',
    timeout: 6,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE },
    'Hello? Hello, who is this? I can barely hear you dear. Is this about my magazine subscription?'
  );
  response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=0`);
  return response.toString();
}

async function respond({ step, speechResult, callSid }) {
  const response = new VoiceResponse();

  let replyText = "Oh my, I'm so sorry. I didn't quite catch that. Could you speak up a little?";

  if (speechResult && callSid) {
    try {
      replyText = await getAIResponse(callSid, speechResult, 'edna');
    } catch (err) {
      console.error('AI persona error:', err.message);
    }
  }

  const gather = response.gather({
    input: 'speech',
    action: `${GATHER_URL_BASE}&step=${step + 1}`,
    method: 'POST',
    timeout: 6,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE }, replyText);
  response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=${step + 1}`);

  return response.toString();
}

module.exports = { answer, respond };
