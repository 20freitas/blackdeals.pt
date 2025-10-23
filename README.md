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

## Supabase: tabela `products` (produtos)

Tabela para armazenar os produtos da loja:

```sql
create table products (
	id uuid default gen_random_uuid() primary key,
	name text not null,
	description text,
	image_url text,
	price numeric(10, 2) not null,
	supplier_price numeric(10, 2),
	discount numeric(5, 2) default 0,
	final_price numeric(10, 2),
	stock integer default 0,
	available_units integer default 0,
	variants jsonb, -- Array de variantes: [{ name: "Tamanho", options: ["S", "M", "L"] }, { name: "Cor", options: ["Vermelho", "Azul"] }]
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- RLS: Permitir leitura para todos, escrita apenas para admins
alter table products enable row level security;

create policy "Products: select all" on products for select using (true);
create policy "Products: insert admin" on products for insert with check (
	exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Products: update admin" on products for update using (
	exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Products: delete admin" on products for delete using (
	exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
```

Notas:
- As variantes são guardadas em formato JSON para permitir flexibilidade
- O `final_price` é calculado automaticamente com base no preço e desconto

## Supabase: Storage para imagens de produtos

Crie um bucket público para as imagens dos produtos:

1. No painel do Supabase, vá a **Storage**
2. Clique em **Create bucket**
3. Nome: `product-images`
4. Marque como **Public bucket**
5. Clique em **Save**

As imagens serão carregadas automaticamente através do upload no formulário de produtos.

## Supabase: tabelas `orders` e `order_items` (encomendas)

Tabelas para armazenar as encomendas:

```sql
-- Tabela de encomendas
create table orders (
	id uuid default gen_random_uuid() primary key,
	user_id uuid references auth.users(id) on delete cascade not null,
	order_code text unique not null,
	total numeric(10, 2) not null,
	status text default 'pending', -- pending, processing, shipped, delivered, cancelled
	shipping_name text not null,
	shipping_email text not null,
	shipping_phone text not null,
	shipping_address text not null,
	shipping_city text not null,
	shipping_postal_code text not null,
	shipping_country text default 'Portugal',
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Tabela de items da encomenda
create table order_items (
	id uuid default gen_random_uuid() primary key,
	order_id uuid references orders(id) on delete cascade not null,
	product_id uuid references products(id) on delete set null,
	quantity integer not null,
	price numeric(10, 2) not null,
	variants jsonb, -- Variantes selecionadas: { "Tamanho": "M", "Cor": "Preto" }
	created_at timestamptz default now()
);

-- RLS: Permitir que users vejam apenas suas encomendas
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies para orders
create policy "Orders: select own" on orders for select using (auth.uid() = user_id);
create policy "Orders: insert own" on orders for insert with check (auth.uid() = user_id);
create policy "Orders: select admin" on orders for select using (
	exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Orders: update admin" on orders for update using (
	exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies para order_items
create policy "Order items: select own" on order_items for select using (
	exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "Order items: insert own" on order_items for insert with check (
	exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "Order items: select admin" on order_items for select using (
	exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
```

Notas:
- O código do frontend usa `supabase.from('profiles').upsert({...})` com `id = auth.user.id`. Garanta que a coluna `id` é a mesma `uuid` do `auth.users`.
- Durante o registo guardamos alguns campos em `user_metadata` e também tentamos criar/atualizar a linha em `profiles` para facilitar futuros envios/encomendas.
- Não esqueça de configurar as variáveis de ambiente em `.env.local` (ex.: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
