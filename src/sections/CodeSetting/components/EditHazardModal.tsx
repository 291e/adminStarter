import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';
import type { CodeSetting } from 'src/services/code-setting/code-setting.types';
import { fDateTime } from 'src/utils/format-time';
import type { CategoryItem } from './CategorySettingsModal';

// ----------------------------------------------------------------------

export type HazardEditFormData = {
  hazardCategoryIdx?: number; // 카테고리 Index
  code: string;
  name: string;
  formAndType: string;
  location: string;
  exposureRisk: string;
  managementStandard?: string;
  managementMeasures?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: HazardEditFormData) => void;
  initialData?: CodeSetting | null;
  categories?: CategoryItem[];
};

export default function EditHazardModal({
  open,
  onClose,
  onSave,
  initialData,
  categories = [],
}: Props) {
  const [formData, setFormData] = useState<HazardEditFormData>({
    hazardCategoryIdx: undefined,
    code: '',
    name: '',
    formAndType: '',
    location: '',
    exposureRisk: '',
    managementStandard: '',
    managementMeasures: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Omit<HazardEditFormData, 'status'>, string>>
  >({});

  // 활성화된 카테고리만 필터링
  const activeCategories = categories.filter((cat) => cat.isActive);

  // 초기 데이터로 폼 채우기
  useEffect(() => {
    if (initialData && open) {
      const categoryTypeUpper = initialData.categoryType?.toUpperCase();
      if (categoryTypeUpper === 'HAZARD') {
        const statusValue =
          typeof initialData.status === 'string'
            ? initialData.status.toUpperCase() === 'ACTIVE'
              ? 'ACTIVE'
              : 'INACTIVE'
            : 'ACTIVE';

        setFormData({
          hazardCategoryIdx:
            initialData.hazardCategoryIdx ||
            initialData.codeSettingHazardCategoryInformation?.hazardCategoryIdx,
          code: initialData.code,
          name: initialData.name,
          formAndType: initialData.formAndType || '',
          location: initialData.location || '',
          exposureRisk: initialData.exposureRisk || '',
          managementStandard: initialData.managementStandard || '',
          managementMeasures: initialData.managementMeasures || '',
          status: statusValue,
        });
        setErrors({});
      }
    }
  }, [initialData, open]);

  const handleChange = (
    field: keyof HazardEditFormData,
    value: string | number | boolean | 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive' | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (field !== 'status' && errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Omit<HazardEditFormData, 'status'>, string>> = {};

    if (!formData.hazardCategoryIdx) {
      newErrors.hazardCategoryIdx = '카테고리를 선택해주세요.';
    }

    if (!formData.code.trim()) {
      newErrors.code = '유해인자 코드를 입력해주세요.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '유해인자명을 입력해주세요.';
    }

    if (!formData.formAndType.trim()) {
      newErrors.formAndType = '형태 및 유형을 입력해주세요.';
    }

    if (!formData.location.trim()) {
      newErrors.location = '위치를 입력해주세요.';
    }

    if (!formData.exposureRisk.trim()) {
      newErrors.exposureRisk = '노출위험을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    if (!initialData) return;

    // TODO: TanStack Query Hook(useMutation)으로 유해인자 수정 (view.tsx의 handleSaveEditHazard에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveEditHazard에서 수행됩니다.
    // await updateHazard(initialData.id, {
    //   category: formData.category,
    //   code: formData.code,
    //   name: formData.name,
    //   formAndType: formData.formAndType,
    //   location: formData.location,
    //   exposureRisk: formData.exposureRisk,
    //   managementStandard: formData.managementStandard,
    //   managementMeasures: formData.managementMeasures,
    //   status: formData.status,
    // });

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      hazardCategoryIdx: undefined,
      code: '',
      name: '',
      formAndType: '',
      location: '',
      exposureRisk: '',
      managementStandard: '',
      managementMeasures: '',
      status: 'ACTIVE',
    });
    setErrors({});
    onClose();
  };

  const registrationDate =
    initialData?.updateAt || initialData?.createAt
      ? fDateTime(initialData.updateAt || initialData.createAt, 'YYYY-MM-DD HH:mm:ss')
      : '-';
  const modificationDate = initialData?.updateAt
    ? fDateTime(initialData.updateAt, 'YYYY-MM-DD HH:mm:ss')
    : '-';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          유해인자 수정
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </DialogTitle>

      {/* 등록일/수정일 정보 */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          px: 3,
          py: 2,
          display: 'flex',
          gap: 3,
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
              등록일
            </Typography>
            <Typography variant="body2">{registrationDate}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
              수정일
            </Typography>
            <Typography variant="body2">{modificationDate}</Typography>
          </Stack>
        </Stack>
      </Box>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1, pb: 3 }}>
          {/* 카테고리 */}
          <FormControl fullWidth error={!!errors.hazardCategoryIdx}>
            <InputLabel id="category-label">
              카테고리
              <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                *
              </Typography>
            </InputLabel>
            <Select
              labelId="category-label"
              label={
                <>
                  카테고리
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              value={formData.hazardCategoryIdx ?? ''}
              onChange={(e) => {
                const selectedIdx = e.target.value as number;
                handleChange('hazardCategoryIdx', selectedIdx);
              }}
            >
              {activeCategories.map((cat, index) => (
                <MenuItem
                  key={cat.hazardCategoryIdx ?? `category-${index}`}
                  value={cat.hazardCategoryIdx ?? ''}
                >
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {errors.hazardCategoryIdx && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                {errors.hazardCategoryIdx}
              </Typography>
            )}
          </FormControl>

          {/* 유해인자 코드 */}
          <TextField
            fullWidth
            label={
              <>
                유해인자 코드
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="유해인자 코드를 입력하세요"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            error={!!errors.code}
            helperText={errors.code}
          />

          {/* 유해인자명 */}
          <TextField
            fullWidth
            label={
              <>
                유해인자명
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="유해인자명을 입력하세요"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* 형태 및 유형 */}
          <TextField
            fullWidth
            label={
              <>
                형태 및 유형
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="형태 및 유형을 입력하세요"
            value={formData.formAndType}
            onChange={(e) => handleChange('formAndType', e.target.value)}
            error={!!errors.formAndType}
            helperText={errors.formAndType}
          />

          {/* 위치 */}
          <TextField
            fullWidth
            label={
              <>
                위치
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="위치를 입력하세요"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            error={!!errors.location}
            helperText={errors.location}
          />

          {/* 노출위험 */}
          <TextField
            fullWidth
            label={
              <>
                노출위험
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="노출위험을 입력하세요"
            value={formData.exposureRisk}
            onChange={(e) => handleChange('exposureRisk', e.target.value)}
            error={!!errors.exposureRisk}
            helperText={errors.exposureRisk}
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.status?.toUpperCase() === 'ACTIVE'}
              onChange={(e) => handleChange('status', e.target.checked ? 'ACTIVE' : 'INACTIVE')}
              color="primary"
            />
          }
          label="활성"
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ minWidth: 64 }}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
