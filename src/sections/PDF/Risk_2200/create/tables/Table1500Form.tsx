import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import type { Table1500Row } from '../../types/table-data';
import ChemicalNameSearchModal from './modal/ChemicalNameSearchModal';
import MachineEquipment1500Modal from './modal/MachineEquipment1500Modal';

// ----------------------------------------------------------------------

// 빈도 옵션 (1-5)
const FREQ_OPTIONS = [1, 2, 3, 4, 5] as const;

// 심각도 옵션 (1-5)
const SEV_OPTIONS = [1, 2, 3, 4, 5] as const;

// 평가 옵션 (빈도 × 심각도 결과에 따른 평가)
const EVAL_OPTIONS = [
  '1 (낮음)',
  '2 (낮음)',
  '3 (낮음)',
  '4 (낮음)',
  '5 (낮음)',
  '6 (관리필요)',
  '8 (관리필요)',
  '9 (관리필요)',
  '10 (관리필요)',
  '12 (관리필요)',
  '15 (관리필요)',
  '16 (관리필요)',
  '20 (관리필요)',
  '25 (관리필요)',
] as const;

// ----------------------------------------------------------------------

type Props = {
  rows: Table1500Row[];
  onRowChange: (index: number, field: keyof Table1500Row, value: string | number) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (fromIndex: number, toIndex: number) => void;
  onAddRow: () => void;
};

export default function Table1500Form({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
}: Props) {
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [chemicalModalOpenIndex, setChemicalModalOpenIndex] = useState<number | null>(null);
  const [machineModalOpenIndex, setMachineModalOpenIndex] = useState<number | null>(null);

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

  const handleOpenChemicalModal = (index: number) => {
    setChemicalModalOpenIndex(index);
  };

  const handleCloseChemicalModal = () => {
    setChemicalModalOpenIndex(null);
  };

  const handleChemicalModalConfirm = (index: number, chemicalName: string) => {
    onRowChange(index, 'chemical', chemicalName);
    handleCloseChemicalModal();
  };

  const handleOpenMachineModal = (index: number) => {
    setMachineModalOpenIndex(index);
  };

  const handleCloseMachineModal = () => {
    setMachineModalOpenIndex(null);
  };

  const handleMachineModalConfirm = (
    index: number,
    data: {
      machine: string;
      machineId: string;
      accidentForm: string;
      freq: number | string;
      sev: number | string;
      evalLabel: string;
      remark: string;
    }
  ) => {
    onRowChange(index, 'machine', data.machine);
    onRowChange(index, 'machineId', data.machineId);
    onRowChange(index, 'accidentForm', data.accidentForm);
    onRowChange(index, 'freq', data.freq);
    onRowChange(index, 'sev', data.sev);
    onRowChange(index, 'evalLabel', data.evalLabel);
    onRowChange(index, 'remark', data.remark);
    handleCloseMachineModal();
  };

  // 빈도와 심각도가 변경되면 평가 계산
  const handleFreqOrSevChange = (index: number, field: 'freq' | 'sev', value: number | string) => {
    onRowChange(index, field, value);
    const row = rows[index];
    const freq =
      field === 'freq' ? (typeof value === 'number' ? value : Number(value) || 0) : row.freq;
    const sev =
      field === 'sev' ? (typeof value === 'number' ? value : Number(value) || 0) : row.sev;

    if (typeof freq === 'number' && typeof sev === 'number' && freq > 0 && sev > 0) {
      const evalValue = freq * sev;
      // 평가 옵션에서 해당 값 찾기
      const evalOption = EVAL_OPTIONS.find((opt) => {
        const num = parseInt(opt.split(' ')[0], 10);
        return num === evalValue;
      });
      if (evalOption) {
        onRowChange(index, 'evalLabel', evalOption);
      } else {
        // 옵션에 없는 경우 직접 입력 형식으로
        onRowChange(index, 'evalLabel', `${evalValue}`);
      }
    }
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
            },
            '& td': {
              padding: '4px',
            },
          }}
        >
          <thead>
            <tr style={{ height: 60 }}>
              <th rowSpan={2} style={{ width: 94 }}>
                단위작업장소
              </th>
              <th rowSpan={2} style={{ width: 99 }}>
                작업내용
              </th>
              <th rowSpan={2} style={{ width: 88 }}>
                위험코드
              </th>
              <th colSpan={2} style={{ width: 203 }}>
                기계·기구·설비
              </th>
              <th colSpan={2} style={{ width: 200 }}>
                화학물질
              </th>
              <th rowSpan={2} style={{ width: 99 }}>
                발생가능
                <br />
                재해형태
              </th>
              <th rowSpan={2} style={{ width: 92 }}>
                관련 협력업체
              </th>
              <th colSpan={3} style={{ width: 240 }}>
                위험성 평가
              </th>
              <th rowSpan={2} style={{ width: 104 }}>
                비고
              </th>
              <th rowSpan={2} style={{ width: 46 }}>
                이동
              </th>
              <th rowSpan={2} style={{ width: 55 }}>
                삭제
              </th>
            </tr>
            <tr style={{ height: 60 }}>
              <th style={{ width: 119 }}>
                기계·
                <br />
                기구·설비명
              </th>
              <th style={{ width: 104 }}>관리번호</th>
              <th style={{ width: 100 }}>화학물질명</th>
              <th style={{ width: 100 }}>CAS No</th>
              <th style={{ width: 60 }}>빈도</th>
              <th style={{ width: 60 }}>심각도</th>
              <th style={{ width: 120 }}>평가</th>
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
                  height: index === 0 ? 96 : index === 1 ? 72 : 48,
                }}
              >
                <td>
                  <TextField
                    size="small"
                    value={row.unit}
                    onChange={(e) => onRowChange(index, 'unit', e.target.value)}
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
                    value={row.work}
                    onChange={(e) => onRowChange(index, 'work', e.target.value)}
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
                    value={row.hazardCode}
                    onChange={(e) => onRowChange(index, 'hazardCode', e.target.value)}
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
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={[]}
                    value={row.machine || ''}
                    onInputChange={(_, newValue) => {
                      onRowChange(index, 'machine', newValue);
                    }}
                    disableClearable
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  edge="end"
                                  onClick={() => handleOpenMachineModal(index)}
                                >
                                  <Iconify icon="eva:search-fill" width={20} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: 14,
                            height: 'auto',
                          },
                        }}
                      />
                    )}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.machineId}
                    onChange={(e) => onRowChange(index, 'machineId', e.target.value)}
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
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={[]} // TODO: TanStack Query Hook(useQuery)으로 화학물질 목록 가져오기
                    // const { data: chemicals } = useQuery({
                    //   queryKey: ['chemicals'],
                    //   queryFn: () => getChemicals(),
                    // });
                    // options={chemicals?.body?.chemicals || []}
                    value={row.chemical}
                    onInputChange={(_, newValue) => {
                      onRowChange(index, 'chemical', newValue);
                    }}
                    disableClearable
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  edge="end"
                                  onClick={() => handleOpenChemicalModal(index)}
                                >
                                  <Iconify icon="eva:search-fill" width={20} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: 14,
                            height: 'auto',
                          },
                        }}
                      />
                    )}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.casNo}
                    onChange={(e) => onRowChange(index, 'casNo', e.target.value)}
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
                    value={row.partner}
                    onChange={(e) => onRowChange(index, 'partner', e.target.value)}
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
                  <FormControl fullWidth size="small">
                    <Select
                      value={row.freq || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        handleFreqOrSevChange(index, 'freq', value);
                      }}
                      displayEmpty
                      sx={{
                        fontSize: 14,
                        height: 'auto',
                        '& .MuiSelect-select': {
                          py: 1,
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: 14 }}>
                        <em />
                      </MenuItem>
                      {FREQ_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
                <td>
                  <FormControl fullWidth size="small">
                    <Select
                      value={row.sev || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        handleFreqOrSevChange(index, 'sev', value);
                      }}
                      displayEmpty
                      sx={{
                        fontSize: 14,
                        height: 'auto',
                        '& .MuiSelect-select': {
                          py: 1,
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: 14 }}>
                        <em />
                      </MenuItem>
                      {SEV_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.evalLabel}
                    onChange={(e) => onRowChange(index, 'evalLabel', e.target.value)}
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
                    value={row.remark}
                    onChange={(e) => onRowChange(index, 'remark', e.target.value)}
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
                      minHeight: 30,
                      fontSize: 13,
                      fontWeight: 700,
                      px: 1,
                      py: 0.5,
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

      {rows.map((row, index) => (
        <ChemicalNameSearchModal
          key={`chemical-${index}`}
          open={chemicalModalOpenIndex === index}
          onClose={handleCloseChemicalModal}
          onConfirm={(chemicalName) => handleChemicalModalConfirm(index, chemicalName)}
          initialValue={row.chemical || ''}
        />
      ))}

      {rows.map((row, index) => (
        <MachineEquipment1500Modal
          key={`machine-${index}`}
          open={machineModalOpenIndex === index}
          onClose={handleCloseMachineModal}
          onConfirm={(data) => handleMachineModalConfirm(index, data)}
          initialData={{
            machine: row.machine || '',
            machineId: row.machineId || '',
            accidentForm: row.accidentForm || '',
            freq: row.freq || '',
            sev: row.sev || '',
            evalLabel: row.evalLabel || '',
            remark: row.remark || '',
          }}
        />
      ))}
    </Box>
  );
}
