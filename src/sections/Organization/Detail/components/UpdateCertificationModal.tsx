import { useState, useRef, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: { certificationDate: Dayjs | null; file: File | null }) => void;
};

export default function UpdateCertificationModal({ open, onClose, onSave }: Props) {
  const [certificationDate, setCertificationDate] = useState<Dayjs | null>(null);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 기존 인증 이력 정보 가져오기
      setCertificationDate(null);
      setCertificationFile(null);
      setPreviewUrl(null);
      setIsDragging(false);
    }
  }, [open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCertificationFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setCertificationFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCertificationFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 인증 이력 업데이트 API 호출
    // const mutation = useMutation({
    //   mutationFn: (data: { certificationDate: string; file: File | null }) =>
    //     updateCertificationRecord(organizationId, data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId] });
    //     // 성공 토스트 메시지 표시
    //   },
    //   onError: (error) => {
    //     console.error('인증 이력 업데이트 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // mutation.mutate({
    //   certificationDate: certificationDate?.format('YYYY-MM-DD') || '',
    //   file: certificationFile,
    // });
    onSave?.({ certificationDate, file: certificationFile });
    handleClose();
  };

  const handleDelete = () => {
    // TODO: TanStack Query Hook(useMutation)으로 인증 파일 삭제 API 호출
    // const deleteMutation = useMutation({
    //   mutationFn: () => deleteCertificationFile(organizationId, recordId),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId] });
    //     // 성공 토스트 메시지 표시
    //   },
    //   onError: (error) => {
    //     console.error('인증 파일 삭제 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // deleteMutation.mutate();
    handleRemoveFile();
  };

  const handleClose = () => {
    setCertificationDate(null);
    setCertificationFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            px: 3,
            py: 3,
            fontSize: 18,
            fontWeight: 600,
            lineHeight: '28px',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          인증 이력 업데이트
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack sx={{ pt: 3 }} spacing={3}>
            {/* 인증일자 */}
            <DatePicker
              label="인증일자"
              value={certificationDate}
              onChange={setCertificationDate}
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  size: 'small',
                  required: true,
                  fullWidth: true,
                  placeholder: '날짜 선택',
                },
              }}
            />

            {/* 인증 파일 */}
            <Stack spacing={1.5}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 14, fontWeight: 600, lineHeight: '22px' }}
              >
                인증 파일
              </Typography>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleFileUpload}
                sx={{
                  bgcolor: 'grey.50',
                  border: '1px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 200,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {previewUrl ? (
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="인증 파일 미리보기"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.48)',
                          color: 'common.white',
                          width: 28,
                          height: 28,
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                          },
                        }}
                      >
                        <Iconify icon="mingcute:close-line" width={18} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Iconify
                      icon="eva:cloud-upload-fill"
                      width={80}
                      sx={{ color: 'primary.main' }}
                    />
                  )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  파일 업로드
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  클릭하여 파일을 선택하거나 마우스로 드래그하여 옮겨주세요.
                </Typography>
                {certificationFile && (
                  <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                    {certificationFile.name}
                  </Typography>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: 3,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {certificationFile && (
              <Button
                onClick={handleDelete}
                sx={{
                  minHeight: 36,
                  height: 36,
                  minWidth: 64,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: '24px',
                  px: 1,
                  py: 0.75,
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.8',
                  },
                }}
              >
                삭제
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
            <DialogBtn variant="outlined" onClick={handleClose}>
              취소
            </DialogBtn>
            <DialogBtn variant="contained" onClick={handleSave}>
              {certificationFile ? '저장' : '등록'}
            </DialogBtn>
          </Stack>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
