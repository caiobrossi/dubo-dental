const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // First test basic connection with a simpler query
    console.log('Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth test - error:', authError?.message || 'none');
    
    // Test table access
    console.log('Testing table access...');
    const { data, error } = await supabase
      .from('insurance_plans')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error accessing insurance_plans table:');
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('Code:', error.code);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n📝 Table does not exist. You need to run the SQL scripts:');
        console.log('1. create_insurance_tables_simple.sql (for basic setup)');
        console.log('2. create_insurance_plans_table.sql (for full features)');
      } else if (error.code === 'PGRST116') {
        console.log('\n🔐 Permission denied. Check RLS policies.');
      }
    } else {
      console.log('✅ Successfully accessed insurance_plans table');
      console.log(`📊 Found ${data?.length || 0} records`);
      console.log('📋 Sample data:', data);
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    console.error('Stack:', err.stack);
  }
}

testConnection();