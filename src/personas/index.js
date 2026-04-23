const grandma = require('./grandma');
const holdmusic = require('./holdmusic');
const techsupport = require('./techsupport');
const ai = require('./ai');
const insurance = require('./insurance');
const prince = require('./prince');
const agent = require('./agent');

const registry = {
  grandma,
  holdmusic,
  techsupport,
  ai,
  insurance,
  prince,
  agent,
};

function getPersona(name) {
  return registry[name] || null;
}

function listPersonas() {
  return Object.keys(registry);
}

module.exports = { getPersona, listPersonas };
