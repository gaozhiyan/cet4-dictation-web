import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update imports for icons
content = content.replace(
    '} from "lucide-react"',
    ', Leaf, Swords, Ghost, Zap } from "lucide-react"'
)

# 2. Replace emojis with Lucide icons
content = content.replace('🌱 轻松起步 (简单)', '<Leaf className="w-5 h-5 text-emerald-500" /> 轻松起步 (简单)')
content = content.replace('⚔️ 进阶试炼 (中等)', '<Swords className="w-5 h-5 text-amber-500" /> 进阶试炼 (中等)')
content = content.replace('🔥 极限挑战 (困难)', '<Flame className="w-5 h-5 text-rose-500" /> 极限挑战 (困难)')
content = content.replace('👾 暴打错题 (Boss关)', '<Ghost className="w-5 h-5 text-fuchsia-500" /> 暴打错题 (Boss关)')

# 3. Update DuoBtn to have focus-visible
old_btn = 'const baseStyle = "font-extrabold rounded-2xl px-4 py-3 flex items-center transition-all active:border-b-0 active:translate-y-1"'
new_btn = 'const baseStyle = "font-extrabold rounded-2xl px-4 py-3 flex items-center transition-all duration-200 ease-out active:border-b-0 active:translate-y-1 focus-visible:ring-4 focus-visible:ring-black/20 outline-none"'
content = content.replace(old_btn, new_btn)

# 4. Update DuoCard to have focus-visible if interactive
old_card = 'className={`bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-4 md:p-6 ${className}`}'
new_card = 'className={`bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-4 md:p-6 focus-visible:ring-4 focus-visible:ring-black/20 outline-none ${className}`}'
content = content.replace(old_card, new_card)

# Ensure <DuoBtn variant="outline" className="w-full justify-between" onClick={() => handlePracticeClick('easy')}> has gap
content = content.replace('<span className="text-slate-700"><Leaf', '<span className="text-slate-700 flex items-center gap-2"><Leaf')
content = content.replace('<span className="text-slate-700"><Swords', '<span className="text-slate-700 flex items-center gap-2"><Swords')
content = content.replace('<span className="text-slate-700"><Flame', '<span className="text-slate-700 flex items-center gap-2"><Flame')

# Fix Boss
content = content.replace('<Ghost className="w-5 h-5 text-fuchsia-500" /> 暴打错题 (Boss关)', '暴打错题 (Boss关)')
# Wait, boss already has a <Flame className="w-5 h-5 fill-current text-white" /> next to it. Let's fix it.
content = content.replace('<span><Ghost className="w-5 h-5 text-fuchsia-500" /> 暴打错题 (Boss关)</span>', '<span>暴打错题 (Boss关)</span>')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
print("Updated page.tsx")
