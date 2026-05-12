import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Change max-w-3xl to max-w-5xl for the main container
content = content.replace('<div className="max-w-3xl mx-auto">', '<div className="max-w-5xl mx-auto">')

# 2. Add max-w-3xl mx-auto to the dashboard/CTA container
content = content.replace('<div className="space-y-4">', '<div className="space-y-4 max-w-3xl mx-auto">')

# 3. Replace everything from {/* 核心训练 Section */} to the end of the menu
# We need to find the start of the sections and the end of the menu div.
# Find `            {/* 核心训练 Section */}`
start_idx = content.find('            {/* 核心训练 Section */}')

# Find `      </div>\n    )\n  }\n\n  // Render Stats`
end_idx = content.find('          </div>\n        </div>\n      </div>\n    )\n  }')
if end_idx == -1:
    end_idx = content.find('        </div>\n      </div>\n    )\n  }\n\n  // Render Stats')

if start_idx != -1 and end_idx != -1:
    old_sections = content[start_idx:end_idx]
    
    new_sections = """            {/* Dual Mainline Layout */}
            <div className="grid lg:grid-cols-2 gap-8 items-start pb-20">
              {/* Left Column: 听力训练 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Headphones className="w-8 h-8 text-[#1cb0f6]" />
                  <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">听力训练</h2>
                </div>
                
                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6] shrink-0">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">碎片闯关</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm">3-5 分钟单句/小段落听写</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('easy')}>
                        <span className="text-slate-700">🌱 轻松起步 (简单)</span>
                      </DuoBtn>
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('medium')}>
                        <span className="text-slate-700">⚔️ 进阶试炼 (中等)</span>
                      </DuoBtn>
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('hard')}>
                        <span className="text-slate-700">🔥 极限挑战 (困难)</span>
                      </DuoBtn>
                      <div className="pt-3 mt-3 border-t-2 border-slate-100">
                        <DuoBtn variant="primary" className="w-full justify-center gap-2" onClick={startReviewSession}>
                          <Flame className="w-5 h-5 fill-current text-white" />
                          <span>👾 暴打错题 (Boss关)</span>
                        </DuoBtn>
                      </div>
                    </div>
                  </div>
                </DuoCard>

                <DuoCard id="mock-test-card" className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#ce82ff] rounded-2xl flex items-center justify-center border-b-4 border-[#a567cc] shrink-0">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">全真模考</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm">30-40 分钟沉浸式测试</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTestSubMode('random');
                        }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'random' ? 'bg-white text-[#ce82ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        随机组卷
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTestSubMode('exam');
                        }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'exam' ? 'bg-white text-[#ce82ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        历年真题
                      </button>
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      {testSubMode === 'random' ? (
                        <>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'easy')}>
                            <span className="text-slate-700">简单 (Easy)</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'medium')}>
                            <span className="text-slate-700">中等 (Medium)</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'hard')}>
                            <span className="text-slate-700">困难 (Hard)</span>
                          </DuoBtn>
                          <div className="pt-3 mt-3 border-t-2 border-slate-100">
                            <DuoBtn variant="primary" className="w-full justify-center gap-2 !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={startTestReviewSession}>
                              <Flame className="w-5 h-5 fill-current text-white" />
                              <span>错题重练 (Boss关)</span>
                            </DuoBtn>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                          <Headphones className="w-12 h-12 text-[#ce82ff] opacity-50" />
                          <p className="text-slate-500 font-bold text-sm">进入全套历年听力真题库，支持考场原音重现与逐句解析。</p>
                          <DuoBtn variant="primary" className="w-full mt-2 !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={() => router.push('/exam')}>
                            前往真题库
                          </DuoBtn>
                        </div>
                      )}
                    </div>
                  </div>
                </DuoCard>
                
                <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all" onClick={() => router.push('/custom')}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#ff4b4b] rounded-2xl flex items-center justify-center border-b-4 border-[#ea2b2b] shrink-0">
                      <Wand2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-700">自定义听写</h2>
                      <p className="text-slate-400 font-bold mt-1 text-xs">AI 自动生成或导入个人素材</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </DuoCard>
              </div>

              {/* Right Column: 口语实战 & 数据探索 */}
              <div className="space-y-10">
                
                {/* 口语实战 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <Mic className="w-8 h-8 text-[#58cc02]" />
                    <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">口语实战</h2>
                  </div>
                  
                  <DuoCard className="cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm transition-all duration-200" onClick={() => router.push('/chat')}>
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[#58cc02] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302] shrink-0">
                          <Mic className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-700">场景口语模拟</h2>
                          <p className="text-slate-400 font-bold mt-1 text-sm">与 AI 陪练真实交流对话</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">职场交流</span>
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">日常沟通</span>
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">模拟面试</span>
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">考研复试</span>
                        </div>
                      </div>
                      
                      <DuoBtn variant="primary" className="w-full justify-center gap-2 !bg-[#58cc02] hover:!bg-[#46a302] !border-b-[#46a302]">
                        <span>开始口语实战</span>
                      </DuoBtn>
                    </div>
                  </DuoCard>
                </div>

                {/* 数据探索 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <BarChart3 className="w-8 h-8 text-[#ffc800]" />
                    <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">探索与工具</h2>
                  </div>
                  
                  <div className="grid gap-4">
                    <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={() => router.push('/vocab')}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ff9600] rounded-2xl flex items-center justify-center border-b-4 border-[#e58700] shrink-0">
                          <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-700">词汇水平评估</h2>
                          <p className="text-slate-400 font-bold mt-0.5 text-xs">5分钟定位词汇量</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300" />
                    </DuoCard>

                    <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={viewStats}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ffc800] rounded-2xl flex items-center justify-center border-b-4 border-[#e5b400] shrink-0">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-700">我的战绩</h2>
                          <p className="text-slate-400 font-bold mt-0.5 text-xs">查看历史得分与统计</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300" />
                    </DuoCard>

                    <div className="grid grid-cols-2 gap-4">
                      <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={fetchLeaderboard}>
                        <div className="w-12 h-12 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6] mb-2">
                          <Medal className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-extrabold text-slate-700 text-sm">排行榜</h2>
                      </DuoCard>

                      <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={openVanityCard}>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#58cc02] to-[#46a302] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302] mb-2">
                          <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-extrabold text-slate-700 text-sm">分享海报</h2>
                      </DuoCard>
                    </div>
                  </div>
                </div>
              </div>
"""
    content = content[:start_idx] + new_sections + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced sections successfully")
else:
    print("Failed to find boundaries", start_idx, end_idx)
