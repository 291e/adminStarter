import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';

type Props = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
};

export default function PaymentHistoryPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2.5,
      }}
    >
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onChangePage(p)}
        onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage=""
        labelDisplayedRows={({ from, to, count: total }) => `${from}-${to} of ${total}`}
        sx={{
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 0,
            paddingRight: 0,
          },
          '& .MuiTablePagination-selectLabel': {
            display: 'none',
          },
          '& .MuiTablePagination-displayedRows': {
            marginLeft: 2.5,
          },
        }}
      />
    </Box>
  );
}
