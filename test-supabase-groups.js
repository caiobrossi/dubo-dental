// Teste da conexão Supabase para grupos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando conexão Supabase...\n');

console.log('Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('Supabase Key:', supabaseKey ? '✅ Configurada' : '❌ Não configurada');
console.log('');

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  (async () => {
    try {
      console.log('📊 Testando tabela patient_groups...\n');

      // 1. Verificar se tabela existe
      console.log('1. Verificando se tabela patient_groups existe...');
      const { data: groups, error: groupsError } = await supabase
        .from('patient_groups')
        .select('*')
        .limit(5);

      if (groupsError) {
        console.log('❌ Erro na tabela patient_groups:', groupsError.message);
        console.log('💡 Provavelmente a tabela não existe ou não tem as colunas corretas');
        console.log('🔧 Execute o SQL do arquivo create-groups-table.sql no Supabase');
      } else {
        console.log('✅ Tabela patient_groups acessível');
        console.log(`📋 Encontrados ${groups.length} grupos:`);

        if (groups.length > 0) {
          groups.forEach((group, index) => {
            console.log(`   ${index + 1}. ${group.name} (${group.patient_count || 0} pacientes)`);
            console.log(`      Cor: ${group.group_color || 'N/A'}`);
            console.log(`      Ícone: ${group.group_icon || 'N/A'}`);
            console.log(`      Participantes: ${group.participants || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('   Nenhum grupo encontrado');
          console.log('   💡 Crie alguns grupos usando o modal "Add new group"');
        }
      }

      // 2. Tentar inserir um grupo de teste
      console.log('\n2. Testando inserção de grupo...');
      const testGroup = {
        name: 'Test Group - ' + new Date().toLocaleTimeString(),
        group_color: 'red',
        group_icon: 'star',
        participants: 'all',
        patient_count: 0
      };

      const { data: insertedGroup, error: insertError } = await supabase
        .from('patient_groups')
        .insert([testGroup])
        .select()
        .single();

      if (insertError) {
        console.log('❌ Erro ao inserir grupo:', insertError.message);
        console.log('💡 Verifique se as colunas existem na tabela');
      } else {
        console.log('✅ Grupo inserido com sucesso!');
        console.log('📋 Grupo criado:', insertedGroup);

        // Limpar grupo de teste
        console.log('\n3. Limpando grupo de teste...');
        const { error: deleteError } = await supabase
          .from('patient_groups')
          .delete()
          .eq('id', insertedGroup.id);

        if (deleteError) {
          console.log('⚠️ Não conseguiu deletar grupo de teste:', deleteError.message);
        } else {
          console.log('✅ Grupo de teste removido');
        }
      }

      console.log('\n🎯 RESUMO:');
      if (groupsError) {
        console.log('❌ Problema: Tabela patient_groups não acessível');
        console.log('🔧 Solução: Execute o SQL no Supabase SQL Editor');
      } else if (groups.length === 0) {
        console.log('⚠️ Aviso: Nenhum grupo encontrado na tabela');
        console.log('💡 Solução: Crie grupos usando o modal "Add new group"');
      } else {
        console.log('✅ Tudo funcionando! Grupos carregados com sucesso');
      }

    } catch (err) {
      console.log('❌ Erro geral:', err.message);
    }
  })();

} else {
  console.log('❌ Configuração incompleta');
  console.log('💡 Verifique o arquivo .env.local');
}

