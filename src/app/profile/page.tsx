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
