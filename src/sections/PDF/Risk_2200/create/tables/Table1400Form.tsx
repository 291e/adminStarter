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
import type {
  Table1400Data,
  Table1400ChemicalRow,
  Table1400PhysicalRow,
  Table1400BiologicalRow,
  Table1400ErgonomicRow,
} from '../../types/table-data';

// ----------------------------------------------------------------------

// 구분 옵션
const CATEGORY_OPTIONS = ['화학적', '물리적', '생물학적', '인간공학적'] as const;

type CategoryType = (typeof CATEGORY_OPTIONS)[number];

// 통합 행 타입 (UI 렌더링용 - 카테고리 정보 포함)
// 화학적일 때도 위치, 부서, 노출위험, 관리대책 필드를 사용할 수 있도록 확장
type UnifiedRow =
  | ({ category: '화학적' } & Table1400ChemicalRow & {
        location?: string;
        department?: string;
        exposureRisk?: string;
        managementMeasure?: string;
      })
  | ({ category: '물리적' } & Table1400PhysicalRow)
  | ({ category: '생물학적' } & Table1400BiologicalRow)
  | ({ category: '인간공학적' } & Table1400ErgonomicRow);

// Table1400Data를 통합 행 배열로 변환
function dataToUnifiedRows(data: Table1400Data): UnifiedRow[] {
  const rows: UnifiedRow[] = [];
  data.chemical.forEach((row) =>
    rows.push({
      category: '화학적',
      ...row,
      location: '',
      department: '',
      exposureRisk: '',
      managementMeasure: '',
    })
  );
  data.physical.forEach((row) => rows.push({ category: '물리적', ...row }));
  data.biological.forEach((row) => rows.push({ category: '생물학적', ...row }));
  data.ergonomic.forEach((row) => rows.push({ category: '인간공학적', ...row }));
  return rows;
}

// 통합 행 배열을 Table1400Data로 변환
function unifiedRowsToData(rows: UnifiedRow[]): Table1400Data {
  const data: Table1400Data = {
    chemical: [],
    physical: [],
    biological: [],
    ergonomic: [],
  };

  rows.forEach((row) => {
    if (row.category === '화학적') {
      const { category, location, department, exposureRisk, managementMeasure, ...rest } = row;
      // 화학적 행에는 location, department, exposureRisk, managementMeasure를 제외하고 저장
      data.chemical.push(rest);
    } else if (row.category === '물리적') {
      const { category, ...rest } = row;
      data.physical.push(rest);
    } else if (row.category === '생물학적') {
      const { category, ...rest } = row;
      data.biological.push(rest);
    } else if (row.category === '인간공학적') {
      const { category, ...rest } = row;
      data.ergonomic.push(rest);
    }
  });

  return data;
}

// 노출위험 옵션 (셀렉트용)
const EXPOSURE_RISK_OPTIONS = ['낮음', '보통', '높음', '매우 높음', '직접입력'] as const;

// ----------------------------------------------------------------------

type Props = {
  data: Table1400Data;
  onDataChange: (data: Table1400Data) => void;
};

export default function Table1400Form({ data, onDataChange }: Props) {
  // 통합 행 배열로 변환
  const unifiedRows = dataToUnifiedRows(data);
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
      handleRowMove(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    const newRows = [...unifiedRows];
    newRows[index] = { ...newRows[index], [field]: value };
    onDataChange(unifiedRowsToData(newRows));
  };

  const handleRowDelete = (index: number) => {
    const newRows = unifiedRows.filter((_, i) => i !== index);
    onDataChange(unifiedRowsToData(newRows));
  };

  const handleRowMove = (fromIndex: number, toIndex: number) => {
    const newRows = [...unifiedRows];
    const [movedRow] = newRows.splice(fromIndex, 1);
    newRows.splice(toIndex, 0, movedRow);
    onDataChange(unifiedRowsToData(newRows));
  };

  const handleAddRow = () => {
    const newRow: UnifiedRow = {
      category: '화학적',
      chemicalName: '',
      formula: '',
      casNo: '',
      lowerLimit: '',
      upperLimit: '',
      exposureLimit: '',
      flashPoint: '',
      ignitionPoint: '',
      hazardRisk: '',
      managementStandard: '',
      dailyUsage: '',
      storage: '',
      remark: '',
      location: '',
      department: '',
      exposureRisk: '',
      managementMeasure: '',
    };
    const newRows = [...unifiedRows, newRow];
    onDataChange(unifiedRowsToData(newRows));
  };

  const handleCategoryChange = (index: number, newCategory: CategoryType) => {
    const currentRow = unifiedRows[index];

    // 기존 데이터 추출 (공통 필드 + 카테고리별 필드)
    const currentFactorName = 'factorName' in currentRow ? currentRow.factorName : '';
    const currentChemicalName = 'chemicalName' in currentRow ? currentRow.chemicalName : '';
    const currentLocation = 'location' in currentRow ? currentRow.location : '';
    const currentDepartment = 'department' in currentRow ? currentRow.department : '';
    const currentExposureRisk = 'exposureRisk' in currentRow ? currentRow.exposureRisk : '';
    const currentManagementStandard =
      'managementStandard' in currentRow ? currentRow.managementStandard : '';
    const currentManagementMeasure =
      'managementMeasure' in currentRow ? currentRow.managementMeasure : '';
    const currentRemark = 'remark' in currentRow ? currentRow.remark : '';
    const currentForm = 'form' in currentRow ? currentRow.form : '';
    const currentType = 'type' in currentRow ? currentRow.type : '';

    // 카테고리별 기본 구조로 변환 (기존 데이터 유지)
    let newRow: UnifiedRow;
    if (newCategory === '화학적') {
      newRow = {
        category: '화학적',
        chemicalName: currentChemicalName || currentFactorName, // factorName이 있으면 chemicalName으로 변환
        formula: 'formula' in currentRow ? currentRow.formula : '',
        casNo: 'casNo' in currentRow ? currentRow.casNo : '',
        lowerLimit: 'lowerLimit' in currentRow ? currentRow.lowerLimit : '',
        upperLimit: 'upperLimit' in currentRow ? currentRow.upperLimit : '',
        exposureLimit: 'exposureLimit' in currentRow ? currentRow.exposureLimit : '',
        flashPoint: 'flashPoint' in currentRow ? currentRow.flashPoint : '',
        ignitionPoint: 'ignitionPoint' in currentRow ? currentRow.ignitionPoint : '',
        hazardRisk: 'hazardRisk' in currentRow ? currentRow.hazardRisk : '',
        managementStandard: currentManagementStandard,
        dailyUsage: 'dailyUsage' in currentRow ? currentRow.dailyUsage : '',
        storage: 'storage' in currentRow ? currentRow.storage : '',
        remark: currentRemark,
        location: currentLocation,
        department: currentDepartment,
        exposureRisk: currentExposureRisk,
        managementMeasure: currentManagementMeasure,
      };
    } else if (newCategory === '물리적') {
      newRow = {
        category: '물리적',
        factorName: currentFactorName || currentChemicalName, // chemicalName이 있으면 factorName으로 변환
        form: currentForm || '',
        location: currentLocation || '',
        department: currentDepartment || '',
        exposureRisk: currentExposureRisk || '',
        managementStandard: currentManagementStandard || '',
        managementMeasure: currentManagementMeasure || '',
        remark: currentRemark,
      };
    } else if (newCategory === '생물학적') {
      newRow = {
        category: '생물학적',
        factorName: currentFactorName || currentChemicalName,
        type: currentType || '',
        location: currentLocation || '',
        department: currentDepartment || '',
        exposureRisk: currentExposureRisk || '',
        managementStandard: currentManagementStandard || '',
        managementMeasure: currentManagementMeasure || '',
        remark: currentRemark,
      };
    } else {
      // 인간공학적
      newRow = {
        category: '인간공학적',
        factorName: currentFactorName || currentChemicalName,
        form: currentForm || '',
        location: currentLocation || '',
        department: currentDepartment || '',
        exposureRisk: currentExposureRisk || '',
        managementStandard: currentManagementStandard || '',
        managementMeasure: currentManagementMeasure || '',
        remark: currentRemark,
      };
    }
    const newRows = [...unifiedRows];
    newRows[index] = newRow;
    onDataChange(unifiedRowsToData(newRows));
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
            '& tbody tr': {
              height: '48px',
            },
            '& tbody tr:first-child': {
              height: '59px',
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 110 }}>구분</th>
              <th style={{ flex: 1 }}>유해인자명</th>
              <th style={{ flex: 1 }}>위치</th>
              <th style={{ flex: 1 }}>부서</th>
              <th style={{ flex: 1 }}>노출위험</th>
              <th style={{ flex: 1 }}>관리대책</th>
              <th style={{ flex: 1 }}>비고</th>
              <th style={{ width: 46 }}>이동</th>
              <th style={{ width: 55 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {unifiedRows.map((row, index) => {
              const factorName = row.category === '화학적' ? row.chemicalName : row.factorName;
              // 모든 카테고리에서 location, department, exposureRisk, managementMeasure 사용 가능
              const location = 'location' in row ? row.location || '' : '';
              const department = 'department' in row ? row.department || '' : '';
              const exposureRisk = 'exposureRisk' in row ? row.exposureRisk || '' : '';
              const managementMeasure =
                'managementMeasure' in row ? row.managementMeasure || '' : '';
              const remark = row.remark;

              return (
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
                    <FormControl fullWidth size="small">
                      <Select
                        value={row.category}
                        onChange={(e) =>
                          handleCategoryChange(index, e.target.value as CategoryType)
                        }
                        sx={{
                          fontSize: 14,
                          height: 'auto',
                          '& .MuiSelect-select': {
                            py: 1,
                          },
                        }}
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                    {row.category === '화학적' ? (
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={[]} // TODO: TanStack Query Hook(useQuery)으로 화학물질 목록 가져오기
                        // const { data: chemicals } = useQuery({
                        //   queryKey: ['chemicals'],
                        //   queryFn: () => getChemicals(),
                        // });
                        // options={chemicals?.body?.chemicals || []}
                        value={factorName}
                        onInputChange={(_, newValue) => {
                          handleRowChange(index, 'chemicalName', newValue);
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
                                    <IconButton size="small" edge="end">
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
                    ) : (
                      <TextField
                        size="small"
                        value={factorName}
                        onChange={(e) => {
                          handleRowChange(index, 'factorName', e.target.value);
                        }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: 14,
                            height: 'auto',
                          },
                        }}
                      />
                    )}
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={location}
                      onChange={(e) => handleRowChange(index, 'location', e.target.value)}
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
                      value={department}
                      onChange={(e) => handleRowChange(index, 'department', e.target.value)}
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
                        value={exposureRisk || ''}
                        onChange={(e) => handleRowChange(index, 'exposureRisk', e.target.value)}
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
                          <em>선택하세요</em>
                        </MenuItem>
                        {EXPOSURE_RISK_OPTIONS.filter((option) => option !== '직접입력').map(
                          (option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                              {option}
                            </MenuItem>
                          )
                        )}
                        <MenuItem value="직접입력" sx={{ fontSize: 14 }}>
                          직접입력
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                    <TextField
                      size="small"
                      value={managementMeasure}
                      onChange={(e) => handleRowChange(index, 'managementMeasure', e.target.value)}
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
                      value={remark}
                      onChange={(e) => handleRowChange(index, 'remark', e.target.value)}
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
                      onClick={() => handleRowDelete(index)}
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
              );
            })}
          </tbody>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 5 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={handleAddRow}
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
  );
}
