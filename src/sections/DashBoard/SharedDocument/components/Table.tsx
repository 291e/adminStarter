import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type SharedDocument = {
  id: string;
  priority: 'urgent' | 'important' | 'reference';
  documentName: string;
  registeredDate: string; // YYYY-MM-DD HH:mm:ss 형식
  status: 'public' | 'private';
};

type Props = {
  rows: SharedDocument[];
  onShareToChat?: (row: SharedDocument) => void;
  onEdit?: (row: SharedDocument) => void;
  onDelete?: (row: SharedDocument) => void;
};

const PRIORITY_CONFIG = {
  urgent: {
    label: '긴급',
    color: '#b71d18',
    bgColor: 'rgba(255, 86, 48, 0.16)',
  },
  important: {
    label: '중요',
    color: '#b76e00',
    bgColor: 'rgba(255, 171, 0, 0.16)',
  },
  reference: {
    label: '참고',
    color: '#1d7bf5',
    bgColor: 'rgba(29, 123, 245, 0.16)',
  },
};

const STATUS_CONFIG = {
  public: {
    label: '공개',
    color: '#007867',
    bgColor: 'rgba(0, 167, 111, 0.16)',
  },
  private: {
    label: '비공개',
    color: 'text.secondary',
    bgColor: 'rgba(145, 158, 171, 0.16)',
  },
};

export default function SharedDocumentTable({ rows, onShareToChat, onEdit, onDelete }: Props) {
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

  const formatDate = (dateString: string) => {
    const [date, time] = dateString.split(' ');
    return { date, time };
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 68, width: 68 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 100, width: 100 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                중요도
                <Iconify
                  icon="eva:arrow-downward-fill"
                  width={18}
                  sx={{ color: 'text.secondary' }}
                />
              </Box>
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>문서명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 200, width: 200 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                등록일
                <Iconify
                  icon="eva:arrow-downward-fill"
                  width={18}
                  sx={{ color: 'text.secondary' }}
                />
              </Box>
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 80, width: 80 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68, width: 68 }}>
              &nbsp;
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => {
            const priorityConfig = PRIORITY_CONFIG[row.priority];
            const statusConfig = STATUS_CONFIG[row.status];
            const { date, time } = formatDate(row.registeredDate);
            const isMenuOpen = openMenuId === row.id;

            return (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 14, textAlign: 'center' }}>
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={priorityConfig.label}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 700,
                      bgcolor: priorityConfig.bgColor,
                      color: priorityConfig.color,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 14,
                    }}
                  >
                    {row.documentName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: 14, color: 'text.primary' }}>
                      {date}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                      {time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={statusConfig.label}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 700,
                      bgcolor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, row.id)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon="eva:more-vertical-fill" width={20} />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl[row.id] || null}
                    open={isMenuOpen}
                    onClose={() => handleCloseMenu(row.id)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuList>
                      {onShareToChat && (
                        <MenuItem
                          onClick={() => {
                            onShareToChat(row);
                            handleCloseMenu(row.id);
                          }}
                        >
                          채팅방 공유하기
                        </MenuItem>
                      )}
                      {onEdit && (
                        <MenuItem
                          onClick={() => {
                            onEdit(row);
                            handleCloseMenu(row.id);
                          }}
                        >
                          수정하기
                        </MenuItem>
                      )}
                      {onDelete && (
                        <MenuItem
                          onClick={() => {
                            onDelete(row);
                            handleCloseMenu(row.id);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          삭제하기
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
