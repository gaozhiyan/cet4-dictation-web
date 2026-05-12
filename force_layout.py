import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

start_str = "        <div className=\"max-w-5xl mx-auto\">"
end_str = "        {/* 听力 Hub Modal */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_layout = """        <div className="max-w-5xl mx-auto pb-24">
          
          {/* 流利说风格：绿色头部 & AI 气泡 */}
          <div className="bg-[#4cd964] pt-12 pb-24 px-4 sm:px-8 rounded-b-[2.5rem] relative shadow-inner">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-extrabold text-white tracking-widest">学习</h1>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={openVanityCard}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-white" />
                </button>
              </div>
            </header>

            {/* AI 气泡对话框 */}
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={ctaConfig.action}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg relative shrink-0 z-10">
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-20"></div>
                <span className="text-2xl">🤖</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-white/30 relative flex-1 flex items-center justify-between">
                <span className="text-white font-bold text-sm sm:text-base leading-tight">
                  {ctaConfig.label.replace('🎯 ', '').replace('🎧 ', '').replace('开始', '开启')}
                </span>
                <ChevronRight className="w-5 h-5 text-white/70" />
              </div>
            </div>
          </div>

          {/* 悬浮数据看板 (Overlapping Dashboard) */}
          <div className="px-4 sm:px-8 -mt-16 relative z-20">
            <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-6 flex items-center justify-between border border-slate-50">
              
              <div className="flex-1 flex flex-col items-center">
                <div className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1">今日任务 <ChevronRight className="w-3 h-3" /></div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800">{todayProgress >= 20 ? 3 : Math.floor(todayProgress/7)}</span>
                  <span className="text-sm font-bold text-slate-400">/ 3 个</span>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-100 mx-2"></div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1">今日听写 <div className="w-2 h-2 rounded-full bg-[#4cd964]/20 border border-[#4cd964]"></div></div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800">{todayProgress}</span>
                  <span className="text-sm font-bold text-slate-400">/ 20 句</span>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-100 mx-2"></div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1">学习日历 <ChevronRight className="w-3 h-3" /></div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800">{streakCount}</span>
                  <span className="text-sm font-bold text-slate-400">天签到</span>
                </div>
              </div>

            </div>
          </div>

          {/* 横向滚动主内容区 */}
          <div className="mt-8 space-y-10">
            
            {/* 核心主线课 (精品课) */}
            <section>
              <div className="flex justify-between items-center px-4 sm:px-8 mb-4">
                <h2 className="text-xl font-black text-slate-800">精品核心课</h2>
                <span className="text-sm font-bold text-slate-400 flex items-center">已完成 <ChevronRight className="w-4 h-4" /></span>
              </div>
              
              <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8 gap-4 pb-4 snap-x">
                {/* 听力实战卡片 */}
                <div 
                  onClick={() => setShowListeningModal(true)}
                  className="snap-start shrink-0 w-72 sm:w-80 h-48 rounded-[2rem] bg-gradient-to-br from-[#4cd964] to-[#00b09b] p-6 flex flex-col relative overflow-hidden cursor-pointer shadow-lg shadow-green-500/20 transition-transform active:scale-95"
                >
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                  <div className="bg-black/20 text-white/90 text-xs font-bold px-3 py-1 rounded-full w-max mb-auto backdrop-blur-md">精品课</div>
                  
                  <div className="flex justify-center items-center absolute inset-0 pointer-events-none opacity-30">
                    <Headphones className="w-32 h-32 text-white" strokeWidth={1} />
                  </div>

                  <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-2 text-white/90 text-xs font-bold mb-2">
                      <Clock className="w-4 h-4" /> 今日任务: {todayProgress}/20 句
                    </div>
                    <h3 className="text-white text-xl font-black">听力实战系统课</h3>
                  </div>
                  
                  <div className="absolute top-6 right-6 bg-black/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    去体验
                  </div>
                </div>

                {/* 场景口语卡片 */}
                <div 
                  onClick={() => router.push('/chat')}
                  className="snap-start shrink-0 w-72 sm:w-80 h-48 rounded-[2rem] bg-gradient-to-br from-[#5e5ce6] to-[#9b51e0] p-6 flex flex-col relative overflow-hidden cursor-pointer shadow-lg shadow-purple-500/20 transition-transform active:scale-95"
                >
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                  <div className="bg-black/20 text-white/90 text-xs font-bold px-3 py-1 rounded-full w-max mb-auto backdrop-blur-md">精品课</div>
                  
                  <div className="flex justify-center items-center absolute inset-0 pointer-events-none opacity-30">
                    <Mic className="w-32 h-32 text-white" strokeWidth={1} />
                  </div>

                  <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-2 text-white/90 text-xs font-bold mb-2">
                      <Star className="w-4 h-4" /> 随时开口说
                    </div>
                    <h3 className="text-white text-xl font-black">AI 语境口语陪练</h3>
                  </div>
                </div>
              </div>
            </section>

            {/* 专项提升 (轻松学) */}
            <section>
              <div className="flex justify-between items-center px-4 sm:px-8 mb-4">
                <h2 className="text-xl font-black text-slate-800">专项轻松学</h2>
                <span className="text-sm font-bold text-slate-400 flex items-center">更多 <ChevronRight className="w-4 h-4" /></span>
              </div>
              
              <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8 gap-4 pb-4 snap-x">
                {/* 词汇评估 */}
                <div onClick={() => router.push('/vocab')} className="snap-start shrink-0 w-36 cursor-pointer group">
                  <div className="w-full h-48 rounded-[1.5rem] bg-gradient-to-br from-orange-100 to-orange-200 mb-3 relative overflow-hidden flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <BrainCircuit className="w-16 h-16 text-orange-500 opacity-80" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-black/20"></div>
                      <span className="text-white text-[10px] font-bold drop-shadow-md">未开始</span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-700 text-sm">词汇量精确评估</h4>
                  <p className="text-slate-400 text-xs font-bold mt-0.5">零基础</p>
                </div>

                {/* 自定义听写 */}
                <div onClick={() => router.push('/custom')} className="snap-start shrink-0 w-36 cursor-pointer group">
                  <div className="w-full h-48 rounded-[1.5rem] bg-gradient-to-br from-pink-100 to-rose-200 mb-3 relative overflow-hidden flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <Wand2 className="w-16 h-16 text-rose-500 opacity-80" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-black/20"></div>
                      <span className="text-white text-[10px] font-bold drop-shadow-md">未开始</span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-700 text-sm">自定义素材听写</h4>
                  <p className="text-slate-400 text-xs font-bold mt-0.5">进阶训练</p>
                </div>

                {/* 历年真题 */}
                <div onClick={() => router.push('/exam')} className="snap-start shrink-0 w-36 cursor-pointer group">
                  <div className="w-full h-48 rounded-[1.5rem] bg-gradient-to-br from-purple-100 to-indigo-200 mb-3 relative overflow-hidden flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <GraduationCap className="w-16 h-16 text-indigo-500 opacity-80" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-black/20"></div>
                      <span className="text-white text-[10px] font-bold drop-shadow-md">未开始</span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-700 text-sm">历届考场真题</h4>
                  <p className="text-slate-400 text-xs font-bold mt-0.5">冲刺模考</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 底部固定导航栏 (Bottom Navigation Bar) */}
        <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe pt-2 px-6 flex justify-between items-center z-40">
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <BookOpen className="w-6 h-6 text-[#4cd964]" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-[#4cd964]">学习</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={fetchLeaderboard}>
            <Crown className="w-6 h-6 text-slate-800" strokeWidth={2} />
            <span className="text-[10px] font-bold text-slate-800">排行榜</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={viewStats}>
            <Globe className="w-6 h-6 text-slate-800" strokeWidth={2} />
            <span className="text-[10px] font-bold text-slate-800">数据发现</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
            <User className="w-6 h-6 text-slate-800" strokeWidth={2} />
            <span className="text-[10px] font-bold text-slate-800">我的</span>
          </div>
        </nav>

"""

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + new_layout + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(updated_content)
    print("Success forcing the exact layout")
else:
    print("Failed to find start/end indices")

if 'Clock,' not in content:
    content = content.replace('X, Zap', 'X, Zap, Clock, Star, Crown, Globe, User')
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
