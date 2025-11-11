import React, { type ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import SubHeaderButton from '../../button/sub-header-button';

// ----------------------------------------------------------------------

type SubHeaderButtonItem = {
  label: string;
  variant?: 'default' | 'primary';
  onClick?: () => void;
  disabled?: boolean;
};

type Props = {
  title?: ReactNode;
  buttons?: SubHeaderButtonItem[];
  onBack?: () => void;
  sx?: SxProps<Theme>;
};

/**
 * SubHeader 컴포넌트
 * 페이지 상단에 표시되는 헤더로, 뒤로가기 버튼, 제목과 액션 버튼들을 포함합니다.
 */
export default function SubHeader({ title, buttons = [], onBack, sx }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        ...sx,
      }}
    >
      {/* 뒤로가기 버튼 */}
      {onBack && (
        <IconButton
          size="small"
          onClick={onBack}
          sx={{
            width: 36,
            height: 36,
            minWidth: 36,
            flexShrink: 0,
          }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={20} />
        </IconButton>
      )}

      {/* 제목 영역 */}
      {title && (
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {typeof title === 'string' ? (
            <Box
              component="h2"
              sx={{
                m: 0,
                fontSize: 20,
                fontWeight: 700,
                lineHeight: '28px',
                color: 'text.primary',
              }}
            >
              {title}
            </Box>
          ) : (
            title
          )}
        </Box>
      )}

      {/* 버튼 영역 */}
      {buttons.length > 0 && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            flexShrink: 0,
            ml: title ? 2 : 0,
          }}
        >
          {buttons.map((button, index) => (
            <SubHeaderButton
              key={index}
              variant={button.variant || 'default'}
              onClick={button.onClick}
              disabled={button.disabled}
            >
              {button.label}
            </SubHeaderButton>
          ))}
        </Stack>
      )}
    </Box>
  );
}
