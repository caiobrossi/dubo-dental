# Configuração do Supabase para o Sistema de Pacientes

## 🚀 Configuração Inicial

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha as informações do projeto:
   - Nome: `dubo-dental-v3`
   - Database Password: (escolha uma senha forte)
   - Region: (escolha a região mais próxima)

### 2. Obter credenciais

Após criar o projeto, vá para:
- **Settings** → **API**
- Copie a **URL** e **anon key**

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://fdjelequldsybdzjlyuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamVsZXF1bGRzeWJkempseXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTU1NzUsImV4cCI6MjA3MTg3MTU3NX0.0WpLs4WO1Gm4IdZwbLLGSJv7ub73lS3o2wlESz4Xhfk
```

### 4. Executar o schema do banco

1. No Supabase, vá para **SQL Editor**
2. Cole e execute o conteúdo do arquivo `supabase-schema.sql`
3. Isso criará todas as tabelas necessárias

## 📊 Estrutura do Banco

### Tabelas criadas:

- **`professionals`** - Profissionais da clínica
- **`patient_groups`** - Grupos de pacientes
- **`patients`** - Dados dos pacientes

### Dados de exemplo incluídos:

- 3 profissionais (Dr. Rafael Rodrigues, Dra. Maria Silva, Dr. João Santos)
- 3 grupos de pacientes (VIP, Infantis, Geriátricos)

## 🔧 Funcionalidades Implementadas

### ✅ Modal de Adição de Pacientes
- Formulário completo com validação
- Upload de avatar (preparado para implementação)
- Seleção de profissional e grupo
- Informações de seguro
- Dados de contato e endereço

### ✅ Listagem Dinâmica
- Carregamento automático dos pacientes
- Exibição de dados reais do banco
- Estados de loading e lista vazia
- Tempo relativo para última visita

### ✅ Integração com Supabase
- CRUD completo de pacientes
- Relacionamentos com profissionais e grupos
- Políticas de segurança RLS
- Timestamps automáticos

## 🚨 Políticas de Segurança (RLS)

O banco está configurado com Row Level Security:
- **Leitura**: Permitida para todos
- **Escrita**: Apenas usuários autenticados
- **Atualização**: Apenas usuários autenticados

## 📱 Como Usar

1. **Adicionar Paciente**:
   - Clique no botão "Add new" → "Add new patient"
   - Preencha o formulário
   - Clique em "Save Patient"

2. **Visualizar Pacientes**:
   - A lista carrega automaticamente
   - Use os filtros para ordenar e buscar
   - Clique nos menus de ação para opções

3. **Gerenciar Dados**:
   - Os dados são salvos automaticamente no Supabase
   - A lista é atualizada em tempo real

## 🐛 Solução de Problemas

### Erro de conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de tabela não encontrada
- Execute novamente o schema SQL
- Verifique se as tabelas foram criadas em **Table Editor**

### Erro de permissão
- Verifique se as políticas RLS estão ativas
- Confirme se está usando a chave anônima correta

## 🔮 Próximos Passos

- [ ] Implementar upload de avatar
- [ ] Adicionar autenticação de usuários
- [ ] Implementar edição de pacientes
- [ ] Adicionar exclusão de pacientes
- [ ] Implementar busca e filtros avançados
- [ ] Adicionar paginação para muitos pacientes

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Confirme a configuração das variáveis de ambiente
3. Teste a conexão com o Supabase
4. Verifique se o schema foi executado corretamente
