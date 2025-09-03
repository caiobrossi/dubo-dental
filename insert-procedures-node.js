const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdjelequldsybdzjlyuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamVsZXF1bGRzeWJkempseXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTU1NzUsImV4cCI6MjA3MTg3MTU3NX0.0WpLs4WO1Gm4IdZwbLLGSJv7ub73lS3o2wlESz4Xhfk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleProcedures() {
  console.log('🔧 Inserting sample procedures...\n');
  
  try {
    // Get private plan ID
    const { data: privatePlan, error: planError } = await supabase
      .from('insurance_plans')
      .select('id')
      .eq('type', 'private')
      .single();
      
    if (planError || !privatePlan) {
      console.error('❌ Could not find Private Plan:', planError?.message);
      return;
    }
    
    console.log('✅ Private Plan ID:', privatePlan.id);
    
    // Sample procedures data
    const sampleProcedures = [
      { name: 'Consultation', category: 'Others', price: 50.00, estimated_time: '30min' },
      { name: 'Cleaning', category: 'Prevention', price: 80.00, estimated_time: '45min' },
      { name: 'Filling', category: 'Others', price: 120.00, estimated_time: '30min' },
      { name: 'Root Canal', category: 'Endodontics', price: 500.00, estimated_time: '90min' },
      { name: 'Crown', category: 'Prostethics', price: 800.00, estimated_time: '60min' },
      { name: 'Extraction', category: 'Surgery', price: 150.00, estimated_time: '30min' },
      { name: 'Whitening', category: 'Aesthetic dentistry', price: 300.00, estimated_time: '60min' },
      { name: 'X-Ray', category: 'Radiology', price: 40.00, estimated_time: '15min' },
      { name: 'Implant', category: 'Implantology', price: 2000.00, estimated_time: '120min' },
      { name: 'Braces Consultation', category: 'Orthodontics', price: 100.00, estimated_time: '45min' },
      { name: 'Emergency Treatment', category: 'Emergency', price: 200.00, estimated_time: '45min' },
      { name: 'Pediatric Cleaning', category: 'Pediatric Dentistry', price: 60.00, estimated_time: '30min' },
      { name: 'Gum Treatment', category: 'Periodontics', price: 150.00, estimated_time: '45min' },
      { name: 'Lab Test', category: 'Lab tests and Exams', price: 75.00, estimated_time: '15min' },
      { name: 'Botox Treatment', category: 'Injectables', price: 400.00, estimated_time: '30min' }
    ];
    
    // Add insurance_plan_id to each procedure
    const proceduresToInsert = sampleProcedures.map(proc => ({
      ...proc,
      insurance_plan_id: privatePlan.id,
      is_active: true
    }));
    
    console.log('📝 Inserting', proceduresToInsert.length, 'procedures...');
    
    // Insert procedures
    const { data, error } = await supabase
      .from('procedures')
      .insert(proceduresToInsert)
      .select();
      
    if (error) {
      console.error('❌ Error inserting procedures:', error.message);
      console.error('Details:', error.details);
      return;
    }
    
    console.log('✅ Successfully inserted', data.length, 'procedures!');
    
    // Verify insertion
    const { data: allProcedures, error: verifyError } = await supabase
      .from('procedures')
      .select('name, category, price')
      .eq('insurance_plan_id', privatePlan.id)
      .order('category');
      
    if (verifyError) {
      console.error('❌ Error verifying procedures:', verifyError.message);
      return;
    }
    
    console.log('\n📋 Inserted procedures:');
    allProcedures.forEach(proc => {
      console.log(`   - ${proc.name} (${proc.category}) - $${proc.price}`);
    });
    
    console.log('\n🎉 All procedures inserted successfully!');
    console.log('🔄 Refresh your Private Plan page to see the procedures.');
    
  } catch (err) {
    console.error('❌ Script failed:', err.message);
  }
}

insertSampleProcedures();