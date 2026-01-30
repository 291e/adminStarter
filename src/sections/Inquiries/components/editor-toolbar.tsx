import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function InquiryEditorToolbar() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      spacing={0.5}
      sx={{
        p: 1,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <Select
        size="small"
        value="Heading 1"
        sx={{
          height: 32,
          typography: 'body2',
          '& .MuiSelect-select': { py: 0.5, px: 1 },
          '& fieldset': { border: 'none' },
          bgcolor: 'grey.100',
          borderRadius: 1,
          mr: 1,
        }}
      >
        <MenuItem value="Heading 1">Heading 1</MenuItem>
        <MenuItem value="Heading 2">Heading 2</MenuItem>
        <MenuItem value="Paragraph">Paragraph</MenuItem>
      </Select>

      <IconButton size="small">
        <Iconify icon={'solar:text-bold-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:text-strikethrough-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:text-italic-bold' as any} width={18} />
      </IconButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, my: 'auto' }} />

      <IconButton size="small">
        <Iconify icon={'solar:list-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:list-number-bold' as any} width={18} />
      </IconButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, my: 'auto' }} />

      <IconButton size="small">
        <Iconify icon={'solar:align-left-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:align-center-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:align-right-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:align-horizontal-spacing-bold' as any} width={18} />
      </IconButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, my: 'auto' }} />

      <IconButton size="small">
        <Iconify icon={'solar:link-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:link-broken-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:gallery-bold' as any} width={18} />
      </IconButton>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, my: 'auto' }} />

      <IconButton size="small">
        <Iconify icon={'solar:undo-left-round-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:eraser-bold' as any} width={18} />
      </IconButton>
      <IconButton size="small">
        <Iconify icon={'solar:maximize-bold' as any} width={18} />
      </IconButton>
    </Stack>
  );
}
