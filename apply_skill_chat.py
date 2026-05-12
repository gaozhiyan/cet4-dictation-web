import re

with open('src/app/chat/page.tsx', 'r') as f:
    content = f.read()

# Update DuoBtn to have focus-visible
old_btn = 'const baseStyle = "font-extrabold rounded-2xl px-4 py-3 flex items-center justify-center transition-all active:border-b-0 active:translate-y-1"'
new_btn = 'const baseStyle = "font-extrabold rounded-2xl px-4 py-3 flex items-center justify-center transition-all duration-200 ease-out active:border-b-0 active:translate-y-1 focus-visible:ring-4 focus-visible:ring-black/20 outline-none"'
content = content.replace(old_btn, new_btn)

# Update DuoCard to have focus-visible if interactive
old_card = 'className={`bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-4 md:p-6 ${className}`}'
new_card = 'className={`bg-white border-2 border-slate-200 border-b-4 rounded-2xl p-4 md:p-6 focus-visible:ring-4 focus-visible:ring-black/20 outline-none ${className}`}'
content = content.replace(old_card, new_card)

with open('src/app/chat/page.tsx', 'w') as f:
    f.write(content)
print("Updated chat/page.tsx")
