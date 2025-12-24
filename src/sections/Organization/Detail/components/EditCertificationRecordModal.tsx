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

type CertificationRecord = {
  id: string;
  registrationDate: string;
  certificationDate: string;
  applicationYear?: string;
  certificateFileName?: string;
  accidentFreeYear?: number | null;
  status?: string;
  fileUrl?: string; // 원본 파일 URL
};

type Props = {
  open: boolean;
  onClose: () => void;
  companyIdx: number;
  record: CertificationRecord | null;
  onSave?: (data: {
    certificationDate: Dayjs | null;
    file: File | null;
    isDeleted?: boolean;
  }) => void;
  onUpdated?: () => void;
};

export default function EditCertificationRecordModal({
  open,
  onClose,
  companyIdx,
  record,
  onSave,
  onUpdated,
}: Props) {
  const [certificationDate, setCertificationDate] = useState<Dayjs | null>(null);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRemovingFile, setIsRemovingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAccidentFreeMutation = useUpdateAccidentFree();

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수 (ProfileCard.tsx 참고)
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (
      url.startsWith('data:image/png;base64,data/admin/') ||
      url.startsWith('data:image/png;base64,/data/admin/')
    ) {
      // base64 접두사를 제거하고 URL로 처리
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) {
      return url;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  // 프로필 이미지 전체 URL
  const normalizedFileUrl = useMemo(() => getFullFileUrl(record?.fileUrl), [record?.fileUrl]);

  useEffect(() => {
    if (open && record) {
      // 기존 인증일자 설정
      const certDate = record.certificationDate ? dayjs(record.certificationDate) : dayjs();
      setCertificationDate(certDate.isValid() ? certDate : dayjs());
      setCertificationFile(null);
      setIsRemovingFile(false);
      setIsDragging(false);

      // 기존 파일 미리보기 설정
      if (normalizedFileUrl) {
        // 이미지 파일인지 확인 (확장자 체크 또는 data:image/ 프로토콜)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const isImage =
          imageExtensions.some((ext) => normalizedFileUrl.toLowerCase().includes(ext)) ||
          normalizedFileUrl.startsWith('data:image/');

        if (isImage) {
          setPreviewUrl(normalizedFileUrl);
        } else {
          setPreviewUrl(null);
        }
      } else {
        setPreviewUrl(null);
      }
    }
  }, [open, record, normalizedFileUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCertificationFile(file);
      setIsRemovingFile(false);
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
      setIsRemovingFile(false);
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

  const handleSave = async () => {
    if (!companyIdx) return;

    try {
      setIsSaving(true);

      let finalFileUrl: string | null | undefined = record?.fileUrl;

      if (certificationFile) {
        const uploadResponse = await uploadFile({ files: [certificationFile] });
        let fileUrl: string | undefined;

        if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
          fileUrl = (uploadResponse as any).fileUrls[0];
        } else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
          fileUrl = (uploadResponse as any).files[0]?.fileUrl;
        } else if (
          (uploadResponse as any)?.data?.fileUrls &&
          Array.isArray((uploadResponse as any).data.fileUrls)
        ) {
          fileUrl = (uploadResponse as any).data.fileUrls[0];
        }

        if (fileUrl) {
          finalFileUrl = fileUrl;
        }
      } else if (isRemovingFile) {
        finalFileUrl = null;
      }

      // 실제 API 호출 (여기서는 전체 수정을 호출하거나, 이력 수정 API가 있다면 그것을 사용)
      await updateAccidentFreeMutation.mutateAsync({
        companyIdx,
        isAccidentFreeWorksite: 1,
        accidentFreeStatus: 'PENDING',
        accidentFreeCertifiedAt: certificationDate ? certificationDate.toISOString() : null,
        accidentFreeFileUrl: finalFileUrl ?? null,
      });

      onSave?.({ certificationDate, file: certificationFile });
      onUpdated?.();
      handleClose();
    } catch (error) {
      console.error('인증 이력 수정 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    // 실제 삭제 API가 있다면 여기서 호출
    // 현재는 UI 상에서 삭제 요청을 보낸 것으로 처리
    if (window.confirm('이 인증 이력을 삭제하시겠습니까?')) {
      try {
        setIsSaving(true);
        // TODO: 특정 이력 삭제 API 호출
        // await deleteAccidentFreeHistoryMutation.mutateAsync({ companyIdx, historyIdx: record.id });

        onSave?.({ certificationDate: null, file: null, isDeleted: true });
        onUpdated?.();
        handleClose();
      } catch (error) {
        console.error('인증 이력 삭제 실패:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleClose = () => {
    setCertificationDate(null);
    setCertificationFile(null);
    setPreviewUrl(null);
    setIsRemovingFile(false);
    setIsSaving(false);
    setIsDragging(false);
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
          인증 이력 수정
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack sx={{ pt: 3 }} spacing={3}>
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
                },
              }}
            />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600 }}>
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
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' },
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
                {(certificationFile || record?.certificateFileName) && !isRemovingFile && (
                  <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                    {certificationFile?.name || record?.certificateFileName}
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

        <DialogActions sx={{ px: 3, py: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleDelete}
            sx={{
              color: 'error.main',
              fontWeight: 700,
              '&:hover': { bgcolor: 'error.lighter' },
            }}
          >
            삭제
          </Button>
          <Stack direction="row" spacing={1}>
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
