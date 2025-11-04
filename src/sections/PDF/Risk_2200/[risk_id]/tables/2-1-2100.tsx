import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2100Data } from '../types/table-data';

// ----------------------------------------------------------------------

type Props = {
  data?: Table2100Data;
};

// 2100번대 전용 테이블: 피그마 디자인에 맞춘 레이아웃
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
      riskLevel: { value: 12, label: '매우높음' },
      additionalMeasure: '안전대 부착설치 추가 설치',
      responsiblePerson: '김안전',
      plannedDate: '2025-10-30',
      completedDate: '2025-10-30',
    },
    {
      hazardFactor: '회전체 정비작업',
      dangerousSituation: '회전부에 말려들어가 손가락 절단',
      currentSafetyMeasure: '방호덮개 설치',
      riskLevel: { value: 6, label: '중간' },
      additionalMeasure: '인터록 장치 설치',
      responsiblePerson: '이기술',
      plannedDate: '2025-10-30',
      completedDate: '2025-10-30',
    },
    {
      hazardFactor: '부식성 화학물질 취급',
      dangerousSituation: '피부접촉으로 화학 화상',
      currentSafetyMeasure: '보호장갑 착용',
      riskLevel: { value: 12, label: '매우높음' },
      additionalMeasure: '국소배기장치 설치',
      responsiblePerson: '김안전',
      plannedDate: '2025-10-30',
      completedDate: '2025-10-30',
    },
    {
      hazardFactor: '전기패널 점검작업',
      dangerousSituation: '충전부 접촉으로 감전',
      currentSafetyMeasure: '절연장갑 작용',
      riskLevel: { value: 6, label: '중간' },
      additionalMeasure: '차단장치 설치',
      responsiblePerson: '박전기',
      plannedDate: '2025-10-30',
      completedDate: '2025-10-30',
    },
    ],
  };

  const tableData = data || defaultData;
  const classificationRows = tableData.classification;
  const assessmentRows = tableData.assessment;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* [유해.위험요인 분류 예시] 테이블 */}
      <Box>
        <Box sx={{ px: 1, py: 0, mb: 1 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '24px',
            }}
          >
            [유해.위험요인 분류 예시]
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
              <th style={{ width: 90 }}>번호</th>
              <th style={{ width: 200 }}>구분</th>
              <th>해당 유해, 위험요인</th>
            </tr>
          </thead>
          <tbody>
            {classificationRows.map((row) => (
              <tr key={row.number}>
                <td>{row.number}</td>
                <td>{row.category}</td>
                <td>{row.hazardFactors}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {/* [위험성 평가표] 테이블 */}
      <Box>
        <Box sx={{ px: 1, py: 0, mb: 1 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '24px',
            }}
          >
            [위험성 평가표]
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
              <th style={{ width: 140 }}>유해/위험요인</th>
              <th>위험한 상황과 결과</th>
              <th style={{ width: 116 }}>현재 안전조치</th>
              <th style={{ width: 80 }}>위험성</th>
              <th style={{ width: 180 }}>추가조치사항{'\n'}(현재의 안전조사 미흡시)</th>
              <th style={{ width: 68 }}>담당자</th>
              <th style={{ width: 100 }}>예정일</th>
              <th style={{ width: 100 }}>완료일</th>
            </tr>
          </thead>
          <tbody>
            {assessmentRows.map((row, index) => (
              <tr key={index}>
                <td>{row.hazardFactor}</td>
                <td>{row.dangerousSituation}</td>
                <td>{row.currentSafetyMeasure}</td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography component="span" sx={{ fontSize: 14 }}>
                      {row.riskLevel.value}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 14 }}>
                      ({row.riskLevel.label})
                    </Typography>
                  </Box>
                </td>
                <td>{row.additionalMeasure}</td>
                <td>{row.responsiblePerson}</td>
                <td>{row.plannedDate}</td>
                <td>{row.completedDate}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}

