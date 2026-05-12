"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BrainCircuit, CheckCircle, RefreshCcw } from 'lucide-react'

type VocabQuestion = {
  word: string
  correct: string
  distractors: string[]
  level: number
  options?: string[]
}

// Helper to get 3 random distractors from the specific level's pool
function getRandomDistractors(correctMeaning: string, levelMeanings: string[], count = 3) {
  const distractors: string[] = [];
  let attempts = 0;
  while (distractors.length < count && attempts < 100) {
    attempts++;
    const randomMeaning = levelMeanings[Math.floor(Math.random() * levelMeanings.length)];
    if (randomMeaning !== correctMeaning && !distractors.includes(randomMeaning)) {
      distractors.push(randomMeaning);
    }
  }
  return distractors;
}

export default function VocabTestPage() {
  const [fullDatabase, setFullDatabase] = useState<any>(null)
  
  const [questions, setQuestions] = useState<VocabQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // Tracking right/wrong/skip per level for scientific prediction
  const [scoreData, setScoreData] = useState<Record<number, { correct: number, wrong: number }>>({
    1: { correct: 0, wrong: 0 },
    2: { correct: 0, wrong: 0 },
    3: { correct: 0, wrong: 0 },
    4: { correct: 0, wrong: 0 },
    5: { correct: 0, wrong: 0 }
  })
  
  const [testState, setTestState] = useState<'intro' | 'testing' | 'result'>('intro')
  const [finalVocab, setFinalVocab] = useState(0)
  const [reliabilityWarning, setReliabilityWarning] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [loadingDb, setLoadingDb] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      try {
        setLoadingDb(true)
        const res = await fetch('/data/vocab-database.json')
        if (!res.ok) throw new Error('Failed to fetch vocab db')
        const data = await res.json()
        setFullDatabase(data)
      } catch (err) {
        console.error("加载词汇库失败", err)
      } finally {
        setLoadingDb(false)
      }
    }
    init()
  }, [router, supabase])

  const generateNewTest = () => {
    if (!fullDatabase) return

    const newQuestions: VocabQuestion[] = []
    
    for (let level = 1; level <= 5; level++) {
      const levelData = fullDatabase[level]
      if (!levelData || !levelData.words) continue
      
      const wordsPool = levelData.words
      // Extract all meanings just from THIS level for distractors
      const levelMeanings = wordsPool.map((w: any) => w.correct)

      // Shuffle and pick 10 words
      const shuffledPool = [...wordsPool].sort(() => 0.5 - Math.random())
      const selectedWords = shuffledPool.slice(0, 10)
      
      for (const w of selectedWords) {
        const distractors = getRandomDistractors(w.correct, levelMeanings, 3)
        const options = [w.correct, ...distractors].sort(() => 0.5 - Math.random())
        
        newQuestions.push({
          word: w.word,
          correct: w.correct,
          distractors,
          level,
          options
        })
      }
    }

    setQuestions(newQuestions)
  }

  const handleStart = () => {
    generateNewTest()
    setTestState('testing')
    setCurrentIndex(0)
    setScoreData({
      1: { correct: 0, wrong: 0 },
      2: { correct: 0, wrong: 0 },
      3: { correct: 0, wrong: 0 },
      4: { correct: 0, wrong: 0 },
      5: { correct: 0, wrong: 0 }
    })
    setReliabilityWarning(false)
  }

  const handleAnswer = (selectedOpt: string | null) => {
    const currentQ = questions[currentIndex]
    
    setScoreData(prev => {
      const levelData = { ...prev[currentQ.level] }
      if (selectedOpt === currentQ.correct) {
        levelData.correct += 1
      } else if (selectedOpt !== null) {
        // Only count as wrong if they guessed (selectedOpt is not null)
        levelData.wrong += 1
      }
      return { ...prev, [currentQ.level]: levelData }
    })

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1)
    } else {
      // Need a slight delay or use state effect, but we can compute directly
      // since setScoreData is async, we use a timeout or pass the current value
      setTimeout(() => finishTest(), 0)
    }
  }

  const finishTest = async () => {
    setScoreData(currentScores => {
      let totalVocab = 0
      
      // Reliability check: if L1 & L2 are very bad, but L4 or L5 are suspiciously good
      const l1_2_accuracy = (currentScores[1].correct + currentScores[2].correct) / 20
      const l4_5_accuracy = (currentScores[4].correct + currentScores[5].correct) / 20
      
      if (l1_2_accuracy < 0.4 && l4_5_accuracy > 0.6) {
        setReliabilityWarning(true)
      }

      for (let level = 1; level <= 5; level++) {
        const stats = currentScores[level]
        const baseVolume = fullDatabase[level].baseVolume || 0
        
        // Correction for Guessing formula: (Correct - Wrong / 3) / Total
        // 降低盲猜带来的虚高词汇量，采用更严厉的惩罚机制，并将答对的基础比重下调
        let accuracy = (stats.correct - (stats.wrong / 1.5)) / 10
        if (accuracy < 0) accuracy = 0 // Floor at 0
        
        // 加入基础折扣，避免只要答对几道题就获得该级别全额词汇量
        const levelDiscount = 0.6 + (accuracy * 0.4) // 答全对才能拿到 100%，答对一半只能拿到 80% 的 baseVolume 比例
        totalVocab += Math.round(accuracy * baseVolume * levelDiscount)
      }
      
      // 整体二次下调，匹配真实学生的四级体感词汇量
      totalVocab = Math.round(totalVocab * 0.75)
      
      setFinalVocab(totalVocab)
      saveResult(totalVocab, currentScores)
      return currentScores
    })
    
    setTestState('result')
  }

  const saveResult = async (vocabSize: number, scoreDetails: any) => {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('scores').insert([{
        user_id: user.id,
        score: vocabSize,
        mode: 'vocab',
        details: {
          class_group: user?.user_metadata?.class_group || '未知班级',
          full_name: user?.user_metadata?.full_name || '未知姓名',
          student_id: user?.user_metadata?.student_id || '未知学号',
          score_details: scoreDetails,
          total_questions: 50
        }
      }])
    } catch (err) {
      console.error("保存成绩失败", err)
    } finally {
      setSaving(false)
    }
  }

  const getAdvice = (vocab: number) => {
    if (vocab < 2000) return "基础较薄弱，建议从高频核心词汇开始背诵，结合真题听写强化语感。"
    if (vocab < 3500) return "接近四级门槛，核心词汇还需巩固，建议每天保持一定的阅读和听力输入。"
    if (vocab < 4500) return "词汇量达标！你已经具备通过四级的基础，建议开始猛攻历年真题演练。"
    if (vocab < 6000) return "词汇量优秀，不仅能轻松应对四级，六级也有一定基础，继续保持！"
    return "词汇量惊人！你的词汇储备已经达到考研/托福水平，阅读和听力对你来说应该是小菜一碟。"
  }

  // --- UI Components ---
  const DuoBtn = ({ children, variant = 'primary', className = '', ...props }: any) => {
    const variants: any = {
      primary: 'bg-[#58cc02] hover:bg-[#46a302] text-white border-[#58a700]',
      ghost: 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300',
      outline: 'bg-white hover:bg-slate-50 text-[#1cb0f6] border-slate-200 hover:border-slate-300',
    }
    return (
      <button className={`font-extrabold text-lg tracking-wider rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all px-4 py-4 flex items-center justify-center ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    )
  }

  if (loadingDb) {
    return <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#ff9600] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold">正在处理数万量级词库，请稍候...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-slate-100">
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-8 h-8 stroke-[3]" />
          </button>
          <h1 className="text-3xl font-extrabold text-[#ff9600] flex items-center gap-2">
            词汇测试
          </h1>
        </header>

        {testState === 'intro' && (
          <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-8 text-center mt-20">
            <div className="w-24 h-24 bg-[#ff9600] rounded-full flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-4">科学测算你的真实词汇量</h2>
            <p className="text-slate-500 font-bold mb-8 text-lg">
              共 50 题，耗时约 4 分钟。<br/>
              系统将从近 1.3 万个词库中<span className="text-[#1cb0f6]">为你实时抽取全新考题</span>。<br/>
              <span className="text-[#ff4b4b] mt-2 block bg-red-50 p-3 rounded-xl border border-red-100">
                ⚠️ 注意：本测试包含防猜惩罚机制。答错会倒扣分，<br/>如果不认识请直接选“不认识”，切勿瞎猜！
              </span>
            </p>
            <DuoBtn className="w-full max-w-sm mx-auto" onClick={handleStart}>
              开始测试
            </DuoBtn>
          </div>
        )}

        {testState === 'testing' && questions.length > 0 && (
          <div className="flex flex-col pt-4">
            <div className="w-full bg-slate-200 rounded-full h-4 mb-12 overflow-hidden flex">
              {/* Show progress segmented by levels 1 to 5 conceptually */}
              <div 
                className="bg-[#58cc02] h-4 rounded-full transition-all duration-300"
                style={{ width: `${(currentIndex / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-slate-800 tracking-wider mb-2">
                {questions[currentIndex].word}
              </h2>
              {/* Optional: Show current difficulty level subtly */}
              <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">
                Level {questions[currentIndex].level} / 5
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {questions[currentIndex].options?.map((opt, i) => (
                <DuoBtn key={i} variant="outline" onClick={() => handleAnswer(opt)} className="justify-start text-left px-6">
                  {opt}
                </DuoBtn>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-slate-100">
              <DuoBtn variant="ghost" onClick={() => handleAnswer(null)} className="w-full text-slate-400">
                🤷 真的不认识 (跳过)
              </DuoBtn>
            </div>
          </div>
        )}

        {testState === 'result' && (
          <div className="bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-8 text-center mt-10">
            <div className="w-24 h-24 bg-[#58cc02] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-500 mb-2">你的估算词汇量约为</h2>
            <div className="text-6xl font-black text-[#ff9600] mb-6">
              {finalVocab} <span className="text-2xl text-slate-400">词</span>
            </div>

            {reliabilityWarning && (
              <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl border border-red-200 mb-6 text-sm">
                ⚠️ 检测到您的答题随机性过高（基础词汇错误率高但高级词汇正确率高），触发了防作弊机制，本次测算结果仅供参考。
              </div>
            )}
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border-2 border-slate-100">
              <h3 className="font-extrabold text-slate-700 mb-2">💡 备考建议</h3>
              <p className="text-slate-600 font-bold leading-relaxed">
                {getAdvice(finalVocab)}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <DuoBtn onClick={() => router.push('/')} className="flex-1">
                返回首页
              </DuoBtn>
              <DuoBtn variant="outline" onClick={handleStart} className="flex-1">
                <RefreshCcw className="w-5 h-5 mr-2" />
                重新测试
              </DuoBtn>
            </div>
            {saving && <p className="text-slate-400 mt-4 font-bold text-sm">正在保存成绩...</p>}
          </div>
        )}
      </div>
    </div>
  )
}