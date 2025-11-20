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
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import type { Table2300Row, InvestigationTeamMember } from '../../types/table-data';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';
import type { RiskAssessmentData } from '../../components/RiskAssessmentSettingModal';

// ----------------------------------------------------------------------

// 구분 옵션
const DIVISION_OPTIONS = [
  '기계적 요인',
  '전기적 요인',
  '화학적 요인',
  '물리적 요인',
  '생물학적 요인',
  '인간공학적 요인',
  '작업환경 요인',
] as const;

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
  rows: Table2300Row[];
  onRowChange: (index: number, field: keyof Table2300Row, value: any) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (fromIndex: number, toIndex: number) => void;
  onAddRow: () => void;
  riskAssessmentData: RiskAssessmentData;
};

export default function Table2300Form({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
  riskAssessmentData,
}: Props) {
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openDueDatePicker, setOpenDueDatePicker] = useState<{ [key: number]: boolean }>({});
  const [openCompletedDatePicker, setOpenCompletedDatePicker] = useState<{
    [key: number]: boolean;
  }>({});
  const [ownerModalIndex, setOwnerModalIndex] = useState<number | null>(null);

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

  // 위험도 값에 따라 해당하는 label 찾기
  const getRiskLabel = (riskValue: number): string => {
    const enabledRanges = riskAssessmentData.riskRanges.filter((range) => range.enabled);
    const matchingRange = enabledRanges.find(
      (range) => riskValue >= range.min && riskValue <= range.max
    );
    return matchingRange ? matchingRange.label : '';
  };

  const handleRiskChange = (
    index: number,
    field: 'currentRisk' | 'postRisk',
    subField: 'value' | 'label',
    value: number | string
  ) => {
    const row = rows[index];
    const currentRiskData = field === 'currentRisk' ? row.currentRisk : row.postRisk;
    const newRiskData = {
      ...currentRiskData,
      [subField]: subField === 'value' ? (value as number) : (value as string),
    };

    // value가 변경되면 위험도 설정 데이터를 사용하여 label 자동 업데이트
    if (subField === 'value') {
      const riskLabel = getRiskLabel(value as number);
      newRiskData.label = riskLabel;
    }

    onRowChange(index, field, newRiskData);
  };

  const handleOpenOwnerModal = (index: number) => {
    setOwnerModalIndex(index);
  };

  const handleCloseOwnerModal = () => {
    setOwnerModalIndex(null);
  };

  const handleOwnerSearchConfirm = (members: InvestigationTeamMember[]) => {
    if (ownerModalIndex !== null) {
      const selected = members[0];
      if (selected) {
        onRowChange(ownerModalIndex, 'owner', selected.name);
      }
    }
    handleCloseOwnerModal();
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
    },
    '& td': {
      padding: '4px',
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr style={{ height: 60 }}>
                <th rowSpan={2} style={{ width: 126 }}>
                  구분
                </th>
                <th colSpan={2} style={{ width: 164 }}>
                  유해·위험요인 파악
                </th>
                <th colSpan={1} style={{ width: 200 }}>
                  관련근거
                </th>
                <th rowSpan={2} style={{ width: 92 }}>
                  현재 위험성
                </th>
                <th colSpan={2} style={{ width: 182 }}>
                  감소대책
                </th>
                <th rowSpan={2} style={{ width: 80 }}>
                  개선후 위험성
                </th>
                <th rowSpan={2} style={{ width: 73 }}>
                  담당자
                </th>
                <th rowSpan={2} style={{ width: 113 }}>
                  조치요구일
                </th>
                <th rowSpan={2} style={{ width: 117 }}>
                  조치 완료일
                </th>
                <th rowSpan={2} style={{ width: 50 }}>
                  완료
                </th>
                <th rowSpan={2} style={{ width: 46 }}>
                  이동
                </th>
                <th rowSpan={2} style={{ width: 55 }}>
                  삭제
                </th>
              </tr>
              <tr style={{ height: 60 }}>
                <th style={{ width: 80 }}>원인</th>
                <th style={{ width: 120 }}>유해·위험요인</th>
                <th style={{ width: 120 }}>법규/노출기준 등</th>
                <th style={{ width: 80 }}>NO</th>
                <th style={{ width: 73 }}>세부내용</th>
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
                    <FormControl size="small" fullWidth>
                      <Select
                        value={row.division || ''}
                        onChange={(e) => onRowChange(index, 'division', e.target.value)}
                        displayEmpty
                        sx={{
                          fontSize: 14,
                          '& .MuiSelect-select': {
                            py: 1,
                          },
                        }}
                      >
                        <MenuItem value="" sx={{ fontSize: 14 }}>
                          <em />
                        </MenuItem>
                        {DIVISION_OPTIONS.map((option) => (
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
                      value={row.cause}
                      onChange={(e) => onRowChange(index, 'cause', e.target.value)}
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
                      value={row.hazard}
                      onChange={(e) => onRowChange(index, 'hazard', e.target.value)}
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
                      value={row.reference}
                      onChange={(e) => onRowChange(index, 'reference', e.target.value)}
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.currentRisk.value || RISK_LEVEL_OPTIONS[0].value}
                          onChange={(e) => {
                            const riskValue = Number(e.target.value);
                            if (riskValue) {
                              handleRiskChange(index, 'currentRisk', 'value', riskValue);
                            }
                          }}
                          sx={{
                            fontSize: 14,
                            height: 'auto',
                            '& .MuiSelect-select': {
                              py: 1,
                            },
                          }}
                        >
                          {RISK_LEVEL_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ fontSize: 14 }}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {(row.currentRisk.value || RISK_LEVEL_OPTIONS[0].value) &&
                        (row.currentRisk.label || getRiskLabel(RISK_LEVEL_OPTIONS[0].value)) && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: 'text.secondary',
                              textAlign: 'center',
                            }}
                          >
                            ({row.currentRisk.label || getRiskLabel(RISK_LEVEL_OPTIONS[0].value)})
                          </Typography>
                        )}
                    </Box>
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={row.reductionNo}
                      onChange={(e) => onRowChange(index, 'reductionNo', e.target.value)}
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
                      value={row.reductionDetail}
                      onChange={(e) => onRowChange(index, 'reductionDetail', e.target.value)}
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.postRisk.value || RISK_LEVEL_OPTIONS[0].value}
                          onChange={(e) => {
                            const riskValue = Number(e.target.value);
                            if (riskValue) {
                              handleRiskChange(index, 'postRisk', 'value', riskValue);
                            }
                          }}
                          sx={{
                            fontSize: 14,
                            height: 'auto',
                            '& .MuiSelect-select': {
                              py: 1,
                            },
                          }}
                        >
                          {RISK_LEVEL_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ fontSize: 14 }}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {(row.postRisk.value || RISK_LEVEL_OPTIONS[0].value) &&
                        (row.postRisk.label || getRiskLabel(RISK_LEVEL_OPTIONS[0].value)) && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: 'text.secondary',
                              textAlign: 'center',
                            }}
                          >
                            ({row.postRisk.label || getRiskLabel(RISK_LEVEL_OPTIONS[0].value)})
                          </Typography>
                        )}
                    </Box>
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={row.owner}
                      onChange={(e) => onRowChange(index, 'owner', e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                          height: 'auto',
                          p: 0,
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton color="inherit" onClick={() => handleOpenOwnerModal(index)}>
                              <Iconify icon="eva:search-fill" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </td>
                  <td>
                    <DatePicker
                      format="YYYY-MM-DD"
                      open={openDueDatePicker[index] || false}
                      onOpen={() => setOpenDueDatePicker((prev) => ({ ...prev, [index]: true }))}
                      onClose={() => setOpenDueDatePicker((prev) => ({ ...prev, [index]: false }))}
                      value={row.dueDate ? dayjs(row.dueDate) : null}
                      onChange={(newValue: Dayjs | null) => {
                        onRowChange(
                          index,
                          'dueDate',
                          newValue ? newValue.format('YYYY-MM-DD') : ''
                        );
                        setOpenDueDatePicker((prev) => ({ ...prev, [index]: false }));
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          onClick: () => {
                            setOpenDueDatePicker((prev) => ({ ...prev, [index]: true }));
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
                              display: row.dueDate ? 'none' : 'flex',
                            },
                          },
                        },
                      }}
                    />
                  </td>
                  <td>
                    <DatePicker
                      format="YYYY-MM-DD"
                      open={openCompletedDatePicker[index] || false}
                      onOpen={() =>
                        setOpenCompletedDatePicker((prev) => ({ ...prev, [index]: true }))
                      }
                      onClose={() =>
                        setOpenCompletedDatePicker((prev) => ({ ...prev, [index]: false }))
                      }
                      value={row.completedAt ? dayjs(row.completedAt) : null}
                      onChange={(newValue: Dayjs | null) => {
                        onRowChange(
                          index,
                          'completedAt',
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
                              display: row.completedAt ? 'none' : 'flex',
                            },
                          },
                        },
                      }}
                    />
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Checkbox
                        checked={row.done || false}
                        onChange={(e) => onRowChange(index, 'done', e.target.checked)}
                        size="small"
                      />
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                      <IconButton
                        size="small"
                        sx={{
                          cursor: 'grab',
                          '&:active': {
                            cursor: 'grabbing',
                          },
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" width={20} />
                      </IconButton>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
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
                    </Box>
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
          <InvestigationTeamSelectModal
            key={`owner-${index}`}
            open={ownerModalIndex === index}
            onClose={handleCloseOwnerModal}
            onConfirm={handleOwnerSearchConfirm}
          />
        ))}
      </Box>
    </LocalizationProvider>
  );
}
