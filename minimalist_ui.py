import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Define the new content
new_content = """              {/* 顶部动态 CTA 按钮 (AI Dispatcher) */}
              <div className="px-2 mt-6 mb-8">
                <DuoBtn 
                  variant="primary" 
                  className={`w-full !py-4 text-lg shadow-sm ${ctaConfig.colorClass}`}
                  onClick={ctaConfig.action}
                >
                  {ctaConfig.label}
                </DuoBtn>
              </div>
            </div>

            {/* Entry Grid: Clean App Style */}
            <div className="grid md:grid-cols-2 gap-4 pb-20 max-w-4xl mx-auto">
              
              {/* 听力专区 */}
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-700 tracking-wider px-2 flex items-center gap-2">
                  <Headphones className="w-6 h-6 text-[#1cb0f6]" /> 听力专区
                </h2>
                
                {/* 通用听力实战 */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer !p-4" onClick={() => setTestSubMode('random')}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6] shrink-0">
                      <Headphones className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-700 text-lg">通用听力实战</h3>
                      <p className="text-slate-400 font-bold text-xs mt-0.5">全真语境，包含校园与职场材料</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                  
                  {/* Action buttons appear below when clicked/active */}
                  {testSubMode === 'random' && (
                    <div className="mt-4 pt-4 border-t-2 border-slate-100 grid grid-cols-3 gap-2">
                      <DuoBtn variant="outline" className="!px-2 !py-2 text-sm" onClick={(e: any) => { e.stopPropagation(); handlePracticeClick('easy'); }}>简单</DuoBtn>
                      <DuoBtn variant="outline" className="!px-2 !py-2 text-sm" onClick={(e: any) => { e.stopPropagation(); handlePracticeClick('medium'); }}>中等</DuoBtn>
                      <DuoBtn variant="outline" className="!px-2 !py-2 text-sm" onClick={(e: any) => { e.stopPropagation(); handlePracticeClick('hard'); }}>困难</DuoBtn>
                    </div>
                  )}
                </DuoCard>

                {/* 错题听写 */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer !p-4" onClick={startReviewSession}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#ff9600] rounded-2xl flex items-center justify-center border-b-4 border-[#e58700] shrink-0">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-700 text-lg">单句听写特训</h3>
                      <p className="text-slate-400 font-bold text-xs mt-0.5">基于实战错题的靶向修复</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </DuoCard>

                {/* 历年真题 */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer !p-4" onClick={() => router.push('/exam')}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#ce82ff] rounded-2xl flex items-center justify-center border-b-4 border-[#a567cc] shrink-0">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-700 text-lg">历年真题模考</h3>
                      <p className="text-slate-400 font-bold text-xs mt-0.5">近两年考场原音重现</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </DuoCard>
              </div>

              {/* 口语与工具区 */}
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-700 tracking-wider px-2 flex items-center gap-2 mt-4 md:mt-0">
                  <Mic className="w-6 h-6 text-[#58cc02]" /> 口语与工具
                </h2>

                {/* AI 口语陪练 */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer !p-4" onClick={() => router.push('/chat')}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#58cc02] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302] shrink-0">
                      <Mic className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-700 text-lg">AI 语境口语陪练</h3>
                      <p className="text-slate-400 font-bold text-xs mt-0.5">职场交流、日常沟通、模拟面试</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </DuoCard>

                {/* 工具聚合 */}
                <div className="grid grid-cols-2 gap-4">
                  <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-sm transition-all !p-4" onClick={() => router.push('/vocab')}>
                    <div className="w-12 h-12 bg-[#ff9600]/10 rounded-2xl flex items-center justify-center mb-2">
                      <BrainCircuit className="w-6 h-6 text-[#ff9600]" />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-sm">词汇评估</h3>
                  </DuoCard>

                  <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-sm transition-all !p-4" onClick={() => router.push('/custom')}>
                    <div className="w-12 h-12 bg-[#ff4b4b]/10 rounded-2xl flex items-center justify-center mb-2">
                      <Wand2 className="w-6 h-6 text-[#ff4b4b]" />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-sm">自定义听写</h3>
                  </DuoCard>

                  <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-sm transition-all !p-4" onClick={viewStats}>
                    <div className="w-12 h-12 bg-[#1cb0f6]/10 rounded-2xl flex items-center justify-center mb-2">
                      <BarChart3 className="w-6 h-6 text-[#1cb0f6]" />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-sm">战绩分析</h3>
                  </DuoCard>

                  <DuoCard className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-sm transition-all !p-4" onClick={fetchLeaderboard}>
                    <div className="w-12 h-12 bg-[#ffc800]/10 rounded-2xl flex items-center justify-center mb-2">
                      <Medal className="w-6 h-6 text-[#ffc800]" />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-sm">英雄榜</h3>
                  </DuoCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
"""

start_str = "              {/* 顶部动态 CTA 按钮 (AI Dispatcher) */}"
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
