import { useState } from 'react';

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
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    documentName: string;
    importance: string;
    isPublic: boolean;
    file?: File;
  }) => void;
  documentName?: string;
  documentId?: string;
};

const IMPORTANCE_OPTIONS = [
  { value: 'high', label: '중요' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '낮음' },
];

export default function PublishModal({
  open,
  onClose,
  onConfirm,
  documentName: initialDocumentName,
  documentId,
}: Props) {
  const [documentName, setDocumentName] = useState(initialDocumentName || '');
  const [importance, setImportance] = useState('high');
  const [isPublic, setIsPublic] = useState(false); // 기본값: 비공개
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 게시
    // const mutation = useMutation({
    //   mutationFn: (data: {
    //     documentId: string;
    //     documentName: string;
    //     importance: string;
    //     isPublic: boolean;
    //     file?: File;
    //   }) => publishDocument(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    //     onClose();
    //   },
    // });
    // mutation.mutate({
    //   documentId: documentId!,
    //   documentName,
    //   importance,
    //   isPublic,
    //   file: selectedFile || undefined,
    // });
    onConfirm({
      documentName,
      importance,
      isPublic,
      file: selectedFile || undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setDocumentName(initialDocumentName || '');
    setImportance('high');
    setIsPublic(false);
    setSelectedFile(null);
    onClose();
  };

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
              <Select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                sx={{
                  fontSize: 15,
                  lineHeight: '24px',
                }}
              >
                {IMPORTANCE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 파일 첨부 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              파일 첨부
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<Iconify icon={'eva:cloud-upload-fill' as any} width={20} />}
              sx={{
                minHeight: 36,
                fontSize: 14,
                fontWeight: 700,
                px: 1.5,
                py: 0.75,
              }}
            >
              업로드
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
            </Button>
          </Box>
          {selectedFile && (
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
              선택된 파일: {selectedFile.name}
            </Typography>
          )}

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
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
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
                  {isPublic ? '공개' : '비공개'}
                </Typography>
              }
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <DialogBtn variant="outlined" onClick={handleClose}>
          닫기
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleConfirm}>
          게시
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
