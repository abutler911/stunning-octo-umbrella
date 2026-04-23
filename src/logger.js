const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logPath(callSid) {
  return path.join(LOG_DIR, `${callSid}.json`);
}

function startLog(callSid, toNumber, persona) {
  ensureLogDir();
  const entry = {
    callSid,
    toNumber: toNumber || null,
    persona,
    startTime: new Date().toISOString(),
    endTime: null,
    durationSeconds: null,
    callStatus: null,
    transcript: [],
  };
  try {
    fs.writeFileSync(logPath(callSid), JSON.stringify(entry, null, 2));
  } catch (err) {
    console.error('Logger startLog error:', err.message);
  }
}

function addTranscriptEntry(callSid, speaker, text) {
  try {
    const filePath = logPath(callSid);
    if (!fs.existsSync(filePath)) return;
    const log = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log.transcript.push({ speaker, text, timestamp: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error('Logger addTranscriptEntry error:', err.message);
  }
}

function endLog(callSid, durationSeconds, callStatus) {
  try {
    const filePath = logPath(callSid);
    if (!fs.existsSync(filePath)) return;
    const log = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log.endTime = new Date().toISOString();
    log.durationSeconds = durationSeconds ? parseInt(durationSeconds, 10) : null;
    log.callStatus = callStatus || null;
    fs.writeFileSync(filePath, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error('Logger endLog error:', err.message);
  }
}

function getRecentLogs(limit = 50) {
  ensureLogDir();
  try {
    return fs.readdirSync(LOG_DIR)
      .filter(f => f.endsWith('.json') && f !== '.gitkeep')
      .sort()
      .reverse()
      .slice(0, limit)
      .map(f => {
        try {
          return JSON.parse(fs.readFileSync(path.join(LOG_DIR, f), 'utf8'));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

module.exports = { startLog, addTranscriptEntry, endLog, getRecentLogs };
