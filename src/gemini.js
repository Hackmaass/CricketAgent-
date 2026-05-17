// ═══════════════════════════════════════════
// GEMINI PREDICTION ENGINE
// ═══════════════════════════════════════════

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export function buildPrompt(ms) {
  const overs = parseFloat(ms.overs) || 0;
  const score = parseInt(ms.score) || 0;
  const phase = overs > 15.1 ? 'DEATH OVERS' : overs > 6 ? 'MIDDLE OVERS' : 'POWERPLAY';
  const crr = overs > 0 ? (score / overs).toFixed(2) : '0.00';
  const isChase = ms.innings === '2';
  const target = parseInt(ms.target) || 0;
  const rrr = isChase && target && overs < 20 ? ((target - score) / (20 - overs)).toFixed(2) : null;

  return `You are an elite IPL prediction engine with four internal specialist agents:
1. THE QUANT — Probability engine. Clinical. Numbers-driven.
2. THE STRATEGIST — IPL captaincy brain. Tactical. Sharp.
3. THE SKEPTIC — Adversarial. Exposes blind spots. Paranoid.
4. THE BROADCASTER — Cricket storyteller. Cinematic. Emotional.

ANALYZE THIS MATCH STATE from the BOWLING team (${ms.bowlingTeam || 'Unknown'}) perspective:

Innings: ${isChase ? '2nd (Chase)' : '1st'}
Batting: ${ms.battingTeam || '?'} | Bowling: ${ms.bowlingTeam || '?'}
Score: ${score}/${ms.wickets || 0} | Overs: ${overs} | Phase: ${phase}
CRR: ${crr}${isChase ? ` | Target: ${target} | RRR: ${rrr}` : ''}
Striker: ${ms.striker || '?'} | Non-Striker: ${ms.nonStriker || '?'}
Bowler: ${ms.bowler || '?'} (${ms.bowlerType || '?'})
Venue: ${ms.venue || '?'} | Dew: ${ms.dew || 'None'}
${ms.context ? `Context: ${ms.context}` : ''}

ALSO PREDICT: Which team is more likely to win? Give a win probability split (must add to 100).

RULES:
- Authentic cricket language ONLY. No AI/ML jargon.
- Zero hallucinations. Use structural cricket logic if data is missing.
- Heavy dew → reduce spin effectiveness, increase yorker risk.
- Agents MUST disagree. Visible conflict is mandatory.

Return ONLY valid JSON (no markdown fences):
{
  "system_energy":{"pressure_level":"<LOW/MEDIUM/HIGH/CRITICAL>","momentum_shift":"<who has momentum>","stadium_tension":"<crowd atmosphere>"},
  "match_context":{"phase":"${phase}","current_run_rate":"${crr}","required_run_rate":"${rrr||'N/A'}","tactical_temperature":"<COLD/WARM/HOT/BOILING>"},
  "win_probability":{"team_a_name":"${ms.battingTeam||'Batting'}","team_a_pct":<number>,"team_b_name":"${ms.bowlingTeam||'Bowling'}","team_b_pct":<number>},
  "internal_debate_trace":{
    "quant_analysis":{"probability_shift":"","matchup_exploit":"","boundary_pressure":"","risk_projection":""},
    "strategist_plan":{"primary_decision":"","captaincy_intent":"","pressure_goal":""},
    "skeptic_attack":{"criticism":"","catastrophic_failure_mode":"","counter_strategy":""},
    "strategist_revision":{"adjusted_plan":"","revision_reasoning":""}
  },
  "visual_tactical_engine":{"bowling_plan":"","shot_prediction_zone":"","danger_region":"","field_pressure_side":""},
  "tactical_resolution":{
    "final_call":"<2-3 sentence tactical summary>",
    "confidence_score":<0-100>,
    "field_setup_coordinates":[
      {"position_name":"","x_coord":<-10..10>,"z_coord":<-10..10>,"intent":""}
    ]
  },
  "broadcast_synthesis":{"headline":"<punchy headline>","elite_commentary":"<2-3 sentences>","why_this_works":"","crowd_feeling":""}
}

Coordinates: (0,0)=pitch center, +x=off, -x=leg, +z=bowler end, -z=batsman end, boundary≈±10.
Provide exactly 7 field positions. JSON ONLY.`;
}

export async function predict(apiKey, matchState) {
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing. Please provide a VITE_GEMINI_KEY in the .env file.');
  }

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(matchState) }] }],
      generationConfig: { temperature: 1.0, topP: 0.95, maxOutputTokens: 4096 }
    })
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response');
  let json = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  try { return JSON.parse(json); }
  catch { const m = json.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error('Invalid JSON response'); }
}
