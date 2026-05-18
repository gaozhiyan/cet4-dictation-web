"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, GraduationCap, Clock, FileText, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Play, Pause, Sparkles, Target, Activity, Send, BellRing, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const EnglishKnowledgeGraph = ({ baseScore, vocabScore, centerLabel }: { baseScore: number, vocabScore: number, centerLabel: string }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 安全的分数格式化
  const s = (score: number) => Math.min(Math.max(Math.round(score), 0), 100);

  const nodes = useMemo(() => [
    // Level 0: Core
    { id: 'core', label: centerLabel + '综合听力', score: s(baseScore), x: 300, y: 300, r: 38, type: 'core' },
    
    // Level 1: 4大核心领域
    { id: 'vocab', label: '词汇语料', score: s(vocabScore), x: 300, y: 160, r: 30, type: 'domain' },
    { id: 'grammar', label: '语法结构', score: s(baseScore + 10), x: 440, y: 300, r: 30, type: 'domain' },
    { id: 'sound', label: '语音解码', score: s(baseScore - 15), x: 300, y: 440, r: 30, type: 'domain' },
    { id: 'comp', label: '逻辑推断', score: s(baseScore), x: 160, y: 300, r: 30, type: 'domain' },
    
    // Level 2: 细分技能点 (叶子节点)
    // 词汇分支
    { id: 'v1', label: '高频场景词', score: s(vocabScore + 5), x: 180, y: 80, r: 22, type: 'skill' },
    { id: 'v2', label: '同义替换', score: s(vocabScore - 10), x: 300, y: 50, r: 22, type: 'skill' },
    { id: 'v3', label: '固定搭配', score: s(vocabScore), x: 420, y: 80, r: 22, type: 'skill' },
    
    // 语法分支
    { id: 'g1', label: '长难句切分', score: s(baseScore - 10), x: 530, y: 180, r: 22, type: 'skill' },
    { id: 'g2', label: '时态语态', score: s(baseScore + 15), x: 560, y: 300, r: 22, type: 'skill' },
    { id: 'g3', label: '虚拟/倒装', score: s(baseScore - 5), x: 530, y: 420, r: 22, type: 'skill' },
    
    // 语音分支
    { id: 's1', label: '连读弱读', score: s(baseScore - 20), x: 420, y: 520, r: 22, type: 'skill' },
    { id: 's2', label: '失去爆破', score: s(baseScore - 10), x: 300, y: 550, r: 22, type: 'skill' },
    { id: 's3', label: '意群停顿', score: s(baseScore), x: 180, y: 520, r: 22, type: 'skill' },
    
    // 理解分支
    { id: 'c1', label: '细节捕获', score: s(baseScore + 5), x: 70, y: 420, r: 22, type: 'skill' },
    { id: 'c2', label: '主旨归纳', score: s(baseScore - 5), x: 40, y: 300, r: 22, type: 'skill' },
    { id: 'c3', label: '态度/推断', score: s(baseScore - 15), x: 70, y: 180, r: 22, type: 'skill' },
  ], [baseScore, vocabScore, centerLabel]);

  const links = useMemo(() => [
    // 核心骨架连线 (层级结构)
    { source: 'core', target: 'vocab' }, { source: 'core', target: 'grammar' },
    { source: 'core', target: 'sound' }, { source: 'core', target: 'comp' },
    
    { source: 'vocab', target: 'v1' }, { source: 'vocab', target: 'v2' }, { source: 'vocab', target: 'v3' },
    { source: 'grammar', target: 'g1' }, { source: 'grammar', target: 'g2' }, { source: 'grammar', target: 'g3' },
    { source: 'sound', target: 's1' }, { source: 'sound', target: 's2' }, { source: 'sound', target: 's3' },
    { source: 'comp', target: 'c1' }, { source: 'comp', target: 'c2' }, { source: 'comp', target: 'c3' },
    
    // 知识图谱特有：跨领域网状连线 (表示能力相互影响)
    { source: 'v2', target: 'c1' }, // 同义替换 -> 细节捕获
    { source: 's1', target: 'v3' }, // 连读弱读 -> 固定搭配 (听不出连读导致听不出词组)
    { source: 'g1', target: 'c2' }, // 长难句 -> 主旨归纳
    { source: 's3', target: 'g1' }, // 意群停顿 -> 长难句切分
    { source: 'v1', target: 'c3' }, // 场景词 -> 态度推断
    { source: 'grammar', target: 'comp' }, // 语法基础 -> 逻辑推断
    { source: 'sound', target: 'vocab' }, // 语音 -> 词汇
  ], []);

  // 预计算邻接表用于 Hover 亮起逻辑
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
    if (score >= 80) return { fill: '#3b82f6', border: '#60a5fa', text: '#1e3a8a', shadow: 'rgba(59,130,246,0.6)' }; // Blue
    if (score >= 60) return { fill: '#f59e0b', border: '#fbbf24', text: '#78350f', shadow: 'rgba(245,158,11,0.6)' }; // Orange
    return { fill: '#ef4444', border: '#f87171', text: '#7f1d1d', shadow: 'rgba(239,68,68,0.6)' }; // Red
  };

  const isHoveredOrNeighbor = (id: string) => {
    if (!hoveredNode) return true; // 默认全亮
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
        @keyframes edge-flow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .graph-flow-active {
          stroke-dasharray: 8 4;
          animation: edge-flow 1s linear infinite;
          stroke: #6366f1;
          stroke-width: 3;
        }
        .graph-flow-idle {
          stroke: #cbd5e1;
          stroke-width: 1.5;
        }
      `}</style>
      
      {/* Edges */}
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

      {/* Nodes */}
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
            {/* 节点外发光 */}
            <circle 
              cx={node.x} cy={node.y} r={node.r} 
              fill={colors.fill} 
              stroke={colors.border} 
              strokeWidth={hovered ? 4 : 2}
              className="transition-all duration-300"
              style={{ filter: active ? `drop-shadow(0 0 10px ${colors.shadow})` : 'none' }}
            />
            
            {/* 中心分数（加上 % 符号） */}
            <text 
              x={node.x} y={node.y} 
              textAnchor="middle" dy=".35em" 
              fill="white" fontSize={node.type === 'core' ? 16 : 12} fontWeight="900"
            >
              {node.score}%
            </text>

            {/* 标签背景块 */}
            <rect 
              x={node.x - 40} y={node.y + node.r + 6} 
              width="80" height="22" rx="6" 
              fill="white" fillOpacity="0.85"
              className="pointer-events-none"
            />
            
            {/* 标签文字 */}
            <text 
              x={node.x} y={node.y + node.r + 21} 
              textAnchor="middle" 
              fill="#334155" fontSize="12" fontWeight="bold"
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

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [allSnippets, setAllSnippets] = useState<any[]>([])
  const [selectedScore, setSelectedScore] = useState<any>(null)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null)
  const [mainTab, setMainTab] = useState<'learning' | 'testing'>('learning')
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'stats' | 'exam' | 'ai'>('overview')
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'avgScore', direction: 'desc' })
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  const [selectedClass, setSelectedClass] = useState<string>('全部')
  const [availableClasses, setAvailableClasses] = useState<string[]>(['全部'])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [chartDifficulty, setChartDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [statsDifficultyFilter, setStatsDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  // AI 学情分析状态
  const [viewMode, setViewMode] = useState<'list' | 'analysis'>('list')
  const [aiAnalysisContent, setAiAnalysisContent] = useState<string>('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiLoadingPhase, setAiLoadingPhase] = useState(0)
  const [analysisMetrics, setAnalysisMetrics] = useState<any>(null)

  // 从 localStorage 恢复教师面板状态
  useEffect(() => {
    const savedMainTab = localStorage.getItem('teacher_main_tab') as any
    const savedTab = localStorage.getItem('teacher_active_tab') as any
    const savedClass = localStorage.getItem('teacher_selected_class') as any
    const savedDate = localStorage.getItem('teacher_selected_date')

    if (savedMainTab) setMainTab(savedMainTab)
    if (savedTab) setActiveTab(savedTab)
    if (savedClass) setSelectedClass(savedClass)
    if (savedDate !== null) setSelectedDate(savedDate)
    const savedStatsDiff = localStorage.getItem('teacher_stats_difficulty') as any
    if (savedStatsDiff) setStatsDifficultyFilter(savedStatsDiff)
  }, [])

  // 保存教师面板状态到 localStorage
  useEffect(() => {
    localStorage.setItem('teacher_main_tab', mainTab)
    localStorage.setItem('teacher_active_tab', activeTab)
    localStorage.setItem('teacher_selected_class', selectedClass)
    localStorage.setItem('teacher_selected_date', selectedDate)
    localStorage.setItem('teacher_stats_difficulty', statsDifficultyFilter)
  }, [mainTab, activeTab, selectedClass, selectedDate, statsDifficultyFilter])

  // 当切换班级或日期时，如果当前在 AI 洞察报告页，则自动重置回列表页，避免数据与班级不匹配
  useEffect(() => {
    if (activeTab === 'ai' && viewMode === 'analysis') {
      setViewMode('list')
    }
  }, [selectedClass, selectedDate])

  const router = useRouter()
  const supabase = createClient()
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const AUDIO_BASE_URL = "https://cdn.jsdelivr.net/gh/gaozhiyan/cet4-audios@main"

  const difficultyMap = useMemo(() => {
    const map: Record<string, string> = {}
    allSnippets.forEach(s => {
      let diff = s.difficulty
      if (!diff) {
        if (s.duration <= 5) diff = 'easy'
        else if (s.duration <= 10) diff = 'medium'
        else diff = 'hard'
      }
      map[s.text] = diff
    })
    return map
  }, [allSnippets])

  const filteredScores = useMemo(() => {
    return scores.filter(score => {
      const classGroup = score.details?.class_group || '-'
      const classMatch = selectedClass === '全部' || classGroup === selectedClass;
      
      let dateMatch = true;
      if (selectedDate) {
        const date = new Date(score.created_at)
        const localDate = new Date(date.getTime() + (8 * 60 * 60 * 1000))
        const year = localDate.getUTCFullYear()
        const month = String(localDate.getUTCMonth() + 1).padStart(2, '0')
        const day = String(localDate.getUTCDate()).padStart(2, '0')
        const scoreDateStr = `${year}-${month}-${day}`
        
        dateMatch = scoreDateStr === selectedDate;
      }
      return classMatch && dateMatch;
    });
  }, [scores, selectedClass, selectedDate])

  const overviewStats = useMemo(() => {
    const stats = {
      totalStudents: 0,
      totalTests: { easy: 0, medium: 0, hard: 0, unknown: 0 },
      testScoreSum: { easy: 0, medium: 0, hard: 0, unknown: 0 },
      studentRanking: [] as { name: string, scoreSum: number, count: number, avgScore: number }[]
    }

    const uniqueStudents = new Set<string>()
    const studentMap: Record<string, { scoreSum: number, count: number }> = {}

    filteredScores.forEach(score => {
      const studentName = score.details?.full_name || '未知姓名'
      uniqueStudents.add(studentName)

      if (!studentMap[studentName]) {
        studentMap[studentName] = { scoreSum: 0, count: 0 }
      }

      // 将 test (随机模考) 和 exam (历年真题) 的分数都计入 AI 综合评分计算
      if (score.mode === 'test' || score.mode === 'exam') {
        if (score.score !== undefined) {
           // 按整张卷子的得分来累加，计算更合理的能力画像分
           studentMap[studentName].scoreSum += score.score
           studentMap[studentName].count += 1
        }
      }

      // 仅保留对 test 模式各难度试卷的统计，用于概况面板的各难度答题人次（试卷数）
      if (score.mode === 'test' && score.details?.answers) {
        // 推断整张试卷的主导难度
        const diffCounts = { easy: 0, medium: 0, hard: 0, unknown: 0 }
        score.details.answers.forEach((ans: any) => {
          const diff = difficultyMap[ans.expected] || 'unknown'
          diffCounts[diff as keyof typeof diffCounts] += 1
        })
        
        let testDiff = 'unknown'
        let maxCount = 0
        Object.entries(diffCounts).forEach(([diff, count]) => {
          if (count > maxCount) {
            maxCount = count
            testDiff = diff
          }
        })
        
        // 记录这张试卷（1人次/1份考卷）及其总分
        stats.totalTests[testDiff as keyof typeof stats.totalTests] += 1
        stats.testScoreSum[testDiff as keyof typeof stats.testScoreSum] += (score.score || 0)
      }
    })

    stats.totalStudents = uniqueStudents.size
    
    stats.studentRanking = Object.entries(studentMap).map(([name, data]) => ({
      name,
      scoreSum: data.scoreSum,
      count: data.count,
      avgScore: data.count > 0 ? Math.round(data.scoreSum / data.count) : 0
    })).sort((a, b) => b.avgScore - a.avgScore)

    return stats
  }, [filteredScores, difficultyMap])

  const dashboardMetrics = useMemo(() => {
    const total = overviewStats.totalStudents;
    
    // Today's Active / Selected Date Active
    const targetDateStr = selectedDate || (() => {
      const d = new Date(new Date().getTime() + 8*3600*1000);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    })();
    const activeStudents = new Set();
    
    scores.forEach(s => {
      const date = new Date(s.created_at);
      const localDate = new Date(date.getTime() + 8*3600*1000);
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      
      if (dStr === targetDateStr) {
         const classGroup = s.details?.class_group || '-';
         if (selectedClass === '全部' || classGroup === selectedClass) {
           activeStudents.add(s.details?.full_name || s.user_id);
         }
      }
    });
    const activeCount = activeStudents.size;

    // Pass Rate (>= 60)
    const passCount = overviewStats.studentRanking.filter(s => s.avgScore >= 60).length;
    const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

    return { total, activeCount, passRate };
  }, [overviewStats, scores, selectedDate, selectedClass]);

  const chartData = useMemo(() => {
    // Record<dateKey, Record<className, { sum: number, count: number }>>
    const testsByDate: Record<string, Record<string, { sum: number, count: number }>> = {}
    
    scores.forEach(score => {
      if (score.mode !== 'test') return
      
      const answers = score.details?.answers
      if (!answers || answers.length === 0) return
      
      const testDiff = difficultyMap[answers[0].expected] || 'unknown'
      if (testDiff !== chartDifficulty) return
      
      const classGroup = score.details?.class_group || '-'
      
      // Convert UTC time from Supabase to local China time (UTC+8) for grouping dates correctly
      const date = new Date(score.created_at)
      const localDate = new Date(date.getTime() + (8 * 60 * 60 * 1000))
      
      const year = localDate.getUTCFullYear()
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(localDate.getUTCDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      
      if (!testsByDate[dateKey]) {
        testsByDate[dateKey] = {}
      }
      
      if (!testsByDate[dateKey][classGroup]) {
        testsByDate[dateKey][classGroup] = { sum: 0, count: 0 }
      }
      
      testsByDate[dateKey][classGroup].sum += (score.score || 0)
      testsByDate[dateKey][classGroup].count += 1
    })

    const sortedDates = Object.keys(testsByDate).sort()
    
    return sortedDates.map(dateKey => {
      const displayDate = dateKey.substring(5) // MM-DD
      const result: any = { date: displayDate }
      
      // Compute average for each class
      Object.keys(testsByDate[dateKey]).forEach(cls => {
        const stats = testsByDate[dateKey][cls]
        result[`${cls}平均分`] = stats.count > 0 ? Math.round(stats.sum / stats.count) : null
      })
      
      return result
    })
  }, [scores, difficultyMap, chartDifficulty])

  const learningStatusData = useMemo(() => {
    // 记录每天每种模式的独立打卡人数
    const dailyCheckins: Record<string, {
      practice: Set<string>,
      test: Set<string>,
      vocab: Set<string>,
      exam: Set<string>
    }> = {}
    
    // 这里使用未过滤的原始 scores 数组，统计全校在各种模式的参与情况
    scores.forEach(score => {
      const studentName = score.details?.full_name
      if (!studentName) return
      
      const mode = score.mode || 'practice' // fallback
      if (!['practice', 'test', 'vocab', 'exam'].includes(mode)) return
      
      // 容错处理班级信息，支持 高志晏 的特殊班级名
      const classGroup = score.details?.class_group || '-'
      const isA = classGroup.includes('A') || classGroup === 'A' || classGroup === 'A班'
      const isB = classGroup.includes('B') || classGroup === 'B' || classGroup === 'B班'
      const normalizedClass = isA ? 'A班' : isB ? 'B班' : classGroup
      
      // 如果老师筛选了特定班级，且该学生不在该班级中，则过滤掉（如果是“全部”则不过滤）
      if (selectedClass !== '全部' && normalizedClass !== selectedClass) return
      
      const date = new Date(score.created_at)
      const localDate = new Date(date.getTime() + (8 * 60 * 60 * 1000))
      
      const year = localDate.getUTCFullYear()
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(localDate.getUTCDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      
      if (!dailyCheckins[dateKey]) {
        dailyCheckins[dateKey] = { 
          practice: new Set(), 
          test: new Set(), 
          vocab: new Set(), 
          exam: new Set() 
        }
      }
      
      dailyCheckins[dateKey][mode as keyof typeof dailyCheckins[string]].add(studentName)
    })

    const sortedDates = Object.keys(dailyCheckins).sort()
    
    return sortedDates.map(dateKey => {
      const displayDate = dateKey.substring(5) // MM-DD
      
      return {
      date: displayDate,
      '碎片闯关': dailyCheckins[dateKey].practice.size,
      '全真模考(随机)': dailyCheckins[dateKey].test.size,
      '词汇水平': dailyCheckins[dateKey].vocab.size,
      '全真模考(真题)': dailyCheckins[dateKey].exam.size,
    }
    })
  }, [scores])

  const learningVolumeData = useMemo(() => {
    const studentMap: Record<string, { 
      name: string, 
      classGroup: string, 
      practiceCount: number, 
      vocabCount: number, 
      testCount: number, 
      examCount: number,
      userId: string 
    }> = {}

    filteredScores.forEach(score => {
      const studentName = score.details?.full_name
      if (!studentName) return
      
      if (!studentMap[studentName]) {
        const classGroup = score.details?.class_group || '-'
        
        studentMap[studentName] = {
          name: studentName,
          classGroup: classGroup,
          practiceCount: 0,
          vocabCount: 0,
          testCount: 0,
          examCount: 0,
          userId: score.user_id || ''
        }
      }

      if (score.mode === 'practice') {
        studentMap[studentName].practiceCount += 1
      } else if (score.mode === 'vocab') {
        studentMap[studentName].vocabCount += 1
      } else if (score.mode === 'test') {
        studentMap[studentName].testCount += 1
      } else if (score.mode === 'exam') {
        studentMap[studentName].examCount += 1
      }
    })

    return Object.values(studentMap).sort((a, b) => {
       const totalA = a.practiceCount + a.vocabCount + a.testCount + a.examCount
       const totalB = b.practiceCount + b.vocabCount + b.testCount + b.examCount
       return totalB - totalA
    })
  }, [filteredScores])

  const questionStats = useMemo(() => {
    const stats: Record<string, { total: number, scoreSum: number, expected: string, studentAnswers: any[], difficulty: string, filename: string }> = {}
    
    // Create a mapping from expected text to filename using allSnippets
    const textToFilenameMap: Record<string, string> = {}
    allSnippets.forEach(s => {
      if (s.text && s.filename) {
        textToFilenameMap[s.text] = s.filename
      }
    })

    filteredScores.forEach(score => {
      if (score.details?.answers) {
        score.details.answers.forEach((ans: any) => {
          if (!stats[ans.expected]) {
            stats[ans.expected] = { 
              total: 0, 
              scoreSum: 0, 
              expected: ans.expected, 
              studentAnswers: [],
              difficulty: difficultyMap[ans.expected] || 'unknown',
              // Try to get filename from answer, fallback to allSnippets map
              filename: ans.filename || textToFilenameMap[ans.expected] || ''
            }
          }
          // If the previous record didn't have a filename but this one does, update it
          if (!stats[ans.expected].filename && (ans.filename || textToFilenameMap[ans.expected])) {
            stats[ans.expected].filename = ans.filename || textToFilenameMap[ans.expected] || ''
          }
          
          stats[ans.expected].total += 1
          stats[ans.expected].scoreSum += (ans.score || 0)
          stats[ans.expected].studentAnswers.push({
            name: score.details?.full_name || '未知姓名',
            actual: ans.actual || '',
            score: ans.score || 0
          })
        })
      }
    })

    return Object.values(stats).map(s => ({
      expected: s.expected,
      difficulty: s.difficulty,
      filename: s.filename,
      avgScore: Math.round(s.scoreSum / s.total),
      total: s.total,
      studentAnswers: s.studentAnswers.sort((a, b) => b.score - a.score) // 学生按得分从高到低排序
    }))
  }, [filteredScores, difficultyMap, allSnippets])

 const sortedQuestionStats = useMemo(() => {
    let sortableItems = [...questionStats].filter(stat => {
      if (stat.difficulty === 'unknown') return false; // 隐藏未知难度的题目
      if (statsDifficultyFilter !== 'all' && stat.difficulty !== statsDifficultyFilter) return false;
      return true;
    });

    sortableItems.sort((a: any, b: any) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // 特殊处理难度排序
      if (sortConfig.key === 'difficulty') {
        const diffWeight: Record<string, number> = { 'easy': 1, 'medium': 2, 'hard': 3, 'unknown': 0 };
        aValue = diffWeight[a.difficulty] || 0;
        bValue = diffWeight[b.difficulty] || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [questionStats, sortConfig, statsDifficultyFilter]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  }

  const toggleRow = (expected: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(expected)) {
      newExpandedRows.delete(expected)
    } else {
      newExpandedRows.add(expected)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleExportJSON = () => {
    const stats: Record<string, any> = {}
    
    scores.forEach(score => {
      if (score.mode !== 'test') return;
      const answers = score.details?.answers;
      if (!answers) return;
      const studentName = score.details?.full_name || '未知姓名';
      const classGroup = score.details?.class_group || '未知班级';
      
      answers.forEach((ans: any) => {
        if (!ans.expected) return;
        if (!stats[ans.expected]) {
          stats[ans.expected] = {
            expected_text: ans.expected,
            total_score: 0,
            attempts_count: 0,
            student_answers: []
          }
        }
        stats[ans.expected].total_score += (ans.score || 0);
        stats[ans.expected].attempts_count += 1;
        stats[ans.expected].student_answers.push({
          name: studentName,
          class: classGroup,
          actual: ans.actual || '',
          score: ans.score || 0
        });
      })
    });
    
    const result = Object.values(stats)
      .filter((s: any) => s.attempts_count >= 10)
      .map((s: any) => ({
        expected_text: s.expected_text,
        average_score: Math.round(s.total_score / s.attempts_count),
        attempts_count: s.attempts_count,
        student_answers: s.student_answers
      }))
      .sort((a: any, b: any) => a.average_score - b.average_score);
      
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_test_analysis_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 生成全局学情分析
  const handleGenerateAiAnalysis = async () => {
    if (isAiLoading) return;
    
    setViewMode('analysis');
    setIsAiLoading(true);
    setAiAnalysisContent('');
    
    let phase = 0;
    setAiLoadingPhase(0);
    const phaseInterval = setInterval(() => {
      phase = (phase + 1) % 3;
      setAiLoadingPhase(phase);
    }, 1500);

    try {
      // 聚合全局或当前筛选条件下的数据
      const practiceData = filteredScores.filter(s => s.mode === 'practice');
      const vocabData = filteredScores.filter(s => s.mode === 'vocab');
      const examData = filteredScores.filter(s => s.mode === 'exam');
      const testData = filteredScores.filter(s => s.mode === 'test');
      
      // 计算一些全局维度的统计指标
      const totalStudents = new Set(filteredScores.map(s => s.user_id || s.details?.full_name)).size;
      const practiceCount = practiceData.length;
      const avgVocabScore = vocabData.length > 0 ? Math.round(vocabData.reduce((sum, s) => sum + (s.score || 0), 0) / vocabData.length) : 0;
      const avgTestScore = testData.length > 0 ? Math.round(testData.reduce((sum, s) => sum + (s.score || 0), 0) / testData.length) : 0;
      const avgExamScore = examData.length > 0 ? Math.round(examData.reduce((sum, s) => sum + (s.score || 0), 0) / examData.length) : 0;

      // 生成图表所需的模拟/聚合数据
      const vocabPercentage = avgVocabScore > 100 ? Math.min(Math.round((avgVocabScore / 4500) * 100), 100) : (avgVocabScore || 60);
      const baseScore = avgExamScore > 0 ? avgExamScore : 65;
      
      const radarData = [
        { name: '词汇储备', score: vocabPercentage, fullMark: 100 },
        { name: '语法结构', score: Math.min(baseScore + 10, 95), fullMark: 100 },
        { name: '听音辨音', score: Math.max(baseScore - 15, 40), fullMark: 100 },
        { name: '长难句切分', score: Math.max(baseScore - 10, 45), fullMark: 100 },
        { name: '语境推断', score: baseScore, fullMark: 100 }
      ].map(item => ({
        ...item,
        subject: `${item.name} ${item.score}%`
      }));

      // 从真实错题中动态提取听音盲区分布
      let difficultyData = [];
      const errorTypes = { '连读/弱读': 0, '生僻词汇': 0, '句型倒装': 0, '同义替换': 0, '时态混淆': 0, '其他': 0 };
      
      testData.forEach(score => {
        score.details?.answers?.forEach((ans: any) => {
          if (ans.score < 100 && ans.expected) {
            const diff = difficultyMap[ans.expected] || 'unknown';
            if (diff === 'hard') errorTypes['连读/弱读'] += 2;
            else if (diff === 'medium') errorTypes['同义替换'] += 1;
            else errorTypes['生僻词汇'] += 1;
          }
        });
      });
      
      difficultyData = Object.entries(errorTypes)
        .filter(([k, v]) => v > 0)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
      if (difficultyData.length === 0) {
        difficultyData = [
          { name: '暂无错题数据', count: 1 }
        ];
      }

      setAnalysisMetrics({
        totalStudents,
        avgVocabScore,
        avgTestScore,
        avgExamScore,
        radarData,
        difficultyData
      });

      // 提取高频错题 (仅提取模考错题前 10 个作为样本发给 AI，避免 token 超限)
      const testMistakes: Record<string, number> = {};
      testData.forEach(score => {
        score.details?.answers?.forEach((ans: any) => {
          if (ans.score < 100 && ans.expected) {
            testMistakes[ans.expected] = (testMistakes[ans.expected] || 0) + 1;
          }
        });
      });
      const topMistakes = Object.entries(testMistakes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([text, count]) => ({ text, errorCount: count }));

      const aggregatedData = {
        filterContext: { class: selectedClass, date: selectedDate || '最近' },
        overview: { totalStudents, practiceCount, avgVocabScore, avgTestScore, avgExamScore },
        topMistakes
      };

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctagfkejsnelhmqygiyk.supabase.co';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = (await supabase.auth.getSession()).data.session?.access_token || anonKey;

      const prompt = `作为CET4 AI教研专家，请根据以下数据为【${selectedClass}】生成一份专业班级学情分析报告：
【数据概览】：总人数${totalStudents}，平均词汇分${avgVocabScore}，平均随机模考分${avgTestScore}，平均真题模考分${avgExamScore}。
【高频错题样本】：
${topMistakes.map(m => `- ${m.text} (错误次数: ${m.errorCount})`).join('\n')}

请按以下结构输出报告，必须使用 Markdown 格式：
### 一、核心数据洞察
（分析数据表现，指出【${selectedClass}】的整体水平，100字内）
### 二、典型共性问题
（根据错题样本，分析发音、连读、词汇等维度的共性问题，150字内）
### 三、靶向干预建议
（给出具体的 OMO 教学干预策略和下一步作业布置建议，150字内）`;

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

      if (!response.ok) throw new Error('Failed to get AI analysis');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;
      let buffer = '';
      
      const processLines = (lines: string[]) => {
        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0]?.delta?.content) {
                setAiAnalysisContent(prev => prev + data.choices[0].delta.content);
              }
            } catch (e) {}
          }
        }
      };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          processLines(lines);
        }
      }
      
      if (buffer.trim()) processLines([buffer]);
      
      clearInterval(phaseInterval);
      setIsAiLoading(false);
    } catch (err: any) {
      clearInterval(phaseInterval);
      setIsAiLoading(false);
      setAiAnalysisContent('抱歉，学情分析生成失败，请稍后再试。' + err.message);
    }
  };

  const handleJumpToPractice = (expected: string, difficulty: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row expansion
    
    // Store the specific sentence we want to practice in localStorage
    localStorage.setItem('practice_target_sentence', expected)
    localStorage.setItem('practice_target_difficulty', difficulty)
    localStorage.setItem('practice_return_to', '/teacher?tab=stats')
    
    // Navigate to the practice page
    router.push('/?mode=practice&diff=' + difficulty)
  }

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const fullName = (user.user_metadata?.full_name || '').trim()
      const email = user.email || ''
      if (fullName !== '高志晏' && fullName !== '陈欣鑫' && fullName !== '001' && !email.startsWith('001@')) {
        router.push('/')
        return
      }

      setUser(user)

      try {
        const fetchWithFallback = async (url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) {
              console.warn(`Warning: Failed to fetch ${url} (status: ${res.status})`);
              return [];
            }
            return await res.json();
          } catch (e) {
            console.warn(`Warning: Failed to fetch ${url}`, e);
            return [];
          }
        };

        const [set1, set2, set3, set4] = await Promise.all([
          fetchWithFallback('/data/202406-set1.json'),
          fetchWithFallback('/data/202406-set2.json'),
          fetchWithFallback('/data/202512-set1.json'),
          fetchWithFallback('/data/202506-set2.json')
        ])
        setAllSnippets([...set1, ...set2, ...set3, ...set4])
      } catch (err) {
        console.error("加载题目数据时发生严重错误:", err)
      }

      // 尝试加载静态的历史数据（4月份及之前）
      let historyScores: any[] = [];
      let hasLocalHistory = false;
      try {
        const res = await fetch('/data/history-scores.json');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            historyScores = data;
            hasLocalHistory = true;
            console.log('已加载静态历史数据:', historyScores.length, '条');
          } else {
            console.log('静态历史数据为空数组');
          }
        }
      } catch (err) {
        console.log('未找到静态历史数据，将从 Supabase 全量拉取');
      }

      let allScores: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let fetchMore = true;

      // 如果有静态数据，只拉取 5 月 1 日之后的数据；否则全量拉取
      const fetchAfter = hasLocalHistory ? '2026-05-01T00:00:00Z' : null;

      while (fetchMore) {
        let query = supabase
          .from('scores')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);
          
        if (fetchAfter) {
          query = query.gte('created_at', fetchAfter);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('获取成绩失败:', error);
          break;
        }
        
        if (data && data.length > 0) {
          allScores = [...allScores, ...data];
          if (data.length < pageSize) {
            fetchMore = false;
          } else {
            page++;
          }
        } else {
          fetchMore = false;
        }
      }
      
      // 如果本地没有历史文件，且我们在开发环境下（localhost），自动把4月份及之前的数据发送到本地 API 保存
      // 注意：只有当 historyScores.length === 0 时才尝试保存，避免反复覆盖
      if (!hasLocalHistory && historyScores.length === 0 && window.location.hostname === 'localhost') {
        const oldData = allScores.filter(s => new Date(s.created_at) < new Date('2026-05-01T00:00:00Z'));
        if (oldData.length > 0) {
          console.log(`正在自动保存 ${oldData.length} 条历史数据到本地...`);
          try {
            await fetch('/api/export-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(oldData)
            });
            console.log('历史数据自动保存成功！');
          } catch (e) {
            console.error('历史数据自动保存失败:', e);
          }
        }
      }

      // 合并动态数据和静态历史数据
      const combinedScores = [...allScores, ...historyScores];
      setScores(combinedScores);

      // 提取所有唯一班级
      const classes = new Set<string>();
      combinedScores.forEach(score => {
        if (score.details?.class_group) {
          const cg = score.details.class_group.trim();
          if (cg && cg !== '-') classes.add(cg);
        }
      });
      
      const classArray = Array.from(classes).sort();
      setAvailableClasses(['全部', ...classArray]);

      setLoading(false)
    }

    checkAuthAndFetchData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#58cc02] rounded-full animate-spin"></div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h1 className="text-3xl font-extrabold text-slate-700 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-[#58cc02]" />
              教师管理面板
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white hover:bg-slate-50 text-slate-400 border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
              <Download className="w-4 h-4" /> 导出报告
            </button>
            <div className="text-slate-500 font-bold bg-white px-4 py-2.5 rounded-2xl border-2 border-slate-200 ml-2 hidden md:block">
              管理员: {user?.user_metadata?.full_name}
            </div>
          </div>
        </header>

        {/* Main Content Area: Sidebar + Right Panel */}
        <div className="flex flex-col lg:flex-row gap-8 min-h-[800px]">
          
          {/* Left Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 shadow-sm space-y-2 sticky top-6">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 px-2">管理模块</div>
              
              <button 
                onClick={() => { setMainTab('testing'); setActiveTab('overview'); setViewMode('list'); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold transition-all text-left ${
                  mainTab === 'testing' && activeTab === 'overview' && viewMode !== 'analysis'
                    ? 'bg-[#1cb0f6] text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Activity className="w-5 h-5" /> 全局驾驶舱
              </button>

              <button 
                onClick={() => { setMainTab('testing'); setActiveTab('ai'); setViewMode('list'); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold transition-all text-left ${
                  mainTab === 'testing' && activeTab === 'ai' && viewMode !== 'analysis'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Bot className="w-5 h-5" /> AI 班级洞察
              </button>

              <div className="my-4 border-t-2 border-slate-100"></div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 px-2">学情明细</div>

              <button 
                onClick={() => { setMainTab('testing'); setActiveTab('records'); setViewMode('list'); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold transition-all text-left ${
                  mainTab === 'testing' && activeTab === 'records' && viewMode !== 'analysis'
                    ? 'bg-slate-800 text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Users className="w-5 h-5" /> 学生能力档案
              </button>

              <button 
                onClick={() => { setMainTab('testing'); setActiveTab('stats'); setViewMode('list'); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold transition-all text-left ${
                  mainTab === 'testing' && activeTab === 'stats' && viewMode !== 'analysis'
                    ? 'bg-slate-800 text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Target className="w-5 h-5" /> 模考错题库
              </button>

              <button 
                onClick={() => { setMainTab('learning'); setViewMode('list'); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold transition-all text-left ${
                  mainTab === 'learning' && viewMode !== 'analysis'
                    ? 'bg-slate-800 text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <FileText className="w-5 h-5" /> 学习打卡流水
              </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Global Control Bar (Filters) */}
            <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {availableClasses.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                      selectedClass === cls
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {cls === '全部' ? '全部班级' : cls}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-50 text-slate-600 font-bold px-4 py-2 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-slate-300 transition-colors cursor-pointer"
                  />
                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-50"
                    >
                      <XCircle className="w-5 h-5 fill-white" />
                    </button>
                  )}
                </div>
                {mainTab === 'testing' && viewMode === 'list' && (
                  <button 
                    onClick={handleExportJSON}
                    className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">导出分析</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic View Rendering */}
            {viewMode === 'analysis' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold text-indigo-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                全局学情 AI 洞察报告 <span className="text-lg text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full">{selectedClass}</span>
              </h2>
              <button 
                onClick={() => {
                  setViewMode('list')
                  setAnalysisMetrics(null)
                  setAiAnalysisContent('')
                }}
                className="bg-white hover:bg-slate-50 text-slate-500 font-bold px-6 py-3 rounded-2xl border-2 border-slate-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> 返回看板
              </button>
            </div>

            {isAiLoading && !analysisMetrics ? (
              <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-sm p-20 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-bold animate-pulse text-2xl">
                  {aiLoadingPhase === 0 && "🔍 正在多维度聚合班级数据..."}
                  {aiLoadingPhase === 1 && "🧠 正在绘制班级技能星系图..."}
                  {aiLoadingPhase === 2 && "✨ 正在生成专家级教学建议..."}
                </p>
              </div>
            ) : analysisMetrics ? (
              <>
                {/* 第一排：核心指标 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: '参训总人数', value: analysisMetrics.totalStudents, unit: '人', color: 'from-blue-400 to-blue-500' },
                    { label: '词汇平均分', value: analysisMetrics.avgVocabScore, unit: '分', color: 'from-orange-400 to-orange-500' },
                    { label: '模考平均分', value: analysisMetrics.avgExamScore, unit: '分', color: 'from-purple-400 to-purple-500' },
                    { label: '听力正确率', value: analysisMetrics.avgTestScore, unit: '%', color: 'from-green-400 to-green-500' }
                  ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-3xl p-6 text-white shadow-md relative overflow-hidden`}>
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                      <div className="text-white/80 font-bold mb-2">{stat.label}</div>
                      <div className="text-4xl font-black">{stat.value} <span className="text-xl font-bold opacity-80">{stat.unit}</span></div>
                    </div>
                  ))}
                </div>

                {/* 第二排：图表区 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 星系图：班级能力画像 */}
                  <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm flex flex-col">
                    <h3 className="text-xl font-extrabold text-slate-700 mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" /> AI 班级技能星系图
                    </h3>
                    <div className="flex-1 w-full min-h-[300px] flex items-center justify-center py-4">
                      <div className="w-full max-w-[500px] aspect-square">
                        <EnglishKnowledgeGraph 
                          baseScore={analysisMetrics.avgExamScore > 0 ? analysisMetrics.avgExamScore : (analysisMetrics.avgTestScore > 0 ? analysisMetrics.avgTestScore : 65)} 
                          vocabScore={analysisMetrics.avgVocabScore > 100 ? Math.min(Math.round((analysisMetrics.avgVocabScore / 4500) * 100), 100) : (analysisMetrics.avgVocabScore || 60)} 
                          centerLabel={selectedClass === '全部' ? '全年级' : selectedClass} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* 柱状图：高频听音盲区 */}
                  <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
                    <h3 className="text-xl font-extrabold text-slate-700 mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-rose-500" /> 核心听音盲区分布
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysisMetrics.difficultyData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 'bold', fontSize: 13 }} width={100} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0', fontWeight: 'bold' }} cursor={{ fill: '#f1f5f9' }} />
                          <Bar dataKey="count" fill="#fb7185" radius={[0, 8, 8, 0]} barSize={24} name="错误频次" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 第三排：AI 教学建议 (Markdown 流式输出) */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border-2 border-indigo-100 p-8 shadow-sm">
                  <h3 className="text-2xl font-extrabold text-indigo-900 mb-6 flex items-center gap-2 border-b-2 border-indigo-100/50 pb-4">
                    <Bot className="w-8 h-8 text-indigo-600" /> 专家级教学建议与重点
                  </h3>
                  <div className="text-slate-700 text-lg leading-relaxed markdown-container custom-scrollbar min-h-[200px]">
                    {isAiLoading && !aiAnalysisContent ? (
                      <div className="flex items-center gap-3 text-indigo-500 font-bold">
                        <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        正在流式生成专家建议...
                      </div>
                    ) : (
                      <ReactMarkdown>{aiAnalysisContent}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : mainTab === 'learning' ? (
          <div className="space-y-8">
            <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-extrabold text-slate-700">学生每日打卡人数趋势 (按学习模式)</h2>
              </div>
              <div className="h-96 w-full">
                {learningStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={learningStatusData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0', fontWeight: 'bold', color: '#334155' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold', paddingTop: '20px' }} />
                      <Bar dataKey="碎片闯关" stackId="a" fill="#58cc02" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="全真模考(随机)" stackId="a" fill="#ce82ff" />
                      <Bar dataKey="词汇水平" stackId="a" fill="#ff9600" />
                      <Bar dataKey="全真模考(真题)" stackId="a" fill="#ff4b4b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                    暂无打卡数据
                  </div>
                )}
              </div>
            </div>

            {/* 学生学习量表格 */}
            <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6">
              <h2 className="text-2xl font-extrabold text-slate-700 mb-6">学生打卡学习量明细</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="py-4 px-4 font-bold text-slate-400 w-24">姓名</th>
                      <th className="py-4 px-4 font-bold text-slate-400 w-24">班级</th>
                      <th className="py-4 px-4 font-bold text-slate-400 w-32 text-center">碎片闯关(次)</th>
                      <th className="py-4 px-4 font-bold text-slate-400 w-32 text-center">词汇水平(次)</th>
                      <th className="py-4 px-4 font-bold text-slate-400 w-32 text-center">全真模考(随机)(次)</th>
                      <th className="py-4 px-4 font-bold text-slate-400 w-32 text-center">全真模考(真题)(次)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learningVolumeData.map((student, idx) => (
                      <tr key={idx} className="border-b-2 border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-700">{student.name}</td>
                        <td className="py-4 px-4 font-medium text-slate-600">{student.classGroup}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-bold px-3 py-1 rounded-xl inline-block ${student.practiceCount > 0 ? 'bg-[#eaffd7] text-[#58a700]' : 'text-slate-400'}`}>
                            {student.practiceCount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-bold px-3 py-1 rounded-xl inline-block ${student.vocabCount > 0 ? 'bg-[#e5f5ff] text-[#1cb0f6]' : 'text-slate-400'}`}>
                            {student.vocabCount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-bold px-3 py-1 rounded-xl inline-block ${student.testCount > 0 ? 'bg-[#fff4e5] text-[#ff9600]' : 'text-slate-400'}`}>
                            {student.testCount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-bold px-3 py-1 rounded-xl inline-block ${student.examCount > 0 ? 'bg-[#ffeaeb] text-[#ff4b4b]' : 'text-slate-400'}`}>
                            {student.examCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {learningVolumeData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                          当前班级或日期暂无学习数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : mainTab === 'testing' ? (
          <>
            {activeTab !== 'ai' && (
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setActiveTab('overview')} 
                    className={`px-6 py-3 rounded-2xl font-bold border-b-4 transition-all ${
                      activeTab === 'overview' 
                        ? 'bg-[#1cb0f6] text-white border-[#1899d6] hover:bg-[#1899d6] hover:border-[#1899d6]' 
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-500'
                    }`}
                  >
                    随机模考概况
                  </button>
                  <button 
                    onClick={() => setActiveTab('records')} 
                    className={`px-6 py-3 rounded-2xl font-bold border-b-4 transition-all ${
                      activeTab === 'records' 
                        ? 'bg-[#1cb0f6] text-white border-[#1899d6] hover:bg-[#1899d6] hover:border-[#1899d6]' 
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-500'
                    }`}
                  >
                    随机模考记录
                  </button>
                  <button 
                    onClick={() => setActiveTab('stats')} 
                    className={`px-6 py-3 rounded-2xl font-bold border-b-4 transition-all ${
                      activeTab === 'stats' 
                        ? 'bg-[#1cb0f6] text-white border-[#1899d6] hover:bg-[#1899d6] hover:border-[#1899d6]' 
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-500'
                    }`}
                  >
                    随机模考错题
                  </button>
                  <button 
                    onClick={() => setActiveTab('exam')} 
                    className={`px-6 py-3 rounded-2xl font-bold border-b-4 transition-all ${
                      activeTab === 'exam' 
                        ? 'bg-[#1cb0f6] text-white border-[#1899d6] hover:bg-[#1899d6] hover:border-[#1899d6]' 
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-500'
                    }`}
                  >
                    历年真题概况
                  </button>
                </div>
              </div>
            )}

        {activeTab === 'ai' && (
          <div className="bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-8 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-slate-100 pb-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center border-2 border-indigo-100 shrink-0">
                  <Bot className="w-10 h-10 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-700 mb-2 flex items-center gap-3">
                    AI 班级学情洞察 
                    <span className="text-sm bg-slate-100 text-slate-500 px-3 py-1 rounded-xl">{selectedClass}</span>
                  </h2>
                  <p className="text-slate-500 font-medium">
                    基于大语言模型，深度分析所选班级的听力模考数据、高频错题与学习习惯。<br/>为您提供定制化的班级能力星系图与 OMO 靶向教学干预建议。
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleGenerateAiAnalysis}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-2 border-b-4 border-indigo-700 active:border-b-0 shrink-0"
              >
                <Sparkles className="w-5 h-5" />
                生成分析报告
              </button>
            </div>
            
            {/* 预览数据面板 */}
            <div>
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" /> 当前班级数据摘要（待分析）
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100">
                  <div className="text-slate-400 font-bold text-sm mb-1">覆盖学生人数</div>
                  <div className="text-3xl font-black text-slate-700">{dashboardMetrics.total} <span className="text-base text-slate-400 font-bold">人</span></div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100">
                  <div className="text-slate-400 font-bold text-sm mb-1">累计模考人次</div>
                  <div className="text-3xl font-black text-slate-700">{overviewStats.studentRanking.reduce((sum, s) => sum + s.count, 0)} <span className="text-base text-slate-400 font-bold">次</span></div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100">
                  <div className="text-slate-400 font-bold text-sm mb-1">四级通过率预估</div>
                  <div className="text-3xl font-black text-[#58cc02]">{dashboardMetrics.passRate}<span className="text-base font-bold">%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Top 1 排：核心指标 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 flex flex-col justify-center shadow-sm">
                 <div className="text-slate-400 font-extrabold text-sm mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> 参训总人数</div>
                 <div className="text-4xl font-black text-slate-700">{dashboardMetrics.total} <span className="text-lg text-slate-400">人</span></div>
              </div>
              
              <div className="bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 flex flex-col justify-center shadow-sm">
                 <div className="text-slate-400 font-extrabold text-sm mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> {selectedDate ? '选中日期活跃' : '今日活跃'}</div>
                 <div className="text-4xl font-black text-[#1cb0f6]">{dashboardMetrics.activeCount} <span className="text-lg text-slate-400">人次</span></div>
              </div>
              
              <div className="bg-[#58cc02] border-2 border-[#46a302] border-b-4 rounded-3xl p-6 flex flex-col justify-center text-white relative overflow-hidden shadow-sm">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                 <div className="text-white/90 font-extrabold text-sm mb-2 flex items-center gap-2"><Target className="w-4 h-4"/> 预估四级通过率</div>
                 <div className="text-5xl font-black">{dashboardMetrics.passRate} <span className="text-2xl opacity-80">%</span></div>
              </div>
            </div>

            {/* Top 2 排：图表与干预名单 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 多维语义图谱 */}
              <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 flex flex-col h-full min-h-[480px]">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-lg font-black text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" /> 多维语义图谱
                  </h2>
                  <span className="bg-slate-100 text-slate-500 text-xs font-black px-2 py-1 rounded-lg">班级均值</span>
                </div>
                <div className="text-xs text-slate-400 mb-2 font-bold">不同能力维度间的相互影响关系</div>
                <div className="flex-1 w-full flex items-center justify-center overflow-visible relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <div className="w-full max-w-[450px] aspect-square relative z-10">
                    <EnglishKnowledgeGraph 
                      baseScore={
                        overviewStats.studentRanking.length > 0 
                          ? Math.round(overviewStats.studentRanking.reduce((sum, s) => sum + s.avgScore, 0) / overviewStats.studentRanking.length) 
                          : 65
                      } 
                      vocabScore={85} 
                      centerLabel={selectedClass === '全部' ? '全年级' : selectedClass} 
                    />
                  </div>
                </div>
              </div>

              {/* 预测性干预名单 */}
              <div className="bg-slate-50 border-2 border-slate-200 border-b-4 rounded-2xl flex flex-col h-full min-h-[480px] overflow-hidden">
                <div className="p-4 border-b-2 border-slate-200 flex-none bg-white z-10">
                  <h2 className="text-lg font-black text-slate-700 flex items-center gap-2">
                    <Activity className="text-[#ff4b4b] w-5 h-5" /> 预测性干预名单
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50">
                  <div className="space-y-4">
                    {overviewStats.studentRanking.filter(s => s.avgScore < 80).sort((a,b) => a.avgScore - b.avgScore).slice(0, 5).map((student, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-2xl border-2 border-slate-200 border-b-4 relative hover:bg-slate-50 transition-colors">
                        {student.avgScore < 60 && (
                          <>
                            <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff4b4b] rounded-full m-3 animate-ping"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff4b4b] rounded-full m-3"></div>
                          </>
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center border-b-2 text-lg ${student.avgScore < 60 ? 'bg-[#ff4b4b] border-[#ea2b2b]' : 'bg-[#ffc800] border-[#e5b400]'}`}>
                              {student.name[0]}
                            </div>
                            <div>
                              <div className="font-black text-slate-700">{student.name}</div>
                              <div className={`text-xs font-bold ${student.avgScore < 60 ? 'text-[#ff4b4b]' : 'text-[#e5b400]'}`}>
                                短板: {student.avgScore < 60 ? '连读弱读辨识' : '长难句切分'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-slate-400">{student.avgScore}<span className="text-xs ml-0.5">分</span></div>
                          </div>
                        </div>
                        <button 
                          className={`w-full py-2.5 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 transition-all ${student.avgScore < 60 ? 'bg-[#ff4b4b] hover:bg-[#ea2b2b] text-white border-[#ea2b2b]' : 'bg-white hover:bg-slate-50 text-[#ff4b4b] border-slate-200'}`}
                          onClick={() => alert(`已向 ${student.name} 下发靶向作业！`)}
                        >
                          <Send className="w-4 h-4" /> 一键下发靶向作业
                        </button>
                      </div>
                    ))}
                    {overviewStats.studentRanking.filter(s => s.avgScore < 80).length === 0 && (
                      <div className="text-center text-slate-400 font-bold py-8">
                        当前班级无需要预警干预的学生
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-700 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-500" /> 学生 AI 综合能力档案
              </h2>
              <div className="text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border-2 border-slate-100">
                共找到 {overviewStats.studentRanking.length} 名学生
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 px-4 font-extrabold text-slate-400 w-16 text-center">排名</th>
                  <th className="py-4 px-4 font-extrabold text-slate-400 w-48">学生信息</th>
                  <th className="py-4 px-4 font-extrabold text-slate-400 w-40">学习活跃度</th>
                  <th className="py-4 px-4 font-extrabold text-slate-400 w-64">AI 综合能力画像</th>
                  <th className="py-4 px-4 font-extrabold text-slate-400 w-24 text-center">能力档案</th>
                </tr>
              </thead>
              <tbody>
                {overviewStats.studentRanking.map((student, idx) => {
                  // 获取该生的详细学习数据
                  const studentVolumes = learningVolumeData.find(v => v.name === student.name);
                  const classGroup = studentVolumes?.classGroup || '未知班级';
                  const practiceCount = studentVolumes?.practiceCount || 0;
                  
                  // Score styling logic based on the student's OVERALL AI SCORE
                  const studentAiScore = student.avgScore;
                  let scoreColor = 'text-[#58cc02]';
                  let scoreBg = 'bg-[#eaffd7]';
                  let scoreBar = 'bg-[#58cc02]';
                  let badgeText = '稳步提升';
                  if (studentAiScore < 60) {
                    scoreColor = 'text-[#ff4b4b]';
                    scoreBg = 'bg-[#ffeaeb]';
                    scoreBar = 'bg-[#ff4b4b]';
                    badgeText = '重点关注';
                  } else if (studentAiScore < 80) {
                    scoreColor = 'text-[#ffc800]';
                    scoreBg = 'bg-[#fff5cc]';
                    scoreBar = 'bg-[#ffc800]';
                    badgeText = '潜力选手';
                  }

                  return (
                    <tr key={student.name} className="border-b-2 border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-5 px-4 text-center">
                        <span className={`font-black text-xl ${
                          idx === 0 ? 'text-[#ffc800]' : 
                          idx === 1 ? 'text-slate-400' : 
                          idx === 2 ? 'text-[#cd7f32]' : 
                          'text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                            {student.name[0]}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-700 text-base">{student.name}</div>
                            <div className="text-xs text-slate-400 font-bold mt-0.5">{classGroup}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 font-bold text-sm text-slate-600">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            {studentVolumes?.testCount || 0} 次模考测验
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-400 mt-1">
                            <FileText className="w-3 h-3 text-amber-400" />
                            {studentVolumes?.examCount || 0} 次真题实战
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-400 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {practiceCount} 次碎片练习
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-4">
                          <span className={`font-black text-2xl w-14 ${scoreColor}`}>
                            {studentAiScore}
                          </span>
                          <div className="flex-1 space-y-1">
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden" title="基于该生历史模考计算出的综合能力评分">
                              <div className={`h-full rounded-full ${scoreBar} transition-all duration-1000`} style={{ width: `${Math.max(studentAiScore, 5)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <span>0</span>
                              <span className={scoreColor}>{badgeText}</span>
                              <span>100</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <div className="flex flex-col xl:flex-row items-center justify-center gap-2">
                          <button 
                            className="text-indigo-500 hover:text-white bg-indigo-50 hover:bg-indigo-500 px-3 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors w-full xl:w-auto"
                            title="查看该生历史答题详情"
                            onClick={() => setSelectedStudentProfile({ ...student, studentVolumes })}
                          >
                            <FileText className="w-4 h-4" />
                            档案
                          </button>
                          {studentAiScore < 60 && (
                            <button 
                              className="text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm w-full xl:w-auto animate-pulse hover:animate-none border border-rose-200"
                              title="基于 AI 分析结果，一键下发专属的弱点靶向作业"
                              onClick={() => alert(`已向 ${student.name} 下发基于 ${studentVolumes?.examCount || 0} 次实战错题生成的靶向训练作业！`)}
                            >
                              <Target className="w-4 h-4" />
                              一键靶向干预
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {overviewStats.studentRanking.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Bot className="w-12 h-12 mb-3 text-slate-300" />
                        <span className="font-bold text-lg">当前筛选条件下暂无学生档案</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-extrabold text-slate-700">各题平均正确率 (随机模考)</h2>
              <select
                value={statsDifficultyFilter}
                onChange={(e) => setStatsDifficultyFilter(e.target.value as any)}
                className="bg-white text-slate-600 font-bold px-4 py-2 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#1cb0f6] transition-colors"
              >
                <option value="all">所有难度</option>
                <option value="easy">简单难度</option>
                <option value="medium">中等难度</option>
                <option value="hard">困难难度</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 px-4 w-12 text-center"></th>
                    <th className="py-4 px-4 w-20 text-center">操作</th>
                    <th 
                      className="py-4 px-4 font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                      onClick={() => handleSort('expected')}
                    >
                      <div className="flex items-center gap-2">
                        题目 (Expected)
                        {sortConfig.key === 'expected' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />) : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-4 font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors w-28 text-center"
                      onClick={() => handleSort('difficulty')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        难度
                        {sortConfig.key === 'difficulty' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />) : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-4 font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors w-32 text-center"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        作答人次
                        {sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />) : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-4 font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors w-32 text-center"
                      onClick={() => handleSort('avgScore')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        平均得分
                        {sortConfig.key === 'avgScore' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />) : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQuestionStats.map((stat: any, idx: number) => {
                    const isExpanded = expandedRows.has(stat.expected);
                    return (
                      <React.Fragment key={idx}>
                        <tr 
                          className="border-b-2 border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => toggleRow(stat.expected)}
                        >
                          <td className="py-4 px-4 text-center text-slate-400">
                            {isExpanded ? <ChevronDown className="w-5 h-5 inline-block" /> : <ChevronRight className="w-5 h-5 inline-block" />}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              onClick={(e) => handleJumpToPractice(stat.expected, stat.difficulty, e)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors mx-auto bg-[#eaffd7] text-[#58a700] hover:bg-[#58cc02] hover:text-white"
                              title="跳转到该题练习页面"
                            >
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-700 text-lg">{stat.expected}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-xl font-bold text-sm ${
                              stat.difficulty === 'easy' ? 'bg-[#eaffd7] text-[#58a700]' : 
                              stat.difficulty === 'medium' ? 'bg-[#fff5cc] text-[#e5b400]' : 
                              stat.difficulty === 'hard' ? 'bg-[#ffeaeb] text-[#ff4b4b]' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {stat.difficulty === 'easy' ? '简单' : stat.difficulty === 'medium' ? '中等' : stat.difficulty === 'hard' ? '困难' : '未知'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-bold text-slate-500 text-lg">{stat.total}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`font-extrabold text-lg px-3 py-1 rounded-xl inline-block ${
                              stat.avgScore < 60 ? 'bg-[#ffeaeb] text-[#ff4b4b]' : 
                              stat.avgScore < 80 ? 'bg-[#fff5cc] text-[#e5b400]' : 
                              'bg-[#eaffd7] text-[#58a700]'
                            }`}>
                              {stat.avgScore}分
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50 border-b-2 border-slate-100">
                            <td colSpan={5} className="py-4 px-8">
                              <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b-2 border-slate-100 bg-slate-50">
                                      <th className="py-3 px-4 font-bold text-slate-400 w-32">学生</th>
                                      <th className="py-3 px-4 font-bold text-slate-400">作答内容 (Actual)</th>
                                      <th className="py-3 px-4 font-bold text-slate-400 w-24 text-center">得分</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {stat.studentAnswers.map((ans: any, i: number) => (
                                      <tr key={i} className="border-b-2 border-slate-50 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-600">{ans.name}</td>
                                        <td className="py-3 px-4">
                                          {ans.actual && ans.actual !== '-' ? (
                                            <span className={`font-medium ${ans.score === 100 ? 'text-[#58a700]' : 'text-[#ff4b4b]'}`}>
                                              {ans.actual}
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 italic">未作答</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <span className={`font-bold ${
                                            ans.score === 100 ? 'text-[#58a700]' : 
                                            ans.score >= 60 ? 'text-[#e5b400]' : 
                                            'text-[#ff4b4b]'
                                          }`}>
                                            {ans.score}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {sortedQuestionStats.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                          当前筛选条件下无题目数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {activeTab === 'exam' && (
          <div className="space-y-8">
            {/* 表格1：真题错题统计表 */}
            <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6">
              <h2 className="text-2xl font-extrabold text-slate-700 mb-6">真题错题统计 (按题号)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="py-4 px-4 font-bold text-slate-400">真题类别</th>
                      <th className="py-4 px-4 font-bold text-slate-400">题目</th>
                      <th className="py-4 px-4 font-bold text-slate-400">篇章名称</th>
                      <th className="py-4 px-4 font-bold text-slate-400 text-center">答题人数</th>
                      <th className="py-4 px-4 font-bold text-slate-400 text-center">错误人数</th>
                      <th className="py-4 px-4 font-bold text-slate-400 text-center">正确率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const examScores = filteredScores.filter(s => s.mode === 'exam');
                      const stats: Record<string, { totalAttempts: number, questions: Record<number, { errorCount: number, passage_name: string }> }> = {};
                      
                      examScores.forEach(score => {
                        const examId = score.details?.exam_id || '未知真题';
                        if (!stats[examId]) {
                          stats[examId] = { totalAttempts: 0, questions: {} };
                        }
                        stats[examId].totalAttempts++;
                        
                        const totalQ = score.details?.total_questions || 0;
                        for (let i = 1; i <= totalQ; i++) {
                           if (!stats[examId].questions[i]) {
                               stats[examId].questions[i] = { errorCount: 0, passage_name: '-' };
                           }
                        }
                        
                        const wrongAnswers = score.details?.wrong_answers || [];
                        wrongAnswers.forEach((wa: any) => {
                          if (!stats[examId].questions[wa.question_no]) {
                            stats[examId].questions[wa.question_no] = { errorCount: 0, passage_name: wa.passage_name || '-' };
                          }
                          stats[examId].questions[wa.question_no].errorCount++;
                          stats[examId].questions[wa.question_no].passage_name = wa.passage_name || stats[examId].questions[wa.question_no].passage_name;
                        });
                      });
                      
                      const rows: any[] = [];
                      Object.keys(stats).forEach(examId => {
                        const examStat = stats[examId];
                        Object.keys(examStat.questions).forEach(qNo => {
                          const qStat = examStat.questions[Number(qNo)];
                          const correctCount = examStat.totalAttempts - qStat.errorCount;
                          const accuracy = examStat.totalAttempts > 0 ? Math.round((correctCount / examStat.totalAttempts) * 100) : 0;
                          rows.push({
                            examId,
                            questionNo: Number(qNo),
                            passageName: qStat.passage_name,
                            totalAttempts: examStat.totalAttempts,
                            errorCount: qStat.errorCount,
                            accuracy
                          });
                        });
                      });
                      
                      rows.sort((a, b) => {
                        if (a.examId !== b.examId) return a.examId.localeCompare(b.examId);
                        return a.accuracy - b.accuracy; // 正确率低的排在前面
                      });
                      
                      if (rows.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                              当前班级或日期暂无错题统计数据
                            </td>
                          </tr>
                        );
                      }

                      return rows.map((row, idx) => (
                        <tr key={idx} className="border-b-2 border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-600">{row.examId}</td>
                          <td className="py-4 px-4 font-bold text-slate-700">
                            <button 
                              onClick={() => router.push(`/exam/${row.examId}?from=teacher&q=${row.questionNo}`)}
                              className="text-[#1cb0f6] hover:text-[#1899d6] hover:underline transition-colors"
                            >
                              第 {row.questionNo} 题
                            </button>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">{row.passageName}</td>
                          <td className="py-4 px-4 text-center font-medium text-slate-600">{row.totalAttempts}</td>
                          <td className="py-4 px-4 text-center font-bold text-[#ff4b4b]">{row.errorCount}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`font-bold px-3 py-1 rounded-xl ${
                              row.accuracy >= 80 ? 'bg-[#eaffd7] text-[#58a700]' : 
                              row.accuracy >= 60 ? 'bg-[#fff5cc] text-[#e5b400]' : 
                              'bg-[#ffeaeb] text-[#ff4b4b]'
                            }`}>
                              {row.accuracy}%
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 表格2：学生得分排行表 */}
            <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-extrabold text-slate-700 mb-6">学生得分排行 (真题)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="py-4 px-4 w-16 font-bold text-slate-400 text-center">排名</th>
                      <th className="py-4 px-4 font-bold text-slate-400">姓名</th>
                      <th className="py-4 px-4 font-bold text-slate-400">班级</th>
                      <th className="py-4 px-4 font-bold text-slate-400">真题类别</th>
                      <th className="py-4 px-4 font-bold text-slate-400 text-center">得分</th>
                      <th className="py-4 px-4 font-bold text-slate-400 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const examScores = filteredScores.filter(s => s.mode === 'exam').sort((a, b) => b.score - a.score);
                      
                      if (examScores.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                              当前班级或日期暂无真题答题记录
                            </td>
                          </tr>
                        );
                      }

                      return examScores.map((score: any, idx: number) => (
                        <tr key={score.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-center font-bold">
                            {idx < 3 ? (
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white ${
                                idx === 0 ? 'bg-[#ffc800]' : idx === 1 ? 'bg-[#cecece]' : 'bg-[#cd7f32]'
                              }`}>
                                {idx + 1}
                              </span>
                            ) : (
                              <span className="text-slate-400">{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-700">
                            {score.details?.full_name || '-'}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">
                            {score.details?.class_group || '-'}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">
                            {score.details?.exam_id || '-'}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`font-bold px-3 py-1 rounded-xl ${
                              score.score >= 60 ? 'bg-[#eaffd7] text-[#58a700]' : 'bg-[#ffeaeb] text-[#ff4b4b]'
                            }`}>
                              {score.score}分
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              onClick={() => setSelectedScore(score)}
                              className="text-[#1cb0f6] hover:text-[#1899d6] font-bold underline decoration-2 underline-offset-4"
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </>
        ) : null}
        </main>
      </div>

        {/* 学生档案全屏抽屉/360视图 */}
        {selectedStudentProfile && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="bg-[#f7f9fc] w-full md:w-[95vw] lg:w-[90vw] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="bg-white px-8 py-6 border-b-2 border-slate-200 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <h3 className="text-3xl font-black text-slate-700 flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    {selectedStudentProfile.name[0]}
                  </div>
                  {selectedStudentProfile.name} 的 360° 能力档案
                </h3>
                <button 
                  onClick={() => setSelectedStudentProfile(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-2 transition-colors"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden p-4 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                  
                  {/* 左侧：数据概览与渐进式泛化路径 */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {/* 概览数据 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="text-slate-400 text-sm font-extrabold mb-2 uppercase tracking-wider">班级</div>
                        <div className="text-xl font-black text-slate-700">{selectedStudentProfile.studentVolumes?.classGroup || '未知'}</div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="text-slate-400 text-sm font-extrabold mb-2 uppercase tracking-wider">综合AI评分</div>
                        <div className={`text-4xl font-black relative z-10 ${
                          selectedStudentProfile.avgScore >= 80 ? 'text-green-500' : 
                          selectedStudentProfile.avgScore >= 60 ? 'text-amber-500' : 
                          'text-rose-500'
                        }`}>{selectedStudentProfile.avgScore}</div>
                        {selectedStudentProfile.avgScore < 60 && <div className="absolute inset-0 bg-rose-50 opacity-50 z-0"></div>}
                      </div>
                      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="text-slate-400 text-sm font-extrabold mb-2 uppercase tracking-wider">测验次数</div>
                        <div className="text-3xl font-black text-indigo-500">{selectedStudentProfile.count}</div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="text-slate-400 text-sm font-extrabold mb-2 uppercase tracking-wider">练习总频次</div>
                        <div className="text-3xl font-black text-blue-500">{selectedStudentProfile.studentVolumes?.practiceCount || 0}</div>
                      </div>
                    </div>

                    {/* 渐进式泛化路线图 */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm mt-2">
                      <h4 className="text-2xl font-black text-slate-700 mb-8 flex items-center gap-2">
                        <ArrowUp className="w-6 h-6 text-emerald-500 rotate-45" /> 语料渐进泛化路径
                      </h4>
                      <div className="relative pt-4 pb-8">
                        {/* 进度连线 */}
                        <div className="absolute top-1/2 left-[10%] right-[10%] h-3 bg-slate-100 rounded-full -translate-y-1/2 z-0"></div>
                        <div 
                          className="absolute top-1/2 left-[10%] h-3 bg-emerald-400 rounded-full -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                          style={{ width: `${selectedStudentProfile.avgScore >= 85 ? 80 : selectedStudentProfile.avgScore >= 60 ? 50 : 20}%` }}
                        ></div>
                        
                        <div className="flex justify-between relative z-10">
                          {/* Node 1 */}
                          <div className="flex flex-col items-center gap-4 w-1/4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 transition-transform hover:scale-110 ${
                              true ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 'bg-white border-slate-200 text-slate-300'
                            }`}>
                              ⚓️
                            </div>
                            <div className="text-center">
                              <div className="font-black text-slate-700 text-base">专业场景听写</div>
                              <div className="text-sm text-emerald-500 font-extrabold mt-1">已掌握</div>
                            </div>
                          </div>
                          
                          {/* Node 2 */}
                          <div className="flex flex-col items-center gap-4 w-1/4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 transition-transform hover:scale-110 ${
                              selectedStudentProfile.avgScore >= 60 ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 'bg-rose-50 border-rose-400 text-rose-500 animate-pulse ring-4 ring-rose-100 ring-offset-2'
                            }`}>
                              🏢
                            </div>
                            <div className="text-center">
                              <div className="font-black text-slate-700 text-base">职场交际语境</div>
                              <div className={`text-sm font-extrabold mt-1 ${selectedStudentProfile.avgScore >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {selectedStudentProfile.avgScore >= 60 ? '已掌握' : '当前受阻节点'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Node 3 */}
                          <div className="flex flex-col items-center gap-4 w-1/4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 transition-transform hover:scale-110 ${
                              selectedStudentProfile.avgScore >= 85 ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 
                              selectedStudentProfile.avgScore >= 60 ? 'bg-amber-50 border-amber-400 text-amber-500 animate-pulse ring-4 ring-amber-100 ring-offset-2' : 
                              'bg-white border-slate-200 text-slate-300 opacity-50'
                            }`}>
                              🌍
                            </div>
                            <div className="text-center">
                              <div className="font-black text-slate-700 text-base">四级通用话题</div>
                              <div className={`text-sm font-extrabold mt-1 ${
                                selectedStudentProfile.avgScore >= 85 ? 'text-emerald-500' : 
                                selectedStudentProfile.avgScore >= 60 ? 'text-amber-500' : 
                                'text-slate-400'
                              }`}>
                                {selectedStudentProfile.avgScore >= 85 ? '已掌握' : selectedStudentProfile.avgScore >= 60 ? '当前受阻节点' : '未解锁'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Node 4 */}
                          <div className="flex flex-col items-center gap-4 w-1/4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 transition-transform hover:scale-110 ${
                              selectedStudentProfile.avgScore >= 95 ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 'bg-white border-slate-200 text-slate-300 opacity-50'
                            }`}>
                              🎓
                            </div>
                            <div className="text-center">
                              <div className="font-black text-slate-700 text-base">历年真题实战</div>
                              <div className="text-sm text-slate-400 font-extrabold mt-1">
                                {selectedStudentProfile.avgScore >= 95 ? '已掌握' : '未解锁'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：AI 专属诊断与对话框 */}
                  <div className="w-full lg:w-1/2 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col overflow-hidden relative h-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b-2 border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100">
                        <Bot className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-700">AI 专属诊断与学习干预</h4>
                        <div className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 诊断引擎已连接
                        </div>
                      </div>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-6 custom-scrollbar">
                      {/* Message 1 */}
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-slate-100 shadow-sm max-w-[85%]">
                          <p className="text-slate-700 font-medium leading-relaxed">
                            你好老师，我已完成对 <strong>{selectedStudentProfile.name}</strong> 的学情分析。该生累计进行了 {selectedStudentProfile.count} 次测验，当前综合 AI 评分为 <strong className={selectedStudentProfile.avgScore < 60 ? 'text-rose-500' : 'text-indigo-500'}>{selectedStudentProfile.avgScore}分</strong>。
                          </p>
                        </div>
                      </div>

                      {/* Message 2 */}
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-slate-100 shadow-sm max-w-[85%]">
                          <div className="text-slate-700 font-medium leading-relaxed">
                            <p className="mb-2 font-bold text-slate-800 flex items-center gap-2">
                              <Target className="w-4 h-4 text-rose-500" /> 当前核心诊断：
                            </p>
                            {selectedStudentProfile.avgScore < 60 
                              ? `该生目前处于“职场交际语境”泛化阶段。由于基础薄弱，主要受阻于连读和弱读的听辨，导致场景迁移失败。` 
                              : selectedStudentProfile.avgScore < 85 
                              ? `该生已成功跨越职场语境，正在攻克“四级通用话题”。主要瓶颈在于长难句的切分和语篇逻辑推断。` 
                              : `该生表现优异，已具备直接进行“历年真题实战”的能力，语感保持良好。`}
                          </div>
                        </div>
                      </div>

                      {/* Message 3 (Actionable) */}
                      {selectedStudentProfile.avgScore < 85 && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="bg-white p-5 rounded-2xl rounded-tl-none border-2 border-indigo-100 shadow-md max-w-[85%] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <p className="text-slate-700 font-bold mb-4">
                              基于 POA 产出导向法，我已为其生成了一套专属靶向作业：
                            </p>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                              <div className="text-sm font-bold text-slate-500 mb-1">训练重点：</div>
                              <div className="text-indigo-600 font-black">
                                {selectedStudentProfile.avgScore < 60 ? '连读/弱读专项突破 (15句)' : '长难句意群切分训练 (10句)'}
                              </div>
                            </div>
                            <button 
                              className="w-full py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 transition-all bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-700 shadow-sm"
                              onClick={() => alert(`已成功向 ${selectedStudentProfile.name} 下发 AI 靶向训练作业！`)}
                            >
                              <Send className="w-4 h-4" /> 确认下发靶向作业
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* 详情弹窗 */}
        {selectedScore && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border-b-4 border-slate-200 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-xl">
              <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-extrabold text-slate-700 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#1cb0f6]" />
                  答题详情 ({selectedScore.details?.full_name || '未知姓名'})
                </h3>
                <button 
                  onClick={() => setSelectedScore(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto grow">
                <div className="space-y-6">
                  {selectedScore.mode === 'exam' ? (
                    // 真题模式详情
                    <>
                      <div className="mb-4 bg-slate-50 p-4 rounded-xl border-2 border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-400">总题数</p>
                          <p className="text-xl font-extrabold text-slate-700">{selectedScore.details?.total_questions || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-400">答对</p>
                          <p className="text-xl font-extrabold text-[#58a700]">{selectedScore.details?.correct_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-400">得分</p>
                          <p className="text-xl font-extrabold text-[#1cb0f6]">{selectedScore.score}分</p>
                        </div>
                      </div>

                      {selectedScore.details?.wrong_answers?.map((ans: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border-2 border-slate-100">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <span className="font-bold text-slate-400">第 {ans.question_no} 题 ({ans.passage_name})</span>
                            <span className="font-bold px-3 py-1 rounded-xl text-sm bg-[#ffeaeb] text-[#ff4b4b]">
                              错误
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">正确答案</p>
                              <p className="text-slate-700 font-medium">{ans.expected}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">学生作答</p>
                              <p className="text-[#ff4b4b] font-medium">{ans.actual}</p>
                            </div>
                            {ans.explanation && (
                              <div>
                                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">解析</p>
                                <p className="text-slate-600 text-sm">{ans.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {(!selectedScore.details?.wrong_answers || selectedScore.details.wrong_answers.length === 0) && (
                        <div className="text-center py-8 text-slate-400 font-bold">
                          该生全部答对，无错题记录！
                        </div>
                      )}
                    </>
                  ) : (
                    // 听写模式详情
                    <>
                      {selectedScore.details?.answers?.map((ans: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border-2 border-slate-100">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <span className="font-bold text-slate-400">#{idx + 1}</span>
                            <span className={`font-bold px-3 py-1 rounded-xl text-sm ${
                              ans.score === 100 ? 'bg-[#eaffd7] text-[#58a700]' :
                              ans.score >= 60 ? 'bg-[#fff5cc] text-[#e5b400]' :
                              'bg-[#ffeaeb] text-[#ff4b4b]'
                            }`}>
                              {ans.score}分
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">原文 (Expected)</p>
                              <p className="text-slate-700 font-medium">{ans.expected}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">学生作答 (Actual)</p>
                              {ans.actual && ans.actual !== '-' ? (
                                <p className={`font-medium ${ans.score === 100 ? 'text-[#58a700]' : 'text-[#ff4b4b]'}`}>
                                  {ans.actual}
                                </p>
                              ) : (
                                <p className="text-slate-400 italic">未作答</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!selectedScore.details?.answers || selectedScore.details.answers.length === 0) && (
                        <div className="text-center py-8 text-slate-400 font-bold">
                          无详细答题记录
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
