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
import { hexToRgba } from 'src/utils/color';
import type {
  SharedDocument as ApiSharedDocument,
  PrioritySetting,
} from 'src/services/dashboard/dashboard.types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../constants/priority';

// ----------------------------------------------------------------------

// API 타입 직접 사용
export type SharedDocument = ApiSharedDocument;

type Props = {
  rows: SharedDocument[];
  prioritySettings?: PrioritySetting[];
  onShareToChat?: (row: SharedDocument) => void;
  onEdit?: (row: SharedDocument) => void;
  onDelete?: (row: SharedDocument) => void;
};

export default function SharedDocumentTable({
  rows,
  prioritySettings = [],
  onShareToChat,
  onEdit,
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
            // prioritySettings에서 해당 priority의 labelType과 일치하는 설정 찾기
            const prioritySetting = prioritySettings.find(
              (setting) => setting.labelType === row.priority
            );

            // prioritySettings에서 찾은 경우 해당 색상 사용, 없으면 PRIORITY_CONFIG 또는 기본값 사용
            let priorityConfig: { label: string; color: string; bgColor: string };
            if (prioritySetting && prioritySetting.color) {
              // prioritySettings에서 찾은 경우
              const colorHex = prioritySetting.color;
              // HEX 색상을 rgba로 변환 (투명도 0.16)
              const bgColor = hexToRgba(colorHex, 0.16);

              priorityConfig = {
                label: prioritySetting.labelType || row.priority || '중요도',
                color: colorHex,
                bgColor,
              };
            } else {
              // prioritySettings에서 찾지 못한 경우 PRIORITY_CONFIG 또는 기본값 사용
              priorityConfig =
                PRIORITY_CONFIG[row.priority || ''] ||
                (row.priority
                  ? {
                      label: row.priority,
                      color: PRIORITY_CONFIG.DEFAULT.color,
                      bgColor: PRIORITY_CONFIG.DEFAULT.bgColor,
                    }
                  : PRIORITY_CONFIG.DEFAULT);
            }

            const statusConfig = STATUS_CONFIG[row.isPublic] || STATUS_CONFIG[0];
            // createAt을 등록일로 사용 (YYYY-MM-DD 형식)
            const createDate = row.createAt
              ? new Date(row.createAt).toISOString().split('T')[0]
              : '';
            const createTime = row.createAt
              ? new Date(row.createAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
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
                      {createDate}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                      {createTime}
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
