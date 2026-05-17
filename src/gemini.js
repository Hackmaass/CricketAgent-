// ═══════════════════════════════════════════
// GEMINI MULTI-AGENT ORCHESTRATION ENGINE
// ═══════════════════════════════════════════

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const STADIUMS = [
  { city: "Mumbai", soil: "Red Soil", bounce: "High", boundary: "Short square (64m)", avgScore: 185 },
  { city: "Bengaluru", soil: "Flat", bounce: "True", boundary: "Very short (60m)", avgScore: 195 },
  { city: "Chennai", soil: "Black Clay", bounce: "Low", boundary: "Symmetrical (68m)", avgScore: 165 },
  { city: "Kolkata", soil: "Black Soil", bounce: "Good", boundary: "Large (71m)", avgScore: 180 },
  { city: "Ahmedabad", soil: "Variable", bounce: "Good", boundary: "Very Large (75m+)", avgScore: 175 }
];

async function callAgent(apiKey, systemInstruction, prompt, temperature = 0.7) {
  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature,
        topP: 0.95, 
        responseMimeType: "application/json" 
      }
    })
  });
  
  if (!res.ok) throw new Error(`Agent API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty agent response');
  
  let jsonString = text.trim();
  if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  
  try { return JSON.parse(jsonString); } 
  catch (err) {
    const cleaned = jsonString.replace(/,\s*([\]}])/g, '$1').replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    try { return JSON.parse(cleaned); } 
    catch (e) {
      const match = jsonString.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0].replace(/,\s*([\]}])/g, '$1'));
      throw new Error('Agent failed to return valid JSON structure');
    }
  }
}

function getContextString(ms) {
  const overs = parseFloat(ms.overs) || 0;
  const score = parseInt(ms.score) || 0;
  const phase = overs > 15.1 ? 'DEATH OVERS' : overs > 6 ? 'MIDDLE OVERS' : 'POWERPLAY';
  const crr = overs > 0 ? (score / overs).toFixed(2) : '0.00';
  const isChase = ms.innings === '2';
  const target = parseInt(ms.target) || 0;
  const rrr = isChase && target && overs < 20 ? ((target - score) / (20 - overs)).toFixed(2) : 'N/A';
  const venue = ms.venue || 'Unknown';
  const stadium = STADIUMS.find(s => venue.toLowerCase().includes(s.city.toLowerCase())) || { soil: "Standard", bounce: "Medium", boundary: "65m", avgScore: 170, city: "Unknown" };
  const climateContext = ms.dew === 'Heavy' ? "High humidity. Extreme dew risk. Wet ball will severely impact spin grip and yorker execution." : "Dry conditions. No significant dew expected.";

  return `
[MATCH STATE]
Innings: ${isChase ? '2nd (Chase)' : '1st'}
Batting: ${ms.battingTeam || '?'} | Bowling: ${ms.bowlingTeam || '?'}
Score: ${score}/${ms.wickets || 0} | Overs: ${overs} | Phase: ${phase}
CRR: ${crr} | Target: ${target} | RRR: ${rrr}
Striker: ${ms.striker || '?'} | Non-Striker: ${ms.nonStriker || '?'}
Bowler: ${ms.bowler || '?'} (${ms.bowlerType || '?'})

[GEOSPATIAL & MICRO-CLIMATE]
Venue: ${venue} | Pitch: ${stadium.soil} | Bounce: ${stadium.bounce} | Boundaries: ${stadium.boundary} | Par: ${stadium.avgScore}
Climate: ${climateContext}
${ms.context ? `Context: ${ms.context}` : ''}
  `;
}

export async function predict(apiKey, ms) {
  if (!apiKey) throw new Error('Google Gemini API Key is missing. Please provide VITE_GEMINI_KEY.');
  
  const ctx = getContextString(ms);
  
  // PHASE 1: Parallel Execution of Quant (Math) and Skeptic (Risks)
  const quantPromise = callAgent(
    apiKey,
    "You are THE QUANT. A clinical, numbers-driven probability engine for IPL cricket. Output JSON only.",
    `Analyze this match state and provide statistical breakdown.\n${ctx}\n\nJSON SCHEMA:\n{ "probability_shift": "string", "matchup_exploit": "string", "boundary_pressure": "string", "team_batting_win_pct": number, "team_bowling_win_pct": number }`,
    0.2
  );
  
  const skepticPromise = callAgent(
    apiKey,
    "You are THE SKEPTIC. An adversarial, paranoid cricket analyst who finds flaws in the bowling team's situation. Output JSON only.",
    `Analyze this match state and find the biggest risks and catastrophic failure modes for the bowling team.\n${ctx}\n\nJSON SCHEMA:\n{ "criticism": "string", "catastrophic_failure_mode": "string", "counter_strategy": "string" }`,
    0.8
  );
  
  const [quantRes, skepticRes] = await Promise.all([quantPromise, skepticPromise]);

  // PHASE 2: Strategist uses Quant and Skeptic data to formulate a plan
  const strategistRes = await callAgent(
    apiKey,
    "You are THE STRATEGIST. A sharp, pragmatic IPL captaincy brain. Output JSON only.",
    `You are the bowling captain. Review the current match state, the Quant's data, and the Skeptic's warnings.\n\n${ctx}\n[QUANT DATA]\n${JSON.stringify(quantRes)}\n[SKEPTIC WARNINGS]\n${JSON.stringify(skepticRes)}\n\nFormulate a primary bowling plan, field setup (7 key positions), and tactical resolution.\nJSON SCHEMA:\n{ "primary_decision": "string", "captaincy_intent": "string", "pressure_goal": "string", "final_call": "string", "confidence_score": number, "field_setup_coordinates": [ { "position_name": "string", "x_coord": number, "z_coord": number, "intent": "string" } ] }\nNote: Coordinates: (0,0)=pitch center, +x=off, -x=leg, +z=bowler end, -z=batsman end, boundary≈±10.`,
    0.5
  );

  // PHASE 3: Broadcaster synthesizes everything into a cinematic narrative
  const broadcasterRes = await callAgent(
    apiKey,
    "You are THE BROADCASTER. An emotional, cinematic IPL cricket storyteller (like Harsha Bhogle). Output JSON only.",
    `Synthesize this tactical debate into an electrifying broadcast review.\n${ctx}\n[STRATEGY]\n${JSON.stringify(strategistRes)}\n\nJSON SCHEMA:\n{ "headline": "string", "elite_commentary": "string", "why_this_works": "string", "crowd_feeling": "string", "system_energy": { "pressure_level": "string", "momentum_shift": "string", "stadium_tension": "string" } }`,
    0.9
  );

  // Reconstruct the original UI format exactly
  return {
    system_energy: broadcasterRes.system_energy || { pressure_level: "HIGH", momentum_shift: "Unknown", stadium_tension: "Intense" },
    match_context: {
      phase: ms.overs > 15 ? 'DEATH OVERS' : ms.overs > 6 ? 'MIDDLE OVERS' : 'POWERPLAY',
      current_run_rate: ms.overs > 0 ? (ms.score / ms.overs).toFixed(2) : '0.00',
      required_run_rate: ms.innings === '2' ? ((ms.target - ms.score) / (20 - ms.overs)).toFixed(2) : 'N/A',
      tactical_temperature: strategistRes.confidence_score > 70 ? "HOT" : "CRITICAL"
    },
    win_probability: {
      team_a_name: ms.battingTeam || "Batting",
      team_a_pct: quantRes.team_batting_win_pct || 50,
      team_b_name: ms.bowlingTeam || "Bowling",
      team_b_pct: quantRes.team_bowling_win_pct || 50
    },
    internal_debate_trace: {
      quant_analysis: {
        probability_shift: quantRes.probability_shift || "",
        matchup_exploit: quantRes.matchup_exploit || "",
        boundary_pressure: quantRes.boundary_pressure || "",
        risk_projection: "Calculated."
      },
      strategist_plan: {
        primary_decision: strategistRes.primary_decision || "",
        captaincy_intent: strategistRes.captaincy_intent || "",
        pressure_goal: strategistRes.pressure_goal || ""
      },
      skeptic_attack: {
        criticism: skepticRes.criticism || "",
        catastrophic_failure_mode: skepticRes.catastrophic_failure_mode || "",
        counter_strategy: skepticRes.counter_strategy || ""
      },
      strategist_revision: {
        adjusted_plan: "Plan locked in based on skeptic feedback.",
        revision_reasoning: "Risk mitigated."
      }
    },
    visual_tactical_engine: {
      bowling_plan: strategistRes.primary_decision,
      shot_prediction_zone: "Dynamic based on field",
      danger_region: skepticRes.catastrophic_failure_mode,
      field_pressure_side: "Off-side heavy"
    },
    tactical_resolution: {
      final_call: strategistRes.final_call || "Execute plan.",
      confidence_score: strategistRes.confidence_score || 85,
      field_setup_coordinates: strategistRes.field_setup_coordinates || []
    },
    broadcast_synthesis: {
      headline: broadcasterRes.headline || "Tension in the middle",
      elite_commentary: broadcasterRes.elite_commentary || "What a moment in the game.",
      why_this_works: broadcasterRes.why_this_works || "",
      crowd_feeling: broadcasterRes.crowd_feeling || ""
    }
  };
}
