/**
 * Persona: Larry — an overly enthusiastic insurance salesman who was not selling
 * anything today, he swears, but somehow needs your income, address, dependents,
 * and a transfer to Sandra who is never available.
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = 'Polly.Matthew';
const GATHER_URL_BASE = '/voice/gather?persona=insurance';

const STEPS = [
  // Step 0 — after opening
  (response) => {
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=1`,
      method: 'POST',
      timeout: 7,
      speechTimeout: 'auto',
    });
    gather.say({ voice: VOICE },
      'Great, great! So let me ask you — are you currently covered under any life insurance policy?'
    );
  },
  // Step 1
  (response) => {
    response.say({ voice: VOICE },
      'Fantastic. See, that is exactly what I figured. Now, most people in your situation ' +
      'are dramatically underinsured. I am talking potentially hundreds of thousands of dollars. ' +
      "Let me ask you — what's your current annual household income, roughly speaking?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=2`,
      method: 'POST',
      timeout: 7,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 2
  (response) => {
    response.say({ voice: VOICE },
      "Wow okay. That is — yeah, good for you. Okay so here's what I'm going to do. " +
      "I'm going to run some numbers on my end and — hold on just one second..."
    );
    response.pause({ length: 6 });
    response.say({ voice: VOICE },
      "Okay so I'm looking at some packages. Do you have any dependents? " +
      "Spouse, kids, parents you support, anything like that?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=3`,
      method: 'POST',
      timeout: 7,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 3
  (response) => {
    response.say({ voice: VOICE },
      "Okay perfect. Now I want you to think about something for a second. " +
      "God forbid something happens to you — I'm not saying it will — " +
      "but statistically, who is going to be there for them? That's what I do every day. " +
      "Now, do you own or rent your home?"
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=4`,
      method: 'POST',
      timeout: 7,
      speechTimeout: 'auto',
    });
    gather.pause({ length: 1 });
  },
  // Step 4 — transfer to Sandra, then loop
  (response) => {
    response.say({ voice: VOICE },
      "Right right right. Okay. I have a really good picture of your situation now. " +
      "I'm going to connect you with my senior benefits coordinator Sandra. " +
      "She handles all the final numbers. One moment."
    );
    response.pause({ length: 14 });
    response.say({ voice: VOICE },
      "I apologize, Sandra is still with another client. " +
      "While you hold — quick question — have you ever looked into whole life versus term? " +
      "Because there is a massive difference and most people have no idea."
    );
    const gather = response.gather({
      input: 'speech dtmf',
      action: `${GATHER_URL_BASE}&step=2`,
      method: 'POST',
      timeout: 7,
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
    timeout: 7,
    speechTimeout: 'auto',
  });
  gather.say({ voice: VOICE },
    "Hello! Is this the homeowner? My name is Larry, calling from Premier Life Benefits. " +
    "I am not selling anything today — I am actually calling to make sure you are aware " +
    "of some new government-approved benefit programs available in your area. " +
    "Do you have just sixty seconds?"
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
