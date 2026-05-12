require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const data = JSON.stringify({
  model: 'doubao-seed-2-0-mini-260215',
  messages: [
    { role: 'system', content: 'You are Sheldon. Answer in one short sentence.' },
    { role: 'user', content: 'Hello' }
  ]
});

const req = https.request(`${SUPABASE_URL}/functions/v1/doubao-proxy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`[${new Date().toISOString()}] CHUNK RECEIVED:`, chunk.toString());
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
