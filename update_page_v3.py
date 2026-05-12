import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Define the new content
new_content = """              {/* 职业方向选择器 (Global Dashboard) */}
              <div className="px-2 mt-6 mb-8">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Compass className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">选择你的职业语境 (四级词汇核心)</span>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto hide-scrollbar">
                  <button onClick={() => handleDomainChange('navigation')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${domain === 'navigation' ? 'bg-white text-[#0096FF] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Ship className="w-5 h-5" />
                    航海情境
                  </button>
                  <button onClick={() => handleDomainChange('engineering')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${domain === 'engineering' ? 'bg-white text-[#FF9600] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Settings className="w-5 h-5" />
                    轮机情境
                  </button>
                  <button onClick={() => handleDomainChange('general')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${domain === 'general' ? 'bg-white text-[#58cc02] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Coffee className="w-5 h-5" />
                    日常/通用
                  </button>
                </div>
              </div>

              {/* 顶部动态 CTA 按钮 (AI Dispatcher) */}
              <div className="px-2 mt-6 mb-8">
                <DuoBtn 
                  variant="primary" 
                  className={`w-full !py-4 text-lg ${ctaConfig.colorClass}`}
                  onClick={ctaConfig.action}
                >
                  {ctaConfig.label}
                </DuoBtn>
              </div>
            </div>

            {/* Dual Column Layout: Listening Loop vs Speaking & Tools */}
            <div className="grid lg:grid-cols-2 gap-8 items-start pb-20">
              
              {/* Left Column: 听力闭环 (试错与修复) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Headphones className="w-8 h-8 text-[#1cb0f6]" />
                  <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">听力闭环 (试错与修复)</h2>
                </div>

                {/* 高阶试错：场景听力实战 Card */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border-[#1cb0f6] border-b-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6] shrink-0">
                          <Headphones className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-extrabold text-slate-700">场景听力实战</h2>
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">高阶试错</span>
                          </div>
                          <p className="text-slate-400 font-bold text-sm">在复杂语境中进行听力挑战，暴露真实盲区</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Domain Specific Description */}
                    <div className="bg-[#1cb0f6]/5 p-4 rounded-2xl border-2 border-[#1cb0f6]/20 mb-4">
                      {domain === 'navigation' && <p className="text-[#1cb0f6] font-bold text-sm">⚓️ <b>航海情境</b>：包含港口交管、船舶避碰等听力材料，核心测试四级通用词汇。</p>}
                      {domain === 'engineering' && <p className="text-[#1cb0f6] font-bold text-sm">⚙️ <b>轮机情境</b>：包含设备检查、机舱排障等听力材料，核心测试四级通用词汇。</p>}
                      {domain === 'general' && <p className="text-[#1cb0f6] font-bold text-sm">☕️ <b>日常情境</b>：包含校园生活、求职面试等听力材料，核心测试四级通用词汇。</p>}
                    </div>
                    
                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setTestSubMode('random'); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'random' ? 'bg-white text-[#1cb0f6] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        基础模式 (有提示)
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setTestSubMode('exam'); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'exam' ? 'bg-white text-[#1cb0f6] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        挑战模式 (无提示)
                      </button>
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      {testSubMode === 'random' ? (
                        <>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('easy')}>
                            <span className="text-slate-700 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500" /> 简单 (慢速/词汇简单)</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('medium')}>
                            <span className="text-slate-700 flex items-center gap-2"><Swords className="w-5 h-5 text-amber-500" /> 中等 (常速/连读弱读)</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('hard')}>
                            <span className="text-slate-700 flex items-center gap-2"><Flame className="w-5 h-5 text-rose-500" /> 困难 (长难句/复杂语境)</span>
                          </DuoBtn>
                        </>
                      ) : (
                        <>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'easy')}>
                            <span className="text-slate-700 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500" /> 简单 (无提示盲听)</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'medium')}>
                            <span className="text-slate-700 flex items-center gap-2"><Swords className="w-5 h-5 text-amber-500" /> 中等 (无提示盲听)</span>
                          </DuoBtn>
                          <DuoBtn variant="outline" className="w-full justify-between" onClick={() => startSession('test', 'hard')}>
                            <span className="text-slate-700 flex items-center gap-2"><Flame className="w-5 h-5 text-rose-500" /> 困难 (无提示盲听)</span>
                          </DuoBtn>
                        </>
                      )}
                    </div>
                  </div>
                </DuoCard>
                
                {/* 低阶修复：单句听写特训 Card */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border-[#ff9600] border-b-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#ff9600] rounded-2xl flex items-center justify-center border-b-4 border-[#e58700] shrink-0">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-2xl font-extrabold text-slate-700">单句听写特训</h2>
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">查漏补缺</span>
                        </div>
                        <p className="text-slate-400 font-bold text-sm">基于AI提取的错题盲区，进行靶向听写修复</p>
                      </div>
                    </div>
                    
                    <DuoBtn variant="primary" className="w-full mt-auto !bg-[#ff9600] hover:!bg-[#e58700] !border-b-[#e58700] justify-center gap-2" onClick={testSubMode === 'random' ? startReviewSession : startTestReviewSession}>
                      <span><Target className="w-5 h-5 inline" /> AI 错题听写包</span>
                    </DuoBtn>
                  </div>
                </DuoCard>

                {/* 阶段验收：历年真题模考 Card */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border-[#ce82ff] border-b-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#ce82ff] rounded-2xl flex items-center justify-center border-b-4 border-[#a567cc] shrink-0">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">历年真题模考</h2>
                        <p className="text-slate-400 font-bold text-sm">褪去职业外壳，直击过去两年考场原题</p>
                      </div>
                    </div>
                    <DuoBtn variant="primary" className="w-full mt-auto !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={() => router.push('/exam')}>
                      进入全真题库
                    </DuoBtn>
                  </div>
                </DuoCard>
              </div>

              {/* Right Column: 口语实战 & 数据探索 */}
              <div className="space-y-10">
                
                {/* 口语实战 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <Mic className="w-8 h-8 text-[#58cc02]" />
                    <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">口语实战与工具</h2>
                  </div>
                  
                  <DuoCard className="cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm transition-all duration-200 border-[#58cc02] border-b-4" onClick={() => router.push(`/chat?domain=${domain}`)}>
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[#58cc02] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302] shrink-0">
                          <Mic className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-700">AI 语境口语陪练</h2>
                          <p className="text-slate-400 font-bold mt-1 text-sm">在职业/日常对话中练习四级词汇输出</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">职场交流</span>
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">日常沟通</span>
                          <span className="bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl">模拟面试</span>
                        </div>
                      </div>
                      
                      <DuoBtn variant="primary" className="w-full justify-center gap-2 !bg-[#58cc02] hover:!bg-[#46a302] !border-b-[#46a302]">
                        <span>开始口语交流</span>
                      </DuoBtn>
                    </div>
                  </DuoCard>
                </div>

                {/* 数据探索与工具 */}
                <div className="space-y-6">
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

                    <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={() => router.push('/custom')}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ff4b4b] rounded-2xl flex items-center justify-center border-b-4 border-[#ea2b2b] shrink-0">
                          <Wand2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-700">自定义听写</h2>
                          <p className="text-slate-400 font-bold mt-0.5 text-xs">AI生成或导入专属素材</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300" />
                    </DuoCard>

                    <div className="grid grid-cols-2 gap-4">
                      <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={viewStats}>
                        <div className="w-12 h-12 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6] mb-2">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-extrabold text-slate-700 text-sm">战绩分析</h2>
                      </DuoCard>

                      <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all !p-4" onClick={fetchLeaderboard}>
                        <div className="w-12 h-12 bg-[#ffc800] rounded-2xl flex items-center justify-center border-b-4 border-[#e5b400] mb-2">
                          <Medal className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-extrabold text-slate-700 text-sm">排行榜</h2>
                      </DuoCard>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
"""

start_str = "              {/* 职业方向选择器 */}"
end_str = "  // Render Stats"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + new_content + "\n" + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(updated_content)
    print("Success")
else:
    print("Failed to find start or end string")
    print("Start index:", start_idx)
    print("End index:", end_idx)
