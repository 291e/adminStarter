// ----------------------------------------------------------------------

export type OrganizationMember = {
  id: string;
  order: number; // 순번
  registeredAt: string; // 등록일
  lastAccessedAt: string; // 접속일
  orgName: string; // 조직명
  name: string; // 이름
  avatarUrl?: string; // 프로필 이미지
  position: string; // 직급
  department: string; // 소속
  role: string; // 역할
  nationality: string; // 국적
  phone: string; // 전화번호
  email: string; // 이메일
  address: string; // 주소
  status: 'active' | 'inactive'; // 상태
};

const orgNames = [
  '이편한 자동차 기술',
  '엑셀 텍',
  '디지털 네트워크',
  '클라우드 시스템',
  '스마트 솔루션즈',
  'AI 테크',
  '모바일 솔루션',
  '블록체인 서비스',
  '로봇 기술',
  '나노 솔루션',
];

const names = [
  '김안전',
  '김희진',
  '이상혁',
  '정유진',
  '한지민',
  '최민호',
  '정유진',
  '김수현',
  '이채영',
  '박해결',
];
const positions = ['사원', '주임', '대리', '과장', '차장', '부장'];
const departments = ['생산 1팀', '생산 2팀', '안전보건팀', '품질팀'];
const roles = ['관리 감독자', '안전보건 담당자', '현장 관리자', '일반'];
const nationalities = ['대한민국', '대한민국', '대한민국', '대한민국'];
const cities = [
  '서울특별시 강남구 강남대로 34길',
  '부산광역시 해운대구 센텀중앙로 30',
  '인천광역시 연수구 송도동 123',
  '대전광역시 유성구 테크노밸리',
  '광주광역시 서구 치평동 45',
  '대구광역시 중구 동성로 67',
  '울산광역시 남구 삼산동 32',
  '세종특별자치시 도담동 45',
  '경기도 성남시 분당구 1',
  '서울특별시 강남구 강남대로 34길',
];

function phone(i: number) {
  const a = 1000 + (i % 9000);
  const b = 1000 + ((i * 37) % 9000);
  return `010-${String(a).padStart(4, '0')}-${String(b).padStart(4, '0')}`;
}

function createMember(index: number): OrganizationMember {
  const id = `org-${index + 1}`;
  const now = new Date();
  const reg = new Date(now.getTime() - (index + 1) * 86400000);
  const access = new Date(reg.getTime() + 3600 * 1000 * ((index % 6) + 1));
  return {
    id,
    order: 20 - index, // 예시 이미지처럼 역순
    registeredAt: reg.toISOString(),
    lastAccessedAt: access.toISOString(),
    orgName: orgNames[index % orgNames.length],
    name: names[index % names.length],
    avatarUrl: `${import.meta.env.BASE_URL || ''}assets/images/mock/avatars/avatar-${(index % 8) + 1}.webp`,
    position: positions[index % positions.length],
    department: departments[index % departments.length],
    role: roles[index % roles.length],
    nationality: nationalities[index % nationalities.length],
    phone: phone(index),
    email: `user${index + 1}@example.com`,
    address: cities[index % cities.length],
    status: index % 4 === 2 ? 'inactive' : 'active',
  };
}

export const _organizationMembers: OrganizationMember[] = Array.from({ length: 20 }, (_, i) =>
  createMember(i)
);
