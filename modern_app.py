import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update texts to remove CET-4
content = content.replace('CET-4 智能听口教练', 'AI 智能英语教练')
content = content.replace('开启四级听口突破之旅', '开启智能英语突破之旅')
content = content.replace('听口预估', '能力预估')

# 2. Add listening modal state
if 'const [isReviewSession, setIsReviewSession] = useState(false)' in content:
    content = content.replace(
        'const [isReviewSession, setIsReviewSession] = useState(false)',
        'const [isReviewSession, setIsReviewSession] = useState(false)\n  const [showListeningModal, setShowListeningModal] = useState(false)'
    )

# 3. Replace the Entry Grid with 2x2 Hub + List
start_str = "            {/* Entry Grid: Clean App Style */}"
end_str = "  // Render Stats"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_grid = """            {/* Primary Navigation Grid (四大金刚区) */}
            <div className="grid grid-cols-2 gap-4 px-2 max-w-4xl mx-auto mb-8">
              <DuoCard 
                className="cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all !p-5 border-b-4 border-slate-200"
                onClick={() => setShowListeningModal(true)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <Headphones className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-700 text-lg mb-1">核心听力</h3>
                  <p className="text-slate-400 font-bold text-xs">实战与听写训练</p>
                </div>
              </DuoCard>

              <DuoCard 
                className="cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all !p-5 border-b-4 border-slate-200"
                onClick={() => router.push('/chat')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <Mic className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-700 text-lg mb-1">场景口语</h3>
                  <p className="text-slate-400 font-bold text-xs">AI 对话陪练</p>
                </div>
              </DuoCard>

              <DuoCard 
                className="cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all !p-5 border-b-4 border-slate-200"
                onClick={() => router.push('/vocab')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                    <BrainCircuit className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-700 text-lg mb-1">词汇特训</h3>
                  <p className="text-slate-400 font-bold text-xs">词汇量评估与突破</p>
                </div>
              </DuoCard>

              <DuoCard 
                className="cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all !p-5 border-b-4 border-slate-200"
                onClick={() => router.push('/custom')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                    <Wand2 className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-700 text-lg mb-1">定制练习</h3>
                  <p className="text-slate-400 font-bold text-xs">自定义内容听写</p>
                </div>
              </DuoCard>
            </div>

            {/* Secondary List (数据与设置) */}
            <div className="max-w-4xl mx-auto px-2 pb-20 space-y-3">
              <DuoCard 
                className="cursor-pointer hover:bg-slate-50 transition-colors !p-4 flex items-center justify-between border-b-4 border-slate-200"
                onClick={fetchLeaderboard}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Medal className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="font-extrabold text-slate-700 text-lg">英雄榜单</span>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300" />
              </DuoCard>

              <DuoCard 
                className="cursor-pointer hover:bg-slate-50 transition-colors !p-4 flex items-center justify-between border-b-4 border-slate-200"
                onClick={viewStats}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="font-extrabold text-slate-700 text-lg">我的战绩</span>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300" />
              </DuoCard>
            </div>
          </div>
        </div>

        {/* 听力 Hub Modal */}
        {showListeningModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Headphones className="w-6 h-6 text-blue-500" />
                  核心听力
                </h3>
                <button 
                  onClick={() => setShowListeningModal(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <DuoCard className="cursor-pointer hover:border-blue-400 transition-colors !p-4 flex items-center gap-4" onClick={() => { setShowListeningModal(false); setTestSubMode('random'); }}>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-slate-700">场景听力实战</h4>
                    <p className="text-xs font-bold text-slate-400">综合语境盲听挑战</p>
                  </div>
                  {testSubMode === 'random' ? <ChevronDown className="w-5 h-5 text-blue-500" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
                </DuoCard>
                
                {testSubMode === 'random' && (
                  <div className="pl-16 pr-2 pb-2 grid grid-cols-3 gap-2">
                    <DuoBtn variant="outline" className="!py-2 !px-0 text-sm" onClick={() => { setShowListeningModal(false); handlePracticeClick('easy'); }}>简单</DuoBtn>
                    <DuoBtn variant="outline" className="!py-2 !px-0 text-sm" onClick={() => { setShowListeningModal(false); handlePracticeClick('medium'); }}>中等</DuoBtn>
                    <DuoBtn variant="outline" className="!py-2 !px-0 text-sm" onClick={() => { setShowListeningModal(false); handlePracticeClick('hard'); }}>困难</DuoBtn>
                  </div>
                )}

                <DuoCard className="cursor-pointer hover:border-orange-400 transition-colors !p-4 flex items-center gap-4" onClick={() => { setShowListeningModal(false); startReviewSession(); }}>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-slate-700">错题听写修复</h4>
                    <p className="text-xs font-bold text-slate-400">针对实战盲区靶向训练</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </DuoCard>

                <DuoCard className="cursor-pointer hover:border-purple-400 transition-colors !p-4 flex items-center gap-4" onClick={() => { setShowListeningModal(false); router.push('/exam'); }}>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-slate-700">综合全真模考</h4>
                    <p className="text-xs font-bold text-slate-400">历年考场原音重现</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </DuoCard>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
"""

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + new_grid + "\n" + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(updated_content)
    print("Success replacing grid")
else:
    print("Failed replacing grid")

# 4. We also need to make sure we imported Zap, ChevronDown
if 'Zap,' not in content:
    content = content.replace('X,', 'X, Zap, ChevronDown,')
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
