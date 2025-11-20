import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import type { Table1300Row } from '../../types/table-data';
import MachineEquipmentSelectModal from './modal/MachineEquipmentSelectModal';

// ----------------------------------------------------------------------

// 검사 대상 옵션 목록
const INSPECTION_TARGET_OPTIONS = [
  '산업안전보건법',
  '건설기계관리법',
  '전기안전관리법',
  '소방시설법',
  '고압가스안전관리법',
  '대기환경보전법',
  '물환경보전법',
  '원자력안전법',
  '승강기 안전관리법',
  '직접입력',
  '비대상',
] as const;

// ----------------------------------------------------------------------

type Props = {
  rows: Table1300Row[];
  onRowChange: (index: number, field: keyof Table1300Row, value: string | number) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (fromIndex: number, toIndex: number) => void;
  onAddRow: () => void;
};

export default function Table1300Form({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
}: Props) {
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [modalOpenIndex, setModalOpenIndex] = useState<number | null>(null);

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

  const handleOpenModal = (index: number) => {
    setModalOpenIndex(index);
  };

  const handleCloseModal = () => {
    setModalOpenIndex(null);
  };

  const handleModalConfirm = (
    index: number,
    data: {
      name: string;
      id: string;
      capacity: string;
      location: string;
      quantity: string;
      inspectionTarget: string;
      safetyDevice: string;
      inspectionCycle: string;
      accidentForm: string;
      remark: string;
    }
  ) => {
    onRowChange(index, 'name', data.name);
    onRowChange(index, 'id', data.id);
    onRowChange(index, 'capacity', data.capacity);
    onRowChange(index, 'location', data.location);
    // quantity는 number 또는 string이 될 수 있으므로 변환
    const quantityValue =
      data.quantity === ''
        ? ''
        : Number.isNaN(Number(data.quantity))
          ? data.quantity
          : Number(data.quantity);
    onRowChange(index, 'quantity', quantityValue);
    onRowChange(index, 'inspectionTarget', data.inspectionTarget || '산업안전보건법');
    onRowChange(index, 'safetyDevice', data.safetyDevice);
    onRowChange(index, 'inspectionCycle', data.inspectionCycle);
    onRowChange(index, 'accidentForm', data.accidentForm);
    onRowChange(index, 'remark', data.remark);
    handleCloseModal();
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
              backgroundColor: 'transparent',
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
              <th style={{ width: 48 }}>순번</th>
              <th style={{ width: 160 }}>기계.기구. 설비명</th>
              <th style={{ width: 96 }}>관리번호</th>
              <th style={{ width: 88 }}>용량</th>
              <th style={{ width: 96 }}>
                단위작업
                <br />
                장소
              </th>
              <th style={{ width: 68 }}>수량</th>
              <th style={{ width: 311 }}>검사대상</th>
              <th style={{ width: 118 }}>방호장치</th>
              <th style={{ width: 76 }}>점검주기</th>
              <th style={{ width: 88 }}>
                발생가능
                <br />
                재해형태
              </th>
              <th style={{ width: 120 }}>비고</th>
              <th style={{ width: 46 }}>이동</th>
              <th style={{ width: 55 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.number}
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
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: '22px',
                      textAlign: 'center',
                    }}
                  >
                    {row.number}
                  </Typography>
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.name}
                    onChange={(e) => onRowChange(index, 'name', e.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal(index)}
                            sx={{ p: 0.5 }}
                          >
                            <Iconify icon="eva:search-fill" width={18} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.id}
                    onChange={(e) => onRowChange(index, 'id', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.capacity}
                    onChange={(e) => onRowChange(index, 'capacity', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.location}
                    onChange={(e) => onRowChange(index, 'location', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      onRowChange(
                        index,
                        'quantity',
                        value === ''
                          ? ''
                          : Number.isNaN(Number(value))
                            ? row.quantity
                            : Number(value)
                      );
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  {row.inspectionTarget === '직접입력' ||
                  (row.inspectionTarget &&
                    !INSPECTION_TARGET_OPTIONS.includes(
                      row.inspectionTarget as (typeof INSPECTION_TARGET_OPTIONS)[number]
                    )) ? (
                    <TextField
                      size="small"
                      value={row.inspectionTarget === '직접입력' ? '' : row.inspectionTarget}
                      onChange={(e) => onRowChange(index, 'inspectionTarget', e.target.value)}
                      onBlur={() => {
                        if (!row.inspectionTarget) {
                          onRowChange(index, 'inspectionTarget', '직접입력');
                        }
                      }}
                      placeholder="직접 입력"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                          height: 'auto',
                        },
                      }}
                    />
                  ) : (
                    <FormControl fullWidth size="small">
                      <Select
                        value={row.inspectionTarget || '산업안전보건법'}
                        onChange={(e) => onRowChange(index, 'inspectionTarget', e.target.value)}
                        displayEmpty
                        sx={{
                          fontSize: 14,
                          height: 'auto',
                          '& .MuiSelect-select': {
                            py: 1,
                          },
                        }}
                      >
                        {INSPECTION_TARGET_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.safetyDevice}
                    onChange={(e) => onRowChange(index, 'safetyDevice', e.target.value)}
                    fullWidth
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.inspectionCycle}
                    onChange={(e) => onRowChange(index, 'inspectionCycle', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.accidentForm}
                    onChange={(e) => onRowChange(index, 'accidentForm', e.target.value)}
                    fullWidth
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
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
                      },
                    }}
                  />
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
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
                      fontSize: 13,
                      fontWeight: 700,
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

      {/* 기계·설비 검색 모달 */}
      {rows.map((row, index) => (
        <MachineEquipmentSelectModal
          key={row.number}
          open={modalOpenIndex === index}
          onClose={handleCloseModal}
          onConfirm={(data) => handleModalConfirm(index, data)}
          initialData={{
            name: row.name,
            id: row.id,
            capacity: row.capacity,
            location: row.location,
            quantity: typeof row.quantity === 'number' ? String(row.quantity) : row.quantity,
            inspectionTarget: row.inspectionTarget || '산업안전보건법',
            safetyDevice: row.safetyDevice,
            inspectionCycle: row.inspectionCycle,
            accidentForm: row.accidentForm,
            remark: row.remark,
          }}
        />
      ))}
    </Box>
  );
}
