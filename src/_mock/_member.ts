import { _mock } from './_mock';
import { fSub } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type Member = {
  member: string | null;
  memberIdx: number;
  memberId: string;
  password: string;
  memberRole: string;
  memberThumbnail: string;
  memberStatus: string;
  memberEmail: string;
  memberName: string;
  memberPhone: string;
  memberAddress: string;
  memberAddressDetail: string;
  memberMemo: string | null;
  createAt: string;
  updateAt: string;
  duplicateSigninKey: string | null;
  lastSigninDate: string | null;
  companyIdx: number;
  companyBranchIdx: number | null;
  memberNameOrg: string | null;
  memberLang: string;
  deviceToken: string | null;
  deviceGubun: string | null;
  memberlat: number | null;
  memberlng: number | null;
  lastLocationUpdateAt: string | null;
  loginAttempts: number;
  loginBlockedUntil: string | null;
};

// ----------------------------------------------------------------------

export function mockMembers(count: number = 10): Member[] {
  const roles = ['admin', 'manager', 'member', 'viewer'];
  const statuses = ['active', 'inactive', 'pending', 'blocked'];
  const deviceGubuns = ['web', 'ios', 'android', null];
  const languages = ['ko', 'en', 'ja', 'zh'];

  return Array.from({ length: count }, (_, index) => {
    const status = statuses[index % statuses.length];
    const isBlocked = status === 'blocked';
    const hasLastSignin = index % 3 !== 0;

    return {
      member: index % 4 === 0 ? `member_ref_${index}` : null,
      memberIdx: index + 1,
      memberId: `member${index + 1}`,
      password: 'hashed_password_here',
      memberRole: roles[index % roles.length],
      memberThumbnail: _mock.image.avatar(index),
      memberStatus: status,
      memberEmail: _mock.email(index),
      memberName: _mock.fullName(index),
      memberPhone: _mock.phoneNumber(index),
      memberAddress: _mock.fullAddress(index),
      memberAddressDetail: `${Math.floor(Math.random() * 100)}호`,
      memberMemo: index % 5 === 0 ? _mock.sentence(index) : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      duplicateSigninKey: index % 4 === 0 ? `key_${index}` : null,
      lastSigninDate: hasLastSignin ? fSub({ days: Math.floor(Math.random() * 7) }) : null,
      companyIdx: Math.floor(index / 5) + 1,
      companyBranchIdx: index % 2 === 0 ? Math.floor(index / 2) + 1 : null,
      memberNameOrg: index % 3 === 0 ? _mock.fullName(index + 100) : null,
      memberLang: languages[index % languages.length],
      deviceToken: index % 2 === 0 ? `device_token_${index}` : null,
      deviceGubun: deviceGubuns[index % deviceGubuns.length],
      memberlat: index % 3 === 0 ? 37.5665 + Math.random() * 0.1 : null,
      memberlng: index % 3 === 0 ? 126.978 + Math.random() * 0.1 : null,
      lastLocationUpdateAt:
        index % 3 === 0 ? fSub({ hours: Math.floor(Math.random() * 24) }) : null,
      loginAttempts: isBlocked ? 5 : Math.floor(Math.random() * 3),
      loginBlockedUntil: isBlocked ? fSub({ hours: -Math.floor(Math.random() * 24) }) : null,
    };
  });
}
