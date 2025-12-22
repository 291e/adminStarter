import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

type SampleItem = {
  url: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  samples: SampleItem[];
};

const getFullFileUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

/**
 * 샘플 URL 문자열을 파싱하여 SampleItem 배열로 변환
 * 지원 형식:
 * 1. 단일 URL: "http://example.com/file.pdf"
 * 2. 콤마 구분 URL: "url1,url2,url3"
 * 3. JSON 배열: '["url1", "url2"]'
 */
export function parseSampleUrls(sampleUrl: string | null | undefined): SampleItem[] {
  if (!sampleUrl) return [];

  // JSON 배열 형식 시도
  if (sampleUrl.startsWith('[')) {
    try {
      const parsed = JSON.parse(sampleUrl);
      if (Array.isArray(parsed)) {
        return parsed.map((url: string, index: number) => ({
          url,
          name: url.split('/').pop() || `샘플 ${index + 1}`,
        }));
      }
    } catch {
      // JSON 파싱 실패시 다른 형식 시도
    }
  }

  // 콤마 구분 형식 시도
  const urls = sampleUrl
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  return urls.map((url, index) => ({
    url,
    name: url.split('/').pop() || `샘플 ${index + 1}`,
  }));
}

export default function SampleViewModal({ open, onClose, samples }: Props) {
  const handleViewSample = (url: string) => {
    const fullUrl = getFullFileUrl(url);
    if (fullUrl) {
      window.open(fullUrl, '_blank');
    }
  };

  const handleViewAll = () => {
    samples.forEach((sample) => {
      const fullUrl = getFullFileUrl(sample.url);
      if (fullUrl) {
        window.open(fullUrl, '_blank');
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, lineHeight: '28px', letterSpacing: 0 }}
        >
          샘플 보기
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
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
        <Stack spacing={2} sx={{ mt: 1, pb: 2 }}>
          {samples.length > 1 && (
            <Button
              variant="contained"
              onClick={handleViewAll}
              startIcon={<Iconify icon="solar:add-folder-bold" />}
              sx={{ mb: 1 }}
            >
              전체 보기 ({samples.length}개)
            </Button>
          )}

          {samples.map((sample, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                <Iconify
                  icon="solar:file-bold-duotone"
                  width={24}
                  sx={{ color: 'primary.main', flexShrink: 0 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sample.name}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleViewSample(sample.url)}
                sx={{ flexShrink: 0 }}
              >
                보기
              </Button>
            </Box>
          ))}

          {samples.length === 0 && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
            >
              등록된 샘플이 없습니다.
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
