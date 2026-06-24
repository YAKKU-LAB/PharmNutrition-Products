# 제품 관리 허브 — Supabase + Netlify 배포 가이드

## 1. Supabase 설정

1. https://supabase.com 에서 새 프로젝트 생성 (region은 가까운 곳, 예: Tokyo)
2. 프로젝트 대시보드 → **SQL Editor** → `supabase_setup.sql` 내용을 붙여넣고 실행
   → `app_state` 테이블이 생성되고 빈 행(id='main')이 하나 들어갑니다.
3. 프로젝트 대시보드 → **Settings → API** 에서 아래 2개 값 복사
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` 키 → `VITE_SUPABASE_ANON_KEY`

## 2. 로컬 실행 (선택)

```bash
npm install
cp .env.example .env
# .env 파일에 위에서 복사한 값 입력
npm run dev
```

## 3. Netlify 배포

이미 익숙하실 테니 핵심만:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables** (Site settings → Environment variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

GitHub 등에 push 후 Netlify에서 repo 연결하거나, `netlify deploy` CLI로 바로 올려도 됩니다.

## 4. 동작 방식

- 모든 데이터(`products`, `templates`, `vendors`, `staff`, `salesSheets`)는 `app_state` 테이블의
  단일 행(`id='main'`) 안에 JSONB로 통째로 저장됩니다. 기존 클로드 아티팩트 버전의 저장 구조와 동일합니다.
- 입력값이 바뀌면 0.6초 후 자동 저장됩니다 (화면 우하단에 저장 상태 표시).
- Supabase Realtime을 통해 다른 팀원이 저장한 변경 사항이 자동으로 화면에 반영됩니다
  (새로고침 없이 실시간 동기화).

## 5. 보안 관련 주의사항

- 로그인은 소스코드에 하드코딩된 비밀번호(`PW_VIEWER`, `PW_ADMIN`)로만 보호됩니다.
  배포된 사이트 URL과 비밀번호는 회사 내부에서만 공유하세요.
- Supabase `anon key`는 빌드된 JS 파일에 그대로 노출됩니다. 위 SQL의 RLS 정책은
  "anon key를 아는 사람은 누구나 읽기/쓰기 가능"한 수준입니다 — 지금의 비밀번호 보호 수준과
  동등하지만, 더 강한 보안(팀원별 로그인 등)이 필요해지면 Supabase Auth 도입을 고려하세요.
