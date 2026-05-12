import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace the dynamic CTA button section with a new AI Quest Board
search_str = """              {/* 顶部动态 CTA 按钮 */}
              <div className="px-2 mt-4">
                <button 
                  onClick={ctaConfig.action}
                  className={`w-full flex items-center justify-center gap-3 text-white font-extrabold text-xl py-4 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md hover:shadow-lg ${ctaConfig.colorClass}`}
                >
                  {ctaConfig.icon}
                  <span className="tracking-wide">{ctaConfig.label}</span>
                </button>
              </div>"""

replace_str = """              {/* 顶部动态 CTA 按钮 & AI 今日主线 */}
              <div className="px-2 mt-6 mb-8">
                <DuoCard className="!p-0 overflow-hidden border-2 border-[#1cb0f6] border-b-4 relative">
                  <div className="bg-[#1cb0f6]/10 px-5 py-3 flex items-center justify-between border-b-2 border-[#1cb0f6]/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#1cb0f6]" />
                      <span className="font-extrabold text-[#1cb0f6]">AI 今日推荐主线</span>
                    </div>
                    <span className="bg-white text-[#1cb0f6] text-xs font-bold px-2 py-1 rounded-lg border-2 border-[#1cb0f6]/20">高阶认知优先</span>
                  </div>
                  
                  <div className="p-5 grid sm:grid-cols-2 gap-4 relative">
                    {/* 连线装饰 (仅桌面端) */}
                    <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-slate-200 rounded-full z-0"></div>
                    <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 z-10 bg-white px-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>

                    {/* Step 1 */}
                    <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 relative z-10 hover:border-[#ffc800] transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-400 font-extrabold text-xs">STEP 1 / 发现盲区</div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">1</div>
                      </div>
                      <h3 className="font-extrabold text-slate-700 text-lg group-hover:text-[#ffc800] transition-colors">场景实战试错</h3>
                      <p className="text-slate-500 text-sm font-bold mt-1 mb-4 leading-snug">进入全真语境，让 AI 暴露你的真实听口弱点。</p>
                      <DuoBtn variant="outline" className="w-full !py-2.5 !border-[#ffc800] !text-[#e5b400] hover:!bg-[#ffc800]/5" onClick={() => router.push('/chat')}>
                        去挨打 (实战)
                      </DuoBtn>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 relative z-10 hover:border-[#58cc02] transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-400 font-extrabold text-xs">STEP 2 / 靶向修复</div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">2</div>
                      </div>
                      <h3 className="font-extrabold text-slate-700 text-lg group-hover:text-[#58cc02] transition-colors">AI 针对性补弱</h3>
                      <p className="text-slate-500 text-sm font-bold mt-1 mb-4 leading-snug">基于你的实战错误，精准推送对应难度的听力片段。</p>
                      <DuoBtn variant="primary" className="w-full !py-2.5" onClick={ctaConfig.action}>
                        {ctaConfig.label}
                      </DuoBtn>
                    </div>
                  </div>
                </DuoCard>
              </div>"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("String not found!")
