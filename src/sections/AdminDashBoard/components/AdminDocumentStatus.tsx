import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const DOCUMENT_CODES = [
  '1100',
  '1200',
  '1300',
  '1400',
  '1500',
  '2100',
  '2200',
  '2300',
  '2400',
  '3100',
];

const COMPANY_NAMES = [
  '이편한 자동화 기술',
  '엑셀 텍',
  '디지털 네트워크',
  '클라우드 시스템',
  '스마트 솔루션즈',
  'AI 테크',
  '모바일 솔루션',
  '블록체인 서비스',
];

const MATRIX_DATA: Record<string, number[]> = {
  '1100': [12, 3, 25, 4, 2, 21, 13, 25],
  '1200': [3, 3, 3, 21, 14, 15, 6, 3],
  '1300': [10, 5, 21, 7, 7, 3, 2, 21],
  '1400': [3, 3, 14, 4, 28, 47, 54, 14],
  '1500': [5, 7, 21, 4, 3, 24, 3, 21],
  '2100': [23, 7, 41, 2, 27, 8, 23, 41],
  '2200': [34, 4, 33, 24, 9, 4, 6, 33],
  '2300': [4, 3, 43, 51, 21, 21, 3, 43],
  '2400': [3, 35, 32, 2, 6, 31, 11, 32],
  '3100': [4, 4, 23, 7, 3, 5, 61, 23],
};

export default function AdminDocumentStatus({
  title,
  subheader,
}: {
  title?: string;
  subheader?: string;
}) {
  const router = useRouter();

  const handleRowClick = (code: string) => {
    // Navigate to detail page with document code as query param
    router.push(`${paths.dashboard.documentStatus}?code=${code}`);
  };
  return (
    <Card>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Select
              size="small"
              value="문서명"
              sx={{ height: 40, bgcolor: 'background.paper', borderRadius: 1.5, minWidth: 120 }}
            >
              <MenuItem value="문서명">문서명</MenuItem>
            </Select>
            <TextField
              size="small"
              placeholder="1300"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  height: 40,
                  bgcolor: 'background.paper',
                },
              }}
            />
            <IconButton
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                width: 40,
                height: 40,
                color: 'primary.main',
              }}
            >
              <Iconify icon={'eva:refresh-fill' as any} />
            </IconButton>
          </Box>
        }
        sx={{ mb: 3 }}
      />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.neutral' }}>
                <TableCell
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 'fontWeightSemiBold',
                    width: 100,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  조직명/문서명
                </TableCell>
                {COMPANY_NAMES.map((company) => (
                  <TableCell
                    key={company}
                    align="center"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 'fontWeightSemiBold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {company}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {DOCUMENT_CODES.map((code) => (
                <TableRow
                  key={code}
                  hover
                  onClick={() => handleRowClick(code)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(7, 141, 238, 0.08) !important',
                      '& .row-header-cell': {
                        bgcolor: 'rgba(7, 141, 238, 0.12) !important',
                      },
                    },
                  }}
                >
                  <TableCell
                    className="row-header-cell"
                    sx={{
                      bgcolor: 'background.neutral',
                      fontWeight: 'fontWeightMedium',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      textAlign: 'center',
                    }}
                  >
                    {code}
                  </TableCell>
                  {MATRIX_DATA[code].map((value, index) => (
                    <TableCell key={index} align="center">
                      <Typography variant="body2">{value}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}
