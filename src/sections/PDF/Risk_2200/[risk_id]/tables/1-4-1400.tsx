import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table1400Data } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { data?: Table1400Data };

// 물리적/생물학적/인간공학적 통합 행 타입
type NonChemicalUnifiedRow =
  | ({ category: '물리적' } & Table1400Data['physical'][number])
  | ({ category: '생물학적' } & Table1400Data['biological'][number])
  | ({ category: '인간공학적' } & Table1400Data['ergonomic'][number]);

// Table1400Data를 물리적/생물학적/인간공학적 통합 행 배열로 변환
function dataToNonChemicalUnifiedRows(data: Table1400Data): NonChemicalUnifiedRow[] {
  const rows: NonChemicalUnifiedRow[] = [];
  data.physical.forEach((row) => rows.push({ category: '물리적', ...row }));
  data.biological.forEach((row) => rows.push({ category: '생물학적', ...row }));
  data.ergonomic.forEach((row) => rows.push({ category: '인간공학적', ...row }));
  return rows;
}

export default function RiskTable_1_4_1400({ data }: Props) {
  const defaultData: Table1400Data = {
    chemical: [],
    physical: [],
    biological: [],
    ergonomic: [],
  };

  const tableData = data || defaultData;
  const nonChemicalUnifiedRows = dataToNonChemicalUnifiedRows(tableData);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* 화학적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>[화학적 인자]</Typography>
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
              '& tbody tr': {
                height: '48px',
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 110 }}>화학물질명</th>
                <th style={{ width: 135 }}>화학식</th>
                <th style={{ width: 124 }}>CAS No</th>
                <th style={{ width: 60 }}>폭발한계(%)하한</th>
                <th style={{ width: 60 }}>폭발한계(%)상한</th>
                <th style={{ width: 135 }}>노출기준</th>
                <th style={{ width: 48 }}>인화점(℃)</th>
                <th style={{ width: 48 }}>발화점(℃)</th>
                <th style={{ width: 135 }}>유해성 위험성 구분</th>
                <th style={{ width: 135 }}>산업안전보건법 관리기준</th>
                <th style={{ width: 48 }}>일일사용량</th>
                <th style={{ width: 48 }}>저장량</th>
                <th style={{ width: 135 }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {tableData.chemical.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.chemicalName}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.formula}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.casNo}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.lowerLimit}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.upperLimit}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.exposureLimit}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.flashPoint}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.ignitionPoint}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.hazardRisk}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.managementStandard}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.dailyUsage}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.storage}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.remark}</Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      </Box>

      {/* 물리적, 생물학적, 인간공학적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [물리적, 생물학적, 인간공학적 인자]
        </Typography>
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
              '& tbody tr': {
                height: '48px',
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 110 }}>구분</th>
                <th style={{ flex: 1 }}>유해인자명</th>
                <th style={{ flex: 1 }}>위치</th>
                <th style={{ flex: 1 }}>부서</th>
                <th style={{ flex: 1 }}>노출위험</th>
                <th style={{ flex: 1 }}>관리대책</th>
                <th style={{ flex: 1 }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {nonChemicalUnifiedRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.category}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.factorName}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.location}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.department}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.exposureRisk}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.managementMeasure}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.remark}</Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
