const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srtPath = '/Users/gao/Desktop/others/CET4/听力练习/2024四级真题及解析_for 艾薇/202506set2.srt';
const jsonPath = '/Users/gao/Desktop/others/CET4/听力练习/20250602-full.json';
const audioPath = '/Users/gao/Desktop/others/CET4/听力练习/2024四级真题及解析_for 艾薇/202506set2.mp3';
const outAudioDir = path.join(__dirname, 'public/audio/exam');
const outJsonPath = path.join(__dirname, 'public/data/exam-202506-set2.json');
const ffmpegPath = '/Users/gao/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';

// 1. Read JSON
const rawData = fs.readFileSync(jsonPath, 'utf8');
const examData = JSON.parse(rawData);

// 2. Read SRT and find passage start times
const srtContent = fs.readFileSync(srtPath, 'utf8');
const blocks = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n{2,}/);

function parseTime(s) {
  const m = s.trim().match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{1,3})/);
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const sec = parseInt(m[3], 10);
  const ms = parseInt(m[4], 10);
  return h * 3600 + min * 60 + sec + ms / 1000;
}

let passages = [];
let currentPassage = null;

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length >= 3) {
    const timeLine = lines[1];
    const textLines = lines.slice(2).join(' ').toLowerCase();
    
    if (textLines.includes('news report 1') || textLines.includes('news report 2') || textLines.includes('news report 3') ||
        textLines.includes('conversation 1') || textLines.includes('conversation 2') ||
        textLines.includes('passage 1') || textLines.includes('passage 2') || textLines.includes('passage 3')) {
        
        const tm = timeLine.match(/(.*)\s*-->\s*(.*)/);
        if (tm) {
            passages.push({
                name: textLines,
                start: parseTime(tm[1])
            });
        }
    }
  }
}

console.log("Found passages:", passages);

// 3. Map questions to passages
// The user said: "你可以根据 srt 去看一下，每一段听力录音包含多少题目"
// Let's assume the passage start time is the start of the audio for all questions in that passage.
// We know CET4 structure:
// NR1: Q1, Q2
// NR2: Q3, Q4
// NR3: Q5, Q6, Q7
// Conv1: Q8, Q9, Q10, Q11
// Conv2: Q12, Q13, Q14, Q15
// Pass1: Q16, Q17, Q18
// Pass2: Q19, Q20, Q21
// Pass3: Q22, Q23, Q24, Q25

const questionToPassage = [
    0, 0, // 1, 2 -> NR1 (index 0)
    1, 1, // 3, 4 -> NR2 (index 1)
    2, 2, 2, // 5, 6, 7 -> NR3 (index 2)
    3, 3, 3, 3, // 8, 9, 10, 11 -> Conv1 (index 3)
    4, 4, 4, 4, // 12, 13, 14, 15 -> Conv2 (index 4)
    5, 5, 5, // 16, 17, 18 -> Pass1 (index 5)
    6, 6, 6, // 19, 20, 21 -> Pass2 (index 6)
    7, 7, 7, 7  // 22, 23, 24, 25 -> Pass3 (index 7)
];

if (!fs.existsSync(outAudioDir)) {
  fs.mkdirSync(outAudioDir, { recursive: true });
}

// Group questions by passage
let examPassages = [];
for (let i = 0; i < passages.length; i++) {
  examPassages.push({
    id: i,
    name: passages[i].name,
    start: passages[i].start,
    questions: []
  });
}

examData.questions.forEach((q, idx) => {
    const passageIdx = questionToPassage[idx];
    q.passage_name = passages[passageIdx].name;
    examPassages[passageIdx].questions.push(q);
});

// Process each passage
examPassages.forEach((p, idx) => {
    const firstQ = p.questions[0];
    const lastQ = p.questions[p.questions.length - 1];
    
    // Audio start is the passage start
    const pStart = p.start;
    
    // Audio end is the end time of the last question in the passage
    let [eminStr, esecStr] = lastQ.end_time.split(':');
    let [esec, ems] = esecStr.split(',');
    let pEnd = parseInt(eminStr) * 60 + parseInt(esec) + parseInt(ems) / 1000;
    
    const filename = `exam-202506-set2-passage-${idx}.wav`;
    const outPath = path.join(outAudioDir, filename);
    
    console.log(`Processing Passage ${idx} (${p.name}): ${filename} (Start: ${pStart}, End: ${pEnd})`);
    
    const cmd = `"${ffmpegPath}" -hide_banner -loglevel error -y -ss ${pStart} -to ${pEnd} -i "${audioPath}" -ac 1 -ar 16000 "${outPath}"`;
    try {
        execSync(cmd);
        p.audio_file = `/audio/exam/${filename}`;
    } catch (err) {
        console.error(`Error slicing Passage ${idx}:`, err.message);
    }
});

// Update examData structure
examData.passages = examPassages;

fs.writeFileSync(outJsonPath, JSON.stringify(examData, null, 2), 'utf8');
console.log(`Successfully written JSON to ${outJsonPath}`);
