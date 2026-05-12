"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Headphones, Crosshair, GraduationCap, Play, ChevronDown, Anchor, Wrench, Shield, Briefcase, Train, Cpu, Compass, BookOpen, AlertTriangle, Users, Coffee, Flame, Sparkles, SpellCheck, Target } from 'lucide-react'

// Define the colleges and their majors based on user input, filtered to >= 5 questions
const COLLEGES = [
  {
    name: "航海技术学院",
    icon: Compass,
    color: "bg-[#e3f2fd] text-[#2196f3]",
    majors: ["航海技术", "水路运输安全管理"]
  },
  {
    name: "船舶与海洋工程学院",
    icon: Anchor,
    color: "bg-[#e8eaf6] text-[#9c27b0]",
    majors: ["建筑工程技术", "工程造价"]
  },
  {
    name: "运输管理与经济学院",
    icon: Briefcase,
    color: "bg-[#e8f5e9] text-[#3f51b5]",
    majors: ["交通运营管理", "大数据与财务管理", "现代物流管理", "关务与外贸服务", "电子商务"]
  },
  {
    name: "智能制造与信息学院",
    icon: Cpu,
    color: "bg-[#e0f7fa] text-[#00bcd4]",
    majors: ["飞机机电设备维修", "计算机网络技术", "数字媒体技术", "机场运行服务与管理", "大数据技术"]
  },
  {
    name: "人文艺术学院",
    icon: GraduationCap,
    color: "bg-[#fbe9e7] text-[#e91e63]",
    majors: ["国际邮轮乘务管理", "视觉传达设计", "环境艺术设计", "建筑室内设计"]
  }
]

export default function ListeningHub() {
  const router = useRouter()
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null)
  const [showMajorSelector, setShowMajorSelector] = useState(false)

  // Load saved major from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_major')
    if (saved) {
      setSelectedMajor(saved)
    }
  }, [])

  const handleSelectMajor = (major: string) => {
    setSelectedMajor(major)
    localStorage.setItem('user_major', major)
    setShowMajorSelector(false)
  }

  // Find the college for the selected major
  const currentCollege = selectedMajor 
    ? COLLEGES.find(c => c.majors.includes(selectedMajor)) 
    : null

  const handleStartPractice = (mode: string, customTag?: string) => {
    const tagToUse = customTag || selectedMajor;
    if (!tagToUse) {
      setShowMajorSelector(true)
      return
    }
    // Route to practice with the selected tag
    router.push(`/?mode=${mode}&tag=${encodeURIComponent(tagToUse)}&returnTo=/listening`)
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#263238] font-sans pb-24 relative">
      <header className="sticky top-0 z-40 bg-[#F7F9FA]/80 backdrop-blur-md px-5 pt-5 pb-3 flex items-center justify-between mb-2">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => router.push('/')}
          title="返回应用主页"
        >
          <button className="text-[#263238] group-hover:text-[#00BFA5] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-[#263238] tracking-wider group-hover:text-[#00BFA5] transition-colors">职场核心听力</h1>
        </div>
        {selectedMajor && (
          <button 
            onClick={() => {
              const el = document.getElementById('career-module');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setShowMajorSelector(true);
              }
            }}
            className="flex items-center gap-1 text-[13px] font-bold text-[#00BFA5] bg-[#e0f2f1] px-3 py-1.5 rounded-full"
          >
            切换专业 <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="px-5 space-y-6 mt-4">
        {/* 1. 顶部：专属专业定制舱 (Personalized Career Module) */}
        <div id="career-module">
          <h3 className="text-[16px] font-black text-[#263238] mb-3 px-1 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#9c27b0]" /> 进阶：专属专业定制舱
          </h3>
          
          {selectedMajor && currentCollege ? (
            <div className="bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] p-6 rounded-[24px] shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <currentCollege.icon className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[12px] font-bold text-[#6a1b9a]">
                    <currentCollege.icon className="w-3 h-3" /> {currentCollege.name}
                  </div>
                  <button 
                    onClick={() => setShowMajorSelector(true)}
                    className="flex items-center gap-1 text-[12px] font-bold text-[#6a1b9a] bg-white/40 px-2 py-1 rounded-md"
                  >
                    切换 <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                
                <h2 className="text-[20px] font-black text-[#4a148c] mb-1">{selectedMajor}职场实战专区</h2>
                <p className="text-[#6a1b9a]/80 text-[13px] mb-4">萃取专业核心语料，直接进行实战听写</p>
                
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <button 
                    onClick={() => handleStartPractice('practice')}
                    className="bg-[#9c27b0] text-white font-black py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      <span className="text-[15px]">开始专业定制听写</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] p-6 rounded-[24px] shadow-sm text-center cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setShowMajorSelector(true)}>
              <div className="w-14 h-14 mx-auto bg-white/50 text-[#9c27b0] rounded-full flex items-center justify-center mb-3">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-[16px] font-bold text-[#4a148c] mb-1">想知道你的专业在职场怎么用英语吗？</h3>
              <p className="text-[13px] text-[#6a1b9a]/80 mb-4">不强制选择，不阻断通用学习</p>
              <button className="bg-[#9c27b0] text-white font-bold px-6 py-2.5 rounded-full shadow-md flex items-center justify-center gap-2 mx-auto">
                👉 开启我的专业定制 <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. 中部核心区：通用英语模考 (General English Mock Hub) */}
        <div className="pt-2 border-t border-[#eceff1]">
          <h3 className="text-[16px] font-black text-[#263238] mb-3 px-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#ff5722]" /> 历年真题模考
          </h3>
          <div 
            className="bg-gradient-to-br from-[#ff7043] to-[#f4511e] p-6 rounded-[24px] shadow-lg text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => router.push('/exam')}
          >
            <div className="absolute -right-4 -top-4 opacity-10">
              <BookOpen className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[12px] font-bold mb-3">
                <Flame className="w-3 h-3" /> 核心提分
              </div>
              <h2 className="text-2xl font-black mb-1">全真冲刺模考</h2>
              <p className="text-white/90 text-[13px] mb-4">还原真实考场，30分钟沉浸式通用听力摸底</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push('/exam'); }}
                  className="flex-1 bg-white text-[#f4511e] font-black py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  套卷模考
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push('/exam?mode=random'); }}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  随机摸底
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 底部支撑区：通用碎片化训练 (General Daily Practice) */}
        <div className="pt-2 border-t border-[#eceff1]">
          <h3 className="text-[16px] font-black text-[#263238] mb-3 px-1 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-[#00BFA5]" /> 专项查漏补缺
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="bg-white p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform flex flex-col items-center text-center"
              onClick={() => router.push('/?mode=map')}
            >
              <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#4caf50] flex items-center justify-center mb-3">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#263238] text-[16px] mb-1">长难句精听</h4>
              <p className="text-[12px] text-[#78909C]">每日碎片化闯关</p>
            </div>

            <div 
              className="bg-white p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform flex flex-col items-center text-center"
              onClick={() => router.push('/vocab')}
            >
              <div className="w-12 h-12 rounded-full bg-[#e3f2fd] text-[#2196f3] flex items-center justify-center mb-3">
                <SpellCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#263238] text-[16px] mb-1">高频词汇</h4>
              <p className="text-[12px] text-[#78909C]">核心大纲词汇测试</p>
            </div>
            
            <div 
              className="col-span-2 bg-white p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform flex items-center gap-4"
              onClick={() => router.push('/?mode=review')}
            >
              <div className="w-12 h-12 rounded-full bg-[#fff3e0] text-[#ff9800] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#263238] text-[16px] mb-0.5">AI 错题本</h4>
                <p className="text-[12px] text-[#78909C]">仅针对模考错题进行 AI 讲解和重练</p>
              </div>
              <ChevronDown className="w-5 h-5 text-[#cfd8dc] -rotate-90" />
            </div>
          </div>
        </div>

      </div>

      {/* Major Selector Modal */}
      {showMajorSelector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F7F9FA] w-full max-w-md h-[85vh] rounded-t-[32px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="p-5 pb-3 bg-white flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <h2 className="text-[18px] font-black text-[#263238]">选择专业方向</h2>
              <button 
                onClick={() => setShowMajorSelector(false)}
                className="w-8 h-8 bg-[#eceff1] text-[#455a64] rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {COLLEGES.map((college, idx) => (
                <div key={idx}>
                  <h3 className="text-[14px] font-bold text-[#78909c] mb-3 flex items-center gap-2">
                    <college.icon className="w-4 h-4" />
                    {college.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {college.majors.map((major, mIdx) => (
                      <button
                        key={mIdx}
                        onClick={() => handleSelectMajor(major)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold border-2 transition-all ${
                          selectedMajor === major 
                            ? 'bg-[#00BFA5] border-[#00BFA5] text-white shadow-md' 
                            : 'bg-white border-[#eceff1] text-[#455a64] hover:border-[#00BFA5] hover:text-[#00BFA5]'
                        }`}
                      >
                        {major}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Add custom styles for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
