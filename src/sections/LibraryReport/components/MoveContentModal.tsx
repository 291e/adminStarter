import { useMemo, useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { CategoryItem } from './CategorySettingsModal';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  categories: CategoryItem[];
  selectedCount: number;
  onClose: () => void;
  onConfirm: (category: CategoryItem) => void;
};

export default function MoveContentModal({
  open,
  categories,
  selectedCount,
  onClose,
  onConfirm,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>('');

  const selectableCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories]
  );
  useEffect(() => {
    if (!open) {
      setSelectedId('');
    }
  }, [open]);

  const handleConfirm = () => {
    const category = selectableCategories.find((item) => item.id === selectedId);
    if (!category) {
      return;
    }
    onConfirm(category);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>선택 항목 이동</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            선택한 {selectedCount}개 항목을 이동할 카테고리를 선택해주세요.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="move-category-label">카테고리</InputLabel>
            <Select
              labelId="move-category-label"
              label="카테고리"
              value={selectedId}
              onChange={(e) => setSelectedId(String(e.target.value))}
            >
              {selectableCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedId || selectableCategories.length === 0}
        >
          이동하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
