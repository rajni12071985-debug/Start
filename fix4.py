# python script to fix the backslashes inserted by my previous script
with open('c:/Users/PRAGATI/OneDrive/Desktop/STARTIFY/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# I used \` \${ and \\n in my previous fix script
text = text.replace('\`', '`')
text = text.replace('\${', '${')
text = text.replace('\\\\n', '\\n')

with open('c:/Users/PRAGATI/OneDrive/Desktop/STARTIFY/app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('app.js string literals fixed successfully')
