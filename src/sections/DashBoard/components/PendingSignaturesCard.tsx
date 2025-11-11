import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type PendingSignature = {
  id: string;
  documentName: string;
  author: string;
  date: string;
  time: string;
};

type Props = {
  rows: PendingSignature[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDocument?: (id: string) => void;
};

export default function PendingSignaturesCard({
  rows,
  page,
  totalPages,
  onPageChange,
  onViewDocument,
}: Props) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 2.5 },
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.25, sm: 1.5 },
        height: '100%',
        width: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
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
          서명 대기 문서
        </Typography>
      </Box>

      {/* 테이블 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
        {rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'grey.100',
              borderRadius: 1.5,
              p: 1,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                minHeight: 56,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontSize: { xs: 13, sm: 14 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                  maxWidth: 140,
                }}
              >
                {row.documentName}
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: '100%', fontSize: { xs: 13, sm: 14 } }}>
                {row.author}
              </Typography>
              <Box sx={{ width: { xs: '100%', sm: 80 } }}>
                <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                  {row.date}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: { xs: 11, sm: 12 } }}
                >
                  {row.time}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ pl: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onViewDocument?.(row.id)}
                sx={{
                  minHeight: { xs: 32, sm: 36 },
                  fontSize: { xs: 12, sm: 14 },
                  fontWeight: 700,

                  width: { xs: '100%', sm: 'auto' },
                  borderColor: '#2563E9',
                  color: '#2563E9',
                  '&:hover': {
                    borderColor: '#2563E9',
                    bgcolor: 'rgba(37, 99, 233, 0.04)',
                  },
                }}
              >
                문서보기
              </Button>
            </Box>
          </Box>
        ))}
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
              opacity: page === 1 ? 0.48 : 1,
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
              opacity: page === totalPages ? 0.48 : 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
