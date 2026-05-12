const fs = require('fs');
const path = require('path');
const nlp = require('compromise');

const set1Path = path.join(__dirname, 'public/data/202406-set1.json');
const set2Path = path.join(__dirname, 'public/data/202406-set2.json');

const set1 = JSON.parse(fs.readFileSync(set1Path, 'utf8'));
const set2 = JSON.parse(fs.readFileSync(set2Path, 'utf8'));

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
  
  // 1. Length check: at least 5 words
  const words = text.split(/\s+/);
  if (words.length < 5) return false;
  
  // 2. Duration check: at least 3 seconds
  if (item.duration < 2.0) return false;
  
  // 3. Boilerplate check
  for (const phrase of boilerplate) {
    if (lowerText.includes(phrase)) return false;
  }
  
  if (/^question\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i.test(text)) return false;
  if (/^news report\s+(\d+|one|two|three|four|five)/i.test(text)) return false;
  if (/^passage\s+(\d+|one|two|three|four|five)/i.test(text)) return false;
  if (/^conversation\s+(\d+|one|two|three|four|five)/i.test(text)) return false;
  
  // Also filter sentences ending with prepositions or conjunctions
  if (/\b(the|a|an|and|or|but|to|of|in|on|with|for|from|by|at|as|is|are|was|were|has|have|had|will|would|can|could|should|do|does|did|than|that|which|who|whom|whose|why|how|when|where|what|perhaps|fact|function|standard|entirely)$/i.test(text)) return false;
  
  // 4. Starts with subordinating conjunctions or prepositions or relative pronouns
  if (/^(after|when|while|if|because|since|although|though|unless|until|that|which|who|whom|whose|from|to|in|on|at|by|with|for|about|under|over|between|among|through|into|onto|upon|during|before|after|of|as|around|also)\b/i.test(text)) {
    // It's likely a dependent clause or prepositional phrase
    // Only accept if it has a comma indicating a main clause follows
    if (!text.includes(',')) {
      return false;
    }
  }

  // 4d. Starts with wh- word but not a question structure
  if (/^(how|why|where|what|when)\b/i.test(text)) {
    if (!/^(how|why|where|what|when)\s+(is|are|was|were|do|does|did|can|could|will|would|should|has|have|had)\b/i.test(text)) {
      if (!text.includes(',')) {
        return false;
      }
    }
  }
  
  // 4e. Starts with an adverb
  if (/^[a-z]+ly\b/i.test(text)) {
    // e.g. "openly about things", "luckily I managed"
    // Usually adverbs at the start of a sentence are followed by a comma, or modifying a verb.
    // If there is no comma, it might be a fragment like "openly about things"
    if (!text.includes(',') && !/^[a-z]+ly\s+(i|he|she|it|they|we|you|the|a|an)\b/i.test(text)) {
      return false;
    }
  }

  if (/^(advocate|advocates|advocating)\b/i.test(text)) return false;

  // 5. Starts with a conjunction
  if (/^(and|but|or|so|yet)\b/i.test(text)) {
    return false;
  }

  // 5b. Check for £ or numbers at the start with no main verb
  if (/^£\d+/.test(text) && !text.includes(',')) return false;

  // 5c. Starts with "mountain biking" or similar noun phrases without a verb
  if (/^mountain biking\b/i.test(text)) return false;
  if (/^not just to\b/i.test(text)) return false;
  if (/^all students\b/i.test(text) && !/\b(will|must|should|can|are|were|do|did)\b/.test(text)) return false;
  if (/^your proposal to\b/i.test(text)) return false;
  if (/^you're an economist and\b/i.test(text)) return false;

  // 6. Starts with a verb (including participles)
  // We can reject lines starting with these common verbs, unless it's a question.
  if (/^(is|are|was|were|has|have|had|do|does|did|will|would|can|could|shall|should|may|might|must|turned|forced|located|said|told|made|done|seen|given|taken|come|came|went|gone)\b/i.test(text)) {
    if (!/^(is|are|was|were|do|does|did|can|could|will|would|should)\s+(he|she|it|they|we|you|i|the|a|an)\b/i.test(text)) {
      return false;
    }
  }
  
  // 7. Starts with V-ing or V-ed
  if (/^[a-z]+ing\b/i.test(text) || /^[a-z]+ed\b/i.test(text)) {
    if (!text.includes(',')) {
      return false;
    }
  }

  if (/^(a|an|the)\s+[a-z\s]+(which|who|that)\b/i.test(text)) return false;

  // 8. Starts with an article/noun but immediately followed by a relative clause or prepositional phrase with no main verb later
  // E.g., "a Jet Blue Airlines flight", "the flight from Palm Beach International Airport"
  // Compromise can help here: we need a main verb.
  let doc = nlp(text);
  let verbs = doc.verbs().out('array');
  if (verbs.length === 0) return false;
  
  // A complete sentence typically has at least a noun (subject) and a verb.
  if (!doc.match('#Noun').found) {
    return false;
  }

  return true;
}

const filteredSet1 = set1.filter(isGoodSentence);
const filteredSet2 = set2.filter(isGoodSentence);

console.log(`Set 1: ${set1.length} -> ${filteredSet1.length}`);
console.log(`Set 2: ${set2.length} -> ${filteredSet2.length}`);

console.log("\nSample from filtered Set 2:");
filteredSet2.slice(0, 10).forEach(item => console.log("-", item.text));

// Save back
fs.writeFileSync(set1Path, JSON.stringify(filteredSet1, null, 2));
fs.writeFileSync(set2Path, JSON.stringify(filteredSet2, null, 2));

console.log("Files updated successfully.");