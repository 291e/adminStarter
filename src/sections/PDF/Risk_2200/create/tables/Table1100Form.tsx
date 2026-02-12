import { useState, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import type { SelectChangeEvent } from '@mui/material/Select';

import { Iconify } from 'src/components/iconify';
import type { Table1100Row } from '../../types/table-data';
import SelectHighRiskWorkModal, { type HighRiskWorkItem } from './modal/SelectHighRiskWorkModal';
import SelectDisasterFactorModal, {
  type DisasterFactorItem,
} from './modal/SelectDisasterFactorModal';
import { useIndustries, useChecklists } from 'src/sections/ChackList/hooks/use-checklist-api';
import type { IndustryItem, Checklist } from 'src/services/checklist/checklist.types';

// ----------------------------------------------------------------------

type Props = {
  rows: Table1100Row[];
  onRowChange: (index: number, field: keyof Table1100Row, value: string) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (fromIndex: number, toIndex: number) => void;
  onAddRow: () => void;
  onSelectHighRiskWork?: (index: number) => void;
  onSelectDisasterFactor?: (index: number) => void;
  onInsertRows?: (index: number, newRows: Table1100Row[]) => void;
};

// 고위험작업별로 행을 그룹화하는 함수
type GroupedRow = {
  highRiskWork: string;
  startIndex: number; // 원본 rows 배열에서의 시작 인덱스
  rows: Array<{ row: Table1100Row; originalIndex: number }>;
  rowSpan: number;
};

function groupRowsByHighRiskWork(rows: Table1100Row[]): GroupedRow[] {
  const groups: GroupedRow[] = [];
  let currentGroup: GroupedRow | null = null;

  rows.forEach((row, index) => {
    const highRiskWork = row.highRiskWork?.trim() || '';

    if (currentGroup && currentGroup.highRiskWork === highRiskWork) {
      // 같은 고위험작업이면 현재 그룹에 추가
      currentGroup.rows.push({ row, originalIndex: index });
      currentGroup.rowSpan += 1;
    } else {
      // 다른 고위험작업이면 새 그룹 시작
      currentGroup = {
        highRiskWork,
        startIndex: index,
        rows: [{ row, originalIndex: index }],
        rowSpan: 1,
      };
      groups.push(currentGroup);
    }
  });

  return groups;
}

export default function Table1100Form({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
  onSelectHighRiskWork,
  onSelectDisasterFactor,
  onInsertRows,
}: Props) {
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [highRiskWorkModalOpen, setHighRiskWorkModalOpen] = useState(false);
  const [disasterFactorModalOpen, setDisasterFactorModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // 고위험작업별로 그룹화
  const groupedRows = useMemo(() => groupRowsByHighRiskWork(rows), [rows]);

  // 업종 목록 조회
  const { data: industriesData } = useIndustries();
  const industries: IndustryItem[] = useMemo(() => {
    const list = industriesData?.industryList || [];

    // 활성화된 업종만 필터링
    const activeIndustries = list.filter((industry) => industry.status === 'ACTIVE');

    // 중복 제거: 업종명(name)을 키로 하여 같은 이름의 업종 중 첫 번째 항목만 유지
    const seenByName = new Map<string, IndustryItem>();

    for (const industry of activeIndustries) {
      if (industry.name) {
        // 업종명이 이미 있으면 무시 (첫 번째 것만 유지)
        if (!seenByName.has(industry.name)) {
          seenByName.set(industry.name, industry);
        }
      }
    }

    const uniqueIndustries = Array.from(seenByName.values());

    return uniqueIndustries;
  }, [industriesData]);

  // 모든 체크리스트 목록 조회 (클라이언트 사이드 필터링을 위해 모든 데이터 가져오기)
  const { data: checklistsData } = useChecklists({
    page: 1,
    pageSize: 1000, // 충분히 큰 값으로 모든 데이터 가져오기
    status: 'active',
  });

  // 체크리스트 데이터 정규화
  const allChecklists: Checklist[] = useMemo(() => {
    const list = checklistsData?.checklistList;
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    if (typeof list[0] === 'string') return [];
    return list as Checklist[];
  }, [checklistsData]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onRowMove(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenHighRiskWorkModal = (index: number) => {
    setSelectedRowIndex(index);
    setHighRiskWorkModalOpen(true);
  };

  const handleCloseHighRiskWorkModal = () => {
    setHighRiskWorkModalOpen(false);
    setSelectedRowIndex(null);
  };

  const handleConfirmHighRiskWork = (selectedItem: HighRiskWorkItem | null) => {
    if (selectedItem && selectedRowIndex !== null) {
      onRowChange(selectedRowIndex, 'highRiskWork', selectedItem.name);
    }
    handleCloseHighRiskWorkModal();
  };

  const handleOpenDisasterFactorModal = (index: number) => {
    setSelectedRowIndex(index);
    setDisasterFactorModalOpen(true);
  };

  const handleCloseDisasterFactorModal = () => {
    setDisasterFactorModalOpen(false);
    setSelectedRowIndex(null);
  };

  const handleConfirmDisasterFactor = (selectedItems: DisasterFactorItem[]) => {
    if (selectedRowIndex !== null && selectedItems.length > 0) {
      const firstItem = selectedItems[0];
      const otherItems = selectedItems.slice(1);

      // 첫 번째 항목은 현재 행 업데이트
      onRowChange(selectedRowIndex, 'disasterFactor', firstItem.name);

      // 나머지 항목들은 새로운 행으로 추가 (고위험작업 및 상황 복사)
      if (otherItems.length > 0 && onInsertRows) {
        const currentRow = rows[selectedRowIndex];
        const newRows = otherItems.map((item) => ({
          highRiskWork: currentRow.highRiskWork, // 고위험작업 복사
          disasterFactor: item.name,
          workplace: '',
          machineHazard: '',
          improvementNeeded: '',
          remark: '',
        }));
        onInsertRows(selectedRowIndex, newRows);
      }
    }
    handleCloseDisasterFactorModal();
  };

  // 그룹 내 모든 행의 고위험작업 변경
  const handleGroupHighRiskWorkChange = (group: GroupedRow) => {
    // 그룹의 첫 번째 행에서 고위험작업 모달 열기
    handleOpenHighRiskWorkModal(group.startIndex);
  };

  // 그룹 전체의 고위험작업 업데이트 (모달 확인 시)
  const handleConfirmGroupHighRiskWork = (selectedItem: HighRiskWorkItem | null) => {
    if (selectedItem && selectedRowIndex !== null) {
      // 현재 선택된 행과 같은 그룹의 모든 행 업데이트
      const currentHighRiskWork = rows[selectedRowIndex]?.highRiskWork;
      rows.forEach((row, index) => {
        if (row.highRiskWork === currentHighRiskWork) {
          onRowChange(index, 'highRiskWork', selectedItem.name);
        }
      });
    }
    handleCloseHighRiskWorkModal();
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 업종 드롭다운 (테이블 좌측 위) */}
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 2, gap: 2, px: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="industry-select-label">업종</InputLabel>
          <Select
            labelId="industry-select-label"
            value={selectedIndustry}
            onChange={(e: SelectChangeEvent<string>) => setSelectedIndustry(e.target.value)}
            label="업종 선택"
            sx={{ fontSize: 14 }}
          >
            <MenuItem value="">
              <em>전체</em>
            </MenuItem>
            {industries.map((industry) => (
              <MenuItem
                key={industry.industryIdx ?? industry.name}
                value={industry.name}
                sx={{ fontSize: 14 }}
              >
                {industry.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            border: '2px solid',
            borderColor: 'text.primary',
            borderCollapse: 'collapse',
            '& th, & td': {
              border: '1px solid',
              borderColor: 'text.primary',
              padding: 0,
              textAlign: 'center',
              verticalAlign: 'middle',
            },
            '& th': {
              backgroundColor: 'grey.100',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              height: 60,
            },
            '& td': {
              padding: '4px',
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ maxWidth: 200 }}>고위험작업 및 상황</th>
              <th style={{ maxWidth: 361 }}>재해유발요인</th>
              <th style={{ maxWidth: 100 }}>작업장소</th>
              <th style={{ maxWidth: 160 }}>
                기계·기구·설비
                <br />
                유해인자
              </th>
              <th style={{ maxWidth: 80 }}>개선필요</th>
              <th style={{ maxWidth: 110 }}>비고</th>
              <th style={{ width: 30 }}>이동</th>
              <th style={{ width: 39 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((group, groupIndex) =>
              group.rows.map(({ row, originalIndex }, rowIndexInGroup) => (
                <tr
                  key={originalIndex}
                  onDragOver={(e) => handleDragOver(e, originalIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, originalIndex)}
                  onDragEnd={handleDragEnd}
                  style={{
                    opacity: draggedIndex === originalIndex ? 0.5 : 1,
                    backgroundColor:
                      dragOverIndex === originalIndex && draggedIndex !== originalIndex
                        ? theme.vars.palette.action.hover
                        : 'transparent',
                    cursor: 'move',
                  }}
                >
                  {/* 그룹의 첫 번째 행에만 고위험작업 셀 렌더링 (rowSpan 적용) */}
                  {rowIndexInGroup === 0 && (
                    <td rowSpan={group.rowSpan}>
                      <Button
                        variant={row.highRiskWork ? 'text' : 'contained'}
                        size="medium"
                        onClick={() => handleOpenHighRiskWorkModal(originalIndex)}
                        sx={{
                          minHeight: 36,
                          fontSize: 14,
                          fontWeight: row.highRiskWork ? 400 : 700,
                          px: row.highRiskWork ? 1 : 3,
                          py: 0.75,
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          textAlign: 'left',
                          overflow: 'hidden',
                          maxWidth: 200,
                        }}
                      >
                        {row.highRiskWork || '선택하기'}
                      </Button>
                    </td>
                  )}
                  <td>
                    <Button
                      variant={row.disasterFactor ? 'text' : 'contained'}
                      size="medium"
                      onClick={() => handleOpenDisasterFactorModal(originalIndex)}
                      disabled={!row.highRiskWork}
                      sx={{
                        minHeight: 36,
                        fontSize: 14,
                        fontWeight: row.disasterFactor ? 400 : 700,
                        px: row.disasterFactor ? 1 : 3,
                        py: 0.75,
                        maxWidth: 361,
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: row.disasterFactor ? 'pre-wrap' : 'nowrap',
                      }}
                    >
                      {row.disasterFactor || '선택하기'}
                    </Button>
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={row.workplace}
                      onChange={(e) => onRowChange(originalIndex, 'workplace', e.target.value)}
                      fullWidth
                      multiline
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                          height: 'auto',
                          maxWidth: 100,
                          p: 1,
                        },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    />
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={row.machineHazard}
                      onChange={(e) => onRowChange(originalIndex, 'machineHazard', e.target.value)}
                      fullWidth
                      multiline
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                          height: 'auto',
                          maxWidth: 160,
                          p: 1,
                        },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    />
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={row.improvementNeeded}
                      onChange={(e) =>
                        onRowChange(originalIndex, 'improvementNeeded', e.target.value)
                      }
                      fullWidth
                      multiline
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                          height: 'auto',
                          maxWidth: 80,
                          p: 1,
                        },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    />
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={row.remark}
                      onChange={(e) => onRowChange(originalIndex, 'remark', e.target.value)}
                      fullWidth
                      multiline
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                          height: 'auto',
                          maxWidth: 110,
                          p: 1,
                        },
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    />
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        px: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        draggable
                        onDragStart={() => handleDragStart(originalIndex)}
                        onDragEnd={handleDragEnd}
                        sx={{
                          p: 0.625,
                          cursor: 'grab',
                          '&:active': {
                            cursor: 'grabbing',
                          },
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Iconify icon="carbon:chevron-sort" width={20} />
                      </IconButton>
                    </Box>
                  </td>
                  <td>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onRowDelete(originalIndex)}
                      sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                        width: 23,
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                    >
                      삭제
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 5 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={onAddRow}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            minHeight: 36,
            fontSize: 14,
            fontWeight: 700,
            px: 1.5,
            py: 0.75,
          }}
        >
          항목추가
        </Button>
      </Box>

      <SelectHighRiskWorkModal
        open={highRiskWorkModalOpen}
        onClose={handleCloseHighRiskWorkModal}
        onConfirm={handleConfirmHighRiskWork}
        industry={selectedIndustry || undefined}
        allChecklists={allChecklists}
      />

      {selectedRowIndex !== null && (
        <SelectDisasterFactorModal
          open={disasterFactorModalOpen}
          onClose={handleCloseDisasterFactorModal}
          onConfirm={handleConfirmDisasterFactor}
          highRiskWork={rows[selectedRowIndex]?.highRiskWork}
          industry={selectedIndustry}
        />
      )}
    </Box>
  );
}
