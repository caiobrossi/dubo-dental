const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🔍 Testing insert operation...');
  
  try {
    const testData = {
      name: 'Test Insurance Plan',
      type: 'custom',
      description: 'Test plan created from script',
      coverage_percentage: 80
    };
    
    console.log('Inserting data:', testData);
    
    const { data, error } = await supabase
      .from('insurance_plans')
      .insert(testData)
      .select()
      .single();
      
    if (error) {
      console.error('❌ Insert error:');
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('Code:', error.code);
    } else {
      console.log('✅ Successfully inserted data:', data);
    }
    
    // Try to fetch all data
    console.log('\n🔍 Fetching all data...');
    const { data: allData, error: fetchError } = await supabase
      .from('insurance_plans')
      .select('*');
      
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
    } else {
      console.log('📋 All data:', allData);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testInsert();