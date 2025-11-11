import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'active' | 'inactive' | 'completed' | 'incomplete';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  sx?: SxProps<Theme>;
};

/**
 * Badge 컴포넌트
 * 상태를 나타내는 뱃지 컴포넌트
 * - 높이: 24px
 * - border-radius: 6px
 * - 폰트: Pretendard Bold, 12px, line-height: 20px
 */
export default function Badge({ label, variant = 'success', sx }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bgcolor: string; color: string }> = {
    success: {
      bgcolor: 'rgba(34, 197, 94, 0.16)',
      color: '#118d57',
    },
    warning: {
      bgcolor: 'rgba(255, 193, 7, 0.16)',
      color: '#b8860b',
    },
    error: {
      bgcolor: 'rgba(244, 67, 54, 0.16)',
      color: '#c62828',
    },
    info: {
      bgcolor: 'rgba(33, 150, 243, 0.16)',
      color: '#1565c0',
    },
    default: {
      bgcolor: 'rgba(145, 158, 171, 0.16)',
      color: '#637381',
    },
    active: {
      bgcolor: 'rgba(0, 167, 111, 0.16)',
      color: '#007867',
    },
    inactive: {
      bgcolor: 'rgba(145, 158, 171, 0.16)',
      color: '#637381',
    },
    completed: {
      bgcolor: 'rgba(34, 197, 94, 0.16)',
      color: '#118d57',
    },
    incomplete: {
      bgcolor: 'rgba(255, 86, 48, 0.16)',
      color: '#b71d18',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        minWidth: 24,
        px: 0.75,
        py: 0,
        borderRadius: 0.75,
        bgcolor: styles.bgcolor,
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          lineHeight: '20px',
          color: styles.color,
          textAlign: 'center',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

