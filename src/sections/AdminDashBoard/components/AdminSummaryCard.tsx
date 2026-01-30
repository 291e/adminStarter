import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fShortenNumber } from '../../../utils/format-number';

// ----------------------------------------------------------------------

type AdminSummaryCardProps = {
  title: string;
  total: number | string;
  icon?: React.ReactNode;
  unit?: string;
  color?: 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success';
};

export default function AdminSummaryCard({
  title,
  total,
  icon,
  unit,
  color = 'primary',
}: AdminSummaryCardProps) {
  const theme = useTheme();

  const renderTotal = typeof total === 'number' ? fShortenNumber(total) : total;

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <Typography variant="h3">{renderTotal}</Typography>
          {unit && (
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', ml: 0.5 }}>
              {unit}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width: 64,
          height: 64,
          lineHeight: 0,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette[color].main, 0.08),
          color: theme.palette[color].main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}
