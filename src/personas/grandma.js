/**
 * Persona: Edna — a confused, hard-of-hearing grandma who just can't quite
 * figure out who's calling or why. She's very friendly, very slow, and has
 * a lot to say about her cat.
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = 'Polly.Joanna';
const GATHER_URL_BASE = '/voice/gather?persona=grandma';

// Each step is a function(response) -> void that builds TwiML on the response
const STEPS = [
  // Step 0 — called from gather callback after the opening
  (response) => {
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=1`,
      method: 'POST',
      timeout: 6,
      speechTimeout: 'auto',
    });
    gather.say({ voice: VOICE },
      'I said, WHO IS THIS? Oh dear, my hearing aid is acting up again. Can you speak louder please?'
    );
  },
  // Step 1
  (response) => {
    response.say({ voice: VOICE },
      'Oh, one moment dear. I need to put down my knitting. '
    );
    response.pause({ length: 4 });
    response.say({ voice: VOICE }, 'Now, what was that?');
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=2`,
      method: 'POST',
      timeout: 6,
      speechTimeout: 'auto',
    });
    gather.say({ voice: VOICE }, 'Speak up! I can barely hear you over the television.');
  },
  // Step 2
  (response) => {
    response.say({ voice: VOICE },
      'Oh! You know, that reminds me of my cat Mr. Whiskers. He went missing last Tuesday. ' +
      'I put up flyers all around the neighborhood. Have you seen an orange tabby? ' +
      'He answers to Mr. Whiskers, or sometimes just Mister.'
    );
    response.pause({ length: 2 });
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=3`,
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
    });
    gather.say({ voice: VOICE }, 'Hello? Are you still there?');
  },
  // Step 3
  (response) => {
    response.say({ voice: VOICE },
      'Oh goodness, I think I have another call coming in. Can you hold on just a moment?'
    );
    response.pause({ length: 8 });
    response.say({ voice: VOICE },
      'Sorry about that, it was my neighbor Dorothy. She wanted to know if I had her casserole dish. ' +
      "Now where were we? I'm sorry, who did you say you were with again?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=4`,
      method: 'POST',
      timeout: 6,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 4
  (response) => {
    response.say({ voice: VOICE },
      "I see. And you said your name was... I'm sorry, could you spell that? " +
      "My grandson says I need to write everything down. He's very smart, he works with computers. " +
      "Do you work with computers?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=5`,
      method: 'POST',
      timeout: 6,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 5 — loop back near the beginning to keep them going
  (response) => {
    response.say({ voice: VOICE },
      "Oh I see, how wonderful. You know, I need to find a pen. Hold on..."
    );
    response.pause({ length: 6 });
    response.say({ voice: VOICE },
      "I can never find a pen when I need one. My late husband Harold always kept pens everywhere. " +
      "Now I can't find a single one. Could you call back in about five minutes dear?"
    );
    response.pause({ length: 2 });
    // Loop back to step 0
    response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=0`);
  },
];

function answer() {
  const response = new VoiceResponse();
  response.pause({ length: 2 });
  const gather = response.gather({
    input: 'speech dtmf',
    action: `${GATHER_URL_BASE}&step=0`,
    method: 'POST',
    timeout: 6,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE },
    'Hello? Hello, who is this? I can barely hear you dear. Is this about my magazine subscription?'
  );
  // Fallback if no input
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
