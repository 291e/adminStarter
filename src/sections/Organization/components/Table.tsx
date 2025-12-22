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
import Badge from 'src/components/safeyoui/badge';
import AccidentFreeWorksiteModal from './AccidentFreeWorksiteModal';
import DeleteMemberModal from './DeleteMemberModal';
import EditOrganizationModal from './EditOrganizationModal';

type Props = {
  rows: Organization[];
  page?: number;
  rowsPerPage?: number;
  onViewDetail?: (row: Organization) => void;
  onDeactivate?: (row: Organization) => void;
  onDelete?: (row: Organization) => void;
};

export default function OrganizationTable({
  rows,
  page = 1,
  rowsPerPage = 10,
  onViewDetail,
  onDelete,
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState<Organization | null>(null);

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

  const handleOpenEditModal = (organization: Organization) => {
    setOrganizationToEdit(organization);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setOrganizationToEdit(null);
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
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 72 }} align="center">
              순번
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 80 }}>구분</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>조직명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 100 }} align="center">
              담당자
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>전화번호 / 이메일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>주소</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }} align="center">
              무재해 사업장
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 120 }}>
              상태
            </TableCell>
            <TableCell align="right" sx={{ bgcolor: 'grey.100', minWidth: 60 }}>
              {/* 액션바 여백 */}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, idx) => {
            const accidentInfo = row.accidentFreeInformation;
            const accidentStatus = accidentInfo?.accidentFreeStatus;
            const accidentYear = accidentInfo?.accidentFreeExpiresAt
              ? new Date(accidentInfo.accidentFreeExpiresAt).getFullYear()
              : accidentInfo?.accidentFreeCertifiedAt
                ? new Date(accidentInfo.accidentFreeCertifiedAt).getFullYear()
                : null;
            const accidentLabel = accidentYear
              ? `${accidentYear}년 무재해 사업장`
              : '무재해 사업장';

            // 전체 데이터 기준 순번 계산
            const rowNumber = (page - 1) * rowsPerPage + idx + 1;

            return (
              <TableRow key={row.companyIdx} hover>
                <TableCell align="center">{rowNumber}</TableCell>
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
                <TableCell align="center">
                  {row.manager ? (
                    <Typography variant="body2">{row.manager.memberName || '-'}</Typography>
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
                <TableCell align="center">
                  {(() => {
                    // 무재해 사업장 인증 정보가 없는 경우 또는 'none' 상태인 경우
                    if (
                      !accidentInfo ||
                      !accidentStatus ||
                      accidentStatus === 'none' ||
                      accidentStatus === 'NONE'
                    ) {
                      return <Typography variant="body2">-</Typography>;
                    }

                    // 승인된 경우
                    if (accidentStatus === 'APPROVED') {
                      return (
                        <Chip
                          color="info"
                          variant="outlined"
                          size="small"
                          label={accidentLabel}
                          sx={{ fontWeight: 600, pointerEvents: 'none' }}
                        />
                      );
                    }

                    // 검토 대기 상태인 경우
                    if (accidentStatus === 'PENDING') {
                      return (
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
                      );
                    }

                    // 그 외 상태 (REJECTED 등)
                    return <Typography variant="body2">-</Typography>;
                  })()}
                </TableCell>
                <TableCell align="center">
                  {row.isActive === 1 || row.status === 'active' ? (
                    <Badge label="활성" variant="active" />
                  ) : (
                    <Badge label="비활성" variant="inactive" />
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
                          handleOpenEditModal(row);
                        }}
                      >
                        수정
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
            );
          })}
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

      <EditOrganizationModal
        open={editModalOpen}
        organization={organizationToEdit}
        onClose={handleCloseEditModal}
      />
    </TableContainer>
  );
}
