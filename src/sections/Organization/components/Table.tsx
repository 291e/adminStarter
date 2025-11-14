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
import Button from '@mui/material/Button';

import type { Member } from 'src/sections/Organization/types/member';
import Chip from '@mui/material/Chip';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { mockCompanies } from 'src/_mock/_company';
import AccidentFreeWorksiteModal from './AccidentFreeWorksiteModal';
import DeleteMemberModal from './DeleteMemberModal';
import DeactivateMemberModal from './DeactivateMemberModal';

type Props = {
  rows: Member[];
  onViewDetail?: (row: Member) => void;
  onDeactivate?: (row: Member) => void;
  onDelete?: (row: Member) => void;
};

export default function OrganizationTable({ rows, onViewDetail, onDeactivate, onDelete }: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [memberToDeactivate, setMemberToDeactivate] = useState<Member | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation();
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    setOpenMenuId(rowId);
  };

  const handleCloseMenu = (rowId: string) => {
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: null }));
    setOpenMenuId(null);
  };

  const handleOpenModal = (member: Member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
  };

  const handleApprove = (member: Member) => {
    // TODO: 승인 처리 로직
    handleCloseModal();
  };

  const handleReject = (member: Member) => {
    // TODO: 반려 처리 로직
    handleCloseModal();
  };

  const handleOpenDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      onDelete?.(memberToDelete);
      handleCloseDeleteModal();
    }
  };

  const handleOpenDeactivateModal = (member: Member) => {
    setMemberToDeactivate(member);
    setDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    setDeactivateModalOpen(false);
    setMemberToDeactivate(null);
  };

  const handleConfirmDeactivate = () => {
    if (memberToDeactivate) {
      onDeactivate?.(memberToDeactivate);
      handleCloseDeactivateModal();
    }
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
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 72 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 220 }}>등록일 / 접속일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 100 }}>구분</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 200 }}>조직명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>담당자</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 260 }}>전화번호 / 이메일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 200 }}>주소</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>무재해 사업장</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 120 }}>
              상태
            </TableCell>
            <TableCell align="right" sx={{ bgcolor: 'grey.100', minWidth: 60 }}>
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
              <TableCell>
                {row.accidentFreeYear ? (
                  <Chip
                    label={`${row.accidentFreeYear}년 무재해 사업장`}
                    variant="outlined"
                    color="info"
                    size="small"
                    sx={{
                      height: 24,
                      minHeight: 24,
                      px: 0.75,
                      py: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: '20px',
                      borderRadius: 0.75,
                      borderWidth: 1,
                      textTransform: 'none',
                    }}
                  />
                ) : (
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    endIcon={<Iconify icon="eva:arrow-forward-fill" width={16} />}
                    onClick={() => handleOpenModal(row)}
                    sx={{
                      height: 24,
                      minHeight: 24,
                      px: 0.75,
                      py: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: '20px',
                      borderRadius: 0.75,
                      borderWidth: 1,
                      borderColor: 'grey.900',
                      color: 'grey.900',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'grey.800',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    검토 대기
                  </Button>
                )}
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
                        handleOpenDeactivateModal(row);
                      }}
                    >
                      비활성화
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.memberIdx.toString());
                        handleOpenDeleteModal(row);
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

      <AccidentFreeWorksiteModal
        open={modalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
        member={selectedMember}
      />

      <DeleteMemberModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        member={memberToDelete}
      />

      <DeactivateMemberModal
        open={deactivateModalOpen}
        onClose={handleCloseDeactivateModal}
        onConfirm={handleConfirmDeactivate}
        member={memberToDeactivate}
      />
    </TableContainer>
  );
}
