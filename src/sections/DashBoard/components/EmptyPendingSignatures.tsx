import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { MotivationIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

type EmptyPendingSignaturesProps = BoxProps;

export default function EmptyPendingSignatures({ sx, ...other }: EmptyPendingSignaturesProps) {
  return (
    <Box
      sx={[
        {
          width: '100%',
          maxWidth: 360,
          mx: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <MotivationIllustration sx={{ width: 240, maxWidth: '100%' }} />

      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          대기 중인 서명 요청이 없어요
        </Typography>
        <Typography variant="body2" color="text.secondary">
          새로운 문서를 공유하고 서명을 요청하면
          <br />
          이곳에서 바로 확인할 수 있어요.
        </Typography>
      </Box>
    </Box>
  );
}
