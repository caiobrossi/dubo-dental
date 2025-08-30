// Teste para verificar se as variáveis de ambiente estão funcionando
console.log('🔍 Testando variáveis de ambiente...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO configurada');

// Verificar se o arquivo .env.local existe
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
console.log('📁 Verificando arquivo .env.local...');

if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env.local encontrado');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Conteúdo do .env.local:');
  console.log(envContent);
} else {
  console.log('❌ Arquivo .env.local NÃO encontrado');
  console.log('📍 Caminho esperado:', envPath);
}

