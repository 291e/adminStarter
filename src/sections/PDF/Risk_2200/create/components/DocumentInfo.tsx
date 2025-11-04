import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

type Props = {
  documentNumber?: string;
  writerIp?: string;
  documentDate: Dayjs | null;
  approvalDeadline: Dayjs | null;
  onDocumentDateChange?: (date: Dayjs | null) => void;
  onApprovalDeadlineChange?: (date: Dayjs | null) => void;
};

export default function DocumentInfo({
  documentNumber,
  writerIp,
  documentDate,
  approvalDeadline,
  onDocumentDateChange,
  onApprovalDeadlineChange,
}: Props) {
  return (
    <Box
      sx={{
        bgcolor: 'background.neutral',
        p: 3,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* 문서번호, 작성 IP */}
      <Box sx={{ display: 'flex', gap: 5 }}>
        <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              width: 100,
            }}
          >
            문서번호
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '22px',
            }}
          >
            {documentNumber || '등록 시 자동으로 부여 됩니다.'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              width: 100,
            }}
          >
            작성 IP
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '22px',
            }}
          >
            {writerIp || '168.126.222.111'}
          </Typography>
        </Box>
      </Box>

      {/* 문서 작성일, 결재 마감일 */}
      <Box sx={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
        <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center', minHeight: 48 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              width: 100,
            }}
          >
            문서 작성일
          </Typography>
          <DatePicker
            value={documentDate}
            onChange={(newValue) => onDocumentDateChange?.(newValue)}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center', minHeight: 48 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              width: 100,
            }}
          >
            결재 마감일
          </Typography>
          <DatePicker
            value={approvalDeadline}
            onChange={(newValue) => onApprovalDeadlineChange?.(newValue)}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>
    </Box>
  );
}

