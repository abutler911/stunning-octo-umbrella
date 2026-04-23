/**
 * Persona: Kevin from Tech Support — an overly enthusiastic fake tech support
 * agent who asks callers to verify every possible piece of information very
 * slowly, then escalates to a supervisor who never arrives.
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = 'Polly.Joey';
const GATHER_URL_BASE = '/voice/gather?persona=techsupport';

const STEPS = [
  // Step 0 — after opening greeting
  (response) => {
    response.say({ voice: VOICE },
      'Great! I am happy to assist you today. Before we get started, ' +
      'I need to verify your account. Could you please provide me with your full name?'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=1`,
      method: 'POST',
      timeout: 7,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 1
  (response) => {
    response.say({ voice: VOICE },
      "I'm sorry, could you spell that for me? We need the exact spelling for our records. " +
      "Please say each letter slowly."
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
    response.say({ voice: VOICE },
      "Thank you. And for security purposes, I will need your date of birth, " +
      "your mother's maiden name, and the last four digits of your social security number. " +
      "Please go ahead."
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
      "I see. One moment please, I am pulling up your account."
    );
    response.pause({ length: 6 });
    response.say({ voice: VOICE },
      "Hmm. I am having some trouble locating your account. " +
      "Could you verify the email address associated with the account?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=4`,
      method: 'POST',
      timeout: 8,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 4
  (response) => {
    response.say({ voice: VOICE },
      "I apologize, I am still unable to locate the account. " +
      "I am going to need to escalate this to my supervisor. Please hold for just one moment."
    );
    response.pause({ length: 12 });
    response.say({ voice: VOICE },
      "I am so sorry, my supervisor is currently assisting another customer. " +
      "While you wait, can you tell me what operating system you are running?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=5`,
      method: 'POST',
      timeout: 7,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 5
  (response) => {
    response.say({ voice: VOICE },
      "I see. And when did you first notice this issue? Please be as specific as possible, " +
      "as our engineers will need detailed logs."
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=6`,
      method: 'POST',
      timeout: 8,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 6 — loop with supervisor escalation
  (response) => {
    response.say({ voice: VOICE },
      "Thank you. I am now attempting to connect you with my supervisor again. Please hold."
    );
    response.pause({ length: 15 });
    response.say({ voice: VOICE },
      "I sincerely apologize for the wait. My supervisor had to step away briefly. " +
      "He will be available in approximately two minutes. " +
      "In the meantime, can I place you on a brief hold?"
    );
    response.pause({ length: 1 });
    // Loop back
    response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=3`);
  },
];

function answer() {
  const response = new VoiceResponse();
  response.pause({ length: 1 });
  const gather = response.gather({
    input: 'speech dtmf',
    action: `${GATHER_URL_BASE}&step=0`,
    method: 'POST',
    timeout: 7,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE },
    'Thank you for calling Windows Technical Support, this is Kevin speaking. ' +
    'How may I assist you today?'
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
