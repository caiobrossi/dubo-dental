# 🖼️ CONFIGURAR STORAGE PARA AVATARES

## 🎯 **O que foi implementado:**
- ✅ Upload de imagens do computador
- ✅ Preview do avatar selecionado
- ✅ Validação de tipo e tamanho de arquivo
- ✅ Integração com Supabase Storage
- ✅ Botão para remover avatar

## 🔧 **Para funcionar, configure o Storage no Supabase:**

### **1. Criar bucket "avatars":**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **Storage** (menu lateral)
4. Clique em **"New bucket"**
5. **Nome**: `avatars`
6. **Public bucket**: ✅ Marque esta opção
7. Clique em **"Create bucket"**

### **2. Configurar políticas de acesso:**
1. Clique no bucket **"avatars"** criado
2. Vá para a aba **"Policies"**
3. Clique em **"New Policy"**

#### **Política para INSERT (upload):**
- **Policy name**: `Allow public uploads`
- **Allowed operation**: `INSERT`
- **Policy definition**: `true`
- **Target roles**: `public`

#### **Política para SELECT (visualização):**
- **Policy name**: `Allow public access`
- **Allowed operation**: `SELECT`
- **Policy definition**: `true`
- **Target roles**: `public`

### **3. Testar o upload:**
1. Volte para http://localhost:3000/patients
2. Clique em "Add new" → "Add new patient"
3. Clique em "Upload avatar"
4. Selecione uma imagem do seu computador
5. A imagem deve aparecer como preview

## ✅ **Funcionalidades implementadas:**

- **Seleção de arquivo**: Clique no botão abre seletor de arquivos
- **Validação**: Aceita apenas imagens até 5MB
- **Preview**: Mostra a imagem selecionada
- **Remoção**: Botão X para remover o avatar
- **Upload automático**: Salva no Supabase Storage
- **URL automática**: Atualiza o formulário com a URL da imagem

## 🔒 **Segurança:**
- **Tipo de arquivo**: Apenas imagens (image/*)
- **Tamanho máximo**: 5MB
- **Nome único**: Evita conflitos de arquivo
- **Bucket público**: Para desenvolvimento (em produção, configure autenticação)

## 🚀 **Após configurar:**
O upload de avatares funcionará perfeitamente! 🎉

## 📱 **Teste agora:**
1. Configure o bucket no Supabase
2. Teste o upload de uma imagem
3. Veja o preview funcionando
4. Salve o paciente com avatar
