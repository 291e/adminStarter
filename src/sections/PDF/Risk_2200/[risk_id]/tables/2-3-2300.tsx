import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2300Row } from '../types/table-data';

// ----------------------------------------------------------------------

type Props = { rows?: Table2300Row[] };

const defaultRows: Table2300Row[] = [
  {
    division: '기계적 요인',
    category: '프레스기 안전 덮개미설치',
    cause: '프레스기 안전 덮개미설치',
    hazard: '프레스기 안전 덮개 미설치',
    reference: '산업안전보건기준에 관한 규칙 제 108조(방호장치 설치)',
    law: '허용농도/법규 준수 항목',
    currentRisk: { value: 12, label: '즉시 개선 필요' },
    reductionNo: 1,
    reductionDetail: '프레스기에 양수조작식 안전덮개 설치 및 근로자 교육 실시',
    postRisk: { value: 4, label: '허용 가능' },
    owner: '김안전',
    dueDate: '2025-10-28',
    completedAt: '2025-10-28',
    done: false,
  },
  {
    division: '기계적 요인',
    category: '프레스기 안전 덮개미설치',
    cause: '프레스기 안전 덮개미설치',
    hazard: '프레스기 안전 덮개 미설치',
    reference: '산업안전보건기준에 관한 규칙 제 108조(방호장치 설치)',
    law: '허용농도/법규 준수 항목',
    currentRisk: { value: 12, label: '즉시 개선 필요' },
    reductionNo: 1,
    reductionDetail: '프레스기에 양수조작식 안전덮개 설치 및 근로자 교육 실시',
    postRisk: { value: 4, label: '허용 가능' },
    owner: '김안전',
    dueDate: '2025-10-28',
    completedAt: '2025-10-28',
    done: false,
  },
];

export default function RiskTable_2_3_2300({ rows = defaultRows }: Props) {
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
          },
          '& td': {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '22px',
            whiteSpace: 'pre-wrap',
            height: 48,
          },
        }}
      >
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: 50 }}>
              구분
            </th>
            <th colSpan={3} style={{ width: 224 }}>
              유해위험요인 파악
            </th>
            <th colSpan={2} style={{ width: 171 }}>
              관련근거
            </th>
            <th rowSpan={2} style={{ width: 70 }}>
              현재 위험성
            </th>
            <th colSpan={2} style={{ width: 175 }}>
              감소 대책
            </th>
            <th rowSpan={2} style={{ width: 78 }}>
              개선후 위험성
            </th>
            <th rowSpan={2} style={{ width: 51 }}>
              담당자
            </th>
            <th rowSpan={2} style={{ width: 124 }}>
              조치요구일
            </th>
            <th rowSpan={2} style={{ width: 118 }}>
              조치 완료일
            </th>
            <th rowSpan={2} style={{ width: 91 }}>
              완료 확인
            </th>
          </tr>
          <tr>
            <th style={{ width: 69 }}>분류</th>
            <th style={{ width: 69 }}>원인</th>
            <th style={{ width: 86 }}>유해위험요인</th>
            <th style={{ width: 171 }}>법규/노출기준 등</th>
            <th style={{ width: 0, padding: 0, border: 'none' }} />
            <th style={{ width: 42 }}>NO</th>
            <th style={{ width: 133 }}>세부내용</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>{r.division}</td>
              <td>{r.category}</td>
              <td>{r.cause}</td>
              <td>{r.hazard}</td>
              <td colSpan={2}>{r.reference}</td>
              <td>
                <Typography component="span" sx={{ fontSize: 14 }}>
                  {r.currentRisk.value}
                </Typography>
                <br />
                <Typography component="span" sx={{ fontSize: 12 }}>
                  ({r.currentRisk.label})
                </Typography>
              </td>
              <td>{r.reductionNo}</td>
              <td>{r.reductionDetail}</td>
              <td>
                <Typography component="span" sx={{ fontSize: 14 }}>
                  {r.postRisk.value}
                </Typography>
                <br />
                <Typography component="span" sx={{ fontSize: 12 }}>
                  ({r.postRisk.label})
                </Typography>
              </td>
              <td>{r.owner}</td>
              <td>{r.dueDate}</td>
              <td>{r.completedAt}</td>
              <td>{r.done ? '●' : '○'}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
