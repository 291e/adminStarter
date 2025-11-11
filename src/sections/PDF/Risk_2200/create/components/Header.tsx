import Box from '@mui/material/Box';

import SubHeader from 'src/components/safeyoui/header/subHeader';

// ----------------------------------------------------------------------

type Props = {
  onBack?: () => void;
  onSampleView?: () => void;
  title?: string;
};

export default function CreateHeader({ onBack, onSampleView, title }: Props) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1320,
      }}
    >
      <SubHeader
        onBack={onBack}
        title={
          <Box
            component="h4"
            sx={{
              m: 0,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: '36px',
              color: 'text.primary',
            }}
          >
            {title || '문서 등록'}
          </Box>
        }
        buttons={
          onSampleView
            ? [
                {
                  label: '샘플 보기',
                  variant: 'primary',
                  onClick: onSampleView,
                },
              ]
            : []
        }
      />
    </Box>
  );
}
