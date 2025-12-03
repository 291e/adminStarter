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
  createAt: string;
  updateAt: string;
  lastSigninDate: string | null;
  companyIdx: number;
  companyBranchIdx: number | null;
  memberNameOrg: string | null;
  memberLang: string;
  position?: string; // 직급 (과장, 대리 등)
  department?: string; // 소속 (생산 1팀, 영업 2팀 등)
  workType?: 'PRODUCTION' | 'OFFICE' | null; // 직종 (생산직/사무직)
  deviceGubun: string | null;
  memberlat: number | null;
  memberlng: number | null;
  lastLocationUpdateAt: string | null;
  loginAttempts: number;
  loginBlockedUntil: string | null;
  accidentFreeYear: number | null;
};
