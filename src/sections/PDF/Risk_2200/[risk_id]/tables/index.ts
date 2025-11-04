import type { ReactElement } from 'react';
import Default, { type DefaultTableRow } from './Default';
import T_2_2_2200 from './2-2-2200';
import T_2_1_2100 from './2-1-2100';
import T_1_5_1500 from './1-5-1500';
import T_1_4_1400 from './1-4-1400';
import T_1_3_1300 from './1-3-1300';
import T_2_3_2300 from './2-3-2300';

export type TableComponent = (props: { data: DefaultTableRow[] }) => ReactElement;

export const tableRegistry: Record<string, TableComponent | any> = {
  Default: Default as TableComponent,
  '2-2': T_2_2_2200 as any, // 2200번대 전용 테이블
  '2-1-2100': T_2_1_2100 as any, // 2100번대 전용 테이블
  '1-5-1500': T_1_5_1500 as any, // 1500번대 전용 테이블
  '1-4-1400': T_1_4_1400 as any, // 1400번대 전용 테이블
  '1-3-1300': T_1_3_1300 as any, // 1300번대 전용 테이블
  '2-3-2300': T_2_3_2300 as any, // 2300번대 전용 테이블
};
