import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2100Data } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = {
  data?: Table2100Data;
};

export default function RiskAssessmentTable_2_1_2100({ data }: Props) {
  // 기본 데이터
  const defaultData: Table2100Data = {
    classification: [
      {
        number: 1,
        category: '기계적 요인',
        hazardFactors: '끼임(감김), 위험한 표면, 충돌, 넘어짐, 추락등',
      },
      { number: 2, category: '전기적 요인', hazardFactors: '감전, 아크, 정전기, 전기화재/폭발 등' },
      { number: 3, category: '화학적 요인', hazardFactors: '가스, 증기, 전기화재/폭발 등' },
      {
        number: 4,
        category: '작업특성 요인',
        hazardFactors: '소음, 진동, 근로자, 근로자 실수, 질식위험, 중량물 취급 등',
      },
      {
        number: 5,
        category: '작업환경 요인',
        hazardFactors: '고온/한랭, 조명, 이동통로, 주변 근로자, 안전문화 등',
      },
      {
        number: 6,
        category: '생물학적 요인',
        hazardFactors: '별원성 미생물, 바이러스, 유전자 변형물질 등',
      },
    ],
    assessment: [
      {
        hazardFactor: '2m 이상 고소작업',
        dangerousSituation: '작업발판에서 추락후 중상 발생',
        currentSafetyMeasure: '안전난간 설치',
        riskLevel: { value: 12, label: '12 (관리필요)' },
        additionalMeasure: '안전대 부착설치 추가 설치',
        responsiblePerson: '김안전',
        plannedDate: '2025-10-30',
        completedDate: '2025-10-30',
      },
      {
        hazardFactor: '회전체 정비작업',
        dangerousSituation: '회전부에 말려들어가 손가락 절단',
        currentSafetyMeasure: '방호덮개 설치',
        riskLevel: { value: 6, label: '6 (관리필요)' },
        additionalMeasure: '인터록 장치 설치',
        responsiblePerson: '이기술',
        plannedDate: '2025-10-30',
        completedDate: '2025-10-30',
      },
      {
        hazardFactor: '부식성 화학물질 취급',
        dangerousSituation: '피부접촉으로 화학 화상',
        currentSafetyMeasure: '보호장갑 착용',
        riskLevel: { value: 12, label: '12 (관리필요)' },
        additionalMeasure: '국소배기장치 설치',
        responsiblePerson: '김안전',
        plannedDate: '2025-10-30',
        completedDate: '2025-10-30',
      },
      {
        hazardFactor: '전기패널 점검작업',
        dangerousSituation: '충전부 접촉으로 감전',
        currentSafetyMeasure: '절연장갑 작용',
        riskLevel: { value: 6, label: '6 (관리필요)' },
        additionalMeasure: '차단장치 설치',
        responsiblePerson: '박전기',
        plannedDate: '2025-10-30',
        completedDate: '2025-10-30',
      },
    ],
  };

  const tableData = data || defaultData;

  const tableStyle = {
    width: '100%',
    border: '2px solid',
    borderColor: 'text.primary',
    borderCollapse: 'collapse',
    '& th, & td': {
      border: '1px solid',
      borderColor: 'text.primary',
      padding: 0,
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
      padding: '4px',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '22px',
      whiteSpace: 'pre-wrap',
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {/* 첫 번째 테이블: 위험요인 분류 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [유해·위험요인 분류 예시]
        </Typography>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ width: 94 }}>번호</th>
              <th style={{ width: 164 }}>구분</th>
              <th style={{ flex: 1 }}>해당 유해·위험요인</th>
            </tr>
          </thead>
          <tbody>
            {tableData.classification.map((row, index) => (
              <tr key={index} style={{ height: 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400, textAlign: 'center' }}>
                    {row.number}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.category}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.hazardFactors}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {/* 두 번째 테이블: 위험성 평가 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>[위험성 평가]</Typography>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ width: 160 }}>유해/위험요인</th>
              <th style={{ width: 199 }}>위험한 상황과 결과</th>
              <th style={{ width: 160 }}>현재 안전조치</th>
              <th style={{ width: 120 }}>위험성</th>
              <th style={{ width: 220 }}>
                추가조치사항
                <br />
                (현재의 안전조사 미흡시)
              </th>
              <th style={{ width: 120 }}>담당자</th>
              <th style={{ width: 120 }}>예정일</th>
              <th style={{ width: 120 }}>완료일</th>
            </tr>
          </thead>
          <tbody>
            {tableData.assessment.map((row, index) => (
              <tr key={index} style={{ height: index === 0 || index === 1 ? 72 : 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.hazardFactor}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.dangerousSituation}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.currentSafetyMeasure}
                  </Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.riskLevel?.value || ''}
                    </Typography>
                    {row.riskLevel?.label && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 400,
                          color: 'text.secondary',
                          textAlign: 'center',
                        }}
                      >
                        ({row.riskLevel.label})
                      </Typography>
                    )}
                  </Box>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.additionalMeasure}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.responsiblePerson}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.plannedDate}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.completedDate}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}
