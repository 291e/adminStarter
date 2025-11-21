// ----------------------------------------------------------------------

/**
 * 색상 옵션 (색상 선택 드롭다운용)
 */
export const COLOR_OPTIONS = [
  { value: 'red', label: '빨강' },
  { value: 'yellow', label: '노랑' },
  { value: 'blue', label: '파랑' },
  { value: 'green', label: '초록' },
  { value: 'purple', label: '보라' },
] as const;

/**
 * 색상 이름과 HEX 코드 매핑
 */
export const COLOR_VALUES: Record<string, string> = {
  red: '#FF5630',
  yellow: '#FFAB00',
  blue: '#1D7BF5',
  green: '#00A76F',
  purple: '#7635DC',
};
