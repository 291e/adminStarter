import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, styled } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

const StyledChartContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .apexcharts-canvas': {
    margin: '0 auto',
  },
}));

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
};

export default function AdminSubscriptionChart({ title, subheader, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = [
    theme.palette.primary.dark,
    theme.palette.primary.main,
    theme.palette.primary.light,
  ];

  const series = [
    { label: '안전해YOU 스타터', value: 450 },
    { label: '안전해YOU 라이트', value: 350 },
    { label: '안전해YOU 스탠다드', value: 200 },
  ];

  const chartOptions = useChart({
    colors: chartColors,
    labels: series.map((i) => i.label),
    stroke: {
      show: false,
    },
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '85%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '전체',
              formatter: () => `${series.reduce((acc, i) => acc + i.value, 0).toLocaleString()} 개`,
            },
          },
        },
      },
    },
    tooltip: {
      theme: 'light',
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
  });

  return (
    <Card sx={{ height: 1, ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button
            size="small"
            color="inherit"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}
            sx={{
              bgcolor: 'grey.100',
              borderRadius: 1,
              px: 1.5,
              '&:hover': { bgcolor: 'grey.200' },
            }}
          >
            서비스 관리
          </Button>
        }
      />

      <StyledChartContainer>
        <Chart
          type="donut"
          series={series.map((i) => i.value)}
          options={chartOptions}
          sx={{ width: 300, height: 300, mx: 'auto' }}
        />

        <ChartLegends
          colors={chartOptions?.colors || []}
          labels={chartOptions?.labels || []}
          values={series.map(
            (i) =>
              `${Math.round((i.value / series.reduce((acc, val) => acc + val.value, 0)) * 100)}%`
          )}
          sx={{
            mt: 3,
            width: 1,
            justifyContent: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        />
      </StyledChartContainer>
    </Card>
  );
}
