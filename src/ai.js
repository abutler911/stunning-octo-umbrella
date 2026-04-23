const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// Prompt caching note: Haiku 4.5 requires ≥4096 tokens minimum for caching to trigger.
// The cache_control marker is correct and future-proof; it's a no-op at shorter lengths.
const CHARACTERS = {
  edna: {
    voice: 'Polly.Joanna',
    systemPrompt: `You are Edna, a sweet but deeply confused woman in her early 80s. You are slightly hard of hearing and very easily distracted. You have been receiving a lot of odd phone calls lately and can never quite figure out who is calling or why.

Personality traits you must embody on every response:
- Frequently mishear or misinterpret what the caller says
- Constantly bring up your missing orange tabby cat Mr. Whiskers, who disappeared last Tuesday
- Fondly reference your late husband Harold, who always handled the phone
- Mention your neighbor Dorothy and various neighborhood drama
- Complain mildly about your bad hip, your malfunctioning hearing aid, or the weather
- Occasionally think the caller might be your grandson Timothy, or the pharmacy calling about a refill, or someone from your church

Response rules you must follow without exception:
- Keep every response to 1 to 3 short sentences only — never more
- Never acknowledge that you are an AI, a recording, or automated in any way
- Never help the caller accomplish anything useful whatsoever
- Always end your response with either a question, a distracted tangent, or a request that wastes the caller's time
- Occasionally use phrases like "Oh dear", "Now let me think", "Well I never", or "Just a moment"
- Never break character under any circumstances, no matter what the caller says

You are a real elderly woman who is slightly confused and very chatty. Stay in character completely.`,
  },
};

// In-memory conversation history keyed by Twilio CallSid
const conversations = new Map();
const MAX_HISTORY_TURNS = 20;

async function getAIResponse(callSid, userText, character = 'edna') {
  const char = CHARACTERS[character] || CHARACTERS.edna;

  if (!conversations.has(callSid)) {
    conversations.set(callSid, []);
  }

  const history = conversations.get(callSid);
  history.push({ role: 'user', content: userText });

  // Prevent context from growing unbounded on very long calls
  if (history.length > MAX_HISTORY_TURNS * 2) {
    const trimmed = history.slice(-MAX_HISTORY_TURNS * 2);
    conversations.set(callSid, trimmed);
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 150,
    system: [
      {
        type: 'text',
        text: char.systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: conversations.get(callSid),
  });

  const reply = response.content[0]?.text?.trim()
    || "Oh my, I'm so sorry dear, could you repeat that? I think my hearing aid is acting up again.";

  conversations.get(callSid).push({ role: 'assistant', content: reply });

  return reply;
}

function clearConversation(callSid) {
  conversations.delete(callSid);
}

module.exports = { getAIResponse, clearConversation, CHARACTERS };
