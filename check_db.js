require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('scores').select('mode, details');
  if (error) {
    console.error("DB Error:", error);
    return;
  }
  console.log("Total records:", data?.length);
  const modes = {};
  const classes = {};
  
  data.forEach(r => {
    modes[r.mode] = (modes[r.mode] || 0) + 1;
    const cg = r.details?.class_group || 'missing';
    classes[cg] = (classes[cg] || 0) + 1;
  });
  
  console.log("Modes:", modes);
  console.log("Classes:", classes);
}
check();
