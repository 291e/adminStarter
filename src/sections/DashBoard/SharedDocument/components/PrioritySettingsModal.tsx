import { useState, useEffect } from 'react';

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

// ----------------------------------------------------------------------

export type PriorityItem = {
  id: string;
  color: string; // 색상 값 (예: 'red', 'yellow', 'blue', 'green', 'purple')
  labelType: 'urgent' | 'important' | 'normal' | 'reference' | 'custom'; // 라벨 타입
  customLabel: string; // 직접 작성일 때 입력하는 텍스트
  isActive: boolean; // 활성화 여부
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (priorities: PriorityItem[]) => void;
  initialPriorities?: PriorityItem[];
};

const COLOR_OPTIONS = [
  { value: 'red', label: '빨강' },
  { value: 'yellow', label: '노랑' },
  { value: 'blue', label: '파랑' },
  { value: 'green', label: '초록' },
  { value: 'purple', label: '보라' },
];

const COLOR_VALUES: Record<string, string> = {
  red: '#FF5630',
  yellow: '#FFAB00',
  blue: '#1D7BF5',
  green: '#00A76F',
  purple: '#7635DC',
};

const LABEL_TYPE_OPTIONS = [
  { value: 'urgent', label: '긴급' },
  { value: 'important', label: '중요' },
  { value: 'normal', label: '보통' },
  { value: 'reference', label: '참고' },
  { value: 'custom', label: '직접 작성' },
];

export default function PrioritySettingsModal({
  open,
  onClose,
  onSave,
  initialPriorities = [],
}: Props) {
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);

  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 중요도 설정 목록 가져오기
      // const { data: prioritySettings } = useQuery({
      //   queryKey: ['prioritySettings'],
      //   queryFn: () => fetchPrioritySettings(),
      // });
      // setPriorities(prioritySettings || initialPriorities);

      // initialPriorities가 있으면 사용, 없으면 기본값
      if (initialPriorities.length > 0) {
        setPriorities(initialPriorities);
      } else {
        setPriorities([
          { id: '1', color: 'red', labelType: 'urgent', customLabel: '', isActive: true },
          { id: '2', color: 'yellow', labelType: 'important', customLabel: '', isActive: true },
          { id: '3', color: 'blue', labelType: 'reference', customLabel: '', isActive: true },
        ]);
      }
    } else {
      // 모달이 닫히면 초기 상태로 리셋
      setPriorities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAddItem = () => {
    const newId = `priority-${Date.now()}`;
    setPriorities([
      ...priorities,
      {
        id: newId,
        color: 'red',
        labelType: 'urgent',
        customLabel: '',
        isActive: true,
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof PriorityItem, value: unknown) => {
    setPriorities(
      priorities.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // labelType이 'custom'이 아닌 다른 값으로 변경되면 customLabel 초기화
          if (field === 'labelType' && value !== 'custom') {
            updated.customLabel = '';
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    // TODO: TanStack Query Hook(useQuery)으로 해당 중요도를 사용하는 문서 목록 확인
    // const { data: documentsUsingPriority } = useQuery({
    //   queryKey: ['documentsUsingPriority', id],
    //   queryFn: () => fetchDocumentsUsingPriority(id),
    // });
    // if (documentsUsingPriority && documentsUsingPriority.length > 0) {
    //   // TODO: TanStack Query Hook(useMutation)으로 해당 문서들의 중요도를 NULL로 업데이트
    //   // const updateMutation = useMutation({
    //   //   mutationFn: () => updateDocumentsPriorityToNull(documentsUsingPriority.map(doc => doc.id)),
    //   //   onSuccess: () => {
    //   //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //   //   },
    //   // });
    //   // updateMutation.mutate();
    // }

    // TODO: TanStack Query Hook(useMutation)으로 중요도 삭제
    // const deleteMutation = useMutation({
    //   mutationFn: () => deletePriority(id),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['prioritySettings'] });
    //   },
    // });
    // deleteMutation.mutate();

    setPriorities(priorities.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 중요도 설정 저장
    // const saveMutation = useMutation({
    //   mutationFn: () => savePrioritySettings(priorities),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['prioritySettings'] });
    //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //   },
    // });
    // saveMutation.mutate();

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
                <FormControl size="small" sx={{ width: 120, bgcolor: 'background.paper' }}>
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

                {priority.labelType === 'custom' ? (
                  <FormControl size="small" sx={{ width: 120, bgcolor: 'background.paper' }}>
                    <TextField
                      size="small"
                      placeholder="직접 입력"
                      value={priority.customLabel}
                      onChange={(e) => handleUpdateItem(priority.id, 'customLabel', e.target.value)}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: 15,
                          lineHeight: '24px',
                        },
                      }}
                    />
                  </FormControl>
                ) : (
                  <FormControl size="small" sx={{ width: 120, bgcolor: 'background.paper' }}>
                    <Select
                      value={priority.labelType}
                      onChange={(e) => handleUpdateItem(priority.id, 'labelType', e.target.value)}
                      sx={{
                        fontSize: 15,
                        lineHeight: '24px',
                        '& .MuiSelect-select': {
                          py: 1,
                        },
                      }}
                    >
                      {LABEL_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
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
    </Dialog>
  );
}
