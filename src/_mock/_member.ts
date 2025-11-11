import { _mock } from './_mock';
import { fSub } from 'src/utils/format-time';

export type { Member } from 'src/sections/Organization/types/member';
import type { Member } from 'src/sections/Organization/types/member';

// ----------------------------------------------------------------------

// 한국어 이름 목록
const koreanNames = [
  '김철수',
  '이영희',
  '박민수',
  '최지영',
  '정수진',
  '강동훈',
  '윤서연',
  '임태호',
  '한소영',
  '조현우',
];

// 한국 주소 목록
const koreanAddresses = [
  '서울특별시 강남구 테헤란로 123',
  '서울특별시 서초구 서초대로 456',
  '부산광역시 해운대구 해운대해변로 789',
  '인천광역시 남동구 정각로 321',
  '대전광역시 유성구 대학로 654',
  '광주광역시 서구 상무중앙로 987',
  '대구광역시 수성구 범어천로 147',
  '울산광역시 남구 삼산로 258',
  '경기도 성남시 분당구 정자일로 369',
  '경기도 수원시 영통구 월드컵로 741',
];

// 한국 전화번호 목록
const koreanPhones = [
  '010-1234-5678',
  '010-2345-6789',
  '010-3456-7890',
  '010-4567-8901',
  '010-5678-9012',
  '010-6789-0123',
  '010-7890-1234',
  '010-8901-2345',
  '010-9012-3456',
  '010-0123-4567',
];

// 한국 조직명 목록
const koreanOrgNames = [
  '삼성전자',
  'LG전자',
  '현대자동차',
  'SK하이닉스',
  '네이버',
  '카카오',
  '롯데그룹',
  '한화그룹',
  'GS건설',
  'KT',
];

// 역할 목록 (구분과 매핑)
const roles: Array<'operator' | 'member' | 'distributor' | 'agency' | 'dealer'> = [
  'operator',
  'member',
  'distributor',
  'agency',
  'dealer',
  'operator',
  'member',
  'distributor',
  'agency',
  'dealer',
];

// 상태 목록 (활성/비활성만)
const statuses: Array<'active' | 'inactive'> = [
  'active',
  'active',
  'active',
  'active',
  'active',
  'inactive',
  'inactive',
  'inactive',
  'inactive',
  'inactive',
];

export function mockMembers(count: number = 10): Member[] {
  const deviceGubuns: Array<'web' | 'ios' | 'android' | null> = ['web', 'ios', 'android', null];
  const detailNumbers = [101, 205, 307, 412, 523, 634, 745, 856, 967, 108];

  return Array.from({ length: count }, (_, index) => {
    const role = roles[index];
    const status = statuses[index];
    const hasLastSignin = index % 3 !== 0;
    const hasLocation = index % 3 === 0;

    // memberRole을 구분 필터와 매핑
    const memberRole =
      role === 'operator'
        ? 'admin'
        : role === 'member'
          ? 'member'
          : role === 'distributor'
            ? 'distributor'
            : role === 'agency'
              ? 'agency'
              : role === 'dealer'
                ? 'dealer'
                : 'member';

    return {
      member: index % 4 === 0 ? `member_ref_${index}` : null,
      memberIdx: index + 1,
      memberId: `member${index + 1}`,
      password: 'hashed_password_here',
      memberRole,
      memberThumbnail: _mock.image.avatar(index),
      memberStatus: status,
      memberEmail: `member${index + 1}@example.com`,
      memberName: koreanNames[index],
      memberPhone: koreanPhones[index],
      memberAddress: koreanAddresses[index],
      memberAddressDetail: `${detailNumbers[index]}호`,
      memberMemo: index % 5 === 0 ? '메모가 있는 멤버입니다.' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      duplicateSigninKey: index % 4 === 0 ? `key_${index}` : null,
      lastSigninDate: hasLastSignin ? fSub({ days: Math.floor(Math.random() * 7) }) : null,
      companyIdx: Math.floor(index / 5) + 1,
      companyBranchIdx: index % 2 === 0 ? Math.floor(index / 2) + 1 : null,
      memberNameOrg: koreanOrgNames[index],
      memberLang: 'ko',
      deviceToken: index % 2 === 0 ? `device_token_${index}` : null,
      deviceGubun: deviceGubuns[index % deviceGubuns.length],
      memberlat: hasLocation ? 37.5665 + index * 0.01 : null,
      memberlng: hasLocation ? 126.978 + index * 0.01 : null,
      lastLocationUpdateAt: hasLocation ? fSub({ hours: Math.floor(Math.random() * 24) }) : null,
      loginAttempts: Math.floor(Math.random() * 3),
      loginBlockedUntil: null,
    };
  });
}
