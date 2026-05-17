import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cricbuzz.html', 'utf8');
const $ = cheerio.load(html);

const matches = [];

// Look for anchor tags that go to live cricket scores
$('a[href^="/live-cricket-scores/"]').each((i, el) => {
  const link = $(el).attr('href');
  
  // Find team names using img alt tags
  const images = $(el).find('img');
  let team1 = images.eq(0).attr('alt') || 'Team 1';
  let team2 = images.eq(1).attr('alt') || 'Team 2';
  
  // Try to find the score texts (they usually have a span with width 1/2)
  const spans = $(el).find('span.w-1\\/2');
  let score1 = spans.eq(0).text().trim() || '';
  let score2 = spans.eq(1).text().trim() || '';
  
  // Status text (usually color coded cbLive, cbComplete, etc)
  const statusEl = $(el).find('.text-cbLive, .text-cbComplete, .text-cbPreview');
  const status = statusEl.text().trim();
  
  // Title (usually has text like 'Match')
  let title = '';
  const metaSpan = $(el).find('span.text-xs');
  if (metaSpan.length > 0) {
    title = metaSpan.first().text().trim();
  }
  
  if (team1 !== 'Team 1' && team2 !== 'Team 2') {
    // Only push if we haven't added this link yet
    if (!matches.some(m => m.link === link)) {
        matches.push({ title, team1, team2, score1, score2, status, link });
    }
  }
});

console.log(JSON.stringify(matches, null, 2));
