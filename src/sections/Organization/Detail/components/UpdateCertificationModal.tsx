import { useState, useRef, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

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

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { Iconify } from 'src/components/iconify';

import { useUpdateAccidentFree } from '../../hooks/use-organization-api';
import { uploadFile } from 'src/services/system/system.service';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  companyIdx: number;
  defaultCertifiedAt?: string | null;
  defaultExpiresAt?: string | null;
  defaultStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  defaultFileUrl?: string | null;
  onSave?: (data: { certificationDate: Dayjs | null; file: File | null }) => void;
  onUpdated?: () => void;
};

export default function UpdateCertificationModal({
  open,
  onClose,
  companyIdx,
  defaultCertifiedAt,
  defaultExpiresAt,
  defaultStatus = 'APPROVED',
  defaultFileUrl,
  onSave,
  onUpdated,
}: Props) {
  const [certificationDate, setCertificationDate] = useState<Dayjs | null>(null);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [isRemovingFile, setIsRemovingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAccidentFreeMutation = useUpdateAccidentFree();

  const normalizedDefaultFileUrl = useMemo(() => {
    if (!defaultFileUrl) {
      return null;
    }
    if (defaultFileUrl.startsWith('http://') || defaultFileUrl.startsWith('https://')) {
      return defaultFileUrl;
    }
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    return `${baseUrl}${defaultFileUrl.startsWith('/') ? defaultFileUrl : `/${defaultFileUrl}`}`;
  }, [defaultFileUrl]);

  useEffect(() => {
    if (open) {
      // 인증일자는 항상 오늘 날짜로 초기화
      setCertificationDate(dayjs());
      setCertificationFile(null);
      setPreviewUrl(
        normalizedDefaultFileUrl && normalizedDefaultFileUrl.startsWith('data:')
          ? normalizedDefaultFileUrl
          : null
      );
      setExistingFileUrl(normalizedDefaultFileUrl);
      setIsRemovingFile(false);
      setIsDragging(false);
    }
  }, [open, defaultCertifiedAt, normalizedDefaultFileUrl]);

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
    setExistingFileUrl(null);
    setIsRemovingFile(true);
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

  const computedExpiresAt = useMemo(() => {
    if (certificationDate) {
      return certificationDate.add(1, 'year');
    }
    if (defaultExpiresAt) {
      const expires = dayjs(defaultExpiresAt);
      return expires.isValid() ? expires : null;
    }
    return null;
  }, [certificationDate, defaultExpiresAt]);

  const handleSave = async () => {
    if (!companyIdx) {
      console.error('companyIdx가 없어 무재해 인증 정보를 수정할 수 없습니다.');
      return;
    }

    try {
      setIsSaving(true);

      let accidentFreeFileUrl: string | null | undefined = existingFileUrl;

      if (certificationFile) {
        const uploadResponse = await uploadFile({ files: [certificationFile] });
        const fileUrls = (uploadResponse as unknown as { fileUrls: string[] }).fileUrls;
        if (!fileUrls || fileUrls.length === 0) {
          throw new Error('파일 업로드에 실패했습니다.');
        }
        accidentFreeFileUrl = fileUrls[0];
      } else if (isRemovingFile) {
        accidentFreeFileUrl = null;
      }

      const params = {
        accidentFreeStatus: defaultStatus ?? 'APPROVED',
        accidentFreeCertifiedAt: certificationDate ? certificationDate.toISOString() : null,
        accidentFreeExpiresAt: computedExpiresAt ? computedExpiresAt.toISOString() : null,
        accidentFreeFileUrl: accidentFreeFileUrl ?? null,
      } as const;

      await updateAccidentFreeMutation.mutateAsync({
        companyIdx,
        ...params,
      });

      onSave?.({ certificationDate, file: certificationFile });
      onUpdated?.();
      handleClose();
    } catch (error) {
      console.error('무재해 인증 정보 수정 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    handleRemoveFile();
  };

  const handleClose = () => {
    setCertificationDate(null);
    setCertificationFile(null);
    setPreviewUrl(null);
    setExistingFileUrl(null);
    setIsRemovingFile(false);
    setIsSaving(false);
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
                {!certificationFile && existingFileUrl && (
                  <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                    {existingFileUrl.split('/').pop()}
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
            <DialogBtn variant="contained" onClick={handleSave} disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </DialogBtn>
          </Stack>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
