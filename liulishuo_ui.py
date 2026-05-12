import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update Title
content = content.replace('CET-4 听力专项训练', 'CET-4 智能听口教练')

# 2. Update Hero Section
start_str = "              {/* 紧凑的个人看板 Dashboard */}"
end_str = "            {/* Entry Grid: Clean App Style */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_hero = """              {/* 英语流利说风格 Hero Card (智能调度中心) */}
              {user && (
                <div className="px-2 mt-2 mb-10">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border-4 border-slate-800/50">
                    {/* Decorative background glow */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#58cc02] rounded-full blur-[80px] opacity-20"></div>
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#1cb0f6] rounded-full blur-[80px] opacity-20"></div>

                    {/* 新手空状态覆盖层 */}
                    {streakCount === 0 && todayProgress === 0 && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex items-center justify-center p-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-6xl mb-4 animate-bounce">🚀</div>
                          <div className="font-extrabold text-white text-2xl mb-2 tracking-wide">开启四级听口突破之旅</div>
                          <div className="text-sm font-bold text-slate-300 max-w-xs">你的 AI 英语私教已就绪，将为你动态生成专属学习流。</div>
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center">
                      {/* Top Stats */}
                      <div className="w-full flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                          <Flame className="w-5 h-5 text-[#ffc800]" />
                          <span className="font-extrabold text-white text-lg">{streakCount} <span className="text-xs text-slate-300 font-bold">天连胜</span></span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                          <Target className="w-5 h-5 text-[#1cb0f6]" />
                          <span className="font-extrabold text-white text-lg">A2 <span className="text-xs text-slate-300 font-bold">听口预估</span></span>
                        </div>
                      </div>

                      {/* Central Progress Ring & CTA */}
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-10">
                        {/* SVG Ring */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                          <circle 
                            cx="100" cy="100" r="80" 
                            stroke={ctaConfig.colorClass.includes('ff9600') ? '#ff9600' : '#58cc02'} 
                            strokeWidth="16" 
                            fill="transparent" 
                            strokeDasharray="502.65"
                            strokeDashoffset={502.65 - (502.65 * Math.min(100, (todayProgress / 20) * 100)) / 100} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="text-slate-400 font-bold text-xs mb-1 uppercase tracking-widest">今日专属学习流</div>
                          <div className="text-5xl sm:text-6xl font-black text-white mb-1 tracking-tighter">
                            {todayProgress}<span className="text-2xl text-slate-500 font-bold">/20</span>
                          </div>
                          <div className="text-[#58cc02] font-bold text-sm">Items Completed</div>
                        </div>
                      </div>

                      {/* The Big Action Button */}
                      <button 
                        onClick={ctaConfig.action}
                        className={`w-full sm:w-4/5 py-4 sm:py-5 rounded-2xl font-extrabold text-xl transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-2 ${
                          ctaConfig.colorClass.includes('ff9600') 
                            ? 'bg-gradient-to-r from-[#ff9600] to-[#ff4b4b] text-white hover:from-[#e58700] hover:to-[#ea2b2b]' 
                            : 'bg-gradient-to-r from-[#58cc02] to-[#1cb0f6] text-white hover:from-[#46a302] hover:to-[#1899d6]'
                        }`}
                      >
                        {ctaConfig.label}
                        <ChevronRight className="w-7 h-7" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            """

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + new_hero + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(updated_content)
    print("Success")
else:
    print("Failed")
