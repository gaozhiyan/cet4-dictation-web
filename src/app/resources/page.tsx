'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Compass, MessageCircle, FileText, User as UserIcon, Plus, ArrowLeft, ArrowUpRight } from 'lucide-react'

// Dummy Data for Resources
const RESOURCES = [
  {
    id: "r1",
    title: "China Daily: Tech giants bet big on AI integration",
    domain: "chinadaily.com.cn",
    tag: "职场面试",
    category: "News",
    timeAgo: "打开于 6m",
    chips: ["Background", "Quick Read"]
  },
  {
    id: "r2",
    title: "Unit 3: Cross-Cultural Communication in Business",
    domain: "Textbook",
    tag: "跨界协同",
    category: "Academic",
    timeAgo: "打开于 34m",
    chips: ["Vocabulary", "Context"]
  },
  {
    id: "r3",
    title: "Xinhua: China's green energy capacity hits new high",
    domain: "xinhuanet.com",
    tag: "商业洞察",
    category: "News",
    timeAgo: "打开于 1h",
    chips: ["Stats", "Industry Trends"]
  },
  {
    id: "r4",
    title: "CGTN: High-speed rail network expands to western regions",
    domain: "cgtn.com",
    tag: "深度思辨",
    category: "Report",
    timeAgo: "打开于 2h",
    chips: ["Infrastructure", "Context"]
  },
  {
    id: "r5",
    title: "China Daily: Postgrad entrance exams hit record high",
    domain: "chinadaily.com.cn",
    tag: "考研面试",
    category: "News",
    timeAgo: "打开于 1d",
    chips: ["Background", "Stats"]
  },
  {
    id: "r6",
    title: "Global Times: Navigating workplace culture in modern China",
    domain: "globaltimes.cn",
    tag: "生存通关",
    category: "Culture",
    timeAgo: "打开于 2d",
    chips: ["Tips", "Social Skills"]
  },
  {
    id: "r7",
    title: "Xinhua: New policies for maritime safety and PSC inspections",
    domain: "xinhuanet.com",
    tag: "高阶博弈",
    category: "Policy",
    timeAgo: "打开于 3d",
    chips: ["Maritime", "Official Document"]
  },
  {
    id: "r8",
    title: "CGTN: Cross-cultural exchange programs see significant growth",
    domain: "cgtn.com",
    tag: "文化碰撞",
    category: "Culture",
    timeAgo: "打开于 4d",
    chips: ["Exchange", "Insights"]
  },
  {
    id: "r9",
    title: "China Daily: The rising trend of pet ownership among young adults",
    domain: "chinadaily.com.cn",
    tag: "生活碎片",
    category: "Lifestyle",
    timeAgo: "打开于 5d",
    chips: ["Social Trend", "Vocabulary"]
  }
]

const FILTER_CHIPS = ["全部房间", "未读", "收藏", "最近打开", "考研面试", "职场面试", "跨界协同", "生存通关", "高阶博弈", "商业洞察", "深度思辨", "文化碰撞", "生活碎片"]

export default function ResourcesPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("最近打开")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<typeof RESOURCES[0] | null>(null)

  useEffect(() => {
    // If navigating from chat with a specific tag
    const params = new URLSearchParams(window.location.search)
    const tag = params.get('tag')
    if (tag) {
      // Remove '#' if present
      const cleanTag = tag.replace('#', '')
      if (FILTER_CHIPS.includes(cleanTag)) {
        setActiveFilter(cleanTag)
      } else {
        setSearchQuery(cleanTag)
        setActiveFilter("全部房间")
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] font-sans text-slate-700 antialiased">
      <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white relative pb-[64px]">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex flex-col shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center rounded-[20px] bg-slate-100 border border-slate-200 shrink-0 w-10 h-10 cursor-pointer active:scale-95 transition-transform"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5 text-slate-800" />
              </div>
              <div className="flex flex-col">
                <div className="text-slate-800 font-[950] text-lg leading-tight">
                  资源库
                </div>
                <div className="text-slate-500 font-bold text-xs leading-tight">
                  按最近打开排序 · 仅文本链接
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-[20px] bg-[#00BFA5] shrink-0 w-10 h-10 cursor-pointer active:scale-95 transition-transform shadow-sm shadow-[#00BFA5]/30">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="flex w-full h-10 items-center rounded-[14px] px-3 gap-2 bg-slate-50 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索标题 / 域名 / 标签" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder-slate-400"
              />
            </div>
          </div>

          {/* Chips */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            {FILTER_CHIPS.map(chip => (
              <div 
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`flex h-8 items-center justify-center rounded-full px-3.5 cursor-pointer whitespace-nowrap transition-colors ${
                  activeFilter === chip 
                    ? 'bg-[#00BFA5]/10 border border-[#00BFA5]/30 text-[#009688]' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="font-extrabold text-xs">
                  {chip}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint Card */}
        <div className="px-4 pt-4 shrink-0">
          <div className="flex w-full rounded-[20px] gap-3 bg-white border border-slate-200 p-3.5 shadow-sm">
            <div className="flex w-10 h-10 items-center justify-center rounded-2xl bg-slate-100 shrink-0">
              <span className="text-slate-800 font-[950] text-lg">i</span>
            </div>
            <div className="flex flex-col grow shrink basis-[0%] justify-center gap-0.5">
              <div className="text-slate-800 font-extrabold text-sm">
                先熟悉，再继续聊
              </div>
              <div className="text-slate-500 font-bold text-xs">
                在聊天室遇到不熟的背景时，先打开相关资源快速补课。
              </div>
            </div>
          </div>
        </div>

        {/* List Area */}
        <div className="flex flex-col grow shrink basis-[0%] overflow-y-auto px-4 pt-4 pb-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-slate-800 font-[950] text-sm">
              最近打开
            </div>
            <div className="text-[#00BFA5] font-extrabold text-xs cursor-pointer">
              查看全部
            </div>
          </div>

          {RESOURCES.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.tag.includes(searchQuery)
            if (activeFilter === "全部房间" || activeFilter === "最近打开") return matchesSearch
            return matchesSearch && r.tag === activeFilter
          }).map(resource => (
            <div 
              key={resource.id} 
              onClick={() => setSelectedArticle(resource)}
              className="flex flex-col w-full rounded-[20px] gap-3 bg-white border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col grow shrink basis-[0%] gap-2">
                  <div className="text-slate-800 font-extrabold text-[15px] leading-snug">
                    {resource.title}
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex rounded-full py-1 px-2.5 bg-slate-100">
                      <span className="text-slate-700 font-extrabold text-[11px]">
                        {resource.tag}
                      </span>
                    </div>
                    <div className="text-slate-500 font-bold text-[11px]">
                      {resource.domain}
                    </div>
                    <div className="text-slate-400 font-bold text-[11px]">
                      {resource.timeAgo}
                    </div>
                  </div>
                </div>
                <div className="flex w-10 h-10 items-center justify-center rounded-2xl bg-slate-800 shrink-0 active:scale-95 transition-transform">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-1">
                {resource.chips.map((chip, idx) => (
                  <div key={idx} className={`flex rounded-full py-1 px-2.5 ${
                    idx % 2 === 0 ? 'bg-[#00BFA5]/10 text-[#009688]' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <span className="font-extrabold text-[11px]">
                      {chip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex w-full h-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shrink-0 mt-2">
            <span className="text-slate-400 font-bold text-xs">
              继续向下滚动查看更多
            </span>
          </div>
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
                <MessageCircle className="w-[22px] h-[22px] text-slate-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-400">聊天室</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 cursor-pointer flex-1" onClick={() => router.push('/resources')}>
              <div className="p-1.5 bg-[#00BFA5]/10 rounded-xl">
                <FileText className="w-[22px] h-[22px] text-[#00BFA5]" />
              </div>
              <span className="text-[10px] font-bold text-[#00BFA5]">资源库</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 cursor-pointer flex-1" onClick={() => router.push('/profile')}>
              <div className="p-1.5">
                <UserIcon className="w-[22px] h-[22px] text-slate-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-400">我的</span>
            </div>
          </div>
        </div>

        {/* Article Full Screen Overlay */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto font-sans text-slate-700 max-w-md mx-auto animate-in slide-in-from-bottom-full duration-300">
            {/* Article Top Nav */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors" 
                  onClick={() => setSelectedArticle(null)}
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                  <div className="font-extrabold text-[15px] text-slate-800 tracking-tight line-clamp-1 max-w-[200px]">
                    {selectedArticle.category}
                  </div>
                  <div className="text-slate-500 font-bold text-[11px]">
                    {selectedArticle.domain}
                  </div>
                </div>
              </div>
              <button className="p-2 -mr-2 text-slate-500 hover:text-slate-800 transition-colors">
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Article Content */}
            <div className="flex flex-col p-5 gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full py-1.5 px-3 bg-slate-100">
                    <span className="text-slate-800 font-extrabold text-[11px]">
                      How it works
                    </span>
                  </div>
                  <span className="text-slate-500 font-bold text-xs">8 min read</span>
                </div>
              </div>

              {/* Hero Image */}
              <div 
                className="w-full aspect-[2/1] rounded-2xl shadow-inner flex items-center justify-center border border-slate-200/60 overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop')`
                }}
              >
                <div className="w-full h-full bg-slate-900/20 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-sm shadow-lg">
                    {selectedArticle.category} Focus
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <p className="text-slate-800 font-bold text-[15px] leading-relaxed">
                  A new wave of tools is transforming how people learn foreign languages — and the results are remarkable. As global connectivity increases, the demand for immersive, context-rich language education has reached new heights.
                </p>
                
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm border-l-4 border-l-[#00BFA5]">
                  <p className="text-slate-800 font-bold text-[14px] leading-relaxed italic">
                    “The key breakthrough is real-time pronunciation correction and cultural context — something no traditional textbook could ever provide in a dynamic scenario.”
                  </p>
                </div>

                <p className="text-slate-600 font-semibold text-[15px] leading-relaxed">
                  Experts suggest that engaging in simulated environments drastically improves retention rates. By practicing with conversational AI, students can experience the pressure and nuances of real-world interactions without the immediate real-world consequences, creating a safe "trial-and-error" space.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
