import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
  month: number;
  count: number;
};

export default function EmergencyStatsHeader({ month, count }: Props) {
  return (
    <Box
      sx={{
        height: 40,
        maxHeight: 40,
        bgcolor: '#F26221',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, lg: 2.5 },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'white',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {month}월 발생 건수 {count}
      </Typography>
    </Box>
  );
}


