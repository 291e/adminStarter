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
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
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
  writtenAt?: string; // 작성일 (YYYY-MM-DD 형식)
};

export default function PublishModal({
  open,
  onClose,
  onConfirm,
  documentName: initialDocumentName,
  documentId,
  writtenAt,
}: Props) {
  const queryClient = useQueryClient();
  const [documentName, setDocumentName] = useState(initialDocumentName || '');
  const [priorityIdx, setPriorityIdx] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(false); // 기본값: 비공개

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

  // 문서명에 작성일 추가
  const getDocumentNameWithDate = (name: string): string => {
    if (!name) return '';
    if (!writtenAt) return name;

    // 이미 날짜가 포함되어 있는지 확인
    const datePattern = /_\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(name)) {
      return name;
    }

    // 작성일을 문서명 뒤에 추가
    return `${name}_${writtenAt}`;
  };

  const handleDocumentNameChange = (value: string) => {
    // 사용자가 입력하는 동안은 그대로 저장 (날짜 자동 추가 안 함)
    setDocumentName(value);
  };

  const handleDocumentNameBlur = () => {
    // 입력이 끝났을 때 날짜가 없으면 자동으로 추가
    const datePattern = /_\d{4}-\d{2}-\d{2}$/;
    if (documentName && !datePattern.test(documentName) && writtenAt) {
      const finalName = `${documentName}_${writtenAt}`;
      setDocumentName(finalName);
    }
  };

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
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] }); // 공유 문서함 새로고침
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

    // 문서명에 작성일이 없으면 추가
    const finalDocumentName = getDocumentNameWithDate(documentName);

    publishMutation.mutate({
      safetySystemDocumentIdx: Number(documentId),
      priorityIdx: Number(priorityIdx),
      isPublished: isPublic ? 1 : 0,
      documentName: finalDocumentName || undefined,
    });
  };

  const handleClose = () => {
    setDocumentName(initialDocumentName || '');
    setPriorityIdx('');
    setIsPublic(false);
    onClose();
  };

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (open) {
      const nameWithDate = getDocumentNameWithDate(initialDocumentName || '');
      setDocumentName(nameWithDate);
      setPriorityIdx('');
      setIsPublic(false);
    }
  }, [open, initialDocumentName, writtenAt]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          문서 공유
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
          {/* 문서명 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: 14 }}>
              문서명
            </Typography>
            <TextField
              fullWidth
              placeholder="문서명을 입력해주세요."
              value={documentName}
              onChange={(e) => handleDocumentNameChange(e.target.value)}
              onBlur={handleDocumentNameBlur}
              helperText={
                writtenAt
                  ? '입력 후 포커스를 벗어나면 자동으로 날짜가 추가됩니다 (예: 문서1_2025-11-12)'
                  : '문서명을 입력해주세요'
              }
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: 15,
                  lineHeight: '24px',
                },
              }}
            />
          </Box>

          {/* 중요도 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: 14 }}>
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
                    '& .MuiSelect-select': {
                      py: 2,
                    },
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
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: 14 }}>
              공개 여부
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                size="medium"
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                {isPublic ? '공개' : '비공개'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <DialogBtn
          variant="outlined"
          onClick={handleClose}
          disabled={publishMutation.isPending}
          sx={{ fontSize: 15 }}
        >
          닫기
        </DialogBtn>
        <DialogBtn
          variant="contained"
          onClick={handleConfirm}
          disabled={publishMutation.isPending || priorityIdx === ''}
          sx={{ fontSize: 15 }}
        >
          {publishMutation.isPending ? '게시 중...' : '게시'}
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
