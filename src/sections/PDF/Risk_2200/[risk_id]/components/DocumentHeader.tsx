import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import ApprovalSection from './ApprovalSection';

// ----------------------------------------------------------------------

type Props = {
  formattedDate: string;
  onAddSignature?: () => void;
  title?: string; // 커스텀 제목
  approvalVariant?: 'default' | 'four'; // 결재 테이블 형태
  riskId?: string; // 문서 ID
};

export default function DocumentHeader({
  formattedDate,
  onAddSignature,
  title,
  approvalVariant = 'default',
  riskId,
}: Props) {
  const displayTitle = title || '위험요인 제거·대체 및 통제 등록';

  return (
    <Box
      component="div"
      sx={{
        width: '100%',
        maxWidth: 1240,
        height: 132,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        mb: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.625,
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: 32,
            fontWeight: 700,
            lineHeight: '48px',
            color: 'text.primary',
          }}
        >
          {displayTitle}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: '28px',
            color: 'text.primary',
          }}
        >
          작성일 : {formattedDate}
        </Typography>
      </Box>

      <ApprovalSection
        onAddSignature={onAddSignature}
        is2100Series={approvalVariant === 'four'}
        riskId={riskId}
      />
    </Box>
  );
}
