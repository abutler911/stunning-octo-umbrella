const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

function buildResponse(fn) {
  const response = new VoiceResponse();
  fn(response);
  return response.toString();
}

function say(text, voiceOptions = {}) {
  return (response) => {
    response.say({ voice: 'Polly.Joanna', language: 'en-US', ...voiceOptions }, text);
  };
}

function pause(seconds = 3) {
  return (response) => {
    response.pause({ length: seconds });
  };
}

function gatherSpeech(action, timeoutSecs = 5) {
  return (response, innerFn) => {
    const gather = response.gather({
      input: 'speech dtmf',
      action,
      method: 'POST',
      timeout: timeoutSecs,
      speechTimeout: 'auto',
    });
    if (innerFn) innerFn(gather);
  };
}

function redirect(url) {
  return (response) => {
    response.redirect({ method: 'POST' }, url);
  };
}

module.exports = { buildResponse, say, pause, gatherSpeech, redirect };
