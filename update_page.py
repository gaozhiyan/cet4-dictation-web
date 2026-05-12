import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Define the new content
new_content = """              {/* 职业方向选择器 */}
              <div className="px-2 mt-6 mb-8">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto hide-scrollbar">
                  <button onClick={() => handleDomainChange('navigation')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${domain === 'navigation' ? 'bg-white text-[#0096FF] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Ship className="w-5 h-5" />
                    航海技术
                  </button>
                  <button onClick={() => handleDomainChange('engineering')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${domain === 'engineering' ? 'bg-white text-[#FF9600] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Settings className="w-5 h-5" />
                    轮机工程
                  </button>
                  <button onClick={() => handleDomainChange('general')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all ${domain === 'general' ? 'bg-white text-[#58cc02] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Compass className="w-5 h-5" />
                    通用英语
                  </button>
                </div>
              </div>
            </div>

            {/* Single Column Waterfall Layout (The Path) */}
            {(() => {
              const domainContent = {
                general: {
                  color: '#58cc02', colorClass: 'text-[#58cc02]', bgClass: 'bg-[#58cc02]', borderClass: 'border-[#58cc02]', hoverBorderClass: 'hover:border-[#58cc02]', hoverTextClass: 'group-hover:text-[#58cc02]',
                  dictationDesc: '基于你的词汇量，AI每日推送适合难度的听力盲区',
                  roleplayTitle: '日常沟通与通用面试', roleplayDesc: '全真语境模拟，暴露真实听口弱点',
                  roleplayAction: () => router.push('/chat?domain=general'),
                  dictationIcon: <BookOpen className="w-8 h-8" />
                },
                navigation: {
                  color: '#0096FF', colorClass: 'text-[#0096FF]', bgClass: 'bg-[#0096FF]', borderClass: 'border-[#0096FF]', hoverBorderClass: 'hover:border-[#0096FF]', hoverTextClass: 'group-hover:text-[#0096FF]',
                  dictationDesc: 'AI根据海事业务场景动态生成的词汇听写',
                  roleplayTitle: 'VTS 港口交管与船管业务', roleplayDesc: '高压模拟：海事专属工作场景试错',
                  roleplayAction: () => router.push('/chat?domain=navigation'),
                  dictationIcon: <Ship className="w-8 h-8" />
                },
                engineering: {
                  color: '#FF9600', colorClass: 'text-[#FF9600]', bgClass: 'bg-[#FF9600]', borderClass: 'border-[#FF9600]', hoverBorderClass: 'hover:border-[#FF9600]', hoverTextClass: 'group-hover:text-[#FF9600]',
                  dictationDesc: 'AI根据轮机英语与设备排障场景生成的听写',
                  roleplayTitle: '轮机排障与技术面试', roleplayDesc: '高压模拟：轮机工程专属实战环境试错',
                  roleplayAction: () => router.push('/chat?domain=engineering'),
                  dictationIcon: <Settings className="w-8 h-8" />
                }
              };
              const dc = domainContent[domain];

              return (
                <div className="max-w-2xl mx-auto space-y-6 relative py-4 pb-20">
                  <div className="absolute left-12 top-10 bottom-10 w-2 bg-slate-200 z-0 hidden sm:block"></div>

                  {/* Node 1: AI Dictation */}
                  <div className="relative z-10 flex gap-6 items-start">
                    <div className="hidden sm:flex w-24 flex-col items-center shrink-0">
                      <div className={`w-16 h-16 rounded-full ${dc.bgClass} flex items-center justify-center border-b-4 border-black/20 text-white`}>
                        {dc.dictationIcon}
                      </div>
                    </div>
                    <DuoCard className={`flex-1 hover:-translate-y-1 transition-all ${dc.hoverBorderClass} group`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-400 font-extrabold text-xs">节点 1 / 靶向修复</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                          <Sparkles className={`w-3 h-3 ${dc.colorClass}`} /> AI 动态生成
                        </div>
                      </div>
                      <h3 className={`font-extrabold text-slate-700 text-xl mb-1 ${dc.hoverTextClass} transition-colors`}>场景词汇听写</h3>
                      <p className="text-slate-500 font-bold text-sm mb-4">{dc.dictationDesc}</p>
                      
                      <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setTestSubMode('random'); }}
                          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'random' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          基础听写 (有提示)
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setTestSubMode('exam'); }}
                          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'exam' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          盲听挑战 (无提示)
                        </button>
                      </div>

                      {testSubMode === 'random' ? (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <DuoBtn variant="primary" className={`!bg-emerald-500 hover:!bg-emerald-600 !border-b-emerald-600 !px-2`} onClick={() => handlePracticeClick('easy')}>简单</DuoBtn>
                          <DuoBtn variant="primary" className={`!bg-amber-500 hover:!bg-amber-600 !border-b-amber-600 !px-2`} onClick={() => handlePracticeClick('medium')}>中等</DuoBtn>
                          <DuoBtn variant="primary" className={`!bg-rose-500 hover:!bg-rose-600 !border-b-rose-600 !px-2`} onClick={() => handlePracticeClick('hard')}>困难</DuoBtn>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <DuoBtn variant="outline" className={`!px-2`} onClick={() => startSession('test', 'easy')}>简单</DuoBtn>
                          <DuoBtn variant="outline" className={`!px-2`} onClick={() => startSession('test', 'medium')}>中等</DuoBtn>
                          <DuoBtn variant="outline" className={`!px-2`} onClick={() => startSession('test', 'hard')}>困难</DuoBtn>
                        </div>
                      )}
                      
                      <div className="pt-3 mt-4 border-t-2 border-slate-100">
                        <DuoBtn variant="ghost" className="w-full justify-center gap-2 !py-2" onClick={testSubMode === 'random' ? startReviewSession : startTestReviewSession}>
                          <span><Target className="w-4 h-4 inline" /> 错题重练 (靶向修复)</span>
                        </DuoBtn>
                      </div>
                    </DuoCard>
                  </div>

                  {/* Node 2: Roleplay */}
                  <div className="relative z-10 flex gap-6 items-start">
                    <div className="hidden sm:flex w-24 flex-col items-center shrink-0">
                      <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 ${dc.borderClass} ${dc.colorClass}`}>
                        <Mic className="w-8 h-8" />
                      </div>
                    </div>
                    <DuoCard className={`flex-1 hover:-translate-y-1 transition-all ${dc.hoverBorderClass} group`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-400 font-extrabold text-xs">节点 2 / 实战摸底</div>
                      </div>
                      <h3 className={`font-extrabold text-slate-700 text-xl mb-1 ${dc.hoverTextClass} transition-colors`}>{dc.roleplayTitle}</h3>
                      <p className="text-slate-500 font-bold text-sm mb-4">{dc.roleplayDesc}</p>
                      <DuoBtn variant="outline" className={`w-full !border-[2px] !border-[#e5e5e5] ${dc.colorClass} hover:!bg-slate-50`} onClick={dc.roleplayAction}>
                        开始场景实战
                      </DuoBtn>
                    </DuoCard>
                  </div>

                  {/* Node 3: Mock Exam */}
                  <div className="relative z-10 flex gap-6 items-start">
                    <div className="hidden sm:flex w-24 flex-col items-center shrink-0">
                      <div className={`w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-b-4 border-slate-300 text-slate-500`}>
                        <GraduationCap className="w-8 h-8" />
                      </div>
                    </div>
                    <DuoCard className="flex-1 hover:-translate-y-1 transition-all hover:border-[#ce82ff] group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-400 font-extrabold text-xs">节点 3 / 冲刺测验</div>
                      </div>
                      <h3 className="font-extrabold text-slate-700 text-xl mb-1 group-hover:text-[#ce82ff] transition-colors">历年真题模考</h3>
                      <p className="text-slate-500 font-bold text-sm mb-4">周期性水平测试，检验阶段学习成果</p>
                      <DuoBtn variant="primary" className="w-full !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={() => router.push('/exam')}>
                        进入真题库
                      </DuoBtn>
                    </DuoCard>
                  </div>
                  
                  {/* Supplementary Tools (Vocab, Custom, Stats) */}
                  <div className="relative z-10 flex gap-6 items-start mt-8 pt-8 border-t-2 border-slate-200 border-dashed">
                    <div className="hidden sm:flex w-24 flex-col items-center shrink-0"></div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <DuoCard className="cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md transition-all !p-4 flex flex-col items-center text-center" onClick={() => router.push('/custom')}>
                        <Wand2 className="w-6 h-6 text-[#ff4b4b] mb-2" />
                        <h3 className="font-extrabold text-slate-700 text-sm">自定义听写</h3>
                      </DuoCard>
                      <DuoCard className="cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md transition-all !p-4 flex flex-col items-center text-center" onClick={() => router.push('/vocab')}>
                        <BrainCircuit className="w-6 h-6 text-[#ff9600] mb-2" />
                        <h3 className="font-extrabold text-slate-700 text-sm">词汇评估</h3>
                      </DuoCard>
                      <DuoCard className="cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md transition-all !p-4 flex flex-col items-center text-center" onClick={viewStats}>
                        <BarChart3 className="w-6 h-6 text-[#1cb0f6] mb-2" />
                        <h3 className="font-extrabold text-slate-700 text-sm">我的战绩</h3>
                      </DuoCard>
                      <DuoCard className="cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md transition-all !p-4 flex flex-col items-center text-center" onClick={fetchLeaderboard}>
                        <Medal className="w-6 h-6 text-[#ffc800] mb-2" />
                        <h3 className="font-extrabold text-slate-700 text-sm">排行榜</h3>
                      </DuoCard>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )
  }
"""

start_str = "              {/* 顶部动态 CTA 按钮 & AI 今日主线 */}"
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
