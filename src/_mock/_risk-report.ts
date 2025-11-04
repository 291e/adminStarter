import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type RiskReport = {
  id: string;
  title: string; // 제목
  location: string; // 위치
  content: string; // 내용
  author: string; // 작성자
  reporter: string; // 보고자
  registeredAt: string; // 등록일
  imageUrl: string; // 이미지 URL
  status: 'unconfirmed' | 'confirmed'; // 상태: 미확인 / 확인
};

const titles = [
  '포크레인이 기둥을 무너뜨렸습니다.',
  '전기선이 절단되었습니다.',
  '화재 진압이 완료되었습니다.',
  '가스 누출이 감지 되었습니다.',
  '건물 외벽이 붕괴 되었습니다.',
  '교통 사고가 발생했습니다.',
  '추락사고가 발생했습니다.',
  '건설장비 파손이 발생했습니다.',
];

const locations = [
  '대전광역시 유성구 유성대로 99길99',
  '서울특별시 강남구 테헤란로 123',
  '부산광역시 해운대구 해운대해변로 456',
  '인천광역시 남동구 인주대로 789',
];

const contents = ['포크레인 사고현장', '전기 사고 발생', '화재 진압 완료', '가스 누출 감지'];

const authors = ['트루트루스', '안전지킴이', '안전관리자', '안전담당자'];

const reporters = ['김안전', '이안전', '박안전', '최안전'];

const statuses: ('unconfirmed' | 'confirmed')[] = ['unconfirmed', 'confirmed'];

// ----------------------------------------------------------------------

export function mockRiskReports(count: number): RiskReport[] {
  return Array.from({ length: count }, (_, index) => {
    const status = statuses[index % statuses.length];
    const titleIndex = index % titles.length;
    const locationIndex = index % locations.length;
    const contentIndex = index % contents.length;
    const authorIndex = index % authors.length;
    const reporterIndex = index % reporters.length;

    // 이미지 URL 생성
    const imageIndex = (index % 8) + 1;
    const imageUrl = `${CONFIG.assetsDir}/assets/images/mock/travel/travel-${imageIndex}.webp`;

    return {
      id: `risk-${index + 1}`,
      title: titles[titleIndex],
      location: locations[locationIndex],
      content: contents[contentIndex],
      author: authors[authorIndex],
      reporter: reporters[reporterIndex],
      registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl,
      status,
    };
  });
}
