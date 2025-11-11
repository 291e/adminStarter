import { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import ImageUpload from './ImageUpload';

// 다음 주소 API 타입 정의
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
  images: File[];
  address: string;
  detailAddress: string;
  content: string;
  reporter: string;
  author: string;
};

type Props = {
  onSubmit: (data: RiskReportFormData) => void;
  onCancel: () => void;
};

export default function RiskReportForm({ onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState<RiskReportFormData>({
    images: [],
    address: '',
    detailAddress: '',
    content: '',
    reporter: '',
    author: '',
  });

  const addressInputRef = useRef<HTMLInputElement>(null);

  // 다음 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleChange = (field: keyof RiskReportFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchAddress = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 주소 선택 시 실행되는 콜백
        let addr = ''; // 주소 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.addressType === 'R') {
          // 사용자가 도로명 주소를 선택했을 경우
          addr = data.address;
        } else {
          // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.address;
        }

        // 주소 필드에 값 설정
        handleChange('address', addr);
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
        maxWidth: 'sm',
        mx: 'auto',
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
          위험 보고 등록
        </Typography>
      </Box>

      {/* 폼 내용 */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* 이미지 업로드 */}
          <ImageUpload
            images={formData.images}
            onChange={(images) => handleChange('images', images)}
          />

          {/* 위치 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              위치
            </Typography>
            <Stack spacing={2}>
              <TextField
                inputRef={addressInputRef}
                fullWidth
                placeholder="주소"
                value={formData.address}
                onClick={handleAddressFieldClick}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="text"
                        color="primary"
                        startIcon={<Iconify icon="eva:search-fill" width={20} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearchAddress();
                        }}
                      >
                        검색
                      </Button>
                    </InputAdornment>
                  ),
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
                  value={formData.detailAddress}
                  onChange={(e) => handleChange('detailAddress', e.target.value)}
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

          {/* 내용 */}
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

          {/* 보고자/작성자 */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                보고자
              </Typography>
              <TextField
                fullWidth
                placeholder="김안전"
                value={formData.reporter}
                onChange={(e) => handleChange('reporter', e.target.value)}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                작성자
              </Typography>
              <TextField
                fullWidth
                placeholder="트루트루스"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
              />
            </Box>
          </Stack>
        </Stack>
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
        <Button variant="outlined" size="large" onClick={onCancel}>
          취소
        </Button>
        <Button variant="contained" size="large" onClick={handleSubmit}>
          등록
        </Button>
      </Box>
    </Box>
  );
}
