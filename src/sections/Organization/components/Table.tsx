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

import type { Organization } from 'src/services/organization/organization.types';
import Chip from '@mui/material/Chip';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import AccidentFreeWorksiteModal from './AccidentFreeWorksiteModal';
import DeleteMemberModal from './DeleteMemberModal';
import DeactivateMemberModal from './DeactivateMemberModal';

type Props = {
  rows: Organization[];
  onViewDetail?: (row: Organization) => void;
  onDeactivate?: (row: Organization) => void;
  onDelete?: (row: Organization) => void;
};

export default function OrganizationTable({ rows, onViewDetail, onDeactivate, onDelete }: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [organizationToDeactivate, setOrganizationToDeactivate] = useState<Organization | null>(
    null
  );

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation();
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    setOpenMenuId(rowId);
  };

  const handleCloseMenu = (rowId: string) => {
    setMenuAnchorEl((prev) => ({ ...prev, [rowId]: null }));
    setOpenMenuId(null);
  };

  const handleOpenModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleApprove = (organization: Organization) => {
    // TODO: 승인 처리 로직
    handleCloseModal();
  };

  const handleReject = (organization: Organization) => {
    // TODO: 반려 처리 로직
    handleCloseModal();
  };

  const handleOpenDeleteModal = (organization: Organization) => {
    setOrganizationToDelete(organization);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setOrganizationToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (organizationToDelete) {
      onDelete?.(organizationToDelete);
      handleCloseDeleteModal();
    }
  };

  const handleOpenDeactivateModal = (organization: Organization) => {
    setOrganizationToDeactivate(organization);
    setDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    setDeactivateModalOpen(false);
    setOrganizationToDeactivate(null);
  };

  const handleConfirmDeactivate = () => {
    if (organizationToDeactivate) {
      onDeactivate?.(organizationToDeactivate);
      handleCloseDeactivateModal();
    }
  };

  // 구분 매핑 함수 (companyType을 한글로 변환)
  const getDivisionLabel = (organization: Organization): string => {
    const companyTypeMap: Record<string, string> = {
      OPERATOR: '운영사',
      MEMBER: '회원사',
      DISTRIBUTOR: '총판',
      AGENCY: '대리점',
      DEALER: '딜러',
      NON_MEMBER: '비회원',
    };
    return organization.companyType ? companyTypeMap[organization.companyType] || '기타' : '기타';
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
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 220 }}>등록일</TableCell>
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
            <TableRow key={row.companyIdx} hover>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">
                    {row.createAt ? fDateTime(row.createAt, 'YYYY-MM-DD') : '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.createAt ? fDateTime(row.createAt, 'HH:mm:ss') : ''}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getDivisionLabel(row)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">{row.companyName}</Typography>
              </TableCell>
              <TableCell>
                {row.manager ? (
                  <Stack>
                    <Typography variant="body2">{row.manager.memberName || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.manager.memberEmail || '-'}
                    </Typography>
                  </Stack>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">{row.phone || '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.email || '-'}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {row.address ? `${row.address} ${row.addressDetail || ''}`.trim() : '-'}
                </Typography>
              </TableCell>
              <TableCell>
                {/* 무재해 사업장 정보는 Organization 타입에 없으므로 임시 처리 */}
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
              </TableCell>
              <TableCell align="center">
                {row.status === 'active' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, row.companyIdx.toString())}
                  aria-label="actions"
                >
                  <Iconify icon="eva:more-vertical-fill" width={16} />
                </IconButton>
                <Menu
                  open={openMenuId === row.companyIdx.toString()}
                  anchorEl={menuAnchorEl[row.companyIdx.toString()]}
                  onClose={() => handleCloseMenu(row.companyIdx.toString())}
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
                        handleCloseMenu(row.companyIdx.toString());
                        onViewDetail?.(row);
                      }}
                    >
                      상세 보기
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.companyIdx.toString());
                        handleOpenDeactivateModal(row);
                      }}
                    >
                      비활성화
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu(row.companyIdx.toString());
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
        organization={selectedOrganization}
      />

      <DeleteMemberModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        organization={organizationToDelete}
      />

      <DeactivateMemberModal
        open={deactivateModalOpen}
        onClose={handleCloseDeactivateModal}
        onConfirm={handleConfirmDeactivate}
        organization={organizationToDeactivate}
      />
    </TableContainer>
  );
}
