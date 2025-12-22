import React from 'react';
import Box from '@mui/material/Box';
import type { Table2200Row } from '../../types/table-data';

type Props = { data?: Table2200Row[] };

// 2200번대: 위험요인별 위험성 평가표
export default function RiskAssessmentTable_2_2_2200({ data = [] }: Props) {
  // 빈 행 필터링: 모든 필드가 비어있으면 제외
  const filteredData = data.filter(
    (row) =>
      row.risk?.trim() ||
      row.removal?.trim() ||
      row.engineering?.trim() ||
      row.administrative?.trim() ||
      row.ppe?.trim()
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mt: 4 }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          border: '2px solid',
          borderColor: 'text.primary',
          borderCollapse: 'collapse',
          '& th, & td': {
            border: '1px solid',
            borderColor: 'text.primary',
            padding: 1,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
          '& th': {
            backgroundColor: 'transparent',
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '22px',
            height: 60,
          },
          '& td': {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '22px',
            whiteSpace: 'pre-wrap',
          },
          '& tbody tr': {
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '20%' }}>유해·위험 요인</th>
            <th style={{ width: '20%' }}>제거·대체</th>
            <th style={{ width: '20%' }}>공학적 통제</th>
            <th style={{ width: '20%' }}>행정적 통제</th>
            <th style={{ width: '20%' }}>PPE 방안</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>{row.risk}</td>
              <td>{row.removal}</td>
              <td>{row.engineering}</td>
              <td>{row.administrative}</td>
              <td>{row.ppe}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
