# 사장님 웹(owner_web) GA4 이벤트 명세

- 속성: `G-Q0WLLSMTXM` (소비자 사이트와 공용, 호스트 `owner.themuselab.kr`로 구분)
- 전송: `src/lib/analytics.ts`의 `track(name, params)` — 모든 이벤트에 `platform: 'owner_web'` 자동 부착
- 개인정보: params에는 내부 id(owner uuid, shop id, slot id)만. 이름·전화번호·이메일·고객명·금액은 보내지 않는다.

## 퍼널 매핑

이 제품에서는 전달받은 **8자리 파트너 코드 입력이 곧 매장 연동**이다. 따라서 인증(verification)과 매장 연동(shop_connect)은 같은 시점에 함께 보낸다.

- `verification_start` + `shop_connect_start` → LinkCode 화면 진입
- `verification_complete` + `shop_connect_complete` → `POST /owner/auth/code` 성공

예약은 앱 밖(전화/DM)에서 이뤄지므로, 사장님이 "예약 성사"로 빈자리를 reserved 처리하는 시점이 유일한 예약 신호 → `booking_received`.

## 이벤트

| 이벤트 | 트리거 | params | 중복 방지 | 파일 |
|---|---|---|---|---|
| `owner_cta_click` | 랜딩 CTA 클릭 | placement | 클릭당 1회 | `src/pages/Landing.tsx` |
| `owner_inquiry_submit` | 입점 문의 제출 성공 | category, gu | 제출 성공당 1회 | `src/components/InquiryModal.tsx` |
| `owner_signup` | 소셜 로그인 성공 & 응답 `isNewOwner=true` | owner_id, method(kakao/naver/apple) | 콜백 effect `ran` ref 1회 + 인가 code 1회용 | `src/pages/OAuthCallback.tsx` |
| `owner_login` | 소셜 로그인 성공 & `isNewOwner=false` | owner_id, method | 위와 동일 | `src/pages/OAuthCallback.tsx` |
| `verification_start` | LinkCode 화면 진입(미연동 계정) | owner_id | `started` ref로 마운트(방문)당 1회 | `src/pages/LinkCode.tsx` |
| `shop_connect_start` | `verification_start`와 동시 | owner_id | 위와 동일 | `src/pages/LinkCode.tsx` |
| `verification_complete` | `POST /owner/auth/code` 성공 | owner_id, shop_id | 성공 응답당 1회(busy 가드, 성공 후 /dashboard 이동) | `src/pages/LinkCode.tsx` |
| `shop_connect_complete` | `verification_complete`와 동시 | owner_id, shop_id | 위와 동일 | `src/pages/LinkCode.tsx` |
| `owner_dashboard_view` | 대시보드 마운트 | owner_id | `viewed` ref로 마운트당 1회(refetch로 재전송 X) | `src/pages/Dashboard.tsx` |
| `slot_register_start` | 신규 빈자리 등록 모달 열림 | shop_id | 모달 마운트(열림)당 1회, 수정 모드 제외 | `src/components/SlotFormModal.tsx` |
| `slot_register_complete` | `POST /owner/slots` 성공 | shop_id, slot_id | mutation onSuccess 1회 | `src/components/SlotFormModal.tsx` |
| `slot_register_edit` | `PATCH /owner/slots/:id` 성공 | shop_id, slot_id | mutation onSuccess 1회 | `src/components/SlotFormModal.tsx` |
| `slot_register_delete` | `DELETE /owner/slots/:id` 성공 | shop_id, slot_id | mutation onSuccess 1회 | `src/components/SlotFormModal.tsx` |
| `slot_status_change` | "예약 성사" 처리 성공(`POST /owner/slots/:id/reserve`) | slot_id, status(`reserved`) | mutation onSuccess 1회 | `src/components/ReserveModal.tsx` |
| `booking_received` | `slot_status_change`와 동시 | shop_id, slot_id | 위와 동일 | `src/components/ReserveModal.tsx` |

## 미계측 / 한계

- `slot_status_change`는 사장님 웹에서 일어나는 상태 변경(reserved)만 잡는다. waiting→notified(알림 발송), →expired(시간 경과)는 서버에서 일어나므로 프론트 이벤트로 잡을 수 없다(필요 시 서버 측 Measurement Protocol).
- 로그인 성공 직후 브라우저를 닫는 등 gtag 전송 전에 이탈하면 유실될 수 있다(GA4 일반 한계).
