import type { Dayjs } from 'dayjs';
import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { Iconify } from 'src/components/iconify';
import SubHeaderButton from '../../button/sub-header-button';

// ----------------------------------------------------------------------

type PaperHeaderVariant = 'default' | 'notification';

type PaperHeaderProps = {
  variant?: PaperHeaderVariant;
  // 기본 필드
  documentNumber?: string;
  writerIp?: string;
  documentDate?: Dayjs | null;
  approvalDeadline?: Dayjs | null;
  onDocumentDateChange?: (date: Dayjs | null) => void;
  onApprovalDeadlineChange?: (date: Dayjs | null) => void;
  // 알림톡 variant 필드
  registeredDate?: string;
  modifiedDate?: string;
  // 알림톡 variant 버튼
  onSendNotification?: () => void;
  sx?: SxProps<Theme>;
};

/**
 * PaperHeader 컴포넌트
 * 문서 정보를 표시하는 헤더 컴포넌트
 * - 배경: #f4f6f8
 * - 패딩: 24px
 * - 최대 너비: 1320px
 */
export default function PaperHeader({
  variant = 'default',
  documentNumber,
  writerIp,
  documentDate,
  approvalDeadline,
  onDocumentDateChange,
  onApprovalDeadlineChange,
  registeredDate,
  modifiedDate,
  onSendNotification,
  sx,
}: PaperHeaderProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          bgcolor: '#f4f6f8',
          p: 3,
          width: '100%',
          maxWidth: 1320,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'flex-end',
          ...sx,
        }}
      >
        {/* 첫 번째 행 */}
        <Stack direction="row" spacing={5} sx={{ width: '100%' }}>
          {variant === 'notification' ? (
            <>
              {/* 등록일 */}
              <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    width: 100,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '22px',
                    color: 'text.primary',
                    flexShrink: 0,
                  }}
                >
                  등록일
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.primary',
                  }}
                >
                  {registeredDate || '-'}
                </Typography>
              </Box>
              {/* 수정일 */}
              <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    width: 100,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '22px',
                    color: 'text.primary',
                    flexShrink: 0,
                  }}
                >
                  수정일
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.primary',
                  }}
                >
                  {modifiedDate || '-'}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              {/* 문서번호 */}
              <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    width: 100,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '22px',
                    color: 'text.primary',
                    flexShrink: 0,
                  }}
                >
                  문서번호
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.primary',
                  }}
                >
                  {documentNumber || '등록 시 자동으로 부여 됩니다.'}
                </Typography>
              </Box>
              {/* 작성 IP */}
              <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    width: 100,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '22px',
                    color: 'text.primary',
                    flexShrink: 0,
                  }}
                >
                  작성 IP
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.primary',
                  }}
                >
                  {writerIp || '-'}
                </Typography>
              </Box>
            </>
          )}
        </Stack>

        {/* 알림톡 variant의 두 번째 행 (문서번호, 작성 IP) */}
        {variant === 'notification' && (
          <Stack direction="row" spacing={5} sx={{ width: '100%' }}>
            {/* 문서번호 */}
            <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  width: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '22px',
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                문서번호
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: 'text.primary',
                }}
              >
                {documentNumber || '-'}
              </Typography>
            </Box>
            {/* 작성 IP */}
            <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  width: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '22px',
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                작성 IP
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: 'text.primary',
                }}
              >
                {writerIp || '-'}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* 세 번째 행 (문서 작성일, 결재 마감일) */}
        <Stack direction="row" spacing={5} sx={{ width: '100%' }}>
          {/* 문서 작성일 */}
          <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center', height: 48 }}>
            <Typography
              variant="subtitle2"
              sx={{
                width: 100,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
                flexShrink: 0,
              }}
            >
              문서 작성일
            </Typography>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                value={documentDate}
                onChange={onDocumentDateChange}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        height: 40,
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    },
                  },
                }}
                slots={{
                  openPickerIcon: () => <Iconify icon="solar:calendar-date-bold" width={24} />,
                }}
              />
            </Box>
          </Box>
          {/* 결재 마감일 */}
          <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center', height: 48 }}>
            <Typography
              variant="subtitle2"
              sx={{
                width: 100,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
                flexShrink: 0,
              }}
            >
              결재 마감일
            </Typography>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                value={approvalDeadline}
                onChange={onApprovalDeadlineChange}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        height: 40,
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    },
                  },
                }}
                slots={{
                  openPickerIcon: () => <Iconify icon="solar:calendar-date-bold" width={24} />,
                }}
              />
            </Box>
          </Box>
        </Stack>

        {/* 알림톡 variant의 알림 보내기 버튼 */}
        {variant === 'notification' && onSendNotification && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <SubHeaderButton
              variant="primary"
              onClick={onSendNotification}
              sx={{
                minHeight: 30,
                height: 30,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: '22px',
                px: 1,
                py: 0.5,
              }}
            >
              알림 보내기
            </SubHeaderButton>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}
