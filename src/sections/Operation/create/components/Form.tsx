import { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';

import ImageUpload from './ImageUpload';
import { Iconify } from 'src/components/iconify';
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
        }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}
// ----------------------------------------------------------------------

export type RiskReportFormData = {
  title: string;
  location: string;
  content: string;
  images: File[];
  uploadedImageUrls?: string[]; // 이미 업로드된 이미지 URL
  signalType: string;
  sourceType: string;
  description: string;
  memo: string;
  chatRoomId: string;
  reporterName: string;
  authorName: string;
  status?: 'CONFIRMED' | 'UNCONFIRMED';
};

type Props = {
  onSubmit: (data: RiskReportFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<RiskReportFormData> & {
    existingImageUrls?: string[];
    status?: 'CONFIRMED' | 'UNCONFIRMED' | 'PENDING';
  };
  mode?: 'create' | 'edit';
};

export default function RiskReportForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  mode = 'create',
}: Props) {
  const [formData, setFormData] = useState<RiskReportFormData>({
    title: initialData?.title || '',
    location: initialData?.location || '',
    content: initialData?.content || '',
    images: initialData?.images || [],
    uploadedImageUrls: [], // 업로드된 이미지 URL 저장
    signalType: initialData?.signalType || '',
    sourceType: initialData?.sourceType || '',
    description: initialData?.description || '',
    memo: initialData?.memo || '',
    chatRoomId: initialData?.chatRoomId || '',
    reporterName: initialData?.reporterName || '',
    authorName: initialData?.authorName || '',
    status:
      initialData?.status === 'CONFIRMED' || initialData?.status === 'UNCONFIRMED'
        ? initialData.status
        : 'UNCONFIRMED',
  });
  const [address, setAddress] = useState(() => {
    // location에서 주소 부분 추출 (상세 주소 제외)
    if (initialData?.location) {
      const parts = initialData.location.split(' ');
      return parts[0] || '';
    }
    return '';
  });
  const [detailAddress, setDetailAddress] = useState(() => {
    // location에서 상세 주소 부분 추출
    if (initialData?.location) {
      const parts = initialData.location.split(' ');
      return parts.slice(1).join(' ') || '';
    }
    return '';
  });
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialData?.existingImageUrls || []
  );
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleChange = (field: keyof RiskReportFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocation = (base: string, detail: string) => {
    const combined = [base.trim(), detail.trim()].filter(Boolean).join(' ');
    handleChange('location', combined);
  };
  const handleSearchAddress = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 주소 선택 시 실행되는 콜백
        const addr = data.address;
        setAddress(addr);
        updateLocation(addr, detailAddress);
        addressInputRef.current?.focus();
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const handleAddressFieldClick = () => {
    handleSearchAddress();
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {mode === 'edit' ? '위험 보고 수정' : '위험 보고 등록'}
        </Typography>
      </Box>

      {/* 폼 내용 */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 왼쪽: 이미지 업로드 */}
          <Grid size={{ xs: 12, md: 5 }}>
            <ImageUpload
              images={formData.images}
              onChange={(images) => handleChange('images', images)}
              existingImageUrls={existingImageUrls}
              onRemoveExistingUrl={(url) => {
                setExistingImageUrls((prev) => prev.filter((u) => u !== url));
              }}
              onUploadedUrls={(urls) => handleChange('uploadedImageUrls', urls)}
            />
          </Grid>

          {/* 오른쪽: 입력 필드들 */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* 첫 번째 행: 위치 */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  위치
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    inputRef={addressInputRef}
                    fullWidth
                    placeholder="주소"
                    value={address}
                    onClick={handleAddressFieldClick}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        cursor: 'pointer',
                      },
                    }}
                  />
                  <Box>
                    <TextField
                      fullWidth
                      placeholder="상세 주소"
                      value={detailAddress}
                      onChange={(e) => {
                        setDetailAddress(e.target.value);
                        updateLocation(address, e.target.value);
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      sx={{ mt: 1.5, px: 1.5 }}
                    >
                      <Iconify
                        icon="solar:info-circle-bold"
                        width={16}
                        sx={{ color: 'text.secondary', mt: 0.25 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        단위 작업장소를 함께 입력해 주세요. (예: 1공장, 2층 조립라인, 도장작업장 등)
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* 두 번째 행: 내용 */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  내용
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="포크레인 사고 현장"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'grey.50',
                    },
                  }}
                />
              </Box>

              {/* 세 번째 행: 보고자/작성자 */}
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      보고자
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      해당 위험을 처음 보고한 사람
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    value={formData.reporterName}
                    onChange={(e) => handleChange('reporterName', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      작성자
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                      게시물을 작성하는 사람
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    value={formData.authorName}
                    onChange={(e) => handleChange('authorName', e.target.value)}
                  />
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* 수정 모드일 때만 표시되는 필드 */}
        {mode === 'edit' && (
          <Stack spacing={3} sx={{ mt: 3 }}>
            {/* 메모 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                메모
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="메모를 입력하세요"
                value={formData.memo}
                onChange={(e) => handleChange('memo', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.50',
                  },
                }}
              />
            </Box>

            {/* 확인 */}
            <Box>
              <FormLabel sx={{ mb: 1.5, display: 'block', fontWeight: 600 }}>확인</FormLabel>
              <RadioGroup
                row
                value={formData.status || 'UNCONFIRMED'}
                onChange={(e) =>
                  handleChange('status', e.target.value as 'CONFIRMED' | 'UNCONFIRMED')
                }
              >
                <FormControlLabel value="CONFIRMED" control={<Radio />} label="확인" />
                <FormControlLabel value="UNCONFIRMED" control={<Radio />} label="미확인" />
              </RadioGroup>
            </Box>
          </Stack>
        )}
      </Box>

      {/* 하단 버튼 */}
      <Box
        sx={{
          p: 3,
          pt: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <Button variant="outlined" size="large" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button variant="contained" size="large" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'edit'
              ? '수정 중...'
              : '등록 중...'
            : mode === 'edit'
              ? '수정'
              : '등록'}
        </Button>
      </Box>
    </Box>
  );
}
