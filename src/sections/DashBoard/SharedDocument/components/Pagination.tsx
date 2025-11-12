import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import { Iconify } from 'src/components/iconify';

type Props = {
  dense: boolean;
  onChangeDense: (dense: boolean) => void;
  rowsPerPage: number;
  onChangeRowsPerPage: (rowsPerPage: number) => void;
  page: number;
  total: number;
  count: number;
  onPageChange: (page: number) => void;
};

export default function SharedDocumentPagination({
  dense,
  onChangeDense,
  rowsPerPage,
  onChangeRowsPerPage,
  page,
  total,
  count,
  onPageChange,
}: Props) {
  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, total);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2.5,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Switch
          checked={dense}
          onChange={(e) => {
            onChangeDense(e.target.checked);
            // TODO: 좁게 보기 변경 시 UI만 업데이트 (API 호출 불필요)
          }}
          size="small"
        />
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          좁게 보기
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, justifyContent: 'flex-end' }}>
        <Typography variant="body2" sx={{ fontSize: 14, textAlign: 'right' }}>
          표시행 수
        </Typography>
        <FormControl size="small" sx={{ minWidth: 60 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              onChangeRowsPerPage(Number(e.target.value));
              // TODO: 표시행 수 변경 시 TanStack Query로 공유 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
            }}
            sx={{
              fontSize: 14,
              '& .MuiSelect-select': {
                py: 0.5,
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {start}-{end} of {total}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= Math.ceil(total / rowsPerPage)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

