import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import type {
  SafetySystem,
  SafetySystemItem,
} from 'src/services/safety-system/safety-system.types';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

// 주기 단위 라벨
const cycleUnitLabels: Record<string, string> = {
  YEAR: '년',
  IMMEDIATE: '즉시',
  HALF: '반기',
  QUARTER: '분기',
  DAY: '일',
  WEEK: '주',
  ALWAYS: '상시',
};

// 상태 라벨
const statusLabels: Record<string, string> = {
  NORMAL: '정상',
  ALWAYS: '상시 작성',
  APPROACHING: '기한 임박',
  OVERDUE: '기한 초과',
};

type Props = {
  rows: SafetySystem[];
  onViewGuide?: (system: SafetySystem, item?: SafetySystemItem) => void;
  onNavigate?: (system: SafetySystem, item?: SafetySystemItem) => void;
};

function getStatusColor(status: SafetySystemItem['status']): {
  bgcolor: string;
  color: string;
} {
  switch (status) {
    case 'NORMAL':
      return {
        bgcolor: 'rgba(0, 184, 217, 0.16)',
        color: '#006c9c',
      };
    case 'ALWAYS':
      return {
        bgcolor: 'rgba(145, 158, 171, 0.16)',
        color: '#637381',
      };
    case 'APPROACHING':
      return {
        bgcolor: 'rgba(255, 171, 0, 0.16)',
        color: '#b76e00',
      };
    case 'OVERDUE':
      return {
        bgcolor: 'rgba(255, 86, 48, 0.16)',
        color: '#b71d18',
      };
    default:
      return {
        bgcolor: 'rgba(145, 158, 171, 0.16)',
        color: '#637381',
      };
  }
}

function RowItem({
  item,
  itemIndex,
  onViewGuide,
  onNavigate,
}: {
  item: SafetySystemItem;
  itemIndex: number;
  onViewGuide?: () => void;
  onNavigate?: () => void;
}) {
  const statusColors = getStatusColor(item.status);
  const itemName = item.itemName || item.documentName || '';
  const plainName = itemName.replace(/^\d+-\d+\.\s*/, '');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.75,
        minWidth: 1320,
        bgcolor: 'white',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'grey.50',
        },
        transition: 'background-color 0.2s ease',
      }}
      onClick={() => {
        onNavigate?.();
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          pr: 1,
          pl: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14, height: 22, lineHeight: '22px' }}>
          {`${item.safetyIdx}-${item.itemNumber} ${plainName}`}
        </Typography>
        <IconButton
          size="small"
          sx={{
            width: 20,
            height: 20,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Iconify icon="carbon:chevron-right" width={16} />
        </IconButton>
      </Box>
      <Box
        sx={{
          width: 96,
          fontSize: 14,
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {item.documentCount ?? item.documentList?.length ?? 0}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 94,
          fontSize: 14,
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {cycleUnitLabels[item.cycleUnit] || item.writingCycle || item.cycleUnit}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 148,
          fontSize: 14,
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {fDateTime(item.lastWrittenAt, 'YYYY-MM-DD')}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pl: 2,
        }}
      >
        <Chip
          label={statusLabels[item.status] || item.status}
          size="small"
          sx={{
            bgcolor: statusColors.bgcolor,
            color: statusColors.color,
            fontWeight: 700,
            fontSize: 12,
            height: 24,
          }}
        />
      </Box>
      <Box
        sx={{
          width: 120,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pl: 2,
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onViewGuide?.();
          }}
          disabled={!item.guide}
          aria-label="가이드 보기"
          sx={{
            p: 1,
            color: item.guide ? 'text.secondary' : 'text.disabled',
            '&:hover': {
              bgcolor: item.guide ? 'action.hover' : 'transparent',
            },
          }}
        >
          <Iconify icon={item.guide ? 'solar:eye-bold' : 'solar:close-circle-bold'} width={20} />
        </IconButton>
      </Box>
    </Box>
  );
}

function Row({
  row,
  onViewGuide,
  onNavigate,
}: {
  row: SafetySystem;
  onViewGuide?: Props['onViewGuide'];
  onNavigate?: Props['onNavigate'];
}) {
  return (
    <>
      <TableRow
        sx={{
          borderBottom: '1px dashed',
          borderColor: 'divider',
          '& > td': {
            borderBottom: '1px dashed',
            borderColor: 'divider',
          },
        }}
      >
        <TableCell
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 14,
            fontWeight: 600,
            px: 2,
          }}
        >
          <Typography variant="subtitle2" component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
            {`${row.safetyIdx}. ${row.systemName}`}
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          sx={{
            width: 96,
            fontSize: 14,
            px: 2,
          }}
        />
        <TableCell
          align="center"
          sx={{
            width: 94,
            fontSize: 14,
            px: 2,
          }}
        />
        <TableCell
          align="center"
          sx={{
            width: 148,
            fontSize: 14,
            px: 2,
          }}
        />
        <TableCell
          align="center"
          sx={{
            width: 100,
            px: 2,
          }}
        />
        <TableCell align="center" sx={{ width: 120, px: 2 }}>
          <IconButton
            size="small"
            onClick={() => {
              onViewGuide?.(row);
            }}
            disabled={!row.guide}
            aria-label="가이드 보기"
            sx={{
              p: 1,
              color: row.guide ? 'text.secondary' : 'text.disabled',
              '&:hover': {
                bgcolor: row.guide ? 'action.hover' : 'transparent',
              },
            }}
          >
            <Iconify icon={row.guide ? 'solar:eye-bold' : 'solar:close-circle-bold'} width={20} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, borderBottom: 'none' }}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, bgcolor: 'grey.100', p: 1 }}
          >
            {(row.items || []).map((item, idx) => (
              <RowItem
                key={`${item.safetyIdx}-${item.itemNumber}`}
                item={item}
                itemIndex={idx}
                onViewGuide={() => onViewGuide?.(row, item)}
                onNavigate={() => onNavigate?.(row, item)}
              />
            ))}
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function SafetySystemTable({ rows, onViewGuide, onNavigate }: Props) {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1320 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                flex: 1,
                minWidth: 0,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              문서명
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 96,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
                px: 2,
              }}
            >
              문서 개수
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 94,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
                px: 2,
              }}
            >
              작성 주기
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 148,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
                px: 2,
              }}
            >
              최근 작성일
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 100,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
                px: 2,
              }}
            >
              상태
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 120,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
                px: 2,
              }}
            >
              가이드
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <Row
              key={`safety-${row.safetyIdx}`}
              row={row}
              onViewGuide={onViewGuide}
              onNavigate={onNavigate}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
