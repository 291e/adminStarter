import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  total: number;
  rowsPerPage: number;
  currentPage: number;
  onChangeRowsPerPage: (event: any) => void;
  onChangePage: (page: number) => void;
};

export default function InquiriesPagination({
  total,
  rowsPerPage,
  currentPage,
  onChangeRowsPerPage,
  onChangePage,
}: Props) {
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, total);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
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
            mr: 2,
            '& .MuiSelect-select': { py: 0.5, fontSize: 13 },
            '& fieldset': { border: 'none' },
          }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
        </Select>

        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
          {start}-{end} of {total}
        </Typography>

        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            disabled={currentPage === 1}
            onClick={() => onChangePage(currentPage - 1)}
          >
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
          <IconButton
            size="small"
            disabled={currentPage === totalPages}
            onClick={() => onChangePage(currentPage + 1)}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
