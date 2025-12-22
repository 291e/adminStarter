import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table1400Data } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { data?: Table1400Data };

export default function RiskTable_1_4_1400({ data }: Props) {
  const defaultData: Table1400Data = {
    chemical: [],
    physical: [],
    biological: [],
    ergonomic: [],
  };

  const tableData = data || defaultData;

  // 화학적 인자 빈 행 필터링
  const filteredChemical = tableData.chemical.filter(
    (row) =>
      row.chemicalName?.trim() ||
      row.formula?.trim() ||
      row.casNo?.trim() ||
      row.lowerLimit?.trim() ||
      row.upperLimit?.trim() ||
      row.exposureLimit?.trim() ||
      row.flashPoint?.trim() ||
      row.ignitionPoint?.trim() ||
      row.hazardRisk?.trim() ||
      row.managementStandard?.trim() ||
      row.dailyUsage?.trim() ||
      row.storage?.trim() ||
      row.remark?.trim()
  );

  // 물리적 인자 빈 행 필터링
  const filteredPhysical = tableData.physical.filter(
    (row) =>
      row.factorName?.trim() ||
      row.form?.trim() ||
      row.location?.trim() ||
      row.department?.trim() ||
      row.exposureRisk?.trim() ||
      row.managementStandard?.trim() ||
      row.managementMeasure?.trim() ||
      row.remark?.trim()
  );

  // 생물학적 인자 빈 행 필터링
  const filteredBiological = tableData.biological.filter(
    (row) =>
      row.factorName?.trim() ||
      row.type?.trim() ||
      row.location?.trim() ||
      row.department?.trim() ||
      row.exposureRisk?.trim() ||
      row.managementStandard?.trim() ||
      row.managementMeasure?.trim() ||
      row.remark?.trim()
  );

  // 인간공학적 인자 빈 행 필터링
  const filteredErgonomic = tableData.ergonomic.filter(
    (row) =>
      row.factorName?.trim() ||
      row.form?.trim() ||
      row.location?.trim() ||
      row.department?.trim() ||
      row.exposureRisk?.trim() ||
      row.managementStandard?.trim() ||
      row.managementMeasure?.trim() ||
      row.remark?.trim()
  );

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
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
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
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
              {filteredChemical.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.chemicalName}
                    </Typography>
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
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.exposureLimit}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.flashPoint}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.ignitionPoint}
                    </Typography>
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

      {/* 물리적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>[물리적 인자]</Typography>
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
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 110 }}>유해인자명</th>
                <th style={{ flex: 1 }}>형태</th>
                <th style={{ flex: 1 }}>위치</th>
                <th style={{ flex: 1 }}>대상소속팀</th>
                <th style={{ flex: 1 }}>노출위험</th>
                <th style={{ flex: 1 }}>관리기준</th>
                <th style={{ flex: 1 }}>관리대책</th>
                <th style={{ flex: 1 }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {filteredPhysical.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.factorName}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.form}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.location}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.department}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.exposureRisk}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.managementStandard}
                    </Typography>
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

      {/* 생물학적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [생물학적 인자]
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
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 110 }}>유해인자명</th>
                <th style={{ flex: 1 }}>유형</th>
                <th style={{ flex: 1 }}>발생위치</th>
                <th style={{ flex: 1 }}>대상소속팀</th>
                <th style={{ flex: 1 }}>노출위험</th>
                <th style={{ flex: 1 }}>관리기준</th>
                <th style={{ flex: 1 }}>관리대책</th>
                <th style={{ flex: 1 }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiological.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.factorName}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.type}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.location}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.department}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.exposureRisk}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.managementStandard}
                    </Typography>
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

      {/* 인간공학적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [인간공학적 인자]
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
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 110 }}>유해인자명</th>
                <th style={{ flex: 1 }}>형태</th>
                <th style={{ flex: 1 }}>위치</th>
                <th style={{ flex: 1 }}>대상소속팀</th>
                <th style={{ flex: 1 }}>노출위험</th>
                <th style={{ flex: 1 }}>관리기준</th>
                <th style={{ flex: 1 }}>관리대책</th>
                <th style={{ flex: 1 }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {filteredErgonomic.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.factorName}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.form}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.location}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.department}</Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.exposureRisk}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.managementStandard}
                    </Typography>
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
