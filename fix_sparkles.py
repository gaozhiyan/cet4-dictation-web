with open('src/app/chat/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("Navigation } from 'lucide-react'", "Navigation, Sparkles } from 'lucide-react'")

with open('src/app/chat/page.tsx', 'w') as f:
    f.write(content)
