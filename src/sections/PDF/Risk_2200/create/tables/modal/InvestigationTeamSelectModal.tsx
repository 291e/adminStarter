import { useMemo, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import type { InvestigationTeamMember } from '../../../types/table-data';

// ----------------------------------------------------------------------

type InvitableMember = {
  id: string;
  name: string;
  department: string;
  role: string;
  completedHours?: number; // 이수시간 (2400번대용)
  totalHours?: number; // 총 이수시간 (2400번대용)
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (members: InvestigationTeamMember[]) => void;
  is2400Series?: boolean; // 2400번대 여부
};

// TODO: TanStack Query Hook(useQuery)으로 사고조사반 후보자 목록 조회
const mockMembers: InvitableMember[] = [
  {
    id: '1',
    name: '김안전',
    department: '생산 1팀',
    role: '최고 관리자',
    completedHours: 65,
    totalHours: 120,
  },
  {
    id: '2',
    name: '이영희',
    department: '생산 1팀',
    role: '조직 관리자',
    completedHours: 60,
    totalHours: 120,
  },
  {
    id: '3',
    name: '박지민',
    department: '생산 1팀',
    role: '관리 감독자',
    completedHours: 10,
    totalHours: 120,
  },
  {
    id: '4',
    name: '최은주',
    department: '생산 1팀',
    role: '안전보건 담당자',
    completedHours: 120,
    totalHours: 120,
  },
  {
    id: '5',
    name: '정민수',
    department: '생산 2팀',
    role: '근로자',
    completedHours: 45,
    totalHours: 120,
  },
  {
    id: '6',
    name: '문예린',
    department: '생산 3팀',
    role: '근로자',
    completedHours: 80,
    totalHours: 120,
  },
  {
    id: '7',
    name: '전해솔',
    department: '생산 4팀',
    role: '근로자',
    completedHours: 30,
    totalHours: 120,
  },
  {
    id: '8',
    name: '강민정',
    department: '생산 5팀',
    role: '근로자',
    completedHours: 90,
    totalHours: 120,
  },
];

export default function InvestigationTeamSelectModal({
  open,
  onClose,
  onConfirm,
  is2400Series = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const filteredMembers = useMemo(
    () =>
      mockMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.role.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const paginatedMembers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredMembers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredMembers, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage));
  const paginatedIds = paginatedMembers.map((member) => member.id);
  const isAllSelected =
    paginatedMembers.length > 0 && paginatedIds.every((id) => selectedIds.includes(id));
  const isIndeterminate = paginatedIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const selectedMembers = useMemo(
    () => mockMembers.filter((member) => selectedIds.includes(member.id)),
    [selectedIds]
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedIds])]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !paginatedIds.includes(id)));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIds([]);
    setPage(1);
    onClose();
  };

  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 사고조사반 추가 API 호출
    onConfirm(
      selectedMembers.map((member) => ({ department: member.department, name: member.name }))
    );
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ px: 0, pt: 3 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="이름을 입력하세요."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2.75, px: 3 }}
        />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: 'grey.100',
                    minWidth: 72,
                    width: 72,
                    px: 1,
                    py: 2,
                  }}
                >
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    size="small"
                    sx={{ p: 1 }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: 'grey.100',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'text.secondary',
                    px: 2,
                    py: 2,
                  }}
                >
                  이름 / 직급
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: 'grey.100',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'text.secondary',
                    px: 2,
                    py: 2,
                  }}
                >
                  소속
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: 'grey.100',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'text.secondary',
                    px: 2,
                    py: 2,
                  }}
                >
                  역할
                </TableCell>
                {is2400Series && (
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '24px',
                      color: 'text.secondary',
                      px: 2,
                      py: 2,
                    }}
                  >
                    이수시간(분)
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={is2400Series ? 5 : 4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member) => {
                  const isSelected = selectedIds.includes(member.id);
                  return (
                    <TableRow
                      key={member.id}
                      hover
                      sx={{
                        borderBottom: '1px dashed',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <TableCell sx={{ px: 1, py: 2 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelect(member.id)}
                          size="small"
                          sx={{ p: 1 }}
                        />
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                            {member.name[0]}
                          </Avatar>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: '22px',
                                color: 'text.primary',
                              }}
                            >
                              {member.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: '22px',
                                color: 'text.disabled',
                              }}
                            >
                              {member.role}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: '22px',
                            color: 'text.primary',
                          }}
                        >
                          {member.department}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: '22px',
                            color: 'text.primary',
                          }}
                        >
                          {member.role}
                        </Typography>
                      </TableCell>
                      {is2400Series && (
                        <TableCell sx={{ px: 2, py: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: 14,
                              fontWeight: 400,
                              lineHeight: '22px',
                              color: 'text.primary',
                            }}
                          >
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              {member.completedHours ?? 0}
                            </Box>
                            {` / ${member.totalHours ?? 120}`}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="standard"
              size="small"
            />
          </Box>
        )}

        {selectedMembers.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              width: '100%',
              py: 2,
              px: 3,
            }}
          >
            {selectedMembers.map((member) => (
              <Chip
                key={member.id}
                label={member.name}
                size="small"
                onDelete={() => handleSelect(member.id)}
                deleteIcon={<Iconify icon="solar:close-circle-bold" width={16} />}
                sx={{
                  height: 24,
                  bgcolor: 'info.lighter',
                  color: 'info.darker',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: '18px',
                  '& .MuiChip-label': {
                    px: 1.25,
                    py: 0,
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 3, pt: 0, justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            확인
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
