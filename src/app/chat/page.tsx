'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Mic, ArrowLeft, Bot, Send, Search, MoreHorizontal, Coffee, MessageSquareText, Navigation, Sparkles, Plus, User as UserIcon, MessageCircle, FileText, Compass, X } from 'lucide-react'

// --- 场景定义数据 (适配高等职业教育) ---
const SCENARIOS = [
  // --- 职场 (Workplace) --- 
  { 
    id: "w1", 
    category: "professional", 
    isFeatured: true, 
    tag: "#职场面试", 
    difficulty: "困难", 
    mode: "语音", 
    memberCount: 52, 
    title: "外企英语面试：拿下 Offer", 
    description: "模拟真实外企面试流程，练习自我介绍、行为面试题及薪资谈判", 
    topic: "模拟真实外企面试流程，练习自我介绍、行为面试题及薪资谈判",
    source: "Workplace",
    characters: [
        { id: "host", name: "Rachel", avatar: "R", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Sheldon", avatar: "S", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Monica", avatar: "M", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Welcome to the interview. Let's start with a brief introduction.",
    cardBg: "bg-indigo-50",
    cardBorder: "border-indigo-100",
    tips: [
      "I have a solid background in...",
      "In my previous role, I was responsible for...",
      "What are the expectations for this role?",
      "I am looking for a competitive salary that reflects my experience."
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "Welcome to the final round of our interview. Thanks for joining us."
        },
        {
            "senderId": "p1",
            "text": "I've reviewed your resume. The technical background looks very solid."
        },
        {
            "senderId": "p2",
            "text": "But we also need to know how you handle high-pressure situations and teamwork."
        },
        {
            "senderId": "host",
            "text": "Exactly. Why don't you start by briefly introducing yourself?"
        }
    ],
    [
        {
            "senderId": "host",
            "text": "Hello and welcome! We have a few behavioral questions to go through today."
        },
        {
            "senderId": "p2",
            "text": "And I have some highly specific technical queries about your past projects."
        },
        {
            "senderId": "p1",
            "text": "Let's keep it conversational. Don't be nervous."
        },
        {
            "senderId": "host",
            "text": "Let's begin. Could you tell us about the most challenging project you've led?"
        }
    ]
] }, 
  { 
    id: "w2", 
    category: "professional", 
    isFeatured: true, 
    tag: "#生存通关", 
    difficulty: "简单", 
    mode: "语音", 
    memberCount: 18, 
    title: "完美避坑的交接班", 
    description: "用最精简的英语交代清楚进度、遗留问题和风险", 
    topic: "用最精简的英语交代清楚进度、遗留问题和风险",
    source: "Workplace",
    characters: [
        { id: "host", name: "Chandler", avatar: "C", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Leonard", avatar: "L", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Howard", avatar: "H", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Hi, let me walk you through the handover. I've left some notes on the pending issues.",
    cardBg: "bg-blue-50",
    cardBorder: "border-blue-100",
    tips: [
      "Here is the status of the current project.",
      "Please keep an eye on this pending issue.",
      "The main risk we are facing right now is...",
      "Let me know if you need any clarification."
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "Alright, my shift is almost over. Let's do a quick handover."
        },
        {
            "senderId": "p1",
            "text": "Is the database migration completely finished?"
        },
        {
            "senderId": "p2",
            "text": "I noticed some latency issues in the EU server logs."
        },
        {
            "senderId": "host",
            "text": "I've documented most of those issues. Are you ready to take over now?"
        }
    ],
    [
        {
            "senderId": "host",
            "text": "Hey guys, let's sync up quickly before I log off for the day."
        },
        {
            "senderId": "p2",
            "text": "Did the client approve the new UI design?"
        },
        {
            "senderId": "p1",
            "text": "We still have two pending bugs in the backlog that need attention."
        },
        {
            "senderId": "host",
            "text": "Yeah, I'll explain those right now. Do you have any questions so far?"
        }
    ]
] }, 
  { 
    id: "w3", 
    category: "professional", 
    isFeatured: true, 
    tag: "#高阶博弈", 
    difficulty: "困难", 
    mode: "语音", 
    memberCount: 30, 
    title: "应对港口国监督 (PSC) 盘问", 
    description: "针对航海专业：在高压下用严谨、无懈可击的英语回答连环追问", 
    topic: "针对航海专业：在高压下用严谨、无懈可击的英语回答连环追问",
    source: "Workplace",
    characters: [
        { id: "host", name: "Sheldon", avatar: "S", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Joey", avatar: "J", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Ross", avatar: "R", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Good morning, PSC Inspector here. Please prepare the logbooks and safety equipment for inspection.",
    cardBg: "bg-slate-100",
    cardBorder: "border-slate-200",
    tips: [
      "All logbooks are updated and ready for your inspection.",
      "The safety equipment was tested last week.",
      "We strictly follow the maritime safety regulations.",
      "Could you please specify which document you need?"
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "Good morning. I am the Port State Control inspector."
        },
        {
            "senderId": "p1",
            "text": "Good morning sir. Welcome aboard."
        },
        {
            "senderId": "p2",
            "text": "We have all the certificates ready in the ship's office for you."
        },
        {
            "senderId": "host",
            "text": "I need to see your oil record book first. Who is in charge here?"
        }
    ],
    [
        {
            "senderId": "host",
            "text": "This life-saving equipment on the deck seems outdated."
        },
        {
            "senderId": "p2",
            "text": "Sir, we just replaced all of them last month."
        },
        {
            "senderId": "p1",
            "text": "Yeah, I saw the new ones in the storage room."
        },
        {
            "senderId": "host",
            "text": "I need proof. Can you provide the official maintenance log?"
        }
    ]
] }, 
  { 
    id: "w4", 
    category: "professional", 
    isFeatured: false, 
    tag: "#跨界协同", 
    difficulty: "中等", 
    mode: "语音", 
    memberCount: 22, 
    title: "跟产品经理“相爱相杀”", 
    description: "练习如何有理有据地砍需求或解释技术难点", 
    topic: "练习如何有理有据地砍需求或解释技术难点",
    source: "Workplace",
    characters: [
        { id: "host", name: "Monica", avatar: "M", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Howard", avatar: "H", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Penny", avatar: "P", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Let's review the new requirements. I have some concerns regarding the technical feasibility.",
    cardBg: "bg-pink-50",
    cardBorder: "border-pink-100",
    tips: [
      "From a technical perspective, this might take longer than expected.",
      "Could we prioritize these features for the MVP?",
      "There are some constraints we need to consider.",
      "Let's find a compromise that works for both sides."
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "We need this new feature shipped by Friday. It's urgent."
        },
        {
            "senderId": "p1",
            "text": "Friday? That's technically impossible with our current architecture."
        },
        {
            "senderId": "p2",
            "text": "But the marketing team already announced it to the public!"
        },
        {
            "senderId": "host",
            "text": "We have to find a workaround. What's your technical assessment?"
        }
    ],
    [
        {
            "senderId": "p1",
            "text": "This requirement is way too complex for a single sprint."
        },
        {
            "senderId": "host",
            "text": "It's the core feature for our next release. We absolutely can't cut it."
        },
        {
            "senderId": "p2",
            "text": "Maybe we can simplify the UI to save some development time?"
        },
        {
            "senderId": "host",
            "text": "Good idea. What parts do you think we should cut or simplify?"
        }
    ]
] }, 

  // --- 日常 (Daily) --- 
  { 
    id: "d1", 
    category: "daily", 
    isFeatured: true, 
    tag: "#考研面试", 
    difficulty: "困难", 
    mode: "语音", 
    memberCount: 88, 
    title: "考研英语复试：最后冲刺", 
    description: "针对考研复试：练习自我介绍、导师提问及专业文献朗读口语", 
    topic: "针对考研复试：练习自我介绍、导师提问及专业文献朗读口语",
    source: "Daily Life",
    characters: [
        { id: "host", name: "Ross", avatar: "R", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Raj", avatar: "R", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Amy", avatar: "A", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Good morning. Please take a seat. Let's start with a brief self-introduction.",
    cardBg: "bg-rose-50",
    cardBorder: "border-rose-100",
    tips: [
      "It is a great honor to have this opportunity.",
      "My major is closely related to this research field.",
      "During my undergraduate studies, I focused on...",
      "I am highly motivated to pursue further studies here."
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "Welcome to the postgraduate interview. Please take a seat."
        },
        {
            "senderId": "p1",
            "text": "We are very interested in your research proposal on this topic."
        },
        {
            "senderId": "p2",
            "text": "However, the methodology section seems a bit vague to me."
        },
        {
            "senderId": "host",
            "text": "Could you elaborate on how you actually plan to conduct the experiments?"
        }
    ],
    [
        {
            "senderId": "host",
            "text": "Let's move on to the English proficiency part of the interview."
        },
        {
            "senderId": "p2",
            "text": "Please read the second paragraph of the literature provided."
        },
        {
            "senderId": "p1",
            "text": "And then briefly summarize its main argument for us."
        },
        {
            "senderId": "host",
            "text": "Take your time. You can start reading whenever you are ready."
        }
    ]
] }, 
  { 
    id: "d2", 
    category: "daily", 
    isFeatured: true, 
    tag: "#生存通关", 
    difficulty: "简单", 
    mode: "语音", 
    memberCount: 14, 
    title: "拿捏咖啡店隐藏菜单", 
    description: "基础口语：练习客制化点单，应对店员的连环提问", 
    topic: "基础口语：练习客制化点单，应对店员的连环提问",
    source: "Daily Life",
    characters: [
        { id: "host", name: "Penny", avatar: "P", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Phoebe", avatar: "P", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Gunther", avatar: "G", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Hi there! What can I get started for you today?",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-100",
    tips: [
      "Can I get a grande iced latte with oat milk?",
      "No whipped cream, please.",
      "Could you make it half-sweet?",
      "Is that for here or to go?"
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "Hi! Welcome! What can I get started for you today?"
        },
        {
            "senderId": "p1",
            "text": "I'll have a decaf soy latte with an extra shot of espresso."
        },
        {
            "senderId": "p2",
            "text": "Wait, isn't decaf with an extra shot a contradiction?"
        },
        {
            "senderId": "host",
            "text": "Haha, we get that a lot. And what would you like to order?"
        }
    ],
    [
        {
            "senderId": "p1",
            "text": "Oh, look at their secret menu! The 'Pink Drink' sounds really fun."
        },
        {
            "senderId": "p2",
            "text": "I'm just going to stick with my usual black coffee."
        },
        {
            "senderId": "host",
            "text": "The Pink Drink is very popular today! Are you ready to order?"
        }
    ]
] }, 
  { 
    id: "d3", 
    category: "daily", 
    isFeatured: true, 
    tag: "#深度思辨", 
    difficulty: "困难", 
    mode: "语音", 
    memberCount: 62, 
    title: "迪士尼与乐高的商业帝国", 
    description: "进阶口语：探讨企业绝境重生的心路历程与商业逻辑", 
    topic: "进阶口语：探讨企业绝境重生的心路历程与商业逻辑",
    source: "Daily Life",
    characters: [
        { id: "host", name: "Amy", avatar: "A", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Bernadette", avatar: "B", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Sheldon", avatar: "S", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "Let's explore how these massive brands managed to turn things around during their darkest hours.",
    cardBg: "bg-sky-50",
    cardBorder: "border-sky-100",
    tips: [
      "It's fascinating how they pivoted their core strategy.",
      "Their IP acquisition was a game-changer.",
      "They managed to leverage nostalgia effectively.",
      "What do you think was the turning point for them?"
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "Lego's turnaround in the early 2000s is a classic business case."
        },
        {
            "senderId": "p1",
            "text": "They almost went bankrupt before focusing back on the core brick."
        },
        {
            "senderId": "p2",
            "text": "And partnering with franchises like Star Wars totally saved them."
        },
        {
            "senderId": "host",
            "text": "Exactly. What do you think was their absolute smartest move?"
        }
    ],
    [
        {
            "senderId": "p2",
            "text": "Disney's acquisition of Marvel and Star Wars was a massive risk at the time."
        },
        {
            "senderId": "host",
            "text": "But it paid off by giving them unlimited content for Disney+."
        },
        {
            "senderId": "p1",
            "text": "It completely transformed their revenue model forever."
        },
        {
            "senderId": "host",
            "text": "Do you think they rely too much on established IPs now?"
        }
    ]
] }, 
  { 
    id: "d4", 
    category: "daily", 
    isFeatured: false, 
    tag: "#文化碰撞", 
    difficulty: "中等", 
    mode: "语音", 
    memberCount: 28, 
    title: "跟老外解释打麻将与围棋", 
    description: "中级口语：向外国友人输出传统文化，解释博弈乐趣", 
    topic: "中级口语：向外国友人输出传统文化，解释博弈乐趣",
    source: "Daily Life",
    characters: [
        { id: "host", name: "Stuart", avatar: "S", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Gunther", avatar: "G", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Joey", avatar: "J", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "So, Mahjong is basically a game of strategy, skill, and a bit of luck.",
    cardBg: "bg-red-50",
    cardBorder: "border-red-100",
    tips: [
      "It requires four players and a set of 144 tiles.",
      "The goal is to create specific combinations.",
      "It's not just about winning; it's a social activity.",
      "Go is much simpler in rules but infinitely complex in strategy."
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "So, you are saying Mahjong is basically like Poker but with tiles?"
        },
        {
            "senderId": "p1",
            "text": "I still don't get the scoring system. It seems way too complex."
        },
        {
            "senderId": "p2",
            "text": "Yeah, and what's the deal with the winds and dragons?"
        },
        {
            "senderId": "host",
            "text": "Can you explain the basic rules to us in a simple way?"
        }
    ],
    [
        {
            "senderId": "p2",
            "text": "I heard Go is much harder for AI to master than Chess."
        },
        {
            "senderId": "p1",
            "text": "Because the number of possible board configurations is practically infinite."
        },
        {
            "senderId": "host",
            "text": "It's fascinating. But how do you actually win a game of Go?"
        },
        {
            "senderId": "p1",
            "text": "I think you have to capture territory. Could you explain it simply?"
        }
    ]
] }, 
  { 
    id: "d5", 
    category: "daily", 
    isFeatured: false, 
    tag: "#生活碎片", 
    difficulty: "中等", 
    mode: "语音", 
    memberCount: 16, 
    title: "铲屎官的崩溃与治愈", 
    description: "社交口语：分享养拉布拉多的趣事与拆家经历", 
    topic: "社交口语：分享养拉布拉多的趣事与拆家经历",
    source: "Daily Life",
    characters: [
        { id: "host", name: "Ross", avatar: "R", role: "Host", bgColor: "bg-[#00BFA5]", borderColor: "border-[#00BFA5]" },
        { id: "p1", name: "Leonard", avatar: "L", role: "Participant", bgColor: "bg-slate-400", borderColor: "border-slate-400" },
        { id: "p2", name: "Chandler", avatar: "C", role: "Participant", bgColor: "bg-slate-300", borderColor: "border-slate-300" }
      ],
    greeting: "You won't believe what my dog did yesterday while I was at work.",
    cardBg: "bg-stone-50",
    cardBorder: "border-stone-100",
    tips: [
      "My dog completely chewed up the sofa cushions.",
      "It's so frustrating, but I can't stay mad at that face.",
      "Taking him for a walk is my favorite part of the day.",
      "Do you have any pets?"
    ]
  , openingConversations: [
    [
        {
            "senderId": "host",
            "text": "My dog completely destroyed my favorite sneakers yesterday. I was so mad!"
        },
        {
            "senderId": "p1",
            "text": "That's why I prefer cats. They just judge you silently from afar."
        },
        {
            "senderId": "p2",
            "text": "At least dogs are genuinely excited to see you when you get home."
        },
        {
            "senderId": "host",
            "text": "True. Do you have any funny pet stories to share with us?"
        }
    ],
    [
        {
            "senderId": "p2",
            "text": "I'm seriously thinking about getting a Golden Retriever puppy."
        },
        {
            "senderId": "host",
            "text": "They are great, but they shed hair everywhere in the house."
        },
        {
            "senderId": "p1",
            "text": "And they need a lot of exercise. Are you ready for that commitment?"
        },
        {
            "senderId": "host",
            "text": "What kind of pet do you think is the best for a small apartment?"
        }
    ]
] }
]

interface Message {
  id: string
  senderId: string // 'user' 或 character id
  senderName: string
  text: string
  isUser: boolean
  timestamp: Date
}

const DuoCard = ({ children, className = '', ...props }: any) => (
  <div className={`bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-4 md:p-6 focus-visible:ring-4 focus-visible:ring-black/20 outline-none ${className}`} {...props}>
    {children}
  </div>
)

const DuoBtn = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "font-extrabold rounded-2xl px-4 py-3 flex items-center justify-center transition-all duration-200 ease-out active:border-b-0 active:translate-y-1 focus-visible:ring-4 focus-visible:ring-black/20 outline-none"
  const variants: Record<string, string> = {
    primary: "bg-[#58cc02] hover:bg-[#46a302] text-white border-b-4 border-[#46a302]",
    secondary: "bg-[#1cb0f6] hover:bg-[#1899d6] text-white border-b-4 border-[#1899d6]",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-400",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 border-b-4",
    purple: "bg-[#ce82ff] hover:bg-[#a567cc] text-white border-b-4 border-[#a567cc]",
  }
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default function ChatRoom() {
  const router = useRouter()
  const supabase = createClient()
  
  // --- State ---
  const [activeTab, setActiveTab] = useState('featured')
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)

  // New states for Breaking News Room
  const [isPTTActive, setIsPTTActive] = useState(false)
  const [showLiveCaptions, setShowLiveCaptions] = useState(true)
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)
  const [liveCaptionText, setLiveCaptionText] = useState('')
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  const [showTips, setShowTips] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const playbackTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  
  // Typewriter references
  const aiTextRef = useRef('')
  const displayedTextRef = useRef('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isAiTyping, liveCaptionText])

  // Typewriter effect interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiTyping) {
      interval = setInterval(() => {
        if (displayedTextRef.current.length < aiTextRef.current.length) {
          // If lagging behind significantly (e.g. fast network chunk), type 2-3 chars at once, otherwise 1
          const diff = aiTextRef.current.length - displayedTextRef.current.length;
          const charsToAdd = diff > 15 ? 3 : (diff > 5 ? 2 : 1);
          
          displayedTextRef.current = aiTextRef.current.slice(0, displayedTextRef.current.length + charsToAdd);
          setLiveCaptionText(displayedTextRef.current);
        }
      }, 35); // 35ms per frame for natural reading speed
    }
    return () => clearInterval(interval);
  }, [isAiTyping]);

  // --- AI Logic ---
  const triggerAITurn = async (currentMessages: Message[], scenario: typeof SCENARIOS[0]) => {
    setIsAiTyping(true)
    setLiveCaptionText('')
    aiTextRef.current = ''
    displayedTextRef.current = ''
    
    // Default to the host if we don't know who speaks yet
    const hostId = scenario.characters[0].id
    setActiveSpeakerId(hostId)

    try {
      const systemPrompt = `You are playing multiple characters in a voice chat room. 
The scenario is: ${scenario.topic}
The characters present are: 
${scenario.characters.map(c => `- ${c.name} (${c.role})`).join('\n')}

Based on the conversation history, pick the most appropriate character to speak next. 
Respond ONLY in the following format:
SpeakerName: The dialogue text

Do not include any other text, actions, or translations. Keep the dialogue extremely concise, natural, and conversational (MAXIMUM 10 WORDS per reply).`

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...currentMessages.map(m => ({
          role: m.isUser ? 'user' : 'assistant',
          content: m.isUser ? m.text : `${m.senderName}: ${m.text}`
        }))
      ]

      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      abortControllerRef.current = new AbortController()

      const response = await fetch(`${supabaseUrl}/functions/v1/doubao-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          model: 'doubao-seed-2-0-mini-260215',
          messages: apiMessages
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error('Failed to fetch from Doubao')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullText = ''
      let detectedSpeakerName = ''
      let detectedSpeakerId = hostId

      let buffer = ''

      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || ''

          let updatedText = false

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
              try {
                const jsonStr = trimmedLine.slice(6)
                const data = JSON.parse(jsonStr)
                const token = data.choices?.[0]?.delta?.content
                
                if (token) {
                  fullText += token
                  updatedText = true
                }
              } catch (e) {
                // Ignore parse errors on incomplete JSON
                console.error("Parse error on line:", trimmedLine, e)
              }
            }
          }
          
          if (updatedText) {
            // Parse speaker name if not yet found
            if (!detectedSpeakerName && fullText.includes(':')) {
              const parts = fullText.split(':')
              detectedSpeakerName = parts[0].trim()
              // Find the matching character ID
              const char = scenario.characters.find(c => c.name.toLowerCase() === detectedSpeakerName.toLowerCase())
              if (char) {
                detectedSpeakerId = char.id
                setActiveSpeakerId(char.id)
              }
            }
            
            // Queue text for typewriter
            const targetDisplayText = detectedSpeakerName && fullText.startsWith(detectedSpeakerName) 
              ? fullText.replace(new RegExp(`^${detectedSpeakerName}\\s*:\\s*`, 'i'), '')
              : fullText

            aiTextRef.current = targetDisplayText
          }
        }
      }

      // Wait for typewriter to finish naturally
      while (displayedTextRef.current.length < aiTextRef.current.length) {
        await new Promise(r => setTimeout(r, 30))
      }
      
      // Slight pause for natural rhythm
      await new Promise(r => setTimeout(r, 200))

      // Add final message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: detectedSpeakerId,
        senderName: detectedSpeakerName || scenario.characters[0].name,
        text: aiTextRef.current,
        isUser: false,
        timestamp: new Date()
      }])

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('AI turn interrupted')
      } else {
        console.error('AI Error:', error)
      }
    } finally {
      setIsAiTyping(false)
      if (!isPTTActive) {
        setActiveSpeakerId(null)
      }
      setLiveCaptionText('')
    }
  }

  // --- Handlers ---
  const handleSelectScenario = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario)
    
    // Force text mode if it's a text scenario
    if (scenario.mode === '文本') {
      setIsKeyboardMode(true)
    } else {
      setIsKeyboardMode(false)
    }

    if (scenario.openingConversations && scenario.openingConversations.length > 0) {
        // Randomly pick one opening conversation
        const randomIndex = Math.floor(Math.random() * scenario.openingConversations.length);
        const conversation = scenario.openingConversations[randomIndex];
        
        const initialMessages: Message[] = conversation.map((msg: any, index: number) => {
          const character = scenario.characters.find(c => c.id === msg.senderId);
          return {
            id: Date.now().toString() + index,
            senderId: msg.senderId,
            senderName: character ? character.name : 'Unknown',
            text: msg.text,
            isUser: false,
            timestamp: new Date(Date.now() - (conversation.length - index) * 1000) // Stagger timestamps
          };
        });

        // Playback messages one by one
        let accumulatedDelay = 0;
        setMessages([]); // Start empty
        
        initialMessages.forEach((msg, index) => {
          // Delay per message: significantly faster to feel like a rapid chat
          const delayForThisMsg = index === 0 ? 200 : 500 + msg.text.length * 15;
          accumulatedDelay += delayForThisMsg;
          
          const timeoutId = setTimeout(() => {
            setMessages(prev => [...prev, msg]);
            setActiveSpeakerId(msg.senderId);
            setLiveCaptionText(msg.text);
            setIsAiTyping(false);
          }, accumulatedDelay);
          
          playbackTimeoutsRef.current.push(timeoutId);
          
          // If there's a gap before this message, we can show "typing" or just active speaker
          if (index > 0) {
            const preTimeoutId = setTimeout(() => {
              setActiveSpeakerId(msg.senderId);
              setIsAiTyping(true);
            }, Math.max(0, accumulatedDelay - delayForThisMsg + 200));
            playbackTimeoutsRef.current.push(preTimeoutId);
          }
        });
        
      } else {
      // Fallback if no opening conversation is defined
      const systemInitMsg: Message = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        text: 'User has joined the room. Please welcome them or start the discussion naturally.',
        isUser: true,
        timestamp: new Date()
      }
      setMessages([systemInitMsg])
      // Auto-start AI conversation
      triggerAITurn([systemInitMsg], scenario)
    }
  }

  const handleExitRoom = () => {
    // Clear any playing opening conversations
    playbackTimeoutsRef.current.forEach(clearTimeout)
    playbackTimeoutsRef.current = []
    
    setSelectedScenario(null)
    setMessages([])
    setInputText('')
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isAiTyping) return

    const newUserMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: 'You',
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    const newMessages = [...messages, newUserMsg]
    setMessages(newMessages)
    setInputText('')
    
    // Trigger AI response
    if (selectedScenario) {
      triggerAITurn(newMessages, selectedScenario)
    }
  }

  // --- Speech/PTT Handlers ---
  // In a real app, this would start/stop audio recording and send to STT
  const handlePTTStart = () => {
    setIsPTTActive(true)
    setActiveSpeakerId('user')
    // Interrupt AI if speaking or playback
    playbackTimeoutsRef.current.forEach(clearTimeout)
    playbackTimeoutsRef.current = []
    setIsAiTyping(false)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setLiveCaptionText('Listening...')
  }

  const handlePTTEnd = () => {
    setIsPTTActive(false)
    setActiveSpeakerId(null)
    setLiveCaptionText('')
    
    // Simulate STT result after speaking
    const simulatedSTT = "Hi everyone, thanks for having me."
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: 'You',
      text: simulatedSTT,
      isUser: true,
      timestamp: new Date()
    }

    const newMessages = [...messages, newUserMsg]
    setMessages(newMessages)
    
    // Trigger AI response based on what user said
    if (selectedScenario) {
      triggerAITurn(newMessages, selectedScenario)
    }
  }

  // --- UI 渲染 ---

  // 1. 场景选择页面 (Landing)
  if (!selectedScenario) {
    return (
      <div className="flex flex-col h-screen bg-white font-sans text-slate-700 antialiased">
        <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#F7F9FA] relative pb-[64px]">
          
          {/* Header (Sticky blurred) */}
          <header className="sticky top-0 z-40 bg-[#F7F9FA]/80 backdrop-blur-md flex justify-between items-center px-5 py-4 shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <UserIcon className="w-6 h-6 text-slate-500" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-wide">场景大厅</h1>
            <button className="w-10 h-10 rounded-full bg-[#00BFA5] text-white flex items-center justify-center shadow-md shadow-[#00BFA5]/30 active:scale-95 transition-transform">
              <Plus className="w-6 h-6" />
            </button>
          </header>

          {/* Hero Card */}
          <div className="px-5 mb-6 shrink-0">
            <div className="bg-gradient-to-br from-[#00BFA5] to-[#009688] rounded-[24px] p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-extrabold mb-1">口语实战舱</h2>
                <p className="font-bold opacity-90 text-sm">选择场景，即刻开口交流</p>
              </div>
              <Sparkles className="w-24 h-24 absolute -right-2 -bottom-4 opacity-20 text-white" />
            </div>
          </div>

          {/* Top Tabs */}
          <div className="flex gap-2 px-5 mb-4 shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'featured', label: '精选' },
              { id: 'daily', label: '日常' },
              { id: 'professional', label: '职场' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-extrabold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#00BFA5] text-white shadow-sm' 
                    : 'bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
            {SCENARIOS.filter(s => activeTab === 'featured' ? s.isFeatured : s.category === activeTab)
              .sort((a, b) => {
                const diffOrder = { '简单': 1, '中等': 2, '困难': 3 };
                return diffOrder[a.difficulty as keyof typeof diffOrder] - diffOrder[b.difficulty as keyof typeof diffOrder];
              })
              .map((scenario, index) => (
              <div 
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`cursor-pointer rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col border border-slate-100 ${scenario.cardBg || 'bg-white'}`}
              >
                {/* Top Row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm ${
                      scenario.difficulty === '简单' ? 'bg-[#eaffd7] text-[#58cc02]' :
                      scenario.difficulty === '中等' ? 'bg-[#fff5cc] text-[#ffc800]' :
                      'bg-[#ffeaeb] text-[#ff4b4b]'
                    }`}>
                      {scenario.difficulty}
                    </span>
                    <span className="bg-white/80 text-slate-700 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm">
                      {scenario.tag}
                    </span>
                    <span className="bg-slate-800 text-white rounded-full px-3 py-1 text-[11px] font-extrabold flex items-center gap-1 shadow-sm">
                      {scenario.mode === '语音' ? <Mic className="w-3 h-3" /> : <MessageSquareText className="w-3 h-3" />}
                      {scenario.mode}
                    </span>
                  </div>
                  <span className="bg-white/80 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-slate-600 flex items-center justify-center min-w-[24px] shadow-sm">
                    {scenario.memberCount} 人
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-1.5 leading-tight">{scenario.title}</h3>
                  <p className="text-sm font-bold text-slate-400 leading-snug line-clamp-2">{scenario.description}</p>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-center mt-auto border-t border-slate-50 pt-4">
                  {/* Host */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm ${scenario.characters[0].bgColor}`}>
                      {scenario.characters[0].avatar}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-slate-700 leading-none mb-1.5">{scenario.characters[0].name}</span>
                      <span className="text-xs font-bold text-slate-400 leading-none">Host</span>
                    </div>
                  </div>

                  {/* Participants Stack */}
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs z-20 bg-slate-300 shadow-sm">
                      {scenario.characters[1]?.avatar || 'C'}
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs z-10 bg-[#00BFA5] shadow-sm">
                      Y
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Nav Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50">
            <div className="flex justify-around items-center h-[64px] max-w-md mx-auto w-full">
              <div className="flex flex-col items-center justify-center gap-1 cursor-pointer flex-1" onClick={() => router.push('/')}>
                <div className="p-1.5">
                  <Compass className="w-[22px] h-[22px] text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">首页</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 cursor-pointer flex-1" onClick={() => router.push('/chat')}>
                <div className="p-1.5">
                  <MessageCircle className="w-[22px] h-[22px] text-[#00BFA5]" />
                </div>
                <span className="text-[10px] font-bold text-[#00BFA5]">聊天室</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 cursor-pointer flex-1" onClick={() => router.push('/resources')}>
                <div className="p-1.5">
                  <FileText className="w-[22px] h-[22px] text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">资源库</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 cursor-pointer flex-1" onClick={() => router.push('/profile')}>
                <div className="p-1.5">
                  <UserIcon className="w-[22px] h-[22px] text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">我的</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. 聊天室内页
  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] font-sans text-slate-700 antialiased">
      <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white relative">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors" onClick={handleExitRoom}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <div className="font-extrabold text-[15px] text-slate-800 tracking-tight">
              {selectedScenario.title}
            </div>
            <div className="text-[#00BFA5] font-bold text-[11px] flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA5]"></span>
              {selectedScenario.characters.length + 1} 人在线
            </div>
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className={`flex flex-col grow shrink basis-[0%] pt-3 px-3.5 bg-[#F7F9FA] overflow-y-auto ${isKeyboardMode ? 'pb-36' : 'pb-32'}`}>
          {/* Pinned Topic */}
          <div className="flex flex-col w-full rounded-[18px] gap-2.5 bg-white border border-slate-200 p-3 shadow-sm shrink-0 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-full py-1.5 px-2.5 bg-slate-100">
                  <span className="text-slate-800 font-black text-xs">
                    {selectedScenario.tag}
                  </span>
                </div>
                <div className="flex items-center rounded-full py-1.5 px-2.5 gap-1.5 bg-slate-800">
                  {selectedScenario.mode === '语音' ? <Mic className="w-3.5 h-3.5 text-white" /> : <MessageSquareText className="w-3.5 h-3.5 text-white" />}
                  <span className="text-white font-black text-xs">
                    {selectedScenario.mode === '语音' ? 'Voice' : 'Text'}
                  </span>
                </div>
              </div>
              <div className="flex items-center rounded-full py-1.5 px-2.5 bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-black text-xs">
                  Pinned
                </span>
              </div>
            </div>
            <div className="text-slate-800 font-extrabold text-[14px] leading-relaxed mt-1">
              {selectedScenario.topic}
            </div>
            <div className="flex gap-2 mt-1">
              <div 
                onClick={() => router.push(`/resources?tag=${encodeURIComponent(selectedScenario.tag)}`)}
                className="flex items-center rounded-xl py-2 px-2.5 gap-1.5 bg-slate-100 cursor-pointer active:scale-95 transition-transform"
              >
                <FileText className="w-3.5 h-3.5 text-slate-800" />
                <span className="text-slate-800 font-black text-xs">
                  媒体资源
                </span>
              </div>
              <div 
                onClick={() => setShowTips(true)}
                className="flex items-center rounded-xl py-2 px-2.5 gap-1.5 bg-slate-100 cursor-pointer active:scale-95 transition-transform"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                <span className="text-slate-800 font-black text-xs">
                  话术提示
                </span>
              </div>
            </div>
          </div>

          {!isKeyboardMode ? (
            <>
              {/* Voice Stage Grid */}
              <div className="flex flex-col w-full rounded-[18px] gap-3 bg-white border border-slate-200 p-3 shadow-sm mb-3 shrink-0">
                <div className="flex flex-wrap w-full gap-2.5 justify-center">
                  {selectedScenario.characters.map(bot => {
                    const isSpeaking = activeSpeakerId === bot.id;
                    const isInterruptedBot = isPTTActive;
                    return (
                      <div key={bot.id} className={`flex flex-col items-center justify-center w-[83px] h-[78px] rounded-2xl gap-1.5 bg-white border border-slate-200 shrink-0 transition-opacity duration-200 ${isInterruptedBot ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-white font-extrabold text-sm ${bot.bgColor} transition-all duration-300 ${isSpeaking ? 'ring-4 ring-opacity-30 ring-[#00BFA5] scale-110 shadow-lg' : ''}`}>
                          {bot.avatar}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-slate-800 font-extrabold text-[11px] truncate max-w-[60px]">{bot.name}</span>
                          {isSpeaking && !isInterruptedBot && (
                            <div className="w-1.5 h-1.5 bg-[#00BFA5] rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* YOU */}
                  <div className="flex flex-col items-center justify-center w-[83px] h-[78px] rounded-2xl gap-1.5 bg-white border border-slate-200 shrink-0">
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-white font-extrabold text-sm bg-[#00BFA5] transition-all duration-300 ${isPTTActive ? 'ring-4 ring-opacity-30 ring-[#00BFA5] scale-110 shadow-lg' : ''}`}>
                      Y
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-800 font-extrabold text-[11px] truncate max-w-[60px]">YOU</span>
                      {isPTTActive && (
                        <div className="w-1.5 h-1.5 bg-[#00BFA5] rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div className="flex flex-col w-full rounded-[18px] gap-2.5 bg-white border border-slate-200 shrink-0 p-3 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-slate-800 font-[950] text-[13px]">
                    Key points
                  </div>
                  <div className="text-slate-500 font-black text-xs cursor-pointer">
                    Expand
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-slate-800 font-extrabold text-xs">
                    • {selectedScenario.description}
                  </div>
                  <div className="text-slate-800 font-extrabold text-xs">
                    • Try to use professional vocabulary related to the topic.
                  </div>
                  <div className="text-slate-500 font-extrabold whitespace-pre-wrap text-xs opacity-70">
                    + Expand to see more vocabulary hints and examples.
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Text Mode Messages List
            <div className="flex flex-col grow shrink basis-[0%] gap-4 mb-4">
              <div className="flex justify-center py-2">
                <div className="flex rounded-full py-1 px-3 bg-slate-200/50">
                  <div className="text-slate-500 font-bold text-xs">
                    你已加入聊天室 · 文本模式
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                {messages.filter(m => m.senderId !== 'system').map((msg) => {
                  const char = selectedScenario.characters.find(c => c.id === msg.senderId)
                  const bgColor = char?.bgColor || 'bg-slate-300'
                  const avatar = char?.avatar || 'Y'
                  
                  return msg.isUser ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="flex flex-row-reverse max-w-[85%] gap-2.5">
                        <div className="flex items-center justify-center rounded-2xl bg-[#00BFA5] shrink-0 w-8 h-8 shadow-sm">
                          <div className="flex text-white font-extrabold text-[13px]">
                            Y
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="flex text-slate-400 font-bold text-[11px]">
                              {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="flex text-slate-800 font-extrabold text-[13px]">
                              You
                            </div>
                          </div>
                          <div className="flex text-right text-slate-800 font-bold text-[15px] leading-relaxed bg-white p-3 rounded-2xl rounded-tr-sm border border-slate-100 shadow-sm">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex gap-2.5">
                      <div className={`flex items-center justify-center rounded-2xl ${bgColor} shrink-0 w-8 h-8 shadow-sm`}>
                        <div className="flex text-white font-extrabold text-[13px]">
                          {avatar}
                        </div>
                      </div>
                      <div className="flex flex-col max-w-[85%] gap-1">
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-slate-800 font-extrabold text-[13px]">
                            {msg.senderName}
                          </div>
                          <div className="flex text-slate-400 font-bold text-[11px]">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className="flex text-left text-slate-800 font-bold text-[15px] leading-relaxed bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isAiTyping && (() => {
                  const activeChar = selectedScenario.characters.find(c => c.id === activeSpeakerId)
                  const bgColor = activeChar?.bgColor || 'bg-slate-200'
                  const avatar = activeChar?.avatar || <Bot className="w-4 h-4 text-slate-500" />
                  const name = activeChar?.name || 'AI'
                  
                  return (
                    <div className="flex gap-2.5">
                      <div className={`flex items-center justify-center rounded-2xl ${bgColor} shrink-0 w-8 h-8 shadow-sm`}>
                        {typeof avatar === 'string' ? (
                          <div className="flex text-white font-extrabold text-[13px]">{avatar}</div>
                        ) : avatar}
                      </div>
                      <div className="flex flex-col max-w-[85%] gap-1">
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-slate-800 font-extrabold text-[13px]">
                            {name}
                          </div>
                          <div className="flex text-slate-400 font-bold text-[11px]">
                            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className="flex text-left text-slate-800 font-bold text-[15px] leading-relaxed bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm min-h-[46px]">
                          {liveCaptionText ? (
                            <span>
                              {liveCaptionText}
                              <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#00BFA5] animate-pulse align-middle rounded-sm"></span>
                            </span>
                          ) : (
                            <div className="flex gap-1 items-center h-full px-1">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Live Captions Layer (Only in Voice Mode) */}
        {showLiveCaptions && !isKeyboardMode && (
          <div className="absolute left-5 right-5 bottom-28 flex flex-col z-20 pointer-events-none">
            <div className="flex flex-col w-full rounded-2xl py-3 px-4 gap-1.5 bg-slate-900/85 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center opacity-90 gap-2">
                  <div className="rounded-[3px] bg-red-500 shrink-0 w-1.5 h-1.5 animate-pulse" />
                  <div className="tracking-[0.4px] text-white font-[950] text-[11px] uppercase">
                    LIVE CAPTIONS · {isPTTActive ? 'YOU' : (selectedScenario.characters.find(c => c.id === activeSpeakerId)?.name || 'System')}
                  </div>
                </div>
                <div className="opacity-75 text-white font-[950] text-[11px]">
                  EN
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-white font-black text-[13px] leading-snug">
                  {isPTTActive ? liveCaptionText : (liveCaptionText || selectedScenario.greeting)}
                </div>
                <div className="opacity-70 text-white font-[850] text-[13px] leading-snug">
                  {isPTTActive ? '(Speak clearly into the microphone)' : (isAiTyping ? 'Thinking...' : 'Please respond when you are ready.')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className={`absolute bottom-0 flex items-center pt-3 pb-4 gap-2.5 bg-white border-t border-slate-200 px-4 inset-x-0 z-30 ${isKeyboardMode ? 'h-[110px] items-start' : 'h-24'}`}>
          {!isKeyboardMode ? (
            <>
              <div 
                onClick={() => setShowLiveCaptions(!showLiveCaptions)}
                className={`flex items-center justify-center rounded-[14px] border border-slate-200 shrink-0 w-12 h-12 cursor-pointer transition-colors ${showLiveCaptions ? 'bg-slate-100' : 'bg-white'}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="text-slate-800 font-[950] text-[11px]">
                    CC
                  </div>
                  <div className="text-slate-500 font-black text-[10px]">
                    EN
                  </div>
                </div>
              </div>
              
              <div 
                onPointerDown={handlePTTStart}
                onPointerUp={handlePTTEnd}
                onPointerLeave={() => {
                  if (isPTTActive) handlePTTEnd()
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex grow shrink basis-0 h-14 items-center justify-center rounded-[18px] cursor-pointer transition-all duration-200 select-none ${isPTTActive ? 'bg-[#009688] scale-[0.98]' : 'bg-[#00BFA5] shadow-sm shadow-[#00BFA5]/30 hover:bg-[#00BFA5]/90'}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="text-white font-[950] text-sm">
                    {isPTTActive ? 'Listening...' : 'Hold to talk'}
                  </div>
                  <div className="opacity-80 text-white font-[850] text-[11px]">
                    Release to mute
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2.5">
                <div 
                  onClick={() => setIsKeyboardMode(true)}
                  className="flex items-center justify-center rounded-[14px] bg-white border border-slate-200 shrink-0 w-12 h-12 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <MessageSquareText className="w-5 h-5 text-slate-800" />
                </div>
              </div>
            </>
          ) : (
            // Text Composer (Keyboard Mode)
            <div className="flex flex-col w-full h-full justify-between pb-2">
              <div className="flex gap-2 px-1 mb-1.5 overflow-x-auto no-scrollbar">
                <div className="flex rounded-full py-1.5 px-3 bg-slate-100 cursor-pointer active:scale-95 transition-transform shrink-0">
                  <span className="text-slate-800 font-bold text-xs">润色</span>
                </div>
                <div className="flex rounded-full py-1.5 px-3 bg-slate-100 cursor-pointer active:scale-95 transition-transform shrink-0">
                  <span className="text-slate-800 font-bold text-xs">纠错</span>
                </div>
                <div className="flex rounded-full py-1.5 px-3 bg-slate-100 cursor-pointer active:scale-95 transition-transform shrink-0">
                  <span className="text-slate-800 font-bold text-xs">解释</span>
                </div>
                <div className="flex rounded-full py-1.5 px-3 bg-slate-100 cursor-pointer active:scale-95 transition-transform shrink-0">
                  <span className="text-slate-800 font-bold text-xs">词汇</span>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div 
                  onClick={() => setIsKeyboardMode(false)}
                  className="flex items-center justify-center rounded-xl bg-slate-100 shrink-0 w-10 h-10 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <Mic className="w-5 h-5 text-slate-800" />
                </div>
                <div className="flex grow shrink basis-0 h-10 rounded-xl bg-slate-100 px-3 relative">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="用英文提问、表达观点或追问细节..."
                    className="w-full bg-transparent outline-none text-sm text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-bold"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isAiTyping}
                  className={`flex h-10 items-center justify-center rounded-xl px-4 font-black text-sm transition-colors ${!inputText.trim() || isAiTyping ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#00BFA5] text-white hover:bg-[#00BFA5]/90'}`}
                >
                  发送
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
      {/* Tips Bottom Sheet */}
      {showTips && selectedScenario && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity"
            onClick={() => setShowTips(false)}
          ></div>
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[70] p-6 pb-safe animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">推荐话术 (Tips)</h3>
                </div>
                <button 
                  onClick={() => setShowTips(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {selectedScenario.tips?.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 active:bg-slate-100 transition-colors cursor-pointer">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#00BFA5] shrink-0"></div>
                    <span className="text-slate-700 font-bold text-sm leading-relaxed">{tip}</span>
                  </div>
                ))}
                {(!selectedScenario.tips || selectedScenario.tips.length === 0) && (
                  <div className="text-center py-6 text-slate-400 font-bold text-sm">
                    暂无话术提示
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
