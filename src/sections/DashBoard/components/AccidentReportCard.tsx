import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type StatCardProps = {
  icon: string;
  title: string;
  count: number;
  onNavigate?: () => void;
};

function StatCard({ icon, title, count, onNavigate }: StatCardProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 },
        flex: 1,
        width: '100%',
        maxWidth: 314,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2.5 },
          flex: '1 1 auto',
          minWidth: 0,
          maxWidth: 150,
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: { xs: 48, sm: 56, md: 64 },
            height: { xs: 48, sm: 56, md: 64 },
            borderRadius: '50%',
            bgcolor: '#eef3fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <Iconify
            icon={icon as any}
            width={28}
            sx={{
              color: '#2563E9',
              width: { xs: 20, sm: 24, md: 28 },
              height: { xs: 20, sm: 24, md: 28 },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 40, flex: 1, width: '100%' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: 14, sm: 15, md: 16 },
              lineHeight: { xs: '20px', sm: '22px', md: '24px' },
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: { xs: 13, sm: 14 },
              lineHeight: { xs: '20px', sm: '24px' },
            }}
          >
            {count}건
          </Typography>
        </Box>
      </Box>
      <div>
        <Button
          variant="outlined"
          size="small"
          onClick={onNavigate}
          sx={{
            minHeight: 36,
            fontSize: { xs: 12, sm: 14 },
            fontWeight: 700,
            px: 1.5,
            borderColor: '#2563E9',
            color: '#2563E9',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            minWidth: 73,
            '&:hover': {
              borderColor: '#2563E9',
              bgcolor: 'rgba(37, 99, 233, 0.04)',
            },
          }}
        >
          바로가기
        </Button>
      </div>
    </Box>
  );
}

type PeriodType = 'year' | 'month' | 'week';

type Props = {
  periodType: PeriodType;
  periodValue: string;
  accidentCount: number;
  riskCount: number;
  onPeriodTypeChange?: (type: PeriodType) => void;
  onPeriodValueChange?: (value: string) => void;
  onAccidentNavigate?: () => void;
  onRiskNavigate?: () => void;
};

export default function AccidentReportCard({
  periodType,
  periodValue,
  accidentCount,
  riskCount,
  onPeriodTypeChange,
  onPeriodValueChange,
  onAccidentNavigate,
  onRiskNavigate,
}: Props) {
  const navigate = useNavigate();
  // 현재 연도 및 주차 계산
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 주차 계산 함수
  const getWeekOfYear = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const currentWeek = getWeekOfYear(new Date());

  // 기본값 설정
  const getDefaultValue = () => {
    switch (periodType) {
      case 'year':
        return `${currentYear}년`;
      case 'month':
        return `${currentMonth}월`;
      case 'week':
        return `${currentWeek}주차`;
      default:
        return '';
    }
  };

  const displayValue = periodValue || getDefaultValue();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2.5,
        p: { xs: 2, sm: 2.5 },
        pb: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
        height: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: 1.5,
          pr: 2,
          py: 3,
          minHeight: 80,
          width: '100%',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: 24, sm: 28, md: 32 },
              fontWeight: 700,
              lineHeight: { xs: '32px', sm: '40px', md: '48px' },
              color: '#2563E9',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {displayValue}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 18, sm: 20 },
              lineHeight: { xs: '26px', sm: '30px' },
              whiteSpace: 'nowrap',
            }}
          >
            사고·위험 보고 현황
          </Typography>
        </Box>
        <FormControl
          size="small"
          sx={{
            minWidth: 64,
            flexShrink: 0,
          }}
        >
          <Select
            value={periodType}
            onChange={(e) => {
              const newType = e.target.value as PeriodType;
              onPeriodTypeChange?.(newType);
              // 기준 변경 시 기본값으로 설정
              let defaultValue = '';
              if (newType === 'year') {
                defaultValue = `${currentYear}년`;
              } else if (newType === 'month') {
                defaultValue = `${currentMonth}월`;
              } else if (newType === 'week') {
                defaultValue = `${currentWeek}주차`;
              }
              onPeriodValueChange?.(defaultValue);
            }}
            sx={{
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'rgba(145, 158, 171, 0.24)',
              '& .MuiSelect-select': {
                py: 0.75,
                px: 1.5,
                fontSize: 14,
                fontWeight: 600,
              },
            }}
            IconComponent={() => (
              <Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ mr: 1 }} />
            )}
          >
            <MenuItem value="year">년</MenuItem>
            <MenuItem value="month">월</MenuItem>
            <MenuItem value="week">주</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 통계 카드들 */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          width: '100%',
          minWidth: 0,
          gap: 1.5,
        }}
      >
        <StatCard
          icon="material-symbols:mobile-chat-rounded"
          title="사고 발생"
          count={accidentCount}
          onNavigate={() => {
            // 채팅 페이지의 "사고 발생 현황" 채팅방으로 이동
            navigate(`${paths.dashboard.operation.chat}?roomId=emergency`);
            onAccidentNavigate?.();
          }}
        />
        <StatCard
          icon="solar:danger-triangle-bold"
          title="위험 보고"
          count={riskCount}
          onNavigate={() => {
            // 현장 운영 관리 - 위험 보고 페이지로 이동
            navigate(paths.dashboard.operation.riskReport);
            onRiskNavigate?.();
          }}
        />
      </Box>
    </Box>
  );
}
