with open('src/app/page.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'\} from \\\'lucide-react\\\'', r'} from "lucide-react"', content)
content = re.sub(r'\} from \\"lucide-react\\"', r'} from "lucide-react"', content)
content = content.replace("\\'lucide-react\\'", '"lucide-react"')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
