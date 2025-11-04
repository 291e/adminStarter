import { fSub } from 'src/utils/format-time';
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export type Company = {
  companyIdx: number;
  companyName: string;
  createAt: string;
  updateAt: string;
};

// ----------------------------------------------------------------------

export function mockCompanies(count: number = 5): Company[] {
  return Array.from({ length: count }, (_, index) => ({
    companyIdx: index + 1,
    companyName: _mock.companyNames(index),
    createAt: fSub({ days: (count - index) * 30 }),
    updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 30) }),
  }));
}
