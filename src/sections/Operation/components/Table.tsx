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

import type { RiskReport } from 'src/_mock/_risk-report';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: RiskReport[];
  onEdit?: (row: RiskReport) => void;
  onRegisterNearMiss?: (row: RiskReport) => void;
  onRegisterAccident?: (row: RiskReport) => void;
};

export default function OperationTable({
  rows,
  onEdit,
  onRegisterNearMiss,
  onRegisterAccident,
}: Props) {
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
              boxShadow:
                '0px 0px 2px 0px rgba(145, 158, 171, 0.2), 0px 12px 24px -4px rgba(145, 158, 171, 0.12)',
              transition: 'box-shadow 0.3s ease, transform 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                boxShadow:
                  '0px 0px 4px 0px rgba(145, 158, 171, 0.3), 0px 16px 32px -4px rgba(145, 158, 171, 0.16)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {/* 텍스트 콘텐츠 영역 */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pl: 3,
                pr: 0,
                pt: 1.5,
                pb: 2.5,
                maxWidth: 400,
              }}
            >
              <Box sx={{ position: 'relative', height: '100%' }}>
                {/* 헤더 (조직명 + 등록일 + 액션 버튼) */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 0.5, height: 36 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: 14,
                      lineHeight: 1.57,
                    }}
                  >
                    이편한 자동화기술
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, row.id)}
                      aria-label="actions"
                      sx={{
                        p: 1,
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={20} />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* 정보 목록 */}
                <Stack spacing={0.5} sx={{ mb: 0.5 }}>
                  <InfoRow label="위치" value={row.location} />
                  <InfoRow label="내용" value={row.content} />
                  <InfoRow label="보고자" value={row.reporter} />
                  <InfoRow label="작성자" value={row.author} />
                </Stack>

                {/* 상태 라벨 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                  }}
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
                </Box>
              </Box>
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
                      onEdit?.(row);
                    }}
                  >
                    수정
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu(row.id);
                      onRegisterNearMiss?.(row);
                    }}
                  >
                    아차사고 등록
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu(row.id);
                      onRegisterAccident?.(row);
                    }}
                  >
                    산업재해 등록
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>

            {/* 이미지 영역 */}
            <Box
              sx={{
                width: 224,
                height: 164,
                position: 'relative',
                p: 1.25,
                alignSelf: 'center',
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
                  pointerEvents: 'none',
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
