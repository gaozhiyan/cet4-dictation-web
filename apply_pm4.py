import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# We need to manually construct the replacement since string matching failed.
# Find the start of the Left Column
start_marker = '{/* Left Column: 听力训练 */}'
end_marker = '{/* Right Column: 口语实战 & 数据探索 */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

replace_str = """{/* Left Column: 听力突破 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Headphones className="w-8 h-8 text-[#1cb0f6]" />
                  <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">听力突破</h2>
                </div>

                {/* 真题演练 Card */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#ce82ff] rounded-2xl flex items-center justify-center border-b-4 border-[#a567cc] shrink-0">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">历年四级真题</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm">过去两年听力原音重现与精练</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4 flex items-start gap-3">
                       <Headphones className="w-6 h-6 text-[#ce82ff] shrink-0 mt-0.5" />
                       <p className="text-slate-500 font-bold text-sm">包含完整的短篇新闻、长对话、听力篇章，支持考场模式和逐句精听模式。</p>
                    </div>
                    <DuoBtn variant="primary" className="w-full mt-auto !bg-[#ce82ff] hover:!bg-[#b975e5] !border-b-[#a567cc]" onClick={() => router.push('/exam')}>
                      进入真题库
                    </DuoBtn>
                  </div>
                </DuoCard>
                
                {/* 听写特训 Card */}
                <DuoCard className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#1cb0f6] rounded-2xl flex items-center justify-center border-b-4 border-[#1899d6] shrink-0">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-700">单句听写特训</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm">3-5分钟碎片化强化听音辨词</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setTestSubMode('random'); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'random' ? 'bg-white text-[#1cb0f6] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        基础听写 (有提示)
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setTestSubMode('exam'); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${testSubMode === 'exam' ? 'bg-white text-[#1cb0f6] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        盲听挑战 (无提示)
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
                          <div className="pt-3 mt-3 border-t-2 border-slate-100">
                            <DuoBtn variant="primary" className="w-full justify-center gap-2" onClick={startReviewSession}>
                              <span>错题重练 (靶向修复)</span>
                            </DuoBtn>
                          </div>
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
                          <div className="pt-3 mt-3 border-t-2 border-slate-100">
                            <DuoBtn variant="primary" className="w-full justify-center gap-2" onClick={startTestReviewSession}>
                              <span>盲听错题重练</span>
                            </DuoBtn>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </DuoCard>

                {/* 自定义听写 Card */}
                <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all duration-200" onClick={() => router.push('/custom')}>
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

              """

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + replace_str + content[end_idx:]
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced left column successfully by index.")
else:
    print("Could not find markers.")
