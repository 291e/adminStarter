import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type RiskAssessmentRow = {
  id: string;
  risk: string;
  removal: string;
  engineering: string;
  administrative: string;
  ppe: string;
};

type Props = {
  rows: RiskAssessmentRow[];
  onRowChange: (index: number, field: keyof RiskAssessmentRow, value: string) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (index: number, direction: 'up' | 'down') => void;
  onAddRow: () => void;
};

export default function RiskAssessmentTableForm({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
}: Props) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box sx={{ pb: 1, px: 1 }}>
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
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '20%' }}>위험요인</th>
              <th style={{ width: '20%' }}>제거·대체</th>
              <th style={{ width: '20%' }}>공학적 통제</th>
              <th style={{ width: '20%' }}>행정적 통제</th>
              <th style={{ width: '20%' }}>PPE방안</th>
              <th style={{ width: '46px' }}>이동</th>
              <th style={{ width: '55px' }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <TextField
                    size="small"
                    value={row.risk}
                    onChange={(e) => onRowChange(index, 'risk', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.removal}
                    onChange={(e) => onRowChange(index, 'removal', e.target.value)}
                    fullWidth
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.engineering}
                    onChange={(e) => onRowChange(index, 'engineering', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.administrative}
                    onChange={(e) => onRowChange(index, 'administrative', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.ppe}
                    onChange={(e) => onRowChange(index, 'ppe', e.target.value)}
                    fullWidth
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onRowMove(index, 'up')}
                      disabled={index === 0}
                      sx={{ p: 0.625 }}
                    >
                      <Iconify icon="eva:arrow-upward-fill" width={20} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onRowMove(index, 'down')}
                      disabled={index === rows.length - 1}
                      sx={{ p: 0.625 }}
                    >
                      <Iconify icon="eva:arrow-downward-fill" width={20} />
                    </IconButton>
                  </Box>
                </td>
                <td>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onRowDelete(index)}
                    sx={{
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      minHeight: 30,
                      fontSize: 13,
                      fontWeight: 700,
                      px: 1,
                      py: 0.5,
                      '&:hover': {
                        bgcolor: 'error.dark',
                      },
                    }}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 5 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={onAddRow}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            minHeight: 36,
            fontSize: 14,
            fontWeight: 700,
            px: 1.5,
            py: 0.75,
          }}
        >
          항목추가
        </Button>
      </Box>
    </Box>
  );
}
