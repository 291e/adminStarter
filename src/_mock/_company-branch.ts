import { fSub } from 'src/utils/format-time';
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export type CompanyBranch = {
  companyBranchIdx: number;
  companyBranchName: string;
  createAt: string;
  updateAt: string;
  branchManager1MemberIdx: number | null;
  branchManager2MemberIdx: number | null;
  companyIdx: number;
};

// ----------------------------------------------------------------------

export function mockCompanyBranches(count: number = 10): CompanyBranch[] {
  return Array.from({ length: count }, (_, index) => {
    const companyIdx = Math.floor(index / 2) + 1;
    const hasManager1 = index % 2 === 0;
    const hasManager2 = index % 3 === 0;

    return {
      companyBranchIdx: index + 1,
      companyBranchName: `${_mock.companyNames(companyIdx - 1)} ${index % 2 === 0 ? '본점' : `${Math.floor(index / 2) + 1}지점`}`,
      createAt: fSub({ days: (count - index) * 15 }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 15) }),
      branchManager1MemberIdx: hasManager1 ? index + 1 : null,
      branchManager2MemberIdx: hasManager2 && hasManager1 ? index + 2 : null,
      companyIdx,
    };
  });
}

