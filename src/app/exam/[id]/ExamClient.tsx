"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Play, Pause, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

import { use } from 'react'

function ExamContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromSource = searchParams.get('from')
  const targetQ = searchParams.get('q')
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [userLoaded, setUserLoaded] = useState(false)
  const [hasRestored, setHasRestored] = useState(false)
  const [examData, setExamData] = useState<any>(null)
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [audioCompleted, setAudioCompleted] = useState<Record<number, boolean>>({})
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({})
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Add audio time update tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      // Allow answering after 60 seconds or if the audio has ended
      if (audio.currentTime >= 60 && !audioCompleted[currentPassageIdx]) {
        setAudioCompleted(prev => ({...prev, [currentPassageIdx]: true}));
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentPassageIdx, audioCompleted]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setUserLoaded(true)
    }
    getUser()

    // Support 202406set1, 202406set2, 202506set2, 202512set1 etc.
    if (/^\d{6}set\d$/.test(resolvedParams.id)) {
      // Create the correct json filename mapping, e.g. 202406set1 -> 202406-set1.json
      const jsonFileName = resolvedParams.id.replace(/(\d{6})(set\d)/, '$1-$2');
      fetch(`/data/exam-${jsonFileName}.json?t=${Date.now()}`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json()
        })
        .then(data => {
          setExamData(data)
          // 如果有指定的题目参数，跳转到对应篇章
          if (targetQ) {
            const qNo = Number(targetQ)
            const passageIdx = data.passages.findIndex((p: any) => 
              p.questions.some((q: any) => q.question_no === qNo)
            )
            if (passageIdx !== -1) {
              setCurrentPassageIdx(passageIdx)
            }
          }
        })
        .catch(err => console.error("Failed to load exam data", err))
    }
  }, [resolvedParams.id, targetQ])

  // 恢复之前的做题进度
  useEffect(() => {
    if (examData && userLoaded && !hasRestored) {
      const storageKey = user ? `cet4_exam_resume_${user.id}` : 'cet4_exam_resume_guest';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // 仅当缓存的试卷是当前试卷，并且未完成时恢复
          if (parsed.examId === resolvedParams.id) {
            if (parsed.answers) setAnswers(parsed.answers);
            if (parsed.currentPassageIdx !== undefined && !targetQ) {
              setCurrentPassageIdx(parsed.currentPassageIdx);
            }
            if (parsed.audioCompleted) setAudioCompleted(parsed.audioCompleted);
          }
        } catch(e) {}
      }
      setHasRestored(true);
    }
  }, [examData, userLoaded, hasRestored, resolvedParams.id, targetQ, user]);

  // 保存做题进度到 localStorage
  useEffect(() => {
    if (!examData || !userLoaded || !hasRestored || showResult) return;
    
    // 如果没有任何作答且在第一题，可以正常存入，这样横幅卡片能准确显示已答题数
    const storageKey = user ? `cet4_exam_resume_${user.id}` : 'cet4_exam_resume_guest';
    const stateToSave = {
      examId: resolvedParams.id,
      currentPassageIdx,
      answers,
      audioCompleted,
      updatedAt: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [examData, userLoaded, hasRestored, showResult, currentPassageIdx, answers, audioCompleted, resolvedParams.id, user]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch(err => {
              console.error('Audio play failed:', err)
              setIsPlaying(false)
              alert('音频播放失败，请检查网络连接或音频文件链接。')
            })
        }
      }
    }
  }

  const handleSelectOption = (qNo: number, optionLetter: string) => {
    if (showResult || answers[qNo] || !audioCompleted[currentPassageIdx]) return // 提交考卷后或已作答后或音频未播放完锁定答案
    setAnswers(prev => ({
      ...prev,
      [qNo]: optionLetter
    }))
  }

  const handleNext = async () => {
    if (currentPassageIdx < (examData?.passages?.length || 1) - 1) {
      setCurrentPassageIdx((prev: number) => prev + 1)
      setIsPlaying(false)
    } else {
      // 提交考卷逻辑
      let score = 0
      const wrongAnswers: any[] = []
      examData?.questions?.forEach((q: any) => {
        if (answers[q.question_no] === q.answer) {
          score++
        } else {
          wrongAnswers.push({
            question_no: q.question_no,
            passage_name: q.passage_name,
            expected: q.answer,
            actual: answers[q.question_no] || '未作答',
            explanation: q.explanation
          })
        }
      })
      const totalQuestions = examData?.questions?.length || 0
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

      if (user) {
        try {
          const { error } = await supabase
            .from('scores')
            .insert([
              {
                user_id: user.id,
                score: percentage,
                mode: 'exam',
                details: {
                  class_group: user?.user_metadata?.class_group || '未知班级',
                  full_name: user?.user_metadata?.full_name || '未知姓名',
                  student_id: user?.user_metadata?.student_id || '未知学号',
                  exam_id: resolvedParams.id,
                  total_questions: totalQuestions,
                  correct_count: score,
                  wrong_answers: wrongAnswers
                }
              }
            ])
          if (error) console.error("成绩保存失败:", error)
        } catch (err) {
          console.error("记录成绩时发生异常:", err)
        }
      }
      
      const storageKey = user ? `cet4_exam_resume_${user.id}` : 'cet4_exam_resume_guest';
      localStorage.removeItem(storageKey);
      
      setShowResult(true)
    }
  }

  const handlePrev = () => {
    if (currentPassageIdx > 0) {
      setCurrentPassageIdx((prev: number) => prev - 1)
      setIsPlaying(false)
    }
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#ff4b4b] rounded-full animate-spin"></div>
      </div>
    )
  }

  const currentPassage = examData?.passages?.[currentPassageIdx]
  const progress = examData?.passages?.length 
    ? ((currentPassageIdx + (showResult ? 1 : 0)) / examData.passages.length) * 100 
    : 0

  // --- Components ---
  const DuoBtn = ({ children, variant = 'primary', className = '', disabled, ...props }: any) => {
    const variants: any = {
      primary: 'bg-[#58cc02] hover:bg-[#46a302] text-white border-[#58a700]',
      secondary: 'bg-[#1cb0f6] hover:bg-[#1899d6] text-white border-[#1899d6]',
      danger: 'bg-[#ff4b4b] hover:bg-[#ea2b2b] text-white border-[#ea2b2b]',
      ghost: 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300',
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

  if (showResult) {
    let score = 0
    examData?.questions?.forEach((q: any) => {
      if (answers[q.question_no] === q.answer) score++
    })
    const totalQuestions = examData?.questions?.length || 0
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

    return (
      <div className="min-h-screen bg-white text-slate-700 font-sans p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <header className="flex items-center justify-between mb-10 pb-4 border-b-2 border-slate-100">
            <h1 className="text-3xl font-extrabold text-[#ffc800]">考试结果</h1>
            <button 
              onClick={() => {
                if (fromSource === 'teacher') router.push('/teacher')
                else router.push('/exam')
              }} 
              className="text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold"
            >
              {fromSource === 'teacher' ? (
                <>返回看板 <ArrowLeft className="w-6 h-6 stroke-[3]" /></>
              ) : (
                <X className="w-8 h-8 stroke-[3]" />
              )}
            </button>
          </header>

          <div className="text-center mb-12">
            <div className="inline-block bg-[#ffc800] rounded-3xl p-8 border-b-8 border-[#e5b400]">
              <div className="text-6xl font-black text-white">{percentage}%</div>
              <div className="text-[#a58200] font-extrabold uppercase mt-2">准确率 ({score}/{totalQuestions})</div>
            </div>
          </div>

        {/* Result Breakdown */}
        <div className="space-y-12 pb-20">
          {examData?.passages?.map((passage: any) => (
            <div key={passage.id} className="bg-slate-50 p-6 md:p-8 rounded-3xl border-2 border-slate-200">
              <h2 className="text-2xl font-extrabold text-slate-700 mb-8 capitalize border-b-2 border-slate-200 pb-4">
                {passage.name}
              </h2>
              
              <div className="space-y-12">
                {passage?.questions?.map((qRef: any) => {
                  const q = examData.questions.find((item: any) => item.question_no === qRef.question_no) || qRef;
                  const isCorrect = answers[q.question_no] === q.answer
                  const userAns = answers[q.question_no] || '未作答'
                  
                  return (
                    <div key={q.question_no} className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-2 h-full ${isCorrect ? 'bg-[#58cc02]' : 'bg-[#ff4b4b]'}`} />
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ 
                          isCorrect ? 'bg-[#58cc02] text-white' : 'bg-[#ff4b4b] text-white'
                        }`}>
                          {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">Question {q.question_no}</h3>
                      </div>
                      
                      {/* Options */}
                      <div className="grid gap-3 mb-8">
                        {q.options?.length > 0 ? q.options.map((opt: string) => {
                          const optionLetter = opt.charAt(0)
                          const isUserAns = userAns === optionLetter
                          const isRightAns = q.answer === optionLetter
                          
                          let bgClass = "bg-white border-slate-200 text-slate-600"
                          if (isRightAns) {
                            bgClass = "bg-[#d7ffb8] border-[#58cc02] text-[#58cc02] font-bold"
                          } else if (isUserAns && !isCorrect) {
                            bgClass = "bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b] font-bold"
                          }
                          
                          return (
                            <div key={opt} className={`p-4 rounded-xl border-2 transition-all ${bgClass}`}>
                              {opt}
                            </div>
                          )
                        }) : <div className="text-slate-400 p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">暂无选项数据</div>}
                      </div>
                      
                      {/* Explanation Block */}
                      <div className="bg-slate-100 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold">
                          <AlertCircle className="w-5 h-5" />
                          解析
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="font-bold text-slate-700">关键句：</span>
                            <span className="text-slate-600 bg-yellow-100 px-1 rounded">{q.key_sentence}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {q.explanation?.replace(/\[cite:\s*\d+\]/g, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 flex flex-col">
      {/* Top Bar */}
      <div className="px-4 md:px-8 py-6 flex items-center gap-4 max-w-4xl mx-auto w-full">
        <button 
          onClick={() => {
            if (fromSource === 'teacher') router.push('/teacher')
            else router.push('/exam')
          }} 
          className="text-slate-300 hover:text-slate-400 transition-colors"
          title={fromSource === 'teacher' ? "返回教师看板" : "返回模考主页"}
        >
          {fromSource === 'teacher' ? (
            <ArrowLeft className="w-8 h-8 stroke-[3]" />
          ) : (
            <X className="w-8 h-8 stroke-[3]" />
          )}
        </button>
        <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ff4b4b] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-10 h-10 flex items-center justify-center font-bold text-slate-400">
          {showResult ? examData?.passages?.length || 0 : currentPassageIdx + 1}/{examData?.passages?.length || 0}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col pt-4 md:pt-10 pb-40">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold text-slate-700 capitalize">
            {currentPassage?.name || 'Loading...'}
          </h1>
        </div>
        
        {/* Category and Subcategory Tags */}
        <div className="flex items-center gap-2 mb-8">
          {currentPassage?.questions?.[0] && examData?.questions?.find((item: any) => item.question_no === currentPassage.questions[0].question_no)?.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
              {examData.questions.find((item: any) => item.question_no === currentPassage.questions[0].question_no).category}
            </span>
          )}
          {currentPassage?.questions?.[0] && examData?.questions?.find((item: any) => item.question_no === currentPassage.questions[0].question_no)?.subcategory && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
              {examData.questions.find((item: any) => item.question_no === currentPassage.questions[0].question_no).subcategory}
            </span>
          )}
        </div>

        {/* Audio Player */}
        <div className="flex justify-center mb-10">
          <audio 
            key={currentPassage?.audio_file}
            ref={audioRef} 
            src={currentPassage?.audio_file} 
            onEnded={() => {
              setIsPlaying(false)
              setAudioCompleted(prev => ({...prev, [currentPassageIdx]: true}))
            }}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="hidden"
          />
          <button 
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-[#1899d6] translate-y-[6px]' 
                : 'bg-[#1cb0f6] hover:bg-[#1899d6] border-b-[6px] border-[#1899d6] active:border-b-0 active:translate-y-[6px]'
            }`}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-2" />
            )}
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-10">
          {currentPassage?.questions?.map((qRef: any, index: number) => {
            // Find the actual question details from the main questions array
            const q = examData.questions.find((item: any) => item.question_no === qRef.question_no) || qRef;
            
            const hasAnswered = !!answers[q.question_no];
            const isCorrect = hasAnswered && answers[q.question_no] === q.answer;
            const isWrong = hasAnswered && !isCorrect;
            
            return (
              <div key={q.question_no} className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
                <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span>Question {q.question_no}</span>
                    {q.audio_script && <span className="text-sm font-normal text-slate-500">{q.audio_script}</span>}
                  </div>
                  {hasAnswered && (
                    <span className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ml-4 ${isCorrect ? 'bg-[#d7ffb8] text-[#58cc02]' : 'bg-[#ffdfe0] text-[#ff4b4b]'}`}>
                      {isCorrect ? '回答正确' : '回答错误'}
                    </span>
                  )}
                </h2>
                <div className="grid gap-3">
                  {q.options?.length > 0 ? q.options.map((opt: string, i: number) => {
                    const optionLetter = opt.substring(0, 1)
                    const isSelected = answers[q.question_no] === optionLetter
                    const isCorrectOption = q.answer === optionLetter

                    let bgClass = "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    if (hasAnswered || showResult) {
                      if (isCorrectOption) {
                        bgClass = "border-[#58cc02] bg-[#d7ffb8] text-[#58cc02] font-bold"
                      } else if (isSelected) {
                        bgClass = "border-[#ff4b4b] bg-[#ffdfe0] text-[#ff4b4b] font-bold"
                      } else {
                        bgClass = "border-slate-200 bg-white text-slate-400 opacity-50 cursor-not-allowed"
                      }
                    } else if (isSelected) {
                      bgClass = "border-[#1cb0f6] bg-[#ddf4ff] text-[#1899d6]"
                    }

                    return (
                    <button
                      key={i}
                      disabled={hasAnswered || showResult || !audioCompleted[currentPassageIdx]}
                      onClick={() => handleSelectOption(q.question_no, optionLetter)}
                      className={`p-4 rounded-xl border-2 text-left transition-all font-semibold relative group/btn ${bgClass} ${(!audioCompleted[currentPassageIdx] && !showResult) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {opt}
                      {(!audioCompleted[currentPassageIdx] && !showResult) && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          录音播放60秒后解锁
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  )
                  }) : <div className="text-slate-400 p-4 text-center">暂无选项数据</div>}
                </div>

                {/* Immediate Feedback & Explanation Toggle */}
                {isWrong && (
                  <div className="mt-6">
                    {!showExplanation[q.question_no] ? (
                      <button 
                        onClick={() => setShowExplanation(prev => ({...prev, [q.question_no]: true}))}
                        className="text-[#ff4b4b] font-bold flex items-center gap-2 hover:text-[#ea2b2b] transition-colors bg-[#ffdfe0] hover:bg-[#ffc6c8] px-4 py-3 rounded-xl w-full justify-center"
                      >
                        <AlertCircle className="w-5 h-5" />
                        查看解析
                      </button>
                    ) : (
                      <div className="bg-white p-5 rounded-xl border-2 border-slate-200 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold">
                          <AlertCircle className="w-5 h-5" />
                          解析
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="font-bold text-slate-700">正确答案：</span>
                            <span className="text-[#58cc02] font-bold ml-1">{q.answer}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">关键句：</span>
                            <span className="text-slate-600 bg-yellow-100 px-1 rounded leading-loose">{q.key_sentence}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {q.explanation?.replace(/\[cite:\s*\d+\]/g, '')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Area */}
      <div className="fixed bottom-0 left-0 w-full border-t-2 border-slate-200 bg-white px-4 py-6 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <DuoBtn 
            variant="ghost" 
            className="flex-1 max-w-[120px]" 
            onClick={handlePrev}
            disabled={currentPassageIdx === 0}
          >
            上一篇
          </DuoBtn>
          
          <div className="flex-1 relative group">
            <DuoBtn 
              variant={currentPassageIdx === (examData?.passages?.length || 1) - 1 ? "primary" : "secondary"} 
              className="w-full" 
              onClick={handleNext}
              disabled={!audioCompleted[currentPassageIdx]}
            >
              {currentPassageIdx === (examData?.passages?.length || 1) - 1 ? '提交考卷' : '下一篇'}
            </DuoBtn>
            {!audioCompleted[currentPassageIdx] && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                请先听完录音再进入下一篇
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExamClient({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ExamContent params={params} />
    </Suspense>
  )
}
