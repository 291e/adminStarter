import type { CardProps } from '@mui/material/Card';

import { useState, useCallback } from 'react';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
};

export default function AdminSalesChart({ title, subheader, sx, ...other }: Props) {
  const theme = useTheme();

  const [seriesData, setSeriesData] = useState('월');

  const popover = usePopover();

  const chartOptions = useChart({
    colors: [theme.palette.warning.main, theme.palette.warning.dark],
    chart: {
      stacked: false,
    },
    stroke: {
      width: [0, 3],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        columnWidth: '20%',
        borderRadius: 4,
      },
    },
    fill: {
      type: ['solid', 'solid'],
    },
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    xaxis: {
      type: 'category',
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: theme.palette.warning.dark,
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: false },
      y: {
        formatter: (value: number) => {
          if (typeof value !== 'undefined') {
            return value.toFixed(0);
          }
          return value;
        },
      },
    },
    legend: {
      show: false,
    },
  });

  const series = [
    {
      name: '매출액',
      type: 'column',
      data: [65, 35, 42, 65, 55, 92],
    },
    {
      name: '구독',
      type: 'line',
      data: [65, 20, 20, 20, 20, 62],
    },
  ];

  const handleChangeSeries = useCallback(
    (newValue: string) => {
      popover.onClose();
      setSeriesData(newValue);
    },
    [popover]
  );

  return (
    <Card sx={{ height: 1, ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            onClick={popover.onOpen}
            endIcon={
              <Iconify
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
              />
            }
            sx={{ borderRadius: 1 }}
          >
            {seriesData}
          </Button>
        }
      />

      <Box sx={{ mt: 3, mx: 3, display: 'flex', gap: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main', mr: 1 }}
            />
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              매출액
            </Typography>
          </Box>
          <Typography variant="h4">{fCurrency(56315000)}</Typography>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.dark', mr: 1 }}
            />
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              구독
            </Typography>
          </Box>
          <Typography variant="h4">{fNumber(1000)}건</Typography>
        </Box>
      </Box>

      <Chart
        type="line"
        series={series}
        options={chartOptions}
        sx={{ py: 2, px: 1, height: 320 }}
      />

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {['주', '월', '년'].map((option) => (
          <MenuItem
            key={option}
            selected={option === seriesData}
            onClick={() => handleChangeSeries(option)}
          >
            {option}
          </MenuItem>
        ))}
      </CustomPopover>
    </Card>
  );
}
