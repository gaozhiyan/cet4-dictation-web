const fs = require('fs');
const path = require('path');
const nlp = require('compromise');
const { execSync } = require('child_process');

const srtPath = '/Users/gao/Desktop/others/CET4/听力练习/2024四级真题及解析_for 艾薇/202506set2.srt';
const audioPath = '/Users/gao/Desktop/others/CET4/听力练习/2024四级真题及解析_for 艾薇/202506set2.mp3';
const outAudioDir = path.join(__dirname, 'public/audio');
const outJsonPath = path.join(__dirname, 'public/data/202506-set2.json');
const baseName = '202506-set2';
const sourceName = '202506 第二套';
const ffmpegPath = '/Users/gao/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';

// Boilerplate phrases to ignore
const boilerplate = [
  "college english test",
  "listening comprehension",
  "section a",
  "section b",
  "section c",
  "directions",
  "news report",
  "passage",
  "recording",
  "conversation",
  "questions",
  "at the end of each",
  "in this section",
  "you will hear",
  "both the news report",
  "will be spoken",
  "after you hear",
  "you must choose",
  "from the four choices",
  "then mark the corresponding",
  "a b c and d",
  "mark the corresponding letter",
  "on answer sheet"
];

function isGoodSentence(item) {
  let text = item.text.trim();
  const lowerText = text.toLowerCase();
  
  const words = text.split(/\s+/);
  if (words.length < 5) return false;
  if (item.duration < 2.0) return false;
  
  for (const phrase of boilerplate) {
    if (lowerText.includes(phrase)) return false;
  }
  
  if (/^question\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i.test(text)) return false;
  if (/^news report\s+(\d+|one|two|three|four|five)/i.test(text)) return false;
  if (/^passage\s+(\d+|one|two|three|four|five)/i.test(text)) return false;
  if (/^conversation\s+(\d+|one|two|three|four|five)/i.test(text)) return false;
  
  if (/\b(the|a|an|and|or|but|to|of|in|on|with|for|from|by|at|as|is|are|was|were|has|have|had|will|would|can|could|should|do|does|did|than|that|which|who|whom|whose|why|how|when|where|what|perhaps|fact|function|standard|entirely)$/i.test(text)) return false;
  
  if (/^(after|when|while|if|because|since|although|though|unless|until|that|which|who|whom|whose|from|to|in|on|at|by|with|for|about|under|over|between|among|through|into|onto|upon|during|before|after|of|as|around|also)\b/i.test(text)) {
    if (!text.includes(',')) return false;
  }

  if (/^(how|why|where|what|when)\b/i.test(text)) {
    if (!/^(how|why|where|what|when)\s+(is|are|was|were|do|does|did|can|could|will|would|should|has|have|had)\b/i.test(text)) {
      if (!text.includes(',')) return false;
    }
  }
  
  if (/^[a-z]+ly\b/i.test(text)) {
    if (!text.includes(',') && !/^[a-z]+ly\s+(i|he|she|it|they|we|you|the|a|an)\b/i.test(text)) return false;
  }

  if (/^(advocate|advocates|advocating)\b/i.test(text)) return false;
  if (/^(and|but|or|so|yet)\b/i.test(text)) return false;
  if (/^£\d+/.test(text) && !text.includes(',')) return false;
  if (/^mountain biking\b/i.test(text)) return false;
  if (/^not just to\b/i.test(text)) return false;
  if (/^all students\b/i.test(text) && !/\b(will|must|should|can|are|were|do|did)\b/.test(text)) return false;
  if (/^your proposal to\b/i.test(text)) return false;
  if (/^you're an economist and\b/i.test(text)) return false;

  if (/^(is|are|was|were|has|have|had|do|does|did|will|would|can|could|shall|should|may|might|must|turned|forced|located|said|told|made|done|seen|given|taken|come|came|went|gone)\b/i.test(text)) {
    if (!/^(is|are|was|were|do|does|did|can|could|will|would|should)\s+(he|she|it|they|we|you|i|the|a|an)\b/i.test(text)) {
      return false;
    }
  }
  
  if (/^[a-z]+ing\b/i.test(text) || /^[a-z]+ed\b/i.test(text)) {
    if (!text.includes(',')) return false;
  }

  if (/^(a|an|the)\s+[a-z\s]+(which|who|that)\b/i.test(text)) return false;

  let doc = nlp(text);
  let verbs = doc.verbs().out('array');
  if (verbs.length === 0) return false;
  
  if (!doc.match('#Noun').found) return false;

  return true;
}

function parseTime(s) {
  const m = s.trim().match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{1,3})/);
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const sec = parseInt(m[3], 10);
  const ms = parseInt(m[4], 10);
  return h * 3600 + min * 60 + sec + ms / 1000;
}

function parseSrt(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedContent.split(/\n{2,}/);
  const items = [];
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const textLines = lines.slice(2).join(' ');
      const tm = timeLine.match(/(.*)\s*-->\s*(.*)/);
      if (tm) {
        const start = parseTime(tm[1]);
        const end = parseTime(tm[2]);
        items.push({
          start,
          end,
          duration: parseFloat((end - start).toFixed(3)),
          text: textLines
        });
      }
    }
  }
  return items;
}

function getDifficulty(duration) {
  if (duration <= 5) return 'easy';
  if (duration <= 10) return 'medium';
  return 'hard';
}

console.log("Parsing SRT...");
const allItems = parseSrt(srtPath);
console.log(`Total SRT items: ${allItems.length}`);

console.log("Filtering sentences...");
const filteredItems = allItems.filter(isGoodSentence);
console.log(`Filtered items (good sentences): ${filteredItems.length}`);

if (!fs.existsSync(outAudioDir)) {
  fs.mkdirSync(outAudioDir, { recursive: true });
}

const finalJson = [];

console.log("Slicing audio files...");
filteredItems.forEach((item, idx) => {
  const indexStr = String(idx + 1).padStart(3, '0');
  const filename = `${baseName}-${indexStr}.wav`;
  const outPath = path.join(outAudioDir, filename);
  
  const cmd = `"${ffmpegPath}" -hide_banner -loglevel error -y -ss ${item.start} -to ${item.end} -i "${audioPath}" -ac 1 -ar 16000 "${outPath}"`;
  try {
    execSync(cmd);
    finalJson.push({
      filename,
      start: item.start,
      end: item.end,
      duration: item.duration,
      text: item.text,
      difficulty: getDifficulty(item.duration),
      source: sourceName
    });
  } catch (err) {
    console.error(`Error slicing ${filename}:`, err.message);
  }
});

fs.writeFileSync(outJsonPath, JSON.stringify(finalJson, null, 2), 'utf8');
console.log(`Successfully written JSON to ${outJsonPath}`);
