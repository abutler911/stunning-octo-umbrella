/**
 * Persona: The Prince — a very formal, very legitimate representative of a
 * Nigerian royal family who needs your bank account number, social security number,
 * mother's maiden name, and a small facilitation fee. Completely above board.
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = 'Polly.Brian';
const GATHER_URL_BASE = '/voice/gather?persona=prince';

const STEPS = [
  // Step 0 — after opening
  (response) => {
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=1`,
      method: 'POST',
      timeout: 8,
      speechTimeout: 'auto',
    });
    gather.say({ voice: VOICE },
      'Ah yes, greetings. I am most pleased that you have answered. ' +
      'I must speak with you regarding a matter of extreme financial urgency. ' +
      'I am in possession of forty-seven million United States dollars which I cannot access ' +
      'due to certain political difficulties in my country. ' +
      'May I ask with whom I am speaking?'
    );
  },
  // Step 1
  (response) => {
    response.say({ voice: VOICE },
      'Excellent. I shall call you my trusted friend. Now, here is my situation. ' +
      'I require the use of a foreign bank account in which to temporarily deposit these funds. ' +
      'In exchange for your generous assistance, you shall receive fifteen percent — ' +
      'that is seven million, fifty thousand dollars — directly to your account. ' +
      'This is completely legal and above board, I assure you. ' +
      'Do you have a bank account available for this purpose?'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=2`,
      method: 'POST',
      timeout: 8,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 2
  (response) => {
    response.say({ voice: VOICE },
      'Splendid. Now, there is one small matter. ' +
      'In order to release the funds from the central bank of my country, ' +
      'I require a small facilitation fee of only fifteen hundred dollars. ' +
      'This covers the processing and the necessary paperwork with the government officials. ' +
      'You will of course receive this back plus your fifteen percent upon transfer. ' +
      'Can you tell me your account routing number so I may prepare the documentation?'
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=3`,
      method: 'POST',
      timeout: 8,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 3
  (response) => {
    response.say({ voice: VOICE },
      'I see. I must be frank with you, my trusted friend. ' +
      'I have already spoken with seven other individuals today who were not as wise as you. ' +
      'They will not be receiving fifteen percent. You, however, I can see are a person of vision. ' +
      'Now, I do also require your social security number for the international wire documentation. ' +
      'This is completely standard procedure, I assure you.'
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
  // Step 4 — loop
  (response) => {
    response.say({ voice: VOICE },
      'Ah yes, I understand your hesitation. Very wise, very wise indeed. ' +
      'Allow me to have my personal attorney, Barrister Emmanuel Okafor, contact you ' +
      'with the official documentation. He is extremely legitimate. ' +
      "What is the best number to reach you, and also your mother's maiden name " +
      'for the identity verification?'
    );
    response.pause({ length: 2 });
    response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=1`);
  },
];

function answer() {
  const response = new VoiceResponse();
  response.pause({ length: 2 });
  const gather = response.gather({
    input: 'speech dtmf',
    action: `${GATHER_URL_BASE}&step=0`,
    method: 'POST',
    timeout: 8,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE },
    'Hello. Hello, is this the residence? I am calling from Lagos, Nigeria. ' +
    'I have a matter of the utmost confidentiality and importance. Please, do not hang up.'
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
