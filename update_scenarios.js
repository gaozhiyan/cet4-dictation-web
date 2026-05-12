const fs = require('fs');

const openingData = {
  w1: [
    [
      { senderId: 'host', text: "Welcome to the final round of our interview. Thanks for joining us." },
      { senderId: 'p1', text: "I've reviewed your resume. The technical background looks very solid." },
      { senderId: 'p2', text: "But we also need to know how you handle high-pressure situations and teamwork." },
      { senderId: 'host', text: "Exactly. Why don't you start by briefly introducing yourself?" }
    ],
    [
      { senderId: 'host', text: "Hello and welcome! We have a few behavioral questions to go through today." },
      { senderId: 'p2', text: "And I have some highly specific technical queries about your past projects." },
      { senderId: 'p1', text: "Let's keep it conversational. Don't be nervous." },
      { senderId: 'host', text: "Let's begin. Could you tell us about the most challenging project you've led?" }
    ]
  ],
  w2: [
    [
      { senderId: 'host', text: "Alright, my shift is almost over. Let's do a quick handover." },
      { senderId: 'p1', text: "Is the database migration completely finished?" },
      { senderId: 'p2', text: "I noticed some latency issues in the EU server logs." },
      { senderId: 'host', text: "I've documented most of those issues. Are you ready to take over now?" }
    ],
    [
      { senderId: 'host', text: "Hey guys, let's sync up quickly before I log off for the day." },
      { senderId: 'p2', text: "Did the client approve the new UI design?" },
      { senderId: 'p1', text: "We still have two pending bugs in the backlog that need attention." },
      { senderId: 'host', text: "Yeah, I'll explain those right now. Do you have any questions so far?" }
    ]
  ],
  w3: [
    [
      { senderId: 'host', text: "Good morning. I am the Port State Control inspector." },
      { senderId: 'p1', text: "Good morning sir. Welcome aboard." },
      { senderId: 'p2', text: "We have all the certificates ready in the ship's office for you." },
      { senderId: 'host', text: "I need to see your oil record book first. Who is in charge here?" }
    ],
    [
      { senderId: 'host', text: "This life-saving equipment on the deck seems outdated." },
      { senderId: 'p2', text: "Sir, we just replaced all of them last month." },
      { senderId: 'p1', text: "Yeah, I saw the new ones in the storage room." },
      { senderId: 'host', text: "I need proof. Can you provide the official maintenance log?" }
    ]
  ],
  w4: [
    [
      { senderId: 'host', text: "We need this new feature shipped by Friday. It's urgent." },
      { senderId: 'p1', text: "Friday? That's technically impossible with our current architecture." },
      { senderId: 'p2', text: "But the marketing team already announced it to the public!" },
      { senderId: 'host', text: "We have to find a workaround. What's your technical assessment?" }
    ],
    [
      { senderId: 'p1', text: "This requirement is way too complex for a single sprint." },
      { senderId: 'host', text: "It's the core feature for our next release. We absolutely can't cut it." },
      { senderId: 'p2', text: "Maybe we can simplify the UI to save some development time?" },
      { senderId: 'host', text: "Good idea. What parts do you think we should cut or simplify?" }
    ]
  ],
  d1: [
    [
      { senderId: 'host', text: "Welcome to the postgraduate interview. Please take a seat." },
      { senderId: 'p1', text: "We are very interested in your research proposal on this topic." },
      { senderId: 'p2', text: "However, the methodology section seems a bit vague to me." },
      { senderId: 'host', text: "Could you elaborate on how you actually plan to conduct the experiments?" }
    ],
    [
      { senderId: 'host', text: "Let's move on to the English proficiency part of the interview." },
      { senderId: 'p2', text: "Please read the second paragraph of the literature provided." },
      { senderId: 'p1', text: "And then briefly summarize its main argument for us." },
      { senderId: 'host', text: "Take your time. You can start reading whenever you are ready." }
    ]
  ],
  d2: [
    [
      { senderId: 'host', text: "Hi! Welcome! What can I get started for you today?" },
      { senderId: 'p1', text: "I'll have a decaf soy latte with an extra shot of espresso." },
      { senderId: 'p2', text: "Wait, isn't decaf with an extra shot a contradiction?" },
      { senderId: 'host', text: "Haha, we get that a lot. And what would you like to order?" }
    ],
    [
      { senderId: 'p1', text: "Oh, look at their secret menu! The 'Pink Drink' sounds really fun." },
      { senderId: 'p2', text: "I'm just going to stick with my usual black coffee." },
      { senderId: 'host', text: "The Pink Drink is very popular today! Are you ready to order?" }
    ]
  ],
  d3: [
    [
      { senderId: 'host', text: "Lego's turnaround in the early 2000s is a classic business case." },
      { senderId: 'p1', text: "They almost went bankrupt before focusing back on the core brick." },
      { senderId: 'p2', text: "And partnering with franchises like Star Wars totally saved them." },
      { senderId: 'host', text: "Exactly. What do you think was their absolute smartest move?" }
    ],
    [
      { senderId: 'p2', text: "Disney's acquisition of Marvel and Star Wars was a massive risk at the time." },
      { senderId: 'host', text: "But it paid off by giving them unlimited content for Disney+." },
      { senderId: 'p1', text: "It completely transformed their revenue model forever." },
      { senderId: 'host', text: "Do you think they rely too much on established IPs now?" }
    ]
  ],
  d4: [
    [
      { senderId: 'host', text: "So, you are saying Mahjong is basically like Poker but with tiles?" },
      { senderId: 'p1', text: "I still don't get the scoring system. It seems way too complex." },
      { senderId: 'p2', text: "Yeah, and what's the deal with the winds and dragons?" },
      { senderId: 'host', text: "Can you explain the basic rules to us in a simple way?" }
    ],
    [
      { senderId: 'p2', text: "I heard Go is much harder for AI to master than Chess." },
      { senderId: 'p1', text: "Because the number of possible board configurations is practically infinite." },
      { senderId: 'host', text: "It's fascinating. But how do you actually win a game of Go?" },
      { senderId: 'p1', text: "I think you have to capture territory. Could you explain it simply?" }
    ]
  ],
  d5: [
    [
      { senderId: 'host', text: "My dog completely destroyed my favorite sneakers yesterday. I was so mad!" },
      { senderId: 'p1', text: "That's why I prefer cats. They just judge you silently from afar." },
      { senderId: 'p2', text: "At least dogs are genuinely excited to see you when you get home." },
      { senderId: 'host', text: "True. Do you have any funny pet stories to share with us?" }
    ],
    [
      { senderId: 'p2', text: "I'm seriously thinking about getting a Golden Retriever puppy." },
      { senderId: 'host', text: "They are great, but they shed hair everywhere in the house." },
      { senderId: 'p1', text: "And they need a lot of exercise. Are you ready for that commitment?" },
      { senderId: 'host', text: "What kind of pet do you think is the best for a small apartment?" }
    ]
  ]
};

let content = fs.readFileSync('src/app/chat/page.tsx', 'utf8');

for (const [id, conversations] of Object.entries(openingData)) {
  const idPattern = new RegExp(`(id:\\s*"${id}",[\\s\\S]*?tips:\\s*\\[[\\s\\S]*?\\]\\n\\s*)(\\})`, 'g');
  const replacement = `$1, openingConversations: ${JSON.stringify(conversations, null, 4).replace(/\\n/g, '\\n    ')} $2`;
  content = content.replace(idPattern, replacement);
}

fs.writeFileSync('src/app/chat/page.tsx', content, 'utf8');
console.log("File updated successfully.");
