import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type DialogBtnProps = Omit<ButtonProps, 'variant'> & {
  variant?: 'outlined' | 'contained';
};

/**
 * Dialog에서 사용하는 버튼 컴포넌트
 * - 높이: 36px
 * - border-radius: 8px
 * - 폰트: Pretendard Bold, 14px, line-height: 24px
 * - outlined: 테두리만 있는 버튼 (취소, 닫기, 초기화)
 * - contained: 배경이 있는 버튼 (확인, 등록, 저장, 발송 등)
 */
export default function DialogBtn({
  variant = 'contained',
  children,
  sx,
  ...other
}: DialogBtnProps) {
  return (
    <Button
      variant={variant}
      size="medium"
      sx={{
        minHeight: 36,
        height: 36,
        minWidth: 64,
        borderRadius: 1,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '24px',
        px: variant === 'outlined' ? 1 : 1.5,
        py: 0.75,
        ...(variant === 'contained'
          ? {
              bgcolor: '#1c252e',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#2a3441',
              },
            }
          : {
              borderColor: 'rgba(145, 158, 171, 0.32)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'rgba(145, 158, 171, 0.48)',
                bgcolor: 'action.hover',
              },
            }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Button>
  );
}

