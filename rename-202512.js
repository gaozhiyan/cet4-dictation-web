const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'public/audio');
const dataDir = path.join(__dirname, 'public/data');

// 1. Update JSON
const oldJsonPath = path.join(dataDir, '202506-set1.json');
const newJsonPath = path.join(dataDir, '202512-set1.json');

if (fs.existsSync(oldJsonPath)) {
    let data = JSON.parse(fs.readFileSync(oldJsonPath, 'utf8'));
    data.forEach(item => {
        if (item.filename) {
            item.filename = item.filename.replace('202506-set1', '202512-set1');
        }
        if (item.source) {
            item.source = item.source.replace('202506', '202512');
        }
    });
    fs.writeFileSync(newJsonPath, JSON.stringify(data, null, 2), 'utf8');
    fs.unlinkSync(oldJsonPath);
    console.log('JSON updated and renamed to 202512-set1.json');
} else {
    console.log('JSON file not found:', oldJsonPath);
}

// 2. Rename Audio files
if (fs.existsSync(audioDir)) {
    const files = fs.readdirSync(audioDir);
    let count = 0;
    files.forEach(file => {
        if (file.startsWith('202506-set1-') && file.endsWith('.wav')) {
            const oldPath = path.join(audioDir, file);
            const newPath = path.join(audioDir, file.replace('202506-set1-', '202512-set1-'));
            fs.renameSync(oldPath, newPath);
            count++;
        }
    });
    console.log(`Renamed ${count} audio files.`);
}
