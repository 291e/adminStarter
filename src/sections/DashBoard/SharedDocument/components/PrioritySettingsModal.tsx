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

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { usePrioritySettings, useDeletePrioritySetting } from '../../hooks/use-dashboard-api';
import type { PrioritySetting } from 'src/services/dashboard/dashboard.types';
import { COLOR_OPTIONS, COLOR_VALUES } from '../constants/colors';

import warningIcon from 'src/assets/icons/safeyoui/warning.svg';
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
  const convertPrioritySettingToItem = (setting: PrioritySetting): PriorityItem => {
    // color 값이 hex 코드인 경우 색상 이름으로 변환 (간단한 매핑)
    const colorName =
      Object.keys(COLOR_VALUES).find(
        (key) => COLOR_VALUES[key].toLowerCase() === setting.color.toLowerCase()
      ) || 'red';

    return {
      id: setting.id || setting.prioritySettingId || '', // API는 id 필드 사용
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

    // 디버깅: API 응답 구조 확인
    if (import.meta.env.DEV) {
      console.log('📋 PrioritySettings API Response:', data);
    }

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
      .map(convertPrioritySettingToItem);
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
    setPriorities(
      priorities.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = async (id: string) => {
    // 중요도 삭제 확인
    if (!window.confirm('이 중요도 설정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 중요도 삭제 API 호출
      await deletePrioritySettingMutation.mutateAsync({
        prioritySettingId: id,
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
          {priorities.map((priority) => (
            <Box
              key={priority.id}
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
          ))}

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
        <DialogContent
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          {/* 아이콘 */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0,
            }}
          >
            <img src={warningIcon} alt="warning" width={64} height={64} />
          </Box>

          {/* 텍스트 영역 */}
          <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center', width: '100%' }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: '30px',
                color: 'text.primary',
              }}
            >
              중요도 설정 변경 시
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.secondary',
              }}
            >
              기존 문서의 중요도 표시가 달라질 수 있습니다.
            </Typography>
          </Stack>

          {/* 버튼 영역 */}
          <Stack direction="row" spacing={1.5} sx={{ width: '100%', mt: 1 }}>
            <DialogBtn
              variant="outlined"
              onClick={() => setConfirmModalOpen(false)}
              sx={{ flex: 1, minHeight: 36, fontSize: 14 }}
            >
              취소
            </DialogBtn>
            <DialogBtn
              variant="contained"
              onClick={handleConfirmSave}
              sx={{
                flex: 1,
                minHeight: 36,
                fontSize: 14,
                bgcolor: 'grey.900',
                color: 'common.white',
                '&:hover': {
                  bgcolor: 'grey.800',
                },
              }}
            >
              확인
            </DialogBtn>
          </Stack>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
