import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

search_str = """                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>
            </section>

            <section className="mt-12">"""

insert_str = """                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>
              
              <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all mt-6" onClick={() => router.push('/chat')}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#58cc02] rounded-2xl flex items-center justify-center border-b-4 border-[#46a302]">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-700">口语实战</h2>
                    <p className="text-slate-400 font-bold mt-1">模拟真实交流场景，训练表达、应答与临场反应</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>
              
              <DuoCard className="flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all mt-6" onClick={() => router.push('/custom')}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#ff4b4b] rounded-2xl flex items-center justify-center border-b-4 border-[#ea2b2b]">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-700">自定义听写</h2>
                    <p className="text-slate-400 font-bold mt-1">把自己的文本和 AI 生成内容快速转成听写材料</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-300" />
              </DuoCard>
            </section>

            <section className="mt-12">"""

new_content = content.replace(search_str, insert_str)
if new_content == content:
    print("Replace failed!")
else:
    with open('src/app/page.tsx', 'w') as f:
        f.write(new_content)
    print("Replace successful!")
