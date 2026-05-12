import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

start_str = "        <div className=\"max-w-5xl mx-auto pb-24\">"
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
            
            {/* Home Hero Card */}
            <div 
              className="bg-gradient-to-br from-[#00BFA5] to-[#009688] rounded-[24px] p-6 text-white relative overflow-hidden shadow-[0_10px_20px_rgba(0,191,165,0.3)] cursor-pointer active:scale-[0.98] transition-transform" 
              onClick={ctaConfig.action}
            >
              <div className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-[22px] font-bold mb-4">{ctaConfig.label}</h2>
                <div className="flex items-center gap-2 text-sm font-medium bg-white/20 w-max px-4 py-2 rounded-full backdrop-blur-sm">
                  开始训练 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-[16px] flex flex-col items-center shadow-sm">
                <span className="text-[#00BFA5] font-black text-2xl mb-1">{streakCount}</span>
                <span className="text-[#78909C] text-xs font-medium">连续打卡</span>
              </div>
              <div className="bg-white p-4 rounded-[16px] flex flex-col items-center shadow-sm">
                <span className="text-[#263238] font-black text-2xl mb-1">{todayProgress}</span>
                <span className="text-[#78909C] text-xs font-medium">今日听写</span>
              </div>
              <div className="bg-white p-4 rounded-[16px] flex flex-col items-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={viewStats}>
                <span className="text-[#263238] font-black text-2xl mb-1">A2</span>
                <span className="text-[#78909C] text-xs font-medium">能力预估</span>
              </div>
            </div>

            {/* Review Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              
              {/* Card 1: 核心听力 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setShowListeningModal(true)}>
                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#4caf50] flex items-center justify-center mb-4">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">核心听力</h3>
                <p className="text-[13px] text-[#78909C]">场景实战与单句靶向修复</p>
              </div>

              {/* Card 2: 场景口语 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/chat')}>
                <div className="w-16 h-16 rounded-full bg-[#e3f2fd] text-[#2196f3] flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">场景口语</h3>
                <p className="text-[13px] text-[#78909C]">AI 语境沉浸式对话陪练</p>
              </div>

              {/* Card 3: 词汇特训 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/vocab')}>
                <div className="w-16 h-16 rounded-full bg-[#fff3e0] text-[#ff9800] flex items-center justify-center mb-4">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">词汇特训</h3>
                <p className="text-[13px] text-[#78909C]">词汇量精确评估与突破</p>
              </div>

              {/* Card 4: 定制练习 */}
              <div className="bg-white p-6 rounded-[20px] flex flex-col items-center text-center shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/custom')}>
                <div className="w-16 h-16 rounded-full bg-[#f3e5f5] text-[#9c27b0] flex items-center justify-center mb-4">
                  <Wand2 className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-bold text-[#263238] mb-2">定制练习</h3>
                <p className="text-[13px] text-[#78909C]">自定义素材的高级听写</p>
              </div>
              
            </div>
          </div>

          {/* Bottom Nav */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white h-[60px] flex justify-around items-center border-t border-[#ECEFF1] pb-safe z-50">
             <div className="flex flex-col items-center justify-center text-[#00BFA5] w-full h-full cursor-pointer">
                <BookOpen className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">学习</span>
             </div>
             <div className="flex flex-col items-center justify-center text-[#78909C] w-full h-full cursor-pointer" onClick={fetchLeaderboard}>
                <Crown className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">排行榜</span>
             </div>
             <div className="flex flex-col items-center justify-center text-[#78909C] w-full h-full cursor-pointer" onClick={viewStats}>
                <BarChart3 className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">战绩</span>
             </div>
             <div className="flex flex-col items-center justify-center text-[#78909C] w-full h-full cursor-pointer" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
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
    print("Success forcing the mandarin listen layout")
else:
    print("Failed to find start/end indices")

if 'BarChart3' not in content:
    content = content.replace('Star, Crown, Globe, User', 'Star, Crown, Globe, User, BarChart3, Home')
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
