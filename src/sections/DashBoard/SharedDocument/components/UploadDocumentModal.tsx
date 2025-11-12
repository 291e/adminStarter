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
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

// ----------------------------------------------------------------------

export type UploadDocumentFormData = {
  documentName: string; // 문서명 (예: 문서1_2025-11-12)
  priority: string; // 중요도 ID
  file: File | null; // 업로드할 파일
  isPublic: boolean; // 공개 여부
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: UploadDocumentFormData) => void;
  priorities?: Array<{ id: string; label: string; color: string }>; // 중요도 목록
};

export default function UploadDocumentModal({ open, onClose, onSave, priorities = [] }: Props) {
  const [formData, setFormData] = useState<UploadDocumentFormData>({
    documentName: '',
    priority: '',
    file: null,
    isPublic: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UploadDocumentFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 중요도 목록 가져오기
      // const { data: priorityList } = useQuery({
      //   queryKey: ['prioritySettings'],
      //   queryFn: () => fetchPrioritySettings(),
      // });
      // setPriorities(priorityList || []);

      setFormData({
        documentName: '',
        priority: '',
        file: null,
        isPublic: false,
      });
      setErrors({});
    }
  }, [open]);

  const handleChange = (field: keyof UploadDocumentFormData, value: unknown) => {
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
        handleDocumentNameChange(fileNameWithoutExt);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UploadDocumentFormData, string>> = {};

    if (!formData.documentName.trim()) {
      newErrors.documentName = '문서명을 입력해주세요';
    }
    if (!formData.priority) {
      newErrors.priority = '중요도를 선택해주세요';
    }
    if (!formData.file) {
      newErrors.file = '파일을 업로드해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // TODO: TanStack Query Hook(useMutation)으로 문서 업로드
      // const uploadMutation = useMutation({
      //   mutationFn: () => uploadSharedDocument(formData),
      //   onSuccess: () => {
      //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
      //   },
      // });
      // uploadMutation.mutate();

      onSave(formData);
      handleClose();
    }
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
              value={formData.documentName}
              onChange={(e) => handleDocumentNameChange(e.target.value)}
              onBlur={handleDocumentNameBlur}
              error={!!errors.documentName}
              helperText={
                errors.documentName ||
                '입력 후 포커스를 벗어나면 자동으로 날짜가 추가됩니다 (예: 문서1_2025-11-12)'
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
            <FormControl fullWidth error={!!errors.priority}>
              <Select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography component="span" sx={{ color: 'text.disabled', fontSize: 15 }}>
                        중요도를 선택해주세요
                      </Typography>
                    );
                  }
                  const priority = priorities.find((p) => p.id === selected);
                  return priority?.label || selected;
                }}
                sx={{
                  fontSize: 15,
                  lineHeight: '24px',
                  '& .MuiSelect-select': {
                    py: 1,
                  },
                }}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority.id} value={priority.id}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.priority && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                  {errors.priority}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* 파일 첨부 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
              파일 첨부
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" width={20} />}
              onClick={handleFileUpload}
              sx={{
                minHeight: 36,
                fontSize: 14,
                fontWeight: 700,
                px: 1.5,
                py: 0.75,
              }}
            >
              업로드
            </Button>
          </Box>
          {formData.file && (
            <Box sx={{ pl: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                선택된 파일: {formData.file.name}
              </Typography>
            </Box>
          )}
          {errors.file && (
            <Typography variant="caption" sx={{ color: 'error.main', ml: 1 }}>
              {errors.file}
            </Typography>
          )}

          {/* 공개 여부 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: 14 }}>
              공개 여부
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                size="medium"
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                {formData.isPublic ? '공개' : '비공개'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 48, fontSize: 15 }}>
          닫기
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleSave} sx={{ minHeight: 48, fontSize: 15 }}>
          게시
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
