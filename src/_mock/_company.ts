import { fSub } from 'src/utils/format-time';
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export type Company = {
  companyIdx: number;
  companyName: string;
  createAt: string;
  updateAt: string;
  companyType?: string;
  businessNumber?: string;
  representativeName?: string;
  representativePhone?: string;
  representativeEmail?: string;
  businessCategory?: string;
  businessItem?: string;
  address?: string;
  detailAddress?: string;
  manager?: string;
  division?: string;
  lastAccessIp?: string;
  lastAccessDate?: string;
};

// ----------------------------------------------------------------------

// 사업자 유형 목록
const companyTypes = ['법인 사업자', '개인 사업자', '법인 사업자', '법인 사업자', '개인 사업자'];

// 대표자명 목록
const representativeNames = ['김안전', '이보건', '박산업', '최안전', '정기술'];

// 사업자 번호 목록
const businessNumbers = [
  '122-56-55475',
  '123-45-67890',
  '234-56-78901',
  '345-67-89012',
  '456-78-90123',
];

// 업태 목록
const businessCategories = ['제조업', '건설업', '서비스업', '도매업', '소매업'];

// 종목 목록
const businessItems = ['안전보건', '건설', 'IT서비스', '유통', '소매'];

// 주소 목록
const addresses = [
  '대전광역시 유성구 복용동로 342',
  '서울특별시 강남구 테헤란로 123',
  '부산광역시 해운대구 해운대해변로 789',
  '인천광역시 남동구 정각로 321',
  '광주광역시 서구 상무중앙로 987',
];

// 상세 주소 목록
const detailAddresses = ['필드빌딩 2층', '삼성타워 10층', '해운대빌딩 5층', '인천타워 3층', '상무빌딩 1층'];

// 담당자 목록
const managers = ['김안전', '이보건', '박산업', '최안전', '정기술'];

// 구분 목록
const divisions = ['운영사', '회원사', '총판', '대리점', '딜러'];

// IP 주소 목록
const ipAddresses = [
  '168.126.222.111',
  '192.168.1.100',
  '10.0.0.50',
  '172.16.0.10',
  '203.248.252.2',
];

// 전화번호 목록
const phoneNumbers = [
  '010-0123-4567',
  '010-1234-5678',
  '010-2345-6789',
  '010-3456-7890',
  '010-4567-8901',
];

// 이메일 목록
const emails = [
  'safe@safeyou.kr',
  'contact@company1.com',
  'info@company2.com',
  'admin@company3.com',
  'support@company4.com',
];

export function mockCompanies(count: number = 5): Company[] {
  return Array.from({ length: count }, (_, index) => {
    const createDate = fSub({ days: (count - index) * 30 });
    const lastAccessDate = fSub({ days: Math.floor(Math.random() * 7) });

    return {
      companyIdx: index + 1,
      companyName: _mock.companyNames(index),
      createAt: createDate,
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 30) }),
      companyType: companyTypes[index],
      businessNumber: businessNumbers[index],
      representativeName: representativeNames[index],
      representativePhone: phoneNumbers[index],
      representativeEmail: emails[index],
      businessCategory: businessCategories[index],
      businessItem: businessItems[index],
      address: addresses[index],
      detailAddress: detailAddresses[index],
      manager: managers[index],
      division: divisions[index],
      lastAccessIp: ipAddresses[index],
      lastAccessDate: lastAccessDate,
    };
  });
}
