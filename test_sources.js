require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const set1 = JSON.parse(fs.readFileSync('./public/data/202406-set1.json'));
const set2 = JSON.parse(fs.readFileSync('./public/data/202406-set2.json'));
const set3 = JSON.parse(fs.readFileSync('./public/data/202512-set1.json'));
const set4 = JSON.parse(fs.readFileSync('./public/data/202506-set2.json'));

const allData = [...set1, ...set2, ...set3, ...set4];
const sources = [...new Set(allData.map(s => s.source).filter(Boolean))];
console.log(sources);
