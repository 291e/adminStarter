import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import type { SharedDocument } from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

type Props = {
  rows: SharedDocument[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewAll?: () => void;
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; variant: 'soft' }
> = {
  URGENT: {
    label: '긴급',
    color: 'error.main',
    bgColor: 'rgba(255, 86, 48, 0.16)',
    variant: 'soft',
  },
  IMPORTANT: {
    label: '중요',
    color: 'warning.main',
    bgColor: 'rgba(255, 171, 0, 0.16)',
    variant: 'soft',
  },
  REFERENCE: {
    label: '참고',
    color: '#2563E9',
    bgColor: 'rgba(37, 99, 233, 0.1)',
    variant: 'soft',
  },
  // 기본값 (null 또는 알 수 없는 priority)
  DEFAULT: {
    label: '참고',
    color: '#2563E9',
    bgColor: 'rgba(37, 99, 233, 0.1)',
    variant: 'soft',
  },
};

export default function SharedDocumentsCard({
  rows,
  page,
  totalPages,
  onPageChange,
  onViewAll,
}: Props) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 2.5 },
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.25, sm: 1.5 },
        flex: 1,
        width: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 0 },
          minHeight: { xs: 60, sm: 80 },
          pl: { xs: 0, sm: 1.5 },
          pr: { xs: 0, sm: 2 },
          py: { xs: 0, sm: 3 },
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}
        >
          공유된 문서
        </Typography>
        <Button
          variant="outlined"
          size="small"
          color="info"
          onClick={() => navigate(paths.dashboard.sharedDocument.root)}
          sx={{
            minHeight: { xs: 32, sm: 36 },
            fontSize: { xs: 12, sm: 14 },
            fontWeight: 700,
            px: { xs: 1, sm: 1.5 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          전체 보기
        </Button>
      </Box>

      {/* 테이블 */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        {/* 테이블 헤더 */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: 'grey.50',
            minHeight: { xs: 48, sm: 56 },
            borderTopLeftRadius: 1.5,
            borderTopRightRadius: 1.5,
          }}
        >
          <Box
            sx={{
              width: { xs: 70, sm: 80 },
              minWidth: { xs: 70, sm: 80 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              중요도
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 120,
              display: 'flex',
              alignItems: 'center',
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              문서명
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 100, sm: 120 },
              minWidth: { xs: 100, sm: 120 },
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              문서 작성일
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 100, sm: 120 },
              minWidth: { xs: 100, sm: 120 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              등록일
            </Typography>
            <Iconify
              icon="eva:arrow-downward-fill"
              width={18}
              sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
            />
          </Box>
        </Box>

        {/* 테이블 바디 */}
        {rows.map((row) => {
          const priorityConfig = PRIORITY_CONFIG[row.priority || ''] || PRIORITY_CONFIG.DEFAULT;
          return (
            <Box
              key={row.id}
              sx={{
                display: 'flex',
                borderBottom: '1px dashed',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 70, sm: 80 },
                  minWidth: { xs: 70, sm: 80 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: { xs: 48, sm: 56 },
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Chip
                  label={priorityConfig.label}
                  size="small"
                  sx={{
                    height: { xs: 22, sm: 24 },
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 700,
                    bgcolor: priorityConfig.bgColor,
                    color: priorityConfig.color,
                    variant: priorityConfig.variant,
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 120,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: { xs: 48, sm: 56 },
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: { xs: 13, sm: 14 },
                  }}
                >
                  {row.documentName}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: { xs: 100, sm: 120 },
                  minWidth: { xs: 100, sm: 120 },
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: { xs: 48, sm: 56 },
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                  {row.documentWrittenAt
                    ? new Date(row.documentWrittenAt).toLocaleDateString('ko-KR')
                    : ''}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: { xs: 100, sm: 120 },
                  minWidth: { xs: 100, sm: 120 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: { xs: 48, sm: 56 },
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                  {row.createAt ? new Date(row.createAt).toLocaleDateString('ko-KR') : ''}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 페이지네이션 */}
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, alignItems: 'center', pt: 2 }}
      >
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'rgba(37, 99, 233, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563E9' }}>
              {page}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mx: 0.5 }}>
            /
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2">{totalPages}</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
