const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include', // 인증은 HttpOnly 쿠키(syak_owner_*)
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    throw new ApiError(res.status, body.code ?? 'UNKNOWN', body.message ?? '오류가 발생했습니다');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type Provider = 'kakao' | 'naver' | 'apple';

export const api = {
  auth: {
    /** 소셜 provider access_token을 백엔드로 넘겨 세션 쿠키 발급 */
    social: (provider: Provider, accessToken: string) =>
      request<LoginRes>(`/owner/auth/${provider}`, {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
      }),
    /** 현재 세션 — 미로그인 시 401 throw */
    me: () => request<OwnerMe>('/owner/auth/me'),
    logout: () => request<void>('/owner/auth/sign-out', { method: 'POST' }),
    /** 8자리 매장 인증코드로 샵 연동 (로그인 상태 필요) */
    linkByCode: (code: string) =>
      request<{ shopId: string }>('/owner/auth/code', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      }),
  },

  /** 도입 문의 (공개) — 랜딩 모달 */
  inquiry: {
    submit: (input: InquiryInput) =>
      request<{ ok: true }>('/inquiries', { method: 'POST', body: JSON.stringify(input) }),
  },

  /** 빈자리(슬롯) — 로그인 + 샵연동 필요 */
  slots: {
    list: () => request<{ slots: OwnerSlot[] }>('/owner/slots'),
    create: (date: string, startTime: string) =>
      request<OwnerSlot>('/owner/slots', {
        method: 'POST',
        body: JSON.stringify({ date, startTime }),
      }),
    update: (slotId: number, patch: { date?: string; startTime?: string }) =>
      request<OwnerSlot>(`/owner/slots/${slotId}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (slotId: number) =>
      request<void>(`/owner/slots/${slotId}`, { method: 'DELETE' }),
  },
};

// ── Types (백엔드 계약 기준) ─────────────────────────────────────
export interface OwnerMe {
  id: string;
  shopId: string | null;
}

export interface LoginRes {
  owner: { id: string; nickname: string | null; shopId: string | null };
  shopLinked: boolean;
  isNewOwner: boolean;
}

export interface InquiryInput {
  /** 매장명 (백엔드 shop_name). 폼 라벨은 '대표명'이지만 매장명이 들어감 */
  shopName: string;
  contact: string;
  /** 지역 (시군구) */
  gu: string;
  category: string;
  note?: string;
}

export interface OwnerSlot {
  id: number;
  shopId: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  source: 'owner';
  ownerId: string;
}
