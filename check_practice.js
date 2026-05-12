require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('mode', 'practice')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error("DB Error:", error);
    return;
  }
  
  console.log(`Found ${data.length} recent practice records:`);
  data.forEach(r => {
    console.log(`- Time: ${r.created_at}, User: ${r.details?.full_name}, Class: ${r.details?.class_group}`);
  });
}
check();
