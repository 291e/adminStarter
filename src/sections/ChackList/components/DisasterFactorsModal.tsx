import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import type { Checklist, DisasterFactorItem } from 'src/services/checklist/checklist.types';
import {
  useDisasterFactors,
  useCreateDisasterFactor,
  useUpdateDisasterFactor,
  useDeleteDisasterFactor,
} from '../hooks/use-checklist-api';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (factors: DisasterFactorItem[], isActive: boolean) => void;
  checklist?: Checklist | null;
};

export default function DisasterFactorsModal({ open, onClose, onSave, checklist }: Props) {
  const [factors, setFactors] = useState<DisasterFactorItem[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [newFactorName, setNewFactorName] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteTargetIdx, setDeleteTargetIdx] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // API에서 재해유발요인 목록 가져오기
  const disasterFactorsQuery = useDisasterFactors({
    checklistIdx: checklist?.checklistIdx || 0,
  });

  // Mutation hooks
  const createDisasterFactorMutation = useCreateDisasterFactor();
  const updateDisasterFactorMutation = useUpdateDisasterFactor(checklist?.checklistIdx);
  const deleteDisasterFactorMutation = useDeleteDisasterFactor(checklist?.checklistIdx);

  // 초기 데이터로 재해유발요인 목록 채우기
  useEffect(() => {
    if (open && checklist?.checklistIdx) {
      if (disasterFactorsQuery.data?.disasterFactorList) {
        const list = disasterFactorsQuery.data.disasterFactorList;
        // string[]인 경우 처리
        if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') {
          const mappedFactors = (list as string[]).map((name, idx) => ({
            id: `factor-${idx + 1}`,
            disasterFactorIdx: undefined,
            factorName: name,
            name,
            order: idx + 1,
            isActive: true,
          }));
          setFactors(mappedFactors);
        } else {
          // DisasterFactorItem[]인 경우
          const mappedFactors = (list as DisasterFactorItem[]).map((item, idx) => ({
            id: item.disasterFactorIdx?.toString() || `factor-${idx + 1}`,
            disasterFactorIdx: item.disasterFactorIdx,
            factorName: item.factorName || item.name || '',
            name: item.factorName || item.name || '',
            order: item.order || idx + 1,
            isActive: typeof item.isActive === 'boolean' ? item.isActive : item.isActive === 1,
          }));
          setFactors(mappedFactors);
        }
      }
      setIsActive(
        checklist.status?.toUpperCase() === 'ACTIVE' || checklist.status === 'active' || true
      );
    }
  }, [open, checklist, disasterFactorsQuery.data]);

  const handleToggleActive = async (factor: DisasterFactorItem) => {
    const newIsActive =
      typeof factor.isActive === 'boolean' ? !factor.isActive : factor.isActive !== 1;

    // disasterFactorIdx가 있으면 API로 개별 수정
    if (factor.disasterFactorIdx) {
      updateDisasterFactorMutation.mutate({
        disasterFactorIdx: factor.disasterFactorIdx,
        isActive: newIsActive ? 1 : 0,
      });
    }

    // 로컬 상태 업데이트
    setFactors((prev) =>
      prev.map((f) => (f.id === factor.id ? { ...f, isActive: newIsActive } : f))
    );
  };

  const handleStartEdit = (factor: DisasterFactorItem) => {
    setEditingId(factor.id || '');
    setEditValue(factor.name || factor.factorName || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (factor: DisasterFactorItem) => {
    if (!editValue.trim()) {
      handleCancelEdit();
      return;
    }

    // disasterFactorIdx가 있으면 API로 개별 수정
    if (factor.disasterFactorIdx) {
      updateDisasterFactorMutation.mutate({
        disasterFactorIdx: factor.disasterFactorIdx,
        factorName: editValue.trim(),
      });
    }

    // 로컬 상태 업데이트
    setFactors((prev) =>
      prev.map((f) =>
        f.id === factor.id
          ? {
              ...f,
              factorName: editValue.trim(),
              name: editValue.trim(),
            }
          : f
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, factor: DisasterFactorItem) => {
    if (e.key === 'Enter') {
      handleSaveEdit(factor);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleShowAddField = () => {
    setNewFactorName('');
  };

  const handleAddFactor = async () => {
    if (!newFactorName || !newFactorName.trim() || !checklist?.checklistIdx) {
      return;
    }

    // API로 개별 생성
    createDisasterFactorMutation.mutate(
      {
        checklistIdx: checklist.checklistIdx,
        factorName: newFactorName.trim(),
        isActive: 1,
      },
      {
        onSuccess: (response) => {
          // 응답에서 새로 생성된 항목 정보로 로컬 상태 업데이트
          const newFactor: DisasterFactorItem = {
            id: response.disasterFactorIdx.toString(),
            disasterFactorIdx: response.disasterFactorIdx,
            factorName: response.factorName,
            name: response.factorName,
            order: factors.length + 1,
            isActive: response.isActive === 1,
          };
          setFactors((prev) => [...prev, newFactor]);
          setNewFactorName(null);
        },
      }
    );
  };

  const handleDeleteClick = (factor: DisasterFactorItem) => {
    if (factor.disasterFactorIdx) {
      setDeleteTargetIdx(factor.disasterFactorIdx);
      setDeleteConfirmOpen(true);
    } else {
      // 아직 저장되지 않은 항목은 로컬에서만 삭제
      setFactors((prev) => prev.filter((f) => f.id !== factor.id));
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIdx) {
      deleteDisasterFactorMutation.mutate(
        { disasterFactorIdx: deleteTargetIdx },
        {
          onSuccess: () => {
            setFactors((prev) => prev.filter((f) => f.disasterFactorIdx !== deleteTargetIdx));
            setDeleteTargetIdx(null);
            setDeleteConfirmOpen(false);
          },
        }
      );
    }
  };

  const handleSave = () => {
    // 확인 모달 열기
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    // onSave 콜백이 있으면 호출 (레거시 지원)
    if (onSave) {
      onSave(factors, isActive);
    }
    setConfirmModalOpen(false);
    handleClose();
  };

  const handleClose = () => {
    setFactors([]);
    setIsActive(true);
    setEditingId(null);
    setEditValue('');
    setNewFactorName(null);
    setConfirmModalOpen(false);
    setDeleteConfirmOpen(false);
    setDeleteTargetIdx(null);
    onClose();
  };

  const isLoading = disasterFactorsQuery.isLoading;
  const error = disasterFactorsQuery.error;
  const isMutating =
    createDisasterFactorMutation.isPending ||
    updateDisasterFactorMutation.isPending ||
    deleteDisasterFactorMutation.isPending;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: 600,
          },
        }}
      >
        <DialogTitle>
          <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
            재해유발요인
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Iconify icon="solar:close-circle-bold" width={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              재해유발요인 목록을 불러오는데 실패했습니다. 다시 시도해주세요.
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3} sx={{ mt: 1, pb: 3 }}>
              {/* 고위험작업/상황 정보 */}
              {checklist && (
                <Box
                  sx={{
                    bgcolor: 'grey.200',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Typography variant="subtitle2">고위험작업/상황</Typography>
                  <Typography variant="body2">{checklist.highRiskWork}</Typography>
                </Box>
              )}

              {/* 재해유발요인 테이블 */}
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  bgcolor: 'transparent',
                  px: 4,
                  border: 'none',
                }}
              >
                <Table
                  size="small"
                  sx={{ tableLayout: 'fixed', borderTopRightRadius: 1, borderTopLeftRadius: 1 }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ bgcolor: 'grey.100', width: 60, minWidth: 60 }}
                        align="center"
                      >
                        순번
                      </TableCell>
                      <TableCell sx={{ bgcolor: 'grey.100' }}>재해유발요인</TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: 'grey.100', width: 100, minWidth: 100 }}
                      >
                        편집
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: 'grey.100', width: 60, minWidth: 60 }}
                      >
                        &nbsp;
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {factors.map((factor, idx) => (
                      <TableRow key={factor.id} hover>
                        <TableCell>
                          <Typography variant="body2">{idx + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          {editingId === factor.id ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, factor)}
                              autoFocus
                              InputProps={{
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={handleCancelEdit}
                                    sx={{ p: 0.5 }}
                                  >
                                    <Iconify icon="solar:close-circle-bold" width={16} />
                                  </IconButton>
                                ),
                              }}
                            />
                          ) : (
                            <Typography variant="body2">
                              {factor.name || factor.factorName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {editingId === factor.id ? (
                              <IconButton
                                size="small"
                                onClick={() => handleSaveEdit(factor)}
                                disabled={isMutating}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <Iconify icon="solar:check-circle-bold" width={20} />
                              </IconButton>
                            ) : (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleStartEdit(factor)}
                                  disabled={isMutating}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                    },
                                  }}
                                >
                                  <Iconify icon="solar:pen-bold" width={20} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(factor)}
                                  disabled={isMutating}
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                      bgcolor: 'error.lighter',
                                    },
                                  }}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                </IconButton>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={
                              typeof factor.isActive === 'boolean'
                                ? factor.isActive
                                : factor.isActive === 1
                            }
                            onChange={() => handleToggleActive(factor)}
                            disabled={isMutating}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {newFactorName !== null && (
                      <TableRow>
                        <TableCell align="center">
                          <Typography variant="body2">{factors.length + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="재해유발요인을 입력하세요"
                            value={newFactorName || ''}
                            onChange={(e) => setNewFactorName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddFactor();
                              }
                            }}
                            autoFocus
                            disabled={createDisasterFactorMutation.isPending}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setNewFactorName(null);
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  <Iconify icon="solar:close-circle-bold" width={16} />
                                </IconButton>
                              ),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={handleAddFactor}
                            disabled={createDisasterFactorMutation.isPending}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            {createDisasterFactorMutation.isPending ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Iconify icon="solar:check-circle-bold" width={20} />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell align="center">
                          <Switch checked disabled color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 항목추가 버튼 */}
              {newFactorName === null && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
                    onClick={handleShowAddField}
                    disabled={isMutating}
                    sx={{ minWidth: 100 }}
                  >
                    항목추가
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label="활성"
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={isLoading || isMutating}
            sx={{ minWidth: 64 }}
          >
            닫기
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading || isMutating}
            sx={{ minWidth: 64 }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 저장 확인 모달 */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Stack spacing={2} alignItems="center" sx={{ pt: 2 }}>
            {/* 경고 아이콘 */}
            <Box
              sx={{
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon={'solar:danger-circle-bold' as any}
                width={64}
                sx={{ color: 'error.main' }}
              />
            </Box>

            {/* 메시지 */}
            <Stack alignItems="center">
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                체크리스트 항목을 변경하면 해당 업종의
              </Typography>
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                모든 위험요인 파악 및 문서 작성 결과에 영향을 줍니다.
              </Typography>
              <Typography sx={{ fontWeight: 700, textAlign: 'center', mt: 1 }}>
                변경 내용을 저장하시겠습니까?
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmModalOpen(false)}
            sx={{ minWidth: 64 }}
          >
            취소
          </Button>
          <Button variant="contained" onClick={handleConfirmSave} sx={{ minWidth: 64 }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Stack spacing={2} alignItems="center" sx={{ pt: 2 }}>
            <Box
              sx={{
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon={'solar:trash-bin-trash-bold' as any}
                width={64}
                sx={{ color: 'error.main' }}
              />
            </Box>

            <Stack alignItems="center">
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                이 재해유발요인을 삭제하시겠습니까?
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', mt: 1 }}
              >
                삭제된 항목은 복구할 수 없습니다.
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteDisasterFactorMutation.isPending}
            sx={{ minWidth: 64 }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteDisasterFactorMutation.isPending}
            sx={{ minWidth: 64 }}
          >
            {deleteDisasterFactorMutation.isPending ? <CircularProgress size={20} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
