"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
// Client side component
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Play, Pause, X, Check, BookOpen, GraduationCap, LogOut, Trophy, ChevronRight, BarChart3, Shield, BrainCircuit, ArrowLeft, Target, Flame, Share2, Medal, Lightbulb, Compass, Headphones, Sparkles, Wand2, Bot } from 'lucide-react'
import html2canvas from 'html2canvas'

interface Snippet {
  filename: string
  start: number
  end: number
  duration: number
  text: string
  difficulty?: Difficulty
  translation?: string
  source?: string
  tags?: string[]
}

type AppMode = 'menu' | 'practice' | 'test' | 'stats' | 'map'
type Difficulty = 'easy' | 'medium' | 'hard'
type PracticeStage = 1 | 2 | 3

const CET4_DICT: Record<string, string> = {
  "injury": "n. 伤害，损伤",
  "injuries": "n. 伤害，损伤 (复数)",
  "report": "v. 报告",
  "reported": "v. 报告 (过去式/分词)",
  "panic": "n. 恐慌，惊慌",
  "accommodate": "v. 容纳，提供住宿，顾及",
  "customer": "n. 顾客",
  "customers": "n. 顾客 (复数)",
  "flight": "n. 航班，飞行",
  "secure": "adj. 安全的，稳固的 v. 获得",
  "escape": "v. 逃跑，逃脱",
  "escaped": "v. 逃跑 (过去式)",
  "relieve": "v. 缓解",
  "relieved": "adj. 放心的，宽慰的",
  "relief": "n. 宽慰，缓解",
  "strike": "n./v. 罢工，打击",
  "crash": "n./v. 坠毁，撞击",
  "captain": "n. 机长，船长",
  "slight": "adj. 轻微的",
  "slightly": "adv. 轻微地",
  "force": "v. 强迫",
  "forced": "adj. 被迫的",
  "landing": "n. 降落",
  "zoo": "n. 动物园",
  "loose": "adj. 松的 (on the loose: 逃亡中)",
  "split": "v. 分裂 (split second: 一瞬间)",
  "second": "n. 秒，第二",
  "environment": "n. 环境",
  "available": "adj. 可获得的",
  "opportunity": "n. 机会",
  "significant": "adj. 重要的",
  "tradition": "n. 传统",
  "traditional": "adj. 传统的",
  "community": "n. 社区",
  "benefit": "n. 利益，好处",
  "focus": "v./n. 集中，焦点",
  "decide": "v. 决定",
  "decision": "n. 决定",
  "research": "n. 研究",
  "develop": "v. 发展，开发",
  "development": "n. 发展",
  "require": "v. 要求",
  "requirement": "n. 要求",
  "success": "n. 成功",
  "successful": "adj. 成功的",
  "experience": "n. 经验，经历",
  "education": "n. 教育",
  "provide": "v. 提供",
  "include": "v. 包含",
  "important": "adj. 重要的",
  "information": "n. 信息",
  "technology": "n. 技术",
  "however": "adv. 然而",
  "result": "n. 结果",
  "increase": "v. 增加",
  "decrease": "v. 减少",
  "continue": "v. 继续",
  "process": "n. 过程",
  "effect": "n. 效果，影响",
  "affect": "v. 影响",
  "suggest": "v. 建议",
  "improve": "v. 改善",
  "consider": "v. 考虑",
  "expect": "v. 期待",
  "understand": "v. 理解",
  "probably": "adv. 大概",
  "different": "adj. 不同的",
  "difference": "n. 不同",
  "especially": "adv. 尤其",
  "sometimes": "adv. 有时",
  "usually": "adv. 通常",
  "always": "adv. 总是",
  "never": "adv. 从不",
  "almost": "adv. 几乎",
  "already": "adv. 已经",
  "although": "conj. 尽管",
  "though": "conj. 尽管",
  "because": "conj. 因为",
  "whether": "conj. 是否",
  "without": "prep. 没有",
  "within": "prep. 在...内",
  "against": "prep. 反对",
  "during": "prep. 在...期间",
  "toward": "prep. 向",
  "towards": "prep. 向",
  "behind": "prep. 在...后面",
  "beyond": "prep. 超出",
  "beside": "prep. 在...旁边",
  "between": "prep. 在...之间",
  "among": "prep. 在...之中",
  "through": "prep. 通过",
  "throughout": "prep. 贯穿",
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    const duration = 1500;
    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * (end - start) + start));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{displayValue}</>;
};

const isLiaison = (word1: string, word2: string) => {
  if (!word1 || !word2) return false;
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '');
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '');
  if (!w1 || !w2) return false;

  let endsWithConsonant = false;
  if (w1.endsWith('e')) {
    if (w1.length > 1 && /[bcdfghjklmnpqrstvwxyz]/.test(w1[w1.length - 2])) {
      endsWithConsonant = true;
    }
  } else if (/[bcdfghjklmnpqrstvwxyz]/.test(w1[w1.length - 1])) {
    endsWithConsonant = true;
  }

  const startsWithVowel = /^[aeiou]/.test(w2);
  return endsWithConsonant && startsWithVowel;
}

const isElision = (word1: string, word2: string) => {
  if (!word1 || !word2) return false;
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '');
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '');
  if (!w1 || !w2) return false;

  const endsWithPlosive = /[pbtdkg]/.test(w1[w1.length - 1]);
  const startsWithConsonant = /^[bcdfghjklmnpqrstvwxyz]/.test(w2);

  return endsWithPlosive && startsWithConsonant;
}

const RichSentence = ({ text, isCorrect, defaultColorClass = 'text-slate-700' }: { text: string, isCorrect: boolean | null, defaultColorClass?: string }) => {
  const words = text.split(' ');
  const colorClass = isCorrect === true ? 'text-[#58cc02]' : isCorrect === false ? 'text-[#ff4b4b]' : defaultColorClass;
  const tooltipColor = isCorrect === true ? 'bg-[#58cc02]' : isCorrect === false ? 'bg-[#ff4b4b]' : 'bg-slate-700';
  
  return (
    <div className={`flex flex-wrap items-end leading-[2.5] ${colorClass}`}>
      {words.map((word, idx) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase();
        const definition = CET4_DICT[cleanWord] || (cleanWord.endsWith('s') && CET4_DICT[cleanWord.slice(0, -1)]) || (cleanWord.endsWith('ed') && CET4_DICT[cleanWord.slice(0, -2)]);
        
        const hasLiaison = idx < words.length - 1 && isLiaison(word, words[idx + 1]);
        const hasElision = idx < words.length - 1 && !hasLiaison && isElision(word, words[idx + 1]);

        return (
          <div key={idx} className="flex items-center">
            {definition ? (
              <div className="relative group cursor-pointer">
                <span className="border-b-2 border-dashed border-current pb-0.5">{word}</span>
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs ${tooltipColor} text-white text-sm font-normal px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md`}>
                  {definition}
                  <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${tooltipColor} rotate-45`}></div>
                </div>
              </div>
            ) : (
              <span>{word}</span>
            )}
            
            {idx < words.length - 1 && (
              <span className="relative w-1.5 mx-0.5 flex justify-center text-slate-300 select-none">
                {hasLiaison && (
                  <span className="absolute -bottom-1 text-xl leading-none text-[#1cb0f6] font-normal" title="连读">‿</span>
                )}
                {hasElision && (
                  <span className="absolute bottom-0 text-xs leading-none text-slate-400 font-normal" title="略读/失去爆破">/</span>
                )}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const EnglishKnowledgeGraph = ({ baseScore, vocabScore, centerLabel }: { baseScore: number, vocabScore: number, centerLabel: string }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const s = (score: number) => Math.min(Math.max(Math.round(score), 0), 100);

  const nodes = useMemo(() => [
    { id: 'core', label: centerLabel + '综合听力', score: s(baseScore), x: 300, y: 300, r: 38, type: 'core' },
    { id: 'vocab', label: '词汇语料', score: s(vocabScore), x: 300, y: 160, r: 30, type: 'domain' },
    { id: 'grammar', label: '语法结构', score: s(baseScore + 10), x: 440, y: 300, r: 30, type: 'domain' },
    { id: 'sound', label: '语音解码', score: s(baseScore - 15), x: 300, y: 440, r: 30, type: 'domain' },
    { id: 'comp', label: '逻辑推断', score: s(baseScore), x: 160, y: 300, r: 30, type: 'domain' },
    { id: 'v1', label: '高频场景词', score: s(vocabScore + 5), x: 180, y: 80, r: 22, type: 'skill' },
    { id: 'v2', label: '同义替换', score: s(vocabScore - 10), x: 300, y: 50, r: 22, type: 'skill' },
    { id: 'v3', label: '固定搭配', score: s(vocabScore), x: 420, y: 80, r: 22, type: 'skill' },
    { id: 'g1', label: '长难句切分', score: s(baseScore - 10), x: 530, y: 180, r: 22, type: 'skill' },
    { id: 'g2', label: '时态语态', score: s(baseScore + 15), x: 560, y: 300, r: 22, type: 'skill' },
    { id: 'g3', label: '虚拟/倒装', score: s(baseScore - 5), x: 530, y: 420, r: 22, type: 'skill' },
    { id: 's1', label: '连读弱读', score: s(baseScore - 20), x: 420, y: 520, r: 22, type: 'skill' },
    { id: 's2', label: '失去爆破', score: s(baseScore - 10), x: 300, y: 550, r: 22, type: 'skill' },
    { id: 's3', label: '意群停顿', score: s(baseScore), x: 180, y: 520, r: 22, type: 'skill' },
    { id: 'c1', label: '细节捕获', score: s(baseScore + 5), x: 70, y: 420, r: 22, type: 'skill' },
    { id: 'c2', label: '主旨归纳', score: s(baseScore - 5), x: 40, y: 300, r: 22, type: 'skill' },
    { id: 'c3', label: '态度/推断', score: s(baseScore - 15), x: 70, y: 180, r: 22, type: 'skill' },
  ], [baseScore, vocabScore, centerLabel]);

  const links = useMemo(() => [
    { source: 'core', target: 'vocab' }, { source: 'core', target: 'grammar' },
    { source: 'core', target: 'sound' }, { source: 'core', target: 'comp' },
    { source: 'vocab', target: 'v1' }, { source: 'vocab', target: 'v2' }, { source: 'vocab', target: 'v3' },
    { source: 'grammar', target: 'g1' }, { source: 'grammar', target: 'g2' }, { source: 'grammar', target: 'g3' },
    { source: 'sound', target: 's1' }, { source: 'sound', target: 's2' }, { source: 'sound', target: 's3' },
    { source: 'comp', target: 'c1' }, { source: 'comp', target: 'c2' }, { source: 'comp', target: 'c3' },
    { source: 'v2', target: 'c1' }, { source: 's1', target: 'v3' },
    { source: 'g1', target: 'c2' }, { source: 's3', target: 'g1' },
    { source: 'v1', target: 'c3' }, { source: 'grammar', target: 'comp' },
    { source: 'sound', target: 'vocab' },
  ], []);

  const adj = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    nodes.forEach(n => map[n.id] = new Set());
    links.forEach(l => {
      map[l.source].add(l.target);
      map[l.target].add(l.source);
    });
    return map;
  }, [nodes, links]);

  const getColor = (score: number) => {
    if (score >= 80) return { fill: '#1cb0f6', border: '#1899d6', text: 'white', shadow: 'rgba(28,176,246,0.6)' };
    if (score >= 60) return { fill: '#ffc800', border: '#e5b400', text: 'white', shadow: 'rgba(255,200,0,0.6)' };
    return { fill: '#ff4b4b', border: '#ea2b2b', text: 'white', shadow: 'rgba(255,75,75,0.6)' };
  };

  const isHoveredOrNeighbor = (id: string) => {
    if (!hoveredNode) return true;
    if (hoveredNode === id) return true;
    return adj[hoveredNode].has(id);
  };

  const isLinkActive = (source: string, target: string) => {
    if (!hoveredNode) return false;
    return source === hoveredNode || target === hoveredNode;
  };

  return (
    <svg viewBox="0 0 600 600" className="w-full h-full overflow-visible font-sans">
      <style>{`
        @keyframes edge-flow { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        .graph-flow-active { stroke-dasharray: 8 4; animation: edge-flow 1s linear infinite; stroke: #1cb0f6; stroke-width: 3; }
        .graph-flow-idle { stroke: #e2e8f0; stroke-width: 2; }
      `}</style>
      
      {links.map((link, i) => {
        const sourceNode = nodes.find(n => n.id === link.source)!;
        const targetNode = nodes.find(n => n.id === link.target)!;
        const active = isLinkActive(link.source, link.target);
        const visible = hoveredNode ? active : true;
        
        return (
          <line
            key={`link-${i}`}
            x1={sourceNode.x} y1={sourceNode.y}
            x2={targetNode.x} y2={targetNode.y}
            className={`transition-all duration-300 ${active ? 'graph-flow-active' : 'graph-flow-idle'}`}
            style={{ opacity: visible ? (active ? 0.9 : 0.4) : 0.1 }}
          />
        );
      })}

      {nodes.map(node => {
        const colors = getColor(node.score);
        const active = isHoveredOrNeighbor(node.id);
        const hovered = hoveredNode === node.id;
        
        return (
          <g 
            key={node.id} 
            className="cursor-pointer transition-all duration-500 ease-out"
            style={{ 
              opacity: active ? 1 : 0.2,
              transform: hovered ? 'scale(1.15)' : 'scale(1)',
              transformOrigin: `${node.x}px ${node.y}px`
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle 
              cx={node.x} cy={node.y} r={node.r} 
              fill={colors.fill} 
              stroke={colors.border} 
              strokeWidth={hovered ? 4 : 3}
              className="transition-all duration-300"
              style={{ filter: active ? `drop-shadow(0 0 10px ${colors.shadow})` : 'none' }}
            />
            <text 
              x={node.x} y={node.y} 
              textAnchor="middle" dy=".35em" 
              fill="white" fontSize={node.type === 'core' ? 18 : 13} fontWeight="900"
            >
              {node.score}%
            </text>
            <rect 
              x={node.x - 35} y={node.y + node.r + 4} 
              width="70" height="20" rx="6" 
              fill="white" fillOpacity="0.9"
              className="pointer-events-none border border-slate-200"
            />
            <text 
              x={node.x} y={node.y + node.r + 18} 
              textAnchor="middle" 
              fill="#64748b" fontSize="12" fontWeight="bold"
              className="pointer-events-none"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DictationPage() {
  const [allSnippets, setAllSnippets] = useState<Snippet[]>([])
  const [activeSnippets, setActiveSnippets] = useState<Snippet[]>([])
  const [mode, setMode] = useState<AppMode>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<any[]>([]) // Can be string[] or { [key: number]: string }[]
  const [showAnswer, setShowAnswer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [testSubmitted, setTestSubmitted] = useState(false)
  
  const [stats, setStats] = useState<any>(null)
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [resumePrompt, setResumePrompt] = useState<{show: boolean, diff: Difficulty | null}>({show: false, diff: null})
  
  // Leaderboard & Vanity Card
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [showVanityCard, setShowVanityCard] = useState(false)
  const [vanityImageUrl, setVanityImageUrl] = useState<string | null>(null)
  const [generatingVanity, setGeneratingVanity] = useState(false)
  
  // Practice Level Map State
  const [currentStage, setCurrentStage] = useState<PracticeStage>(3)
  const [practiceProgress, setPracticeProgress] = useState<Record<string, number>>({}) // Key: 'easy-group0', Value: highest completed stage (0-3)
  const [testSubMode, setTestSubMode] = useState<'random' | 'exam'>('random')
  const [isExamPractice, setIsExamPractice] = useState(false)
  const [isCustomTagPractice, setIsCustomTagPractice] = useState(false)
  const [showNodeCompletion, setShowNodeCompletion] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [estimatedScore, setEstimatedScore] = useState<number | null>(null)
  const [todayProgress, setTodayProgress] = useState<number>(0)
  const [isReviewSession, setIsReviewSession] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // AI Stats Analysis State
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportLoadingPhase, setReportLoadingPhase] = useState(0)
  const [lastTestCount, setLastTestCount] = useState<number>(0)

  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const [ctaConfig, setCtaConfig] = useState<{
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    action: () => void;
  }>({
    label: '开始今日练习',
    icon: <Play className="w-6 h-6 fill-current ml-1" />,
    colorClass: 'bg-[#58cc02] hover:bg-[#46a302] border-[#46a302]',
    action: () => handlePracticeClick('medium')
  });

  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null)
  const vanityCardRef = useRef<HTMLDivElement>(null)

  const AUDIO_BASE_URL = "https://cdn.jsdelivr.net/gh/gaozhiyan/cet4-audios@main"

  const loadFullStats = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        
      if (data && !error) {
        let totalQuestions = 0;
        let successCount = 0;
        let almostCount = 0;
        let failedCount = 0;
        
        const validTests = data.filter(test => test.mode === 'test');
        
        let latestAiReport: any = null;
        data.forEach(test => {
          if (test.mode === 'ai_report' && !latestAiReport) {
            latestAiReport = test.details;
          }
        });

        validTests.forEach(test => {
          const detailsArr = Array.isArray(test.details) ? test.details : (test.details?.answers || []);
          if (Array.isArray(detailsArr)) {
            detailsArr.forEach((d: any) => {
              totalQuestions++;
              if (d.score >= 90) successCount++;
              else if (d.score >= 80) almostCount++;
              else failedCount++;
            })
          }
        })
        
        setStats({
          totalQuestions,
          successCount,
          almostCount,
          failedCount,
          tests: validTests,
          latestAiReport
        })
        setLastTestCount(validTests.length);
      }
    } catch (err) {
      console.error("加载战绩失败:", err)
    }
  }, [supabase])

  const fetchDashboardStats = useCallback(async (userId: string) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayData } = await supabase
        .from('scores')
        .select('details')
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString());

      if (todayData) {
        let count = 0;
        todayData.forEach(row => {
          if (row.details?.answers) {
            count += row.details.answers.length;
          } else if (row.details?.total_questions) {
            count += row.details.total_questions;
          }
        });
        setTodayProgress(count);
      }

      const { data: recentData } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (recentData && recentData.length > 0) {
        const avgScore = recentData.reduce((acc, row) => acc + row.score, 0) / recentData.length;
        setEstimatedScore(Math.round((avgScore / 100) * 248.5));
      } else {
        setEstimatedScore(0);
      }
    } catch (err) {
      console.error("加载个人看板数据失败:", err);
    }
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        fetchDashboardStats(session.user.id)
        loadFullStats(session.user.id)
      }
    }
    checkUser()

    Promise.all([
      fetch('/data/202406-set1.json').then(res => res.json()),
      fetch('/data/202406-set2.json').then(res => res.json()),
      fetch('/data/202512-set1.json').then(res => res.json()),
      fetch('/data/202506-set2.json').then(res => res.json())
    ]).then(([set1, set2, set3, set4]) => {
      const allData = [...set1, ...set2, ...set3, ...set4]
      const filteredData = allData.filter((snippet: Snippet) => {
        const wordCount = snippet.text.replace(/[^a-zA-Z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean).length;
        return wordCount > 2;
      })
      setAllSnippets(filteredData)
    }).catch(err => {
      console.error("加载数据失败:", err)
    })
  }, [router, supabase])

  useEffect(() => {
    if (mode === 'menu' && user) {
      fetchDashboardStats(user.id);
    }
  }, [mode, user]);

  useEffect(() => {
    const checkCtaState = async () => {
      const resumeKey = user ? `cet4_exam_resume_${user.id}` : 'cet4_exam_resume_guest';
      const savedExamStr = localStorage.getItem(resumeKey);
      if (savedExamStr) {
        try {
          const savedExam = JSON.parse(savedExamStr);
          if (savedExam && savedExam.examId) {
            const examTitleMap: Record<string, string> = {
              '202512set1': '2025年12月第一套',
              '202506set2': '2025年6月第二套',
              '202406set1': '2024年6月第一套',
              '202406set2': '2024年6月第二套'
            };
            const title = examTitleMap[savedExam.examId] || '真题演练';
            setCtaConfig({
              label: `继续 ${title}`,
              icon: <Play className="w-6 h-6 fill-current ml-1" />,
              colorClass: 'bg-[#ce82ff] hover:bg-[#b875e6] border-[#b875e6]',
              action: () => router.push(`/exam/${savedExam.examId}`)
            });
            return;
          }
        } catch (e) {}
      }

      if (user) {
        try {
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
          const { data, error } = await supabase
            .from('scores')
            .select('details')
            .eq('user_id', user.id)
            .eq('mode', 'practice')
            .lt('score', 90)
            .gte('created_at', threeDaysAgo);
          
          if (!error && data && data.length > 0) {
            const mistakeTexts = new Set<string>();
            data.forEach(row => {
              const answers = row.details?.answers || [];
              answers.forEach((ans: any) => {
                if (ans.score < 90 && ans.expected) {
                  mistakeTexts.add(ans.expected);
                }
              });
            });
            
            if (mistakeTexts.size > 0) {
              setCtaConfig({
                label: `靶向错题 Boss战 (${mistakeTexts.size}题)`,
                icon: <Flame className="w-6 h-6 text-white" />,
                colorClass: 'bg-[#ff4b4b] hover:bg-[#ea2b2b] border-[#ea2b2b]',
                action: startReviewSession
              });
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      setCtaConfig({
        label: '开始今日练习',
        icon: <Play className="w-6 h-6 fill-current ml-1" />,
        colorClass: 'bg-[#58cc02] hover:bg-[#46a302] border-[#46a302]',
        action: () => handlePracticeClick('medium')
      });
    };

    // run whenever user state resolves
    if (user !== undefined) {
      checkCtaState();
    }
  }, [user, router, supabase]);

  useEffect(() => {
    if (mode === 'practice' && activeSnippets.length > 0) {
      localStorage.setItem(`practice_progress_${difficulty}`, JSON.stringify({
        currentIndex,
        answers,
        snippetOrder: activeSnippets.map(s => s.text)
      }))
    }
  }, [currentIndex, answers, mode, difficulty, activeSnippets])

  // Handle URL Parameters for Practice (e.g. from listening page)
  useEffect(() => {
    if (allSnippets.length > 0 && mode === 'menu') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlMode = searchParams.get('mode');
      const urlTag = searchParams.get('tag');
      const returnTo = searchParams.get('returnTo');

      if (urlMode === 'practice' && urlTag) {
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);

        if (returnTo) {
          localStorage.setItem('practice_return_to', returnTo);
        }

        // Allow partial matches (e.g. "国际邮轮乘务" matches "国际邮轮乘务管理")
        const filteredByTag = allSnippets.filter(s => s.tags && s.tags.some(t => t.includes(urlTag) || urlTag.includes(t)));
        
        let practiceSnippets = [];
        if (filteredByTag.length > 0) {
          // Shuffle and pick a reasonable amount, e.g. 5 questions for practice
          practiceSnippets = [...filteredByTag].sort(() => Math.random() - 0.5).slice(0, 5);
        } else {
          // Fallback if no matching tags found: alert user and use random snippets
          alert(`暂未找到完全匹配【${urlTag}】的专属听写语料，已为你随机抽取通用听力进行训练。`);
          practiceSnippets = [...allSnippets].sort(() => Math.random() - 0.5).slice(0, 5);
        }

        setMode('practice');
        setDifficulty('medium'); // Default difficulty
        setActiveSnippets(practiceSnippets);
        setCurrentIndex(0);
        setAnswers(Array(practiceSnippets.length).fill(''));
        setTestSubmitted(false);
          setCurrentStage(3); // Default to full dictation for professional custom
          setIsCustomTagPractice(true);
          return;
        }
    }
  }, [allSnippets, mode]);

  // Check if we need to auto-jump to a specific practice sentence
  useEffect(() => {
    if (mode === 'menu' && allSnippets.length > 0) {
      const targetSentence = localStorage.getItem('practice_target_sentence')
      const targetDiff = localStorage.getItem('practice_target_difficulty')
      
      if (targetSentence && targetDiff) {
        localStorage.removeItem('practice_target_sentence')
        localStorage.removeItem('practice_target_difficulty')
        
        // Find the sentence in the specific difficulty list
        let filtered = allSnippets.filter(s => s.difficulty === targetDiff || (!s.difficulty && ((targetDiff === 'easy' && s.duration <= 5) || (targetDiff === 'medium' && s.duration > 5 && s.duration <= 10) || (targetDiff === 'hard' && s.duration > 10))))
        
        const targetIdx = filtered.findIndex(s => s.text === targetSentence)
        
        if (targetIdx !== -1) {
          const target = filtered[targetIdx]
          filtered.splice(targetIdx, 1)
          // 把剩下的打乱
          filtered = [...filtered].sort(() => Math.random() - 0.5)
          // 把目标句放在第一题
          filtered.unshift(target)

          setMode('practice')
          setDifficulty(targetDiff as Difficulty)
          setActiveSnippets(filtered)
          setCurrentIndex(0)
          setAnswers(Array(filtered.length).fill(''))
          setTestSubmitted(false)
        }
      }
    }
  }, [mode, allSnippets])

  // Timer Effect
  useEffect(() => {
    if (mode === 'test' && timeLeft !== null && timeLeft > 0 && !testSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    } else if (mode === 'test' && timeLeft === 0 && !testSubmitted) {
      handleSubmitTest()
    }
  }, [mode, timeLeft, testSubmitted])

  useEffect(() => {
    // Load practice map progress
    const savedProgress = localStorage.getItem('practice_map_progress');
    if (savedProgress) {
      try {
        setPracticeProgress(JSON.parse(savedProgress));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const savedStreak = localStorage.getItem(`cet4_streak_${user.id}`);
      if (savedStreak) {
        try {
          const { count, lastDate } = JSON.parse(savedStreak);
          if (lastDate === today) {
            setStreakCount(count);
          } else if (lastDate === yesterday) {
            setStreakCount(count); // Still valid streak, wait for them to update today
          } else {
            setStreakCount(0); // Streak broken
            localStorage.setItem(`cet4_streak_${user.id}`, JSON.stringify({ count: 0, lastDate: null }));
          }
        } catch (e) {}
      }
    }
  }, [user]);

  const updateStreak = () => {
    if (!user) return 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const savedStreak = localStorage.getItem(`cet4_streak_${user.id}`);
    let currentCount = 0;
    let lastDate = null;
    
    if (savedStreak) {
      try {
        const parsed = JSON.parse(savedStreak);
        currentCount = parsed.count;
        lastDate = parsed.lastDate;
      } catch (e) {}
    }
    
    if (lastDate !== today) {
      let newCount = 1;
      if (lastDate === yesterday) {
        newCount = currentCount + 1;
      }
      setStreakCount(newCount);
      localStorage.setItem(`cet4_streak_${user.id}`, JSON.stringify({ count: newCount, lastDate: today }));
      return newCount;
    }
    return currentCount;
  };

  const updatePracticeProgress = (groupKey: string, completedStage: number) => {
    setPracticeProgress(prev => {
      const currentHighest = prev[groupKey] || 0;
      if (completedStage > currentHighest) {
        const next = { ...prev, [groupKey]: completedStage };
        localStorage.setItem('practice_map_progress', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }

  const startSession = (selectedMode: AppMode, selectedDiff: Difficulty | string, resume: boolean = false, groupIndex: number = 0, stage: PracticeStage = 3, examSource?: string) => {
    let filtered = allSnippets;

    if (examSource) {
      filtered = allSnippets.filter(s => s.source === examSource)
      if (selectedMode === 'test') {
        // 真题精听（模拟测试）：每组试卷随机选择 20 题
        filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    } else {
      filtered = allSnippets.filter(s => s.difficulty === selectedDiff)
      
      if (filtered.length === 0) {
        if (selectedDiff === 'easy') {
          filtered = allSnippets.filter(s => s.duration <= 5)
        } else if (selectedDiff === 'medium') {
          filtered = allSnippets.filter(s => s.duration > 5 && s.duration <= 10)
        } else {
          filtered = allSnippets.filter(s => s.duration > 10)
        }
      }
    }

    if (selectedMode === 'test') {
      if (!examSource) {
        // 随机模式：统一10题
        filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 10)
      }
      setTimeLeft(40 * 60) // 40 minutes
    } else {
      setTimeLeft(null)
      
      if (selectedMode === 'practice' && !examSource) {
        // Group into chunks of 5
        const startIndex = groupIndex * 5;
        filtered = filtered.slice(startIndex, startIndex + 5);
        setCurrentStage(stage);
      } else if (selectedMode === 'practice' && examSource) {
        setCurrentStage(3); // Set stage to 3 for exam practice
      }
    }

    setActiveSnippets(filtered)
    setDifficulty(selectedDiff as Difficulty)
    setMode(selectedMode)
    setAnswers(Array.from({ length: filtered.length }, () => selectedMode === 'practice' ? (stage === 1 ? [] : stage === 2 ? {} : '') : ''))
    setCurrentIndex(0)
    setIsExamPractice(!!examSource)
    setShowHint(false)

    setShowAnswer(false)
    setTestSubmitted(false)
    setIsPlaying(false)
    setIsReviewSession(false)
  }

  const handlePracticeClick = (diff: Difficulty) => {
    setDifficulty(diff);
    setMode('map');
  }

  const handleResume = (resume: boolean) => {
    if (resumePrompt.diff) {
      startSession('practice', resumePrompt.diff, resume)
    }
    setResumePrompt({ show: false, diff: null })
  }

  const startReviewSession = async () => {
    if (!user) return;
    
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('scores')
        .select('details')
        .eq('user_id', user.id)
        .eq('mode', 'practice')
        .lt('score', 90)
        .gte('created_at', threeDaysAgo);

      if (error) {
        console.error("Error fetching mistakes:", error);
        alert("加载错题失败，请重试。");
        return;
      }

      const mistakeTexts = new Set<string>();
      if (data && data.length > 0) {
        data.forEach(row => {
          const answers = row.details?.answers || [];
          answers.forEach((ans: any) => {
            if (ans.score < 90 && ans.expected) {
              mistakeTexts.add(ans.expected);
            }
          });
        });
      }

      let reviewSnippets = allSnippets.filter(s => mistakeTexts.has(s.text));

      if (reviewSnippets.length === 0) {
        alert("太棒了！最近三天没有错题，为您推荐全员易错题！");
        
        // Fetch global practice scores to compute highest error rate questions
        // Limit to 2000 recent records for a good sample size without overloading
        const { data: globalData, error: globalError } = await supabase
          .from('scores')
          .select('score, details')
          .eq('mode', 'practice')
          .order('created_at', { ascending: false })
          .limit(2000);

        if (globalData && !globalError && globalData.length > 0) {
          const errorStats = new Map<string, { total: number, wrong: number }>();
          
          globalData.forEach(row => {
            const answers = row.details?.answers || [];
            answers.forEach((ans: any) => {
              if (ans.expected) {
                if (!errorStats.has(ans.expected)) {
                  errorStats.set(ans.expected, { total: 0, wrong: 0 });
                }
                const stats = errorStats.get(ans.expected)!;
                stats.total++;
                if ((ans.score ?? row.score) < 90) {
                  stats.wrong++;
                }
              }
            });
          });

          // Sort by wrong rate, require at least 3 attempts to filter noise
          const sortedGlobalMistakes = Array.from(errorStats.entries())
            .filter(([_, stats]) => stats.total >= 3)
            .sort((a, b) => {
              const rateA = a[1].wrong / a[1].total;
              const rateB = b[1].wrong / b[1].total;
              if (rateB !== rateA) return rateB - rateA;
              return b[1].wrong - a[1].wrong; // tie-breaker: total wrong count
            })
            .slice(0, 5)
            .map(entry => entry[0]);
            
          reviewSnippets = allSnippets.filter(s => sortedGlobalMistakes.includes(s.text));
        }
      }

      if (reviewSnippets.length === 0) {
        alert("太棒了！最近三天没有错题，且没有足够的全局数据。");
        return;
      }

      // Shuffle and limit to 10 max (or 5 if from global)
      reviewSnippets = reviewSnippets.sort(() => 0.5 - Math.random()).slice(0, 10);

      setActiveSnippets(reviewSnippets);
      setMode('practice');
      setCurrentStage(3); // Hardest stage for review (full dictation)
      setDifficulty('medium'); // Dummy value
      setCurrentIndex(0);
      setAnswers(Array(reviewSnippets.length).fill(''));
      setTestSubmitted(false);
      setIsPlaying(false);
      setIsReviewSession(true);
      setIsExamPractice(false);
    } catch (err) {
      console.error(err);
      alert("加载错题失败，请重试。");
    }
  }

  const startTestReviewSession = async () => {
    if (!user) return;
    
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('scores')
        .select('details')
        .eq('user_id', user.id)
        .in('mode', ['practice', 'test'])
        .lt('score', 90)
        .gte('created_at', threeDaysAgo);

      if (error) {
        console.error("Error fetching mistakes:", error);
        alert("加载错题失败，请重试。");
        return;
      }

      const mistakeTexts = new Set<string>();
      if (data && data.length > 0) {
        data.forEach(row => {
          const answers = row.details?.answers || [];
          answers.forEach((ans: any) => {
            if (ans.score < 90 && ans.expected) {
              mistakeTexts.add(ans.expected);
            }
          });
        });
      }

      let reviewSnippets = allSnippets.filter(s => mistakeTexts.has(s.text));

      if (reviewSnippets.length === 0) {
        alert("太棒了！最近三天没有错题，为您推荐全员易错题！");
        
        const { data: globalData, error: globalError } = await supabase
          .from('scores')
          .select('score, details')
          .eq('mode', 'test')
          .order('created_at', { ascending: false })
          .limit(2000);

        if (globalData && !globalError && globalData.length > 0) {
          const errorStats = new Map<string, { total: number, wrong: number }>();
          
          globalData.forEach(row => {
            const answers = row.details?.answers || [];
            answers.forEach((ans: any) => {
              if (ans.expected) {
                if (!errorStats.has(ans.expected)) {
                  errorStats.set(ans.expected, { total: 0, wrong: 0 });
                }
                const stats = errorStats.get(ans.expected)!;
                stats.total++;
                if ((ans.score ?? row.score) < 90) {
                  stats.wrong++;
                }
              }
            });
          });

          const sortedGlobalMistakes = Array.from(errorStats.entries())
            .filter(([_, stats]) => stats.total >= 3)
            .sort((a, b) => {
              const rateA = a[1].wrong / a[1].total;
              const rateB = b[1].wrong / b[1].total;
              if (rateB !== rateA) return rateB - rateA;
              return b[1].wrong - a[1].wrong;
            })
            .slice(0, 20)
            .map(entry => entry[0]);
            
          reviewSnippets = allSnippets.filter(s => sortedGlobalMistakes.includes(s.text));
        }
      }

      if (reviewSnippets.length === 0) {
        alert("太棒了！最近三天没有错题，且没有足够的全局数据。");
        return;
      }

      if (reviewSnippets.length > 0) {
        const testSnippets = reviewSnippets.sort(() => 0.5 - Math.random()).slice(0, 20);
        setMode('practice')
        setDifficulty('medium')
        setActiveSnippets(testSnippets)
        setCurrentIndex(0)
        setAnswers(Array(testSnippets.length).fill(''))
        setTestSubmitted(false)
        setIsReviewSession(true)
        setTimeLeft(40 * 60)
      }
    } catch (err) {
      console.error("加载错题失败:", err);
      alert("加载错题失败，请重试。");
    }
  }

  const viewStats = async () => {
    setMode('stats')
    setLoadingStats(true)
    if (user && !stats) {
      await loadFullStats(user.id)
    }
    setLoadingStats(false)
  }

  const generateAiReport = async () => {
    if (!stats || !stats.tests || stats.tests.length === 0) return;
    
    setIsGeneratingReport(true);
    setAiReport("");
    
    // Extract up to 20 recent mistakes
    let mistakes = [];
    for (const test of stats.tests) {
      if (mistakes.length >= 20) break;
      const detailsArr = Array.isArray(test.details) ? test.details : (test.details?.answers || []);
      if (Array.isArray(detailsArr)) {
        for (const ans of detailsArr) {
          if (mistakes.length >= 20) break;
          if (ans.score < 90 && ans.actual && ans.expected) {
            mistakes.push({
              expected: ans.expected,
              actual: ans.actual,
              score: ans.score
            });
          }
        }
      }
    }

    if (mistakes.length === 0) {
      setAiReport("太棒了！在你最近的测试记录中没有发现明显的错题，继续保持！🎯");
      setIsGeneratingReport(false);
      return;
    }

    // 检查缓存
    // 缓存失效条件：按月缓存，并且从 Supabase 获取
    const currentMonth = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    
    const weaknessTemplates = [
      "当前主要瓶颈在于 **{weakness}**。",
      "分析发现，你最近在 **{weakness}** 上失分较多。",
      "你的基础不错，但 **{weakness}** 拖了后腿。",
      "系统定位到你的核心盲区是：**{weakness}**。"
    ];

    const planTemplates = [
      "建议接下来的重点是：**{plan}**。",
      "为你定制的突破策略：**{plan}**，坚持下去。",
      "破局的关键在于：**{plan}**。",
      "下一步的靶向训练目标：**{plan}**。"
    ];

    const encouragementTemplates = [
      "相信自己，量变引起质变！",
      "不要灰心，你已经比昨天更进步了！",
      "保持这个势头，四级稳稳拿下！",
      "突破瓶颈就在眼前，加油！"
    ];

    const renderTemplate = (data: { weakness: string, plan: string, emotion: string }) => {
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const wText = getRandom(weaknessTemplates).replace('{weakness}', data.weakness);
      const pText = getRandom(planTemplates).replace('{plan}', data.plan);
      const eText = getRandom(encouragementTemplates); // Ignoring emotion for simplicity, using random encouragement
      
      return `【当前薄弱点】：${wText}\n【下一步学习规划】：${pText}\n${eText}`;
    };

    if (stats.latestAiReport && stats.latestAiReport.report_month === currentMonth) {
      try {
        const cachedData = stats.latestAiReport;
        const newReport = renderTemplate(cachedData);
        
        // 模拟加载动画与流式输出
        setIsGeneratingReport(true);
        let phase = 0;
        setReportLoadingPhase(0);
        
        const phaseInterval = setInterval(() => {
          phase++;
          if (phase > 2) {
            clearInterval(phaseInterval);
            // 开始打字机效果
            let charIndex = 0;
            const chars = newReport.split('');
            const typeInterval = setInterval(() => {
              if (charIndex < chars.length) {
                setAiReport(prev => (prev || "") + chars[charIndex]);
                charIndex++;
              } else {
                clearInterval(typeInterval);
                setIsGeneratingReport(false);
              }
            }, 30); // 30ms per char
          } else {
            setReportLoadingPhase(phase);
          }
        }, 1666);
        return;
      } catch (e) {
        console.error("Failed to render cached JSON report", e);
      }
    }

    const prompt = `你是一位专业的英语听力老师。以下是该学生最近在听写练习中的错误数据：\n\n${mistakes.map(m => `- 标准答案: "${m.expected}"\n  学生拼写: "${m.actual}"`).join('\n')}\n\n请你简明扼要地分析该学生的错题数据。你的回复**必须是一个合法的 JSON 对象**，并且只能包含以下三个字段，不要输出任何其他多余的文字或 Markdown 代码块：\n{\n  "weakness": "（控制在20字以内，提取最核心的发音、连读或词汇拼写问题）",\n  "plan": "（控制在20字以内，给出最具体的练习推荐动作）",\n  "emotion": "positive"\n}`;

    let phaseInterval: NodeJS.Timeout | null = null;
    try {
      setIsGeneratingReport(true);
      setReportLoadingPhase(0);
      phaseInterval = setInterval(() => {
        setReportLoadingPhase(prev => (prev + 1) % 3);
      }, 1666);
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctagfkejsnelhmqygiyk.supabase.co'
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      const token = session?.access_token || anonKey

      const response = await fetch(`${supabaseUrl}/functions/v1/doubao-proxy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        // Setup typing queue
        const charQueue: string[] = [];
        let isTyping = false;
        let fullReport = "";

        const processQueue = () => {
          if (charQueue.length > 0) {
            isTyping = true;
            const char = charQueue.shift()!;
            fullReport += char;
            // Don't setAiReport here during the initial API call, wait for JSON parsing
            setTimeout(processQueue, 10);
          } else {
            isTyping = false;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                // Handle OpenAI standard chunk format
                if (data.choices && data.choices[0]?.delta?.content) {
                  charQueue.push(...data.choices[0].delta.content.split(''));
                  if (!isTyping) {
                    if (phaseInterval) clearInterval(phaseInterval);
                    processQueue();
                  }
                } 
                // Fallback for old coze format
                else if (data.event === 'message' && data.message?.content) {
                  charQueue.push(...data.message.content.split(''));
                  if (!isTyping) {
                    if (phaseInterval) clearInterval(phaseInterval);
                    processQueue();
                  }
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
        
        // Ensure queue finishes
        while (isTyping || charQueue.length > 0) {
          await new Promise(r => setTimeout(r, 100));
        }
        
        // Save to cache - parse the accumulated JSON string
        if (fullReport) {
          try {
            // Clean up the string if the model wrapped it in markdown code blocks
            const cleanJsonStr = fullReport.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanJsonStr);
            if (parsedData.weakness && parsedData.plan) {
              const detailsToSave = {
                report_month: currentMonth,
                weakness: parsedData.weakness,
                plan: parsedData.plan,
                emotion: parsedData.emotion || 'positive'
              };

              // Save to Supabase
              if (user) {
                await supabase.from('scores').insert([{
                  user_id: user.id,
                  score: 0,
                  mode: 'ai_report',
                  details: detailsToSave
                }]);
              }

              // Update local state to prevent refetching
              setStats((prev: any) => ({
                ...prev,
                latestAiReport: detailsToSave
              }));

              // Immediately render the first time using the template
              setAiReport(renderTemplate(parsedData));
            } else {
              setAiReport("分析完成，但数据格式有误。");
            }
          } catch (e) {
            console.error("Failed to parse AI response as JSON", e, fullReport);
            setAiReport("抱歉，AI 返回的格式无法解析。");
          }
        }
      }
    } catch (err) {
      if (phaseInterval) clearInterval(phaseInterval);
      console.error("AI 诊断生成失败:", err);
      setAiReport("抱歉，AI 诊断生成失败，请稍后再试。");
    } finally {
      setIsGeneratingReport(false);
    }
  }

  const fetchLeaderboard = async () => {
    setShowLeaderboard(true);
    setLoadingLeaderboard(true);
    try {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('scores')
        .select('user_id, details, created_at')
        .gte('created_at', oneMonthAgo)
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        const userMap = new Map();
        data.forEach(row => {
          const userId = row.user_id;
          const streak = row.details?.streak_count || 0;
          const name = row.details?.full_name || '匿名同学';
          const classGroup = row.details?.class_group || '';
          
          if (!userMap.has(userId) || streak > userMap.get(userId).streak) {
            userMap.set(userId, { name, classGroup, streak, userId });
          }
        });
        
        const sorted = Array.from(userMap.values())
          .filter(u => u.streak > 0)
          .sort((a, b) => b.streak - a.streak)
          .slice(0, 50); // top 50
          
        setLeaderboardData(sorted);
      }
    } catch (err) {
      console.error("加载排行榜失败:", err);
    }
    setLoadingLeaderboard(false);
  }

  const openVanityCard = () => {
    setShowVanityCard(true);
    setVanityImageUrl(null);
  }

  const generateVanityImage = async () => {
    if (vanityCardRef.current) {
      setGeneratingVanity(true);
      try {
        const canvas = await html2canvas(vanityCardRef.current, { 
          scale: 3, 
          useCORS: true, 
          backgroundColor: '#ffffff'
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setVanityImageUrl(dataUrl);
      } catch (err) {
        console.error("生成海报失败:", err);
      }
      setGeneratingVanity(false);
    }
  }

  const currentSnippet = activeSnippets[currentIndex]

  const getScrambledWords = (text: string) => {
    if (!text) return [];
    const words = text.split(' ').filter(w => w.trim() !== '');
    const mapped = words.map((word, index) => ({ word, id: index }));
    
    // Seeded Fisher-Yates shuffle for deterministic order
    let seed = text.length + words[0]?.charCodeAt(0) || 0;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
    return mapped;
  };

  const getMaskedStructure = (text: string) => {
    if (!text) return []
    const words = text.split(' ')
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'it', 'he', 'she', 'they', 'we', 'you', 'i', 'this', 'that', 'these', 'those']);
    
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase();
      
      // Node 4: Exam Practice (selective blanks)
      if (isExamPractice) {
        if (cleanWord.length === 0 || stopWords.has(cleanWord)) {
          return { type: 'text', word, id: index };
        }
        
        // Deterministically decide whether to blank based on word and index
        const seed = index * 31 + cleanWord.charCodeAt(0) + cleanWord.length;
        const x = Math.sin(seed) * 10000;
        const randomVal = x - Math.floor(x);
        
        // Blank ~60% of non-stop words
        const shouldBlank = randomVal > 0.4;
        
        if (shouldBlank) {
          const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'-]+)([^a-zA-Z0-9]*)$/);
          if (match) {
            const [, prefix, coreWord, suffix] = match;
            return { type: 'blank', prefix, coreWord, suffix, id: index };
          }
          return { type: 'blank', prefix: '', coreWord: word, suffix: '', id: index };
        }
        return { type: 'text', word, id: index };
      }

      // Node 2: Word fill-in (mask core words)
      if (currentStage === 2) {
        if (cleanWord.length === 0 || stopWords.has(cleanWord)) {
          return { type: 'text', word, id: index };
        }
        
        const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'-]+)([^a-zA-Z0-9]*)$/);
        if (match) {
          const [, prefix, coreWord, suffix] = match;
          return { type: 'blank', prefix, coreWord, suffix, id: index };
        }
        return { type: 'blank', prefix: '', coreWord: word, suffix: '', id: index };
      }

      // Node 3: Handled by textarea, but fallback structure if needed
      return { type: 'text', word, id: index };
    });
  }

  const getHintString = (text: string) => {
    const structure = getMaskedStructure(text);
    return structure.map(item => {
      if (item.type === 'text') return item.word;
      // For blanks in exam practice, replace core word with underscores
      const blankLength = Math.max(3, item.coreWord?.length || 3);
      return `${item.prefix || ''}${'_'.repeat(blankLength)}${item.suffix || ''}`;
    }).join(' ');
  }

  const calculateScore = (actual: string, expected: string): number => {
    const numMap: Record<string, string> = {
      "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
      "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
      "ten": "10", "eleven": "11", "twelve": "12", "thirteen": "13",
      "fourteen": "14", "fifteen": "15", "sixteen": "16", "seventeen": "17",
      "eighteen": "18", "nineteen": "19", "twenty": "20",
      "thirty": "30", "forty": "40", "fifty": "50", "sixty": "60",
      "seventy": "70", "eighty": "80", "ninety": "90", "hundred": "100"
    };

    const normalizeText = (str: string | any) => {
      if (typeof str !== 'string') {
        str = getActualAnswerString(str, expected) || '';
      }
      let text = str.toLowerCase();
      // Replace common contractions before removing punctuation
      text = text.replace(/we're/g, "we are")
                 .replace(/it's/g, "it is")
                 .replace(/they're/g, "they are")
                 .replace(/you're/g, "you are")
                 .replace(/i'm/g, "i am")
                 .replace(/don't/g, "do not")
                 .replace(/doesn't/g, "does not")
                 .replace(/didn't/g, "did not")
                 .replace(/isn't/g, "is not")
                 .replace(/aren't/g, "are not")
                 .replace(/wasn't/g, "was not")
                 .replace(/weren't/g, "were not")
                 .replace(/hasn't/g, "has not")
                 .replace(/haven't/g, "have not")
                 .replace(/hadn't/g, "had not")
                 .replace(/won't/g, "will not")
                 .replace(/wouldn't/g, "would not")
                 .replace(/can't/g, "can not")
                 .replace(/couldn't/g, "could not")
                 .replace(/shouldn't/g, "should not")
                 .replace(/i've/g, "i have")
                 .replace(/you've/g, "you have")
                 .replace(/we've/g, "we have")
                 .replace(/they've/g, "they have")
                 .replace(/i'll/g, "i will")
                 .replace(/you'll/g, "you will")
                 .replace(/he'll/g, "he will")
                 .replace(/she'll/g, "she will")
                 .replace(/it'll/g, "it will")
                 .replace(/we'll/g, "we will")
                 .replace(/they'll/g, "they will")
                 .replace(/i'd/g, "i would") // could be "i had", but "i would" is safer fallback generally, or let levenshtein handle minor diff
                 .replace(/you'd/g, "you would")
                 .replace(/he's/g, "he is") // could be "he has", but "he is" is most common
                 .replace(/she's/g, "she is")
                 .replace(/that's/g, "that is")
                 .replace(/there's/g, "there is")
                 .replace(/what's/g, "what is")
                 .replace(/who's/g, "who is")
                 .replace(/let's/g, "let us");
      
      let words = text.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
      return words.map((w: string) => numMap[w] || w).join(" ");
    };

    const levenshtein = (a: string, b: string) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;

      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1, // deletion
            matrix[j - 1][i] + 1, // insertion
            matrix[j - 1][i - 1] + indicator // substitution
          );
        }
      }
      return matrix[b.length][a.length];
    };

    const norm1 = normalizeText(actual);
    const norm2 = normalizeText(expected);

    if (!norm1 && !norm2) return 100;
    if (!norm1 || !norm2) return 0;

    const dist = levenshtein(norm1, norm2);
    const maxLen = Math.max(norm1.length, norm2.length);
    const similarity = Math.max(0, 1 - dist / maxLen);
    return Math.round(similarity * 100);
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleNext = () => {
    if (currentIndex < activeSnippets.length - 1) {
      setCurrentIndex(curr => curr + 1)
      setShowAnswer(false)
      setIsPlaying(false)
      setShowHint(false)
    } else if (mode === 'test') {
      handleSubmitTest()
    } else {
      if (mode === 'practice') {
        setShowNodeCompletion(true);
      } else {
        backToMenu()
      }
    }
  }

  const handleCompleteNode = () => {
    if (!isReviewSession && !isExamPractice && !isCustomTagPractice) {
      const groupKey = `${difficulty}-group${Math.floor(currentIndex / 5)}`;
      updatePracticeProgress(groupKey, currentStage);
    }
    setShowNodeCompletion(false);
    setIsReviewSession(false);
    setIsExamPractice(false);
    setIsCustomTagPractice(false);
    
    const returnTo = localStorage.getItem('practice_return_to');
    if (returnTo) {
      localStorage.removeItem('practice_return_to');
      router.push(returnTo);
    } else {
      setMode(isReviewSession || isExamPractice ? 'menu' : 'map');
    }
  }

  const handleCheck = async () => {
    setShowAnswer(true)
    const currentStreak = updateStreak()

    // 保存每日练习打卡记录（每核对一题，记录一次）
    if (user && mode === 'practice') {
      try {
        const actualStr = getActualAnswerString(answers[currentIndex], activeSnippets[currentIndex].text);
        const currentScore = calculateScore(actualStr, activeSnippets[currentIndex].text)
        await supabase.from('scores').insert([{
          user_id: user.id,
          score: currentScore,
          mode: 'practice',
          details: {
            class_group: user?.user_metadata?.class_group || '未知班级',
            full_name: user?.user_metadata?.full_name || '未知姓名',
            student_id: user?.user_metadata?.student_id || '未知学号',
            streak_count: currentStreak,
            answers: [{
              expected: activeSnippets[currentIndex].text,
              actual: actualStr,
              score: currentScore,
              filename: activeSnippets[currentIndex].filename
            }]
          }
        }])
      } catch (err) {
        console.error("保存练习记录失败:", err)
      }
    }
  }

  const handleInput = (val: string | { [key: number]: string } | number[]) => {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = val
    setAnswers(newAnswers)
  }

  const getActualAnswerString = (ans: any, originalText: string) => {
    if (typeof ans === 'string') return ans;
    
    // Stage 1: Word Scramble (array of IDs)
    if (Array.isArray(ans)) {
      const scrambled = getScrambledWords(originalText);
      return ans.map((id: number) => scrambled.find(s => s.id === id)?.word || '').join(' ');
    }
    
    // It's a Stage 2 dictionary of inputs
    if (typeof ans === 'object' && ans !== null) {
      const structure = getMaskedStructure(originalText);
      return structure.map(item => {
        if (item.type === 'text') return item.word;
        // Reconstruct the word with the user's input, or leave blank if empty
        const userInput = (ans as { [key: number]: string })[item.id] || '';
        return `${item.prefix || ''}${userInput}${item.suffix || ''}`;
      }).join(' ');
    }
    
    return '';
  }

  const handleSubmitTest = async () => {
    setTestSubmitted(true)
    const currentStreak = updateStreak()
    
    const totalScore = Math.round(activeSnippets.reduce((acc, snippet, idx) => acc + calculateScore(getActualAnswerString(answers[idx], snippet.text), snippet.text), 0) / activeSnippets.length) || 0

    if (user) {
      try {
        const { error } = await supabase
          .from('scores')
          .insert([
            {
              user_id: user.id,
              score: totalScore,
              mode: 'test',
              details: {
                class_group: user?.user_metadata?.class_group || '未知班级',
                full_name: user?.user_metadata?.full_name || '未知姓名',
                student_id: user?.user_metadata?.student_id || '未知学号',
                streak_count: currentStreak,
                answers: activeSnippets.map((s, i) => ({
                  expected: s.text,
                  actual: getActualAnswerString(answers[i], s.text),
                  score: calculateScore(getActualAnswerString(answers[i], s.text), s.text),
                  filename: s.filename
                }))
              }
            }
          ])
        
        if (error) {
          console.error("成绩保存失败:", error)
        } else {
          console.log("成绩保存成功")
          fetchDashboardStats(user.id)
          loadFullStats(user.id)
        }
      } catch (err) {
        console.error("记录成绩时发生异常:", err)
      }
    }
  }

  const backToMenu = () => {
    const returnTo = localStorage.getItem('practice_return_to')
    if (returnTo) {
      localStorage.removeItem('practice_return_to')
      router.push(returnTo)
    } else {
      if (mode === 'practice') {
        setMode(isReviewSession || isExamPractice ? 'menu' : 'map')
      } else {
        setMode('menu')
      }
      setIsPlaying(false)
      setIsReviewSession(false)
      setIsExamPractice(false)
    }
  }

  // --- UI Components ---
  const DuoBtn = ({ children, variant = 'primary', className = '', disabled, ...props }: any) => {
    const variants: any = {
      primary: 'bg-[#58cc02] hover:bg-[#46a302] text-white border-[#58a700]',
      secondary: 'bg-[#1cb0f6] hover:bg-[#1899d6] text-white border-[#1899d6]',
      danger: 'bg-[#ff4b4b] hover:bg-[#ea2b2b] text-white border-[#ea2b2b]',
      ghost: 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300',
      outline: 'bg-white hover:bg-slate-50 text-[#1cb0f6] border-slate-200 hover:border-slate-300',
      disabled: 'bg-[#e5e5e5] text-[#afafaf] border-[#e5e5e5] cursor-not-allowed',
    }
    
    const currentVariant = disabled ? 'disabled' : variant;
    
    return (
      <button 
        disabled={disabled}
        className={`font-extrabold uppercase tracking-wider rounded-2xl border-b-4 ${disabled ? '' : 'active:border-b-0 active:translate-y-1'} transition-all px-4 py-3 flex items-center justify-center ${variants[currentVariant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  const DuoCard = ({ children, className = '', ...props }: any) => (
    <div className={`bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </div>
  )

  if (!user || allSnippets.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#58cc02] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (mode === 'map') {
    const snippetsForDiff = allSnippets.filter(s => {
      if (s.difficulty) return s.difficulty === difficulty;
      if (difficulty === 'easy') return s.duration <= 5;
      if (difficulty === 'medium') return s.duration > 5 && s.duration <= 10;
      return s.duration > 10;
    });
    
    const totalGroups = Math.ceil(snippetsForDiff.length / 5);
    
    let activeGroupIdx = 0;
    let completedStages = 0;
    for (let i = 0; i < totalGroups; i++) {
      const stages = Math.min(practiceProgress[`${difficulty}-group${i}`] || 0, 3);
      completedStages += stages;
      
      if (stages < 3 && activeGroupIdx === 0) {
        activeGroupIdx = i;
      }
      if (i === totalGroups - 1 && stages === 3 && activeGroupIdx === 0) {
        activeGroupIdx = i; // All completed, point to the last one
      }
    }
    
    const totalStages = totalGroups * 3;
    const progressPercent = totalStages === 0 ? 0 : Math.round((completedStages / totalStages) * 100);
    
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700 font-sans p-4 md:p-8">
        <div className="max-w-md mx-auto relative pb-20">
          <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm sticky top-4 z-10">
            <button onClick={() => setMode('menu')} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-8 h-8 stroke-[3]" />
            </button>
            <h1 className="text-2xl font-extrabold text-[#1cb0f6] flex items-center gap-2">
              {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}挑战
            </h1>
            <div className="w-8"></div> {/* Spacer for centering */}
          </header>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm mb-10">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * progressPercent) / 100} className="text-[#ffc800] transition-all duration-1000" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-slate-700 text-sm">
                {progressPercent}%
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-700 text-lg">整体进度</h3>
              <p className="text-slate-400 font-bold text-sm">已完成 {completedStages} / {totalStages} 关</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-12 py-8 relative">
            {/* The winding path line with generalization gradient */}
            <div className="absolute top-0 bottom-0 w-2 bg-gradient-to-b from-rose-200 via-indigo-200 to-sky-200 left-1/2 -translate-x-1/2 -z-10 rounded-full"></div>
            
            {Array.from({ length: totalGroups }).map((_, groupIdx) => {
              const groupKey = `${difficulty}-group${groupIdx}`;
              const currentHighestStage = practiceProgress[groupKey] || 0;
              const isGroupCompleted = currentHighestStage >= 3;
              
              // We render 3 nodes per group (Stage 1, Stage 2, Stage 3)
              return (
                <div id={`group-${groupIdx}`} key={groupIdx} className="flex flex-col gap-12 relative w-full items-center">
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className={`text-sm font-bold tracking-wider uppercase px-5 py-2 rounded-full flex items-center gap-2 transition-colors duration-500 ${isGroupCompleted ? 'bg-[#ffc800] text-white shadow-[0_4px_0_0_#e5b400]' : 'bg-white text-slate-400 border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]'}`}>
                      <span>单元 {groupIdx + 1}</span>
                      {isGroupCompleted && <Trophy className="w-5 h-5 fill-current" />}
                    </div>
                  </div>
                  
                  {[1, 2, 3].map((stageNum) => {
                    const isCompleted = currentHighestStage >= stageNum;
                    // For group 0 stage 1, it's always unlocked if currentHighestStage === 0.
                    // For other stages in the same group, they require the previous stage to be completed.
                    // For stage 1 of group N > 0, it requires stage 3 of group N-1 to be completed.
                    let isLocked = false;
                    if (stageNum === 1) {
                      if (groupIdx > 0) {
                        const prevGroupKey = `${difficulty}-group${groupIdx - 1}`;
                        const prevGroupHighestStage = practiceProgress[prevGroupKey] || 0;
                        isLocked = prevGroupHighestStage < 3;
                      } else {
                        isLocked = false; // Group 0 Stage 1 is always unlocked initially
                      }
                    } else {
                      isLocked = currentHighestStage < stageNum - 1;
                    }
                    
                    const isCurrent = !isCompleted && !isLocked && (
                      (stageNum === 1 && (groupIdx === 0 || (practiceProgress[`${difficulty}-group${groupIdx - 1}`] || 0) === 3)) ||
                      (stageNum > 1 && currentHighestStage === stageNum - 1)
                    );
                    
                    // Determine offset for winding effect
                    const offsetClass = stageNum === 1 ? '-translate-x-12' : stageNum === 2 ? 'translate-x-12' : 'translate-x-0';
                    
                    let buttonColor = 'bg-slate-200 border-slate-300 text-slate-400';
                    let iconColor = 'text-white';
                    
                    if (isCompleted) {
                      buttonColor = 'bg-[#ffc800] border-[#e5b400] text-white';
                    } else if (isCurrent) {
                      buttonColor = 'bg-[#58cc02] border-[#58a700] text-white';
                    }
                    
                    return (
                      <div key={stageNum} className={`relative flex flex-col items-center ${offsetClass}`}>
                        <button
                          disabled={isLocked}
                          onClick={() => startSession('practice', difficulty, false, groupIdx, stageNum as PracticeStage)}
                          className={`w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center transition-transform ${isLocked ? 'cursor-not-allowed opacity-80' : 'hover:translate-y-1 hover:border-b-2 active:border-b-0 active:translate-y-2'} ${buttonColor}`}
                        >
                          {isCompleted ? (
                            <Check className={`w-10 h-10 ${iconColor} stroke-[3]`} />
                          ) : (
                            <span className="text-2xl font-black">{stageNum}</span>
                          )}
                        </button>
                        
                        {/* Tooltip bubble for current stage */}
                        {isCurrent && (
                          <div className="absolute -top-12 whitespace-nowrap bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 shadow-sm animate-bounce">
                            {stageNum === 1 ? '连词成句' : stageNum === 2 ? '词汇填空' : '完全听写'}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-200 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          
          {/* Jump to current target button */}
          <button 
            onClick={() => {
              const el = document.getElementById(`group-${activeGroupIdx}`);
              if (el) {
                // Offset to account for sticky header
                const headerOffset = 100;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth"
                });
              }
            }}
            className="fixed bottom-8 right-8 bg-[#1cb0f6] hover:bg-[#1899d6] text-white p-4 rounded-full shadow-[0_4px_0_0_#1899d6] active:shadow-none active:translate-y-1 transition-all z-50 flex items-center justify-center group"
            title="跳转到当前进度"
          >
            <Target className="w-8 h-8" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-extrabold text-lg ml-0 group-hover:ml-3">
              定位当前进度
            </span>
          </button>
        </div>
      </div>
    )
  }

  // Render Menu
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-white text-slate-700 font-sans p-4 md:p-8 relative">
        {/* Modals */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowLeaderboard(false)}>
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="bg-[#1cb0f6] p-6 text-white text-center relative shrink-0">
                <button onClick={() => setShowLeaderboard(false)} className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <Medal className="w-12 h-12 mx-auto mb-2 opacity-90" />
                <h2 className="text-2xl font-extrabold tracking-wider">打卡英雄榜</h2>
                <p className="text-white/80 font-bold mt-1 text-sm">过去1个月最活跃的同学</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {loadingLeaderboard ? (
                  <div className="flex justify-center py-10">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1cb0f6] rounded-full animate-spin"></div>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-bold">暂无打卡数据，快去抢占第一名！</div>
                ) : (
                  leaderboardData.map((user, idx) => (
                    <div key={user.userId} className="bg-white rounded-2xl p-4 flex items-center gap-4 border-2 border-slate-100 shadow-sm">
                      <div className={`w-8 font-black text-xl text-center ${idx === 0 ? 'text-[#ffc800]' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-[#cd7f32]' : 'text-slate-300'}`}>
                        {idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#1cb0f6]/10 flex items-center justify-center text-[#1cb0f6] font-black text-lg shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-slate-700 truncate">{user.name}</div>
                        <div className="text-xs font-bold text-slate-400 truncate">{user.classGroup}</div>
                      </div>
                      <div className="flex items-center gap-1 font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-xl">
                        <Flame className="w-5 h-5 fill-current" />
                        {user.streak}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showVanityCard && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowVanityCard(false)}>
            <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowVanityCard(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10 transition-colors bg-white/80 rounded-full p-1">
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-6 flex flex-col items-center bg-slate-50">
                {vanityImageUrl ? (
                  <div className="w-full flex flex-col items-center">
                    <img src={vanityImageUrl} alt="我的打卡海报" className="w-full h-auto rounded-2xl shadow-lg border-2 border-slate-200" />
                    <p className="mt-6 text-slate-500 font-bold text-sm bg-white px-4 py-2 rounded-full border-2 border-slate-200 animate-pulse">
                      👆 长按上方图片保存到手机，分享至朋友圈
                    </p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    {/* The actual DOM element to be converted to canvas */}
                    <div ref={vanityCardRef} className="w-full bg-gradient-to-b from-[#58cc02] to-[#46a302] rounded-3xl p-6 text-white relative overflow-hidden">
                      {/* Decorative background elements */}
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full"></div>
                      <div className="absolute -left-10 bottom-10 w-24 h-24 bg-white/10 rounded-full"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#58cc02] font-black text-2xl">
                              {user.user_metadata?.full_name?.charAt(0) || '英'}
                            </div>
                            <div>
                              <div className="font-black text-xl">{user.user_metadata?.full_name || '同学'}</div>
                              <div className="text-white/80 font-bold text-sm">航院 CET4 听力特训</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/20 rounded-2xl p-5 mb-8 border border-white/30">
                          <div className="text-center">
                            <div className="text-sm font-bold text-white/90 mb-1 uppercase tracking-widest">连续打卡</div>
                            <div className="flex items-center justify-center gap-2 text-5xl font-black text-[#ffc800]">
                              <Flame className="w-10 h-10 fill-current" />
                              {streakCount} <span className="text-2xl text-white">天</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center mb-4">
                          <div className="font-extrabold text-lg leading-relaxed text-white">
                            "日拱一卒，功不唐捐"<br/>
                            每天进步一点点！
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/20">
                          <div className="font-bold text-xs text-white/70">
                            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="font-black text-sm text-white/90 italic">
                            CET-4 Master
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DuoBtn 
                      variant="primary" 
                      className="w-full mt-6"
                      onClick={generateVanityImage}
                      disabled={generatingVanity}
                    >
                      {generatingVanity ? '生成中...' : '生成专属海报'}
                    </DuoBtn>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {resumePrompt.show && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <DuoCard className="w-full max-w-sm">
              <h3 className="text-xl font-extrabold text-slate-700 mb-2">继续练习？</h3>
              <p className="text-slate-500 font-medium mb-6">
                检测到您上次有未完成的 {resumePrompt.diff === 'easy' ? '简单' : resumePrompt.diff === 'medium' ? '中等' : '困难'} 练习，要继续上次的进度吗？
              </p>
              <div className="flex flex-col gap-3">
                <DuoBtn variant="primary" className="w-full" onClick={() => handleResume(true)}>
                  继续上次练习
                </DuoBtn>
                <DuoBtn variant="ghost" className="w-full" onClick={() => handleResume(false)}>
                  重新开始
                </DuoBtn>
                <DuoBtn variant="outline" className="w-full mt-2 border-none" onClick={() => setResumePrompt({show: false, diff: null})}>
                  取消
                </DuoBtn>
              </div>
            </DuoCard>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <header className="flex justify-between items-center mb-10 pb-4 border-b-2 border-slate-100">
            <h1 className="text-3xl font-extrabold text-[#58cc02] flex items-center gap-2">
              航院英语-听力特训
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchLeaderboard}
                className="hidden sm:flex items-center gap-1 font-extrabold text-[#1cb0f6] hover:text-[#1899d6] transition-colors bg-[#1cb0f6]/10 px-3 py-1.5 rounded-xl"
                title="打卡排行榜"
              >
                <Medal className="w-5 h-5" />
                <span className="text-sm">排行榜</span>
              </button>
              <button 
                onClick={openVanityCard}
                className="flex items-center gap-1 font-extrabold text-orange-500 hover:text-orange-600 transition-colors bg-orange-50 px-3 py-1.5 rounded-xl"
                title="生成打卡海报"
              >
                <Flame className="w-6 h-6 fill-current" />
                <span className="text-lg">{streakCount}</span>
              </button>
              {(user?.user_metadata?.full_name?.trim() === '高志晏' || user?.user_metadata?.full_name?.trim() === '陈欣鑫' || user?.user_metadata?.full_name?.trim() === '001' || user?.email?.startsWith('001@')) && (
                <>
                  <button 
                    onClick={() => router.push('/teacher')}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#58cc02] transition-colors font-bold"
                    title="教师管理面板"
                  >
                    <span className="hidden sm:inline">教师管理面板</span>
                  </button>
                </>
              )}
              <button 
                onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>

          <div className="space-y-10">
            <div className="space-y-4">
              {/* 紧凑的个人看板 Dashboard */}
              {user && (
                <div className="px-2 mb-6">
                  {/* Dashboard AI Report Move up */}
                  {(
                    <div className="bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] rounded-2xl p-6 shadow-sm border-b-4 border-[#ce93d8] mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-extrabold text-[#4a148c] flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-[#9c27b0]" /> AI 导师诊断
                        </h2>
                        {!aiReport && !isGeneratingReport && (
                          <button 
                            onClick={() => {
                              if (!stats || !stats.tests || stats.tests.length === 0) {
                                setAiReport("您暂时还没有答题数据，请先答题。")
                                return
                              }
                              generateAiReport()
                            }}
                            className="bg-[#9c27b0] hover:bg-[#7b1fa2] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
                          >
                            生成专属学情报告
                          </button>
                        )}
                      </div>
                      
                      {isGeneratingReport && !aiReport && (
                        <div className="flex flex-col items-center justify-center py-6 space-y-3">
                          <div className="w-8 h-8 border-4 border-[#ce93d8] border-t-[#9c27b0] rounded-full animate-spin"></div>
                          <div style={{ color: '#6a1b9a', fontSize: '14px', fontWeight: 400, opacity: 1, fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
                            {reportLoadingPhase === 0 && "正在根据您的数据进行错题分析..."}
                            {reportLoadingPhase === 1 && "正在使用知识图谱推荐学习路径..."}
                            {reportLoadingPhase === 2 && "正在为您生成诊断报告..."}
                          </div>
                        </div>
                      )}

                      {aiReport && (
                        <div className="bg-white rounded-xl p-5 border border-white/50 mt-4 shadow-sm" style={{ transform: 'translateZ(0)' }}>
                          <div style={{ color: '#1e293b', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
                            {aiReport.split('\n').map((line, i) => {
                              // Filter out empty lines to prevent collapsing rendering
                              if (!line.trim()) return null;
                              return (
                                <div key={i} style={{ marginBottom: '8px', lineHeight: '1.625', color: '#1e293b', fontWeight: 400, transform: 'translateZ(0)', opacity: 1, visibility: 'visible', display: 'block' }}>
                                  {line.includes('薄弱点') ? <div style={{ display: 'inline-block', color: '#f43f5e', marginRight: '4px', fontWeight: 400 }}>🔥</div> : null}
                                  {line.includes('推荐') || line.includes('建议') || line.includes('规划') ? <div style={{ display: 'inline-block', color: '#10b981', marginRight: '4px', fontWeight: 400 }}>🎯</div> : null}
                                  {(!line.includes('薄弱点') && !line.includes('推荐') && !line.includes('建议') && !line.includes('规划') && line.length > 5) ? <div style={{ display: 'inline-block', color: '#fbbf24', marginRight: '4px', fontWeight: 400 }}>✨</div> : null}
                                  <div style={{ display: 'inline' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<b style="color: #4a148c; font-weight: 700;">$1</b>') }} />
                                </div>
                              )
                            })}
                          </div>
                          {isGeneratingReport && (
                            <div style={{ display: 'inline-block', width: '8px', height: '16px', marginLeft: '4px', backgroundColor: '#9c27b0' }} className="animate-pulse"></div>
                          )}
                        </div>
                      )}
                      
                      {!aiReport && !isGeneratingReport && (
                        <div style={{ color: '#6a1b9a', fontSize: '14px', marginTop: '8px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 400, opacity: 1, transform: 'translateZ(0)' }}>
                            基于你最近的错题记录，分析底层发音与词汇盲区，提供靶向练习建议与学习路径规划。
                          </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* 新手空状态覆盖层 */}
                    {estimatedScore === 0 && streakCount === 0 && todayProgress === 0 && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] z-10 flex items-center justify-center p-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-1 animate-bounce">🐣</div>
                          <div className="font-extrabold text-slate-700 text-lg mb-0.5 tracking-wide">欢迎来到听力特训</div>
                          <div className="text-xs font-bold text-slate-400">你的英语之旅即将开启，先来一场碎片闯关吧！</div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#ff9600]/10 p-2 rounded-xl">
                          <Flame className="w-6 h-6 text-[#ff9600]" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold mb-0.5">连续打卡</div>
                          <div className="text-lg font-extrabold text-slate-700 leading-none">{streakCount} <span className="text-sm font-bold text-slate-500">天</span></div>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#ce82ff]/10 p-2 rounded-xl">
                          <Trophy className="w-6 h-6 text-[#ce82ff]" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold mb-0.5">预估听力分</div>
                          <div className="text-lg font-extrabold text-slate-700 leading-none">
                            {estimatedScore !== null ? <AnimatedNumber value={estimatedScore} /> : '--'} 
                            <span className="text-sm font-bold text-slate-500 ml-0.5">分</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t-2 border-slate-100">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-sm font-bold text-slate-600">今日听写进度</span>
                        <span className="text-sm font-bold text-[#58cc02]">{todayProgress} / 20 句</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative shadow-inner">
                        <div 
                          className="bg-[#58cc02] h-full rounded-full transition-all duration-1000 ease-out absolute left-0 top-0 overflow-hidden" 
                          style={{ width: `${Math.min(100, (todayProgress / 20) * 100)}%` }}
                        >
                          <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/30 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 顶部动态 CTA 按钮 */}
              <div className="px-2 mt-4">
                <button 
                  onClick={ctaConfig.action}
                  className={`w-full flex items-center justify-center gap-3 text-white font-extrabold text-xl py-4 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md hover:shadow-lg ${ctaConfig.colorClass}`}
                >
                  {ctaConfig.icon}
                  <span className="tracking-wide">{ctaConfig.label}</span>
                </button>
              </div>
            </div>

            {/* 核心训练 Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 px-2">
                <Compass className="w-7 h-7 text-[#1cb0f6]" />
                <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">核心训练</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                
                {/* 新增: 专属专业定制舱 (横跨两列) */}
                <DuoCard className="md:col-span-2 relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200" onClick={() => router.push('/listening')}>
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[12px] font-bold px-4 py-1.5 rounded-bl-[20px] flex items-center gap-1 shadow-sm z-10">
                     <Sparkles className="w-4 h-4" /> AI 核心策略
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-24 h-24 bg-[#e8f5e9] rounded-3xl flex items-center justify-center border-b-4 border-[#4caf50] shrink-0">
                      <Headphones className="w-12 h-12 text-[#4caf50]" />
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-black text-slate-700 mb-2 tracking-wide">专属专业定制舱</h2>
                      <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.625', maxWidth: '32rem', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 400, opacity: 1, transform: 'translateZ(0)' }}>
                        基于您的专业方向，算法智能推荐听力材料，通过“渐进式泛化”平滑过渡至全真模考，并快速定位您的提分临界点。
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-[#4caf50] font-black bg-[#e8f5e9] px-4 py-2 rounded-xl">
                        开启专属定制 <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </DuoCard>

                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6]">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">碎片闯关</h2>
                        <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 400, opacity: 1 }}>3-5 分钟单句/小段落听写</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-auto min-h-[280px] flex flex-col justify-end">
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('easy')}>
                        <span className="text-slate-700">🌱 轻松起步 (简单)</span>
                      </DuoBtn>
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('medium')}>
                        <span className="text-slate-700">⚔️ 进阶试炼 (中等)</span>
                      </DuoBtn>
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('hard')}>
                        <span className="text-slate-700">🔥 极限挑战 (困难)</span>
                      </DuoBtn>
                      <div className="pt-3 mt-3 border-t-2 border-slate-100">
                        <DuoBtn variant="primary" className="w-full justify-center gap-2" onClick={startReviewSession}>
                          <Flame className="w-5 h-5 fill-current text-white" />
                          <span>👾 暴打错题 (Boss关)</span>
                        </DuoBtn>
                      </div>
                    </div>
                  </div>
                </DuoCard>

                <DuoCard id="mock-test-card" className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#ce82ff] rounded-2xl flex items-center justify-center border-b-4 border-[#a567cc]">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">全真模考</h2>
                        <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 400, opacity: 1 }}>30-40 分钟沉浸式测试</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTestSubMode('random');
                        }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'random' ? 'bg-white text-[#ce82ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        随机组卷
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTestSubMode('exam');
                        }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'exam' ? 'bg-white text-[#ce82ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        历年真题
                      </button>
                    </div>
                    
                    <div className="space-y-3 mt-auto min-h-[280px] flex flex-col justify-end">
                      {testSubMode === 'random' ? (
                        <>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'easy')}>
                            <span className="text-slate-700">简单 (Easy)</span>
                            <span className="text-slate-400 text-sm font-bold">10题</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'medium')}>
                            <span className="text-slate-700">中等 (Medium)</span>
                            <span className="text-slate-400 text-sm font-bold">10题</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'hard')}>
                            <span className="text-slate-700">困难 (Hard)</span>
                            <span className="text-slate-400 text-sm font-bold">10题</span>
                          </DuoBtn>
                          <div className="pt-3 mt-3 border-t-2 border-slate-100">
                            <DuoBtn variant="primary" className="w-full justify-center gap-2 !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={startTestReviewSession}>
                              <Flame className="w-5 h-5 fill-current text-white" />
                              <span>错题重练 (Boss关)</span>
                            </DuoBtn>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                          <Headphones className="w-12 h-12 text-[#ce82ff] opacity-50" />
                          <p className="text-slate-500 font-bold">进入全套历年听力真题库，支持考场原音重现与逐句解析。</p>
                          <DuoBtn variant="primary" className="w-full mt-4 !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={() => router.push('/exam')}>
                            前往真题库
                          </DuoBtn>
                        </div>
                      )}
                    </div>
                  </div>
                </DuoCard>
              </div>

              <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all mb-6 relative overflow-hidden" onClick={() => router.push('/chat')}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#ff4b4b] rounded-2xl flex items-center justify-center border-b-4 border-[#ea2b2b]">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-700 flex items-center gap-2">
                      口语场景模拟
                    </h2>
                    <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 400, opacity: 1, transform: 'translateZ(0)' }}>进入场景大厅，与 AI 角色进行真实对话</div>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>

              <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all mb-6 relative overflow-hidden" onClick={() => router.push('/custom-dictation')}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#00bcd4] rounded-2xl flex items-center justify-center border-b-4 border-[#0097a7]">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-700 flex items-center gap-2">
                      AI 自定义听写
                    </h2>
                    <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, opacity: 1, transform: 'translateZ(0)' }}>上传任意英文材料，一键生成考场级听写任务</div>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>

              <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all relative overflow-hidden" onClick={() => router.push('/vocab-test')}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#ff9600] rounded-2xl flex items-center justify-center border-b-4 border-[#e58700]">
                    <BrainCircuit className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-700 flex items-center gap-2">
                      词汇水平
                    </h2>
                    <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, opacity: 1, transform: 'translateZ(0)' }}>5分钟精准定位你的真实词汇水平</div>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>
            </section>

            <section className="mt-12">
              <div className="flex items-center gap-2 mb-4 px-2">
                <BarChart3 className="w-7 h-7 text-[#ffc800]" />
                <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">数据与探索</h2>
              </div>

              <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all mb-6" onClick={viewStats}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#ffc800] rounded-2xl flex items-center justify-center border-b-4 border-[#e5b400]">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-700">我的战绩</h2>
                    <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, opacity: 1, transform: 'translateZ(0)' }}>查看历史得分与数据统计</div>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>

              <div className="grid md:grid-cols-2 gap-6">
                <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all sm:hidden" onClick={fetchLeaderboard}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6]">
                      <Medal className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-700">英雄榜</h2>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, opacity: 1, transform: 'translateZ(0)' }}>打卡排行榜</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </DuoCard>

                <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all" onClick={openVanityCard}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#58cc02] to-[#46a302] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302]">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-700">打卡海报</h2>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, opacity: 1, transform: 'translateZ(0)' }}>分享到朋友圈</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </DuoCard>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // Render Stats
  if (mode === 'stats') {
    return (
      <div className="min-h-screen bg-white text-slate-700 font-sans p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <header className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-slate-100">
            <button onClick={backToMenu} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-8 h-8 stroke-[3]" />
            </button>
            <h1 className="text-3xl font-extrabold text-[#ffc800] flex items-center gap-2">
              我的战绩
            </h1>
          </header>

          {loadingStats ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-[#ffc800] rounded-full animate-spin"></div>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DuoCard className="!p-4 text-center">
                  <div className="text-3xl font-black text-slate-700">{stats.totalQuestions}</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 uppercase">总答题数</div>
                </DuoCard>
                <DuoCard className="!p-4 text-center border-b-[#58a700]">
                  <div className="text-3xl font-black text-[#58cc02]">{stats.successCount}</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 uppercase">完美 (≥90%)</div>
                </DuoCard>
                <DuoCard className="!p-4 text-center border-b-[#e5b400]">
                  <div className="text-3xl font-black text-[#ffc800]">{stats.almostCount}</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 uppercase">接近 (80-89%)</div>
                </DuoCard>
                <DuoCard className="!p-4 text-center border-b-[#ea2b2b]">
                  <div className="text-3xl font-black text-[#ff4b4b]">{stats.failedCount}</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 uppercase">需努力 (&lt;80%)</div>
                </DuoCard>
              </div>

              {/* Multidimensional Semantic Graph */}
              <div className="bg-slate-50 rounded-2xl p-6 shadow-inner border-2 border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full max-w-md aspect-square relative bg-slate-800 rounded-2xl overflow-hidden shadow-xl border-4 border-slate-700">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <EnglishKnowledgeGraph 
                    baseScore={stats.tests.length > 0 ? Math.round(stats.tests.reduce((acc: number, t: any) => acc + t.score, 0) / stats.tests.length) : 0} 
                    vocabScore={stats.totalQuestions > 0 ? Math.min(100, Math.round((stats.successCount / stats.totalQuestions) * 100) + 15) : 0} 
                    centerLabel="四级" 
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-700 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-[#1cb0f6]" /> 
                    多维语义图谱
                  </h3>
                  <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.625', fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, opacity: 1 }}>
                    基于你的历史听写数据与模拟测试表现，系统为你构建了多维度的英语能力模型。从核心综合听力出发，向下拆解到词汇、语法、语音与逻辑推断。
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-slate-100">
                      <span className="font-bold text-slate-600">综合听力预估</span>
                      <span className="font-black text-[#1cb0f6]">{stats.tests.length > 0 ? Math.round(stats.tests.reduce((acc: number, t: any) => acc + t.score, 0) / stats.tests.length) : 0}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-slate-100">
                      <span className="font-bold text-slate-600">词汇语料掌握</span>
                      <span className="font-black text-[#58cc02]">{stats.totalQuestions > 0 ? Math.min(100, Math.round((stats.successCount / stats.totalQuestions) * 100) + 15) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Tutor Diagnosis Section Removed */}

              <div>
                <h2 className="text-2xl font-extrabold text-slate-700 mb-4">历史测试</h2>
                {stats.tests.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                    暂无测试记录，快去完成一次模拟测试吧！
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.tests.map((test: any, idx: number) => {
                      const hasDetails = test.details && !Array.isArray(test.details) && Array.isArray(test.details.answers);
                      
                      // For old tests without filename, try to find the matching snippet by 'expected' text
                      if (hasDetails) {
                        test.details.answers.forEach((ans: any) => {
                          if (!ans.filename && ans.expected) {
                            const matchingSnippet = allSnippets.find(s => s.text === ans.expected);
                            if (matchingSnippet) {
                              ans.filename = matchingSnippet.filename;
                            }
                          }
                        });
                      }

                      return (
                        <div key={idx} onClick={() => hasDetails && setSelectedTest({ ...test, idx: stats.tests.length - idx })} className={hasDetails ? 'cursor-pointer' : 'opacity-80'}>
                          <DuoCard className={`!p-4 flex items-center justify-between ${hasDetails ? 'hover:bg-slate-50 transition-colors' : ''}`}>
                            <div>
                              <div className="font-extrabold text-slate-700 text-lg flex items-center gap-2">
                                模拟测试 {stats.tests.length - idx}
                                {!hasDetails && <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">无详情记录</span>}
                              </div>
                              <div className="text-slate-400 font-bold text-sm mt-1">
                                {new Date(test.created_at).toLocaleString('zh-CN')}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <div className={`text-2xl font-black ${test.score >= 80 ? 'text-[#58cc02]' : test.score >= 60 ? 'text-[#ffc800]' : 'text-[#ff4b4b]'}`}>
                                  {test.score}%
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase mt-1">得分</div>
                              </div>
                              {hasDetails && <ChevronRight className="w-6 h-6 text-slate-300" />}
                            </div>
                          </DuoCard>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold">无法加载数据</div>
          )}
        </div>

        {/* Selected Test Detail Modal */}
        {selectedTest && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm"
            onClick={() => {
              if (reviewAudioRef.current) {
                reviewAudioRef.current.pause();
                reviewAudioRef.current = null;
              }
              setSelectedTest(null);
            }}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-3xl my-auto max-h-[90vh] flex flex-col shadow-2xl border-4 border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b-2 border-slate-100 shrink-0">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-700">模拟测试 {selectedTest.idx} 详情</h2>
                  <div className="text-slate-400 font-bold text-sm mt-1">
                    {new Date(selectedTest.created_at).toLocaleString('zh-CN')} · 得分: <span className={`font-black ${selectedTest.score >= 80 ? 'text-[#58cc02]' : selectedTest.score >= 60 ? 'text-[#ffc800]' : 'text-[#ff4b4b]'}`}>{selectedTest.score}%</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (reviewAudioRef.current) {
                      reviewAudioRef.current.pause();
                      reviewAudioRef.current = null;
                    }
                    setSelectedTest(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-400 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                {selectedTest.details.answers.map((ans: any, i: number) => (
                  <div key={i} className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="font-extrabold text-slate-700 text-lg mt-1">Question {i + 1}</div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`font-black px-3 py-1 rounded-xl text-sm ${
                          ans.score >= 90 ? 'bg-[#eaffd7] text-[#58cc02]' :
                          ans.score >= 80 ? 'bg-[#fff5cc] text-[#ffc800]' :
                          'bg-[#ffeaeb] text-[#ff4b4b]'
                        }`}>
                          {ans.score}分
                        </div>
                        {ans.filename && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (reviewAudioRef.current) {
                                reviewAudioRef.current.pause();
                              }
                              reviewAudioRef.current = new Audio(`${AUDIO_BASE_URL}/${ans.filename}`);
                              reviewAudioRef.current.play();
                            }}
                            className="flex items-center justify-center w-10 h-10 text-[#1cb0f6] bg-[#ddf4ff] rounded-full hover:bg-[#c2eaff] transition-colors shrink-0 shadow-sm"
                            title="播放原音"
                          >
                            <Play className="w-5 h-5 fill-current ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-extrabold text-slate-400 uppercase mb-1">标准答案</div>
                        <div className="text-slate-700 font-medium text-lg leading-relaxed">
                          <RichSentence text={ans.expected} isCorrect={null} defaultColorClass="text-slate-700" />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t-2 border-slate-50">
                        <div className="text-xs font-extrabold text-slate-400 uppercase mb-1">你的听写</div>
                        <div className={`font-medium text-lg leading-relaxed break-words ${!ans.actual ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                          {ans.actual || '未作答'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render Test Result
  if (mode === 'test' && testSubmitted) {
    const totalScore = Math.round(activeSnippets.reduce((acc, snippet, idx) => acc + calculateScore(answers[idx] || '', snippet.text), 0) / activeSnippets.length) || 0

    return (
      <div className="min-h-screen bg-white text-slate-700 p-4 md:p-8 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mt-10 mb-12">
            <h2 className="text-4xl font-extrabold text-[#ffc800] mb-6">测试完成！</h2>
            <div className="inline-block bg-[#ffc800] rounded-3xl p-8 border-b-8 border-[#e5b400]">
              <div className="text-6xl font-black text-white">{totalScore}%</div>
              <div className="text-[#a58200] font-extrabold uppercase mt-2">准确率</div>
            </div>
          </div>
          
          <div className="space-y-4 mb-32">
            {activeSnippets.map((snippet, index) => {
              const score = calculateScore(answers[index] || '', snippet.text)
              const isGood = score >= 80;
              const isOk = score >= 60 && score < 80;
              
              return (
                <DuoCard key={index} className="!p-4">
                  <div className="flex justify-between items-center mb-3 border-b-2 border-slate-100 pb-2">
                    <span className="font-extrabold text-slate-400">
                      题目 {index + 1} {snippet.source && <span className="text-sm font-normal ml-2">({snippet.source})</span>}
                    </span>
                    <span className={`font-extrabold ${isGood ? 'text-[#58cc02]' : isOk ? 'text-[#ffc800]' : 'text-[#ff4b4b]'}`}>
                      得分: {score}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold text-[#ff4b4b] uppercase mb-1">你的答案</div>
                      <div className="text-lg font-bold text-slate-600 bg-slate-50 p-3 rounded-xl">
                        {answers[index] || '未作答'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#58cc02] uppercase mb-1">正确原文</div>
                      <div className="text-lg font-bold text-slate-700 bg-green-50 p-3 rounded-xl border-2 border-green-100">
                        <RichSentence text={snippet.text} isCorrect={true} defaultColorClass="text-slate-700" />
                        {snippet.translation && (
                          <div className="text-sm font-normal text-slate-500 mt-2 pt-2 border-t border-green-200">
                            {snippet.translation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DuoCard>
              )
            })}
          </div>
          
          <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-slate-200 p-4 flex justify-center z-50">
            <div className="max-w-2xl w-full">
              <DuoBtn className="w-full py-4 text-xl" onClick={backToMenu}>
                继续
              </DuoBtn>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Practice/Test Session
  const progress = ((currentIndex + (showAnswer ? 1 : 0)) / activeSnippets.length) * 100;
  const currentScore = showAnswer ? calculateScore(answers[currentIndex] || '', currentSnippet.text) : null;
  const isCorrect = currentScore !== null && currentScore >= (mode === 'practice' ? 90 : 80);

  const handleRetry = () => {
    setShowAnswer(false);
    setIsPlaying(false);
    setShowHint(false);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = currentStage === 1 ? [] : currentStage === 2 ? {} : '';
    setAnswers(newAnswers);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 flex flex-col">
      {/* Top Bar */}
      <div className="px-4 md:px-8 py-6 flex items-center gap-4 max-w-4xl mx-auto w-full">
        <button onClick={backToMenu} className="text-slate-300 hover:text-slate-400 transition-colors">
          <X className="w-8 h-8 stroke-[3]" />
        </button>
        <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-1 left-3 w-1/2 h-1 bg-white/30 rounded-full"></div>
        </div>
        {mode === 'test' && timeLeft !== null && (
          <div className={`font-extrabold text-lg px-3 py-1 rounded-xl ${timeLeft < 300 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col pt-4 md:pt-10 pb-40 ${isReviewSession ? 'bg-rose-50/30' : ''}`}>
        {/* Professional Tag Display */}
        {(currentSnippet.tags && currentSnippet.tags.length > 0) && (
          <div className="flex justify-center mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {currentSnippet.tags.map((tag, idx) => (
                <span key={idx} className="text-xs font-black px-3 py-1 rounded-xl border-2 text-sky-600 bg-sky-50 border-sky-200 shadow-[2px_2px_0px_#bae6fd]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <h2 className={`text-2xl md:text-3xl font-extrabold mb-2 text-center flex items-center justify-center gap-2 ${isReviewSession ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
          {isReviewSession ? <><Flame className="w-8 h-8 fill-current" /> 靶向错题 Boss战</> : mode === 'practice' ? '请听写你听到的句子' : '模拟测试进行中'}
        </h2>
        {currentSnippet.source && (
          <p className="text-center text-slate-400 font-bold mb-8">
            来源：{currentSnippet.source}
          </p>
        )}

        {/* Big Play Button - Redesigned */}
        <div className="flex flex-col items-center justify-center mb-12 space-y-4 w-full">
          {mode === 'practice' ? (
            <>
              <audio 
                ref={audioRef} 
                src={`${AUDIO_BASE_URL}/${currentSnippet.filename}`} 
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => {
                  setIsPlaying(true);
                  if (audioRef.current) {
                    audioRef.current.playbackRate = playbackRate;
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    audioRef.current.playbackRate = playbackRate;
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-4 md:gap-6 w-full max-w-lg mb-2">
                <button 
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlaying) {
                        audioRef.current.pause();
                      } else {
                        audioRef.current.play();
                      }
                    }
                  }}
                  className="w-16 h-16 rounded-2xl bg-[#1cb0f6] text-white flex items-center justify-center border-b-4 border-[#1899d6] hover:bg-[#1899d6] transition-all active:translate-y-1 active:border-b-0 flex-none shadow-sm"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl px-6 py-3 flex-1 flex items-center justify-between shadow-sm h-16">
                  <div className="flex items-center gap-[4px] h-6">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                      <div 
                        key={i} 
                        className={`w-1 bg-[#1cb0f6] rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`} 
                        style={{ 
                          height: isPlaying ? `${40 + Math.random() * 60}%` : '20%',
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-slate-400 font-bold text-sm tracking-wider">
                    {isPlaying ? 'PLAYING...' : 'READY'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {[0.5, 1, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      if (audioRef.current) {
                        audioRef.current.playbackRate = rate;
                      }
                    }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all border-2 ${
                      playbackRate === rate 
                        ? 'bg-[#1cb0f6] border-[#1899d6] text-white shadow-[0_2px_0_0_#1899d6]' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <audio 
                ref={audioRef} 
                src={`${AUDIO_BASE_URL}/${currentSnippet.filename}`} 
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={handlePlayPause}
                className="w-24 h-24 bg-[#1cb0f6] hover:bg-[#1899d6] rounded-3xl flex items-center justify-center border-b-[6px] border-[#1899d6] active:border-b-0 active:translate-y-[6px] transition-all flex-none shadow-sm"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white fill-current" />
                ) : (
                  <Play className="w-10 h-10 text-white fill-current ml-2" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Hint Area for Exam Practice */}
        {isExamPractice && mode === 'practice' && (
          <div className="mb-4 flex flex-col items-center px-4 w-full">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-600 transition-colors bg-yellow-50 px-5 py-2 rounded-full font-bold text-sm shadow-sm border border-yellow-100"
            >
              <Lightbulb className="w-5 h-5" />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
            
            {showHint && (
              <div className="mt-4 p-5 bg-yellow-50 border border-yellow-100 rounded-xl w-full text-left space-y-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-slate-700 font-medium leading-relaxed text-lg tracking-wide">
                  {getHintString(currentSnippet.text)}
                </p>
                {currentSnippet?.translation && (
                  <p className="text-slate-500 text-base border-t border-yellow-200/50 pt-3">
                    {currentSnippet.translation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        {mode === 'practice' && currentStage === 1 ? (
          <div className="w-full flex flex-col gap-6">
            {/* Selected Words Area */}
            <div className={`w-full bg-white border-2 border-b-4 rounded-2xl p-4 min-h-[120px] transition-all flex flex-wrap content-start gap-2 ${showAnswer ? 'bg-slate-50 border-slate-200' : 'border-slate-200'}`}>
              {((answers[currentIndex] as number[]) || []).map((id, idx) => {
                const wordObj = getScrambledWords(currentSnippet.text).find(w => w.id === id);
                if (!wordObj) return null;
                return (
                  <button
                    key={idx}
                    disabled={showAnswer}
                    onClick={() => {
                      const newAns = [...(answers[currentIndex] as number[])];
                      newAns.splice(idx, 1);
                      handleInput(newAns);
                    }}
                    className="px-4 py-2 bg-white border-2 border-slate-200 border-b-4 rounded-xl font-bold text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all"
                  >
                    {wordObj.word}
                  </button>
                );
              })}
            </div>
            
            {/* Word Bank */}
            <div className="flex flex-wrap justify-center gap-2 min-h-[100px]">
              {getScrambledWords(currentSnippet.text).map((wordObj) => {
                const isSelected = ((answers[currentIndex] as number[]) || []).includes(wordObj.id);
                return (
                  <button
                    key={wordObj.id}
                    disabled={isSelected || showAnswer}
                    onClick={() => {
                      const newAns = [...((answers[currentIndex] as number[]) || []), wordObj.id];
                      handleInput(newAns);
                    }}
                    className={`px-4 py-2 border-2 border-b-4 rounded-xl font-bold transition-all ${
                      isSelected 
                        ? 'bg-slate-200 border-slate-200 text-transparent shadow-none cursor-default' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] shadow-sm'
                    }`}
                  >
                    {wordObj.word}
                  </button>
                );
              })}
            </div>
          </div>
        ) : mode === 'practice' && currentStage === 2 ? (
          <div className={`w-full bg-white border-2 border-b-4 rounded-2xl p-6 text-xl font-bold outline-none min-h-[160px] transition-all ${showAnswer ? 'bg-slate-50 border-slate-200' : 'border-slate-200'}`}>
            <div className="flex flex-wrap items-center gap-y-6 gap-x-4 leading-loose">
              {getMaskedStructure(currentSnippet.text).map((item, idx) => {
                if (item.type === 'text') {
                  return <span key={idx} className="text-slate-500 mr-2">{item.word}</span>;
                }
                
                const currentVal = (answers[currentIndex] && typeof answers[currentIndex] === 'object' ? answers[currentIndex][item.id] : '') || '';
                const expectedCore = (item.coreWord || '').toLowerCase();
                let actualCore = currentVal.toLowerCase();
                
                const isCorrectWord = showAnswer && actualCore === expectedCore;

                return (
                  <div key={idx} className="flex items-center mr-2">
                    {item.prefix && <span className="text-slate-500 mr-1">{item.prefix}</span>}
                    <input
                      type="text"
                      data-input-idx={item.id}
                      className={`text-center font-black outline-none transition-colors px-1 tracking-wider rounded-t-lg mx-1
                        ${showAnswer 
                          ? isCorrectWord ? 'border-b-2 border-dashed border-[#58cc02] text-[#58cc02] bg-transparent' : 'border-b-4 border-[#ea2b2b] text-[#ea2b2b] bg-red-50' 
                          : 'border-b-4 border-slate-300 bg-slate-50 focus:border-[#1cb0f6] text-[#1cb0f6]'}`}
                      style={{ width: `calc(${Math.max((item.coreWord || '').length, currentVal.length, 2)}ch + 4px)` }}
                      value={showAnswer ? item.coreWord : currentVal}
                      disabled={showAnswer}
                      onFocus={(e) => {
                        // For mobile devices, smoothly scroll the input into view so it's not hidden by the virtual keyboard
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }}
                      onChange={(e) => {
                        const newAns = { ...(answers[currentIndex] || {}) };
                        newAns[item.id] = e.target.value.replace(/[^a-zA-Z0-9'-]/g, '');
                        handleInput(newAns);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          const structure = getMaskedStructure(currentSnippet.text);
                          const nextBlank = structure.find(x => x.id > item.id && x.type !== 'text');
                          if (nextBlank) {
                            const nextInput = document.querySelector(`input[data-input-idx="${nextBlank.id}"]`) as HTMLInputElement;
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                    />
                    {item.suffix && <span className="text-slate-500 ml-1">{item.suffix}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <textarea
            className={`w-full bg-white border-2 border-b-4 rounded-2xl p-6 text-xl font-bold text-slate-700 outline-none resize-none min-h-[160px] transition-all
              ${showAnswer ? 'bg-slate-50 border-slate-200 text-slate-500' : 'border-slate-200 focus:border-[#1cb0f6] focus:bg-white'}`}
            placeholder="在这里输入..."
            value={typeof answers[currentIndex] === 'string' ? answers[currentIndex] : ''}
            onChange={(e) => handleInput(e.target.value)}
            disabled={showAnswer}
          />
        )}
      </div>

      {/* Footer Area */}
      <div className={`fixed bottom-0 left-0 w-full border-t-2 px-4 py-6 transition-colors duration-300
        ${showAnswer 
          ? isCorrect ? 'bg-[#d7ffb8] border-[#c8f0a8]' : 'bg-[#ffdfe0] border-[#ffcdd2]'
          : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {showAnswer ? (
            <div className="flex-1 w-full">
              <div className={`text-2xl font-extrabold flex items-center gap-2 mb-2 ${isCorrect ? 'text-[#58a700]' : 'text-[#ea2b2b]'}`}>
                {isCorrect ? (
                  <><Check className="w-8 h-8 stroke-[4]" /> 太棒了！</>
                ) : (
                  <><X className="w-8 h-8 stroke-[4]" /> 正确答案是：</>
                )}
              </div>
              <div className={`text-lg font-bold ${isCorrect ? 'text-[#58cc02]' : 'text-[#ff4b4b]'}`}>
                <RichSentence text={currentSnippet.text} isCorrect={isCorrect} />
              </div>
              {currentSnippet.translation && (
                <div className={`text-sm mt-2 ${isCorrect ? 'text-[#58a700]/70' : 'text-[#ea2b2b]/70'}`}>
                  {currentSnippet.translation}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 w-full md:w-auto flex items-center justify-start">
              {!showAnswer && mode === 'practice' && (
                <button 
                  onClick={() => alert('AI 伴随指导正在启动...')}
                  className="hidden md:flex items-center gap-2 font-extrabold text-slate-400 bg-white border-2 border-slate-200 border-b-4 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-widest text-sm"
                >
                  <Bot className="w-6 h-6 text-[#1cb0f6]" />
                  <span>AI 伴随指导</span>
                </button>
              )}
            </div>
          )}

          <div className={`w-full ${showAnswer ? 'md:w-48' : 'md:w-48'}`}>
            {!showAnswer ? (
              <DuoBtn 
                variant="primary" 
                className="w-full py-4 text-lg"
                onClick={mode === 'practice' ? handleCheck : handleNext}
                disabled={!answers[currentIndex] && mode === 'practice'}
              >
                {mode === 'practice' ? '检查' : '下一题'}
              </DuoBtn>
            ) : (
              <DuoBtn 
                variant={isCorrect ? 'primary' : 'danger'}
                className="w-full py-4 text-lg"
                onClick={mode === 'practice' && !isCorrect ? handleRetry : handleNext}
              >
                {mode === 'practice' && !isCorrect ? '重试' : '继续'}
              </DuoBtn>
            )}
          </div>

        </div>
      </div>

      {/* Node Completion Animation Overlay */}
      {showNodeCompletion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-500 slide-in-from-bottom-10 max-w-md w-full">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,200,0,0.4)] mb-8 animate-bounce">
              {currentStage === 1 ? (
                <span className="text-6xl">🔥</span>
              ) : currentStage === 2 ? (
                <span className="text-6xl">🎯</span>
              ) : (
                <span className="text-6xl">👑</span>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-wider">
              {isReviewSession ? "弱点击破！" : currentStage === 1 ? "热身完毕！" : currentStage === 2 ? "渐入佳境！" : "满分表现！"}
            </h2>
            
            <p className="text-lg md:text-xl text-slate-200 font-bold mb-10">
              {isReviewSession 
                ? "干得漂亮！你已经重新复习并掌握了这些曾经错过的句子！"
                : currentStage === 1 
                  ? "干得漂亮，第一关轻松拿下！准备迎接下一关挑战吧！" 
                  : currentStage === 2 
                    ? "太强了，没有首字母提示也难不倒你！距离完全听懂只差一步之遥！"
                    : "太神了，完全盲听通关！你的听力已经无懈可击！"}
            </p>
            
            <DuoBtn 
              variant="primary" 
              className="w-full py-4 text-xl shadow-[0_6px_0_0_#46a302] active:shadow-none"
              onClick={handleCompleteNode}
            >
              继续
            </DuoBtn>
          </div>
        </div>
      )}
    </div>
  )
}