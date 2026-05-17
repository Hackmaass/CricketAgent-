// ═══════════════════════════════════════════
// CRICBUZZ SCRAPER — Live Match Fetcher
// Uses Vite proxy to bypass CORS
// ═══════════════════════════════════════════

let cachedMatches = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

export async function fetchLiveMatches() {
  const now = Date.now();
  if (cachedMatches && (now - lastFetchTime < CACHE_TTL_MS)) {
    console.log('Returning cached matches');
    return cachedMatches;
  }

  try {
    // Vite proxy handles this and sends to https://www.cricbuzz.com
    const res = await fetch('/api/cricbuzz/cricket-match/live-scores', {
      headers: {
        'Accept': 'text/html'
      }
    });
    if (!res.ok) throw new Error(`Cricbuzz proxy error: ${res.status}`);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const matches = [];

    // Find all match cards
    const matchCards = doc.querySelectorAll('a[href^="/live-cricket-scores/"]');
    
    matchCards.forEach(card => {
      try {
        const link = card.getAttribute('href');
        
        // Skip news links
        if (link.includes('news') || link.includes('scorecard')) return;

        // Try to parse teams and scores
        // Cricbuzz uses spans that are 50% width for scores
        const scoreSpans = Array.from(card.querySelectorAll('span.w-1\\/2'));
        const images = card.querySelectorAll('img');

        let teamA = '';
        let teamB = '';

        if (images.length >= 2) {
          teamA = images[0].getAttribute('alt') || '';
          teamB = images[1].getAttribute('alt') || '';
        } else {
            // fallback, try to extract from text inside cbTxtPrim / cbTxtSec
            const teamEls = card.querySelectorAll('.text-cbTxtPrim, .text-cbTxtSec');
            const possibleTeams = Array.from(teamEls).filter(el => !el.classList.contains('w-1/2') && el.textContent.trim().length > 0 && el.textContent.trim().length < 20);
            if(possibleTeams.length >= 2) {
                teamA = possibleTeams[0].textContent.trim();
                teamB = possibleTeams[1].textContent.trim();
            }
        }

        const scoreA = scoreSpans.length > 0 ? scoreSpans[0].textContent.trim() : '';
        const scoreB = scoreSpans.length > 1 ? scoreSpans[1].textContent.trim() : '';

        // Status
        const statusEl = card.querySelector('.text-cbLive, .text-cbComplete, .text-cbPreview');
        const status = statusEl ? statusEl.textContent.trim() : '';
        
        const isLive = card.querySelector('.text-cbLive') !== null;
        const matchEnded = card.querySelector('.text-cbComplete') !== null;

        // Title/Venue
        let title = '';
        const titleEl = card.querySelector('span.text-xs');
        if (titleEl) title = titleEl.textContent.trim();

        // Ensure we only add valid matches
        if (teamA && teamB && !matches.some(m => m.link === link)) {
          matches.push({
            id: link.split('/')[2] || Math.random().toString(),
            name: `${teamA} vs ${teamB}`,
            status,
            matchType: title.toLowerCase().includes('t20') ? 't20' : title.toLowerCase().includes('test') ? 'test' : 'odi',
            venue: title,
            teamA: teamA.toUpperCase(),
            teamB: teamB.toUpperCase(),
            scores: [
              { team: teamA.toUpperCase(), runs: parseRuns(scoreA), wickets: parseWickets(scoreA), overs: parseOvers(scoreA) },
              { team: teamB.toUpperCase(), runs: parseRuns(scoreB), wickets: parseWickets(scoreB), overs: parseOvers(scoreB) }
            ].filter(s => s.runs !== 0 || s.wickets !== 0), // remove empty scores
            isLive,
            matchEnded,
            isIPL: link.includes('indian-premier-league') || title.toLowerCase().includes('ipl'),
            link
          });
        }
      } catch (e) {
        console.warn('Failed to parse a match card', e);
      }
    });

    cachedMatches = matches;
    lastFetchTime = Date.now();
    return matches;
  } catch (err) {
    console.warn('Cricbuzz fetch failed:', err.message);
    return cachedMatches || [];
  }
}

function parseRuns(scoreStr) {
  // "222-4 (20)" -> 222
  // "278 & 110-3" -> 110
  if (!scoreStr) return 0;
  const parts = scoreStr.split('&');
  const latest = parts[parts.length - 1].trim();
  const match = latest.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function parseWickets(scoreStr) {
  // "222-4 (20)" -> 4
  // "16-1 (2.1)" -> 1
  if (!scoreStr) return 0;
  const parts = scoreStr.split('&');
  const latest = parts[parts.length - 1].trim();
  const match = latest.match(/-(\d+)/);
  return match ? parseInt(match[1]) : 0; // 0 if all out or no wickets fallen
}

function parseOvers(scoreStr) {
  // "222-4 (20.5)" -> 20.5
  if (!scoreStr) return 0;
  const match = scoreStr.match(/\(([\d.]+)\)/);
  return match ? parseFloat(match[1]) : 0;
}

// Convert a match into a matchState for prediction
export function matchToState(match) {
  const scores = match.scores || [];
  const latest = scores[scores.length - 1] || {};
  const first = scores[0] || {};
  const isSecondInnings = scores.length >= 2;

  // Map full team names to abbreviations if possible
  const teamMap = {
    'CHENNAI SUPER KINGS': 'CSK', 'MUMBAI INDIANS': 'MI',
    'ROYAL CHALLENGERS BENGALURU': 'RCB', 'ROYAL CHALLENGERS BANGALORE': 'RCB',
    'KOLKATA KNIGHT RIDERS': 'KKR', 'DELHI CAPITALS': 'DC',
    'PUNJAB KINGS': 'PBKS', 'RAJASTHAN ROYALS': 'RR',
    'SUNRISERS HYDERABAD': 'SRH', 'GUJARAT TITANS': 'GT',
    'LUCKNOW SUPER GIANTS': 'LSG',
  };
  const shorten = (name) => teamMap[name.toUpperCase()] || name;

  return {
    innings: isSecondInnings ? '2' : '1',
    battingTeam: shorten(latest.team || match.teamA),
    bowlingTeam: shorten(isSecondInnings
      ? (latest.team === match.teamA ? match.teamB : match.teamA)
      : (latest.team === match.teamA ? match.teamB : match.teamA)),
    score: String(latest.runs || 0),
    wickets: String(latest.wickets || 0),
    overs: String(latest.overs || 0),
    target: isSecondInnings ? String((first.runs || 0) + 1) : '',
    striker: '', nonStriker: '', bowler: '', bowlerType: '',
    venue: match.venue,
    dew: 'None',
    context: match.status || '',
  };
}
