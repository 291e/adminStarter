import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import type { RiskReport } from 'src/_mock/_risk-report';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: RiskReport[];
  onViewDetail?: (row: RiskReport) => void;
  onDeactivate?: (row: RiskReport) => void;
  onDelete?: (row: RiskReport) => void;
};

export default function OperationTable({ rows, onViewDetail, onDeactivate, onDelete }: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation();
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    setOpenMenuId(rowId);
  };

  const handleCloseMenu = (rowId: string) => {
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: null }));
    setOpenMenuId(null);
  };

  return (
    <Grid
      container
      spacing={3}
      sx={{
        mt: 2,
      }}
    >
      {rows.map((row) => (
        <Grid key={row.id} size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              display: 'flex',
              width: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: (theme) =>
                `0px 0px 2px 0px ${theme.vars.palette.grey['500Channel']}20, 0px 12px 24px -4px ${theme.vars.palette.grey['500Channel']}12`,
            }}
          >
            {/* 텍스트 콘텐츠 영역 */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                pb: 2,
              }}
            >
              {/* 헤더 (상태 라벨 + 등록일) */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Chip
                  label={row.status === 'confirmed' ? '확인' : '미확인'}
                  size="small"
                  sx={{
                    bgcolor:
                      row.status === 'confirmed'
                        ? 'rgba(34, 197, 94, 0.16)'
                        : 'rgba(145, 158, 171, 0.16)',
                    color: row.status === 'confirmed' ? '#118d57' : 'text.secondary',
                    fontWeight: 700,
                    fontSize: 12,
                    height: 24,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  등록일 {fDateTime(row.registeredAt, 'YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </Stack>

              {/* 제목 */}
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.57,
                  color: 'text.primary',
                }}
              >
                {row.title}
              </Typography>

              {/* 정보 목록 */}
              <Stack spacing={1} sx={{ mb: 2 }}>
                <InfoRow label="위치" value={row.location} />
                <InfoRow label="내용" value={row.content} />
                <InfoRow label="작성자" value={row.author} />
                <InfoRow label="보고자" value={row.reporter} />
              </Stack>

              {/* 액션 버튼 */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  height: 36,
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, row.id)}
                  aria-label="actions"
                  sx={{
                    p: 1,
                  }}
                >
                  <Iconify icon="eva:more-horizontal-fill" width={20} />
                </IconButton>
                <Menu
                  open={openMenuId === row.id}
                  anchorEl={menuAnchorEl[row.id]}
                  onClose={() => handleCloseMenu(row.id)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  slotProps={{
                    paper: {
                      sx: { minWidth: 120 },
                    },
                  }}
                >
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.id);
                        onViewDetail?.(row);
                      }}
                    >
                      상세 보기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.id);
                        onDeactivate?.(row);
                      }}
                    >
                      비활성화
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.id);
                        onDelete?.(row);
                      }}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.lighter',
                        },
                      }}
                    >
                      삭제
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Box>

            {/* 이미지 영역 */}
            <Box
              sx={{
                width: 180,
                height: 240,
                position: 'relative',
                p: 1,
              }}
            >
              <Box
                component="img"
                src={row.imageUrl}
                alt={row.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// ----------------------------------------------------------------------

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ minHeight: 22 }}>
      <Typography
        variant="body2"
        sx={{
          width: 60,
          fontSize: 14,
          lineHeight: 1.57,
          color: 'text.secondary',
          flexShrink: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: 14,
          lineHeight: 1.57,
          color: 'text.primary',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
