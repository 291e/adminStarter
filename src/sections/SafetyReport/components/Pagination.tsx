import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';

type Props = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
};

export default function SafetyReportPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}: Props) {
  return (
    <Box>
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onChangePage(p)}
        onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 20, 30]}
      />
    </Box>
  );
}
