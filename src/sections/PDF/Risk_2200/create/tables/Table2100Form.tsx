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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import type {
  Table2100Data,
  Table2100ClassificationRow,
  Table2100AssessmentRow,
} from '../../types/table-data';

// ----------------------------------------------------------------------

// 위험성 옵션
const RISK_LEVEL_OPTIONS = [
  { value: 1, label: '1 (낮음)' },
  { value: 2, label: '2 (낮음)' },
  { value: 3, label: '3 (낮음)' },
  { value: 4, label: '4 (낮음)' },
  { value: 5, label: '5 (낮음)' },
  { value: 6, label: '6 (관리필요)' },
  { value: 8, label: '8 (관리필요)' },
  { value: 9, label: '9 (관리필요)' },
  { value: 10, label: '10 (관리필요)' },
  { value: 12, label: '12 (관리필요)' },
  { value: 15, label: '15 (관리필요)' },
  { value: 16, label: '16 (관리필요)' },
  { value: 20, label: '20 (관리필요)' },
  { value: 25, label: '25 (관리필요)' },
] as const;

// ----------------------------------------------------------------------

type Props = {
  data: Table2100Data;
  onDataChange: (data: Table2100Data) => void;
};

export default function Table2100Form({ data, onDataChange }: Props) {
  const theme = useTheme();
  const [draggedClassificationIndex, setDraggedClassificationIndex] = useState<number | null>(null);
  const [dragOverClassificationIndex, setDragOverClassificationIndex] = useState<number | null>(
    null
  );
  const [draggedAssessmentIndex, setDraggedAssessmentIndex] = useState<number | null>(null);
  const [dragOverAssessmentIndex, setDragOverAssessmentIndex] = useState<number | null>(null);
  const [openPlannedDatePicker, setOpenPlannedDatePicker] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [openCompletedDatePicker, setOpenCompletedDatePicker] = useState<{
    [key: number]: boolean;
  }>({});

  // 위험요인 분류 테이블 핸들러
  const handleClassificationDragStart = (index: number) => {
    setDraggedClassificationIndex(index);
  };

  const handleClassificationDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedClassificationIndex !== null && draggedClassificationIndex !== index) {
      setDragOverClassificationIndex(index);
    }
  };

  const handleClassificationDragLeave = () => {
    setDragOverClassificationIndex(null);
  };

  const handleClassificationDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedClassificationIndex !== null && draggedClassificationIndex !== dropIndex) {
      const newRows = [...data.classification];
      const [movedRow] = newRows.splice(draggedClassificationIndex, 1);
      newRows.splice(dropIndex, 0, movedRow);
      // 번호 재정렬
      newRows.forEach((row, i) => {
        row.number = i + 1;
      });
      onDataChange({ ...data, classification: newRows });
    }
    setDraggedClassificationIndex(null);
    setDragOverClassificationIndex(null);
  };

  const handleClassificationDragEnd = () => {
    setDraggedClassificationIndex(null);
    setDragOverClassificationIndex(null);
  };

  const handleClassificationChange = (
    index: number,
    field: keyof Table2100ClassificationRow,
    value: string | number
  ) => {
    const newRows = [...data.classification];
    newRows[index] = { ...newRows[index], [field]: value };
    if (field === 'number') {
      // 번호 변경 시 재정렬
      newRows.forEach((row, i) => {
        row.number = i + 1;
      });
    }
    onDataChange({ ...data, classification: newRows });
  };

  const handleClassificationDelete = (index: number) => {
    const newRows = data.classification.filter((_, i) => i !== index);
    // 번호 재정렬
    newRows.forEach((row, i) => {
      row.number = i + 1;
    });
    onDataChange({ ...data, classification: newRows });
  };

  const handleClassificationAddRow = () => {
    const newRow: Table2100ClassificationRow = {
      number: data.classification.length + 1,
      category: '',
      hazardFactors: '',
    };
    onDataChange({ ...data, classification: [...data.classification, newRow] });
  };

  // 위험성 평가 테이블 핸들러
  const handleAssessmentDragStart = (index: number) => {
    setDraggedAssessmentIndex(index);
  };

  const handleAssessmentDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedAssessmentIndex !== null && draggedAssessmentIndex !== index) {
      setDragOverAssessmentIndex(index);
    }
  };

  const handleAssessmentDragLeave = () => {
    setDragOverAssessmentIndex(null);
  };

  const handleAssessmentDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedAssessmentIndex !== null && draggedAssessmentIndex !== dropIndex) {
      const newRows = [...data.assessment];
      const [movedRow] = newRows.splice(draggedAssessmentIndex, 1);
      newRows.splice(dropIndex, 0, movedRow);
      onDataChange({ ...data, assessment: newRows });
    }
    setDraggedAssessmentIndex(null);
    setDragOverAssessmentIndex(null);
  };

  const handleAssessmentDragEnd = () => {
    setDraggedAssessmentIndex(null);
    setDragOverAssessmentIndex(null);
  };

  const handleAssessmentChange = (
    index: number,
    field: keyof Table2100AssessmentRow,
    value: string | { value: number; label: string }
  ) => {
    const newRows = [...data.assessment];
    newRows[index] = { ...newRows[index], [field]: value };
    onDataChange({ ...data, assessment: newRows });
  };

  const handleAssessmentDelete = (index: number) => {
    const newRows = data.assessment.filter((_, i) => i !== index);
    onDataChange({ ...data, assessment: newRows });
  };

  const handleAssessmentAddRow = () => {
    const newRow: Table2100AssessmentRow = {
      hazardFactor: '',
      dangerousSituation: '',
      currentSafetyMeasure: '',
      riskLevel: { value: 0, label: '' },
      additionalMeasure: '',
      responsiblePerson: '',
      plannedDate: '',
      completedDate: '',
    };
    onDataChange({ ...data, assessment: [...data.assessment, newRow] });
  };

  const tableStyle = {
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
  };

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
    >
      {/* 첫 번째 테이블: 위험요인 분류 */}
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 2,
            textAlign: 'left',
          }}
        >
          위험요인 분류
        </Typography>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ width: 94 }}>번호</th>
              <th style={{ width: 164 }}>구분</th>
              <th style={{ flex: 1 }}>해당 유해, 위험요인</th>
              <th style={{ width: 46 }}>이동</th>
              <th style={{ width: 55 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.classification.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleClassificationDragStart(index)}
                onDragOver={(e) => handleClassificationDragOver(e, index)}
                onDragLeave={handleClassificationDragLeave}
                onDrop={(e) => handleClassificationDrop(e, index)}
                onDragEnd={handleClassificationDragEnd}
                style={{
                  opacity: draggedClassificationIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverClassificationIndex === index && draggedClassificationIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
                  cursor: 'move',
                  height: 48,
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
                    value={row.category}
                    onChange={(e) => handleClassificationChange(index, 'category', e.target.value)}
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
                    value={row.hazardFactors}
                    onChange={(e) =>
                      handleClassificationChange(index, 'hazardFactors', e.target.value)
                    }
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
                    onClick={() => handleClassificationDelete(index)}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 3 }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={handleClassificationAddRow}
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
      </Box>

      {/* 두 번째 테이블: 위험성 평가 */}
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 2,
            textAlign: 'left',
          }}
        >
          위험성 평가
        </Typography>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ width: 160 }}>유해/위험요인</th>
              <th style={{ width: 199 }}>위험한 상황과 결과</th>
              <th style={{ width: 160 }}>현재 안전조치</th>
              <th style={{ width: 120 }}>위험성</th>
              <th style={{ width: 220 }}>추가조치사항</th>
              <th style={{ width: 120 }}>담당자</th>
              <th style={{ width: 120 }}>예정일</th>
              <th style={{ width: 120 }}>완료일</th>
              <th style={{ width: 46 }}>이동</th>
              <th style={{ width: 55 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.assessment.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleAssessmentDragStart(index)}
                onDragOver={(e) => handleAssessmentDragOver(e, index)}
                onDragLeave={handleAssessmentDragLeave}
                onDrop={(e) => handleAssessmentDrop(e, index)}
                onDragEnd={handleAssessmentDragEnd}
                style={{
                  opacity: draggedAssessmentIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverAssessmentIndex === index && draggedAssessmentIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
                  cursor: 'move',
                  height: index === 0 ? 72 : index === 1 ? 72 : 48,
                }}
              >
                <td>
                  <TextField
                    size="small"
                    value={row.hazardFactor}
                    onChange={(e) => handleAssessmentChange(index, 'hazardFactor', e.target.value)}
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
                    value={row.dangerousSituation}
                    onChange={(e) =>
                      handleAssessmentChange(index, 'dangerousSituation', e.target.value)
                    }
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
                    value={row.currentSafetyMeasure}
                    onChange={(e) =>
                      handleAssessmentChange(index, 'currentSafetyMeasure', e.target.value)
                    }
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
                      value={row.riskLevel?.value || ''}
                      onChange={(e) => {
                        const selectedOption = RISK_LEVEL_OPTIONS.find(
                          (opt) => opt.value === Number(e.target.value)
                        );
                        if (selectedOption) {
                          handleAssessmentChange(index, 'riskLevel', selectedOption);
                        }
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
                      {RISK_LEVEL_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: 14 }}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.additionalMeasure}
                    onChange={(e) =>
                      handleAssessmentChange(index, 'additionalMeasure', e.target.value)
                    }
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
                    value={row.responsiblePerson}
                    onChange={(e) =>
                      handleAssessmentChange(index, 'responsiblePerson', e.target.value)
                    }
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="YYYY-MM-DD"
                      open={openPlannedDatePicker[index] || false}
                      onOpen={() =>
                        setOpenPlannedDatePicker((prev) => ({ ...prev, [index]: true }))
                      }
                      onClose={() =>
                        setOpenPlannedDatePicker((prev) => ({ ...prev, [index]: false }))
                      }
                      value={row.plannedDate ? dayjs(row.plannedDate) : null}
                      onChange={(newValue: Dayjs | null) => {
                        handleAssessmentChange(
                          index,
                          'plannedDate',
                          newValue ? newValue.format('YYYY-MM-DD') : ''
                        );
                        setOpenPlannedDatePicker((prev) => ({ ...prev, [index]: false }));
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          onClick: () => {
                            setOpenPlannedDatePicker((prev) => ({ ...prev, [index]: true }));
                          },
                          sx: {
                            maxWidth: 120,
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                            '& input': {
                              cursor: 'pointer',
                            },
                            '& .MuiInputAdornment-root': {
                              display: row.plannedDate ? 'none' : 'flex',
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </td>
                <td>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="YYYY-MM-DD"
                      open={openCompletedDatePicker[index] || false}
                      onOpen={() =>
                        setOpenCompletedDatePicker((prev) => ({ ...prev, [index]: true }))
                      }
                      onClose={() =>
                        setOpenCompletedDatePicker((prev) => ({ ...prev, [index]: false }))
                      }
                      value={row.completedDate ? dayjs(row.completedDate) : null}
                      onChange={(newValue: Dayjs | null) => {
                        handleAssessmentChange(
                          index,
                          'completedDate',
                          newValue ? newValue.format('YYYY-MM-DD') : ''
                        );
                        setOpenCompletedDatePicker((prev) => ({ ...prev, [index]: false }));
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          onClick: () => {
                            setOpenCompletedDatePicker((prev) => ({ ...prev, [index]: true }));
                          },
                          sx: {
                            maxWidth: 120,
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                            '& input': {
                              cursor: 'pointer',
                            },
                            '& .MuiInputAdornment-root': {
                              display: row.completedDate ? 'none' : 'flex',
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
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
                    onClick={() => handleAssessmentDelete(index)}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 3 }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={handleAssessmentAddRow}
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
      </Box>
    </Box>
  );
}
