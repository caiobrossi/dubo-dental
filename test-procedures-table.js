const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdjelequldsybdzjlyuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamVsZXF1bGRzeWJkempseXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTU1NzUsImV4cCI6MjA3MTg3MTU3NX0.0WpLs4WO1Gm4IdZwbLLGSJv7ub73lS3o2wlESz4Xhfk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProceduresTable() {
  console.log('🔍 Testing procedures table...\n');
  
  try {
    // Test if table exists
    console.log('1. Checking if procedures table exists...');
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .limit(1);
      
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('❌ Table "procedures" does not exist!');
        console.log('\n📝 To fix this, run the following SQL script in Supabase:');
        console.log('   create_procedures_table.sql\n');
        return;
      } else {
        console.error('❌ Error:', error.message);
        return;
      }
    }
    
    console.log('✅ Procedures table exists!');
    console.log(`📊 Found ${data?.length || 0} procedures\n`);
    
    // Get private plan ID
    console.log('2. Getting Private Plan ID...');
    const { data: plans, error: planError } = await supabase
      .from('insurance_plans')
      .select('id, name, type')
      .eq('type', 'private')
      .single();
      
    if (planError || !plans) {
      console.error('❌ Could not find Private Plan');
      return;
    }
    
    console.log('✅ Private Plan found:', plans.id);
    
    // Check procedures for private plan
    console.log('\n3. Checking procedures for Private Plan...');
    const { data: procedures, error: procError } = await supabase
      .from('procedures')
      .select('*')
      .eq('insurance_plan_id', plans.id);
      
    if (procError) {
      console.error('❌ Error fetching procedures:', procError.message);
      return;
    }
    
    console.log(`✅ Found ${procedures?.length || 0} procedures for Private Plan`);
    
    if (procedures && procedures.length > 0) {
      console.log('\n📋 Sample procedures:');
      procedures.slice(0, 3).forEach(proc => {
        console.log(`   - ${proc.name} (${proc.category}) - $${proc.price}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testProceduresTable();