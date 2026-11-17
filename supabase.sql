-- Diplomat Класс — база данных для сайта.
-- Как использовать: Supabase → SQL Editor → New query → вставить весь этот текст → Run.

-- 1. Данные учителя: классы, тесты, результаты, настройки
create table if not exists public.docs (
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner, col, id)
);
alter table public.docs enable row level security;
drop policy if exists "docs: owner only" on public.docs;
create policy "docs: owner only" on public.docs
  for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- 2. Игры «Итог месяца». В state нет правильных ответов, пока учитель их не покажет.
create table if not exists public.games (
  code text primary key check (code ~ '^[A-Z0-9]{6}$'),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  state jsonb not null default '{}'::jsonb,
  q_started_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.games enable row level security;
drop policy if exists "games: anyone reads" on public.games;
create policy "games: anyone reads" on public.games for select to anon, authenticated using (true);
drop policy if exists "games: owner writes" on public.games;
create policy "games: owner writes" on public.games for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- 3. Участники игры: только ник, удаляются после окончания игры
create table if not exists public.players (
  code text not null references public.games(code) on delete cascade,
  pid text not null check (char_length(pid) between 8 and 40),
  nick text not null check (char_length(nick) between 1 and 20),
  created_at timestamptz not null default now(),
  primary key (code, pid)
);
alter table public.players enable row level security;
drop policy if exists "players: join open game" on public.players;
create policy "players: join open game" on public.players for insert to anon, authenticated
  with check (exists (select 1 from public.games g where g.code = players.code and g.state->>'phase' in ('lobby','question','reveal','board')));
drop policy if exists "players: owner reads and removes" on public.players;
create policy "players: owner reads and removes" on public.players for select to authenticated
  using (exists (select 1 from public.games g where g.code = players.code and g.owner = auth.uid()));
drop policy if exists "players: owner deletes" on public.players;
create policy "players: owner deletes" on public.players for delete to authenticated
  using (exists (select 1 from public.games g where g.code = players.code and g.owner = auth.uid()));

-- Проверка «я ещё в игре?» для ученика после перезагрузки телефона (ник не раскрывается)
create or replace function public.kl_is_player(p_code text, p_pid text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from players where code = p_code and pid = p_pid);
$$;
grant execute on function public.kl_is_player(text, text) to anon, authenticated;

-- 4. Ответы: один ответ на вопрос, только пока вопрос открыт и время не вышло
create table if not exists public.answers (
  code text not null references public.games(code) on delete cascade,
  pid text not null,
  qi int not null,
  choice int not null check (choice between 0 and 5),
  created_at timestamptz not null default now(),
  primary key (code, pid, qi)
);
alter table public.answers enable row level security;
drop policy if exists "answers: player answers open question" on public.answers;
create policy "answers: player answers open question" on public.answers for insert to anon, authenticated
  with check (
    public.kl_is_player(answers.code, answers.pid)
    and exists (
      select 1 from public.games g
      where g.code = answers.code
        and g.state->>'phase' = 'question'
        and (g.state->>'qi')::int = answers.qi
        and now() <= g.q_started_at + make_interval(secs => coalesce((g.state->>'secs')::int, 20) + 1)
    )
  );
drop policy if exists "answers: owner reads" on public.answers;
create policy "answers: owner reads" on public.answers for select to authenticated
  using (exists (select 1 from public.games g where g.code = answers.code and g.owner = auth.uid()));
drop policy if exists "answers: owner deletes" on public.answers;
create policy "answers: owner deletes" on public.answers for delete to authenticated
  using (exists (select 1 from public.games g where g.code = answers.code and g.owner = auth.uid()));

-- 5. Смена состояния игры со временем сервера (для честного подсчёта скорости)
create or replace function public.kl_set_state(p_code text, p_state jsonb, p_start boolean)
returns timestamptz language plpgsql security invoker set search_path = public as $$
declare t timestamptz;
begin
  update games
     set state = p_state,
         q_started_at = case when p_start then now() else q_started_at end,
         updated_at = now()
   where code = p_code and owner = auth.uid()
  returning q_started_at into t;
  if not found then raise exception 'game not found'; end if;
  return t;
end $$;


-- 6. Мгновенные обновления
alter table public.games replica identity full;
alter table public.players replica identity full;
do $$ begin
  begin alter publication supabase_realtime add table public.games; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.players; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.answers; exception when duplicate_object then null; end;
end $$;
