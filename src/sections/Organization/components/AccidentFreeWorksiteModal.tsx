import { useState, useRef, useEffect, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { Iconify } from 'src/components/iconify';
import type { Organization } from 'src/services/organization/organization.types';
import { useUpdateAccidentFree } from '../hooks/use-organization-api';
import { uploadFile } from 'src/services/system/system.service';
import { CONFIG } from 'src/global-config';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

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
  const [decision, setDecision] = useState<'reject' | 'approve'>('reject');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExistingFileRemoved, setIsExistingFileRemoved] = useState(false);
  const [certifiedDate, setCertifiedDate] = useState<Dayjs | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAccidentFreeMutation = useUpdateAccidentFree();

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
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
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) {
      return url;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    // data/admin/로 시작하는 경우도 처리
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    if (open && organization) {
      // 기존 인증 파일 URL이 있으면 미리보기 설정
      const existingFileUrl = getFullFileUrl(
        organization.accidentFreeInformation?.accidentFreeFileUrl
      );
      setPreviewUrl(existingFileUrl);

      // 인증 상태에 따라 decision 초기값 설정
      const status = organization.accidentFreeInformation?.accidentFreeStatus;
      setDecision(status === 'APPROVED' ? 'approve' : 'reject');

      const certifiedAt = organization.accidentFreeInformation?.accidentFreeCertifiedAt
        ? dayjs(organization.accidentFreeInformation.accidentFreeCertifiedAt)
        : dayjs();
      setCertifiedDate(certifiedAt.isValid() ? certifiedAt : dayjs());

      // 모달이 열릴 때마다 파일 선택 초기화
      setCertificationFile(null);
      setIsExistingFileRemoved(false);
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
    setIsExistingFileRemoved(true);
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

  const expiresDate = useMemo(
    () => (certifiedDate ? certifiedDate.add(1, 'year') : null),
    [certifiedDate]
  );

  const handleSubmit = async () => {
    if (!organization) return;

    try {
      setIsUploading(true);

      let accidentFreeFileUrl: string | null | undefined;

      // 새 파일이 선택된 경우 업로드
      if (certificationFile) {
        if (import.meta.env.DEV) {
          console.log('📤 무재해 인증 파일 업로드 시작:', certificationFile.name);
        }

        const uploadResponse = await uploadFile({ files: [certificationFile] });
        // axios 인터셉터에서 평탄화되므로 직접 접근
        // 실제 응답 구조: { files: [{ fileUrl: string, ... }], header: {...} }
        const uploadedFiles = (uploadResponse as any).files || [];
        const fileUrl = uploadedFiles[0]?.fileUrl || (uploadResponse as any).fileUrls?.[0];

        if (!fileUrl) {
          console.error('❌ 파일 업로드 실패: fileUrl이 없습니다.');
          setIsUploading(false);
          return;
        }

        accidentFreeFileUrl = fileUrl;
        if (import.meta.env.DEV) {
          console.log('✅ 파일 업로드 완료:', accidentFreeFileUrl);
        }
      } else if (isExistingFileRemoved) {
        // 기존 파일이 제거된 경우
        accidentFreeFileUrl = null;
      } else if (
        decision === 'approve' &&
        organization.accidentFreeInformation?.accidentFreeFileUrl
      ) {
        // 승인이고 기존 파일이 있는 경우 유지
        accidentFreeFileUrl = organization.accidentFreeInformation?.accidentFreeFileUrl;
      } else if (decision === 'reject') {
        // 반려인 경우 파일 URL 제거
        accidentFreeFileUrl = null;
      }

      // 무재해 사업장 정보 수정 API 호출
      const params = {
        accidentFreeStatus: decision === 'approve' ? 'APPROVED' : 'REJECTED',
        accidentFreeCertifiedAt: certifiedDate ? certifiedDate.toISOString() : null,
        accidentFreeExpiresAt: expiresDate ? expiresDate.toISOString() : null,
        accidentFreeFileUrl,
      } as const;

      if (import.meta.env.DEV) {
        console.log('🔄 무재해 사업장 정보 수정 API 호출:', {
          companyIdx: organization.companyIdx,
          decision,
          params,
        });
      }

      await updateAccidentFreeMutation.mutateAsync({
        companyIdx: organization.companyIdx,
        ...params,
      });

      if (import.meta.env.DEV) {
        console.log(`✅ 무재해 사업장 ${decision === 'approve' ? '승인' : '반려'} 완료`);
      }

      if (decision === 'approve') {
        onApprove?.(organization);
      } else {
        onReject?.(organization);
      }
      onClose();
    } catch (error) {
      console.error(`❌ 무재해 사업장 ${decision === 'approve' ? '승인' : '반려'} 실패:`, error);
    } finally {
      setIsUploading(false);
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

      <DialogContent sx={{ px: 0 }}>
        <Stack spacing={1} sx={{ p: 3, bgcolor: 'grey.100' }}>
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, width: '100%' }}>
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
                {certifiedDate ? certifiedDate.format('YYYY-MM-DD') : '-'}
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
                {expiresDate ? `${expiresDate.year()}년` : '-'}
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
              borderColor: isDragging ? 'primary.main' : 'grey.300',
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
                    minHeight: 320,
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
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0, 0, 0, 0.48)',
                    color: 'common.white',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
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
                  Drop or select file
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Drop files here or click to{' '}
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    browse
                  </Box>{' '}
                  through your machine.
                </Typography>
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

      {/* 인증 여부 선택 */}
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
            인증 여부
          </Typography>
          <RadioGroup
            value={decision}
            onChange={(e) => setDecision(e.target.value as 'reject' | 'approve')}
            sx={{ flexDirection: 'row', gap: 0 }}
          >
            <FormControlLabel
              value="reject"
              control={<Radio size="small" />}
              label="반려"
              sx={{ mr: 4 }}
            />
            <FormControlLabel value="approve" control={<Radio size="small" />} label="승인" />
          </RadioGroup>
        </Stack>
      </DialogContent>

      <Divider />

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <DialogBtn variant="outlined" onClick={onClose} disabled={isUploading}>
          취소
        </DialogBtn>
        <DialogBtn
          variant="contained"
          onClick={handleSubmit}
          disabled={isUploading || updateAccidentFreeMutation.isPending}
        >
          {isUploading || updateAccidentFreeMutation.isPending ? '처리 중...' : '등록'}
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
