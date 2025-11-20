import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table1100Row } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { rows?: Table1100Row[] };

const defaultRows: Table1100Row[] = [
  {
    highRiskWork: '기계⋅설비 정비, 수리, 교체, 청소 등 비정형 작업',
    disasterFactor:
      '작업 중 기계⋅기구에 안전장치(방호장치 등) 미설치·미흡·무효화 8대 위험요인\n정비, 수리, 교체 및 청소 등의 작업 시 설비⋅기계의 운전 정지 미실시',
    workplace: '1공장',
    machineHazard: '프레스',
    improvementNeeded: '안전장치 설치',
    remark: '긴급 조치 필요',
  },
  {
    highRiskWork: '크레인 취급 작업 (이동식크레인 포함)',
    disasterFactor:
      '중량물, 시설 등에 의한 크레인 조작자 시야 미확보 8대 위험요인\n작업자(작업지휘자와 크레인 조작자 등) 간 신호방법 지정·실시 미흡 8대 위험요인',
    workplace: '2공장',
    machineHazard: '크레인',
    improvementNeeded: '신호 방법 표준화',
    remark: '교육 실시',
  },
];

export default function RiskTable_1_1_1100({ rows = defaultRows }: Props) {
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
            backgroundColor: 'grey.100',
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
            <th style={{ maxWidth: 200 }}>고위험작업 및 상황</th>
            <th style={{ maxWidth: 361 }}>재해유발요인</th>
            <th style={{ maxWidth: 100 }}>작업장소</th>
            <th style={{ maxWidth: 160 }}>
              기계·기구·설비
              <br />
              유해인자
            </th>
            <th style={{ maxWidth: 80 }}>개선필요</th>
            <th style={{ maxWidth: 110 }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    textAlign: 'left',
                    px: 1,
                  }}
                >
                  {row.highRiskWork}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    textAlign: 'left',
                    px: 1,
                  }}
                >
                  {row.disasterFactor}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.workplace}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.machineHazard}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.improvementNeeded}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.remark}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
