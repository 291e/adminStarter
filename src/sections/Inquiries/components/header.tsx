import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  onBack: () => void;
};

export default function InquiryHeader({ title, onBack }: Props) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
      <IconButton onClick={onBack} sx={{ p: 0.5 }}>
        <Iconify icon={'solar:alt-arrow-left-bold' as any} width={24} />
      </IconButton>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
  );
}
