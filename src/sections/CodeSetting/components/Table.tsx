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

import type { CodeSetting } from 'src/services/code-setting/code-setting.types';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: CodeSetting[];
  onEdit?: (row: CodeSetting) => void;
  category?: 'machine' | 'hazard';
};

export default function CodeSettingTable({ rows, onEdit, category = 'machine' }: Props) {
  if (category === 'hazard') {
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
              <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>카테고리</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>유해인자 코드</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>유해인자명</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>형태 및 유형</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>위치</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', minWidth: 226 }}>노출위험</TableCell>
              <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 84 }}>
                상태
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 82 }}>
                &nbsp;
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.codeSettingIdx ?? row.code} hover>
                <TableCell>
                  <Typography variant="body2">{row.codeSettingIdx}</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {fDateTime(row.updateAt || row.createAt, 'YYYY-MM-DD')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                      {fDateTime(row.updateAt || row.createAt, 'HH:mm:ss')}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {row.codeSettingHazardCategoryInformation?.name || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.code}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.formAndType || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.location || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.exposureRisk || '-'}</Typography>
                </TableCell>
                <TableCell align="center">
                  {row.status?.toUpperCase() === 'ACTIVE' ? (
                    <Chip label="활성" size="small" color="success" variant="soft" />
                  ) : (
                    <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(row)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon="solar:pen-bold" width={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // 기계·설비 테이블
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
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>기계·설비 코드</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 180 }}>기계·설비명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 320 }}>방호장치</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 114 }}>검사주기</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 212 }}>발생가능 재해형태</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 84 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 82 }}>
              액션
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.codeSettingIdx ?? row.code} hover>
              <TableCell>
                <Typography variant="body2">{row.codeSettingIdx}</Typography>
              </TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {fDateTime(row.updateAt || row.createAt, 'YYYY-MM-DD')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                    {fDateTime(row.updateAt || row.createAt, 'HH:mm:ss')}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.code}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {Array.isArray(row.protectiveDevices)
                    ? row.protectiveDevices.join(', ')
                    : typeof row.protectiveDevices === 'string' && row.protectiveDevices
                      ? row.protectiveDevices
                      : '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.inspectionCycle || '-'}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {Array.isArray(row.riskTypes)
                    ? row.riskTypes.join(', ')
                    : typeof row.riskTypes === 'string' && row.riskTypes
                      ? row.riskTypes
                      : '-'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {row.status?.toUpperCase() === 'ACTIVE' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(row)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Iconify icon="solar:pen-bold" width={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
