-- Configurar Storage para avatares de pacientes
-- Execute este arquivo no SQL Editor do Supabase

-- 1. Criar bucket para avatares (se não existir)
-- Nota: Buckets são criados via Dashboard ou API, não via SQL
-- Vá para Storage > New bucket > Nome: "avatars" > Public bucket

-- 2. Configurar políticas de acesso para o bucket "avatars"
-- Permitir upload de imagens para todos (desenvolvimento)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow public uploads to avatars bucket',
  (SELECT id FROM storage.buckets WHERE name = 'avatars'),
  'INSERT',
  'true'
) ON CONFLICT DO NOTHING;

-- Permitir visualização pública das imagens
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow public access to avatars',
  (SELECT id FROM storage.buckets WHERE name = 'avatars'),
  'SELECT',
  'true'
) ON CONFLICT DO NOTHING;

-- 3. Alternativa: Se preferir criar via Dashboard:
-- 1. Vá para Storage no menu lateral
-- 2. Clique em "New bucket"
-- 3. Nome: "avatars"
-- 4. Marque "Public bucket" (permite acesso público)
-- 5. Clique em "Create bucket"

-- 4. Configurar políticas de acesso (via Dashboard):
-- 1. Clique no bucket "avatars"
-- 2. Vá para "Policies"
-- 3. Clique em "New Policy"
-- 4. Para INSERT: "true" (permite upload)
-- 5. Para SELECT: "true" (permite visualização)

-- 5. Verificar se o bucket foi criado:
-- SELECT * FROM storage.buckets WHERE name = 'avatars';
