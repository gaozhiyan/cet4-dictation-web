'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Sparkles, Wand2, FileText, Upload, Headphones, Play, Target, CheckCircle2 } from 'lucide-react'

function CustomDictationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const major = searchParams.get('major')
  
  const [text, setText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (major) {
      // 预填一些跟专业相关的占位符或文本，让用户知道他们在这个专业的专属定制舱
      setText(`// ${major} 专属语料库\n\n请在此处输入你想练习的 ${major} 相关英文材料，或点击下方按钮随机生成一段专业英语。`)
    }
  }, [major])
  
  const handleGenerate = () => {
    if (!text.trim()) return
    
    setIsGenerating(true)
    
    // 模拟 TTS 生成和题目提取过程
    setTimeout(() => {
      setIsGenerating(false)
      setShowResult(true)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10 pb-4 border-b-2 border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-700 flex items-center gap-3">
              <Wand2 className="w-8 h-8 text-[#ff4b4b]" /> {major ? `${major} 定制听写` : 'AI 自定义听写'}
            </h1>
            <p className="text-slate-500 font-bold mt-2">
              {major ? `专属专业词汇与情境训练，提升职场英语听力能力` : `上传任意英文材料，一键生成考场级听写任务`}
            </p>
          </div>
          <button onClick={() => router.push('/')} className="bg-white text-slate-400 hover:text-slate-600 font-bold px-4 py-2 rounded-2xl border-2 border-slate-200 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> 返回主页
          </button>
        </header>

        {!showResult ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-extrabold text-slate-700 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-rose-500" /> 输入英文素材
              </h2>
              
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="在此粘贴你要练习听写的英文段落，或输入海员专业英语对话..."
                  className="w-full h-64 bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors resize-none"
                  disabled={isGenerating}
                />
                
                {/* 快捷填入模板按钮 */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setText("The captain ordered the chief mate to secure the cargo immediately due to the approaching storm. All crew members must report to their emergency stations.")}
                    className="text-xs font-bold bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    填入海员例句
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={!text.trim() || isGenerating}
                  className="w-full md:w-auto bg-[#ff4b4b] hover:bg-[#ea2b2b] disabled:bg-slate-300 disabled:border-slate-300 text-white font-extrabold text-xl px-12 py-5 rounded-2xl border-b-4 border-[#cc3c3c] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      正在调用 TTS 引擎合成语音...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" /> 一键生成专属听写
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 text-center">
                <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-700 mb-2">1. 输入内容</h3>
                <p className="text-slate-500 text-sm font-bold">支持任意长难句、新闻或专业文献的文本粘贴</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-700 mb-2">2. AI 语音合成</h3>
                <p className="text-slate-500 text-sm font-bold">自动调用高端 TTS 引擎，生成纯正英音/美音</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-700 mb-2">3. 挖空生成</h3>
                <p className="text-slate-500 text-sm font-bold">根据您的词汇水平，自动提取核心词汇进行挖空练习</p>
              </div>
            </div>
          </div>
        ) : (
          /* 生成结果占位界面 */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl border-2 border-[#58cc02] shadow-sm p-10 text-center">
              <div className="w-20 h-20 bg-[#d7ffb8] text-[#58cc02] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-700 mb-4">生成成功！</h2>
              <p className="text-slate-500 font-bold text-lg mb-8">
                AI 已将您的文本转换为标准听力音频，并自动生成了 3 个核心词汇挖空。
              </p>
              
              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 max-w-xl mx-auto mb-10 text-left">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-slate-200 pb-4">
                  <button className="w-12 h-12 bg-[#1cb0f6] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm border-b-4 border-[#1899d6] active:border-b-0 active:translate-y-1">
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-400">00:00 / 00:15</span>
                </div>
                <p className="text-slate-700 text-lg leading-relaxed font-medium">
                  The captain ordered the <span className="inline-block w-24 border-b-2 border-slate-300 bg-white"></span> mate to <span className="inline-block w-24 border-b-2 border-slate-300 bg-white"></span> the cargo immediately due to the approaching storm. All crew members must <span className="inline-block w-24 border-b-2 border-slate-300 bg-white"></span> to their emergency stations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-xl px-10 py-4 rounded-2xl border-b-4 border-[#58a700] active:border-b-0 active:translate-y-1 transition-all">
                  开始听写测试
                </button>
                <button 
                  onClick={() => {
                    setShowResult(false)
                    setText('')
                  }} 
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-500 font-extrabold text-xl px-10 py-4 rounded-2xl border-2 border-slate-200 transition-colors"
                >
                  重新生成
                </button>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-400">[ 提示：当前为 Demo 页面，音频生成和挖空为前端模拟效果 ]</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomDictation() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div></div>}>
      <CustomDictationContent />
    </Suspense>
  )
}
