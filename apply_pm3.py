import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix Step 1 negative language
content = content.replace(
    '<h3 className="font-extrabold text-slate-700 text-lg group-hover:text-[#ffc800] transition-colors">场景实战试错</h3>',
    '<h3 className="font-extrabold text-slate-700 text-lg group-hover:text-[#ffc800] transition-colors">场景实战挑战</h3>'
)
content = content.replace(
    '<p className="text-slate-500 text-sm font-bold mt-1 mb-4 leading-snug">进入全真语境，让 AI 暴露你的真实听口弱点。</p>',
    '<p className="text-slate-500 text-sm font-bold mt-1 mb-4 leading-snug">通过历年真题或口语对话，检验真实水平并发现薄弱点。</p>'
)
content = content.replace(
    '>\n                        去挨打 (实战)\n                      </DuoBtn>',
    '>\n                        去实战挑战\n                      </DuoBtn>'
)
# Fix Step 2
content = content.replace(
    '<p className="text-slate-500 text-sm font-bold mt-1 mb-4 leading-snug">基于你的实战错误，精准推送对应难度的听力片段。</p>',
    '<p className="text-slate-500 text-sm font-bold mt-1 mb-4 leading-snug">基于实战暴露的问题，推送对应难度的听写进行针对性强化。</p>'
)

# Replace the Left Column (听力训练)
search_str = """              {/* Left Column: 听力训练 */}
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
                        <span className="text-slate-700 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500" /> 轻松起步 (简单)</span>
                      </DuoBtn>
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('medium')}>
                        <span className="text-slate-700 flex items-center gap-2"><Swords className="w-5 h-5 text-amber-500" /> 进阶试炼 (中等)</span>
                      </DuoBtn>
                      <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('hard')}>
                        <span className="text-slate-700 flex items-center gap-2"><Flame className="w-5 h-5 text-rose-500" /> 极限挑战 (困难)</span>
                      </DuoBtn>
                      <div className="pt-3 mt-3 border-t-2 border-slate-100">
                        <DuoBtn variant="primary" className="w-full justify-center gap-2" onClick={startReviewSession}>
                          <Flame className="w-5 h-5 fill-current text-white" />
                          <span>暴打错题 (Boss关)</span>
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
              </div>"""

replace_str = """              {/* Left Column: 听力训练 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Headphones className="w-8 h-8 text-[#1cb0f6]" />
                  <h2 className="text-2xl font-extrabold text-slate-700 tracking-wider">听力训练</h2>
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
              </div>"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced left column successfully")
else:
    print("Left column string not found! Trying fallback...")
