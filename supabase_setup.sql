-- Supabase 대시보드 → SQL Editor에서 그대로 실행하세요.

create table if not exists app_state (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 앱이 처음 켜질 때 읽어올 빈 행 1개를 미리 만들어둠
insert into app_state (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- RLS 활성화 + anon key로 읽기/쓰기 허용
-- (이 앱은 프론트엔드 비밀번호로만 보호되는 내부 도구이므로,
--  DB 단에서도 "팀 전체 허용" 수준으로 단순하게 열어둡니다.
--  단, anon key는 프론트엔드 코드에 노출되므로 절대 외부에 공개 링크로 뿌리지 마세요.)
alter table app_state enable row level security;

create policy "allow read" on app_state
  for select using (true);

create policy "allow update" on app_state
  for update using (true) with check (true);
