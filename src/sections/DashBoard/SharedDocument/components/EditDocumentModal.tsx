import { useState, useEffect, useRef } from 'react';

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
import type { SharedDocument as ApiSharedDocument } from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

// API 타입 직접 사용
export type SharedDocument = ApiSharedDocument;

export type EditDocumentFormData = {
  documentName: string;
  priority: string;
  file: File | null;
  isPublic: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: EditDocumentFormData) => void;
  document: SharedDocument | null;
  priorities?: Array<{
    id: string;
    label: string;
    color: string;
    labelType?: string;
  }>;
};

export default function EditDocumentModal({
  open,
  onClose,
  onSave,
  document,
  priorities = [],
}: Props) {
  const [formData, setFormData] = useState<EditDocumentFormData>({
    documentName: '',
    priority: '',
    file: null,
    isPublic: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EditDocumentFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && document) {
      // document.priority는 'URGENT' | 'IMPORTANT' | 'REFERENCE' 형식 (대문자)
      // priorities에서 해당 priority의 id를 찾아서 설정
      const documentPriorityUpper = document.priority?.toUpperCase();

      // 여러 방법으로 매핑 시도
      let documentPrioritySetting = priorities.find((p) => {
        const labelTypeUpper = p.labelType?.toUpperCase();
        return labelTypeUpper === documentPriorityUpper;
      });

      // 매핑 실패 시 document.priority를 id로 직접 사용하는 경우도 확인
      if (!documentPrioritySetting && document.priority) {
        documentPrioritySetting = priorities.find((p) => p.id === document.priority);
      }

      // 매핑된 prioritySetting의 id를 사용, 없으면 document.priority를 그대로 사용
      const priorityId = documentPrioritySetting?.id || document.priority || '';

      setFormData({
        documentName: document.documentName || '',
        priority: priorityId,
        file: null,
        isPublic: document.isPublic === 1,
      });
      setErrors({});
    }
  }, [open, document, priorities]);

  const handleChange = (field: keyof EditDocumentFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDocumentNameChange = (value: string) => {
    // 사용자가 입력하는 동안은 그대로 저장 (날짜 자동 추가 안 함)
    handleChange('documentName', value);
  };

  const handleDocumentNameBlur = () => {
    // 입력이 끝났을 때 날짜가 없으면 자동으로 추가
    const datePattern = /_\d{4}-\d{2}-\d{2}$/;

    if (formData.documentName && !datePattern.test(formData.documentName)) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const finalName = `${formData.documentName}_${dateStr}`;
      handleChange('documentName', finalName);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange('file', file);
      // 파일명이 있으면 문서명에 자동 입력 (날짜 자동 추가)
      if (!formData.documentName) {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        handleChange('documentName', `${fileNameWithoutExt}_${dateStr}`);
      }
    }
  };

  const handleRemoveFile = () => {
    handleChange('file', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    // 유효성 검사
    const newErrors: Partial<Record<keyof EditDocumentFormData, string>> = {};

    if (!formData.documentName.trim()) {
      newErrors.documentName = '문서명을 입력해주세요.';
    }

    if (!formData.priority) {
      newErrors.priority = '중요도를 선택해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 저장 로직은 view.tsx의 handleSaveEdit에서 처리
    // 모달에서는 데이터만 전달
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      documentName: '',
      priority: '',
      file: null,
      isPublic: false,
    });
    setErrors({});
    onClose();
  };

  const currentFileName = formData.file?.name || document?.fileName || '';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          수정하기
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
        <Stack spacing={3} sx={{ px: 3, pt: 3 }}>
          {/* 파일 업로드 섹션 */}
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600 }}>
                파일 업로드
              </Typography>
              <DialogBtn
                variant="contained"
                onClick={handleFileUpload}
                startIcon={<Iconify icon="eva:cloud-upload-fill" width={20} />}
                sx={{ minHeight: 36, fontSize: 14 }}
              >
                업로드
              </DialogBtn>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            {currentFileName && (
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.75,
                    py: 1.875,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {currentFileName}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRemoveFile}
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      ml: 1,
                      '&:hover': {
                        bgcolor: 'grey.800',
                      },
                    }}
                  >
                    <Iconify icon="solar:close-circle-bold" width={6} />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Stack>

          {/* 문서명 섹션 */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600 }}>
              문서명
            </Typography>
            <TextField
              fullWidth
              value={formData.documentName}
              onChange={(e) => handleDocumentNameChange(e.target.value)}
              onBlur={handleDocumentNameBlur}
              error={!!errors.documentName}
              helperText={errors.documentName}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" sx={{ mr: -1 }}>
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: 15,
                  lineHeight: '24px',
                  py: 2,
                },
              }}
            />
          </Stack>

          {/* 중요도 및 공개 여부 섹션 */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* 중요도 */}
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600 }}>
                중요도
              </Typography>
              <FormControl fullWidth error={!!errors.priority}>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: 15,
                      lineHeight: '24px',
                      py: 2,
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    중요도를 선택하세요
                  </MenuItem>
                  {priorities.map((priority) => {
                    // labelType을 우선적으로 사용, 없으면 label 사용
                    const displayLabel = priority.labelType || priority.label || '중요도';

                    return (
                      <MenuItem key={priority.id} value={priority.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: priority.color,
                            }}
                          />
                          <Typography>{displayLabel}</Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Stack>

            {/* 공개 여부 */}
            <Stack spacing={1.5} sx={{ minWidth: 67 }}>
              <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600 }}>
                공개 여부
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.125, mt: 1 }}>
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'primary.main',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                  공개
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={2}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 48, fontSize: 15 }}>
            취소
          </DialogBtn>
          <DialogBtn variant="contained" onClick={handleSave} sx={{ minHeight: 48, fontSize: 15 }}>
            적용
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
