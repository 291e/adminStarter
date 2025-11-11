import Box from '@mui/material/Box';
import type { Table1300Row } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { rows?: Table1300Row[] };

const defaultRows: Table1300Row[] = [
  {
    number: 1,
    name: '프레스',
    id: 'P-1-5',
    capacity: '10 ton',
    location: '1공장',
    quantity: 5,
    inspectionTarget: '고압가스안전관리법',
    safetyDevice: '광전자식',
    inspectionCycle: '3개월',
    accidentForm: '부딪힘, 넘어짐',
    remark: '자격자(2명)',
  },
  {
    number: 2,
    name: '프레스',
    id: 'P-1-5',
    capacity: '5 ton',
    location: '1공장',
    quantity: 5,
    inspectionTarget: '고압가스안전관리법',
    safetyDevice: '광전자식',
    inspectionCycle: '3개월',
    accidentForm: '부딪힘, 넘어짐',
    remark: '자격자(2명)',
  },
  {
    number: 3,
    name: '프레스',
    id: 'P-1-5',
    capacity: '5 ton',
    location: '1공장',
    quantity: 5,
    inspectionTarget: '고압가스안전관리법',
    safetyDevice: '과부하방지, 흑해지장치, 권고방지장치',
    inspectionCycle: '3개월',
    accidentForm: '부딪힘, 넘어짐',
    remark: '자격자(2명)',
  },
  {
    number: 4,
    name: '프레스',
    id: 'P-1-5',
    capacity: '5 ton',
    location: '1공장',
    quantity: 5,
    inspectionTarget: '고압가스안전관리법',
    safetyDevice: '과부하방지, 흑해지장치, 권고방지장치',
    inspectionCycle: '3개월',
    accidentForm: '부딪힘, 넘어짐',
    remark: '자격자(2명)',
  },
  {
    number: 5,
    name: '프레스',
    id: 'P-1-5',
    capacity: '5 ton',
    location: '1공장',
    quantity: 5,
    inspectionTarget: '고압가스안전관리법',
    safetyDevice: '과부하방지, 흑해지장치, 권고방지장치',
    inspectionCycle: '3개월',
    accidentForm: '부딪힘, 넘어짐',
    remark: '자격자(2명)',
  },
];

export default function RiskTable_1_3_1300({ rows = defaultRows }: Props) {
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
            <th style={{ width: 48 }}>순번</th>
            <th style={{ width: 88 }}>
              기계.기구.
              <br />
              설비명
            </th>
            <th style={{ width: 80 }}>관리번호</th>
            <th style={{ width: 60 }}>용량</th>
            <th style={{ width: 72 }}>
              단위작업
              <br />
              장소
            </th>
            <th style={{ width: 48 }}>수량</th>
            <th style={{ width: 140 }}>검사대상</th>
            <th style={{ width: 161 }}>방호장치</th>
            <th style={{ width: 72 }}>점검주기</th>
            <th style={{ width: 120 }}>
              발생가능
              <br />
              재해형태
            </th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.number}>
              <td>{r.number}</td>
              <td>{r.name}</td>
              <td>{r.id}</td>
              <td>{r.capacity}</td>
              <td>{r.location}</td>
              <td>{r.quantity}</td>
              <td>{r.inspectionTarget}</td>
              <td>{r.safetyDevice}</td>
              <td>{r.inspectionCycle}</td>
              <td>{r.accidentForm}</td>
              <td>{r.remark}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
