#!/usr/bin/env node
/**
 * 사장님 가이드 정적 페이지 생성 → public/guide/ (Vercel이 정적 파일을 SPA rewrite보다 먼저 낸다).
 *   node scripts/gen-guides.mjs [../web/api/regions.json]
 *
 * 검색 유입용: "네일샵 노쇼", "미용실 예약 취소 빈자리" 같은 사장님 검색어에 답하는 업종별 가이드.
 * 숫자(매장 수·대표가 중앙값·할인 진행 비율)는 샥이 모은 실데이터(web/api/regions.json)에서 뽑는다.
 * 데이터를 갱신하면 다시 돌리고 커밋한다.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2] || join(ROOT, '..', 'web', 'api', 'regions.json');
const OUT = join(ROOT, 'public', 'guide');
const SITE = 'https://owner.themuselab.kr';
const GA_ID = 'G-Q0WLLSMTXM';

// min = 1건 대략 시술 시간(빈자리 크기 감 잡기용 예시값)
const CATS = {
  nail: { ko: '네일', place: '네일샵', min: 90, items: '젤네일·패디·연장' },
  hair: { ko: '헤어', place: '미용실', min: 120, items: '커트·펌·염색' },
  eyelash: { ko: '속눈썹', place: '속눈썹샵', min: 90, items: '속눈썹 연장·펌' },
  waxing: { ko: '왁싱', place: '왁싱샵', min: 40, items: '브라질리언·바디 왁싱' },
  skincare: { ko: '피부', place: '피부관리실', min: 60, items: '관리·리프팅·여드름 케어' },
  massage: { ko: '마사지', place: '마사지샵', min: 60, items: '타이·스웨디시·스포츠 마사지' },
  pmu: { ko: '반영구', place: '반영구샵', min: 120, items: '눈썹·아이라인·입술' },
  tanning: { ko: '태닝', place: '태닝샵', min: 20, items: '태닝·스프레이 태닝' },
};

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const won = (n) => `${Math.round(n).toLocaleString('en-US')}원`;
const manwon = (n) => `${Math.round(n / 10000).toLocaleString('en-US')}만원`;
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

const regions = JSON.parse(readFileSync(SRC, 'utf-8'));
const now = new Date();
const fresh = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
const iso = now.toISOString();

const stats = {};
for (const [cat, c] of Object.entries(regions.categories)) {
  const shops = Object.values(c.data).flatMap((g) => g.shops || []);
  stats[cat] = {
    regions: (c.order || []).length,
    shops: shops.length,
    median: median(shops.map((s) => s.min).filter(Boolean)),
    dealPct: shops.length ? Math.round((shops.filter((s) => s.ev || s.fv).length / shops.length) * 100) : 0,
  };
}

const gaSnippet = (pageType, cat) =>
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>` +
  `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}` +
  `gtag('js',new Date());gtag('config','${GA_ID}');` +
  `gtag('event','owner_landing',{page_type:'${pageType}',category:'${cat}'});</script>`;

const cta = (cat, placement, cls, label, href = '/login') =>
  `<a class="${cls}" href="${href}" onclick="gtag('event','owner_cta_click',{category:'${cat}',placement:'${placement}'})">${label}</a>`;

const CSS = `*{box-sizing:border-box}body{margin:0;font-family:'Pretendard Variable',-apple-system,'Apple SD Gothic Neo',sans-serif;color:#222;background:#fff;line-height:1.7}
.wrap{max-width:720px;margin:0 auto;padding:22px 18px 64px}.top{font-size:13px;color:#999;text-decoration:none}.top b{color:#ec4899}
h1{font-size:26px;line-height:1.35;margin:14px 0 8px}h2{font-size:19px;margin:34px 0 8px}h3{font-size:16px;margin:20px 0 4px}
p,li{font-size:15px;color:#444}.lead{color:#555}.fresh{font-size:12px;color:#b9739a}
.box{background:#fff7fb;border:1px solid #fbcfe3;border-radius:14px;padding:14px 16px;margin:16px 0}.box b{color:#ec4899}
.stats{display:flex;gap:8px;margin:14px 0}.stat{flex:1;background:#fdeef6;border-radius:12px;padding:12px 8px;text-align:center}.stat b{display:block;font-size:18px;color:#ec4899}.stat span{font-size:12px;color:#9b2a5e}
.quote{background:#f7f7f8;border-left:3px solid #ec4899;border-radius:8px;padding:10px 14px;font-size:14px;color:#444;margin:8px 0;white-space:pre-line}
.cta{display:block;text-align:center;background:#ec4899;color:#fff;font-weight:800;font-size:16px;padding:15px;border-radius:14px;text-decoration:none;margin:22px 0 8px}
.hook{background:#1f1f23;color:#fff;border-radius:14px;padding:15px 16px;margin:14px 0 0;font-size:15px;line-height:1.65}.hook b{color:#ff8ec4}
.sticky{position:fixed;left:12px;right:12px;bottom:12px;max-width:696px;margin:0 auto;display:block;text-align:center;background:#ec4899;color:#fff;font-weight:800;font-size:15px;padding:14px;border-radius:14px;text-decoration:none;box-shadow:0 6px 20px rgba(236,72,153,.35)}
.wrap{padding-bottom:96px!important}
.cta2{display:block;text-align:center;color:#ec4899;font-weight:700;font-size:14px;text-decoration:none}
.faq dt{font-weight:700;font-size:15px;margin-top:14px}.faq dd{margin:4px 0 0;font-size:14px;color:#555}
.links{margin-top:34px;font-size:13px;line-height:2.1;color:#888}.links a{color:#ec4899;text-decoration:none;font-weight:600;margin-right:10px}
footer{margin-top:30px;font-size:12px;color:#aaa}footer a{color:#aaa}`;

function page({ url, title, desc, pageType, cat, ld, body }) {
  return `<!doctype html>
<html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#ec4899">
<meta property="og:type" content="article"><meta property="og:site_name" content="샥 사장님"><meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="https://www.themuselab.kr/og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="https://www.themuselab.kr/og.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" rel="stylesheet">
${gaSnippet(pageType, cat)}
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
<style>${CSS}</style>
</head><body><div class="wrap">
<a class="top" href="/"><b>샥</b> 사장님</a>
${body}
<footer>샥 사장님 · 예약 취소·노쇼 빈자리를 대기 손님에게 알려 채우는 서비스 · <a href="https://www.themuselab.kr">themuselab.kr</a> · ${esc(fresh)} 기준</footer>
</div></body></html>`;
}

const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
const faqLd = (faqs) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const faqHtml = (faqs) => `<dl class="faq">${faqs.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}</dl>`;

function categoryPage(cat) {
  const c = CATS[cat];
  const s = stats[cat];
  const url = `${SITE}/guide/${cat}/`;
  const price = s.median || 30000;
  const monthLoss = price * 4;
  const yearLoss = monthLoss * 12;
  // 후킹: 검색 결과에서 사장님 눈에 걸리게 "내 돈이 얼마 새는지"를 제목에. 숫자는 실데이터(대표가 중앙값×4회 예시).
  const title = `${c.place} 노쇼, 1년이면 ${manwon(yearLoss)} 날아갑니다 — 빈자리 채우는 법 | 샥 사장님`;
  const desc = `노쇼·당일 취소 한 번에 ${won(price)}이 그대로 사라집니다. 예약금·취소 규정 문구 예시부터, 취소석을 30초 만에 올려 근처 대기 손님에게 바로 알리는 방법까지 — ${c.place} 사장님 가이드.`;
  const faqs = [
    [`${c.place} 노쇼가 나면 손해가 얼마나 되나요?`,
      `샥이 모은 전국 ${c.place} ${s.shops.toLocaleString('en-US')}곳의 대표 시술 최저가 중앙값은 약 ${won(price)}입니다. 한 달에 4번만 빈자리가 나도 약 ${won(monthLoss)}의 매출이 그대로 사라집니다(${fresh} 기준, 예시 계산).`],
    ['예약금을 받으면 손님이 줄지 않나요?',
      '예약금은 노쇼를 크게 줄이는 대신 일부 손님이 망설일 수 있습니다. 첫 방문·주말·장시간 시술에만 받거나, 시술비에서 차감한다고 분명히 안내하면 거부감이 적습니다.'],
    ['당일 취소된 자리는 어떻게 빨리 채우나요?',
      '단골 연락·인스타 스토리도 방법이지만 시간이 걸립니다. 샥 사장님에 취소석을 올리면 그 시간대·지역에서 빈자리를 기다리던 손님에게 바로 알림이 가서 짧은 시간 안에 채울 수 있습니다.'],
  ];
  const others = Object.keys(CATS).filter((k) => k !== cat && stats[k])
    .map((k) => `<a href="/guide/${k}/">${esc(CATS[k].place)}</a>`).join('');
  const body = `
<h1>${esc(c.place)} 노쇼·예약 취소, 빈자리 채우는 법</h1>
<div class="hook"><b>노쇼 한 번 = ${won(price)} 증발.</b> 한 달 4번이면 <b>1년에 ${manwon(yearLoss)}</b>이에요.<br>
취소된 자리, <b>30초만 등록</b>하면 근처에서 ${esc(c.place)} 찾는 손님에게 바로 알림이 가요.</div>
${cta(cat, 'guide_hook', 'cta', '내 매장 빈자리, 손님에게 알리기 →')}
<p class="lead">${esc(c.items)} 같은 ${esc(c.place)} 예약은 한 건이 비면 그 시간(보통 ${c.min}분 안팎)이 통째로 사라집니다. 노쇼를 줄이는 방법부터, 그래도 생긴 빈자리를 채우는 방법까지 정리했어요.</p>
<p class="fresh">📅 ${esc(fresh)} 기준 · 샥이 모은 전국 ${esc(c.place)} 데이터</p>
<div class="stats">
<div class="stat"><b>${s.shops.toLocaleString('en-US')}</b><span>${esc(c.place)} 데이터</span></div>
<div class="stat"><b>${won(price)}</b><span>대표가 중앙값</span></div>
<div class="stat"><b>${s.dealPct}%</b><span>할인·첫방문 진행</span></div>
</div>

<h2>1. 노쇼 한 번이 얼마인지 먼저 계산해 보세요</h2>
<div class="box">전국 ${esc(c.place)} 대표 시술 최저가 중앙값 <b>${won(price)}</b> × 한 달 빈자리 <b>4번</b> = 매달 약 <b>${won(monthLoss)}</b>, 1년이면 <b>${manwon(yearLoss)}</b>이 사라집니다.<br>
재료 준비·다음 손님을 받지 못한 시간까지 생각하면 실제 손해는 더 큽니다.</div>

<h2>2. 노쇼를 줄이는 방법</h2>
<h3>예약금(선결제) 받기</h3>
<p>노쇼를 가장 확실하게 줄이는 방법입니다. 모든 예약에 받기 부담스럽다면 <b>첫 방문, 주말, 장시간 시술</b>에만 받고, 시술비에서 차감된다고 안내하세요.</p>
<h3>취소 규정을 미리 알리기</h3>
<p>예약할 때 규정을 보여주고 동의를 받아두면 분쟁이 줄어듭니다. 예약 안내 문구 예시:</p>
<div class="quote">[예약 안내]
· 예약 변경·취소는 시술 하루 전까지 연락 부탁드려요.
· 당일 취소·노쇼 시 예약금은 환불되지 않아요.
· 10분 이상 늦으시면 시술 내용이 바뀌거나 다음 예약으로 옮겨질 수 있어요.</div>
<h3>전날 리마인드 보내기</h3>
<p>예약을 잊어서 생기는 노쇼가 생각보다 많습니다. 전날 저녁 짧은 확인 메시지 하나로 크게 줄일 수 있어요.</p>
<div class="quote">안녕하세요, ○○${esc(c.place)}입니다 :)
내일 ○시 ${esc(c.items.split('·')[0])} 예약 확인차 연락드려요.
변경이 필요하시면 오늘 중으로 편하게 말씀 주세요!</div>

<h2>3. 그래도 생긴 빈자리, 이렇게 채우세요</h2>
<ul>
<li><b>단골에게 바로 연락</b> — 가까이 사는 단골은 당일에도 오는 경우가 많아요.</li>
<li><b>인스타 스토리 "오늘 ○시 자리 있어요"</b> — 팔로워가 많을수록 효과가 커요.</li>
<li><b>대기 손님에게 알림</b> — <a href="/" style="color:#ec4899;font-weight:700">샥 사장님</a>에 취소석을 올리면, 그 지역에서 지금 예약할 ${esc(c.place)}을 찾는 손님과 매장을 즐겨찾은 손님에게 알림이 바로 가요.</li>
</ul>
<div class="box"><b>사장님 매장, 이미 샥에 나와 있을 수 있어요.</b><br>샥에는 전국 뷰티샵 6만 곳 이상이 올라와 있고 손님들이 매일 빈자리를 찾고 있어요. 매장만 연동하면 그 손님들에게 바로 알릴 수 있어요.</div>
${cta(cat, 'guide_top', 'cta', '내 매장 연동하고 빈자리 채우기 →')}
${cta(cat, 'guide_inquiry', 'cta2', '파일럿 매장 신청·문의하기', '/?inquiry=1')}

<h2>자주 묻는 질문</h2>
${faqHtml(faqs)}
<div class="links"><b style="color:#666">다른 업종 가이드</b><br><a href="/guide/">전체 가이드</a>${others}</div>
<a class="sticky" href="/login" onclick="gtag('event','owner_cta_click',{category:'${cat}',placement:'guide_sticky'})">노쇼 빈자리, 손님에게 알리기 →</a>`;

  return page({
    url, title, desc, pageType: 'owner_guide', cat,
    ld: [
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, inLanguage: 'ko-KR',
        datePublished: iso, dateModified: iso, mainEntityOfPage: url,
        author: { '@type': 'Organization', name: '샥(뮤즈랩)', url: 'https://www.themuselab.kr/' },
        publisher: { '@type': 'Organization', name: '샥(뮤즈랩)', url: 'https://www.themuselab.kr/' } },
      crumbs([['샥 사장님', `${SITE}/`], ['사장님 가이드', `${SITE}/guide/`], [`${c.place} 노쇼·빈자리`, url]]),
      faqLd(faqs),
    ],
    body,
  });
}

function hubPage() {
  const url = `${SITE}/guide/`;
  const title = '노쇼로 매달 손해 보는 뷰티샵 사장님께 — 업종별 빈자리 채우는 법 | 샥 사장님';
  const desc = '네일샵·미용실·속눈썹·왁싱·피부관리·마사지·반영구·태닝샵 사장님을 위한 노쇼·당일 취소 대처법과 빈자리 채우는 방법. 예약금·취소 규정 문구 예시 포함.';
  const list = Object.keys(CATS).filter((k) => stats[k]).map((k) => {
    const c = CATS[k], s = stats[k];
    return `<li><a href="/guide/${k}/" style="color:#ec4899;font-weight:700;text-decoration:none">${esc(c.place)} 노쇼·빈자리 가이드</a> — 대표가 중앙값 ${won(s.median)}, 빈자리 한 번에 약 ${c.min}분</li>`;
  }).join('');
  const body = `
<h1>뷰티샵 노쇼·예약 취소, 업종별로 대처하는 법</h1>
<div class="hook"><b>예약 취소된 그 시간, 그냥 비워두고 계신가요?</b><br>샥에 <b>30초만 등록</b>하면 근처에서 지금 예약할 곳을 찾는 손님에게 바로 알림이 가요.</div>
<p class="lead">예약제로 운영하는 매장은 노쇼·당일 취소 한 번이 그대로 매출 손실이 됩니다. 업종마다 시술 시간과 가격이 달라 대처법도 조금씩 달라요.</p>
<p class="fresh">📅 ${esc(fresh)} 기준 · 샥이 모은 전국 뷰티샵 데이터</p>
<ul>${list}</ul>
${cta('all', 'guide_hub', 'cta', '샥 사장님 시작하기 →')}`;
  return page({
    url, title, desc, pageType: 'owner_guide_hub', cat: 'all',
    ld: [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: desc, url, inLanguage: 'ko-KR', dateModified: iso },
      crumbs([['샥 사장님', `${SITE}/`], ['사장님 가이드', url]]),
    ],
    body,
  });
}

const write = (rel, html) => { const p = join(OUT, rel, 'index.html'); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
write('', hubPage());
for (const cat of Object.keys(CATS)) if (stats[cat]) write(cat, categoryPage(cat));

// 사이트맵: 랜딩 + 가이드
const urls = ['/', '/guide/', ...Object.keys(CATS).filter((k) => stats[k]).map((k) => `/guide/${k}/`)];
writeFileSync(join(ROOT, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `<url><loc>${SITE}${u}</loc><lastmod>${iso.slice(0, 10)}</lastmod><priority>${u === '/' ? '1.0' : '0.8'}</priority><changefreq>weekly</changefreq></url>`).join('\n') +
  `\n</urlset>\n`);
console.log(`✅ 가이드 ${urls.length - 1}페이지 + sitemap.xml`);
