import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintTs from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

/**
 * 필수 규칙만 포함
 */
const customRules = {
  // React Hooks 규칙 (필수)
  ...reactHooksPlugin.configs.recommended.rules,

  // 미사용 import 자동 제거
  'unused-imports/no-unused-imports': 1,
  'unused-imports/no-unused-vars': [
    0,
    { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
  ],

  // React 기본 규칙 (React 17+ JSX 변환 사용)
  'react/react-in-jsx-scope': 0, // React 17+ 에서 불필요 (jsx: "react-jsx" 사용)
  'react/prop-types': 0, // TypeScript 사용 시 불필요

  // TypeScript 규칙
  '@typescript-eslint/no-unused-vars': [1, { args: 'none' }],
  '@typescript-eslint/no-explicit-any': 0, // 필요시 any 사용 허용
  '@typescript-eslint/no-shadow': 0, // 변수명 중복 허용 (함수 파라미터 등)
  '@typescript-eslint/no-empty-object-type': 0, // 타입 선언 파일에서 빈 인터페이스 허용 (타입 확장용)

  // 스타일 규칙 비활성화 (필수 아님)
  'arrow-body-style': 0, // 화살표 함수 스타일 자유화
  'consistent-return': 0, // return 일관성 강제 해제

  // perfectionist 플러그인 완전 비활성화
  'perfectionist/sort-imports': 0,
  'perfectionist/sort-named-imports': 0,
  'perfectionist/sort-named-exports': 0,
  'perfectionist/sort-exports': 0,
};

// ----------------------------------------------------------------------

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { ignores: ['*', '!src/', '!eslint.config.*'] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImportsPlugin,
    },
  },
  // 기본 권장 설정 먼저 적용
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  // 커스텀 규칙을 마지막에 적용하여 앞의 설정을 오버라이드
  {
    rules: customRules,
  },
  // 타입 선언 파일에 대한 추가 규칙
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 0, // .d.ts에서 빈 인터페이스는 정상적인 패턴
    },
  },
];
