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

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type CategoryItem = {
  id: string;
  name: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (categories: CategoryItem[]) => void;
  initialCategories?: CategoryItem[];
};

export default function CategorySettingsModal({
  open,
  onClose,
  onSave,
  initialCategories = [],
}: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);

  // 초기 데이터로 카테고리 목록 채우기
  useEffect(() => {
    if (open && initialCategories.length > 0) {
      setCategories(initialCategories);
    } else if (open && initialCategories.length === 0) {
      // TODO: TanStack Query Hook(useQuery)으로 카테고리 목록 가져오기
      // const { data } = useQuery({
      //   queryKey: ['hazardCategories'],
      //   queryFn: () => getHazardCategories(),
      // });
      // if (data) setCategories(data);
      // 임시 기본 데이터
      setCategories([
        { id: '1', name: '물리적 인자', isActive: true },
        { id: '2', name: '생물학적 인자', isActive: true },
        { id: '3', name: '인간공학적 인자', isActive: true },
      ]);
    }
  }, [open, initialCategories]);

  const handleToggleActive = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, isActive: !cat.isActive } : cat))
    );
  };

  const handleShowAddField = () => {
    setNewCategoryName('');
  };

  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryName.trim()) {
      return;
    }

    const newCategory: CategoryItem = {
      id: `category-${Date.now()}`,
      name: newCategoryName.trim(),
      isActive: true,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName(null);
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 카테고리 목록 저장 (view.tsx의 onSave에서 처리)
    // 실제 API 호출은 view.tsx의 onSave에서 수행됩니다.
    onSave(categories);
    handleClose();
  };

  const handleClose = () => {
    setNewCategoryName(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
        <Stack spacing={2} sx={{ mt: 1, pb: 3 }}>
          {categories.map((category) => (
            <Box key={category.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                value={category.name}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: 'background.paper',
                  },
                }}
              />
              <Switch
                checked={category.isActive}
                onChange={() => handleToggleActive(category.id)}
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
              <Switch checked disabled color="primary" />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5 }}>
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
