This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase: tabela `profiles` (migrations)

Este projecto usa Supabase para autenticação e uma tabela `profiles` para armazenar informação adicional do utilizador (role e dados de envio).

Crie a tabela no painel SQL do Supabase com a seguinte instrução (ou use uma migration):

```sql
create table profiles (
	id uuid references auth.users(id) on delete cascade primary key,
	first_name text,
	last_name text,
	email text,
	role text default 'user',
	phone text,
	address text,
	postal_code text,
	city text,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Recomenda-se activar Row Level Security e criar políticas adequadas.
alter table profiles enable row level security;

-- Política: permitir leitura/escrita apenas ao utilizador dono do perfil
create policy "Profiles: select own" on profiles for select using (auth.uid() = id);
create policy "Profiles: insert own" on profiles for insert with check (auth.uid() = id);
create policy "Profiles: update own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Ajuste as políticas conforme necessário (por exemplo, permitir que admins leiam todos os perfis).
```

Notas:
- O código do frontend usa `supabase.from('profiles').upsert({...})` com `id = auth.user.id`. Garanta que a coluna `id` é a mesma `uuid` do `auth.users`.
- Durante o registo guardamos alguns campos em `user_metadata` e também tentamos criar/atualizar a linha em `profiles` para facilitar futuros envios/encomendas.
- Não esqueça de configurar as variáveis de ambiente em `.env.local` (ex.: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
