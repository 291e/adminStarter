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
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

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
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (open) {
      setCategories(initialCategories);
      setNewCategoryName('');
    }
  }, [open, initialCategories]);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.some((cat) => cat.name === newCategoryName.trim())) {
      const newCategory: CategoryItem = {
        id: `category-${Date.now()}`,
        name: newCategoryName.trim(),
        isActive: true,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, isActive: !cat.isActive } : cat))
    );
  };

  const handleSave = () => {
    onSave(categories);
    onClose();
  };

  const handleClose = () => {
    setCategories(initialCategories);
    setNewCategoryName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          카테고리 설정
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

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {categories.map((category) => (
            <Stack key={category.id} direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                value={category.name}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 54,
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 54,
                }}
              >
                <Switch
                  checked={category.isActive}
                  onChange={() => handleToggleActive(category.id)}
                  color="primary"
                />
              </Box>
              <IconButton
                onClick={() => handleDeleteCategory(category.id)}
                sx={{
                  width: 36,
                  height: 54,
                  color: 'text.secondary',
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={24} />
              </IconButton>
            </Stack>
          ))}

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              placeholder="카테고리명 입력"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 36,
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={handleAddCategory}
              startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
              sx={{
                minWidth: 100,
                height: 36,
                whiteSpace: 'nowrap',
              }}
            >
              항목추가
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSave}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
