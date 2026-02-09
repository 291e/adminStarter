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
import { useBoardCategories, useSaveBoardCategories } from 'src/sections/Board/hooks/use-board-api';
import type { BoardCategory } from 'src/services/board/board.types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  postCategoryType: '문의/답변';
};

export default function CategoryManageModal({ open, onClose, postCategoryType }: Props) {
  const { data: categoriesData, isLoading } = useBoardCategories({ postCategoryType });
  const saveCategoriesMutation = useSaveBoardCategories();

  const [categories, setCategories] = useState<
    Array<{
      id: string;
      name: string;
      isActive: boolean;
      postCategoryIdx?: number;
    }>
  >([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // API에서 카테고리 로드
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [CategoryManageModal] categoriesData:', categoriesData);
    }
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      const mapped = categoriesData.categories.map((cat, idx) => ({
        id: cat.postCategoryIdx ? `cat-${cat.postCategoryIdx}` : `new-${idx}`,
        name: cat.postCategoryTitle || '',
        isActive: true, // Board API에는 활성화 상태가 없으므로 기본값 true
        postCategoryIdx: cat.postCategoryIdx,
      }));
      if (import.meta.env.DEV) {
        console.log('✅ [CategoryManageModal] 매핑된 카테고리:', mapped);
      }
      setCategories(mapped);
    } else if (categoriesData && !categoriesData.categories) {
      // 카테고리가 없는 경우 빈 배열로 설정
      if (import.meta.env.DEV) {
        console.warn('⚠️ [CategoryManageModal] categories가 없음:', categoriesData);
      }
      setCategories([]);
    }
  }, [categoriesData]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setNewCategoryName('');
    }
  }, [open]);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.some((cat) => cat.name === newCategoryName.trim())) {
      const newCategory = {
        id: `new-${Date.now()}`,
        name: newCategoryName.trim(),
        isActive: true,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const handleRenameCategory = (id: string, value: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, name: value } : cat)));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          return { ...cat, isActive: !cat.isActive };
        }
        return cat;
      })
    );
  };

  const handleSave = async () => {
    try {
      // 활성화된 카테고리만 저장 (비활성화된 것은 제외)
      const activeCategories = categories.filter((cat) => cat.isActive);
      const postCategoryList = activeCategories.map((cat) => ({
        postCategoryTitle: cat.name,
        ...(cat.postCategoryIdx && { postCategoryIdx: cat.postCategoryIdx }),
      }));

      await saveCategoriesMutation.mutateAsync({
        postCategoryType,
        postCategoryList,
      });
      onClose();
    } catch (error) {
      console.error('❌ [CategoryManageModal] 저장 실패', error);
    }
  };

  const handleClose = () => {
    setNewCategoryName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          카테고리 관리
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography color="text.secondary">카테고리를 불러오는 중...</Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {categories.map((category) => (
              <Stack key={category.id} direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  value={category.name}
                  onChange={(e) => handleRenameCategory(category.id, e.target.value)}
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
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose} disabled={saveCategoriesMutation.isPending}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveCategoriesMutation.isPending || isLoading}
        >
          {saveCategoriesMutation.isPending ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
