import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import type { SafetyReport } from 'src/_mock/_safety-report';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: SafetyReport[];
  onViewDetail?: (row: SafetyReport) => void;
  onEdit?: (row: SafetyReport) => void;
  onDelete?: (row: SafetyReport) => void;
};

export default function SafetyReportTable({ rows, onViewDetail, onEdit, onDelete }: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation();
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    setOpenMenuId(rowId);
  };

  const handleCloseMenu = (rowId: string) => {
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: null }));
    setOpenMenuId(null);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(new Set(rows.map((row) => row.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectRow = (rowId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const isAllSelected = rows.length > 0 && selected.size === rows.length;
  const isIndeterminate = selected.size > 0 && selected.size < rows.length;

  return (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1320 }}>
        <TableHead>
          <TableRow>
            <TableCell
              padding="checkbox"
              sx={{
                bgcolor: 'grey.100',
                minWidth: 44,
                width: 44,
                pl: 1,
                pr: 0,
              }}
            >
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
                size="small"
              />
            </TableCell>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                minWidth: 80,
                width: 80,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              순번
            </TableCell>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                minWidth: 180,
                width: 180,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              공개일
            </TableCell>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                minWidth: 144,
                width: 144,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              문서 유형
            </TableCell>
            <TableCell
              sx={{
                bgcolor: 'grey.100',
                minWidth: 480,
                width: 480,
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
                minWidth: 120,
                width: 120,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              문서 작성일
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                minWidth: 68,
                width: 68,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              서명
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                minWidth: 85,
                width: 85,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              조회수
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: 'grey.100',
                minWidth: 119,
                width: 119,
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              더보기
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{
                borderBottom: '1px dashed',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <TableCell
                padding="checkbox"
                sx={{
                  minWidth: 44,
                  width: 44,
                  pl: 1,
                  pr: 0,
                }}
              >
                <Checkbox
                  checked={selected.has(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                  size="small"
                />
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 80,
                  width: 80,
                  fontSize: 14,
                }}
              >
                {row.order}
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 180,
                  width: 180,
                  fontSize: 14,
                }}
              >
                {fDateTime(row.publishedAt, 'YYYY-MM-DD HH:mm:ss')}
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 144,
                  width: 144,
                  fontSize: 14,
                }}
              >
                {row.documentType}
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 480,
                  width: 480,
                  fontSize: 14,
                }}
              >
                {row.documentName || '문서명을 입력해주세요.'}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  minWidth: 120,
                  width: 120,
                  fontSize: 14,
                }}
              >
                {fDateTime(row.documentDate, 'YYYY-MM-DD')}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  minWidth: 68,
                  width: 68,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(row)}
                  aria-label="편집"
                  sx={{ p: 1 }}
                >
                  <Iconify icon="solar:pen-bold" width={20} />
                </IconButton>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  minWidth: 85,
                  width: 85,
                  fontSize: 14,
                }}
              >
                {row.viewCount}
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 119, width: 119 }}>
                <Chip
                  label="더보기"
                  size="small"
                  variant="soft"
                  color="warning"
                  sx={{
                    cursor: 'pointer',
                  }}
                  onClick={() => onViewDetail?.(row)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
