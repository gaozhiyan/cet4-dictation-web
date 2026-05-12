"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ChevronRight, X, Award, CheckCircle2, Play, Clock, Flame, Users, Filter, ArrowDownUp } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ExamList() {
  const router = useRouter()
  const supabase = createClient()
  
  const [examScores, setExamScores] = useState<Record<string, any>>({})
  const [globalStats, setGlobalStats] = useState<Record<string, { avg: number, count: number }>>({})
  const [resumeData, setResumeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const exams = [
    {
      id: '202512set1',
      title: '2025年12月第一套听力',
      description: '包含完整新闻报道、长对话和短文听力（共25题）',
      estimatedTime: 35,
      isNew: true
    },
    {
      id: '202406set2',
      title: '2024年6月第二套听力',
      description: '包含完整新闻报道、长对话和短文听力（共25题）',
      estimatedTime: 35,
      isNew: false
    },
    {
      id: '202406set1',
      title: '2024年6月第一套听力',
      description: '包含完整新闻报道、长对话和短文听力（共25题）',
      estimatedTime: 35,
      isNew: false
    },
    {
      id: '202506set2',
      title: '2025年6月第二套听力',
      description: '包含完整新闻报道、长对话和短文听力（共25题）',
      estimatedTime: 35,
      isNew: false
    }
  ]

  useEffect(() => {
    const fetchScores = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const guestSaved = localStorage.getItem('cet4_exam_resume_guest')
        if (guestSaved) {
          try { setResumeData(JSON.parse(guestSaved)) } catch(e) {}
        }
        setLoading(false)
        return
      }

      const saved = localStorage.getItem(`cet4_exam_resume_${user.id}`)
      if (saved) {
        try { setResumeData(JSON.parse(saved)) } catch(e) {}
      }

      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('mode', 'exam')

      if (error) {
        console.error('Failed to fetch scores:', error)
        setLoading(false)
        return
      }

      const scoresMap: Record<string, any> = {}
      if (data) {
        data.forEach(record => {
          let details = record.details
          if (typeof details === 'string') {
            try {
              details = JSON.parse(details)
            } catch(e) {}
          }
          if (!details || !details.exam_id) return
          
          const score = record.score || 0
          const correct = details.correct_count || 0
          const total = details.total_questions || 25
          
          if (!scoresMap[details.exam_id] || score > scoresMap[details.exam_id].score) {
            scoresMap[details.exam_id] = {
              score,
              correct,
              total
            }
          }
        })
      }
      
      setExamScores(scoresMap)
      setLoading(false)
    }

    const fetchGlobalStats = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('score, details')
        .eq('mode', 'exam')

      if (!error && data) {
        const statsMap: Record<string, { totalScore: number, count: number }> = {}
        data.forEach(record => {
          let details = record.details
          if (typeof details === 'string') {
            try { details = JSON.parse(details) } catch(e) {}
          }
          if (!details || !details.exam_id) return
          const examId = details.exam_id
          if (!statsMap[examId]) statsMap[examId] = { totalScore: 0, count: 0 }
          statsMap[examId].totalScore += (record.score || 0)
          statsMap[examId].count += 1
        })
        
        const finalStats: Record<string, { avg: number, count: number }> = {}
        for (const [examId, stats] of Object.entries(statsMap)) {
          finalStats[examId] = {
            avg: Math.round(stats.totalScore / stats.count),
            count: stats.count
          }
        }
        setGlobalStats(finalStats)
      }
    }

    fetchScores()
    fetchGlobalStats()
  }, [supabase])

  const DuoCard = ({ children, className = '', ...props }: any) => (
    <div className={`bg-white border-2 border-b-4 rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </div>
  )

  const availableYears = Array.from(new Set(exams.map(e => e.id.substring(0, 4)))).sort((a, b) => b.localeCompare(a))
  
  let filteredExams = exams.filter(e => selectedYear === 'all' || e.id.substring(0, 4) === selectedYear)
  
  if (sortBy === 'newest') {
    filteredExams.sort((a, b) => b.id.localeCompare(a.id))
  } else if (sortBy === 'accuracy_asc') {
    filteredExams.sort((a, b) => {
      const scoreA = examScores[a.id]?.score ?? 999
      const scoreB = examScores[b.id]?.score ?? 999
      return scoreA - scoreB
    })
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-slate-100">
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-8 h-8 stroke-[3]" />
          </button>
          <h1 className="text-3xl font-extrabold text-[#ff4b4b] flex items-center gap-2">
            真题演练
          </h1>
        </header>

        {resumeData && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
              继续学习
            </h2>
            <DuoCard 
              className="flex flex-row items-center justify-between cursor-pointer transition-all border-[#58cc02] bg-[#f0f9eb]/30 hover:bg-[#f0f9eb]"
              onClick={() => router.push(`/exam/${resumeData.examId}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#58cc02] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302]">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-700">
                    {exams.find(e => e.id === resumeData.examId)?.title || '上次未完成的真题'}
                  </h2>
                  <p className="text-slate-500 font-bold mt-1 text-sm">
                    已答 {Object.keys(resumeData.answers || {}).length} 题 • 第 {(resumeData.currentPassageIdx || 0) + 1} 篇
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#58cc02] font-bold">
                继续
                <ChevronRight className="w-6 h-6" />
              </div>
            </DuoCard>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            <button 
              onClick={() => setSelectedYear('all')} 
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${selectedYear === 'all' ? 'bg-[#ff4b4b] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              全部
            </button>
            {availableYears.map(year => (
              <button 
                key={year} 
                onClick={() => setSelectedYear(year)} 
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${selectedYear === year ? 'bg-[#ff4b4b] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {year}年
              </button>
            ))}
          </div>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-100 text-slate-600 font-bold text-sm pl-10 pr-8 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#ff4b4b] transition-all cursor-pointer w-full sm:w-auto"
            >
              <option value="newest">最新发布</option>
              <option value="accuracy_asc">按正确率由低到高</option>
            </select>
            <ArrowDownUp className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const scoreData = examScores[exam.id]
            const isCompleted = !!scoreData
            const isHighScorer = isCompleted && scoreData.score >= 80

            const gStats = globalStats[exam.id]
            const avgScore = gStats?.avg || '-'
            
            let difficulty = '中等'
            let diffColor = 'text-orange-500'
            let diffBg = 'bg-orange-50'
            if (gStats) {
              if (gStats.avg >= 75) { difficulty = '简单'; diffColor = 'text-[#58cc02]'; diffBg = 'bg-[#f0f9eb]' }
              else if (gStats.avg < 60) { difficulty = '困难'; diffColor = 'text-[#ff4b4b]'; diffBg = 'bg-[#ffe5e5]' }
            }

            let cardStyle = "border-slate-200 hover:bg-slate-50 bg-white"
            let iconBg = "bg-[#ff4b4b] border-[#ea2b2b]"
            let statusText = null

            if (isHighScorer) {
              cardStyle = "border-[#58cc02] bg-[#f0f9eb]/30 hover:bg-[#f0f9eb]"
              iconBg = "bg-[#58cc02] border-[#46a302]"
              statusText = (
                <div className="flex items-center gap-1 text-[#58cc02] bg-[#d7ffb8] px-2 py-0.5 rounded-full text-xs font-bold mt-2 w-fit">
                  <Award className="w-3 h-3" />
                  历史最高得分: {scoreData.score} ({scoreData.correct}/{scoreData.total})
                </div>
              )
            } else if (isCompleted) {
              cardStyle = "border-slate-300 bg-slate-50 hover:bg-slate-100"
              iconBg = "bg-[#1cb0f6] border-[#1899d6]"
              statusText = (
                <div className="flex items-center gap-1 text-[#1cb0f6] bg-[#e5f6ff] px-2 py-0.5 rounded-full text-xs font-bold mt-2 w-fit">
                  <CheckCircle2 className="w-3 h-3" />
                  历史最高得分: {scoreData.score} ({scoreData.correct}/{scoreData.total})
                </div>
              )
            }

            return (
              <DuoCard 
                key={exam.id}
                className={`flex flex-row items-center justify-between cursor-pointer transition-all relative overflow-hidden ${cardStyle}`} 
                onClick={() => router.push(`/exam/${exam.id}`)}
              >
                {exam.isNew && (
                  <div className="absolute top-4 right-16 bg-[#ff4b4b] text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                    NEW
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-b-4 ${iconBg}`}>
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-700 flex items-center gap-2">
                      {exam.title}
                    </h2>
                    <p className="text-slate-400 font-bold mt-1 text-sm">{exam.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        预计 {exam.estimatedTime} 分钟
                      </span>
                      {gStats && (
                        <>
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${diffColor} ${diffBg}`}>
                            <Flame className="w-3.5 h-3.5" />
                            难度：{difficulty}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            <Users className="w-3.5 h-3.5" />
                            全网平均：{avgScore}分
                          </span>
                        </>
                      )}
                    </div>

                    {statusText}
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
