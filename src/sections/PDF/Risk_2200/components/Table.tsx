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
import Badge from 'src/components/safeyoui/badge';
import ProgressModal from './ProgressModal';
import PublishModal from './PublishModal';

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
  status: 'draft' | 'in_progress' | 'completed'; // 상태: 임시저장, 진행중, 완료
  published: boolean; // 게시 여부
};

type Props = {
  rows: Risk_2200Row[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownloadPDF?: (id: string) => void;
  onCopy?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onViewProgress?: (id: string) => void;
};

export default function Risk_2200Table({
  rows,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEdit,
  onDelete,
  onDownloadPDF,
  onCopy,
  onTogglePublish,
  onViewProgress,
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [progressModalOpen, setProgressModalOpen] = React.useState(false);
  const [selectedProgressRow, setSelectedProgressRow] = React.useState<Risk_2200Row | null>(null);
  const [publishModalOpen, setPublishModalOpen] = React.useState(false);
  const [selectedPublishRow, setSelectedPublishRow] = React.useState<Risk_2200Row | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchorEl(event.currentTarget);
    setOpenMenuId(id);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setOpenMenuId(null);
  };

  const handleMenuItemClick = (action: string, id: string) => {
    if (action === 'edit' && onEdit) {
      onEdit(id);
    } else if (action === 'delete' && onDelete) {
      onDelete(id);
    }
    handleCloseMenu();
  };

  const handleOpenProgressModal = (row: Risk_2200Row) => {
    setSelectedProgressRow(row);
    setProgressModalOpen(true);
  };

  const handleCloseProgressModal = () => {
    setProgressModalOpen(false);
    setSelectedProgressRow(null);
  };

  const handleOpenPublishModal = (row: Risk_2200Row) => {
    setSelectedPublishRow(row);
    setPublishModalOpen(true);
  };

  const handleClosePublishModal = () => {
    setPublishModalOpen(false);
    setSelectedPublishRow(null);
  };

  const handleConfirmPublish = (data: {
    documentName: string;
    importance: string;
    isPublic: boolean;
    file?: File;
  }) => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 게시
    // const mutation = useMutation({
    //   mutationFn: (data: {
    //     documentId: string;
    //     documentName: string;
    //     importance: string;
    //     isPublic: boolean;
    //     file?: File;
    //   }) => publishDocument(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    //     if (onTogglePublish) {
    //       onTogglePublish(selectedPublishRow!.id, true);
    //     }
    //     handleClosePublishModal();
    //   },
    // });
    // mutation.mutate({
    //   documentId: selectedPublishRow!.id,
    //   ...data,
    // });
    if (selectedPublishRow && onTogglePublish) {
      onTogglePublish(selectedPublishRow.id, true);
    }
    handleClosePublishModal();
  };

  const getStatusLabel = (status: Risk_2200Row['status']) => {
    switch (status) {
      case 'draft':
        return '임시저장';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      default:
        return '';
    }
  };

  const getStatusVariant = (status: Risk_2200Row['status']): 'default' | 'info' | 'completed' => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'completed';
      default:
        return 'default';
    }
  };

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < rows.length;

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: 44,
                  minWidth: 44,
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
                  minWidth: 68,
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
                  minWidth: 120,
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
                  minWidth: 160,
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
                  minWidth: 200,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary',
                  p: 2,
                  width: 200,
                }}
              >
                문서명
              </TableCell>
              <TableCell
                sx={{
                  width: 120,
                  minWidth: 120,
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
                  minWidth: 120,
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
                  width: 144,
                  minWidth: 144,
                  bgcolor: 'grey.100',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary',
                  p: 2,
                }}
              >
                진행률
              </TableCell>
              <TableCell
                sx={{
                  width: 86,
                  minWidth: 86,
                  bgcolor: 'grey.100',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary',
                  p: 2,
                  textAlign: 'center',
                }}
              >
                상태
              </TableCell>
              <TableCell
                sx={{
                  width: 80,
                  minWidth: 80,
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
                  minWidth: 80,
                  bgcolor: 'grey.100',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary',
                  p: 2,
                  textAlign: 'center',
                }}
              >
                게시
              </TableCell>
              <TableCell
                sx={{
                  width: 80,
                  minWidth: 80,
                  bgcolor: 'grey.100',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'text.secondary',
                  p: 2,
                  textAlign: 'center',
                }}
              >
                복사
              </TableCell>
              <TableCell
                sx={{
                  width: 60,
                  minWidth: 60,
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
                <TableCell
                  sx={{
                    width: 44,
                    minWidth: 44,
                    p: 1,
                  }}
                >
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={() => onSelectRow(row.id)}
                    size="small"
                  />
                </TableCell>
                <TableCell
                  sx={{
                    width: 68,
                    minWidth: 68,
                    fontSize: 14,
                    p: 2,
                  }}
                >
                  {row.sequence}
                </TableCell>
                <TableCell
                  sx={{
                    width: 120,
                    minWidth: 120,
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
                    minWidth: 160,
                    fontSize: 14,
                    p: 2,
                  }}
                >
                  {row.organizationName}
                </TableCell>
                <TableCell
                  sx={{
                    width: 200,
                    minWidth: 200,
                    fontSize: 14,
                    p: 2,
                  }}
                >
                  {row.documentName}
                </TableCell>
                <TableCell
                  sx={{
                    width: 120,
                    minWidth: 120,
                    fontSize: 14,
                    p: 2,
                  }}
                >
                  {row.writtenAt}
                </TableCell>
                <TableCell
                  sx={{
                    width: 120,
                    minWidth: 120,
                    fontSize: 14,
                    p: 2,
                  }}
                >
                  {row.approvalDeadline}
                </TableCell>
                <TableCell
                  sx={{
                    width: 144,
                    minWidth: 144,
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleOpenProgressModal(row)}
                >
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
                <TableCell sx={{ width: 86, minWidth: 86, p: 2, textAlign: 'center' }}>
                  <Badge
                    label={getStatusLabel(row.status)}
                    variant={getStatusVariant(row.status)}
                  />
                </TableCell>
                <TableCell sx={{ width: 80, minWidth: 80, p: 1, textAlign: 'center' }}>
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
                <TableCell sx={{ width: 80, minWidth: 80, p: 1, textAlign: 'center' }}>
                  <Tooltip title="게시하기">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenPublishModal(row)}
                      disabled={row.status === 'completed'}
                      sx={{
                        color: row.published ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        '&:disabled': {
                          color: 'text.disabled',
                        },
                      }}
                    >
                      <Iconify icon={'solar:share-bold' as any} width={20} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ width: 80, minWidth: 80, p: 1, textAlign: 'center' }}>
                  <Tooltip title="복사">
                    <IconButton
                      size="small"
                      onClick={() => onCopy?.(row.id)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Iconify icon="solar:copy-bold" width={20} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ width: 60, minWidth: 60, p: 2 }}>
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
                    {onEdit && (
                      <MenuItem
                        onClick={() => handleMenuItemClick('edit', row.id)}
                        disabled={row.status === 'completed'}
                        sx={{ px: 2 }}
                      >
                        수정
                      </MenuItem>
                    )}
                    {onDelete && (
                      <MenuItem
                        onClick={() => handleMenuItemClick('delete', row.id)}
                        disabled={row.status === 'completed'}
                        sx={{ color: 'error.main', px: 2 }}
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

      {selectedProgressRow && (
        <ProgressModal
          open={progressModalOpen}
          onClose={handleCloseProgressModal}
          documentName={selectedProgressRow.documentName}
          writtenAt={selectedProgressRow.writtenAt}
          approvalDeadline={selectedProgressRow.approvalDeadline}
          documentId={selectedProgressRow.id}
        />
      )}

      {selectedPublishRow && (
        <PublishModal
          open={publishModalOpen}
          onClose={handleClosePublishModal}
          onConfirm={handleConfirmPublish}
          documentName={selectedPublishRow.documentName}
          documentId={selectedPublishRow.id}
        />
      )}
    </>
  );
}
