const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf-8');

code = code.replace(/value={name}\n\s+onChange=\{\(e\) => setPassword\(e.target.value\)\}/g, 
`value={name}\n                  onChange={(e) => setName(e.target.value)}`);

fs.writeFileSync('src/app/login/page.tsx', code);
