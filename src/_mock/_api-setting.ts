import { fSub } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type ApiSetting = {
  id: string;
  order: number; // 순번
  registrationDate: string; // 등록일 (YYYY-MM-DD HH:mm:ss)
  name: string; // API 이름
  provider: string; // 제공기관
  keyStatus: 'normal' | 'abnormal'; // Key 상태
  lastInterlocked: string; // 최근 연동일 (YYYY-MM-DD)
  expirationDate: string; // 만료일 (YYYY-MM-DD)
  status: 'active' | 'inactive'; // 상태
};

const apiNames = [
  'KOSHA 유해물질 API',
  '산업안전보건공단 API',
  '화학물질안전원 API',
  '환경부 대기질 API',
  '국토교통부 건설안전 API',
];

const providers = ['KOSHA', '산업안전보건공단', '화학물질안전원', '환경부', '국토교통부'];

const keyStatuses: ('normal' | 'abnormal')[] = ['normal', 'normal', 'normal', 'abnormal', 'normal'];

// ----------------------------------------------------------------------

export function mockApiSettings(count: number = 10): ApiSetting[] {
  return Array.from({ length: count }, (_, index) => {
    const apiIndex = index % apiNames.length;
    const status: 'active' | 'inactive' = index % 10 < 8 ? 'active' : 'inactive'; // 80% 활성, 20% 비활성

    return {
      id: `api-${index + 1}`,
      order: count - index,
      registrationDate: fSub({ days: count - index }),
      name: apiNames[apiIndex],
      provider: providers[apiIndex],
      keyStatus: keyStatuses[apiIndex],
      lastInterlocked: fSub({ days: count - index - 1 }),
      expirationDate: fSub({ days: count - index + 30 }),
      status,
    };
  });
}

