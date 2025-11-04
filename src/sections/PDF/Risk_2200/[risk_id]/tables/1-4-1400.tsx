import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table1400Data } from '../types/table-data';

// ----------------------------------------------------------------------

type Props = { data?: Table1400Data };

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
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
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '20px',
          height: 60,
        },
        '& td': {
          fontSize: 13,
          fontWeight: 500,
          lineHeight: '22px',
          whiteSpace: 'pre-wrap',
          height: 52,
        },
      }}
    >
      {children}
    </Box>
  );
}

// 1) 화학적 인자
function ChemicalFactors({ rows }: { rows: Table1400Data['chemical'] }) {
  if (rows.length === 0) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>1. 화학적 인자</Typography>
      <TableWrapper>
        <thead>
          <tr>
            <th style={{ width: 128 }}>화학물질명</th>
            <th style={{ width: 120 }}>화학식</th>
            <th style={{ width: 120 }}>CAS No</th>
            <th style={{ width: 50 }}>폭발한계(%)하한</th>
            <th style={{ width: 50 }}>폭발한계(%)상한</th>
            <th style={{ width: 135 }}>노출기준</th>
            <th style={{ width: 50 }}>인화점(℃)</th>
            <th style={{ width: 50 }}>발화점(℃)</th>
            <th>유해성 위험성 구분</th>
            <th>산업안전보건법 관리기준</th>
            <th style={{ width: 50 }}>일일사용량</th>
            <th style={{ width: 50 }}>저장량</th>
            <th style={{ width: 100 }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.chemicalName}</td>
              <td>{row.formula}</td>
              <td>{row.casNo}</td>
              <td>{row.lowerLimit}</td>
              <td>{row.upperLimit}</td>
              <td>{row.exposureLimit}</td>
              <td>{row.flashPoint}</td>
              <td>{row.ignitionPoint}</td>
              <td>{row.hazardRisk}</td>
              <td>{row.managementStandard}</td>
              <td>{row.dailyUsage}</td>
              <td>{row.storage}</td>
              <td>{row.remark}</td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </Box>
  );
}

// 2) 물리적 인자
function PhysicalFactors({ rows }: { rows: Table1400Data['physical'] }) {
  if (rows.length === 0) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mt: 4 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>2. 물리적 인자</Typography>
      <TableWrapper>
        <thead>
          <tr>
            <th style={{ width: 128 }}>유해인자명</th>
            <th style={{ width: 120 }}>형태</th>
            <th style={{ width: 120 }}>위치</th>
            <th style={{ width: 116 }}>대상부서</th>
            <th>노출위험</th>
            <th>관리기준</th>
            <th style={{ width: 182 }}>관리대책</th>
            <th style={{ width: 100 }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.factorName}</td>
              <td>{row.form}</td>
              <td>{row.location}</td>
              <td>{row.department}</td>
              <td>{row.exposureRisk}</td>
              <td>{row.managementStandard}</td>
              <td>{row.managementMeasure}</td>
              <td>{row.remark}</td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </Box>
  );
}

// 3) 생물학적 인자
function BiologicalFactors({ rows }: { rows: Table1400Data['biological'] }) {
  if (rows.length === 0) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mt: 4 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>3. 생물학적 인자</Typography>
      <TableWrapper>
        <thead>
          <tr>
            <th style={{ width: 128 }}>유해인자명</th>
            <th style={{ width: 120 }}>유형</th>
            <th style={{ width: 120 }}>발생위치</th>
            <th style={{ width: 116 }}>대상부서</th>
            <th>노출위험</th>
            <th>관리기준</th>
            <th style={{ width: 182 }}>관리대책</th>
            <th style={{ width: 100 }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.factorName}</td>
              <td>{row.type}</td>
              <td>{row.location}</td>
              <td>{row.department}</td>
              <td>{row.exposureRisk}</td>
              <td>{row.managementStandard}</td>
              <td>{row.managementMeasure}</td>
              <td>{row.remark}</td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </Box>
  );
}

// 4) 인간공학적 인자
function ErgonomicFactors({ rows }: { rows: Table1400Data['ergonomic'] }) {
  if (rows.length === 0) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mt: 4 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>4. 인간공학적 인자</Typography>
      <TableWrapper>
        <thead>
          <tr>
            <th style={{ width: 128 }}>유해인자명</th>
            <th style={{ width: 120 }}>형태</th>
            <th style={{ width: 120 }}>위치</th>
            <th style={{ width: 116 }}>대상부서</th>
            <th>노출위험</th>
            <th>관리기준</th>
            <th style={{ width: 182 }}>관리대책</th>
            <th style={{ width: 100 }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.factorName}</td>
              <td>{row.form}</td>
              <td>{row.location}</td>
              <td>{row.department}</td>
              <td>{row.exposureRisk}</td>
              <td>{row.managementStandard}</td>
              <td>{row.managementMeasure}</td>
              <td>{row.remark}</td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </Box>
  );
}

export default function RiskTable_1_4_1400({ data }: Props) {
  const defaultData: Table1400Data = {
    chemical: [],
    physical: [],
    biological: [],
    ergonomic: [],
  };

  const tableData = data || defaultData;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240 }}>
      <ChemicalFactors rows={tableData.chemical} />
      <PhysicalFactors rows={tableData.physical} />
      <BiologicalFactors rows={tableData.biological} />
      <ErgonomicFactors rows={tableData.ergonomic} />
    </Box>
  );
}
