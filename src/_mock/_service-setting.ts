import { fSub } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type ServiceSetting = {
  id: string;
  order: number; // 순번
  registrationDate: string; // 등록일 (YYYY-MM-DD HH:mm:ss)
  serviceName: string; // 서비스명
  servicePeriod: string; // 서비스 기간 (예: "1개월")
  memberCount: number; // 조직원 수
  monthlyFee: number; // 월 사용료(원)
  subscriptions: number; // 구독수
  status: 'active' | 'inactive'; // 상태
};

const serviceNames = [
  '안전해YOU 프리미엄',
  '안전해YOU 플러스',
  '안전해YOU 스탠다드',
  '안전해YOU 라이트',
  '안전해YOU 스타트',
];

const servicePeriods = ['1개월', '3개월', '6개월', '12개월'];

const monthlyFees = [150000, 100000, 70000, 30000, 0];

// ----------------------------------------------------------------------

export function mockServiceSettings(count: number = 10): ServiceSetting[] {
  return Array.from({ length: count }, (_, index) => {
    const serviceNameIndex = index % serviceNames.length;
    const periodIndex = index % servicePeriods.length;
    const feeIndex = index % monthlyFees.length;
    const status: 'active' | 'inactive' = index % 10 < 8 ? 'active' : 'inactive'; // 80% 활성, 20% 비활성

    return {
      id: `service-${index + 1}`,
      order: count - index, // 역순으로 순번 부여
      registrationDate: fSub({ days: count - index }),
      serviceName: serviceNames[serviceNameIndex],
      servicePeriod: servicePeriods[periodIndex],
      memberCount: Math.floor(Math.random() * 50) + (index % 5) * 10,
      monthlyFee: monthlyFees[feeIndex],
      subscriptions: Math.floor(Math.random() * 20) + 1,
      status,
    };
  });
}

