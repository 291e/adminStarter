import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (event: any, newPage: number) => void;
  onChangeRowsPerPage: (event: any) => void;
};

export default function BoardPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}: Props) {
  const start = page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, count);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={2}
      sx={{ p: 2, bgcolor: 'background.paper', borderRadius: '0 0 8px 8px' }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          표시행 수
        </Typography>
        <Select
          size="small"
          value={rowsPerPage}
          onChange={onChangeRowsPerPage}
          sx={{
            height: 32,
            '& .MuiSelect-select': { py: 0, fontSize: 13 },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          }}
        >
          {[10, 25, 50].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {`${start}-${end} of ${count}`}
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <IconButton size="small" disabled={page === 0} onClick={(e) => onChangePage(e, page - 1)}>
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>
        <IconButton size="small" disabled={end >= count} onClick={(e) => onChangePage(e, page + 1)}>
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
