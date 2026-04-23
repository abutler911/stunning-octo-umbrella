/**
 * Persona: Infinite Hold — answers as a call center, immediately puts the
 * caller on hold, and loops elevator-style hold music (or TTS filler) forever.
 * Periodically breaks in with "your call is very important to us."
 */
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = 'Polly.Matthew';
const GATHER_URL_BASE = '/voice/gather?persona=holdmusic';

// Public domain / royalty-free hold music hosted on Twilio's demo CDN
const HOLD_MUSIC_URL = 'http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3';

const HOLD_MESSAGES = [
  'Your call is very important to us. Please continue to hold and a representative will be with you shortly.',
  'We apologize for the extended wait time. Your call will be answered in the order it was received.',
  'Did you know you can reach us online at our website? However, please continue to hold for the next available agent.',
  'We appreciate your patience. You are currently number... one... in the queue.',
  'Thank you for holding. We are experiencing higher than normal call volume. Please do not hang up.',
];

let messageIndex = 0;

function getNextMessage() {
  const msg = HOLD_MESSAGES[messageIndex % HOLD_MESSAGES.length];
  messageIndex++;
  return msg;
}

function answer() {
  const response = new VoiceResponse();
  response.say({ voice: VOICE },
    'Thank you for calling. All of our representatives are currently assisting other customers. ' +
    'Your call is very important to us. Please hold and the next available agent will be right with you.'
  );
  response.pause({ length: 1 });
  // Play hold music for 30 seconds then loop back
  response.play({ loop: 1 }, HOLD_MUSIC_URL);
  response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=0`);
  return response.toString();
}

function respond({ step }) {
  const response = new VoiceResponse();
  const stepMod = step % 3;

  if (stepMod === 0) {
    response.say({ voice: VOICE }, getNextMessage());
    response.pause({ length: 2 });
    response.play({ loop: 1 }, HOLD_MUSIC_URL);
    response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=${step + 1}`);
  } else if (stepMod === 1) {
    // Occasionally act like you're about to answer
    response.say({ voice: VOICE },
      'It looks like an agent is almost available. Please continue to hold just a moment longer.'
    );
    response.pause({ length: 3 });
    response.play({ loop: 1 }, HOLD_MUSIC_URL);
    response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=${step + 1}`);
  } else {
    response.play({ loop: 1 }, HOLD_MUSIC_URL);
    response.redirect({ method: 'POST' }, `${GATHER_URL_BASE}&step=${step + 1}`);
  }

  return response.toString();
}

module.exports = { answer, respond };
