import { useState, useEffect, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { usePrioritySettings, useDeletePrioritySetting } from '../../hooks/use-dashboard-api';
import type { PrioritySetting } from 'src/services/dashboard/dashboard.types';
import { COLOR_OPTIONS, COLOR_VALUES } from '../constants/colors';

// ----------------------------------------------------------------------

export type PriorityItem = {
  id: string;
  color: string; // 색상 값 (예: 'red', 'yellow', 'blue', 'green', 'purple')
  labelType: string; // 자유 문자열 (예: "긴급", "중요", "참고" 등)
  isActive: boolean; // 활성화 여부
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (priorities: PriorityItem[]) => void;
  initialPriorities?: PriorityItem[];
};

// COLOR_VALUES를 export하여 다른 컴포넌트에서도 사용 가능하도록 함
export { COLOR_VALUES };

export default function PrioritySettingsModal({
  open,
  onClose,
  onSave,
  initialPriorities = [],
}: Props) {
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 중요도 설정 목록 조회
  const { data: prioritySettingsData, isLoading: prioritySettingsLoading } = usePrioritySettings();

  // 중요도 설정 삭제 Mutation
  const deletePrioritySettingMutation = useDeletePrioritySetting();

  // PrioritySetting을 PriorityItem으로 변환
  const convertPrioritySettingToItem = (setting: PrioritySetting, index?: number): PriorityItem => {
    // color 값이 hex 코드인 경우 색상 이름으로 변환
    // API에서 받은 색상 값과 COLOR_VALUES를 비교하여 매칭
    const settingColorLower = setting.color.toLowerCase();

    // 정확한 매칭 시도
    let colorName = Object.keys(COLOR_VALUES).find(
      (key) => COLOR_VALUES[key].toLowerCase() === settingColorLower
    );

    // 정확한 매칭이 없으면 유사한 색상 찾기 (헥스 코드 비교)
    if (!colorName) {
      // API에서 사용하는 색상 값들
      const apiColorMap: Record<string, string> = {
        '#b71d18': 'red', // 빨강
        '#b76e00': 'yellow', // 노랑/주황
        '#1d7bf5': 'blue', // 파랑
        '#007867': 'green', // 초록
        '#9c27b0': 'purple', // 보라
      };
      colorName = apiColorMap[settingColorLower] || 'red';
    }

    // priorityIdx를 id로 사용 (문자열로 변환)
    const id = String(setting.priorityIdx);

    return {
      id, // priorityIdx를 문자열로 변환하여 사용
      color: colorName,
      labelType: setting.labelType || '', // 자유 문자열
      isActive: setting.isActive === 1,
    };
  };

  // API 데이터를 PriorityItem 배열로 변환
  const apiPriorities = useMemo((): PriorityItem[] => {
    if (!prioritySettingsData) return [];

    // axios 인터셉터에서 평탄화: response.data = { prioritySettingList: [...], header: {...} }
    // 실제 API 응답: body.data.prioritySettingList
    // 인터셉터 평탄화 후: data.prioritySettingList 또는 data.data.prioritySettingList
    const data = prioritySettingsData as any;

    let priorityList: PrioritySetting[] = [];

    // 여러 가능한 경로 확인
    if (data?.prioritySettingList && Array.isArray(data.prioritySettingList)) {
      priorityList = data.prioritySettingList;
    } else if (data?.data?.prioritySettingList && Array.isArray(data.data.prioritySettingList)) {
      priorityList = data.data.prioritySettingList;
    } else if (
      data?.body?.data?.prioritySettingList &&
      Array.isArray(data.body.data.prioritySettingList)
    ) {
      priorityList = data.body.data.prioritySettingList;
    }

    if (!data?.header?.isSuccess || priorityList.length === 0) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ PrioritySettings: Invalid response structure', data);
      }
      return [];
    }

    return priorityList
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((setting, index) => convertPrioritySettingToItem(setting, index));
  }, [prioritySettingsData]);

  useEffect(() => {
    if (open) {
      // initialPriorities가 있으면 우선 사용, 없으면 API 데이터 사용, 그것도 없으면 기본값
      if (initialPriorities.length > 0) {
        setPriorities(initialPriorities);
      } else if (apiPriorities.length > 0) {
        setPriorities(apiPriorities);
      } else if (!prioritySettingsLoading) {
        // 로딩이 완료되었는데 데이터가 없으면 기본값
        setPriorities([
          { id: '1', color: 'red', labelType: '긴급', isActive: true },
          { id: '2', color: 'yellow', labelType: '중요', isActive: true },
          { id: '3', color: 'blue', labelType: '참고', isActive: true },
        ]);
      }
    } else {
      // 모달이 닫히면 초기 상태로 리셋
      setPriorities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, apiPriorities, prioritySettingsLoading]);

  const handleAddItem = () => {
    // UUID 형식으로 ID 생성 (crypto.randomUUID 사용)
    const newId = crypto.randomUUID();
    setPriorities([
      ...priorities,
      {
        id: newId,
        color: 'red',
        labelType: '',
        isActive: true,
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof PriorityItem, value: unknown) => {
    // id가 빈 문자열이면 업데이트하지 않음
    if (!id || id.trim() === '') {
      console.warn('⚠️ PrioritySettingsModal: Cannot update item with empty id');
      return;
    }

    setPriorities((prevPriorities) => {
      const updated = prevPriorities.map((item, index) => {
        // id를 직접 비교 (빈 문자열이 아닌 경우에만)
        const itemId = item.id && item.id.trim() !== '' ? item.id : `temp-${index}`;
        const targetId = id && id.trim() !== '' ? id : `temp-${index}`;

        if (itemId === targetId) {
          const updatedItem = { ...item, [field]: value };

          return updatedItem;
        }
        return item;
      });

      return updated;
    });
  };

  const handleDeleteItem = async (id: string) => {
    // 중요도 삭제 확인
    if (!window.confirm('이 중요도 설정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 중요도 삭제 API 호출
      await deletePrioritySettingMutation.mutateAsync({
        priorityIdx: Number(id),
      });

      // 로컬 상태에서도 제거
      setPriorities(priorities.filter((item) => item.id !== id));

      if (import.meta.env.DEV) {
        console.log('✅ 중요도 설정 삭제 완료:', id);
      }
    } catch (error) {
      console.error('❌ 중요도 설정 삭제 실패:', error);
      alert('중요도 설정 삭제에 실패했습니다.');
    }
  };

  const handleSave = () => {
    // 확인 모달 열기
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    // 확인 모달 닫기
    setConfirmModalOpen(false);
    // 저장 로직은 view.tsx의 handleSavePrioritySettings에서 처리
    // 모달에서는 데이터만 전달
    onSave(priorities);
    handleClose();
  };

  const handleClose = () => {
    // 모달이 닫힐 때는 상태를 초기화하지 않고 그대로 유지
    // (취소 버튼을 눌렀을 때 변경사항을 되돌리기 위해)
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          중요도 상태값 설정
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
        <Stack spacing={2} sx={{ mt: 1, pb: 3 }}>
          {priorities.map((priority, index) => {
            // key가 빈 문자열이거나 중복될 수 있으므로 안전하게 처리
            const safeKey = priority.id || `priority-${index}`;
            return (
              <Box
                key={safeKey}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1.5,
                    px: 2,
                    py: 1,
                  }}
                >
                  <FormControl
                    size="small"
                    sx={{ width: 120, bgcolor: 'background.paper', borderRadius: 1.5 }}
                  >
                    <Select
                      value={priority.color}
                      onChange={(e) => handleUpdateItem(priority.id, 'color', e.target.value)}
                      renderValue={(selected) => {
                        const option = COLOR_OPTIONS.find((opt) => opt.value === selected);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: COLOR_VALUES[selected] || selected,
                                border: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              component="span"
                              sx={{
                                fontSize: 15,
                                lineHeight: '24px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {option?.label || selected}
                            </Typography>
                          </Box>
                        );
                      }}
                      sx={{
                        fontSize: 15,
                        lineHeight: '24px',
                        '& .MuiSelect-select': {
                          py: 1,
                        },
                      }}
                    >
                      {COLOR_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: COLOR_VALUES[option.value],
                                border: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                              }}
                            />
                            <Typography component="span" sx={{ fontSize: 15, lineHeight: '24px' }}>
                              {option.label}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    placeholder="라벨 타입 입력 (예: 긴급, 중요, 참고)"
                    value={priority.labelType}
                    onChange={(e) => handleUpdateItem(priority.id, 'labelType', e.target.value)}
                    disabled={!priority.color}
                    sx={{
                      width: 120,
                      bgcolor: 'background.paper',
                      borderRadius: 1.5,
                      '& .MuiInputBase-input': {
                        fontSize: 15,
                        lineHeight: '24px',
                        py: 1,
                      },
                    }}
                  />
                </Box>
                <Switch
                  checked={priority.isActive}
                  onChange={(e) => handleUpdateItem(priority.id, 'isActive', e.target.checked)}
                  size="medium"
                />

                <IconButton
                  size="small"
                  onClick={() => handleDeleteItem(priority.id)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                </IconButton>
              </Box>
            );
          })}

          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <DialogBtn
              variant="outlined"
              startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
              onClick={handleAddItem}
            >
              항목추가
            </DialogBtn>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <DialogBtn variant="outlined" onClick={handleClose}>
          취소
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleSave}>
          저장
        </DialogBtn>
      </DialogActions>

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
                sx={{ color: 'error.main' }}
              />
            </Box>

            {/* 메시지 */}
            <Stack alignItems="center">
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                중요도 설정 변경 시
              </Typography>
              <Typography sx={{ fontWeight: 700, textAlign: 'center', mt: 1 }}>
                기존 문서의 중요도 표시가 달라질 수 있습니다.
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
    </Dialog>
  );
}
