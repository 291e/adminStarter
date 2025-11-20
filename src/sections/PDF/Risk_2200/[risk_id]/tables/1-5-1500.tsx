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
              padding: 0,
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
              padding: '4px',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '22px',
              whiteSpace: 'pre-wrap',
            },
          }}
        >
          <thead>
            <tr style={{ height: 60 }}>
              <th rowSpan={2} style={{ width: 94 }}>
                단위작업장소
              </th>
              <th rowSpan={2} style={{ width: 99 }}>
                작업내용
              </th>
              <th rowSpan={2} style={{ width: 88 }}>
                위험코드
              </th>
              <th colSpan={2} style={{ width: 203 }}>
                기계·기구·설비
              </th>
              <th colSpan={2} style={{ width: 200 }}>
                화학물질
              </th>
              <th rowSpan={2} style={{ width: 99 }}>
                발생가능
                <br />
                재해형태
              </th>
              <th rowSpan={2} style={{ width: 92 }}>
                관련 협력업체
              </th>
              <th colSpan={3} style={{ width: 240 }}>
                위험성 평가
              </th>
              <th rowSpan={2} style={{ width: 104 }}>
                비고
              </th>
            </tr>
            <tr style={{ height: 60 }}>
              <th style={{ width: 119 }}>
                기계·
                <br />
                기구·설비명
              </th>
              <th style={{ width: 104 }}>관리번호</th>
              <th style={{ width: 100 }}>화학물질명</th>
              <th style={{ width: 100 }}>CAS No</th>
              <th style={{ width: 60 }}>빈도</th>
              <th style={{ width: 60 }}>심각도</th>
              <th style={{ width: 120 }}>평가</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ height: i === 0 ? 96 : i === 1 ? 72 : 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.unit}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.work}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.hazardCode}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.machine}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.machineId}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.chemical}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.casNo}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.accidentForm}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.partner}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.freq}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.sev}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.evalLabel}</Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{r.remark}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}
