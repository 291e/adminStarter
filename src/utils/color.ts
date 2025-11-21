// ----------------------------------------------------------------------

/**
 * HEX 색상을 RGB로 변환하는 헬퍼 함수
 * @param hex - HEX 색상 코드 (예: '#FF5630' 또는 'FF5630')
 * @returns RGB 객체 또는 null (변환 실패 시)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * HEX 색상을 RGBA 문자열로 변환
 * @param hex - HEX 색상 코드 (예: '#FF5630' 또는 'FF5630')
 * @param alpha - 투명도 (0-1, 기본값: 1)
 * @returns RGBA 문자열 (예: 'rgba(255, 86, 48, 0.16)')
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

