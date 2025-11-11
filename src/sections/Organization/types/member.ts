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
