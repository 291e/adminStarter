import TablePagination from '@mui/material/TablePagination';

type Props = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ChecklistPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}: Props) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangeRowsPerPage}
      rowsPerPageOptions={[10, 25, 50, 100]}
      labelRowsPerPage="페이지당 행 수:"
      labelDisplayedRows={({ from, to, count: total }) => `${from}-${to} / ${total}`}
    />
  );
}

