const https = require('https');

const COZE_API_TOKEN = 'pat_invalidGnsForEe9hATk8xLuOF9RpYIo5onZ0qDPwvqabM0oJGEmmqyWQcUa9vuEqU';
const COZE_BOT_ID = '7633406989321895951';

const data = JSON.stringify({
  bot_id: COZE_BOT_ID,
  user_id: `test_${Date.now()}`,
  stream: true,
  auto_save_history: false,
  additional_messages: [
    {
      role: "user",
      content: "aple",
      content_type: "text"
    }
  ]
});

const req = https.request('https://api.coze.cn/v3/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${COZE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.on('data', (chunk) => {
    console.log("--- CHUNK START ---");
    console.log(chunk.toString());
    console.log("--- CHUNK END ---");
  });
  res.on('end', () => {
    console.log('Stream ended');
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
