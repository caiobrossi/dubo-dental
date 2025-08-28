const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdjelequldsybdzjlyuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamVsZXF1bGRzeWJkempseXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTU1NzUsImV4cCI6MjA3MTg3MTU3NX0.0WpLs4WO1Gm4IdZwbLLGSJv7ub73lS3o2wlESz4Xhfk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientsTable() {
  console.log('🔍 Testando tabela de pacientes...\n');

  try {
    // 1. Tentar fazer uma consulta simples na tabela
    console.log('1️⃣ Testando consulta na tabela patients...');
    const { data: patients, error: selectError } = await supabase
      .from('patients')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Erro ao consultar tabela patients:', selectError);
      console.error('🔍 Detalhes do erro:', {
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
        code: selectError.code
      });
      return;
    }

    console.log('✅ Tabela patients acessível!');
    console.log(`📊 Pacientes encontrados: ${patients ? patients.length : 0}\n`);

    // 2. Testar inserção com dados mínimos
    console.log('2️⃣ Testando inserção de dados...');
    
    const testPatient = {
      name: 'Teste Paciente',
      date_of_birth: '1990-01-01',
      gender: 'male',
      preferred_language: 'Português',
      clinic_branch: 'Principal',
      referral_source: 'Indicação',
      address: 'Rua Teste, 123',
      post_code: '12345-678',
      city: 'São Paulo',
      state: 'SP'
    };

    console.log('📝 Dados de teste:', testPatient);

    const { data: insertData, error: insertError } = await supabase
      .from('patients')
      .insert([testPatient])
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir paciente:', insertError);
      console.error('🔍 Detalhes do erro:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return;
    }

    console.log('✅ Paciente inserido com sucesso!');
    console.log('📊 Dados inseridos:', insertData);

    // 3. Limpar dados de teste
    console.log('\n3️⃣ Limpando dados de teste...');
    if (insertData && insertData[0]) {
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', insertData[0].id);

      if (deleteError) {
        console.error('⚠️ Erro ao limpar dados de teste:', deleteError);
      } else {
        console.log('✅ Dados de teste removidos!');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testPatientsTable();
