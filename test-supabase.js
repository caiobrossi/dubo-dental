// Teste de conexão com Supabase
// Execute com: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = 'https://fdjelequldsybdzjlyuz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamVsZXF1bGRzeWJkempseXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTU1NzUsImV4cCI6MjA3MTg3MTU3NX0.0WpLs4WO1Gm4IdZwbLLGSJv7ub73lS3o2wlESz4Xhfk';

console.log('🔍 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Chave:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');

if (!supabaseUrl || supabaseUrl === 'SUA_URL_DO_SUPABASE_AQUI') {
  console.log('\n❌ ERRO: Configure as credenciais do Supabase primeiro!');
  console.log('1. Crie um arquivo .env.local na raiz do projeto');
  console.log('2. Adicione suas credenciais:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('\n🔄 Testando conexão...');
  
  // Teste 1: Verificar se consegue conectar
  supabase.from('professionals').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Erro na conexão:', error.message);
        if (error.message.includes('relation "professionals" does not exist')) {
          console.log('\n💡 DICA: Execute o schema SQL no Supabase primeiro!');
          console.log('1. Vá para SQL Editor no seu projeto Supabase');
          console.log('2. Cole e execute o conteúdo de supabase-schema.sql');
        }
      } else {
        console.log('✅ Conexão bem-sucedida!');
        console.log('✅ Tabela professionals encontrada');
        
        // Teste 2: Verificar dados
        return supabase.from('professionals').select('*').limit(3);
      }
    })
    .then(({ data, error }) => {
      if (data && !error) {
        console.log('✅ Dados carregados com sucesso!');
        console.log('📊 Profissionais encontrados:', data.length);
        data.forEach(prof => {
          console.log(`   - ${prof.name} (${prof.specialty})`);
        });
      }
    })
    .catch(err => {
      console.log('❌ Erro inesperado:', err.message);
    });
    
} catch (error) {
  console.log('❌ Erro ao criar cliente Supabase:', error.message);
}
