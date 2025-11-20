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
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import type {
  Table1400Data,
  Table1400ChemicalRow,
  Table1400PhysicalRow,
  Table1400BiologicalRow,
  Table1400ErgonomicRow,
} from '../../types/table-data';
import ChemicalNameSearchModal from './modal/ChemicalNameSearchModal';
import HazardFactorRegisterModal from './modal/HazardFactorRegisterModal';

// ----------------------------------------------------------------------

// 물리적/생물학적/인간공학적 구분 옵션
const NON_CHEMICAL_CATEGORY_OPTIONS = ['물리적', '생물학적', '인간공학적'] as const;

type NonChemicalCategoryType = (typeof NON_CHEMICAL_CATEGORY_OPTIONS)[number];

// 물리적/생물학적/인간공학적 통합 행 타입
type NonChemicalUnifiedRow =
  | ({ category: '물리적' } & Table1400PhysicalRow)
  | ({ category: '생물학적' } & Table1400BiologicalRow)
  | ({ category: '인간공학적' } & Table1400ErgonomicRow);

// Table1400Data를 물리적/생물학적/인간공학적 통합 행 배열로 변환
function dataToNonChemicalUnifiedRows(data: Table1400Data): NonChemicalUnifiedRow[] {
  const rows: NonChemicalUnifiedRow[] = [];
  data.physical.forEach((row) => rows.push({ category: '물리적', ...row }));
  data.biological.forEach((row) => rows.push({ category: '생물학적', ...row }));
  data.ergonomic.forEach((row) => rows.push({ category: '인간공학적', ...row }));
  return rows;
}

// 물리적/생물학적/인간공학적 통합 행 배열을 Table1400Data로 변환
function nonChemicalUnifiedRowsToData(
  rows: NonChemicalUnifiedRow[],
  existingData: Table1400Data
): Table1400Data {
  const data: Table1400Data = {
    chemical: existingData.chemical,
    physical: [],
    biological: [],
    ergonomic: [],
  };

  rows.forEach((row) => {
    if (row.category === '물리적') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...rest } = row;
      data.physical.push(rest);
    } else if (row.category === '생물학적') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...rest } = row;
      data.biological.push(rest);
    } else if (row.category === '인간공학적') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const theme = useTheme();
  const [draggedChemicalIndex, setDraggedChemicalIndex] = useState<number | null>(null);
  const [dragOverChemicalIndex, setDragOverChemicalIndex] = useState<number | null>(null);
  const [draggedNonChemicalIndex, setDraggedNonChemicalIndex] = useState<number | null>(null);
  const [dragOverNonChemicalIndex, setDragOverNonChemicalIndex] = useState<number | null>(null);
  const [chemicalSearchModalIndex, setChemicalSearchModalIndex] = useState<number | null>(null);
  const [hazardFactorModalIndex, setHazardFactorModalIndex] = useState<number | null>(null);

  // 물리적/생물학적/인간공학적 통합 행 배열
  const nonChemicalUnifiedRows = dataToNonChemicalUnifiedRows(data);

  // 화학적 인자 테이블 드래그 핸들러
  const handleChemicalDragStart = (index: number) => {
    setDraggedChemicalIndex(index);
  };

  const handleChemicalDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedChemicalIndex !== null && draggedChemicalIndex !== index) {
      setDragOverChemicalIndex(index);
    }
  };

  const handleChemicalDragLeave = () => {
    setDragOverChemicalIndex(null);
  };

  const handleChemicalDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedChemicalIndex !== null && draggedChemicalIndex !== dropIndex) {
      const newRows = [...data.chemical];
      const [movedRow] = newRows.splice(draggedChemicalIndex, 1);
      newRows.splice(dropIndex, 0, movedRow);
      onDataChange({ ...data, chemical: newRows });
    }
    setDraggedChemicalIndex(null);
    setDragOverChemicalIndex(null);
  };

  const handleChemicalDragEnd = () => {
    setDraggedChemicalIndex(null);
    setDragOverChemicalIndex(null);
  };

  // 물리적/생물학적/인간공학적 인자 테이블 드래그 핸들러
  const handleNonChemicalDragStart = (index: number) => {
    setDraggedNonChemicalIndex(index);
  };

  const handleNonChemicalDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedNonChemicalIndex !== null && draggedNonChemicalIndex !== index) {
      setDragOverNonChemicalIndex(index);
    }
  };

  const handleNonChemicalDragLeave = () => {
    setDragOverNonChemicalIndex(null);
  };

  const handleNonChemicalDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedNonChemicalIndex !== null && draggedNonChemicalIndex !== dropIndex) {
      const newRows = [...nonChemicalUnifiedRows];
      const [movedRow] = newRows.splice(draggedNonChemicalIndex, 1);
      newRows.splice(dropIndex, 0, movedRow);
      onDataChange(nonChemicalUnifiedRowsToData(newRows, data));
    }
    setDraggedNonChemicalIndex(null);
    setDragOverNonChemicalIndex(null);
  };

  const handleNonChemicalDragEnd = () => {
    setDraggedNonChemicalIndex(null);
    setDragOverNonChemicalIndex(null);
  };

  // 화학적 인자 행 변경
  const handleChemicalRowChange = (
    index: number,
    field: keyof Table1400ChemicalRow,
    value: string
  ) => {
    const newRows = [...data.chemical];
    newRows[index] = { ...newRows[index], [field]: value };
    onDataChange({ ...data, chemical: newRows });
  };

  // 화학적 인자 행 삭제
  const handleChemicalRowDelete = (index: number) => {
    const newRows = data.chemical.filter((_, i) => i !== index);
    onDataChange({ ...data, chemical: newRows });
  };

  // 화학적 인자 행 추가
  const handleChemicalAddRow = () => {
    const newRow: Table1400ChemicalRow = {
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
    };
    onDataChange({ ...data, chemical: [...data.chemical, newRow] });
  };

  // 화학물질명 검색 모달 핸들러
  const handleOpenChemicalSearchModal = (index: number) => {
    setChemicalSearchModalIndex(index);
  };

  const handleCloseChemicalSearchModal = () => {
    setChemicalSearchModalIndex(null);
  };

  const handleChemicalSearchConfirm = (chemicalName: string) => {
    if (chemicalSearchModalIndex !== null) {
      handleChemicalRowChange(chemicalSearchModalIndex, 'chemicalName', chemicalName);
    }
    handleCloseChemicalSearchModal();
  };

  // 물리적/생물학적/인간공학적 인자 행 변경
  const handleNonChemicalRowChange = (index: number, field: string, value: string) => {
    const newRows = [...nonChemicalUnifiedRows];
    newRows[index] = { ...newRows[index], [field]: value };
    onDataChange(nonChemicalUnifiedRowsToData(newRows, data));
  };

  // 물리적/생물학적/인간공학적 인자 행 삭제
  const handleNonChemicalRowDelete = (index: number) => {
    const newRows = nonChemicalUnifiedRows.filter((_, i) => i !== index);
    onDataChange(nonChemicalUnifiedRowsToData(newRows, data));
  };

  // 물리적/생물학적/인간공학적 인자 행 추가
  const handleNonChemicalAddRow = () => {
    const newRow: NonChemicalUnifiedRow = {
      category: '물리적',
      factorName: '',
      form: '',
      location: '',
      department: '',
      exposureRisk: '',
      managementStandard: '',
      managementMeasure: '',
      remark: '',
    };
    const newRows = [...nonChemicalUnifiedRows, newRow];
    onDataChange(nonChemicalUnifiedRowsToData(newRows, data));
  };

  // 물리적/생물학적/인간공학적 카테고리 변경
  const handleNonChemicalCategoryChange = (index: number, newCategory: NonChemicalCategoryType) => {
    const currentRow = nonChemicalUnifiedRows[index];
    const currentFactorName = currentRow.factorName || '';
    const currentLocation = currentRow.location || '';
    const currentDepartment = currentRow.department || '';
    const currentExposureRisk = currentRow.exposureRisk || '';
    const currentManagementStandard = currentRow.managementStandard || '';
    const currentManagementMeasure = currentRow.managementMeasure || '';
    const currentRemark = currentRow.remark || '';
    const currentForm = 'form' in currentRow ? currentRow.form : '';
    const currentType = 'type' in currentRow ? currentRow.type : '';

    let newRow: NonChemicalUnifiedRow;
    if (newCategory === '물리적') {
      newRow = {
        category: '물리적',
        factorName: currentFactorName,
        form: currentForm || '',
        location: currentLocation,
        department: currentDepartment,
        exposureRisk: currentExposureRisk,
        managementStandard: currentManagementStandard,
        managementMeasure: currentManagementMeasure,
        remark: currentRemark,
      };
    } else if (newCategory === '생물학적') {
      newRow = {
        category: '생물학적',
        factorName: currentFactorName,
        type: currentType || '',
        location: currentLocation,
        department: currentDepartment,
        exposureRisk: currentExposureRisk,
        managementStandard: currentManagementStandard,
        managementMeasure: currentManagementMeasure,
        remark: currentRemark,
      };
    } else {
      // 인간공학적
      newRow = {
        category: '인간공학적',
        factorName: currentFactorName,
        form: currentForm || '',
        location: currentLocation,
        department: currentDepartment,
        exposureRisk: currentExposureRisk,
        managementStandard: currentManagementStandard,
        managementMeasure: currentManagementMeasure,
        remark: currentRemark,
      };
    }
    const newRows = [...nonChemicalUnifiedRows];
    newRows[index] = newRow;
    onDataChange(nonChemicalUnifiedRowsToData(newRows, data));
  };

  // 유해인자 등록 모달 핸들러
  const handleOpenHazardFactorModal = (index: number) => {
    setHazardFactorModalIndex(index);
  };

  const handleCloseHazardFactorModal = () => {
    setHazardFactorModalIndex(null);
  };

  const handleHazardFactorConfirm = (
    index: number,
    modalData: {
      factorName: string;
      category: '물리적' | '생물학적' | '인간공학적';
      formOrType: string;
      location: string;
      department: string;
      exposureRisk: string;
      managementStandard: string;
      managementMeasure: string;
    }
  ) => {
    const currentRow = nonChemicalUnifiedRows[index];

    // 카테고리 변경이 필요한 경우
    if (currentRow.category !== modalData.category) {
      handleNonChemicalCategoryChange(index, modalData.category);
    }

    // 모든 필드 업데이트
    handleNonChemicalRowChange(index, 'factorName', modalData.factorName);
    if ('form' in currentRow) {
      handleNonChemicalRowChange(index, 'form', modalData.formOrType);
    } else if ('type' in currentRow) {
      handleNonChemicalRowChange(index, 'type', modalData.formOrType);
    }
    handleNonChemicalRowChange(index, 'location', modalData.location);
    handleNonChemicalRowChange(index, 'department', modalData.department);
    handleNonChemicalRowChange(index, 'exposureRisk', modalData.exposureRisk);
    handleNonChemicalRowChange(index, 'managementStandard', modalData.managementStandard);
    handleNonChemicalRowChange(index, 'managementMeasure', modalData.managementMeasure);

    handleCloseHazardFactorModal();
  };

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      {/* 화학적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>[화학적 인자]</Typography>
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
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 110 }}>화학물질명</th>
                <th style={{ width: 135 }}>화학식</th>
                <th style={{ width: 124 }}>CAS No</th>
                <th style={{ width: 60 }}>폭발한계(%)하한</th>
                <th style={{ width: 60 }}>폭발한계(%)상한</th>
                <th style={{ width: 135 }}>노출기준</th>
                <th style={{ width: 48 }}>인화점(℃)</th>
                <th style={{ width: 48 }}>발화점(℃)</th>
                <th style={{ width: 135 }}>유해성 위험성 구분</th>
                <th style={{ width: 135 }}>산업안전보건법 관리기준</th>
                <th style={{ width: 48 }}>일일사용량</th>
                <th style={{ width: 48 }}>저장량</th>
                <th style={{ width: 135 }}>비고</th>
                <th style={{ width: 46 }}>이동</th>
                <th style={{ width: 55 }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {data.chemical.map((row, index) => (
                <tr
                  key={index}
                  draggable
                  onDragStart={() => handleChemicalDragStart(index)}
                  onDragOver={(e) => handleChemicalDragOver(e, index)}
                  onDragLeave={handleChemicalDragLeave}
                  onDrop={(e) => handleChemicalDrop(e, index)}
                  onDragEnd={handleChemicalDragEnd}
                  style={{
                    opacity: draggedChemicalIndex === index ? 0.5 : 1,
                    backgroundColor:
                      dragOverChemicalIndex === index && draggedChemicalIndex !== index
                        ? theme.vars.palette.action.hover
                        : 'transparent',
                    cursor: 'move',
                  }}
                >
                  <td>
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={[]} // TODO: TanStack Query Hook(useQuery)으로 화학물질 목록 가져오기
                      value={row.chemicalName}
                      onInputChange={(_, newValue) => {
                        handleChemicalRowChange(index, 'chemicalName', newValue);
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
                                    onClick={() => handleOpenChemicalSearchModal(index)}
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
                      value={row.formula}
                      onChange={(e) => handleChemicalRowChange(index, 'formula', e.target.value)}
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
                      value={row.casNo}
                      onChange={(e) => handleChemicalRowChange(index, 'casNo', e.target.value)}
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
                      value={row.lowerLimit}
                      onChange={(e) => handleChemicalRowChange(index, 'lowerLimit', e.target.value)}
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
                      value={row.upperLimit}
                      onChange={(e) => handleChemicalRowChange(index, 'upperLimit', e.target.value)}
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
                      value={row.exposureLimit}
                      onChange={(e) =>
                        handleChemicalRowChange(index, 'exposureLimit', e.target.value)
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
                      value={row.flashPoint}
                      onChange={(e) => handleChemicalRowChange(index, 'flashPoint', e.target.value)}
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
                      value={row.ignitionPoint}
                      onChange={(e) =>
                        handleChemicalRowChange(index, 'ignitionPoint', e.target.value)
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
                      value={row.hazardRisk}
                      onChange={(e) => handleChemicalRowChange(index, 'hazardRisk', e.target.value)}
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
                      value={row.managementStandard}
                      onChange={(e) =>
                        handleChemicalRowChange(index, 'managementStandard', e.target.value)
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
                      value={row.dailyUsage}
                      onChange={(e) => handleChemicalRowChange(index, 'dailyUsage', e.target.value)}
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
                      value={row.storage}
                      onChange={(e) => handleChemicalRowChange(index, 'storage', e.target.value)}
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
                      onChange={(e) => handleChemicalRowChange(index, 'remark', e.target.value)}
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
                      onClick={() => handleChemicalRowDelete(index)}
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

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', pb: 2 }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={handleChemicalAddRow}
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

      {/* 물리적, 생물학적, 인간공학적 인자 테이블 */}
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [물리적, 생물학적, 인간공학적 인자]
        </Typography>
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
              {nonChemicalUnifiedRows.map((row, index) => (
                <tr
                  key={index}
                  draggable
                  onDragStart={() => handleNonChemicalDragStart(index)}
                  onDragOver={(e) => handleNonChemicalDragOver(e, index)}
                  onDragLeave={handleNonChemicalDragLeave}
                  onDrop={(e) => handleNonChemicalDrop(e, index)}
                  onDragEnd={handleNonChemicalDragEnd}
                  style={{
                    opacity: draggedNonChemicalIndex === index ? 0.5 : 1,
                    backgroundColor:
                      dragOverNonChemicalIndex === index && draggedNonChemicalIndex !== index
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
                          handleNonChemicalCategoryChange(
                            index,
                            e.target.value as NonChemicalCategoryType
                          )
                        }
                        sx={{
                          fontSize: 14,
                          height: 'auto',
                          '& .MuiSelect-select': {
                            py: 1,
                          },
                        }}
                      >
                        {NON_CHEMICAL_CATEGORY_OPTIONS.map((option) => (
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
                      value={row.factorName}
                      onChange={(e) =>
                        handleNonChemicalRowChange(index, 'factorName', e.target.value)
                      }
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenHazardFactorModal(index)}
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
                      value={row.location}
                      onChange={(e) =>
                        handleNonChemicalRowChange(index, 'location', e.target.value)
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
                      value={row.department}
                      onChange={(e) =>
                        handleNonChemicalRowChange(index, 'department', e.target.value)
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
                        value={row.exposureRisk || ''}
                        onChange={(e) =>
                          handleNonChemicalRowChange(index, 'exposureRisk', e.target.value)
                        }
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
                      value={row.managementMeasure}
                      onChange={(e) =>
                        handleNonChemicalRowChange(index, 'managementMeasure', e.target.value)
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
                      value={row.remark}
                      onChange={(e) => handleNonChemicalRowChange(index, 'remark', e.target.value)}
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
                      onClick={() => handleNonChemicalRowDelete(index)}
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

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', pb: 2 }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={handleNonChemicalAddRow}
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

      {/* 화학물질명 검색 모달 */}
      {data.chemical.map((row, index) => (
        <ChemicalNameSearchModal
          key={index}
          open={chemicalSearchModalIndex === index}
          onClose={handleCloseChemicalSearchModal}
          onConfirm={handleChemicalSearchConfirm}
          initialValue={row.chemicalName}
        />
      ))}

      {/* 유해인자 등록 모달 */}
      {nonChemicalUnifiedRows.map((row, index) => {
        const formOrType = 'form' in row ? row.form : 'type' in row ? row.type : '';
        return (
          <HazardFactorRegisterModal
            key={index}
            open={hazardFactorModalIndex === index}
            onClose={handleCloseHazardFactorModal}
            onConfirm={(modalData) => handleHazardFactorConfirm(index, modalData)}
            initialData={{
              factorName: row.factorName,
              category: row.category,
              formOrType,
              location: row.location,
              department: row.department,
              exposureRisk: row.exposureRisk,
              managementStandard: row.managementStandard,
              managementMeasure: row.managementMeasure,
            }}
          />
        );
      })}
    </Box>
  );
}
