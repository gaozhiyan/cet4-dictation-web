import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(', Leaf, Swords } from "lucide-react"', ', Leaf, Swords, Sparkles } from "lucide-react"')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
print("Updated import")
