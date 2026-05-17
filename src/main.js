// ═══════════════════════════════════════════
// OMEGA — Main Application
// ═══════════════════════════════════════════
import './style.css';
import './firebase.js';
import { TacticalField } from './field.js';
import { predict } from './gemini.js';
import { fetchLiveMatches, matchToState } from './cricbuzz.js';

// ─── State ───
// Priority: localStorage override > .env > empty
let geminiKey = localStorage.getItem('omega_gemini') || import.meta.env.VITE_GEMINI_KEY || '';
let tacticalField = null;
let liveMatches = [];

import { auth } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";

// ─── Auth State ───
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const navBtn = document.getElementById('nav-setup');
  if (user) {
    navBtn.textContent = 'Sign Out';
  } else {
    navBtn.textContent = 'Login';
  }
});

// ─── Navigation ───
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'warroom' && !tacticalField) {
    tacticalField = new TacticalField('tactical-field');
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    const isActive = b.dataset.tab === tabName;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive);
  });
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
}
document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});

document.getElementById('enter-warroom').addEventListener('click', () => {
  if (!currentUser) { openAuthModal(); return; }
  showPage('warroom');
  loadLiveMatches();
});
document.getElementById('quick-predict').addEventListener('click', () => {
  if (!currentUser) { openAuthModal(); return; }
  showPage('warroom');
  switchTab('manual');
  loadLiveMatches();
});
document.getElementById('back-to-landing').addEventListener('click', () => showPage('landing'));

// ─── Clock ───
function tick() {
  const d = new Date();
  const t = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const el = document.getElementById('wr-clock');
  if (el) el.textContent = t;
}
setInterval(tick, 1000); tick();

// ─── Auth Modal ───
function openAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { 
  document.getElementById('auth-modal').classList.add('hidden'); 
  document.getElementById('auth-error').textContent = '';
}

document.getElementById('nav-setup').addEventListener('click', (e) => { 
  e.preventDefault(); 
  if (currentUser) {
    signOut(auth);
  } else {
    openAuthModal(); 
  }
});

document.getElementById('wr-signout').addEventListener('click', () => {
  if (currentUser) {
    signOut(auth).then(() => showPage('landing'));
  }
});

// Settings Modal Logic
function openSettingsModal() { document.getElementById('setup-modal').classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('setup-modal').classList.add('hidden'); }

document.getElementById('wr-settings').addEventListener('click', openSettingsModal);
document.getElementById('modal-close').addEventListener('click', closeSettingsModal);
document.querySelector('#setup-modal .modal-backdrop').addEventListener('click', closeSettingsModal);

document.getElementById('auth-close').addEventListener('click', closeAuthModal);
document.querySelector('#auth-modal .modal-backdrop').addEventListener('click', closeAuthModal);

document.getElementById('save-gemini').addEventListener('click', () => {
  const v = document.getElementById('gemini-key').value.trim();
  if (v) {
    geminiKey = v; 
    localStorage.setItem('omega_gemini', v);
    document.getElementById('gemini-key').value = '••••••••••';
    showKeyStatus('gemini-status', 'Key Saved Successfully ✓', 'ok');
  }
});

// Systems Diagnostics Protocol
document.getElementById('btn-run-diagnostics').addEventListener('click', async () => {
  const cricEl = document.getElementById('diag-cricbuzz');
  const gemEl = document.getElementById('diag-gemini');
  const fireEl = document.getElementById('diag-firebase');

  cricEl.textContent = 'TESTING...'; cricEl.style.color = 'var(--text-3)';
  gemEl.textContent = 'TESTING...'; gemEl.style.color = 'var(--text-3)';
  fireEl.textContent = 'TESTING...'; fireEl.style.color = 'var(--text-3)';

  // 1. Test Cricbuzz Scraping via proxy
  try {
    const matches = await fetchLiveMatches();
    if (matches && matches.length >= 0) {
      cricEl.textContent = 'ONLINE ✓'; cricEl.style.color = 'var(--green)';
    } else {
      throw new Error('No match data returned');
    }
  } catch (err) {
    cricEl.textContent = 'FAILED ✕'; cricEl.style.color = 'var(--red)';
  }

  // 2. Test Gemini Connection
  try {
    const k = geminiKey || import.meta.env.VITE_GEMINI_KEY;
    if (!k) throw new Error('No key configured');
    
    // Perform lightweight health-check / ping request to Gemini API
    const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${k}`;
    const res = await fetch(pingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with OK' }] }]
      })
    });
    if (res.ok) {
      gemEl.textContent = 'CONNECTED ✓'; gemEl.style.color = 'var(--green)';
    } else {
      throw new Error('API rejection');
    }
  } catch (err) {
    gemEl.textContent = 'FAILED ✕'; gemEl.style.color = 'var(--red)';
  }

  // 3. Test Firebase SDK
  try {
    if (auth && auth.app) {
      fireEl.textContent = 'INITIALIZED ✓'; fireEl.style.color = 'var(--green)';
    } else {
      throw new Error('SDK missing app configuration');
    }
  } catch (err) {
    fireEl.textContent = 'FAILED ✕'; fireEl.style.color = 'var(--red)';
  }
});

// Auth Form Logic
let isSignUp = false;
const authForm = document.getElementById('auth-form');
const authSwitch = document.getElementById('auth-switch-mode');
const authError = document.getElementById('auth-error');

authSwitch.addEventListener('click', (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  document.getElementById('btn-email-login').textContent = isSignUp ? 'Initialize Protocol' : 'Sign In';
  document.getElementById('auth-mode-text').textContent = isSignUp ? 'Already a commander?' : 'Need access?';
  authSwitch.textContent = isSignUp ? 'Sign In' : 'Initialize Protocol (Sign Up)';
  authError.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  
  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    closeAuthModal();
    showPage('warroom');
    loadLiveMatches();
  } catch (error) {
    authError.textContent = error.message.replace('Firebase:', '').trim();
  }
});

document.getElementById('btn-google-login').addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    closeAuthModal();
    showPage('warroom');
    loadLiveMatches();
  } catch (error) {
    authError.textContent = error.message.replace('Firebase:', '').trim();
  }
});
function showKeyStatus(id, msg, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.className = `key-status ${cls}`;
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// Init key indicators
if (geminiKey) showKeyStatus('gemini-status', 'Key saved', 'ok');


// ─── Live Matches ───
async function loadLiveMatches() {
  const container = document.getElementById('live-matches');
  container.innerHTML = '<div class="match-list-empty"><div class="loader-ring" style="width:32px;height:32px;border-width:2px;"></div><p>Fetching matches from Cricbuzz...</p></div>';

  liveMatches = await fetchLiveMatches();
  if (liveMatches.length === 0) {
    container.innerHTML = '<div class="match-list-empty"><p>No matches available right now</p><button id="refresh-matches-2" class="btn-ghost">↻ Try Again</button></div>';
    document.getElementById('refresh-matches-2')?.addEventListener('click', loadLiveMatches);
    return;
  }

  // Group matches
  const live = liveMatches.filter(m => m.isLive);
  const ipl = liveMatches.filter(m => m.isIPL && !m.isLive);
  const t20 = liveMatches.filter(m => m.matchType === 't20' && !m.isIPL && !m.isLive);
  const other = liveMatches.filter(m => m.matchType !== 't20' && !m.isIPL && !m.isLive);

  let html = '';

  const renderGroup = (title, badge, matches, badgeClass) => {
    if (matches.length === 0) return '';
    let group = `<div class="match-group-label"><span class="mg-badge ${badgeClass}">${badge}</span> ${title}</div>`;
    matches.forEach((m) => {
      const idx = liveMatches.indexOf(m);
      const scoreText = m.scores.map(s => `${s.team}: ${s.runs}/${s.wickets} (${s.overs})`).join(' • ');
      const typeBadge = m.matchType ? `<span class="mc-type">${m.matchType.toUpperCase()}</span>` : '';
      group += `
        <div class="match-card" data-idx="${idx}">
          <div class="mc-top-row">
            <div class="mc-status ${m.isLive ? 'live' : 'completed'}">${m.isLive ? '● LIVE' : m.matchEnded ? 'COMPLETED' : 'UPCOMING'}</div>
            ${typeBadge}
          </div>
          <div class="mc-teams">${m.teamA} vs ${m.teamB}</div>
          <div class="mc-score">${scoreText || 'Score unavailable'}</div>
          ${m.status ? `<div class="mc-result">${m.status}</div>` : ''}
          <div class="mc-venue">${m.venue || ''}</div>
        </div>`;
    });
    return group;
  };

  html += renderGroup('Live Now', '●', live, 'badge-live');
  html += renderGroup('IPL', 'IPL', ipl, 'badge-ipl');
  html += renderGroup('T20 Matches', 'T20', t20, 'badge-t20');
  html += renderGroup('Other Matches', 'ALL', other, 'badge-other');

  if (!html) {
    html = '<div class="match-list-empty"><p>No matches found</p></div>';
  }

  html += '<div style="padding:8px;text-align:center;"><button id="refresh-matches-2" class="btn-ghost" style="width:100%;">↻ Refresh Matches</button></div>';
  container.innerHTML = html;

  document.getElementById('refresh-matches-2')?.addEventListener('click', loadLiveMatches);
  container.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.match-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const match = liveMatches[parseInt(card.dataset.idx)];
      const state = matchToState(match);
      runPrediction(state);
    });
  });
}
document.getElementById('refresh-matches')?.addEventListener('click', loadLiveMatches);

// ─── Manual Form ───
document.getElementById('match-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) { openAuthModal(); return; }
  const state = {
    innings: document.getElementById('f-innings').value,
    battingTeam: document.getElementById('f-batting').value,
    bowlingTeam: document.getElementById('f-bowling').value,
    score: document.getElementById('f-score').value,
    wickets: document.getElementById('f-wickets').value,
    overs: document.getElementById('f-overs').value,
    target: document.getElementById('f-target').value,
    striker: document.getElementById('f-striker').value,
    nonStriker: document.getElementById('f-nonstriker').value,
    bowler: document.getElementById('f-bowler').value,
    bowlerType: document.getElementById('f-bowlertype').value,
    venue: document.getElementById('f-venue').value,
    dew: document.getElementById('f-dew').value,
    context: document.getElementById('f-context').value,
  };
  runPrediction(state);
});

// ─── Prediction Engine ───
async function runPrediction(state) {
  showView('loading');
  try {
    const result = await predict(geminiKey, state);
    renderPrediction(result, state);
    showView('result');
  } catch (err) {
    console.error(err);
    document.getElementById('prediction-error').innerHTML = `
      <div class="error-content">
        <h3>Analysis Failed</h3>
        <p>${err.message}</p>
      </div>`;
    showView('error');
  }
}

function showView(view) {
  ['prediction-idle', 'prediction-loading', 'prediction-result', 'prediction-error'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', !id.includes(view));
  });
}

// ─── Render Prediction ───
function renderPrediction(data, state) {
  // Header
  const mc = data.match_context || {};
  const se = data.system_energy || {};
  document.getElementById('pred-header').innerHTML = `
    <div class="ph-team">
      <div class="ph-team-name">${state.battingTeam || 'BATTING'}</div>
      <div class="ph-score">${state.score || 0}/${state.wickets || 0}</div>
      <div class="ph-overs">${state.overs || 0} ov</div>
    </div>
    <div class="ph-vs">vs</div>
    <div class="ph-team">
      <div class="ph-team-name">${state.bowlingTeam || 'BOWLING'}</div>
      <div class="ph-score">${state.target ? `T: ${state.target}` : '—'}</div>
      <div class="ph-overs">${mc.phase || ''}</div>
    </div>`;

  // Win Probability
  const wp = data.win_probability || {};
  const aPct = wp.team_a_pct || 50;
  const bPct = wp.team_b_pct || 50;
  document.getElementById('pred-winprob').innerHTML = `
    <div class="card-label">Win Probability</div>
    <div class="wp-labels">
      <span class="wp-label team-a-label">${wp.team_a_name || state.battingTeam || 'Team A'}</span>
      <span class="wp-label team-b-label">${wp.team_b_name || state.bowlingTeam || 'Team B'}</span>
    </div>
    <div class="wp-bar-container">
      <div class="wp-bar-team team-a" style="width:${aPct}%">${aPct}%</div>
      <div class="wp-bar-team team-b" style="width:${bPct}%">${bPct}%</div>
    </div>
    <div class="wp-momentum">${se.momentum_shift || ''}</div>`;

  // Debate
  const dt = data.internal_debate_trace || {};
  const debateContainer = document.getElementById('debate-content');
  debateContainer.innerHTML = ''; // clear

  const q = dt.quant_analysis || {};
  const s = dt.strategist_plan || {};
  const sk = dt.skeptic_attack || {};
  const sr = dt.strategist_revision || {};

  const agentMessages = [
    agentMsg('quant', 'THE QUANT', 'ANALYSIS', [q.probability_shift, q.matchup_exploit && `<strong>Matchup:</strong> ${q.matchup_exploit}`, q.boundary_pressure && `<strong>Boundary:</strong> ${q.boundary_pressure}`, q.risk_projection && `<strong>Risk:</strong> ${q.risk_projection}`]),
    agentMsg('strategist', 'THE STRATEGIST', 'PLAN', [s.primary_decision && `<strong>Call:</strong> ${s.primary_decision}`, s.captaincy_intent, s.pressure_goal]),
    agentMsg('skeptic', 'THE SKEPTIC', 'CHALLENGE', [sk.criticism, sk.catastrophic_failure_mode && `<strong>Worst case:</strong> ${sk.catastrophic_failure_mode}`, sk.counter_strategy && `<strong>Counter:</strong> ${sk.counter_strategy}`]),
    agentMsg('strategist', 'THE STRATEGIST', 'REVISION', [sr.adjusted_plan && `<strong>Revised:</strong> ${sr.adjusted_plan}`, sr.revision_reasoning])
  ];

  let msgIdx = 0;
  function showNextAgent() {
    if (msgIdx >= agentMessages.length) return;
    const temp = document.createElement('div');
    temp.innerHTML = agentMessages[msgIdx];
    debateContainer.appendChild(temp.firstElementChild);
    msgIdx++;
    setTimeout(showNextAgent, 800); // 800ms delay between each agent's response
  }
  showNextAgent();

  // Visual Engine
  const ve = data.visual_tactical_engine || {};
  document.getElementById('pred-visual').innerHTML = `
    <div class="card-label">Tactical Intelligence</div>
    <div class="ve-grid">
      <div class="ve-item"><div class="ve-label">Bowling Plan</div><div class="ve-value">${ve.bowling_plan || '—'}</div></div>
      <div class="ve-item"><div class="ve-label">Shot Prediction</div><div class="ve-value">${ve.shot_prediction_zone || '—'}</div></div>
      <div class="ve-item"><div class="ve-label">Danger Zone</div><div class="ve-value">${ve.danger_region || '—'}</div></div>
      <div class="ve-item"><div class="ve-label">Pressure Side</div><div class="ve-value">${ve.field_pressure_side || '—'}</div></div>
    </div>
    <div style="margin-top:16px;padding:14px;background:rgba(99,102,241,0.08);border-radius:8px;border:1px solid rgba(99,102,241,0.15);">
      <div style="font-size:11px;font-weight:600;letter-spacing:1px;color:var(--accent);margin-bottom:8px;">⚡ FINAL CALL — ${data.tactical_resolution?.confidence_score || '?'}% CONFIDENCE</div>
      <div style="font-size:14px;line-height:1.7;color:var(--text-1);">${data.tactical_resolution?.final_call || ''}</div>
    </div>`;

  // Broadcast
  const bc = data.broadcast_synthesis || {};
  document.getElementById('pred-broadcast').innerHTML = `
    <div class="card-label">Broadcast</div>
    <div class="bc-headline">${bc.headline || ''}</div>
    <div class="bc-commentary">${bc.elite_commentary || ''}</div>
    <div class="bc-why">${bc.why_this_works || ''}</div>
    <div class="bc-crowd">🏟️ ${bc.crowd_feeling || ''}</div>`;

  // Field
  const positions = data.tactical_resolution?.field_setup_coordinates || [];
  if (tacticalField && positions.length) tacticalField.setPositions(positions);
}

function agentMsg(type, name, tag, lines) {
  const filtered = lines.filter(Boolean);
  if (!filtered.length) return '';
  return `<div class="agent-msg ${type}">
    <div class="agent-msg-header"><div class="agent-msg-dot"></div><span class="agent-msg-name">${name}</span><span class="agent-msg-tag">${tag}</span></div>
    <div class="agent-msg-body">${filtered.map(l => `<p>${l}</p>`).join('')}</div>
  </div>`;
}
