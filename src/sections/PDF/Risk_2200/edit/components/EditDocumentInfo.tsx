import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

type Props = {
  documentNumber?: string;
  writerIp?: string;
  registeredAt?: string;
  modifiedAt?: string;
  documentWrittenAt: Dayjs | null;
  approvalDeadline: Dayjs | null;
  onDocumentWrittenAtChange: (date: Dayjs | null) => void;
  onApprovalDeadlineChange: (date: Dayjs | null) => void;
  onSendNotification?: () => void;
};

export default function EditDocumentInfo({
  documentNumber,
  writerIp,
  registeredAt,
  modifiedAt,
  documentWrittenAt,
  approvalDeadline,
  onDocumentWrittenAtChange,
  onApprovalDeadlineChange,
  onSendNotification,
}: Props) {
  return (
    <Box
      sx={{
        bgcolor: 'grey.100',
        p: 3,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* 첫 번째 행: 등록일, 수정일 */}
      <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
            등록일
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {registeredAt || '-'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
            수정일
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {modifiedAt || '-'}
          </Typography>
        </Box>
      </Box>

      {/* 두 번째 행: 문서번호, 작성 IP */}
      <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
            문서번호
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {documentNumber || '-'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
            작성 IP
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {writerIp || '-'}
          </Typography>
        </Box>
      </Box>

      {/* 세 번째 행: 문서 작성일, 결재 마감일, 알림 보내기 버튼 */}
      <Box sx={{ display: 'flex', gap: 5, width: '100%', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
            문서 작성일
          </Typography>
          <DatePicker
            value={documentWrittenAt}
            onChange={onDocumentWrittenAtChange}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  },
                },
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
            결재 마감일
          </Typography>
          <DatePicker
            value={approvalDeadline}
            onChange={onApprovalDeadlineChange}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  },
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
