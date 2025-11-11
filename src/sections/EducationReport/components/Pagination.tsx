import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';

type Props = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  onCreate?: () => void;
};

export default function EducationReportPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  onCreate,
}: Props) {
  const start = page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, count);
  const totalPages = Math.ceil(count / rowsPerPage);

  const handlePrevious = () => {
    if (page > 0) {
      onChangePage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      onChangePage(page + 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 1.25,
        px: 2,
      }}
    >
      {onCreate && (
        <Button variant="contained" color="primary" onClick={onCreate} size="small">
          교육 추가하기
        </Button>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        <Typography variant="body2">표시행 수</Typography>

        <FormControl size="small" sx={{ minWidth: 60 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => onChangeRowsPerPage(Number(e.target.value))}
            sx={{
              '& .MuiSelect-select': {
                py: 1,
                px: 1.5,
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2">
          {start}-{end} of {count}
        </Typography>

        <Stack direction="row" spacing={0}>
          <IconButton
            size="small"
            onClick={handlePrevious}
            disabled={page === 0}
            sx={{
              p: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={page >= totalPages - 1}
            sx={{
              p: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
