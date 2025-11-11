import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import type { Member } from 'src/sections/Organization/types/member';
import Chip from '@mui/material/Chip';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { mockCompanies } from 'src/_mock/_company';
type Props = {
  rows: Member[];
  onViewDetail?: (row: Member) => void;
  onDeactivate?: (row: Member) => void;
  onDelete?: (row: Member) => void;
};

export default function OrganizationTable({ rows, onViewDetail, onDeactivate, onDelete }: Props) {
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

  const companies = mockCompanies();

  // 구분 매핑 함수
  const getDivisionLabel = (member: Member): string => {
    if (member.memberRole === 'operator' || member.memberRole === 'admin') {
      return '운영사';
    }
    if (member.memberRole === 'member') {
      return '회원사';
    }
    if (member.memberRole === 'distributor') {
      return '총판';
    }
    if (member.memberRole === 'agency') {
      return '대리점';
    }
    if (member.memberRole === 'dealer') {
      return '딜러';
    }
    if (member.memberStatus === 'inactive' || !member.memberRole) {
      return '비회원';
    }
    return '기타';
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1600 }}>
        <TableHead>
          <TableRow>
            <TableCell width={72}>순번</TableCell>
            <TableCell width={220}>등록일 / 접속일</TableCell>
            <TableCell width={100}>구분</TableCell>
            <TableCell width={200}>조직명</TableCell>
            <TableCell width={160}>이름</TableCell>
            <TableCell width={260}>전화번호 / 이메일</TableCell>
            <TableCell>주소</TableCell>
            <TableCell width={120} align="center">
              상태
            </TableCell>
            <TableCell width={60} align="right">
              {/* 액션바 여백 */}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.memberIdx} hover>
              <TableCell>{row.memberIdx}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">
                    {fDateTime(row.createAt, 'YYYY-MM-DD HH:mm:ss')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fDateTime(row.lastSigninDate, 'YYYY-MM-DD HH:mm:ss')}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getDivisionLabel(row)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">
                  {companies.find((c) => c.companyIdx === row.companyIdx)?.companyName}
                </Typography>
              </TableCell>
              <TableCell>{row.memberName}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">{row.memberPhone}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.memberEmail}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.memberAddress}</Typography>
              </TableCell>
              <TableCell align="center">
                {row.memberStatus === 'active' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, row.memberIdx.toString())}
                  aria-label="actions"
                >
                  <Iconify icon="eva:more-vertical-fill" width={16} />
                </IconButton>
                <Menu
                  open={openMenuId === row.memberIdx.toString()}
                  anchorEl={menuAnchorEl[row.memberIdx.toString()]}
                  onClose={() => handleCloseMenu(row.memberIdx.toString())}
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
                        handleCloseMenu(row.memberIdx.toString());
                        onViewDetail?.(row);
                      }}
                    >
                      상세 보기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.memberIdx.toString());
                        onDeactivate?.(row);
                      }}
                    >
                      비활성화
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.memberIdx.toString());
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
