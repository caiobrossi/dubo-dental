# 🚨 CORRIGIR ERRO DE RLS NO SUPABASE

## ❌ **Problema identificado:**
O erro "new row violates row-level security policy for table 'patients'" indica que as políticas de segurança (RLS) estão bloqueando a inserção de dados.

## 🔧 **Solução:**

### **Opção 1: Desabilitar RLS (Mais simples para desenvolvimento)**

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **SQL Editor** (ícone de código)
4. Execute este comando:

```sql
-- Desabilitar RLS para desenvolvimento
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_groups DISABLE ROW LEVEL SECURITY;
```

### **Opção 2: Manter RLS com políticas permissivas**

Se preferir manter a segurança, execute:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Patients are viewable by everyone" ON patients;
DROP POLICY IF EXISTS "Patients are insertable by authenticated users" ON patients;
DROP POLICY IF EXISTS "Patients are updatable by authenticated users" ON patients;

-- Criar política permissiva para desenvolvimento
CREATE POLICY "Allow all operations for development" ON patients
    FOR ALL USING (true) WITH CHECK (true);
```

## ✅ **Após executar:**

1. **Teste novamente** o modal de adicionar paciente
2. **Clique em "Save Patient"**
3. O paciente deve ser salvo com sucesso!

## 🔒 **Importante para produção:**

- **Desabilitar RLS** é apenas para desenvolvimento
- **Em produção**, configure políticas de segurança adequadas
- **Use autenticação** para controlar acesso aos dados

## 📱 **Teste agora:**

1. Execute o SQL no Supabase
2. Volte para http://localhost:3000/patients
3. Tente adicionar um paciente novamente

O erro deve desaparecer! 🎉

---

# 📝 **CAMPO OBRIGATÓRIO APENAS NOME**

## 🎯 **Mudança implementada:**
- ✅ **Apenas o nome é obrigatório**
- ✅ **Todos os outros campos são opcionais**
- ✅ **Asteriscos removidos** dos campos
- ✅ **Validação simplificada**

## 🔧 **Para aplicar no banco de dados:**

Execute este SQL no Supabase para tornar os campos opcionais:

```sql
-- Atualizar schema para campos opcionais
ALTER TABLE patients 
ALTER COLUMN date_of_birth DROP NOT NULL,
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN preferred_language DROP NOT NULL,
ALTER COLUMN clinic_branch DROP NOT NULL,
ALTER COLUMN referral_source DROP NOT NULL,
ALTER COLUMN address DROP NOT NULL,
ALTER COLUMN post_code DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL;

-- Adicionar valores padrão
ALTER TABLE patients 
ALTER COLUMN gender SET DEFAULT 'male',
ALTER COLUMN preferred_language SET DEFAULT 'Português',
ALTER COLUMN clinic_branch SET DEFAULT 'Principal',
ALTER COLUMN referral_source SET DEFAULT 'Indicação',
ALTER COLUMN city SET DEFAULT 'São Paulo',
ALTER COLUMN state SET DEFAULT 'SP';
```

## ✅ **Resultado:**
Agora você pode criar pacientes apenas com o nome! 🎉
