import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type DefaultTableRow = {
  risk: React.ReactNode | string;
  removal: React.ReactNode | string;
  engineering: React.ReactNode | string;
  administrative: React.ReactNode | string;
  ppe: React.ReactNode | string;
};

type Props = {
  data: DefaultTableRow[];
};

export default function DefaultRiskAssessmentTable({ data }: Props) {
  return (
    <Box sx={{ width: '100%', maxWidth: 1240 }}>
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
            <th style={{ width: '20%' }}>위험 요인</th>
            <th style={{ width: '20%' }}>제거·대체</th>
            <th style={{ width: '20%' }}>공학적 통제</th>
            <th style={{ width: '20%' }}>행정적 통제</th>
            <th style={{ width: '20%' }}>PPE방안</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.risk}</td>
              <td>{row.removal}</td>
              <td>{row.engineering}</td>
              <td>{row.administrative}</td>
              <td>{row.ppe}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

