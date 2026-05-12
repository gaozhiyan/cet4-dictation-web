import os
import re

# 1. Create directories
os.makedirs('src/app/listening', exist_ok=True)
os.makedirs('src/app/profile', exist_ok=True)

# 2. Create Listening Page
listening_page_code = """\"\"\"
Listening Hub Page
\"\"\"
"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, Headphones, Crosshair, GraduationCap, Play } from 'lucide-react'

export default function ListeningHub() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#263238] font-sans pb-24">
      <header className="sticky top-0 z-40 bg-[#F7F9FA]/80 backdrop-blur-md px-5 pt-5 pb-3 flex items-center gap-4 mb-2">
        <button onClick={() => router.back()} className="text-[#263238] hover:text-[#00BFA5] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-[#263238] tracking-wider">核心听力</h1>
      </header>

      <div className="px-5 space-y-4 mt-6">
        {/* 场景听力实战 */}
        <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#e3f2fd] text-[#2196f3] flex items-center justify-center shrink-0">
            <Headphones className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-bold text-[#263238] mb-1">场景听力实战</h3>
            <p className="text-[13px] text-[#78909C]">高压语境模拟，暴露真实听力盲区</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F7F9FA] flex items-center justify-center text-[#78909C]">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>

        {/* 靶向修复 (AI) */}
        <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform flex items-center gap-5" onClick={() => router.push('/map')}>
          <div className="w-14 h-14 rounded-full bg-[#fff3e0] text-[#ff9800] flex items-center justify-center shrink-0">
            <Crosshair className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[18px] font-bold text-[#263238]">单句靶向修复</h3>
              <span className="bg-[#ffebee] text-[#ff5252] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#ffcdd2]">AI 专属</span>
            </div>
            <p className="text-[13px] text-[#78909C]">基于实战错题，生成专属听写包</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F7F9FA] flex items-center justify-center text-[#78909C]">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>

        {/* 全真模考 */}
        <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:scale-[0.98] transition-transform flex items-center gap-5" onClick={() => router.push('/exam')}>
          <div className="w-14 h-14 rounded-full bg-[#f3e5f5] text-[#9c27b0] flex items-center justify-center shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-bold text-[#263238] mb-1">全真冲刺模考</h3>
            <p className="text-[13px] text-[#78909C]">历年四级真题套卷，考场级体验</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F7F9FA] flex items-center justify-center text-[#78909C]">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>
      </div>
    </div>
  )
}
"""

with open('src/app/listening/page.tsx', 'w') as f:
    f.write(listening_page_code)

# 3. Create Profile Page
profile_page_code = """\"\"\"
Profile Page
\"\"\"
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, User, Settings, LogOut, BookOpen, Crown, BarChart3, ChevronRight, Award, Bell, HelpCircle } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
      else router.push('/login')
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <div className="min-h-screen bg-[#F7F9FA]"></div>

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#263238] font-sans pb-24">
      {/* Header Profile Area */}
      <header className="bg-gradient-to-b from-[#00BFA5] to-[#009688] pt-16 pb-12 px-6 text-white shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center text-[#009688] font-black text-3xl shadow-lg border-4 border-white/20">
            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">{user?.user_metadata?.full_name || '学习者'}</h1>
            <p className="text-white/80 text-sm mt-1">{user?.email}</p>
          </div>
        </div>
      </header>

      <div className="px-5 -mt-6 space-y-5 relative z-10">
        
        {/* Stats Row */}
        <div className="bg-white rounded-[20px] shadow-sm p-5 grid grid-cols-3 divide-x divide-[#ECEFF1]">
           <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#263238]">12</span>
              <span className="text-[11px] font-bold text-[#78909C] mt-1">学习天数</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#263238]">345</span>
              <span className="text-[11px] font-bold text-[#78909C] mt-1">掌握词汇</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#263238]">8</span>
              <span className="text-[11px] font-bold text-[#78909C] mt-1">获得徽章</span>
           </div>
        </div>

        {/* Feature List 1 */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-[#ECEFF1] active:bg-[#F5F5F5] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#fff3e0] text-[#ff9800] flex items-center justify-center"><Award className="w-5 h-5" /></div>
                 <span className="font-bold text-[#263238]">我的成就</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#B0BEC5]" />
           </div>
           <div className="flex items-center justify-between p-4 border-b border-[#ECEFF1] active:bg-[#F5F5F5] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#e3f2fd] text-[#2196f3] flex items-center justify-center"><Bell className="w-5 h-5" /></div>
                 <span className="font-bold text-[#263238]">学习提醒</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#B0BEC5]" />
           </div>
           <div className="flex items-center justify-between p-4 active:bg-[#F5F5F5] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#4caf50] flex items-center justify-center"><HelpCircle className="w-5 h-5" /></div>
                 <span className="font-bold text-[#263238]">帮助与反馈</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#B0BEC5]" />
           </div>
        </div>

        {/* Feature List 2 */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-[#ECEFF1] active:bg-[#F5F5F5] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#f3e5f5] text-[#9c27b0] flex items-center justify-center"><Settings className="w-5 h-5" /></div>
                 <span className="font-bold text-[#263238]">设置</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#B0BEC5]" />
           </div>
           <div className="flex items-center justify-between p-4 active:bg-[#F5F5F5] transition-colors cursor-pointer" onClick={handleLogout}>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#ffebee] text-[#ff5252] flex items-center justify-center"><LogOut className="w-5 h-5" /></div>
                 <span className="font-bold text-[#ff5252]">退出登录</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#B0BEC5]" />
           </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white h-[60px] flex justify-around items-center border-t border-[#ECEFF1] pb-safe z-50">
         <div className="flex flex-col items-center justify-center text-[#B0BEC5] w-full h-full cursor-pointer" onClick={() => router.push('/')}>
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">学习</span>
         </div>
         <div className="flex flex-col items-center justify-center text-[#B0BEC5] w-full h-full cursor-pointer">
            <Crown className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">排行榜</span>
         </div>
         <div className="flex flex-col items-center justify-center text-[#B0BEC5] w-full h-full cursor-pointer">
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">战绩</span>
         </div>
         <div className="flex flex-col items-center justify-center text-[#00BFA5] w-full h-full cursor-pointer">
            <User className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">我的</span>
         </div>
      </nav>
    </div>
  )
}
"""

with open('src/app/profile/page.tsx', 'w') as f:
    f.write(profile_page_code)

# 4. Update page.tsx
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

start_str = "        <div className=\"min-h-screen bg-[#F7F9FA] text-[#263238] font-sans pb-24 relative\">"
end_str = "        {/* 听力 Hub Modal */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_layout = """        <div className="min-h-screen bg-[#F7F9FA] text-[#263238] font-sans pb-24 relative">
          
          {/* Sticky Header */}
          <header className="sticky top-0 z-40 bg-[#F7F9FA]/80 backdrop-blur-md px-5 pt-5 pb-3 flex justify-between items-center mb-5">
            <h1 className="text-2xl font-black text-[#263238] tracking-wider">AI 英语私教</h1>
            <div className="flex items-center gap-3">
              <button onClick={openVanityCard} className="text-[#78909C] hover:text-[#00BFA5] transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </header>
          
          <div className="px-5 space-y-6">
            
            {/* AI Insight Hero Card */}
            <div 
              className="bg-gradient-to-br from-[#00BFA5] to-[#009688] rounded-[24px] p-6 text-white relative overflow-hidden shadow-[0_10px_20px_rgba(0,191,165,0.3)] cursor-pointer active:scale-[0.98] transition-transform" 
              onClick={() => router.push('/listening')}
            >
              <div className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-lg shadow-inner border border-white/30">🤖</div>
                  <h2 className="text-[18px] font-bold">AI 学情洞察</h2>
                </div>
                <p className="text-[14px] text-white/90 mb-5 leading-relaxed font-medium">
                  昨日实战中，你的<span className="text-[#FFC107] font-bold mx-1">连读识别</span>准确率降至 72%。已为你生成专属靶向修复包。
                </p>
                <div className="bg-white text-[#009688] text-[13px] font-bold px-4 py-2.5 rounded-full w-max flex items-center gap-1 shadow-sm">
                  一键执行专属任务 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-[16px] flex flex-col items-center shadow-sm">
                <span className="text-[#00BFA5] font-black text-2xl mb-1">{streakCount}</span>
                <span className="text-[#78909C] text-[11px] font-bold">连续打卡</span>
              </div>
              <div className="bg-white p-4 rounded-[16px] flex flex-col items-center shadow-sm">
                <span className="text-[#263238] font-black text-2xl mb-1 flex items-baseline">85<span className="text-sm ml-0.5">%</span></span>
                <span className="text-[#78909C] text-[11px] font-bold">AI 发音准度</span>
              </div>
              <div className="bg-white p-4 rounded-[16px] flex flex-col items-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={viewStats}>
                <span className="text-[#263238] font-black text-2xl mb-1">A2</span>
                <span className="text-[#78909C] text-[11px] font-bold">能力预估</span>
              </div>
            </div>

            {/* Review Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              
              {/* Card 1: 核心听力 (AI Badge) */}
              <div className="relative bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/listening')}>
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-[16px] rounded-tr-[20px] flex items-center gap-1 shadow-sm">
                   <Sparkles className="w-3 h-3" /> AI 强推
                </div>
                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#4caf50] flex items-center justify-center mb-4 mt-2">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">核心听力</h3>
                <p className="text-[13px] text-[#78909C] leading-tight">场景实战与单句靶向修复</p>
              </div>

              {/* Card 2: 场景口语 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/chat')}>
                <div className="w-16 h-16 rounded-full bg-[#e3f2fd] text-[#2196f3] flex items-center justify-center mb-4 mt-2">
                  <Mic className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">场景口语</h3>
                <p className="text-[13px] text-[#78909C] leading-tight">AI 语境沉浸式对话陪练</p>
              </div>

              {/* Card 3: 词汇特训 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/vocab')}>
                <div className="w-16 h-16 rounded-full bg-[#fff3e0] text-[#ff9800] flex items-center justify-center mb-4 mt-2">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">词汇特训</h3>
                <p className="text-[13px] text-[#78909C] leading-tight">词汇量精确评估与突破</p>
              </div>

              {/* Card 4: 定制练习 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/custom')}>
                <div className="w-16 h-16 rounded-full bg-[#f3e5f5] text-[#9c27b0] flex items-center justify-center mb-4 mt-2">
                  <Wand2 className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">定制练习</h3>
                <p className="text-[13px] text-[#78909C] leading-tight">自定义素材的高级听写</p>
              </div>
              
            </div>
          </div>

          {/* Bottom Nav */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white h-[60px] flex justify-around items-center border-t border-[#ECEFF1] pb-safe z-50">
             <div className="flex flex-col items-center justify-center text-[#00BFA5] w-full h-full cursor-pointer">
                <BookOpen className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">学习</span>
             </div>
             <div className="flex flex-col items-center justify-center text-[#B0BEC5] w-full h-full cursor-pointer" onClick={fetchLeaderboard}>
                <Crown className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">排行榜</span>
             </div>
             <div className="flex flex-col items-center justify-center text-[#B0BEC5] w-full h-full cursor-pointer" onClick={viewStats}>
                <BarChart3 className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">战绩</span>
             </div>
             <div className="flex flex-col items-center justify-center text-[#B0BEC5] w-full h-full cursor-pointer" onClick={() => router.push('/profile')}>
                <User className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">我的</span>
             </div>
          </nav>
        </div>
"""

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + new_layout + "\n" + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(updated_content)
    print("Success updating page.tsx with V4 features")
else:
    print("Failed to find start/end indices in page.tsx")
