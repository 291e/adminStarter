import { useMemo } from 'react';

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
import type {
  DocumentStatusCompany,
  DocumentStatusMatrixRow,
  DocumentStatusSearchField,
} from 'src/services/admin-dashboard/admin-dashboard.types';

type Props = {
  title?: string;
  subheader?: string;
  companies: DocumentStatusCompany[];
  documentCodes: string[];
  matrix: DocumentStatusMatrixRow[];
  searchField: DocumentStatusSearchField;
  searchValue: string;
  onSearchFieldChange: (field: DocumentStatusSearchField) => void;
  onSearchValueChange: (value: string) => void;
  onRefresh?: () => void;
};

export default function AdminDocumentStatus({
  title,
  subheader,
  companies,
  documentCodes,
  matrix,
  searchField,
  searchValue,
  onSearchFieldChange,
  onSearchValueChange,
  onRefresh,
}: Props) {
  const router = useRouter();

  const matrixMap = useMemo(() => {
    const map = new Map<string, number[]>();
    matrix.forEach((row) => {
      const key = String(row.documentCode || row.tableType || '');
      if (!key) return;
      map.set(key, row.counts || []);
    });
    return map;
  }, [matrix]);

  const handleRowClick = (code: string) => {
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
              value={searchField}
              onChange={(event) =>
                onSearchFieldChange(event.target.value as DocumentStatusSearchField)
              }
              sx={{ height: 40, bgcolor: 'background.paper', borderRadius: 1.5, minWidth: 120 }}
            >
              <MenuItem value="documentCode">문서코드</MenuItem>
              <MenuItem value="documentName">문서명</MenuItem>
            </Select>

            <TextField
              size="small"
              placeholder="검색어 입력"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
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
              onClick={onRefresh}
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
                    width: 120,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  조직명/문서명
                </TableCell>

                {companies.map((company) => (
                  <TableCell
                    key={company.companyIdx}
                    align="center"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 'fontWeightSemiBold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {company.companyName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {documentCodes.map((code) => {
                const counts = matrixMap.get(code) || [];
                return (
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

                    {companies.map((company, index) => (
                      <TableCell key={`${code}-${company.companyIdx}`} align="center">
                        <Typography variant="body2">{counts[index] ?? 0}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}
