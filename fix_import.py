with open('src/app/page.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'\} , Mic, Wand2 from \'lucide-react\'', r', Mic, Wand2 } from \'lucide-react\'', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
