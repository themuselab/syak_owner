/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // syak 핑크
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // ── 라이트 테마 시맨틱 토큰 (admin과 동일) ─────────────
        canvas: '#f3f3f5', // 페이지 배경 (연한 회색)
        ink:    '#18181b', // 본문 강조 텍스트
        muted:  '#6b7280', // 보조 텍스트
        faint:  '#9ca3af', // 흐린 텍스트 (라벨/캡션)
        line:   '#ececef', // 카드/구분선 보더
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,16,20,0.04), 0 1px 3px rgba(16,16,20,0.03)',
        soft: '0 4px 16px rgba(16,16,20,0.06)',
        pop:  '0 12px 40px rgba(16,16,20,0.12)',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      keyframes: {
        'blob-float': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(3%,-4%) scale(1.05)' },
          '66%':     { transform: 'translate(-3%,3%) scale(0.97)' },
        },
      },
      animation: {
        'blob-float': 'blob-float 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
