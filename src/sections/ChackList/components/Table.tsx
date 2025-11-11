import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';

import type { Checklist } from 'src/_mock/_checklist';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: Checklist[];
  onSave?: (rowId: string, newValue: string) => void;
  onViewDisasterFactors?: (row: Checklist) => void;
};

export default function ChecklistTable({ rows, onSave, onViewDisasterFactors }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (row: Checklist) => {
    setEditingId(row.id);
    setEditValue(row.highRiskWork);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (rowId: string) => {
    if (editValue.trim()) {
      // TODO: TanStack Query Hook(useMutation)으로 고위험작업/상황 업데이트 (view.tsx의 onSave에서 처리)
      // 실제 API 호출은 view.tsx의 onSave에서 수행됩니다.

      onSave?.(rowId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(rowId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 68 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 846 }}>고위험작업/상황</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 76 }}>
              편집
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 120 }}>
              재해유발요인
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 84 }}>
              상태
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  데이터가 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2">{row.order}</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {fDateTime(row.registrationDate, 'YYYY-MM-DD')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                      {fDateTime(row.registrationDate, 'HH:mm:ss')}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {editingId === row.id ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id)}
                      autoFocus
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              sx={{ p: 0.5 }}
                            >
                              <Iconify icon="solar:close-circle-bold" width={16} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: 56,
                        },
                      }}
                    />
                  ) : (
                    <Typography variant="body2">{row.highRiskWork}</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === row.id ? (
                    <IconButton
                      size="small"
                      onClick={() => handleSaveEdit(row.id)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Iconify icon="solar:check-circle-bold" width={20} />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(row)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Iconify icon="solar:pen-bold" width={20} />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onViewDisasterFactors?.(row)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon="solar:eye-bold" width={20} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  {row.status === 'active' ? (
                    <Chip label="활성" size="small" color="success" variant="soft" />
                  ) : (
                    <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

