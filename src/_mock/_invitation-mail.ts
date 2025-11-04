import { fSub } from 'src/utils/format-time';
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export type InvitationMail = {
  invitationMailIdx: number;
  email: string;
  searchingCode: string;
  verificationCode: string;
  createAt: string;
  updateAt: string;
  companyIdx: number;
  companyBranchIdx: number | null;
  memberNameFromAdmin: string;
  isJoined: boolean;
  memberIdx: number | null;
  memberLangFromAdmin: string;
  memberMemoFromAdmin: string | null;
  memberIdFromAdmin: string;
  memberPhoneFromAdmin: string;
};

// ----------------------------------------------------------------------

export function mockInvitationMails(count: number = 10): InvitationMail[] {
  const languages = ['ko', 'en', 'ja', 'zh'];
  const isJoinedValues = [true, false];

  return Array.from({ length: count }, (_, index) => {
    const isJoined = index % 3 !== 0;
    const companyIdx = Math.floor(index / 3) + 1;
    const hasBranch = index % 2 === 0;

    return {
      invitationMailIdx: index + 1,
      email: `invite${index + 1}@example.com`,
      searchingCode: `SEARCH_${String(index + 1).padStart(6, '0')}`,
      verificationCode: `VERIFY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      companyIdx,
      companyBranchIdx: hasBranch ? Math.floor(index / 2) + 1 : null,
      memberNameFromAdmin: _mock.fullName(index),
      isJoined,
      memberIdx: isJoined ? index + 1 : null,
      memberLangFromAdmin: languages[index % languages.length],
      memberMemoFromAdmin: index % 4 === 0 ? _mock.sentence(index) : null,
      memberIdFromAdmin: `invited_member_${index + 1}`,
      memberPhoneFromAdmin: _mock.phoneNumber(index),
    };
  });
}

