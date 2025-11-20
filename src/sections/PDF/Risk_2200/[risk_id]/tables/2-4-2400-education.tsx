import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table2400EducationRow, Table2400MinimumEducationRow } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = {
  rows?: Table2400EducationRow[];
  minimumEducationRows?: Table2400MinimumEducationRow[];
};

const defaultRows: Table2400EducationRow[] = [
  {
    number: 1,
    educationType: '법정',
    educationCourse: '안전보건교육',
    scheduleMonths: [
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    targetCount: '50',
    educationMethod: '내부',
    remark: '',
  },
];

const defaultMinimumEducationRows: Table2400MinimumEducationRow[] = [
  {
    category: '근로자',
    subCategory1: '일반',
    subCategory2: '',
    newEmployeeEducation1: '8시간',
    newEmployeeEducation2: '',
    regularEducation1: '(일반) 분기별 6시간',
    regularEducation2: '(사무직) 분기별 3시간 (관리감독자) 연 16시간',
    workContentChange1: '2시간',
    workContentChange2: '',
    specialEducation1: '16시간',
    specialEducation2: '',
  },
  {
    category: '근로자',
    subCategory1: '일용',
    subCategory2: '',
    newEmployeeEducation1: '1시간',
    newEmployeeEducation2: '',
    regularEducation1: '-',
    regularEducation2: '',
    workContentChange1: '1시간',
    workContentChange2: '',
    specialEducation1: '2시간',
    specialEducation2: '',
  },
  {
    category: '특수고용',
    subCategory1: '일반',
    subCategory2: '',
    newEmployeeEducation1: '2시간',
    newEmployeeEducation2: '',
    regularEducation1: '-',
    regularEducation2: '',
    workContentChange1: '-',
    workContentChange2: '',
    specialEducation1: '16시간',
    specialEducation2: '',
  },
  {
    category: '특수고용',
    subCategory1: '단기·간헐',
    subCategory2: '',
    newEmployeeEducation1: '1시간',
    newEmployeeEducation2: '',
    regularEducation1: '-',
    regularEducation2: '',
    workContentChange1: '-',
    workContentChange2: '',
    specialEducation1: '2시간',
    specialEducation2: '',
  },
  {
    category: '안전보건 업무 담당자',
    subCategory1: '안전보건관리 책임자',
    subCategory2: '',
    newEmployeeEducation1: '6시간 이상',
    newEmployeeEducation2: '',
    regularEducation1: '6시간 이상(2년 주기)',
    regularEducation2: '',
    workContentChange1: '-',
    workContentChange2: '',
    specialEducation1: '-',
    specialEducation2: '',
  },
  {
    category: '안전보건 업무 담당자',
    subCategory1: '안전관리자/ 보건관리자',
    subCategory2: '',
    newEmployeeEducation1: '34시간 이상',
    newEmployeeEducation2: '',
    regularEducation1: '24시간 이상(2년 주기)',
    regularEducation2: '',
    workContentChange1: '-',
    workContentChange2: '',
    specialEducation1: '-',
    specialEducation2: '',
  },
  {
    category: '안전보건 업무 담당자',
    subCategory1: '안전보건 관리담당자',
    subCategory2: '',
    newEmployeeEducation1: '-',
    newEmployeeEducation2: '',
    regularEducation1: '8시간 이상(2년 주기)',
    regularEducation2: '',
    workContentChange1: '-',
    workContentChange2: '',
    specialEducation1: '-',
    specialEducation2: '',
  },
];

// 월 라벨
const MONTH_LABELS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
] as const;

export default function RiskTable_2_4_2400_Education({
  rows = defaultRows,
  minimumEducationRows = defaultMinimumEducationRows,
}: Props) {
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
      height: 48,
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 연간 교육 계획 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: 46 }} rowSpan={2}>
                순번
              </th>
              <th style={{ width: 112 }} colSpan={2}>
                교육구분
              </th>
              <th style={{ width: 226 }} rowSpan={2}>
                교육과정
              </th>
              <th style={{ width: 510 }} colSpan={12}>
                일정
              </th>
              <th style={{ width: 108 }} rowSpan={2}>
                대상 <br /> 인원(명)
              </th>
              <th style={{ width: 108 }} rowSpan={2}>
                교육방법 <br /> (내·외부)
              </th>
              <th style={{ width: 108 }} rowSpan={2}>
                비고
              </th>
            </tr>
            <tr style={{ height: 60 }}>
              <th style={{ width: 56 }}>법정</th>
              <th style={{ width: 56 }}>자율</th>
              <th style={{ width: 43 }}>1월</th>
              <th style={{ width: 43 }}>2월</th>
              <th style={{ width: 42 }}>3월</th>
              <th style={{ width: 42 }}>4월</th>
              <th style={{ width: 43 }}>5월</th>
              <th style={{ width: 43 }}>6월</th>
              <th style={{ width: 42 }}>7월</th>
              <th style={{ width: 42 }}>8월</th>
              <th style={{ width: 43 }}>9월</th>
              <th style={{ width: 43 }}>10월</th>
              <th style={{ width: 42 }}>11월</th>
              <th style={{ width: 42 }}>12월</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {/* 순번 */}
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.number || index + 1}
                  </Typography>
                </td>
                {/* 교육구분 (법정) */}
                <td style={{ width: 56 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.educationType === '법정' ? '●' : ''}
                  </Typography>
                </td>
                {/* 교육구분 (자율) */}
                <td style={{ width: 56 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.educationType === '자율' ? '●' : ''}
                  </Typography>
                </td>
                {/* 교육과정 */}
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.educationCourse || ''}
                  </Typography>
                </td>
                {/* 일정 (1월~12월) */}
                {MONTH_LABELS.map((_, monthIndex) => (
                  <td key={monthIndex}>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.scheduleMonths?.[monthIndex] ? '✓' : ''}
                    </Typography>
                  </td>
                ))}
                {/* 대상 인원(명) */}
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.targetCount || ''}
                  </Typography>
                </td>
                {/* 교육방법 (내·외부) */}
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.educationMethod || ''}
                  </Typography>
                </td>
                {/* 비고 */}
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.remark || ''}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {/* 교육대상별·교육유형별 최저 교육시간 테이블 */}
      <Box sx={{ width: '100%', mt: 5 }}>
        <Box sx={{ pb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [교육대상별·교육유형별 최저 교육시간]
        </Box>
        <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr style={{ height: 60 }}>
                <th style={{ width: 239 }} colSpan={2} rowSpan={2}>
                  구분
                </th>
                <th style={{ width: 239 }}>신규교육</th>
                <th style={{ width: 239 }}>정기교육/보수교육</th>
                <th style={{ width: 239 }}>작업내용변경시(1회)</th>
                <th style={{ width: 263 }}>특별교육(채용시1회)</th>
              </tr>
            </thead>
            <tbody>
              {minimumEducationRows.map((row, index) => {
                const hasThirdRow = !!row.subCategory3;
                const rowSpan = hasThirdRow ? 3 : 2;

                return (
                  <>
                    {/* 첫 번째 행 */}
                    <tr key={`${index}-1`}>
                      {/* 구분 - 카테고리 */}
                      <td style={{ width: 119 }} rowSpan={rowSpan}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.category || ''}
                        </Typography>
                      </td>
                      {/* 구분 - 세부 (위) */}
                      <td style={{ width: 120 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400, whiteSpace: 'pre-line' }}>
                          {row.subCategory1 || ''}
                        </Typography>
                      </td>
                      {/* 신규교육 (위) */}
                      <td style={{ width: 239 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.newEmployeeEducation1 || ''}
                        </Typography>
                      </td>
                      {/* 정기교육/보수교육 (위) */}
                      <td style={{ width: 239 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.regularEducation1 || ''}
                        </Typography>
                      </td>
                      {/* 작업내용변경시(1회) (위) */}
                      <td style={{ width: 239 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.workContentChange1 || ''}
                        </Typography>
                      </td>
                      {/* 특별교육(채용시1회) (위) */}
                      <td style={{ width: 263 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.specialEducation1 || ''}
                        </Typography>
                      </td>
                    </tr>
                    {/* 두 번째 행 (세부 아래) */}
                    <tr key={`${index}-2`}>
                      {/* 구분 - 세부 (아래) */}
                      <td style={{ width: 120 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400, whiteSpace: 'pre-line' }}>
                          {row.subCategory2 || ''}
                        </Typography>
                      </td>
                      {/* 신규교육 (아래) */}
                      <td style={{ width: 239 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.newEmployeeEducation2 || ''}
                        </Typography>
                      </td>
                      {/* 정기교육/보수교육 (아래) */}
                      <td style={{ width: 239 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.regularEducation2 || ''}
                        </Typography>
                      </td>
                      {/* 작업내용변경시(1회) (아래) */}
                      <td style={{ width: 239 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.workContentChange2 || ''}
                        </Typography>
                      </td>
                      {/* 특별교육(채용시1회) (아래) */}
                      <td style={{ width: 263 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                          {row.specialEducation2 || ''}
                        </Typography>
                      </td>
                    </tr>
                    {/* 세 번째 행 (subCategory3가 있을 때만 표시) */}
                    {hasThirdRow && (
                      <tr key={`${index}-3`}>
                        {/* 구분 - 세부 (3번째) */}
                        <td style={{ width: 120 }}>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 400, whiteSpace: 'pre-line' }}
                          >
                            {row.subCategory3 || ''}
                          </Typography>
                        </td>
                        {/* 신규교육 (3번째) */}
                        <td style={{ width: 239 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                            {row.newEmployeeEducation3 || ''}
                          </Typography>
                        </td>
                        {/* 정기교육/보수교육 (3번째) */}
                        <td style={{ width: 239 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                            {row.regularEducation3 || ''}
                          </Typography>
                        </td>
                        {/* 작업내용변경시(1회) (3번째) */}
                        <td style={{ width: 239 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                            {row.workContentChange3 || ''}
                          </Typography>
                        </td>
                        {/* 특별교육(채용시1회) (3번째) */}
                        <td style={{ width: 263 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                            {row.specialEducation3 || ''}
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
