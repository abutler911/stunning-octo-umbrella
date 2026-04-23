const grandma = require('./grandma');
const holdmusic = require('./holdmusic');
const techsupport = require('./techsupport');

const registry = {
  grandma,
  holdmusic,
  techsupport,
};

function getPersona(name) {
  return registry[name] || null;
}

function listPersonas() {
  return Object.keys(registry);
}

module.exports = { getPersona, listPersonas };
