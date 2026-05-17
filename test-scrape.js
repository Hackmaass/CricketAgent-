import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cricbuzz.html', 'utf8');
const $ = cheerio.load(html);

const matches = [];
$('.cb-mtch-lst').each((i, el) => {
  const matchTitle = $(el).find('.cb-lv-scr-mtch-hdr').text().trim();
  
  // Scores
  const team1 = $(el).find('.cb-hm-rght .cb-ovr-flo').eq(0).text().trim();
  const team2 = $(el).find('.cb-hm-rght .cb-ovr-flo').eq(1).text().trim();
  
  const statusText = $(el).find('.cb-text-live').text().trim() || $(el).find('.cb-text-complete').text().trim() || $(el).find('.cb-text-preview').text().trim();
  
  const isLive = $(el).find('.cb-text-live').length > 0;
  const isComplete = $(el).find('.cb-text-complete').length > 0;
  
  matches.push({
    matchTitle,
    team1,
    team2,
    statusText,
    isLive,
    isComplete
  });
});

console.log(JSON.stringify(matches, null, 2));
