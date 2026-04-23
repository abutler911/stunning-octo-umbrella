'use strict';

const form       = document.getElementById('callForm');
const callBtn    = document.getElementById('callBtn');
const statusEl   = document.getElementById('callStatus');
const callLogEl  = document.getElementById('callLog');
const refreshBtn = document.getElementById('refreshBtn');

const PERSONA_LABELS = {
  grandma:    'Edna (scripted)',
  ai:         'AI Edna',
  holdmusic:  'Hold Music',
  techsupport:'Kevin / Tech Support',
  insurance:  'Larry / Insurance',
  prince:     'The Prince',
  agent:      'Agent Johnson',
};

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function fmt(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtDuration(secs) {
  if (!secs && secs !== 0) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function badgeFor(status) {
  if (!status) return ['badge-default', 'unknown'];
  const s = status.toLowerCase();
  if (s === 'completed')                              return ['badge-ok',   s];
  if (s === 'failed' || s === 'no-answer' || s === 'canceled') return ['badge-fail', s];
  if (s === 'busy')                                   return ['badge-busy', s];
  return ['badge-default', s];
}

async function loadCalls() {
  try {
    const res  = await fetch('/api/calls');
    const logs = await res.json();

    if (!logs.length) {
      callLogEl.innerHTML = '<p class="empty">No calls yet.</p>';
      return;
    }

    const rows = logs.map(c => {
      const [cls, label] = badgeFor(c.callStatus);
      return `
        <tr>
          <td>${fmt(c.startTime)}</td>
          <td>${c.toNumber || '—'}</td>
          <td>${PERSONA_LABELS[c.persona] || c.persona || '—'}</td>
          <td class="dim">${fmtDuration(c.durationSeconds)}</td>
          <td><span class="badge ${cls}">${label}</span></td>
        </tr>`;
    }).join('');

    callLogEl.innerHTML = `
      <table>
        <thead><tr>
          <th>Time</th><th>Number</th><th>Persona</th><th>Duration</th><th>Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch {
    callLogEl.innerHTML = '<p class="empty">Failed to load calls.</p>';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const number  = document.getElementById('phoneNumber').value.trim();
  const persona = document.getElementById('persona').value;

  callBtn.disabled = true;
  showStatus('Initiating call…', 'loading');

  try {
    const res  = await fetch('/api/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, persona }),
    });
    const data = await res.json();

    if (!res.ok) {
      showStatus(`Error: ${data.error}`, 'error');
    } else {
      showStatus(`Call placed! SID: ${data.sid}  |  Status: ${data.status}`, 'success');
      setTimeout(loadCalls, 3000);
    }
  } catch (err) {
    showStatus(`Could not reach server: ${err.message}`, 'error');
  } finally {
    callBtn.disabled = false;
  }
});

refreshBtn.addEventListener('click', loadCalls);

loadCalls();
