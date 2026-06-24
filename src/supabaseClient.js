import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // 개발자 콘솔에서 바로 원인을 알 수 있도록 명확히 에러를 던짐
  console.error(
    "Supabase 환경변수가 없습니다. .env 파일(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) 또는 Netlify 환경변수를 확인하세요."
  );
}

export const supabase = createClient(url, anonKey);

// 모든 데이터를 하나의 행(id='main')에 JSONB로 저장하는 단순 구조
export const STATE_TABLE = "app_state";
export const STATE_ROW_ID = "main";
