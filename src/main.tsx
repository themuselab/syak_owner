import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

// 크롤러/AI용 정적 SSR 콘텐츠(index.html #seo-content)는 JS 로드 후 앱과 겹치므로 제거.
// (raw HTML에는 남아 검색/AI가 읽고, 사용자는 React 랜딩만 본다 — 내용 동일이라 클로킹 아님)
document.getElementById('seo-content')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
