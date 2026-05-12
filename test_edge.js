const https = require('https');

const SUPABASE_URL = 'https://ctagfkejsnelhmqygiyk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YWdma2Vqc25lbGhtcXlnaXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTA0NDQsImV4cCI6MjA5MDI2NjQ0NH0.UTRoTgqkAYn9KnSNSx6_7jeC6DOlgx_5sd1Q_VgslvI';

const data = JSON.stringify({
  wrongAnswers: [
    { question: "apple", answer: "aple", snippet: "I have an apple" }
  ],
  userId: "test_user_123"
});

const req = https.request(`${SUPABASE_URL}/functions/v1/coze-proxy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    console.log("--- CHUNK START ---");
    console.log(chunk.toString());
    console.log("--- CHUNK END ---");
  });
  
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();