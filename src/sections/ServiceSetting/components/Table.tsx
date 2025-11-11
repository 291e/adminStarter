import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { useState } from 'react';

import type { ServiceSetting } from 'src/_mock/_service-setting';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: ServiceSetting[];
  onViewDetail?: (row: ServiceSetting) => void;
  onEdit?: (row: ServiceSetting) => void;
  onDeactivate?: (row: ServiceSetting) => void;
  onDelete?: (row: ServiceSetting) => void;
};

export default function ServiceSettingTable({
  rows,
  onViewDetail,
  onEdit,
  onDeactivate,
  onDelete,
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation();
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    setOpenMenuId(rowId);
  };

  const handleCloseMenu = (rowId: string) => {
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: null }));
    setOpenMenuId(null);
  };

  const formatPrice = (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 80 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 180 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 200 }}>서비스명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>서비스 기간</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              조직원 수
            </TableCell>
            <TableCell align="right" sx={{ bgcolor: 'grey.100', minWidth: 120 }}>
              월 사용료(원)
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              구독수
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68 }}>
              액션
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography variant="body2">{row.order}</Typography>
              </TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {fDateTime(row.registrationDate, 'YYYY-MM-DD')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                    {fDateTime(row.registrationDate, 'HH:mm:ss')}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.serviceName}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.servicePeriod}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{row.memberCount}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{formatPrice(row.monthlyFee)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{row.subscriptions}</Typography>
              </TableCell>
              <TableCell align="center">
                {row.status === 'active' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, row.id)}
                  sx={{
                    bgcolor: 'grey.200',
                    '&:hover': {
                      bgcolor: 'grey.300',
                    },
                  }}
                >
                  <Iconify icon="eva:more-vertical-fill" width={20} />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl[row.id]}
                  open={openMenuId === row.id}
                  onClose={() => handleCloseMenu(row.id)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  slotProps={{
                    paper: {
                      sx: { minWidth: 120 },
                    },
                  }}
                >
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.id);
                        onEdit?.(row);
                      }}
                    >
                      수정
                    </MenuItem>

                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.id);
                        onDelete?.(row);
                      }}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.lighter',
                        },
                      }}
                    >
                      삭제
                    </MenuItem>
                  </MenuList>
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
