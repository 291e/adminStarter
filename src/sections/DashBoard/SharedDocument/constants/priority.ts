// ----------------------------------------------------------------------

/**
 * 중요도 설정 (기본값, PRIORITY_CONFIG에 없는 경우 사용)
 */
export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  URGENT: {
    label: '긴급',
    color: '#b71d18',
    bgColor: 'rgba(255, 86, 48, 0.16)',
  },
  IMPORTANT: {
    label: '중요',
    color: '#b76e00',
    bgColor: 'rgba(255, 171, 0, 0.16)',
  },
  REFERENCE: {
    label: '참고',
    color: '#1d7bf5',
    bgColor: 'rgba(29, 123, 245, 0.16)',
  },
  // 기본값 (null 또는 알 수 없는 priority)
  DEFAULT: {
    label: '참고',
    color: '#1d7bf5',
    bgColor: 'rgba(29, 123, 245, 0.16)',
  },
};

/**
 * 공개 상태 설정
 */
export const STATUS_CONFIG: Record<number, { label: string; color: string; bgColor: string }> = {
  1: {
    label: '공개',
    color: '#007867',
    bgColor: 'rgba(0, 167, 111, 0.16)',
  },
  0: {
    label: '비공개',
    color: 'text.secondary',
    bgColor: 'rgba(145, 158, 171, 0.16)',
  },
};
