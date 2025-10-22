# Configuração do Supabase

## Passos para configurar a autenticação:

### 1. Criar projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto e crie

### 2. Obter as credenciais
1. No dashboard do seu projeto, vá em "Settings" > "API"
2. Copie:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configurar variáveis de ambiente
1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

### 4. Configurar autenticação no Supabase
1. No dashboard, vá em "Authentication" > "Providers"
2. Ative "Email" provider
3. Em "Email Templates", você pode personalizar os emails enviados

### 5. Testar
1. Reinicie o servidor: `npm run dev`
2. Acesse `/criar-conta` e crie uma conta
3. Verifique seu email para confirmar
4. Faça login em `/login`

## Funcionalidades Implementadas

### Criar Conta (`/criar-conta`)
- ✅ Nome e sobrenome
- ✅ Email
- ✅ Password com validação (mínimo 6 caracteres)
- ✅ Repetir password com verificação
- ✅ Botão de mostrar/esconder password em ambos os campos
- ✅ Validações de campos obrigatórios
- ✅ Design limpo e moderno

### Login (`/login`)
- ✅ Email e password
- ✅ Botão de mostrar/esconder password
- ✅ Checkbox "Manter sessão iniciada por 30 dias"
  - Se marcado: sessão persiste por 30 dias (localStorage)
  - Se desmarcado: sessão expira ao fechar o browser (sessionStorage)
- ✅ Link para recuperar password
- ✅ Link para criar conta
- ✅ Design limpo e moderno

## Gestão de Sessões

- **Com "Manter sessão"**: A sessão fica guardada no localStorage e persiste por 30 dias
- **Sem "Manter sessão"**: A sessão fica no sessionStorage e expira ao fechar o browser
