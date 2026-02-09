import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Plan = {
  serviceSettingIdx: number;
  planName: string;
  price: number;
  icon: string;
  isSubscribed: boolean;
  memberCount: number;
};

type ServicePlanCardProps = {
  plan: Plan;
  isSelected: boolean;
  onClick: () => void;
  formatPrice: (price: number) => string;
};

export function ServicePlanCard({ plan, isSelected, onClick, formatPrice }: ServicePlanCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        flex: '1 1 auto',
        position: 'relative',
        border: plan.isSubscribed ? '2px solid' : isSelected ? '2px solid' : '1px solid',
        borderColor: plan.isSubscribed ? 'primary.main' : isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
        boxShadow: plan.isSubscribed || isSelected ? (theme) => theme.customShadows.card : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.card,
          transform: 'translateY(-2px)',
          bgcolor: isSelected ? 'primary.lighter' : 'grey.50',
        },
      }}
    >
      {plan.isSubscribed && (
        <Chip
          label="구독중"
          size="small"
          color="info"
          variant="soft"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        />
      )}
      <CardContent>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: plan.isSubscribed ? 'primary.lighter' : 'grey.100',
            }}
          >
            <Iconify
              icon={(plan.icon || 'solar:card-bold') as any}
              width={32}
              sx={{ color: plan.isSubscribed ? 'primary.main' : 'text.secondary' }}
            />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {plan.planName}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 400 }}>
            {plan.memberCount}인 미만
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatPrice(plan.price)}원
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
