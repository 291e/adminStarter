import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2400TBMData } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { data?: Table2400TBMData };

const defaultData: Table2400TBMData = {
  inspectionRows: [
    { inspectionContent: '기계·가구·설비 이상 유무', result: '정상' },
    { inspectionContent: '기계·가구·설비 방호장치', result: '정상' },
    { inspectionContent: '근로자 건강 상태', result: '정상' },
    { inspectionContent: '개인보호구 착용 여부', result: '착용' },
    { inspectionContent: '작업절차 및 방법 숙지', result: '숙지' },
    { inspectionContent: '작업장 정리/정돈, 통보 확보', result: '완료' },
    { inspectionContent: '점검결과 조치사항', result: '조치 완료' },
  ],
  educationContent:
    '아크릴로니트릴의 특성과 위험성, 작업 시 주의사항, 개인보호구 착용법, 비상대응 절차 등에 대한 안전 교육 내용입니다.',
  educationVideoRows: [
    {
      participant: { name: '김안전', department: '생산 1팀' },
      educationVideo: '아크릴로니트릴_10분작업안전',
      signature: 'signature-placeholder',
    },
  ],
};

export default function RiskTable_2_4_2400_TBM({ data = defaultData }: Props) {
  const tableStyle = {
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
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 점검내용 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ flex: 1 }}>점검내용</th>
              <th style={{ flex: 1 }}>결과</th>
            </tr>
          </thead>
          <tbody>
            {data.inspectionRows.map((row, index) => (
              <tr key={index} style={{ height: 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.inspectionContent || ''}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.result || ''}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {/* 교육내용 */}
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
            },
          }}
        >
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: '100%' }}>교육내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 144, textAlign: 'left', verticalAlign: 'top' }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {data.educationContent || ''}
                </Typography>
              </td>
            </tr>
          </tbody>
        </Box>
      </Box>

      {/* 교육영상 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: '30%' }}>대상자</th>
              <th style={{ width: '35%' }}>교육영상</th>
              <th style={{ width: '25%' }}>서명</th>
            </tr>
          </thead>
          <tbody>
            {data.educationVideoRows.map((row, index) => (
              <tr key={index} style={{ height: 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.participant?.name || ''}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.educationVideo || ''}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.signature ? '서명 완료' : ''}
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
