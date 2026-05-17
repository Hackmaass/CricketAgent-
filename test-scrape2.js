import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cricbuzz.html', 'utf8');
const $ = cheerio.load(html);

const matches = [];
$('a[href^="/live-cricket-scores/"]').each((i, el) => {
  const link = $(el).attr('href');
  const text = $(el).text().trim();
  
  if (text.length > 10 && !link.includes('news')) {
    matches.push({ link, text });
  }
});

console.log(JSON.stringify(matches, null, 2));
