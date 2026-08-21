-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Knowledge base table
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source text,
  category text default 'General',
  embedding vector(768),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.knowledge_base enable row level security;

-- Allow public read
create policy "Public can read knowledge base"
  on public.knowledge_base for select
  using (true);

-- Allow public insert (for admin uploads)
create policy "Public can insert knowledge base"
  on public.knowledge_base for insert
  with check (true);

-- Allow public delete
create policy "Public can delete knowledge base"
  on public.knowledge_base for delete
  using (true);

-- Vector similarity search function
create or replace function match_knowledge (
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  title text,
  content text,
  source text,
  category text,
  similarity float
)
language sql stable
as $$
  select
    kb.id,
    kb.title,
    kb.content,
    kb.source,
    kb.category,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
$$;
