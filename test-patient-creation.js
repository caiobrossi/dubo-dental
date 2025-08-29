const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdjelequldsybdzjlyuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamVsZXF1bGRzeWJkempseXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTU1NzUsImV4cCI6MjA3MTg3MTU3NX0.0WpLs4WO1Gm4IdZwbLLGSJv7ub73lS3o2wlESz4Xhfk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientCreation() {
  console.log('🔍 Testando criação de pacientes...\n');

  try {
    // 1. Verificar se RLS está desabilitado
    console.log('1️⃣ Verificando status do RLS...');
    
    // 2. Tentar criar paciente com apenas o nome
    console.log('2️⃣ Testando criação com apenas o nome...');
    
    const testPatient = {
      name: 'Paciente Teste ' + Date.now()
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
      
      // 3. Se der erro, verificar se é RLS
      if (insertError.code === '42501') {
        console.log('\n🚨 PROBLEMA IDENTIFICADO: RLS ainda está ativo!');
        console.log('💡 Execute este SQL no Supabase:');
        console.log('ALTER TABLE patients DISABLE ROW LEVEL SECURITY;');
      }
      
      return;
    }

    console.log('✅ Paciente inserido com sucesso!');
    console.log('📊 Dados inseridos:', insertData);

    // 4. Verificar se o paciente foi realmente criado
    console.log('\n4️⃣ Verificando se o paciente foi criado...');
    const { data: checkData, error: checkError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', insertData[0].id);

    if (checkError) {
      console.error('❌ Erro ao verificar paciente:', checkError);
    } else {
      console.log('✅ Paciente encontrado no banco:', checkData[0]);
    }

    // 5. Limpar dados de teste
    console.log('\n5️⃣ Limpando dados de teste...');
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

testPatientCreation();

