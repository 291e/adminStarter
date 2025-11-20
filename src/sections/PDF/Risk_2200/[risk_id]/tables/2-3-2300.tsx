import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2300Row } from '../../types/table-data';

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
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
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
              padding: '4px',
              textAlign: 'center',
              verticalAlign: 'middle',
            },
            '& th': {
              backgroundColor: 'grey.100',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
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
            <tr style={{ height: 60 }}>
              <th rowSpan={2} style={{ width: 126 }}>
                구분
              </th>
              <th colSpan={2} style={{ width: 164 }}>
                유해·위험요인 파악
              </th>
              <th colSpan={1} style={{ width: 200 }}>
                관련근거
              </th>
              <th rowSpan={2} style={{ width: 92 }}>
                현재 위험성
              </th>
              <th colSpan={2} style={{ width: 182 }}>
                감소대책
              </th>
              <th rowSpan={2} style={{ width: 80 }}>
                개선후 위험성
              </th>
              <th rowSpan={2} style={{ width: 73 }}>
                담당자
              </th>
              <th rowSpan={2} style={{ width: 113 }}>
                조치요구일
              </th>
              <th rowSpan={2} style={{ width: 117 }}>
                조치 완료일
              </th>
              <th rowSpan={2} style={{ width: 50 }}>
                완료
              </th>
            </tr>
            <tr style={{ height: 60 }}>
              <th style={{ width: 80 }}>원인</th>
              <th style={{ width: 120 }}>유해·위험요인</th>
              <th style={{ width: 120 }}>법규/노출기준 등</th>
              <th style={{ width: 80 }}>NO</th>
              <th style={{ width: 73 }}>세부내용</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} style={{ height: 96 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.division}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.cause}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.hazard}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.reference}</Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {r.currentRisk?.value || ''}
                    </Typography>
                    {r.currentRisk?.label && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 400,
                          color: 'text.secondary',
                          textAlign: 'center',
                        }}
                      >
                        ({r.currentRisk.label})
                      </Typography>
                    )}
                  </Box>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.reductionNo}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {r.reductionDetail}
                  </Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {r.postRisk?.value || ''}
                    </Typography>
                    {r.postRisk?.label && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 400,
                          color: 'text.secondary',
                          textAlign: 'center',
                        }}
                      >
                        ({r.postRisk.label})
                      </Typography>
                    )}
                  </Box>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.owner}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.dueDate}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.completedAt}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {r.done ? '●' : '○'}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}
