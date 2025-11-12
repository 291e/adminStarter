import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

type Props = {
  value: 'all' | 'public' | 'private';
  onChange: (value: 'all' | 'public' | 'private') => void;
  countAll: number;
  countPublic: number;
  countPrivate: number;
};

export default function SharedDocumentTabs({
  value,
  onChange,
  countAll,
  countPublic,
  countPrivate,
}: Props) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v as 'all' | 'public' | 'private')}
      sx={{ px: 3 }}
    >
      <Tab
        value="all"
        label={
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 0 }}>
            <span>전체</span>
            <Chip
              label={countAll}
              size="small"
              sx={{
                bgcolor: 'text.primary',
                color: 'common.white',
                fontSize: 12,
                fontWeight: 700,
                height: 24,
                minWidth: 24,
              }}
            />
          </Stack>
        }
        sx={{
          minHeight: 48,
          fontSize: 14,
          fontWeight: value === 'all' ? 600 : 500,
        }}
      />
      <Tab
        value="public"
        label={
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 0 }}>
            <span>공개</span>
            <Chip
              label={countPublic}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 167, 111, 0.16)',
                color: '#007867',
                fontSize: 12,
                fontWeight: 700,
                height: 24,
                minWidth: 24,
              }}
            />
          </Stack>
        }
        sx={{
          minHeight: 48,
          fontSize: 14,
          fontWeight: value === 'public' ? 600 : 500,
        }}
      />
      <Tab
        value="private"
        label={
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 0 }}>
            <span>비공개</span>
            <Chip
              label={countPrivate}
              size="small"
              sx={{
                bgcolor: 'rgba(145, 158, 171, 0.16)',
                color: 'text.secondary',
                fontSize: 12,
                fontWeight: 700,
                height: 24,
                minWidth: 24,
              }}
            />
          </Stack>
        }
        sx={{
          minHeight: 48,
          fontSize: 14,
          fontWeight: value === 'private' ? 600 : 500,
        }}
      />
    </Tabs>
  );
}
