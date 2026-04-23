/**
 * Persona: Agent Johnson — a very serious fraud division agent from the Social
 * Security Administration who speaks in a slow, methodical cadence, requests
 * every piece of identifying information imaginable, and has a supervisor who
 * is permanently in a briefing.
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = 'Polly.Matthew';
const GATHER_URL_BASE = '/voice/gather?persona=agent';

const STEPS = [
  // Step 0 — after opening
  (response) => {
    response.say({ voice: VOICE }, 'I see. And can you spell your last name for me please. Slowly.');
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=1`,
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 1
  (response) => {
    response.say({ voice: VOICE }, 'I see. Hold please.');
    response.pause({ length: 8 });
    response.say({ voice: VOICE },
      'I am going to need you to verify your date of birth. Month, day, and year.'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=2`,
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 2
  (response) => {
    response.say({ voice: VOICE }, 'Thank you. One moment.');
    response.pause({ length: 10 });
    response.say({ voice: VOICE },
      'I am cross-referencing that with our database. ' +
      'Can you confirm your current address, including zip code?'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=3`,
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 3
  (response) => {
    response.say({ voice: VOICE },
      'I see. That does not match what we have on file. ' +
      'I am going to need to escalate this to my supervisor. Please hold.'
    );
    response.pause({ length: 16 });
    response.say({ voice: VOICE },
      'My supervisor is currently in a briefing. ' +
      'Your case has been flagged. Please do not leave your current location. ' +
      'Can you confirm whether you have ever held a federal security clearance?'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=4`,
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 4 — case number loop
  (response) => {
    response.say({ voice: VOICE },
      'I see. I need to inform you that this call is being recorded ' +
      'and may be used in any subsequent proceedings. ' +
      'I am going to read you a case reference number. Please write this down.'
    );
    response.pause({ length: 3 });
    response.say({ voice: VOICE },
      'Case number: Alpha. Seven. Seven. Niner. Foxtrot. Two. Six. Eight. ' +
      'Do you have that?'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=1`,
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
];

function answer() {
  const response = new VoiceResponse();
  response.pause({ length: 1 });
  const gather = response.gather({
    input: 'speech dtmf',
    action: `${GATHER_URL_BASE}&step=0`,
    method: 'POST',
    timeout: 8,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE },
    'Hello. This is Agent Johnson calling from the Social Security Administration, ' +
    'fraud division. This is not a sales call. ' +
    'We have detected suspicious activity associated with your Social Security number ' +
    'and your account has been temporarily suspended pending verification. ' +
    'Can I have your full legal name please?'
  );
  response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=0`);
  return response.toString();
}

function respond({ step }) {
  const response = new VoiceResponse();
  const stepIndex = Math.min(step, STEPS.length - 1);
  STEPS[stepIndex](response);
  return response.toString();
}

module.exports = { answer, respond };
