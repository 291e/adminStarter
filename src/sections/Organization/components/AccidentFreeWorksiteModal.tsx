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
import type { Member } from 'src/sections/Organization/types/member';
import { mockCompanies } from 'src/_mock/_company';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onApprove?: (member: Member) => void;
  onReject?: (member: Member) => void;
  member: Member | null;
};

export default function AccidentFreeWorksiteModal({
  open,
  onClose,
  onApprove,
  onReject,
  member,
}: Props) {
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companies = mockCompanies();

  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 무재해 사업장 인증 정보 가져오기
      // const { data: certificationData } = useQuery({
      //   queryKey: ['accidentFreeCertification', member?.memberIdx],
      //   queryFn: () => fetchAccidentFreeCertification(member?.memberIdx),
      // });
      // setCertificationFile(certificationData?.file || null);
      // setPreviewUrl(certificationData?.previewUrl || null);
      // setIsEnabled(certificationData?.isEnabled || false);

      setCertificationFile(null);
      setPreviewUrl(null);
      setIsEnabled(false);
      setIsDragging(false);
    }
  }, [open, member]);

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

  const handleApprove = () => {
    if (!member) return;
    // TODO: TanStack Query Hook(useMutation)으로 무재해 사업장 승인
    // const approveMutation = useMutation({
    //   mutationFn: () => approveAccidentFreeWorksite(member.memberIdx, {
    //     certificationFile,
    //     isEnabled,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['members'] });
    //     onClose();
    //   },
    // });
    // approveMutation.mutate();
    onApprove?.(member);
  };

  const handleReject = () => {
    if (!member) return;
    // TODO: TanStack Query Hook(useMutation)으로 무재해 사업장 반려
    // const rejectMutation = useMutation({
    //   mutationFn: () => rejectAccidentFreeWorksite(member.memberIdx),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['members'] });
    //     onClose();
    //   },
    // });
    // rejectMutation.mutate();
    onReject?.(member);
  };

  const companyName = member
    ? companies.find((c) => c.companyIdx === member.companyIdx)?.companyName || ''
    : '';

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
                {/* TODO: API에서 가져온 인증일자 표시 */}
                2025-10-23
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
                {/* TODO: API에서 가져온 적용연도 표시 */}
                2026년
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
                <Iconify icon="eva:cloud-upload-fill" width={80} sx={{ color: 'primary.main' }} />
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
          <DialogBtn variant="outlined" onClick={handleReject}>
            반려
          </DialogBtn>
          <DialogBtn variant="contained" onClick={handleApprove}>
            승인
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
