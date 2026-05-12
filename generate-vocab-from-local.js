const fs = require('fs');
const path = require('path');
const readline = require('readline');

// The local vocabulary files you provided
const levelMap = {
  1: '../词汇表/中考英语词汇表.txt',
  2: '../词汇表/CET4_edited.txt',
  3: '../词汇表/CET6_edited.txt',
  4: '../词汇表/TOEFL_delete_CET4+6.txt',
  5: '../词汇表/GRE_8000_Words.txt'
};

// Parse different text formats
async function parseDictFile(filePath, level) {
  const words = [];
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return words;
  }

  const fileStream = fs.createReadStream(filePath, 'utf-8');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    // Skip headers or single letter alphabetical headers like "A"
    if (line.trim().length <= 1 || line.includes('大纲单词表') || line.includes('共 4615 词')) continue;
    
    // Parse format: word [phonetics] meaning or word meaning
    const match = line.match(/^([a-zA-Z\-]+)\s+/);
    if (match) {
      const word = match[1].toLowerCase();
      
      // Extract everything after the word as meaning
      let meaning = line.substring(match[0].length).trim();
      
      // Remove phonetics like [əˈbɪlɪtɪ] or /əˈbɪlɪtɪ/
      meaning = meaning.replace(/\[.*?\]/g, '').replace(/\/.*?\//g, '').trim();
      
      // Clean up multiple spaces
      meaning = meaning.replace(/\s+/g, ' ');
      
      if (word && meaning && meaning.length > 0) {
        words.push({ word, correct: meaning });
      }
    }
  }
  return words;
}

async function main() {
  console.log("Starting vocab database generation from local files...");
  
  const fullDatabase = {};
  const globalSeenWords = new Set(); // For strict deduplication across levels
  
  for (let level = 1; level <= 5; level++) {
    const filePath = path.join(__dirname, levelMap[level]);
    const rawWords = await parseDictFile(filePath, level);
    
    const uniqueLevelWords = [];
    
    for (const w of rawWords) {
      // Deduplicate: If a word appeared in a lower level, don't include it in a higher level
      if (!globalSeenWords.has(w.word)) {
        globalSeenWords.add(w.word);
        uniqueLevelWords.push(w);
      }
    }
    
    fullDatabase[level] = {
      baseVolume: uniqueLevelWords.length, // The real total number of words in this level
      words: uniqueLevelWords
    };
    
    console.log(`Level ${level} parsed: ${uniqueLevelWords.length} unique words (deduplicated)`);
  }
  
  const outputPath = path.join(__dirname, 'public/data/vocab-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(fullDatabase), 'utf-8');
  
  const stats = fs.statSync(outputPath);
  console.log(`\nSuccessfully generated full vocab database to ${outputPath}`);
  console.log(`Total unique words across all levels: ${globalSeenWords.size}`);
  console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(console.error);