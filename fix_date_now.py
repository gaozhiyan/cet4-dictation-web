with open('src/app/chat/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("id: Date.now().toString(),\\n        senderId:", "id: String(Date.now()),\\n        senderId:")

with open('src/app/chat/page.tsx', 'w') as f:
    f.write(content)
