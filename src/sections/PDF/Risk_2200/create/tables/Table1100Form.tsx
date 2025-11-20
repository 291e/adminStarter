import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import type { Table1100Row } from '../../types/table-data';
import SelectHighRiskWorkModal, { type HighRiskWorkItem } from './modal/SelectHighRiskWorkModal';
import SelectDisasterFactorModal, {
  type DisasterFactorItem,
} from './modal/SelectDisasterFactorModal';

// ----------------------------------------------------------------------

type Props = {
  rows: Table1100Row[];
  onRowChange: (index: number, field: keyof Table1100Row, value: string) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (fromIndex: number, toIndex: number) => void;
  onAddRow: () => void;
  onSelectHighRiskWork?: (index: number) => void;
  onSelectDisasterFactor?: (index: number) => void;
};

export default function Table1100Form({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
  onSelectHighRiskWork,
  onSelectDisasterFactor,
}: Props) {
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [highRiskWorkModalOpen, setHighRiskWorkModalOpen] = useState(false);
  const [disasterFactorModalOpen, setDisasterFactorModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

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
    if (selectedRowIndex !== null) {
      // 중복 선택된 항목들을 줄바꿈으로 구분하여 저장
      const disasterFactorText = selectedItems.map((item) => item.name).join('\n');
      onRowChange(selectedRowIndex, 'disasterFactor', disasterFactorText);
    }
    handleCloseDisasterFactorModal();
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              <th style={{ maxWidth: 30 }}>이동</th>
              <th style={{ maxWidth: 39 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: draggedIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverIndex === index && draggedIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
                  cursor: 'move',
                }}
              >
                <td>
                  <Button
                    variant={row.highRiskWork ? 'text' : 'contained'}
                    size="medium"
                    onClick={() => handleOpenHighRiskWorkModal(index)}
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
                <td>
                  <Button
                    variant={row.disasterFactor ? 'text' : 'contained'}
                    size="medium"
                    onClick={() => handleOpenDisasterFactorModal(index)}
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
                    onChange={(e) => onRowChange(index, 'workplace', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                        maxWidth: 100,
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.machineHazard}
                    onChange={(e) => onRowChange(index, 'machineHazard', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                        maxWidth: 160,
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.improvementNeeded}
                    onChange={(e) => onRowChange(index, 'improvementNeeded', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                        maxWidth: 80,
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.remark}
                    onChange={(e) => onRowChange(index, 'remark', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                        maxWidth: 110,
                      },
                    }}
                  />
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1, maxWidth: 30 }}>
                    <IconButton
                      size="small"
                      sx={{
                        p: 0.625,
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Iconify icon="custom:drag-dots-fill" width={20} />
                    </IconButton>
                  </Box>
                </td>
                <td>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onRowDelete(index)}
                    sx={{
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      minHeight: 30,
                      fontSize: 13,
                      fontWeight: 700,
                      px: 1,
                      py: 0.5,
                      maxWidth: 39,
                      '&:hover': {
                        bgcolor: 'error.dark',
                      },
                    }}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
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
      />

      {selectedRowIndex !== null && (
        <SelectDisasterFactorModal
          open={disasterFactorModalOpen}
          onClose={handleCloseDisasterFactorModal}
          onConfirm={handleConfirmDisasterFactor}
          highRiskWork={rows[selectedRowIndex]?.highRiskWork}
        />
      )}
    </Box>
  );
}
