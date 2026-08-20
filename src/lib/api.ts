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
    social: (provider: Provider, accessToken: string) =>
      request<LoginRes>(`/owner/auth/${provider}`, {
        method: 'POST', body: JSON.stringify({ access_token: accessToken }),
      }),
    me: () => request<OwnerMe>('/owner/auth/me'),
    logout: () => request<void>('/owner/auth/sign-out', { method: 'POST' }),
    linkByCode: (code: string) =>
      request<{ shopId: string }>('/owner/auth/code', {
        method: 'POST', body: JSON.stringify({ code: code.trim().toUpperCase() }),
      }),
  },

  inquiry: {
    submit: (input: InquiryInput) =>
      request<{ ok: true }>('/inquiries', { method: 'POST', body: JSON.stringify(input) }),
  },

  dashboard: {
    get: () => request<DashboardRes>('/owner/dashboard'),
  },

  slots: {
    list: () => request<{ slots: OwnerSlot[] }>('/owner/slots'),
    create: (input: CreateSlotInput) =>
      request<OwnerSlot>('/owner/slots', { method: 'POST', body: JSON.stringify(input) }),
    update: (slotId: number, patch: UpdateSlotInput) =>
      request<OwnerSlot>(`/owner/slots/${slotId}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (slotId: number) =>
      request<void>(`/owner/slots/${slotId}`, { method: 'DELETE' }),
    reserve: (slotId: number, input: { amount?: number | null; customer?: string | null }) =>
      request<OwnerSlot>(`/owner/slots/${slotId}/reserve`, { method: 'POST', body: JSON.stringify(input) }),
  },

  notifications: {
    list: () => request<{ notifications: OwnerNotif[]; unread: number }>('/owner/notifications'),
    markRead: (id: string) =>
      request<void>(`/owner/notifications/${id}/read`, { method: 'PATCH' }),
  },

  profile: {
    get: () => request<OwnerProfile>('/owner/profile'),
    update: (patch: Partial<Pick<OwnerProfile, 'name' | 'phone' | 'email'>>) =>
      request<OwnerProfile>('/owner/profile', { method: 'PATCH', body: JSON.stringify(patch) }),
  },

  shop: {
    get: () => request<ShopInfo>('/owner/shop'),
    update: (patch: Partial<Pick<ShopInfo, 'name' | 'address' | 'serviceItems'>>) =>
      request<ShopInfo>('/owner/shop', { method: 'PATCH', body: JSON.stringify(patch) }),
  },
};

// ── Types ────────────────────────────────────────────────────────
export interface OwnerMe { id: string; shopId: string | null; }
export interface LoginRes {
  owner: { id: string; nickname: string | null; shopId: string | null };
  shopLinked: boolean;
  isNewOwner: boolean;
}
export interface InquiryInput {
  shopName: string; contact: string; gu: string; category: string; note?: string;
}

export type SlotStatus = 'waiting' | 'notified' | 'reserved' | 'expired';
export interface OwnerSlot {
  id: number;
  shopId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  serviceItems: string[];
  status: SlotStatus;
  recipientCount: number;
  reservedAmount: number | null;
  reservedCustomer: string | null;
  source: 'owner';
  ownerId: string;
  createdAt: string;
}
export interface CreateSlotInput {
  date: string; startTime: string; endTime?: string | null; serviceItems?: string[]; notify?: boolean;
}
export interface UpdateSlotInput {
  date?: string; startTime?: string; endTime?: string | null; serviceItems?: string[];
}

export interface FavoriteCustomer { id: string; nickname: string | null; profileImage: string | null; }
export interface DashboardRes {
  shopCategory: string | null;
  today: { registered: number; notificationsSent: number };
  week: { reservedCount: number; reservedDelta: number; recoveredRevenue: number };
  views: { total: number; today: number; deltaVsPrev: number; daily: { date: string; value: number }[] };
  favorites: { count: number; deltaWeek: number; recent: FavoriteCustomer[] };
  recent: OwnerSlot[];
}

export type OwnerNotifKind = 'dispatched' | 'reserved' | 'expired';
export interface OwnerNotif {
  id: string; kind: OwnerNotifKind; title: string; body: string;
  readAt: string | null; createdAt: string;
}

export interface OwnerProfile {
  id: string; name: string | null; phone: string | null; email: string | null;
  nickname: string | null; profileImage: string | null;
}
export interface ShopInfo {
  shopId: string; name: string; address: string; category: string | null; serviceItems: string[];
}
