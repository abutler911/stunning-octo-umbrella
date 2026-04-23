const twilio = require('twilio');

function getClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env');
  }
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

async function initiateCall(toNumber, persona, publicUrl) {
  const client = getClient();
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!from) {
    throw new Error('TWILIO_FROM_NUMBER must be set in .env');
  }

  const webhookUrl = `${publicUrl}/voice?persona=${encodeURIComponent(persona)}`;

  return client.calls.create({
    to: toNumber,
    from,
    url: webhookUrl,
    method: 'POST',
    statusCallback: `${publicUrl}/voice/status`,
    statusCallbackMethod: 'POST',
  });
}

module.exports = { initiateCall };
