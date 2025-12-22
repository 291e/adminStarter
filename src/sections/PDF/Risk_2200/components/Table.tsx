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
import type { SafetySystemDocument } from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

// UI 표시를 위한 확장 타입 (SafetySystemDocument 기반)
export type Risk_2200Row = SafetySystemDocument & {
  id: string; // safetySystemDocumentIdx를 문자열로 변환
  sequence: number; // 순번
  registeredAt: string; // 등록일 (createAt에서 파싱)
  registeredTime: string; // 등록 시간 (createAt에서 파싱)
  writtenAt: string; // 작성일 (updateAt에서 파싱)
  published: boolean; // 게시 여부 (isPublished === 1)
};

type Props = {
  rows: Risk_2200Row[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownloadPDF?: (id: string, safetySystemItemIdx?: number) => void;
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

  const handlePublishSuccess = () => {
    // 게시 성공 후 목록 새로고침을 위해 onTogglePublish 호출 (선택적)
    if (selectedPublishRow && onTogglePublish) {
      onTogglePublish(selectedPublishRow.id, true);
    }
  };

  const getStatusLabel = (status: SafetySystemDocument['status']) => {
    switch (status) {
      case 'COMPLETED':
        return '완료';
      case 'DRAFT':
        return '결재 진행중';
      case 'IN_PROGRESS':
        return '결재 대기중';
      case 'PENDING':
        return '임시 저장';
      default:
        return status || '';
    }
  };

  const getStatusVariant = (
    status: SafetySystemDocument['status']
  ): 'default' | 'info' | 'warning' | 'error' | 'success' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'default';
      default:
        return 'default';
    }
  };

  // 완료되지 않은 문서만 필터링하여 전체 선택 상태 계산
  const nonCompletedRows = rows.filter((row) => row.status !== 'COMPLETED');
  const selectedNonCompletedIds = selectedIds.filter((id) => {
    const row = rows.find((r) => r.id === id);
    return row && row.status !== 'COMPLETED';
  });
  const isAllSelected =
    nonCompletedRows.length > 0 && selectedNonCompletedIds.length === nonCompletedRows.length;
  const isIndeterminate =
    selectedNonCompletedIds.length > 0 && selectedNonCompletedIds.length < nonCompletedRows.length;

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
                  onChange={(e) => {
                    // 완료되지 않은 문서만 선택/해제
                    const nonCompletedIds = rows
                      .filter((row) => row.status !== 'COMPLETED')
                      .map((row) => row.id);
                    if (e.target.checked) {
                      // 완료되지 않은 문서만 선택
                      nonCompletedIds.forEach((id) => {
                        if (!selectedIds.includes(id)) {
                          onSelectRow(id);
                        }
                      });
                    } else {
                      // 완료되지 않은 문서만 해제
                      nonCompletedIds.forEach((id) => {
                        if (selectedIds.includes(id)) {
                          onSelectRow(id);
                        }
                      });
                    }
                  }}
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
                align="center"
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
                    disabled={row.status === 'COMPLETED'}
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
                  align="center"
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
                      {row.approvalProgress ? `${row.approvalProgress}%` : '0%'}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={typeof row.approvalProgress === 'number' ? row.approvalProgress : 0}
                      color={row.approvalProgress === 100 ? 'success' : 'warning'}
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
                      {typeof row.approvalProgress === 'number' ? row.approvalProgress : 0} / 100
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: 100, minWidth: 100, p: 2, textAlign: 'center' }}>
                  <Badge
                    label={getStatusLabel(row.status)}
                    variant={getStatusVariant(row.status)}
                  />
                </TableCell>
                <TableCell sx={{ width: 80, minWidth: 80, p: 1, textAlign: 'center' }}>
                  <Tooltip title="PDF 다운로드">
                    <IconButton
                      size="small"
                      onClick={() => onDownloadPDF?.(row.id, row.safetySystemItemIdx)}
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
                      sx={{
                        color: row.published ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      <Iconify icon={'heroicons:user-group-solid' as any} width={20} />
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
                        disabled={row.status === 'COMPLETED'}
                        sx={{ px: 2 }}
                      >
                        수정
                      </MenuItem>
                    )}
                    {onDelete && (
                      <MenuItem
                        onClick={() => handleMenuItemClick('delete', row.id)}
                        disabled={row.status === 'COMPLETED'}
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
          signatureList={selectedProgressRow.signatureList}
        />
      )}

      {selectedPublishRow && (
        <PublishModal
          open={publishModalOpen}
          onClose={handleClosePublishModal}
          onConfirm={handlePublishSuccess}
          documentName={selectedPublishRow.documentName}
          documentId={selectedPublishRow.id}
          writtenAt={selectedPublishRow.writtenAt}
        />
      )}
    </>
  );
}
