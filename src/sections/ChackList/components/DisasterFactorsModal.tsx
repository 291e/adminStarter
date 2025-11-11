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

import { Iconify } from 'src/components/iconify';
import type { Checklist } from 'src/_mock/_checklist';

// ----------------------------------------------------------------------

export type DisasterFactorItem = {
  id: string;
  order: number;
  name: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (factors: DisasterFactorItem[], isActive: boolean) => void;
  checklist?: Checklist | null;
};

const DEFAULT_DISASTER_FACTORS: DisasterFactorItem[] = [
  {
    id: '1',
    order: 1,
    name: '작업 중 기계·기구에 안전장치(방호장치 등) 미설치·미흡·무효화 8대 위험요인',
    isActive: true,
  },
  {
    id: '2',
    order: 2,
    name: '정비, 수리, 교체 및 청소 등의 작업 시 설비 가동 정지 후 불시가동을 방지하기 위한 조치 미실시',
    isActive: true,
  },
  {
    id: '3',
    order: 3,
    name: '정비, 수리, 교체 및 청소 등의 작업 시 설비·기계의 운전 정지 미실시',
    isActive: true,
  },
  {
    id: '4',
    order: 4,
    name: '추락의 위험이 있는 장소에서 정비·수리 등의 작업 시 추락위험 방지조치 미실시',
    isActive: true,
  },
  {
    id: '5',
    order: 5,
    name: '중량물, 설비 하부에서 작업 시 중량물 등의 미고정 등 깔림 위험 예방조치 미흡',
    isActive: true,
  },
  {
    id: '6',
    order: 6,
    name: '밀폐공간 내 작업 시 산소결핍 또는 유해 가스에 의한 질식·중독 위험 예방조치 미실시',
    isActive: true,
  },
  {
    id: '7',
    order: 7,
    name: '가동 중인 설비 인근에서 작업 시 끼임, 부딪힘 등 위험 예방조치를 위한 충분한 공간 확보 미흡',
    isActive: true,
  },
];

export default function DisasterFactorsModal({ open, onClose, onSave, checklist }: Props) {
  const [factors, setFactors] = useState<DisasterFactorItem[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [newFactorName, setNewFactorName] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 초기 데이터로 재해유발요인 목록 채우기
  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 재해유발요인 목록 가져오기
      // const { data: factors } = useQuery({
      //   queryKey: ['disasterFactors', checklist?.id],
      //   queryFn: () => getDisasterFactors(checklist?.id),
      //   enabled: !!checklist?.id,
      // });
      // if (factors) setFactors(factors);
      // 임시 기본 데이터
      if (checklist?.disasterFactors && checklist.disasterFactors.length > 0) {
        const mappedFactors = checklist.disasterFactors.map((name, idx) => ({
          id: `factor-${idx + 1}`,
          order: idx + 1,
          name,
          isActive: true,
        }));
        setFactors(mappedFactors);
      } else {
        setFactors(DEFAULT_DISASTER_FACTORS);
      }
      setIsActive(checklist?.status === 'active' || true);
    }
  }, [open, checklist]);

  const handleToggleActive = (id: string) => {
    setFactors((prev) =>
      prev.map((factor) => (factor.id === id ? { ...factor, isActive: !factor.isActive } : factor))
    );
  };

  const handleStartEdit = (factor: DisasterFactorItem) => {
    setEditingId(factor.id);
    setEditValue(factor.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      setFactors((prev) =>
        prev.map((factor) => (factor.id === id ? { ...factor, name: editValue.trim() } : factor))
      );
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleShowAddField = () => {
    setNewFactorName('');
  };

  const handleAddFactor = () => {
    if (!newFactorName || !newFactorName.trim()) {
      return;
    }

    const newFactor: DisasterFactorItem = {
      id: `factor-${Date.now()}`,
      order: factors.length + 1,
      name: newFactorName.trim(),
      isActive: true,
    };

    setFactors((prev) => [...prev, newFactor]);
    setNewFactorName(null);
  };

  const handleSave = () => {
    // 확인 모달 열기
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 재해유발요인 목록 저장 (view.tsx의 handleSaveDisasterFactors에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveDisasterFactors에서 수행됩니다.

    onSave(factors, isActive);
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
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
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

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1, pb: 3 }}>
            {/* 고위험작업/상황 정보 */}
            {checklist && (
              <Box
                sx={{
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  고위험작업/상황
                </Typography>
                <Typography variant="body2">{checklist.highRiskWork}</Typography>
              </Box>
            )}

            {/* 재해유발요인 테이블 */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'grey.100', minWidth: 60 }}>순번</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100' }}>재해유발요인</TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
                      편집
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {factors.map((factor) => (
                    <TableRow key={factor.id} hover>
                      <TableCell>
                        <Typography variant="body2">{factor.order}</Typography>
                      </TableCell>
                      <TableCell>
                        {editingId === factor.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, factor.id)}
                            autoFocus
                            InputProps={{
                              endAdornment: (
                                <IconButton size="small" onClick={handleCancelEdit} sx={{ p: 0.5 }}>
                                  <Iconify icon="solar:close-circle-bold" width={16} />
                                </IconButton>
                              ),
                            }}
                          />
                        ) : (
                          <Typography variant="body2">{factor.name}</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {editingId === factor.id ? (
                            <IconButton
                              size="small"
                              onClick={() => handleSaveEdit(factor.id)}
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
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(factor)}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <Iconify icon="solar:pen-bold" width={20} />
                            </IconButton>
                          )}
                          <Switch
                            checked={factor.isActive}
                            onChange={() => handleToggleActive(factor.id)}
                            color="primary"
                            size="small"
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {newFactorName !== null && (
                    <TableRow>
                      <TableCell>
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
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <IconButton
                            size="small"
                            onClick={handleAddFactor}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Iconify icon="solar:check-circle-bold" width={20} />
                          </IconButton>
                          <Switch checked disabled color="primary" size="small" />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 항목추가 버튼 */}
            {!newFactorName && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
                  onClick={handleShowAddField}
                  sx={{ minWidth: 100 }}
                >
                  항목추가
                </Button>
              </Box>
            )}
          </Stack>
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
          <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
            닫기
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ minWidth: 64 }}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 확인 모달 */}
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
                sx={{ color: 'warning.main' }}
              />
            </Box>

            {/* 메시지 */}
            <Stack alignItems="center">
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                체크리스트 항목을 변경하면 해당 업종의
              </Typography>
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                모든 위험요인 파악 및 문서 작성 결과에 영향을 줄 수 있습니다.
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
    </>
  );
}
