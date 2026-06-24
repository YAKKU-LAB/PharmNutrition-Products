import { useState, useEffect, useRef } from "react";
import {
  Plus, ChevronRight, Trash2, ExternalLink, Check, AlertCircle,
  ArrowUp, ArrowDown, Settings, LogOut, X, BarChart2, Calendar,
  ChevronLeft, Lock, Package, List, GanttChartSquare, Link2, Edit2,
  ChevronsLeft, ChevronsRight, StickyNote, CloudOff, Loader2
} from "lucide-react";
import { supabase, STATE_TABLE, STATE_ROW_ID } from "./supabaseClient";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg: "#FAF8F4",
  sidebar: "#F0EBE3",
  card: "#FFFFFF",
  border: "#E8E0D0",
  accent: "#CF6744",
  accentLight: "#FEF0E8",
  text: "#1C1917",
  textSub: "#78716C",
  textMuted: "#A8A29E",
  textDark: "#44403C",
};

// ─── PASSWORDS ───────────────────────────────────────────────────────────────
const PW_VIEWER = "view1234";
const PW_ADMIN  = "admin9999";

// ─── BRAND LINES ────────────────────────────────────────────────────────────
const BRANDS = ["건강기능식품", "일반의약품", "화장품"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const mkSteps = (arr) => arr.map(s => ({ ...s, id: uid() }));
const pad2 = n => String(n).padStart(2, "0");
const fmt = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const dayDiff = (a, b) => Math.round(
  (new Date(b.getFullYear(), b.getMonth(), b.getDate()) -
   new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000
);

// ─── PIPELINE TEMPLATES ─────────────────────────────────────────────────────
const GF_STEPS = mkSteps([
  { name: "처방 검토", internalAssignee: "", externalVendor: "" },
  { name: "공인기관 기준규격/영양성분 분석 의뢰", internalAssignee: "", externalVendor: "" },
  { name: "품목제조신고/보고", internalAssignee: "", externalVendor: "" },
  { name: "광고심의 신청", internalAssignee: "", externalVendor: "" },
  { name: "디자인 컨셉 설정", internalAssignee: "", externalVendor: "" },
  { name: "칼선 수령", internalAssignee: "", externalVendor: "서흥 / 코스맥스" },
  { name: "패키지 디자인 의뢰", internalAssignee: "", externalVendor: "디자이너" },
  { name: "패키지 심의 신청", internalAssignee: "", externalVendor: "" },
  { name: "연계 디자인 작업 (포스터/와블러/강의록)", internalAssignee: "", externalVendor: "디자이너" },
  { name: "인쇄 발주", internalAssignee: "", externalVendor: "포스터 인쇄 업체 · 보문사 · 여름기획" },
  { name: "심의 통과 → 자재 발주", internalAssignee: "", externalVendor: "" },
  { name: "패키지 인쇄 및 QR 작업", internalAssignee: "", externalVendor: "네모인사이트" },
  { name: "원료/자재 진행", internalAssignee: "", externalVendor: "" },
  { name: "식품이력 등록", internalAssignee: "", externalVendor: "" },
  { name: "주문서 확정", internalAssignee: "", externalVendor: "" },
  { name: "생산 및 포장", internalAssignee: "", externalVendor: "서흥 / 코스맥스" },
  { name: "제품 입고  ⚠ D-2 필수", internalAssignee: "", externalVendor: "케이원" },
  { name: "재고 파악", internalAssignee: "", externalVendor: "케이원" },
  { name: "홈페이지 상세페이지 세팅  ⚠ D-1 필수", internalAssignee: "", externalVendor: "" },
  { name: "출시 행사 (23시간 한정)", internalAssignee: "", externalVendor: "" },
  { name: "출시 후 쇼핑몰 설정 조정", internalAssignee: "", externalVendor: "" },
]);

const CS_STEPS = mkSteps([
  { name: "기획 (컨셉/타겟 확정)", internalAssignee: "", externalVendor: "" },
  { name: "R&D / 처방 설계", internalAssignee: "", externalVendor: "" },
  { name: "ODM 시제품 발주", internalAssignee: "", externalVendor: "케미랜드" },
  { name: "시제품 검토 및 피드백", internalAssignee: "", externalVendor: "케미랜드" },
  { name: "처방 최종 확정", internalAssignee: "", externalVendor: "케미랜드" },
  { name: "법규·인허가 (전성분 INCI · 기능성 판단 · 안정성/안전성 시험)", internalAssignee: "", externalVendor: "" },
  { name: "디자인 컨셉 설정", internalAssignee: "", externalVendor: "" },
  { name: "칼선 수령", internalAssignee: "", externalVendor: "케미랜드" },
  { name: "패키지 디자인 의뢰", internalAssignee: "", externalVendor: "디자이너" },
  { name: "패키지 심의 신청", internalAssignee: "", externalVendor: "" },
  { name: "연계 디자인 (포스터/와블러/강의록)", internalAssignee: "", externalVendor: "디자이너" },
  { name: "인쇄 발주", internalAssignee: "", externalVendor: "포스터 인쇄 업체 · 보문사 · 여름기획" },
  { name: "심의 통과 → 자재 발주", internalAssignee: "", externalVendor: "" },
  { name: "패키지 인쇄 및 QR 작업", internalAssignee: "", externalVendor: "네모인사이트" },
  { name: "시생산 및 QC", internalAssignee: "", externalVendor: "케미랜드" },
  { name: "본 생산", internalAssignee: "", externalVendor: "케미랜드" },
  { name: "제품 입고  ⚠ D-2 필수", internalAssignee: "", externalVendor: "케이원" },
  { name: "재고 파악", internalAssignee: "", externalVendor: "케이원" },
  { name: "홈페이지 상세페이지 세팅  ⚠ D-1 필수", internalAssignee: "", externalVendor: "" },
  { name: "출시 행사", internalAssignee: "", externalVendor: "" },
  { name: "출시 후 쇼핑몰 설정 조정", internalAssignee: "", externalVendor: "" },
]);

const RX_STEPS = mkSteps([
  { name: "(추후 입력 예정 — 담당자 작성)", internalAssignee: "", externalVendor: "" },
]);

const INIT_TEMPLATES = { "건강기능식품": GF_STEPS, "일반의약품": RX_STEPS, "화장품": CS_STEPS };

const INIT_VENDORS = [
  { id: "v1", role: "건기식 ODM", name: "서흥", memo: "" },
  { id: "v2", role: "건기식 ODM", name: "코스맥스", memo: "" },
  { id: "v3", role: "화장품 ODM", name: "케미랜드", memo: "" },
  { id: "v4", role: "디자인", name: "디자이너", memo: "" },
  { id: "v5", role: "바코드/패키지", name: "네모인사이트", memo: "" },
  { id: "v6", role: "강의록", name: "보문사", memo: "" },
  { id: "v7", role: "포스터", name: "포스터 인쇄 업체", memo: "" },
  { id: "v8", role: "와블러", name: "여름기획", memo: "" },
  { id: "v9", role: "물류", name: "케이원", memo: "" },
];

const INIT_STAFF = [
  { id: "st1", name: "강지웅", memo: "" },
  { id: "st2", name: "최이원", memo: "" },
  { id: "st3", name: "이경민", memo: "" },
  { id: "st4", name: "수현", memo: "" },
  { id: "st5", name: "현미", memo: "" },
];

// 템플릿 → 실제 파이프라인 데이터 (시작일/목표일 통합 스키마, 담당자는 배열)
const mkPipeline = (template) =>
  template.map(s => {
    const { internalAssignee, ...rest } = s;
    return {
      ...rest,
      internalAssignees: internalAssignee ? [internalAssignee] : [],
      stepStatus: "pending", startDate: "", targetDate: "", notes: "", dataLinks: [],
    };
  });

// ── 샘플 데이터 (타임라인 데모용 날짜 분산 포함) ──────────────────────────────
const p1Start = new Date(2026, 3, 1);
const p1Pipeline = mkPipeline(GF_STEPS).map((s, i) => {
  const end = addDays(p1Start, i * 4);
  return {
    ...s,
    stepStatus: i < 4 ? "done" : i === 4 ? "in_progress" : i === 10 ? "delayed" : "pending",
    startDate: fmt(addDays(end, -3)), targetDate: fmt(end),
  };
});

const p3Start = new Date(2026, 4, 20);
const p3Pipeline = mkPipeline(GF_STEPS).map((s, i) => {
  if (i >= 15) return { ...s, stepStatus: "pending" };
  const end = addDays(p3Start, i * 3);
  return {
    ...s,
    stepStatus: i < 2 ? "done" : i === 2 ? "in_progress" : "pending",
    startDate: fmt(addDays(end, -2)), targetDate: fmt(end),
  };
});

const p2Start = new Date(2024, 1, 1);
const p2Pipeline = mkPipeline(GF_STEPS).map((s, i) => {
  const end = addDays(p2Start, i * 3);
  return { ...s, stepStatus: "done", startDate: fmt(addDays(end, -2)), targetDate: fmt(end) };
});

const SAMPLE = [
  {
    id: "p1", name: "더 파르마 크레아틴", brandLine: "건강기능식품", type: "new",
    status: "in_progress", productInfo: "정제 · 크레아틴 모노하이드레이트 · 병 포장 (90정)",
    manufacturer: "서흥", targetLaunchDate: "2026-06-15",
    reorderDate: "", renewalDate: "", notes: "6월 출시 예정",
    pipeline: p1Pipeline, links: [],
  },
  {
    id: "p2", name: "더 파르마 피크노제놀", brandLine: "건강기능식품", type: "existing",
    status: "launched", productInfo: "캡슐 · 피크노제놀 100mg (소나무껍질추출물) · PTP + 병 포장",
    manufacturer: "코스맥스", targetLaunchDate: "2024-03-01",
    reorderDate: "2026-07-10", renewalDate: "", notes: "",
    pipeline: p2Pipeline, links: [],
  },
  {
    id: "p3", name: "더 파르마 음주전후 2X", brandLine: "건강기능식품", type: "new",
    status: "planning", productInfo: "젤리스틱 · 밀크씨슬추출물, 비타민B군 · 파우치 1포 단위",
    manufacturer: "서흥", targetLaunchDate: "2026-07-01",
    reorderDate: "", renewalDate: "", notes: "",
    pipeline: p3Pipeline, links: [],
  },
];

// ─── 상태 설정 ───────────────────────────────────────────────────────────────
const PS = {
  planning:    { label: "기획중",   cls: "bg-purple-100 text-purple-700" },
  in_progress: { label: "진행중",   cls: "bg-blue-100 text-blue-700" },
  suspended:   { label: "중단",     cls: "bg-gray-100 text-gray-500" },
  launched:    { label: "출시완료", cls: "bg-green-100 text-green-700" },
};
const SS = {
  pending:     { label: "예정",   cls: "bg-gray-100 text-gray-400 border-gray-200", dot: "#D6D3D1" },
  in_progress: { label: "진행중", cls: "bg-blue-100 text-blue-700 border-blue-200", dot: C.accent },
  done:        { label: "완료",   cls: "bg-green-100 text-green-700 border-green-200", dot: "#22C55E" },
  delayed:     { label: "지연",   cls: "bg-red-100 text-red-600 border-red-200", dot: "#EF4444" },
};
const STATUS_BAR = { planning: "#A855F7", in_progress: C.accent, suspended: "#9CA3AF", launched: "#22C55E" };

// ─── 표시용 마이크로 컴포넌트 ──────────────────────────────────────────────
const Badge = ({ s }) => { const c = PS[s] || PS.planning; return <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${c.cls}`}>{c.label}</span>; };
const StepBadge = ({ s }) => { const c = SS[s] || SS.pending; return <span className={`text-xs font-medium px-2 py-0.5 rounded border whitespace-nowrap ${c.cls}`}>{c.label}</span>; };
const ProgressBar = ({ pipeline }) => {
  if (!pipeline?.length) return null;
  const done = pipeline.filter(s => s.stepStatus === "done").length;
  const pct  = Math.round((done / pipeline.length) * 100);
  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
      <div className="flex-1 rounded-full h-1.5" style={{ background: "#EDE9E3" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: C.accent }} />
      </div>
      <span className="whitespace-nowrap">{done}/{pipeline.length}</span>
    </div>
  );
};

// ─── 인라인 편집 컴포넌트 ─────────────────────────────────────────────────────
function InlineText({ value, onSave, isAdmin, placeholder = "—", textClass = "", multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  const wrapClass = multiline ? "whitespace-pre-wrap" : "";
  if (!isAdmin) return <span className={`${textClass} ${wrapClass}`} style={{ color: value ? undefined : C.textMuted }}>{value || placeholder}</span>;
  if (editing) {
    const commit = () => { setEditing(false); onSave(val); };
    return multiline ? (
      <textarea autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commit}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === "Escape") { setVal(value || ""); setEditing(false); } }}
        rows={3} className={`w-full text-sm border rounded-lg px-2.5 py-1.5 outline-none ${textClass}`}
        style={{ borderColor: C.accent }} />
    ) : (
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commit}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(value || ""); setEditing(false); } }}
        className={`border-b outline-none bg-transparent ${textClass}`}
        style={{ borderColor: C.accent, minWidth: 60 }} />
    );
  }
  return (
    <span onClick={e => { e.stopPropagation(); setVal(value || ""); setEditing(true); }}
      className={`cursor-text rounded px-1 -mx-1 hover:bg-stone-100 transition ${textClass} ${wrapClass}`}
      style={{ color: value ? undefined : C.textMuted }}>
      {value || placeholder}
    </span>
  );
}

// 업체용 — 항상 실제 input으로 렌더링 (클릭 1번에 드롭다운), 직접 입력도 가능
function InlineCombo({ value, onSave, isAdmin, placeholder = "—", textClass = "", listId }) {
  const [focused, setFocused] = useState(false);
  if (!isAdmin) return <span className={textClass} style={{ color: value ? undefined : C.textMuted }}>{value || placeholder}</span>;
  return (
    <input list={listId} defaultValue={value || ""} placeholder={placeholder}
      onClick={e => e.stopPropagation()}
      onFocus={() => setFocused(true)}
      onBlur={e => { setFocused(false); onSave(e.target.value); }}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
      className={`w-full text-right bg-transparent outline-none ${textClass}`}
      style={{ borderBottom: focused ? `1px solid ${C.accent}` : "1px solid transparent", color: value ? C.textDark : C.textMuted }} />
  );
}

// 담당자용 — 다중 선택 가능 (이름 칩 + 직접 입력)
function AssigneeCell({ names, isAdmin, onChange }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const list = names || [];
  if (!isAdmin) {
    return <span className="text-xs" style={{ color: list.length ? C.textDark : C.textMuted }}>{list.length ? list.join(", ") : "—"}</span>;
  }
  const add = () => { const v = input.trim(); if (!v || list.includes(v)) { setInput(""); return; } onChange([...list, v]); setInput(""); };
  const remove = (n) => onChange(list.filter(x => x !== n));
  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <span onClick={() => setOpen(o => !o)}
        className="text-xs cursor-pointer rounded px-1 -mx-1 hover:bg-stone-100 transition"
        style={{ color: list.length ? C.textDark : C.textMuted }}>
        {list.length ? list.join(", ") : "—"}
      </span>
      {open && (
        <div className="absolute z-30 top-6 right-0 w-56 rounded-xl border shadow-lg p-3" style={{ background: C.card, borderColor: C.border }}>
          {list.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {list.map(n => (
                <span key={n} className="text-xs pl-2 pr-1 py-0.5 rounded-full flex items-center gap-1" style={{ background: C.accentLight, color: C.accent }}>
                  {n}<button onClick={() => remove(n)}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
          <input list="staff-options" autoFocus value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add(); }}
            placeholder="이름 입력 후 Enter" className="w-full text-xs border rounded-lg px-2 py-1.5 outline-none" style={{ borderColor: C.border }} />
          <div className="flex justify-end mt-2">
            <button onClick={() => setOpen(false)} className="text-xs px-2 py-1" style={{ color: C.textSub }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

function InlineDate({ value, onSave, isAdmin, textClass = "", placeholder = "—", short = false }) {
  const [editing, setEditing] = useState(false);
  const display = value ? (short ? `${parseInt(value.slice(5, 7), 10)}/${parseInt(value.slice(8, 10), 10)}` : value) : placeholder;
  if (!isAdmin) return <span className={textClass} style={{ color: value ? undefined : C.textMuted }}>{display}</span>;
  if (editing) {
    return (
      <input autoFocus type="date" defaultValue={value || ""}
        onClick={e => e.stopPropagation()}
        onBlur={e => { setEditing(false); onSave(e.target.value); }}
        className={`border rounded px-2 py-1 text-sm outline-none ${textClass}`}
        style={{ borderColor: C.accent }} />
    );
  }
  return (
    <span onClick={e => { e.stopPropagation(); setEditing(true); }}
      className={`cursor-text rounded px-1 -mx-1 hover:bg-stone-100 transition ${textClass}`}
      style={{ color: value ? undefined : C.textMuted }}>
      {display}
    </span>
  );
}

function InlineSelect({ value, options, onSave, isAdmin, renderDisplay }) {
  const [editing, setEditing] = useState(false);
  if (!isAdmin) return renderDisplay ? renderDisplay(value) : <span>{value}</span>;
  if (editing) {
    return (
      <select autoFocus defaultValue={value} onBlur={() => setEditing(false)}
        onClick={e => e.stopPropagation()}
        onChange={e => { onSave(e.target.value); setEditing(false); }}
        className="text-xs border rounded-lg px-2 py-1 outline-none"
        style={{ borderColor: C.accent }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    );
  }
  return <span onClick={e => { e.stopPropagation(); setEditing(true); }} className="cursor-pointer">{renderDisplay ? renderDisplay(value) : value}</span>;
}

const EditField = ({ label, value, onSave, isAdmin, type = "text", placeholder = "—" }) => (
  <div className="rounded-xl p-4 border" style={{ background: C.card, borderColor: C.border }}>
    <div className="text-xs mb-1" style={{ color: C.textMuted }}>{label}</div>
    {type === "date" ? (
      <InlineDate value={value} onSave={onSave} isAdmin={isAdmin} textClass="text-sm font-medium" placeholder={placeholder} />
    ) : (
      <InlineText value={value} onSave={onSave} isAdmin={isAdmin} textClass="text-sm font-medium" placeholder={placeholder} />
    )}
  </div>
);

// ─── 데이터 링크 칩 (즉시 반응하는 커스텀 툴팁 + 확실한 클릭) ─────────────────
function LinkChip({ link }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button type="button"
        onClick={(e) => { e.stopPropagation(); window.open(link.url, "_blank", "noopener,noreferrer"); }}
        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 transition flex-shrink-0"
        style={{ background: "#F3F1EC" }}>
        <Link2 size={12} style={{ color: C.accent }} />
      </button>
      {hover && (
        <div className="absolute z-40 bottom-7 right-0 whitespace-nowrap text-xs px-2 py-1 rounded-lg shadow-lg pointer-events-none"
          style={{ background: C.text, color: "#fff" }}>
          {link.title}
        </div>
      )}
    </div>
  );
}

function LinkChips({ links, isAdmin, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [url, setUrl] = useState("");
  const addOne = () => { if (!title.trim() || !url.trim()) return; onAdd({ id: uid(), title: title.trim(), url: url.trim() }); setTitle(""); setUrl(""); };
  return (
    <div className="relative flex flex-wrap items-center justify-end gap-1" style={{ maxWidth: 130 }} onClick={e => e.stopPropagation()}>
      {links.map(l => <LinkChip key={l.id} link={l} />)}
      {isAdmin && (
        <button onClick={() => setOpen(o => !o)}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 transition flex-shrink-0"
          style={{ color: C.textMuted, border: `1px dashed ${C.border}` }}>
          <Plus size={12} />
        </button>
      )}
      {open && (
        <div className="absolute z-30 top-7 right-0 w-64 rounded-xl border shadow-lg p-3"
          style={{ background: C.card, borderColor: C.border }}>
          {links.length > 0 && (
            <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
              {links.map(l => (
                <div key={l.id} className="flex items-center justify-between text-xs px-2 py-1 rounded" style={{ background: "#F9F6F1" }}>
                  <span className="truncate flex-1" style={{ color: C.text }}>{l.title}</span>
                  <button onClick={() => onRemove(l.id)} style={{ color: C.textMuted }}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목 (예: Notion 기획안)"
            className="w-full text-xs border rounded-lg px-2 py-1.5 mb-1.5 outline-none" style={{ borderColor: C.border }} />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL"
            onKeyDown={e => e.key === "Enter" && addOne()}
            className="w-full text-xs border rounded-lg px-2 py-1.5 mb-2 outline-none" style={{ borderColor: C.border }} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-2 py-1" style={{ color: C.textSub }}>닫기</button>
            <button onClick={addOne} className="text-xs px-3 py-1 rounded-lg text-white" style={{ background: C.accent }}>추가</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    if (pw === PW_ADMIN)  { onAuth("admin");  return; }
    if (pw === PW_VIEWER) { onAuth("viewer"); return; }
    setErr("비밀번호가 맞지 않아요."); setTimeout(() => setErr(""), 2000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="rounded-2xl shadow-sm border p-10 w-80 text-center" style={{ background: C.card, borderColor: C.border }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: C.accentLight }}>
          <Lock size={20} style={{ color: C.accent }} />
        </div>
        <h1 className="text-lg font-bold mb-1" style={{ color: C.text }}>제품 관리 허브</h1>
        <p className="text-sm mb-6" style={{ color: C.textMuted }}>비밀번호를 입력해주세요</p>
        <input type="password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && go()}
          placeholder="비밀번호"
          className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 outline-none"
          style={{ borderColor: C.border }} autoFocus />
        <button onClick={go}
          className="w-full text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: C.accent }}>입장하기</button>
        {err && <p className="text-xs text-red-500 mt-3">{err}</p>}
      </div>
    </div>
  );
}

// ─── SIDEBAR (접기/펴기 지원) ─────────────────────────────────────────────────
function Sidebar({ view, onNav, isAdmin, onLogout }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    const iconBtn = (v, Icon, label) => {
      const active = view.type === v.type && (!v.brand || v.brand === view.brand);
      return (
        <button onClick={() => onNav(v)} title={label}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={active ? { background: C.accentLight, color: C.accent } : { color: C.textSub }}>
          <Icon size={16} />
        </button>
      );
    };
    return (
      <aside className="flex flex-col items-center w-14 h-screen flex-shrink-0 border-r py-5 gap-1.5"
        style={{ background: C.sidebar, borderColor: C.border }}>
        <button onClick={() => setOpen(true)} title="사이드바 펼치기"
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 hover:bg-stone-200/60 transition"
          style={{ color: C.textSub }}>
          <ChevronsRight size={16} />
        </button>
        {iconBtn({ type: "dashboard" }, BarChart2, "대시보드")}
        <div className="w-6 my-2 border-t" style={{ borderColor: C.border }} />
        {BRANDS.map(b => iconBtn({ type: "brand", brand: b }, Package, b))}
        {isAdmin && (
          <>
            <div className="w-6 my-2 border-t" style={{ borderColor: C.border }} />
            {iconBtn({ type: "settings" }, Settings, "설정")}
          </>
        )}
        <div className="flex-1" />
        <button onClick={onLogout} title="로그아웃"
          className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: C.textMuted }}>
          <LogOut size={15} />
        </button>
      </aside>
    );
  }

  const item = (label, v, Icon) => {
    const active = view.type === v.type && (!v.brand || v.brand === view.brand);
    return (
      <button onClick={() => onNav(v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors"
        style={ active
          ? { background: C.accentLight, color: C.accent, fontWeight: 600 }
          : { color: C.textSub }}>
        <Icon size={14} />
        {label}
      </button>
    );
  };
  return (
    <aside className="flex flex-col w-56 h-screen flex-shrink-0 border-r px-3 py-5"
      style={{ background: C.sidebar, borderColor: C.border }}>
      <div className="flex items-center justify-between px-2 mb-6">
        <div>
          <h1 className="text-sm font-bold" style={{ color: C.text }}>제품 관리 허브</h1>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{isAdmin ? "👑 관리자" : "👁 열람"}</p>
        </div>
        <button onClick={() => setOpen(false)} title="사이드바 접기"
          className="p-1.5 rounded-lg hover:bg-stone-200/60 transition flex-shrink-0" style={{ color: C.textSub }}>
          <ChevronsLeft size={14} />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5">
        {item("대시보드", { type: "dashboard" }, BarChart2)}
        <div className="pt-3 pb-1 px-2"><p className="text-xs font-semibold" style={{ color: C.textMuted }}>브랜드 라인</p></div>
        {BRANDS.map(b => item(b, { type: "brand", brand: b }, Package))}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-2"><p className="text-xs font-semibold" style={{ color: C.textMuted }}>관리자</p></div>
            {item("설정", { type: "settings" }, Settings)}
          </>
        )}
      </nav>
      <button onClick={onLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
        style={{ color: C.textMuted }}>
        <LogOut size={13} /> 로그아웃
      </button>
    </aside>
  );
}

// ─── 세일즈 시트 배너 ─────────────────────────────────────────────────────────
function SalesSheetBanners({ sheets }) {
  const valid = sheets.filter(s => s.url);
  if (valid.length === 0) return null;
  return (
    <div className={`grid gap-3 mb-6 ${valid.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {valid.map(s => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl p-4 border hover:shadow-sm transition"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
            <ExternalLink size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-green-800 truncate">{s.title || "발주/재고 시트"}</div>
            <div className="text-xs text-green-600">Google Sheets 바로가기 →</div>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── 공용 간트 차트 (연도/주 단위 눈금 포함) ──────────────────────────────────
const HEADER_H = 58; // 월(36) + 주(22)
const ROW_H = 48;

function buildRuler(minDate, maxDate, pxPerDay) {
  const totalDays = Math.max(dayDiff(minDate, maxDate), 14);
  const totalWidth = totalDays * pxPerDay;
  const monthMarks = [];
  let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  let lastYear = null;
  while (cur <= maxDate) {
    const offset = Math.max(0, dayDiff(minDate, cur) * pxPerDay);
    const showYear = cur.getFullYear() !== lastYear;
    monthMarks.push({ key: cur.getTime(), offset, label: showYear ? `${cur.getFullYear()}년 ${cur.getMonth() + 1}월` : `${cur.getMonth() + 1}월` });
    lastYear = cur.getFullYear();
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  const weekMarks = [];
  let w = 0;
  while (w * 7 <= totalDays) {
    weekMarks.push({ key: w, offset: w * 7 * pxPerDay, label: `${w + 1}W` });
    w++;
  }
  return { totalWidth, monthMarks, weekMarks };
}

function GanttChart({ rows, emptyMessage, leftWidth = 200, pxPerDay = 10 }) {
  const dated = rows.filter(r => r.start || r.end);
  if (dated.length === 0) {
    return (
      <div className="text-center py-12 text-sm rounded-2xl border" style={{ color: C.textMuted, borderColor: C.border }}>
        {emptyMessage}
      </div>
    );
  }
  const allDates = dated.flatMap(r => [r.start, r.end].filter(Boolean));
  let minDate = new Date(Math.min(...allDates));
  let maxDate = new Date(Math.max(...allDates));
  minDate = addDays(minDate, -4);
  maxDate = addDays(maxDate, 4);
  const { totalWidth, monthMarks, weekMarks } = buildRuler(minDate, maxDate, pxPerDay);
  const today = new Date();
  const todayOffset = (today >= minDate && today <= maxDate) ? dayDiff(minDate, today) * pxPerDay : null;

  return (
    <div className="flex border rounded-2xl overflow-hidden" style={{ borderColor: C.border, background: C.card }}>
      <div className="flex-shrink-0 border-r" style={{ width: leftWidth, borderColor: C.border }}>
        <div className="border-b" style={{ height: HEADER_H, borderColor: C.border }} />
        {rows.map(r => (
          <div key={r.id} onClick={r.onClick} title={r.label}
            className={`flex items-center px-3 text-xs border-b truncate ${r.onClick ? "cursor-pointer hover:bg-stone-50" : ""}`}
            style={{ height: ROW_H, borderColor: "#F5F1EA", color: C.text }}>
            {r.label}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto flex-1">
        <div style={{ width: totalWidth, position: "relative" }}>
          <div className="relative border-b" style={{ height: 36, borderColor: C.border }}>
            {monthMarks.map(m => (
              <div key={m.key} className="absolute top-0 h-full flex items-center text-xs font-medium px-2 border-l whitespace-nowrap"
                style={{ left: m.offset, borderColor: "#F5F1EA", color: C.textSub }}>{m.label}</div>
            ))}
          </div>
          <div className="relative border-b" style={{ height: 22, borderColor: C.border }}>
            {weekMarks.map(w => (
              <div key={w.key} className="absolute top-0 h-full flex items-center text-[10px] px-1.5 border-l"
                style={{ left: w.offset, borderColor: "#F8F4EC", color: C.textMuted }}>{w.label}</div>
            ))}
          </div>
          {todayOffset != null && (
            <div className="absolute border-l border-dashed z-10" style={{ left: todayOffset, top: HEADER_H, bottom: 0, borderColor: C.accent }} />
          )}
          {rows.map(r => {
            const s = r.start ? dayDiff(minDate, r.start) * pxPerDay : null;
            const e = r.end ? dayDiff(minDate, r.end) * pxPerDay : null;
            return (
              <div key={r.id} onClick={r.onClick}
                className={`border-b relative ${r.onClick ? "cursor-pointer hover:bg-stone-50/60" : ""}`}
                style={{ height: ROW_H, borderColor: "#F5F1EA" }}>
                <div className="absolute left-0 right-0 top-1/2" style={{ borderTop: "1px solid #EDE9E3" }} />
                {s != null && e != null ? (
                  <div title={r.label} className="absolute rounded-full"
                    style={{ left: Math.min(s, e), width: Math.max(Math.abs(e - s), 10), top: "50%", transform: "translateY(-50%)", height: 10, background: r.color }} />
                ) : (s != null || e != null) ? (
                  <div title={r.label} className="absolute rounded-full border-2 border-white shadow-sm"
                    style={{ left: (s ?? e) - 7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, background: r.color, zIndex: 2 }} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PipelineTimeline({ pipeline }) {
  const rows = pipeline.map(step => ({
    id: step.id, label: step.name,
    start: step.startDate ? new Date(step.startDate) : null,
    end: step.targetDate ? new Date(step.targetDate) : null,
    color: SS[step.stepStatus]?.dot || SS.pending.dot,
  }));
  return (
    <GanttChart rows={rows} leftWidth={208}
      emptyMessage={<>단계별 날짜를 입력하면 타임라인이 표시돼요.<br />체크리스트 탭에서 시작일·목표일을 추가해보세요.</>} />
  );
}

function DashboardTimeline({ products, onNav }) {
  const rows = products.map(p => {
    const stepDates = (p.pipeline || []).flatMap(s => [s.startDate, s.targetDate]).filter(Boolean).map(d => new Date(d));
    const start = stepDates.length ? new Date(Math.min(...stepDates)) : null;
    const end = p.targetLaunchDate ? new Date(p.targetLaunchDate) : (stepDates.length ? new Date(Math.max(...stepDates)) : null);
    return {
      id: p.id, label: p.name, start, end,
      color: STATUS_BAR[p.status] || STATUS_BAR.planning,
      onClick: () => onNav({ type: "brand", brand: p.brandLine, expandId: p.id }),
    };
  });
  return <GanttChart rows={rows} leftWidth={180} emptyMessage="날짜 정보가 있는 제품이 없어요." />;
}

// ─── 대시보드 ────────────────────────────────────────────────────────────────
function Dashboard({ products, salesSheets, onNav }) {
  const [tab, setTab] = useState("list");
  const stats = BRANDS.map(b => {
    const bp = products.filter(p => p.brandLine === b);
    const next = bp.filter(p => p.targetLaunchDate && p.status !== "launched")
      .sort((a, x) => new Date(a.targetLaunchDate) - new Date(x.targetLaunchDate))[0];
    return { brand: b, total: bp.length, active: bp.filter(p => ["in_progress", "planning"].includes(p.status)).length, next };
  });
  const upcoming = products
    .filter(p => p.targetLaunchDate && p.status !== "launched")
    .sort((a, b) => new Date(a.targetLaunchDate) - new Date(b.targetLaunchDate)).slice(0, 6);
  const delayed = products.filter(p => p.pipeline?.some(s => s.stepStatus === "delayed"));

  return (
    <div className="p-8 max-w-5xl">
      <h2 className="text-xl font-bold mb-5" style={{ color: C.text }}>전체 현황</h2>

      <SalesSheetBanners sheets={salesSheets} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <button key={s.brand} onClick={() => onNav({ type: "brand", brand: s.brand })}
            className="rounded-2xl p-5 text-left border hover:shadow-md transition-all"
            style={{ background: C.card, borderColor: C.border }}>
            <div className="text-xs font-medium mb-3" style={{ color: C.textSub }}>{s.brand}</div>
            <div className="text-3xl font-bold mb-3" style={{ color: C.text }}>{s.total}</div>
            <div className="text-xs" style={{ color: C.textMuted }}>진행중 {s.active} · 총 {s.total}</div>
            {s.next && (
              <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: "#F0EBE3", color: C.accent }}>
                다음 출시 → {s.next.name.slice(0, 14)}{s.next.name.length > 14 ? "…" : ""}<br />
                <span style={{ color: C.textMuted }}>{s.next.targetLaunchDate}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[["list", "목록", List], ["timeline", "타임라인", GanttChartSquare]].map(([v, l, Icon]) => (
          <button key={v} onClick={() => setTab(v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={tab === v ? { background: C.accent, color: "#fff" } : { background: C.card, color: C.textSub, border: `1px solid ${C.border}` }}>
            <Icon size={12} /> {l}
          </button>
        ))}
      </div>

      {tab === "timeline" ? (
        <DashboardTimeline products={products} onNav={onNav} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="rounded-2xl border p-6 mb-4" style={{ background: C.card, borderColor: C.border }}>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: C.textSub }}>
                <Calendar size={14} style={{ color: C.accent }} /> 출시 예정
              </h3>
              <div className="space-y-2">
                {upcoming.map(p => (
                  <button key={p.id} onClick={() => onNav({ type: "brand", brand: p.brandLine, expandId: p.id })}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition text-left">
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: C.text }}>{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{p.brandLine} · 목표 {p.targetLaunchDate}</div>
                    </div>
                    <div className="w-28"><ProgressBar pipeline={p.pipeline} /></div>
                    <ChevronRight size={13} style={{ color: C.border }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {delayed.length > 0 && (
            <div className="rounded-2xl p-5 border border-red-100 bg-red-50">
              <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertCircle size={14} /> 지연 항목 있는 제품
              </h3>
              {delayed.map(p => (
                <button key={p.id} onClick={() => onNav({ type: "brand", brand: p.brandLine, expandId: p.id })}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:underline mb-1">
                  <ChevronRight size={12} /> {p.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── 파이프라인 체크리스트 ────────────────────────────────────────────────────
const ROW_COLS = "26px minmax(130px,1fr) 110px 90px 112px 112px 18px";
const TABLE_MIN_WIDTH = 700;

function PipelineChecklist({ pipeline, isAdmin, onUpdateStep, staff, vendors }) {
  const [expanded, setExpanded] = useState(null);
  const currentIdx = pipeline.findIndex(s => s.stepStatus === "in_progress");

  return (
    <div className="overflow-x-auto">
      <datalist id="staff-options">{staff.map(s => <option key={s.id} value={s.name} />)}</datalist>
      <datalist id="vendor-options">{vendors.map(v => <option key={v.id} value={v.name} />)}</datalist>

      <div style={{ minWidth: TABLE_MIN_WIDTH }}>
        <div className="grid gap-2 px-2 mb-2" style={{ gridTemplateColumns: ROW_COLS }}>
          <div />
          <div className="text-xs font-medium" style={{ color: C.textMuted }}>단계</div>
          <div className="text-xs font-medium text-right" style={{ color: C.textMuted }}>담당자</div>
          <div className="text-xs font-medium text-right" style={{ color: C.textMuted }}>업체</div>
          <div className="text-xs font-medium text-right" style={{ color: C.textMuted }}>기간</div>
          <div className="text-xs font-medium text-right" style={{ color: C.textMuted }}>링크</div>
          <div />
        </div>
        <div className="space-y-2">
          {pipeline.map((step, idx) => {
            const isExp = expanded === idx;
            const isCur = idx === currentIdx;
            return (
              <div key={step.id || idx} className="rounded-xl border"
                style={{ borderColor: isCur ? C.accent : C.border, boxShadow: isCur ? `0 0 0 1px ${C.accent}` : undefined }}>
                <div className="grid gap-2 items-center px-2 py-3" style={{ gridTemplateColumns: ROW_COLS }}>
                  <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: step.stepStatus === "done" ? "#22C55E" :
                                    step.stepStatus === "in_progress" ? C.accent :
                                    step.stepStatus === "delayed" ? "#EF4444" : "#EDE9E3",
                        color: step.stepStatus === "pending" ? "#A8A29E" : "#fff",
                      }}>
                      {step.stepStatus === "done" ? <Check size={12} /> : idx + 1}
                    </div>
                  </div>

                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <InlineText value={step.name} isAdmin={isAdmin}
                      onSave={v => onUpdateStep(idx, { name: v })}
                      textClass="text-sm font-medium" />
                    <InlineSelect value={step.stepStatus} isAdmin={isAdmin}
                      options={Object.entries(SS).map(([v, c]) => [v, c.label])}
                      onSave={v => onUpdateStep(idx, { stepStatus: v })}
                      renderDisplay={v => <StepBadge s={v} />} />
                  </div>

                  <div className="text-right">
                    <AssigneeCell names={step.internalAssignees} isAdmin={isAdmin}
                      onChange={arr => onUpdateStep(idx, { internalAssignees: arr })} />
                  </div>
                  <div className="text-right">
                    <InlineCombo value={step.externalVendor} isAdmin={isAdmin} placeholder="—" listId="vendor-options"
                      textClass="text-xs" onSave={v => onUpdateStep(idx, { externalVendor: v })} />
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs whitespace-nowrap" style={{ color: C.textDark }}>
                    <InlineDate value={step.startDate} isAdmin={isAdmin} placeholder="—" short
                      onSave={v => onUpdateStep(idx, { startDate: v })} />
                    <span style={{ color: C.textMuted }}>~</span>
                    <InlineDate value={step.targetDate} isAdmin={isAdmin} placeholder="—" short
                      onSave={v => onUpdateStep(idx, { targetDate: v })} />
                  </div>
                  <div className="flex justify-end">
                    <LinkChips links={step.dataLinks || []} isAdmin={isAdmin}
                      onAdd={link => onUpdateStep(idx, { dataLinks: [...(step.dataLinks || []), link] })}
                      onRemove={id => onUpdateStep(idx, { dataLinks: (step.dataLinks || []).filter(l => l.id !== id) })} />
                  </div>
                  <button onClick={() => setExpanded(isExp ? null : idx)} style={{ color: C.border }}>
                    <span style={{ display: "inline-block", transform: isExp ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>▾</span>
                  </button>
                </div>

                {/* 메모: 내용이 있을 때만 토글 없이 항상 표시 */}
                {step.notes && (
                  <div className="px-3 pb-2.5 -mt-1 flex items-start gap-1.5 text-xs" style={{ color: C.textDark }}>
                    <span className="flex-shrink-0">📝</span>
                    <InlineText value={step.notes} isAdmin={isAdmin}
                      onSave={v => onUpdateStep(idx, { notes: v })} />
                  </div>
                )}

                {isExp && !step.notes && isAdmin && (
                  <div className="px-4 pb-3 pt-2 flex items-center gap-1.5 text-xs border-t" style={{ borderColor: "#F0EBE3", color: C.textDark }}>
                    📝
                    <InlineText value={step.notes} isAdmin={isAdmin} placeholder="메모 추가"
                      onSave={v => onUpdateStep(idx, { notes: v })} />
                  </div>
                )}
                {isExp && !isAdmin && !step.notes && (
                  <div className="px-4 pb-3 pt-2 text-xs border-t" style={{ borderColor: "#F0EBE3", color: C.textMuted }}>
                    메모 없음
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 제품 카드 (아코디언) ─────────────────────────────────────────────────────
function ProductCard({ product, isAdmin, isExpanded, onToggle, onUpdate, onUpdatePipeline, onDelete, staff, vendors }) {
  const [pipeTab, setPipeTab] = useState("checklist");
  const [addingLink, setAddingLink] = useState(false);
  const [lt, setLt] = useState(""); const [lu, setLu] = useState("");

  const set = (key) => (v) => onUpdate({ ...product, [key]: v });
  const updateStep = (idx, updates) => {
    const next = product.pipeline.map((s, i) => i === idx ? { ...s, ...updates } : s);
    onUpdatePipeline(next);
  };
  const addLink = () => {
    if (!lt || !lu) return;
    onUpdate({ ...product, links: [...(product.links || []), { id: uid(), title: lt, url: lu }] });
    setLt(""); setLu(""); setAddingLink(false);
  };
  const rmLink = (id) => onUpdate({ ...product, links: product.links.filter(l => l.id !== id) });

  const pipeline = product.pipeline || [];
  const done = pipeline.filter(s => s.stepStatus === "done").length;
  const pct = pipeline.length ? Math.round((done / pipeline.length) * 100) : 0;

  return (
    <div className="rounded-2xl border" style={{ background: C.card, borderColor: isExpanded ? C.accent : C.border }}>
      <div className={`p-5 cursor-pointer hover:bg-stone-50/50 transition rounded-t-2xl ${!isExpanded ? "rounded-b-2xl" : ""}`}
        onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <InlineSelect value={product.type} isAdmin={isAdmin}
                options={[["new", "신제품"], ["existing", "기존제품"]]}
                onSave={set("type")}
                renderDisplay={v => <span className="text-xs font-medium" style={{ color: C.textMuted }}>{v === "new" ? "신제품" : "기존제품"}</span>} />
              <InlineSelect value={product.status} isAdmin={isAdmin}
                options={Object.entries(PS).map(([v, c]) => [v, c.label])}
                onSave={set("status")}
                renderDisplay={v => <Badge s={v} />} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: C.text }}>
              <InlineText value={product.name} isAdmin={isAdmin} onSave={set("name")} textClass="text-base font-semibold" />
            </h3>
            {product.type === "existing" && product.reorderDate && (
              <div className="text-xs mb-2" style={{ color: C.accent }}>재발주 {product.reorderDate}</div>
            )}
            {product.notes && (
              <div className="flex items-start gap-1.5 text-xs mb-2" style={{ color: C.textDark }}>
                <span className="flex-shrink-0">📝</span><span className="truncate">{product.notes}</span>
              </div>
            )}
            {pipeline.length > 0 && <ProgressBar pipeline={pipeline} />}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* 생산업체/목표출시일 배너 — 토글 없이도 항상 보임 */}
            <div className="flex flex-col items-end gap-1">
              {product.manufacturer && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap" style={{ background: C.accentLight, color: C.accent }}>
                  {product.manufacturer}
                </span>
              )}
              {product.targetLaunchDate && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                  목표 {product.targetLaunchDate}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); if (window.confirm(`"${product.name}" 삭제할까요?`)) onDelete(product.id); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500" style={{ color: C.textMuted }}><Trash2 size={13} /></button>
              )}
              <div className="p-1.5" style={{ color: C.textMuted }}>
                <span style={{ display: "inline-block", transform: isExpanded ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>▾</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t px-5 pb-5 pt-4 rounded-b-2xl" style={{ borderColor: "#F0EBE3", background: "#FDFCFA" }}>
          <div className="rounded-xl p-4 border mb-3" style={{ background: C.card, borderColor: C.border }}>
            <div className="text-xs mb-1" style={{ color: C.textMuted }}>제품정보</div>
            <InlineText value={product.productInfo} isAdmin={isAdmin} onSave={set("productInfo")}
              placeholder="제형, 주성분, 포장 등을 적어주세요" multiline textClass="text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <EditField label="생산 업체" value={product.manufacturer} isAdmin={isAdmin} onSave={set("manufacturer")} />
            <EditField label="목표 출시일" type="date" value={product.targetLaunchDate} isAdmin={isAdmin} onSave={set("targetLaunchDate")} />
            {product.type === "existing" && (
              <>
                <EditField label="재발주 예정일" type="date" value={product.reorderDate} isAdmin={isAdmin} onSave={set("reorderDate")} />
                <EditField label="리뉴얼 예정일" type="date" value={product.renewalDate} isAdmin={isAdmin} onSave={set("renewalDate")} />
              </>
            )}
          </div>

          <div className="rounded-xl p-4 border mb-5" style={{ background: C.card, borderColor: C.border }}>
            <div className="text-xs mb-1" style={{ color: C.textMuted }}>메모</div>
            <InlineText value={product.notes} isAdmin={isAdmin} onSave={set("notes")} placeholder="특이사항을 적어주세요" multiline textClass="text-sm" />
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2" style={{ color: C.textSub }}>링크</h4>
            <div className="space-y-2">
              {(product.links || []).map(l => (
                <div key={l.id} className="flex items-center gap-2">
                  <a href={l.url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-3 rounded-xl p-3.5 border hover:shadow-sm transition"
                    style={{ background: C.card, borderColor: C.border }}>
                    <ExternalLink size={13} style={{ color: C.accent }} />
                    <span className="text-sm flex-1" style={{ color: C.text }}>{l.title}</span>
                    <ChevronRight size={12} style={{ color: C.border }} />
                  </a>
                  {isAdmin && <button onClick={() => rmLink(l.id)} style={{ color: C.textMuted }}><X size={14} /></button>}
                </div>
              ))}
            </div>
            {isAdmin && (
              addingLink ? (
                <div className="flex gap-2 mt-2">
                  <input value={lt} onChange={e => setLt(e.target.value)} placeholder="링크 이름 (예: Notion)"
                    className="flex-1 text-xs border rounded-xl px-3 py-2" style={{ borderColor: C.border }} />
                  <input value={lu} onChange={e => setLu(e.target.value)} placeholder="URL"
                    className="flex-1 text-xs border rounded-xl px-3 py-2" style={{ borderColor: C.border }} />
                  <button onClick={addLink} className="text-white px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: C.accent }}>추가</button>
                  <button onClick={() => setAddingLink(false)} style={{ color: C.textMuted }}><X size={14} /></button>
                </div>
              ) : (
                <button onClick={() => setAddingLink(true)}
                  className="flex items-center gap-1.5 text-xs mt-2 px-3 py-1.5 rounded-lg border hover:bg-stone-50 transition"
                  style={{ borderColor: C.border, color: C.accent }}>
                  <Plus size={11} /> 링크 추가
                </button>
              )
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold" style={{ color: C.textSub }}>출시 파이프라인</h4>
              <span className="text-xs" style={{ color: C.textMuted }}>{done}/{pipeline.length} 완료 · {pct}%</span>
            </div>
            <div className="rounded-full h-2 mb-4" style={{ background: "#EDE9E3" }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: C.accent }} />
            </div>
            <div className="flex gap-2 mb-3">
              {[["checklist", "체크리스트", List], ["timeline", "타임라인", GanttChartSquare]].map(([v, l, Icon]) => (
                <button key={v} onClick={() => setPipeTab(v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  style={pipeTab === v ? { background: C.accent, color: "#fff" } : { background: C.card, color: C.textSub, border: `1px solid ${C.border}` }}>
                  <Icon size={12} /> {l}
                </button>
              ))}
            </div>
            {pipeTab === "checklist" ? (
              <PipelineChecklist pipeline={pipeline} isAdmin={isAdmin} onUpdateStep={updateStep} staff={staff} vendors={vendors} />
            ) : (
              <PipelineTimeline pipeline={pipeline} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 브랜드 뷰 ───────────────────────────────────────────────────────────────
function BrandView({ brand, products, isAdmin, initialExpandId, onAdd, onUpdate, onUpdatePipeline, onDelete, staff, vendors }) {
  const [typeF, setTypeF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [expandedIds, setExpandedIds] = useState(() => initialExpandId ? new Set([initialExpandId]) : new Set());
  const toggle = (id) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = products.filter(p =>
    (typeF === "all" || p.type === typeF) &&
    (statusF === "all" || p.status === statusF)
  );
  const filterBtn = (active, label, onClick) => (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
      style={active ? { background: C.accent, color: "#fff" } : { background: C.card, color: C.textSub, border: `1px solid ${C.border}` }}>
      {label}
    </button>
  );
  const statusFilters = [["all", "전체"], ...Object.entries(PS).map(([v, c]) => [v, c.label])];

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>{brand}</h2>
          <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>총 {products.length}개 제품</p>
        </div>
        {isAdmin && (
          <button onClick={onAdd}
            className="flex items-center gap-1.5 text-white text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ background: C.accent }}>
            <Plus size={14} /> 제품 추가
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {[["all", "전체"], ["new", "신제품"], ["existing", "기존제품"]].map(([v, l]) =>
          filterBtn(typeF === v, l, () => setTypeF(v))
        )}
        <div style={{ width: 1, background: C.border, margin: "0 4px" }} />
        {statusFilters.map(([v, l]) => filterBtn(statusF === v, l, () => setStatusF(v)))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm" style={{ color: C.textMuted }}>제품이 없어요</div>
        )}
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} isAdmin={isAdmin}
            isExpanded={expandedIds.has(p.id)} onToggle={() => toggle(p.id)}
            onUpdate={onUpdate} onUpdatePipeline={pipe => onUpdatePipeline(p.id, pipe)}
            onDelete={onDelete} staff={staff} vendors={vendors} />
        ))}
      </div>
    </div>
  );
}

// ─── 제품 추가 모달 ───────────────────────────────────────────────────────────
function AddProductModal({ brandLine, pipelineTemplates, onSave, onClose }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState(brandLine || BRANDS[0]);
  const [type, setType] = useState("new");
  const save = () => {
    if (!name.trim()) { alert("제품명을 입력해주세요."); return; }
    onSave({
      id: uid(), name: name.trim(), brandLine: brand, type, status: "planning",
      productInfo: "", manufacturer: "",
      targetLaunchDate: "", reorderDate: "", renewalDate: "",
      notes: "", links: [], pipeline: mkPipeline(pipelineTemplates[brand] || []),
    });
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl shadow-xl w-full max-w-sm" style={{ background: C.card }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h3 className="font-bold" style={{ color: C.text }}>제품 추가</h3>
          <button onClick={onClose} style={{ color: C.textMuted }}><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textMuted }}>브랜드 라인</label>
            <select value={brand} onChange={e => setBrand(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2" style={{ borderColor: C.border }}>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textMuted }}>구분</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2" style={{ borderColor: C.border }}>
              <option value="new">신제품</option>
              <option value="existing">기존제품</option>
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textMuted }}>제품명 *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()} placeholder="제품명"
              className="w-full text-sm border rounded-xl px-3 py-2" style={{ borderColor: C.border }} />
          </div>
          <p className="text-xs" style={{ color: C.textMuted }}>나머지 항목은 추가 후 카드를 펼쳐서 바로 입력할 수 있어요.</p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={onClose} className="px-4 py-2 text-sm" style={{ color: C.textSub }}>취소</button>
          <button onClick={save} className="px-5 py-2 text-sm text-white rounded-xl font-semibold" style={{ background: C.accent }}>추가</button>
        </div>
      </div>
    </div>
  );
}

// ─── 파이프라인 템플릿 편집 (설정) ────────────────────────────────────────────
function PipelineEditor({ brand, template, onChange, onBack }) {
  const [steps, setSteps] = useState(template);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState("");

  const commit = (next) => { setSteps(next); onChange(next); };
  const move = (idx, dir) => {
    const nx = [...steps]; const to = idx + dir;
    if (to < 0 || to >= nx.length) return;
    [nx[idx], nx[to]] = [nx[to], nx[idx]]; commit(nx);
  };
  const del = (idx) => { if (!window.confirm("삭제할까요?")) return; commit(steps.filter((_, i) => i !== idx)); };
  const add = () => { if (!newName.trim()) return; commit([...steps, { id: uid(), name: newName.trim(), internalAssignee: "", externalVendor: "" }]); setNewName(""); setAdding(false); };
  const saveEdit = (idx) => { commit(steps.map((s, i) => i === idx ? { ...s, name: editName } : s)); setEditIdx(null); };

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4 transition-colors hover:opacity-70" style={{ color: C.textMuted }}>
        <ChevronLeft size={15} /> 설정으로
      </button>
      <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>파이프라인 편집</h2>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>{brand}</p>
      <div className="space-y-2 mb-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="rounded-xl border flex items-center gap-3 px-4 py-3"
            style={{ background: C.card, borderColor: C.border }}>
            <span className="text-xs w-5 text-center font-mono" style={{ color: C.textMuted }}>{idx + 1}</span>
            {editIdx === idx ? (
              <input autoFocus value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveEdit(idx)}
                onBlur={() => saveEdit(idx)}
                className="flex-1 text-sm border-b outline-none pb-0.5"
                style={{ borderColor: C.accent }} />
            ) : (
              <span className="flex-1 text-sm" style={{ color: C.text }}>{step.name}</span>
            )}
            <div className="flex items-center gap-0.5">
              <button onClick={() => { setEditIdx(idx); setEditName(step.name); }}
                className="p-1.5 rounded hover:bg-stone-100" style={{ color: C.textMuted }}><Edit2 size={12} /></button>
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30" style={{ color: C.textMuted }}><ArrowUp size={12} /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === steps.length - 1}
                className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30" style={{ color: C.textMuted }}><ArrowDown size={12} /></button>
              <button onClick={() => del(idx)}
                className="p-1.5 rounded hover:bg-red-50 hover:text-red-500" style={{ color: C.textMuted }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="flex gap-2">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()} placeholder="단계 이름"
            className="flex-1 text-sm border rounded-xl px-3 py-2" style={{ borderColor: C.border }} />
          <button onClick={add} className="text-white px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: C.accent }}>추가</button>
          <button onClick={() => { setAdding(false); setNewName(""); }}
            className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: C.border, color: C.textSub }}>취소</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border w-full justify-center hover:bg-stone-50 transition"
          style={{ borderColor: C.border, color: C.accent }}>
          <Plus size={13} /> 단계 추가
        </button>
      )}
      <div className="mt-4 p-3 rounded-xl border border-amber-100 bg-amber-50 text-xs text-amber-700">
        ⚠ 템플릿 편집은 이후 추가되는 제품에만 적용됩니다. 기존 제품의 파이프라인에는 영향을 주지 않아요.
      </div>
    </div>
  );
}

// ─── 마스터 항목 (담당자/협력사 공용 — 이름 + 메모, 시각적으로 구분) ───────────
function MasterItem({ name, memo, onUpdateMemo, onRemove }) {
  const [editing, setEditing] = useState(false);
  const hasMemo = !!(memo && memo.trim());
  return (
    <div className="rounded-lg mb-1.5 px-3 py-2.5" style={{ background: "#F9F6F1" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: C.text }}>{name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setEditing(true)} title="메모"
            className="p-1 rounded hover:bg-stone-200 transition"
            style={{ color: hasMemo ? C.accent : C.textMuted }}>
            <StickyNote size={12} />
          </button>
          <button onClick={onRemove} style={{ color: C.textMuted }}><X size={12} /></button>
        </div>
      </div>
      {editing ? (
        <textarea autoFocus defaultValue={memo || ""} rows={2}
          onBlur={e => { onUpdateMemo(e.target.value); setEditing(false); }}
          placeholder="연락처, 이메일 등 메모 (줄바꿈 가능)"
          className="w-full text-xs border rounded-lg px-2 py-1.5 mt-2 outline-none"
          style={{ borderColor: C.border }} />
      ) : hasMemo ? (
        <div onClick={() => setEditing(true)}
          className="mt-2 rounded-lg px-2.5 py-2 text-xs whitespace-pre-wrap cursor-text hover:opacity-80 transition"
          style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, color: C.textDark }}>
          <span className="block text-[10px] font-semibold tracking-wide mb-1" style={{ color: C.accent }}>메모</span>
          {memo}
        </div>
      ) : null}
    </div>
  );
}

// ─── 설정 ────────────────────────────────────────────────────────────────────
function SettingsView({ vendors, setVendors, staff, setStaff, salesSheets, setSalesSheets, onEditPipeline }) {
  const [addingVendor, setAddingVendor] = useState(false);
  const [nv, setNv] = useState({ role: "", name: "" });
  const addVendor = () => { if (!nv.role || !nv.name) return; setVendors(p => [...p, { ...nv, id: uid(), memo: "" }]); setNv({ role: "", name: "" }); setAddingVendor(false); };
  const rmVendor = (id) => setVendors(p => p.filter(v => v.id !== id));
  const updateVendorMemo = (id, memo) => setVendors(p => p.map(v => v.id === id ? { ...v, memo } : v));
  const grouped = vendors.reduce((a, v) => { (a[v.role] = a[v.role] || []).push(v); return a; }, {});

  const [addingStaff, setAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const addStaff = () => { if (!newStaffName.trim()) return; setStaff(p => [...p, { id: uid(), name: newStaffName.trim(), memo: "" }]); setNewStaffName(""); setAddingStaff(false); };
  const rmStaff = (id) => setStaff(p => p.filter(s => s.id !== id));
  const updateStaffMemo = (id, memo) => setStaff(p => p.map(s => s.id === id ? { ...s, memo } : s));

  const updateSheet = (id, key, val) => setSalesSheets(p => p.map(s => s.id === id ? { ...s, [key]: val } : s));
  const addSheet = () => setSalesSheets(p => [...p, { id: uid(), title: "", url: "" }]);
  const rmSheet = (id) => setSalesSheets(p => p.filter(s => s.id !== id));

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>설정</h2>

      <div className="rounded-2xl border p-6 mb-5" style={{ background: C.card, borderColor: C.border }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: C.textSub }}>발주/재고 Google Sheets</h3>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>여기에 등록한 시트가 대시보드 상단에 배너로 표시돼요. (최대 2개)</p>
        <div className="space-y-3">
          {salesSheets.map(s => (
            <div key={s.id} className="rounded-xl border p-3.5" style={{ borderColor: C.border }}>
              <div className="flex items-center justify-between mb-2">
                <input value={s.title} onChange={e => updateSheet(s.id, "title", e.target.value)}
                  placeholder="배너 제목 (예: 발주/재고 마스터)"
                  className="text-sm font-medium outline-none flex-1 bg-transparent" style={{ color: C.text }} />
                <button onClick={() => rmSheet(s.id)} style={{ color: C.textMuted }}><X size={14} /></button>
              </div>
              <input value={s.url} onChange={e => updateSheet(s.id, "url", e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/..."
                className="w-full text-xs border rounded-lg px-3 py-2" style={{ borderColor: C.border }} />
            </div>
          ))}
        </div>
        {salesSheets.length < 2 && (
          <button onClick={addSheet}
            className="flex items-center gap-1.5 text-xs mt-3 px-3 py-1.5 rounded-lg border hover:bg-stone-50 transition"
            style={{ borderColor: C.border, color: C.accent }}>
            <Plus size={11} /> 시트 추가
          </button>
        )}
      </div>

      <div className="rounded-2xl border p-6 mb-5" style={{ background: C.card, borderColor: C.border }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: C.textSub }}>파이프라인 템플릿</h3>
        <div className="space-y-2">
          {BRANDS.map(b => (
            <button key={b} onClick={() => onEditPipeline(b)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border hover:bg-stone-50 transition text-left"
              style={{ borderColor: C.border }}>
              <span className="text-sm" style={{ color: C.text }}>{b}</span>
              <ChevronRight size={14} style={{ color: C.border }} />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-6 mb-5" style={{ background: C.card, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: C.textSub }}>내부 담당자 마스터</h3>
          <button onClick={() => setAddingStaff(true)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: C.accent }}>
            <Plus size={11} /> 추가
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.textMuted }}>체크리스트의 담당자 칸에서 선택지로 표시돼요. 메모에는 연락처 등을 적어둘 수 있어요.</p>
        {staff.map(s => (
          <MasterItem key={s.id} name={s.name} memo={s.memo}
            onUpdateMemo={memo => updateStaffMemo(s.id, memo)} onRemove={() => rmStaff(s.id)} />
        ))}
        {addingStaff && (
          <div className="flex gap-2 mt-2">
            <input autoFocus value={newStaffName} onChange={e => setNewStaffName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addStaff()}
              placeholder="이름" className="flex-1 text-xs border rounded-lg px-2 py-1.5" style={{ borderColor: C.border }} />
            <button onClick={addStaff} className="text-white px-3 py-1.5 rounded-lg text-xs" style={{ background: C.accent }}>추가</button>
            <button onClick={() => setAddingStaff(false)} style={{ color: C.textMuted }}><X size={13} /></button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-6" style={{ background: C.card, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: C.textSub }}>외부 협력사 마스터</h3>
          <button onClick={() => setAddingVendor(true)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: C.accent }}>
            <Plus size={11} /> 추가
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.textMuted }}>체크리스트의 업체 칸에서 선택지로 표시돼요.</p>
        {Object.entries(grouped).map(([role, vs]) => (
          <div key={role} className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: C.textMuted }}>{role}</p>
            {vs.map(v => (
              <MasterItem key={v.id} name={v.name} memo={v.memo}
                onUpdateMemo={memo => updateVendorMemo(v.id, memo)} onRemove={() => rmVendor(v.id)} />
            ))}
          </div>
        ))}
        {addingVendor && (
          <div className="flex gap-2 mt-2">
            <input value={nv.role} onChange={e => setNv(p => ({ ...p, role: e.target.value }))}
              placeholder="역할 (예: 물류)" className="flex-1 text-xs border rounded-lg px-2 py-1.5" style={{ borderColor: C.border }} />
            <input value={nv.name} onChange={e => setNv(p => ({ ...p, name: e.target.value }))}
              placeholder="업체명" className="flex-1 text-xs border rounded-lg px-2 py-1.5" style={{ borderColor: C.border }} />
            <button onClick={addVendor} className="text-white px-3 py-1.5 rounded-lg text-xs" style={{ background: C.accent }}>추가</button>
            <button onClick={() => setAddingVendor(false)} style={{ color: C.textMuted }}><X size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
// ─── 저장 상태 표시 (우하단 작은 알림) ─────────────────────────────────────────
function SaveStatus({ status }) {
  if (status === "idle") return null;
  const map = {
    saving: { icon: <Loader2 size={12} className="animate-spin" />, label: "저장 중…", color: C.textMuted },
    saved:  { icon: <Check size={12} />, label: "저장됨", color: "#22C55E" },
    error:  { icon: <CloudOff size={12} />, label: "저장 실패 — 네트워크를 확인해주세요", color: "#EF4444" },
  };
  const m = map[status];
  if (!m) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full shadow-md border"
      style={{ background: C.card, borderColor: C.border, color: m.color }}>
      {m.icon}{m.label}
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState("locked");
  const [view, setView] = useState({ type: "dashboard" });
  const [products, setProducts] = useState(SAMPLE);
  const [templates, setTemplates] = useState(INIT_TEMPLATES);
  const [vendors, setVendors] = useState(INIT_VENDORS);
  const [staff, setStaff] = useState(INIT_STAFF);
  const [salesSheets, setSalesSheets] = useState([{ id: "s1", title: "발주/재고 마스터", url: "" }]);
  const [showAdd, setShowAdd] = useState(false);

  // ── 영구 저장소: 최초 1회 불러오기 ─────────────────────────────────────────
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const saveTimer = useRef(null);
  const skipNextSave = useRef(true); // 불러온 직후/실시간 수신 직후 1회는 저장 스킵 (덮어쓰기·핑퐁 방지)

  const applyRemoteData = (data) => {
    skipNextSave.current = true;
    if (data.products) setProducts(data.products);
    if (data.templates) setTemplates(data.templates);
    if (data.vendors) setVendors(data.vendors);
    if (data.staff) setStaff(data.staff);
    if (data.salesSheets) setSalesSheets(data.salesSheets);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from(STATE_TABLE)
          .select("data")
          .eq("id", STATE_ROW_ID)
          .single();
        if (error) throw error;
        if (row?.data && Object.keys(row.data).length > 0) {
          applyRemoteData(row.data);
        }
        // 저장된 데이터가 없으면(최초 실행) 현재 샘플 데이터로 시작 → 이후 자동 저장됨
      } catch (e) {
        console.error("초기 데이터 불러오기 실패:", e);
      } finally {
        setLoaded(true);
      }
    })();

    // 다른 팀원이 저장하면 실시간으로 받아서 화면 갱신
    const channel = supabase
      .channel("app_state_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: STATE_TABLE, filter: `id=eq.${STATE_ROW_ID}` },
        (payload) => {
          if (payload.new?.data) applyRemoteData(payload.new.data);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── 영구 저장소: 변경 시 자동 저장 (디바운스) ──────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from(STATE_TABLE)
          .update({
            data: { products, templates, vendors, staff, salesSheets },
            updated_at: new Date().toISOString(),
          })
          .eq("id", STATE_ROW_ID);
        if (error) throw error;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(s => (s === "saved" ? "idle" : s)), 1500);
      } catch (e) {
        console.error("저장 실패:", e);
        setSaveStatus("error");
      }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [products, templates, vendors, staff, salesSheets, loaded]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2" style={{ background: C.bg }}>
        <Loader2 size={16} className="animate-spin" style={{ color: C.accent }} />
        <span className="text-sm" style={{ color: C.textMuted }}>데이터를 불러오는 중…</span>
      </div>
    );
  }

  if (auth === "locked") return <AuthScreen onAuth={setAuth} />;

  const isAdmin = auth === "admin";
  const nav = (v) => setView(v);

  const addProduct = (p) => { setProducts(prev => [...prev, p]); setShowAdd(false); nav({ type: "brand", brand: p.brandLine, expandId: p.id }); };
  const updateProduct = (p) => setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));
  const updatePipeline = (id, pipeline) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, pipeline } : p));

  const renderMain = () => {
    switch (view.type) {
      case "dashboard": return <Dashboard products={products} salesSheets={salesSheets} onNav={nav} />;
      case "brand": return (
        <BrandView key={`${view.brand}-${view.expandId || ""}`}
          brand={view.brand} products={products.filter(p => p.brandLine === view.brand)}
          isAdmin={isAdmin} initialExpandId={view.expandId}
          onAdd={() => setShowAdd(true)}
          onUpdate={updateProduct}
          onUpdatePipeline={updatePipeline}
          onDelete={deleteProduct} staff={staff} vendors={vendors} />
      );
      case "pipeline-editor": return (
        <PipelineEditor brand={view.brand} template={templates[view.brand]}
          onChange={t => setTemplates(prev => ({ ...prev, [view.brand]: t }))}
          onBack={() => nav({ type: "settings" })} />
      );
      case "settings": return (
        <SettingsView vendors={vendors} setVendors={setVendors}
          staff={staff} setStaff={setStaff}
          salesSheets={salesSheets} setSalesSheets={setSalesSheets}
          onEditPipeline={brand => nav({ type: "pipeline-editor", brand })} />
      );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Sidebar view={view} onNav={nav} isAdmin={isAdmin} onLogout={() => setAuth("locked")} />
      <main className="flex-1 overflow-y-auto">{renderMain()}</main>
      {showAdd && (
        <AddProductModal brandLine={view.brand} pipelineTemplates={templates}
          onSave={addProduct} onClose={() => setShowAdd(false)} />
      )}
      {isAdmin && <SaveStatus status={saveStatus} />}
    </div>
  );
}
