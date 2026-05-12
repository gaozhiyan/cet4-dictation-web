require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('scores').select('*, user:user_id');
  console.log("Scores Error:", error);
  console.log("Scores Data count:", data ? data.length : 0);
  if (data && data.length > 0) {
    console.log("Last Score details:", JSON.stringify(data[0].details, null, 2));
    console.log("Last Score details class_group:", data[0].details.class_group);
    console.log("Last Score details full_name:", data[0].details.full_name);
  }
}
check();
