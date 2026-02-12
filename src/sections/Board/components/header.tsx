import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  onBack: () => void;
};

export default function BoardHeader({ title, onBack }: Props) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
      <IconButton onClick={onBack} sx={{ p: 0 }}>
        <Iconify icon="eva:arrow-ios-back-fill" width={24} />
      </IconButton>
      <Typography variant="h4">{title}</Typography>
    </Stack>
  );
}
