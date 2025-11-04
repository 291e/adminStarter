import React from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type Risk_2200Row = {
  id: string;
  sequence: number;
  registeredAt: string;
  registeredTime: string;
  organizationName: string;
  documentName: string;
  writtenAt: string;
  approvalDeadline: string;
  completionRate: {
    removal: number; // 제거·대체 완료율 (0-100)
    engineering: number; // 공학적 통제 완료율 (0-100)
  };
};

type Props = {
  rows: Risk_2200Row[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onViewDetail: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownloadPDF?: (id: string) => void;
  onSendNotification?: (id: string) => void;
};

export default function Risk_2200Table({
  rows,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onViewDetail,
  onEdit,
  onDelete,
  onDownloadPDF,
  onSendNotification,
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchorEl(event.currentTarget);
    setOpenMenuId(id);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setOpenMenuId(null);
  };

  const handleMenuItemClick = (action: string, id: string) => {
    if (action === 'detail') {
      onViewDetail(id);
    } else if (action === 'edit' && onEdit) {
      onEdit(id);
    } else if (action === 'delete' && onDelete) {
      onDelete(id);
    }
    handleCloseMenu();
  };

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < rows.length;

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: 44,
                bgcolor: 'grey.100',
                minHeight: 56,
                p: 1,
              }}
            >
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => onSelectAll(e.target.checked)}
                size="small"
              />
            </TableCell>
            <TableCell
              sx={{
                width: 68,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              순번
            </TableCell>
            <TableCell
              sx={{
                width: 120,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              등록일
            </TableCell>
            <TableCell
              sx={{
                width: 160,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              조직명
            </TableCell>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              문서명
            </TableCell>
            <TableCell
              sx={{
                width: 120,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              작성일
            </TableCell>
            <TableCell
              sx={{
                width: 120,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              결재 마감일
            </TableCell>
            <TableCell
              sx={{
                width: 112,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              작성률
            </TableCell>
            <TableCell
              sx={{
                width: 112,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
              }}
            >
              결재율
            </TableCell>
            <TableCell
              sx={{
                width: 80,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
                textAlign: 'center',
              }}
            >
              PDF
            </TableCell>
            <TableCell
              sx={{
                width: 80,
                bgcolor: 'grey.100',
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                p: 2,
                textAlign: 'center',
              }}
            >
              알림발송
            </TableCell>
            <TableCell
              sx={{
                width: 68,
                bgcolor: 'grey.100',
                p: 2,
              }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{
                borderBottom: '1px dashed',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <TableCell sx={{ p: 1 }}>
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onChange={() => onSelectRow(row.id)}
                  size="small"
                />
              </TableCell>
              <TableCell
                sx={{
                  width: 68,
                  fontSize: 14,
                  p: 2,
                }}
              >
                {row.sequence}
              </TableCell>
              <TableCell
                sx={{
                  width: 120,
                  fontSize: 14,
                  p: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {row.registeredAt}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
                    {row.registeredTime}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  width: 160,
                  fontSize: 14,
                  p: 2,
                }}
              >
                {row.organizationName}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: 14,
                  p: 2,
                }}
              >
                {row.documentName}
              </TableCell>
              <TableCell
                sx={{
                  width: 120,
                  fontSize: 14,
                  p: 2,
                }}
              >
                {row.writtenAt}
              </TableCell>
              <TableCell
                sx={{
                  width: 120,
                  fontSize: 14,
                  p: 2,
                }}
              >
                {row.approvalDeadline}
              </TableCell>
              <TableCell sx={{ width: 112, p: 2 }}>
                <Box sx={{ width: 80 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', textAlign: 'right', display: 'block' }}
                  >
                    {row.completionRate.removal}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={row.completionRate.removal}
                    color="warning"
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      mt: 0.5,
                      bgcolor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                  >
                    {row.completionRate.removal} / 100
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ width: 112, p: 2 }}>
                <Box sx={{ width: 80 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', textAlign: 'right', display: 'block' }}
                  >
                    {row.completionRate.engineering}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={row.completionRate.engineering}
                    color="warning"
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      mt: 0.5,
                      bgcolor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                  >
                    {row.completionRate.engineering} / 100
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ width: 80, p: 1, textAlign: 'center' }}>
                <Tooltip title="PDF 다운로드">
                  <IconButton
                    size="small"
                    onClick={() => onDownloadPDF?.(row.id)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon="solar:file-bold-duotone" width={20} />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ width: 80, p: 1, textAlign: 'center' }}>
                <Tooltip title="알림발송">
                  <IconButton
                    size="small"
                    onClick={() => onSendNotification?.(row.id)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'warning.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon="solar:bell-bing-bold-duotone" width={20} />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ width: 68, p: 2 }}>
                <IconButton size="small" onClick={(e) => handleOpenMenu(e, row.id)}>
                  <Iconify icon="eva:more-vertical-fill" width={20} />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl) && openMenuId === row.id}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => handleMenuItemClick('detail', row.id)}>
                    상세보기
                  </MenuItem>
                  {onEdit && (
                    <MenuItem onClick={() => handleMenuItemClick('edit', row.id)}>수정</MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem
                      onClick={() => handleMenuItemClick('delete', row.id)}
                      sx={{ color: 'error.main' }}
                    >
                      삭제
                    </MenuItem>
                  )}
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
