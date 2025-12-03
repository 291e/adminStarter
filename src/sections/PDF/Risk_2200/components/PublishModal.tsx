import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { getPrioritySettingList } from 'src/services/dashboard/dashboard.service';
import { publishDocument } from 'src/services/safety-system/safety-system.service';
import type { PrioritySetting } from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

/**
 * 중요도 labelType을 한글로 변환
 */
const getPriorityLabel = (priority: PrioritySetting): string => {
  if (!priority.labelType) {
    return `중요도 ${priority.priorityIdx}`;
  }

  const labelTypeMap: Record<string, string> = {
    urgent: '긴급',
    important: '중요',
    normal: '보통',
    reference: '참고',
    custom: priority.labelType, // custom인 경우 labelType 자체를 사용 (이미 한글일 수 있음)
  };

  // labelType이 맵핑에 있으면 한글 변환, 없으면 원본 사용
  return labelTypeMap[priority.labelType.toLowerCase()] || priority.labelType;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void; // 선택적, API 성공 후 호출
  documentName?: string;
  documentId?: string; // safetySystemDocumentIdx
};

export default function PublishModal({
  open,
  onClose,
  onConfirm,
  documentName: initialDocumentName,
  documentId,
}: Props) {
  const queryClient = useQueryClient();
  const [documentName, setDocumentName] = useState(initialDocumentName || '');
  const [priorityIdx, setPriorityIdx] = useState<number | ''>('');
  const [isPublished, setIsPublished] = useState(false); // 기본값: 미게시

  // 중요도 설정 목록 조회
  const { data: prioritySettingsResponse, isLoading: isLoadingPriorities } = useQuery({
    queryKey: ['priority-settings'],
    queryFn: async () => {
      const response = await getPrioritySettingList();
      // axios 인터셉터에서 평탄화되므로 직접 접근
      return (
        (response as any).prioritySettingList ||
        (response as any).body?.data?.prioritySettingList ||
        []
      );
    },
  });

  // 활성화된 중요도 설정만 필터링
  const activePriorities: PrioritySetting[] = (prioritySettingsResponse || []).filter(
    (p: PrioritySetting) => p.isActive === 1
  );

  // 문서 게시 API Mutation
  const publishMutation = useMutation({
    mutationFn: async (params: {
      safetySystemDocumentIdx: number;
      priorityIdx: number;
      isPublished: number;
      documentName?: string;
    }) => {
      await publishDocument(params.safetySystemDocumentIdx, {
        priorityIdx: params.priorityIdx,
        isPublished: params.isPublished,
        documentName: params.documentName || undefined,
      });
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['safety-system-item'] });
      queryClient.invalidateQueries({ queryKey: ['priority-settings'] });
      onConfirm?.();
      handleClose();
    },
    onError: (error: any) => {
      console.error('문서 게시 실패:', error);
      alert(error?.response?.data?.message || '문서 게시에 실패했습니다.');
    },
  });

  const handleConfirm = () => {
    if (!documentId) {
      alert('문서 ID가 없습니다.');
      return;
    }

    if (priorityIdx === '') {
      alert('중요도를 선택해주세요.');
      return;
    }

    publishMutation.mutate({
      safetySystemDocumentIdx: Number(documentId),
      priorityIdx: Number(priorityIdx),
      isPublished: isPublished ? 1 : 0,
      documentName: documentName || undefined,
    });
  };

  const handleClose = () => {
    setDocumentName(initialDocumentName || '');
    setPriorityIdx('');
    setIsPublished(false);
    onClose();
  };

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (open) {
      setDocumentName(initialDocumentName || '');
      setPriorityIdx('');
      setIsPublished(false);
    }
  }, [open, initialDocumentName]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 600,
          lineHeight: '28px',
          color: 'text.primary',
          pb: 3,
        }}
      >
        문서 공유
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 문서명 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              문서명
            </Typography>
            <TextField
              fullWidth
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="문서명을 입력하세요"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" size="small">
                      <Iconify icon="solar:pen-bold" width={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 15,
                  lineHeight: '24px',
                },
              }}
            />
          </Box>

          {/* 중요도 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              중요도
            </Typography>
            <FormControl fullWidth>
              {isLoadingPriorities ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Select
                  value={priorityIdx}
                  onChange={(e) => setPriorityIdx(e.target.value as number | '')}
                  displayEmpty
                  sx={{
                    fontSize: 15,
                    lineHeight: '24px',
                  }}
                >
                  <MenuItem value="" disabled>
                    중요도를 선택하세요
                  </MenuItem>
                  {activePriorities.map((priority) => (
                    <MenuItem key={priority.priorityIdx} value={priority.priorityIdx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: priority.color,
                          }}
                        />
                        <Typography>{getPriorityLabel(priority)}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          </Box>

          {/* 공개 여부 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              공개 여부
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'primary.main',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.secondary',
                  }}
                >
                  {isPublished ? '게시' : '미게시'}
                </Typography>
              }
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <DialogBtn variant="outlined" onClick={handleClose} disabled={publishMutation.isPending}>
          닫기
        </DialogBtn>
        <DialogBtn
          variant="contained"
          onClick={handleConfirm}
          disabled={publishMutation.isPending || priorityIdx === ''}
        >
          {publishMutation.isPending ? '게시 중...' : '게시'}
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
