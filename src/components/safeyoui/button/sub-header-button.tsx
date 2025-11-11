import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type SubHeaderButtonProps = Omit<ButtonProps, 'variant'> & {
  variant?: 'default' | 'primary';
};

/**
 * SubHeader에서 사용하는 버튼 컴포넌트
 * - 높이: 36px
 * - border-radius: 8px
 * - 폰트: Pretendard Bold, 14px, line-height: 24px
 */
export default function SubHeaderButton({
  variant = 'default',
  children,
  sx,
  ...other
}: SubHeaderButtonProps) {
  return (
    <Button
      variant="contained"
      size="medium"
      sx={{
        minHeight: 36,
        height: 36,
        borderRadius: 1,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '24px',
        px: 1.5,
        bgcolor: variant === 'primary' ? '#2563E9' : '#1c252e',
        color: '#ffffff',
        '&:hover': {
          bgcolor: variant === 'primary' ? '#1d4ed8' : '#2a3441',
        },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Button>
  );
}

