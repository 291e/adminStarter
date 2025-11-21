import { useState, useRef, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { Iconify } from 'src/components/iconify';
import type { Organization } from 'src/services/organization/organization.types';
import { useUpdateAccidentFree } from '../hooks/use-organization-api';
import { uploadFile } from 'src/services/system/system.service';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onApprove?: (organization: Organization) => void;
  onReject?: (organization: Organization) => void;
  organization: Organization | null;
};

export default function AccidentFreeWorksiteModal({
  open,
  onClose,
  onApprove,
  onReject,
  organization,
}: Props) {
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAccidentFreeMutation = useUpdateAccidentFree();

  useEffect(() => {
    if (open && organization) {
      // organization 데이터에서 무재해 사업장 정보 가져오기
      const hasAccidentFree = organization.isAccidentFreeWorksite === 1;
      setIsEnabled(hasAccidentFree);

      // 기존 인증 파일 URL이 있으면 미리보기 설정
      // TODO: API 응답에 accidentFreeFileUrl 필드가 추가되면 사용
      // if (organization.accidentFreeFileUrl) {
      //   setPreviewUrl(organization.accidentFreeFileUrl);
      // }

      // 모달이 열릴 때마다 파일 선택 초기화
      setCertificationFile(null);
      if (!organization.accidentFreeFileUrl) {
        setPreviewUrl(null);
      }
      setIsDragging(false);
    }
  }, [open, organization]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCertificationFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    if (file && file.type.startsWith('image/')) {
      setCertificationFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApprove = async () => {
    if (!organization) return;

    try {
      setIsUploading(true);

      let accidentFreeFileUrl: string | undefined;

      // 파일이 선택된 경우 먼저 업로드
      if (certificationFile) {
        if (import.meta.env.DEV) {
          console.log('📤 무재해 인증 파일 업로드 시작:', certificationFile.name);
        }

        const uploadResponse = await uploadFile({ files: [certificationFile] });
        // axios interceptor가 body를 flatten하므로 직접 접근
        const fileUrls = (uploadResponse as unknown as { fileUrls: string[] }).fileUrls;

        if (!fileUrls || fileUrls.length === 0) {
          console.error('❌ 파일 업로드 실패: fileUrls가 없습니다.');
          setIsUploading(false);
          return;
        }

        accidentFreeFileUrl = fileUrls[0];
        if (import.meta.env.DEV) {
          console.log('✅ 파일 업로드 완료:', accidentFreeFileUrl);
        }
      }

      // 무재해 사업장 정보 수정 API 호출
      const params: any = {
        accidentFreeDays: undefined, // 필요시 추가
        certificationDate: organization.accidentFreeCertifiedAt
          ? new Date(organization.accidentFreeCertifiedAt).toISOString().split('T')[0]
          : undefined,
        certificationNumber: undefined, // 필요시 추가
      };

      if (accidentFreeFileUrl) {
        params.accidentFreeFileUrl = accidentFreeFileUrl;
      }

      if (import.meta.env.DEV) {
        console.log('🔄 무재해 사업장 정보 수정 API 호출:', {
          companyIdx: organization.companyIdx,
          params,
        });
      }

      await updateAccidentFreeMutation.mutateAsync({
        companyIdx: organization.companyIdx,
        ...params,
      });

      if (import.meta.env.DEV) {
        console.log('✅ 무재해 사업장 승인 완료');
      }

      onApprove?.(organization);
      onClose();
    } catch (error) {
      console.error('❌ 무재해 사업장 승인 실패:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = async () => {
    if (!organization) return;

    try {
      // 반려 시 isActive를 0으로 설정하거나 별도 API 호출
      // 현재는 updateAccidentFree를 사용하여 처리
      // TODO: 반려 전용 API가 있다면 사용

      if (import.meta.env.DEV) {
        console.log('🔄 무재해 사업장 반려 처리');
      }

      // 반려 시에는 파일 URL을 제거하고 상태를 비활성화
      await updateAccidentFreeMutation.mutateAsync({
        companyIdx: organization.companyIdx,
        accidentFreeFileUrl: undefined,
      });

      if (import.meta.env.DEV) {
        console.log('✅ 무재해 사업장 반려 완료');
      }

      onReject?.(organization);
      onClose();
    } catch (error) {
      console.error('❌ 무재해 사업장 반려 실패:', error);
    }
  };

  const companyName = organization?.companyName || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          px: 3,
          py: 3,
          fontSize: 18,
          fontWeight: 600,
          lineHeight: '28px',
        }}
      >
        무재해 사업장 인증
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: 'grey.50',
          px: 3,
          py: 3,
        }}
      >
        <Stack spacing={1}>
          {/* 조직명 */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 80,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
              }}
            >
              조직명
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
              {companyName}
            </Typography>
          </Stack>

          {/* 인증일자 / 적용연도 */}
          <Stack direction="row" spacing={12.5} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  minWidth: 80,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '22px',
                }}
              >
                인증일자
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                {organization?.accidentFreeCertifiedAt
                  ? fDateTime(organization.accidentFreeCertifiedAt, 'YYYY-MM-DD')
                  : '-'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  minWidth: 80,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '22px',
                }}
              >
                적용연도
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                {organization?.accidentFreeExpiresAt
                  ? `${new Date(organization.accidentFreeExpiresAt).getFullYear()}년`
                  : '-'}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogContent sx={{ px: 0, py: 2.5 }}>
        <Stack spacing={1.5} sx={{ px: 3, width: '100%' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
            }}
          >
            인증 파일
          </Typography>

          {/* 파일 업로드 영역 */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleFileUpload}
            sx={{
              position: 'relative',
              width: '100%',
              minHeight: 320,
              bgcolor: 'grey.50',
              border: '1px dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              borderRadius: 1,
              p: previewUrl ? 0 : 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: previewUrl ? 'grey.50' : 'grey.100',
                borderColor: 'primary.main',
              },
            }}
          >
            {previewUrl ? (
              <>
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
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0, 0, 0, 0.48)',
                    color: 'common.white',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                    },
                  }}
                >
                  <Iconify icon="mingcute:close-line" width={18} />
                </IconButton>
              </>
            ) : (
              <>
                <Iconify icon="eva:cloud-upload-fill" width={80} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
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
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Box>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            size="medium"
          />
        </Box>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
          <DialogBtn variant="outlined" onClick={handleReject} disabled={isUploading}>
            반려
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleApprove}
            disabled={isUploading || updateAccidentFreeMutation.isPending}
          >
            {isUploading || updateAccidentFreeMutation.isPending ? '처리 중...' : '승인'}
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
