import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2200Row } from '../../types/table-data';

type Props = { data?: Table2200Row[] };

// 2200번대: 위험요인별 위험성 평가표
export default function RiskAssessmentTable_2_2_2200({ data = [] }: Props) {
  return (
    <Box sx={{ width: '100%', maxWidth: 1240 }}>
      <Box sx={{ px: 1, py: 0, mb: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: '24px' }}>
          [위험요인별 위험성 평가표]
        </Typography>
      </Box>

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
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '12%' }}>번호</th>
            <th style={{ width: '22%' }}>위험 요인</th>
            <th style={{ width: '22%' }}>제거·대체</th>
            <th style={{ width: '22%' }}>공학적 통제</th>
            <th style={{ width: '22%' }}>행정적 통제 / PPE</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row.risk}</td>
              <td>{row.removal}</td>
              <td>{row.engineering}</td>
              <td>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <span>{row.administrative}</span>
                  <span>{row.ppe}</span>
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
