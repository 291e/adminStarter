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
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { useHazardCategories, useSaveHazardCategories } from '../hooks/use-code-setting-api';

// ----------------------------------------------------------------------

export type CategoryItem = {
  hazardCategoryIdx?: number; // 새로 추가된 항목은 undefined
  name: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (categories: CategoryItem[]) => void; // 선택적 (내부에서 직접 저장 가능)
};

export default function CategorySettingsModal({ open, onClose, onSave }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [newCategoryActive, setNewCategoryActive] = useState(true);

  // API Hooks
  const categoriesQuery = useHazardCategories();
  const saveCategoriesMutation = useSaveHazardCategories();

  // API에서 카테고리 목록 가져오기
  useEffect(() => {
    if (open && categoriesQuery.data?.categoryList) {
      const apiCategories = categoriesQuery.data.categoryList;
      // HazardCategoryItem[]을 CategoryItem[]로 변환
      const convertedCategories = apiCategories.map((item) => ({
        hazardCategoryIdx: item.hazardCategoryIdx,
        name: item.name,
        isActive: item.status === 'ACTIVE',
      }));
      setCategories(convertedCategories);
    } else if (open && !categoriesQuery.isLoading && !categoriesQuery.data) {
      // 데이터가 없을 때 빈 배열로 초기화
      setCategories([]);
    }
  }, [open, categoriesQuery.data, categoriesQuery.isLoading]);

  const handleToggleActive = (hazardCategoryIdx: number | undefined) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.hazardCategoryIdx === hazardCategoryIdx ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const handleCategoryNameChange = (hazardCategoryIdx: number | undefined, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.hazardCategoryIdx === hazardCategoryIdx ? { ...cat, name: newName } : cat
      )
    );
  };

  const handleShowAddField = () => {
    setNewCategoryName('');
    setNewCategoryActive(true);
  };

  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryName.trim()) {
      return;
    }

    const newCategory: CategoryItem = {
      hazardCategoryIdx: undefined, // 새로 추가된 항목
      name: newCategoryName.trim(),
      isActive: newCategoryActive,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName(null);
    setNewCategoryActive(true);
  };

  const collectPendingCategory = () => {
    if (!newCategoryName || !newCategoryName.trim()) {
      return null;
    }
    return {
      hazardCategoryIdx: undefined,
      name: newCategoryName.trim(),
      isActive: newCategoryActive,
    } as CategoryItem;
  };

  const getButtonText = () => {
    const pendingCategory = collectPendingCategory();
    const hasPending = !!pendingCategory;
    if (hasPending) {
      return '등록';
    }
    return '저장';
  };

  const handleSave = async () => {
    try {
      const pendingCategory = collectPendingCategory();
      const effectiveCategories = [...categories, ...(pendingCategory ? [pendingCategory] : [])];

      // CategoryItem[]을 CategoryItemDto[]로 변환
      // hazardCategoryIdx가 있으면 업데이트, 없으면 새로 생성
      const categoryList = effectiveCategories.map((cat) => ({
        hazardCategoryIdx: cat.hazardCategoryIdx, // 있으면 업데이트, 없으면 생성
        category: cat.name,
        status: (cat.isActive ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
      }));

      // API 호출
      // 요청에 없는 기존 카테고리는 서버에서 soft delete 처리됨
      await saveCategoriesMutation.mutateAsync({ categoryList });

      // onSave가 있으면 호출 (하위 호환성)
      if (onSave) {
        onSave(effectiveCategories);
      }

      handleClose();
    } catch (error) {
      console.error('카테고리 저장 실패:', error);
    }
  };

  const handleClose = () => {
    setNewCategoryName(null);
    setNewCategoryActive(true);
    onClose();
  };

  const isLoading = categoriesQuery.isLoading;
  const isSaving = saveCategoriesMutation.isPending;
  const error = saveCategoriesMutation.error;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          유해인자 카테고리 설정
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

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            카테고리 저장에 실패했습니다. 다시 시도해주세요.
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1, pb: 3 }}>
            {categories.map((category, index) => (
              <Box
                key={category.hazardCategoryIdx ?? `new-${index}`}
                sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
              >
                <TextField
                  fullWidth
                  value={category.name}
                  onChange={(e) =>
                    handleCategoryNameChange(category.hazardCategoryIdx, e.target.value)
                  }
                  placeholder="카테고리명을 입력하세요"
                />
                <Switch
                  checked={category.isActive}
                  onChange={() => handleToggleActive(category.hazardCategoryIdx)}
                  color="primary"
                />
              </Box>
            ))}

            {!newCategoryName && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
                  onClick={handleShowAddField}
                  sx={{ minWidth: 100 }}
                >
                  항목추가
                </Button>
              </Box>
            )}

            {newCategoryName !== null && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  placeholder="카테고리명을 입력하세요"
                  value={newCategoryName || ''}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                  autoFocus
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch
                    checked={newCategoryActive}
                    onChange={(e) => setNewCategoryActive(e.target.checked)}
                    color="primary"
                  />
                  <IconButton color="primary" onClick={handleAddCategory}>
                    <Iconify icon="solar:check-circle-bold" width={20} />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      setNewCategoryName(null);
                      setNewCategoryActive(true);
                    }}
                  >
                    <Iconify icon="solar:close-circle-bold" width={20} />
                  </IconButton>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isSaving} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          sx={{ minWidth: 64 }}
        >
          {isSaving ? '저장 중...' : getButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
