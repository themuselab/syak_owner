import { track } from '@/lib/analytics';

// 도입 문의는 구글폼으로 받는다(2026-11 — 사이트 안 문의 폼은 알림이 없어 4일간 아무도 못 봤다).
// 폼 제출 → 디스코드 알림은 구글폼 쪽 Apps Script가 보낸다(웹훅 주소는 폼 스크립트에만 둔다).
export const INQUIRY_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSczHz_C1wNhjFAkfDslm06hWakXR7WxKAddauevpSpiPr3wSw/viewform';

/** 도입 문의 구글폼을 새 탭으로 연다. 제출 여부는 폼 쪽이라 GA엔 "폼 열기"(owner_inquiry_open)만 남는다. */
export function openInquiryForm(placement: string): void {
  track('owner_inquiry_open', { placement });
  window.open(INQUIRY_FORM_URL, '_blank', 'noopener');
}
