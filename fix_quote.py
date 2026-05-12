with open('src/app/chat/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("'Good morning. Please take a seat. Let's start with a brief self-introduction, focusing on your research experience.'", '"Good morning. Please take a seat. Let\'s start with a brief self-introduction, focusing on your research experience."')

with open('src/app/chat/page.tsx', 'w') as f:
    f.write(content)
