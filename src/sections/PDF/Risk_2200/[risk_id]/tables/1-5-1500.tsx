import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Table1500Row } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { rows?: Table1500Row[] };

const defaultRows: Table1500Row[] = [
  {
    unit: '1공장',
    work: '지게차 이용 운반작업',
    hazardCode: 'H-1-01',
    machine: '지게차',
    machineId: '55머1254',
    chemical: '이산화탄소',
    casNo: 'Co2',
    accidentForm: '화재, 폭발',
    partner: '없음',
    freq: 3,
    sev: 4,
    evalLabel: '6 (관리필요)',
    remark: '작업허가서 발급대상',
  },
  {
    unit: '1공장',
    work: '',
    hazardCode: '',
    machine: '',
    machineId: '',
    chemical: '',
    casNo: '',
    accidentForm: '',
    partner: '',
    freq: '',
    sev: '',
    evalLabel: '',
    remark: '',
  },
  {
    unit: '1공장',
    work: '',
    hazardCode: '',
    machine: '',
    machineId: '',
    chemical: '',
    casNo: '',
    accidentForm: '',
    partner: '',
    freq: '',
    sev: '',
    evalLabel: '',
    remark: '',
  },
  {
    unit: '1공장',
    work: '',
    hazardCode: '',
    machine: '',
    machineId: '',
    chemical: '',
    casNo: '',
    accidentForm: '',
    partner: '',
    freq: '',
    sev: '',
    evalLabel: '',
    remark: '',
  },
];

export default function RiskTable_1_5_1500({ rows = defaultRows }: Props) {
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
          },
        }}
      >
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: 68 }}>
              단위{`\n`}작업장소
            </th>
            <th rowSpan={2} style={{ width: 90 }}>
              작업내용
            </th>
            <th rowSpan={2} style={{ width: 72.5 }}>
              위험코드
            </th>
            <th colSpan={2} style={{ width: 152.5 }}>
              기계•기구•설비
            </th>
            <th colSpan={2} style={{ width: 160.5 }}>
              화학 물질
            </th>
            <th rowSpan={2} style={{ width: 88 }}>
              발생가능{`\n`}재해형태
            </th>
            <th rowSpan={2}>관련 협력업체</th>
            <th colSpan={3} style={{ width: 176 }}>
              위험성 평가
            </th>
            <th rowSpan={2} style={{ width: 100 }}>
              비고
            </th>
          </tr>
          <tr>
            <th style={{ width: 80 }}>관련기계.기구.설비</th>
            <th style={{ width: 72.5 }}>관리번호</th>
            <th style={{ width: 88 }}>화학물질명</th>
            <th style={{ width: 72.5 }}>CAS No</th>
            <th style={{ width: 48 }}>빈도</th>
            <th style={{ width: 48 }}>심각도</th>
            <th style={{ width: 80 }}>평가</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.unit}</td>
              <td>{r.work}</td>
              <td>{r.hazardCode}</td>
              <td>{r.machine}</td>
              <td>{r.machineId}</td>
              <td>{r.chemical}</td>
              <td>{r.casNo}</td>
              <td>{r.accidentForm}</td>
              <td>{r.partner}</td>
              <td>{r.freq}</td>
              <td>{r.sev}</td>
              <td>
                <Typography component="span" sx={{ fontSize: 14 }}>
                  {r.evalLabel}
                </Typography>
              </td>
              <td>{r.remark}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
