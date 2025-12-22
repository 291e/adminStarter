import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';

type Props = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
};

export default function OperationPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}: Props) {
  // TablePagination은 0-based page를 사용하므로 변환
  const tablePage = page - 1;

  return (
    <Box>
      <TablePagination
        component="div"
        count={count}
        page={tablePage}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onChangePage(p + 1)} // 0-based를 1-based로 변환
        onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 20, 30]}
        labelRowsPerPage="표시 행 수 :"
        labelDisplayedRows={({ from, to, count: total }) => `${from}-${to} / ${total}`}
      />
    </Box>
  );
}
