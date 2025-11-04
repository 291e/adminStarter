import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import type { SafetySystem, SafetySystemItem } from 'src/_mock/_safety-system';
import { cycleUnitLabels, statusLabels } from 'src/_mock/_safety-system';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: SafetySystem[];
  onViewGuide?: (system: SafetySystem, item?: SafetySystemItem) => void;
};

function getStatusColor(status: SafetySystemItem['status']): {
  bgcolor: string;
  color: string;
} {
  switch (status) {
    case 'normal':
      return {
        bgcolor: 'rgba(0, 184, 217, 0.16)',
        color: '#006c9c',
      };
    case 'always':
      return {
        bgcolor: 'rgba(145, 158, 171, 0.16)',
        color: '#637381',
      };
    case 'approaching':
      return {
        bgcolor: 'rgba(255, 171, 0, 0.16)',
        color: '#b76e00',
      };
    case 'overdue':
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
}: {
  item: SafetySystemItem;
  itemIndex: number;
  onViewGuide?: () => void;
}) {
  const statusColors = getStatusColor(item.status);
  const plainName = item.documentName.replace(/^\d+-\d+\.\s*/, '');

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        pl: 1.5,
        pr: 2,
        py: 1.5,
        minWidth: 1320,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14, height: 22, lineHeight: '22px' }}>
          {`${item.safetyIdx}-${item.itemNumber}. ${plainName}`}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 96,
          fontSize: 14,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {item.documentCount}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 104,
          fontSize: 14,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {item.cycle}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 14 }}>
          {cycleUnitLabels[item.cycleUnit]}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 148,
          fontSize: 14,
          px: 2,
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
          width: 84,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
        }}
      >
        <Chip
          label={statusLabels[item.status]}
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
          px: 2,
        }}
      >
        <IconButton size="small" onClick={onViewGuide} aria-label="가이드 보기" sx={{ p: 1 }}>
          <Iconify icon="solar:eye-bold" width={20} />
        </IconButton>
      </Box>
    </Box>
  );
}

function Row({ row, onViewGuide }: { row: SafetySystem; onViewGuide?: Props['onViewGuide'] }) {
  const [open, setOpen] = useState(false);

  const totalDocuments = row.items.reduce((sum, item) => sum + item.documentCount, 0);

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{
          cursor: 'pointer',
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
          }}
        >
          <Typography variant="subtitle2" component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
            {row.systemName}
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          sx={{
            width: 96,
            fontSize: 14,
            pr: 3,
          }}
        >
          {totalDocuments}
        </TableCell>
        <TableCell
          align="center"
          sx={{
            width: 104,
            fontSize: 14,
            pr: 3,
          }}
        />
        <TableCell
          align="center"
          sx={{
            width: 148,
            fontSize: 14,
            pr: 3,
          }}
        />
        <TableCell
          align="center"
          sx={{
            width: 84,
            pr: 3,
          }}
        />
        <TableCell align="center" sx={{ width: 120, pr: 3 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onViewGuide?.(row);
            }}
            aria-label="가이드 보기"
            sx={{ p: 1 }}
          >
            <Iconify icon="solar:eye-bold" width={20} />
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            width: 16,
            p: 0,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            aria-label={open ? '접기' : '펼치기'}
            sx={{ p: 0.5 }}
          >
            <Iconify icon={open ? 'eva:arrow-upward-fill' : 'eva:arrow-downward-fill'} width={16} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
              }}
            >
              {row.items.map((item, idx) => (
                <RowItem
                  key={`${item.safetyIdx}-${item.itemNumber}`}
                  item={item}
                  itemIndex={idx}
                  onViewGuide={() => onViewGuide?.(row, item)}
                />
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function SafetySystemTable({ rows, onViewGuide }: Props) {
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
              }}
            >
              문서 개수
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 104,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
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
              }}
            >
              최근 작성일
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                width: 84,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
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
              }}
            >
              가이드
            </TableCell>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                width: 16,
                p: 0,
              }}
            />
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <Row key={`safety-${row.safetyIdx}`} row={row} onViewGuide={onViewGuide} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
