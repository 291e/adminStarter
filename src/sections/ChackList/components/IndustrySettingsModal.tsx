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
import {
  useIndustries,
  useCreateIndustry,
  useUpdateIndustry,
  useDeleteIndustry,
} from '../hooks/use-checklist-api';
import type { IndustryItem } from 'src/services/checklist/checklist.types';

// ----------------------------------------------------------------------

type ModalIndustry = IndustryItem & { tempId?: string };

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function IndustrySettingsModal({ open, onClose }: Props) {
  const [industries, setIndustries] = useState<ModalIndustry[]>([]);
  const [originalIndustries, setOriginalIndustries] = useState<ModalIndustry[]>([]);
  const [newIndustryName, setNewIndustryName] = useState<string | null>(null);
  const [newIndustryActive, setNewIndustryActive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API에서 업종 목록 가져오기
  const industriesQuery = useIndustries();
  const createIndustryMutation = useCreateIndustry();
  const updateIndustryMutation = useUpdateIndustry();
  const deleteIndustryMutation = useDeleteIndustry();

  const generateTempId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random()}`;
  };

  useEffect(() => {
    if (open && !isInitialized && industriesQuery.data?.industryList) {
      const convertedIndustries = industriesQuery.data.industryList.map((item) => ({
        industryIdx: item.industryIdx,
        name: item.name,
        status: item.status,
        isActive: item.status === 'ACTIVE',
      }));
      const clonedIndustries = convertedIndustries.map((item) => ({ ...item }));
      setIndustries(clonedIndustries);
      setOriginalIndustries(clonedIndustries.map((item) => ({ ...item })));
      setIsInitialized(true);
    } else if (open && !isInitialized && !industriesQuery.isLoading && !industriesQuery.data) {
      setIndustries([]);
      setOriginalIndustries([]);
      setIsInitialized(true);
    }

    if (!open) {
      setIsInitialized(false);
      setErrorMessage(null);
    }
  }, [open, industriesQuery.data, industriesQuery.isLoading, isInitialized]);

  const getIdentifier = (industry: ModalIndustry) => industry.industryIdx ?? industry.tempId;

  const handleToggleActive = (industryIdx: number | undefined, tempId?: string) => {
    setIndustries((prev) =>
      prev.map((industry) =>
        (industry.industryIdx ?? industry.tempId) === (industryIdx ?? tempId)
          ? { ...industry, isActive: !industry.isActive }
          : industry
      )
    );
  };

  const handleCategoryNameChange = (
    industryIdx: number | undefined,
    newName: string,
    tempId?: string
  ) => {
    setIndustries((prev) =>
      prev.map((industry) =>
        (industry.industryIdx ?? industry.tempId) === (industryIdx ?? tempId)
          ? { ...industry, name: newName }
          : industry
      )
    );
  };

  const handleShowAddField = () => {
    setNewIndustryName('');
    setNewIndustryActive(true);
  };

  const handleAddIndustry = () => {
    if (!newIndustryName || !newIndustryName.trim()) {
      return;
    }

    const newIndustry: ModalIndustry = {
      industryIdx: undefined,
      name: newIndustryName.trim(),
      isActive: newIndustryActive,
      tempId: generateTempId(),
    };

    setIndustries((prev) => [...prev, newIndustry]);
    setNewIndustryName(null);
    setNewIndustryActive(true);
  };

  const collectPendingNewIndustry = () => {
    if (!newIndustryName || !newIndustryName.trim()) {
      return null;
    }
    return {
      industryIdx: undefined,
      name: newIndustryName.trim(),
      isActive: newIndustryActive,
    } as ModalIndustry;
  };

  // 버튼 텍스트 결정 (새 항목만 있으면 "등록", 그 외는 "저장")
  const getButtonText = () => {
    const pendingIndustry = collectPendingNewIndustry();
    const newIndustries = [
      ...industries.filter((ind) => !ind.industryIdx),
      ...(pendingIndustry ? [pendingIndustry] : []),
    ];
    const hasDeleted = originalIndustries.some(
      (original) =>
        original.industryIdx && !industries.find((ind) => ind.industryIdx === original.industryIdx)
    );
    const hasModified = industries.some((ind) => {
      if (!ind.industryIdx) return false;
      const original = originalIndustries.find((orig) => orig.industryIdx === ind.industryIdx);
      if (!original) return false;
      return original.name !== ind.name || original.isActive !== ind.isActive;
    });

    if (newIndustries.length > 0 && !hasDeleted && !hasModified) {
      return '저장';
    }
    return '저장';
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const pendingIndustry = collectPendingNewIndustry();
      const effectiveIndustries = [
        ...industries,
        ...(pendingIndustry ? [{ ...pendingIndustry, tempId: generateTempId() }] : []),
      ];

      // 삭제된 항목 처리 (원래 있던 항목이 목록에서 사라진 경우)
      const deletedIndustries = originalIndustries.filter(
        (original) =>
          original.industryIdx &&
          !effectiveIndustries.find((ind) => ind.industryIdx === original.industryIdx)
      );

      const deletePromises = deletedIndustries.map((deleted) =>
        deleteIndustryMutation.mutateAsync({ industryIdx: deleted.industryIdx! })
      );

      // 새로 추가된 항목 처리
      const newIndustries = effectiveIndustries.filter((ind) => !ind.industryIdx);
      console.log('🟢 [IndustrySettingsModal] 새로 추가된 항목:', newIndustries);

      const createPromises = newIndustries.map((newIndustry) => {
        const payload = {
          industry: newIndustry.name,
          status: (newIndustry.isActive ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
        };
        console.log('🟢 [IndustrySettingsModal] 등록 API 호출:', payload);
        return createIndustryMutation.mutateAsync(payload);
      });

      // 수정된 항목 처리
      const modifiedIndustries = effectiveIndustries.filter((ind) => {
        if (!ind.industryIdx) return false;
        const original = originalIndustries.find((orig) => orig.industryIdx === ind.industryIdx);
        if (!original) return false;
        return original.name !== ind.name || original.isActive !== ind.isActive;
      });

      console.log('🟢 [IndustrySettingsModal] 수정된 항목:', modifiedIndustries);

      const updatePromises = modifiedIndustries.map((modified) => {
        const payload = {
          industryIdx: modified.industryIdx!,
          industry: modified.name,
          status: (modified.isActive ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
        };
        console.log('🟢 [IndustrySettingsModal] 수정 API 호출:', payload);
        return updateIndustryMutation.mutateAsync(payload);
      });

      if (
        deletePromises.length === 0 &&
        createPromises.length === 0 &&
        updatePromises.length === 0
      ) {
        console.log('🟢 [IndustrySettingsModal] 변경사항 없음');
        handleClose();
        return;
      }

      await Promise.all([...deletePromises, ...createPromises, ...updatePromises]);

      console.log('✅ [IndustrySettingsModal] 저장 완료');
      setNewIndustryName(null);
      setNewIndustryActive(true);
      handleClose();
    } catch (error) {
      setErrorMessage('업종 저장에 실패했습니다. 다시 시도해주세요.');
      console.error('❌ [IndustrySettingsModal] 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setNewIndustryName(null);
    setNewIndustryActive(true);
    onClose();
  };

  const isLoading = industriesQuery.isLoading;
  const error = industriesQuery.error;

  const handleRemove = (industry: ModalIndustry) => {
    const identifier = getIdentifier(industry);
    setIndustries((prev) => prev.filter((ind) => getIdentifier(ind) !== identifier));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          업종 설정
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
            업종 목록을 불러오는데 실패했습니다. 다시 시도해주세요.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1, pb: 3 }}>
            {industries.map((industry) => (
              <Box
                key={getIdentifier(industry)}
                sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
              >
                <TextField
                  fullWidth
                  value={industry.name}
                  onChange={(e) =>
                    handleCategoryNameChange(industry.industryIdx, e.target.value, industry.tempId)
                  }
                  placeholder="업종명을 입력하세요"
                />
                <Switch
                  checked={industry.isActive}
                  onChange={() => handleToggleActive(industry.industryIdx, industry.tempId)}
                  color="primary"
                />
                <IconButton onClick={() => handleRemove(industry)} color="error" size="small">
                  <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                </IconButton>
              </Box>
            ))}

            {!newIndustryName && (
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

            {newIndustryName !== null && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  placeholder="업종명을 입력하세요"
                  value={newIndustryName || ''}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddIndustry();
                    }
                  }}
                  autoFocus
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch
                    checked={newIndustryActive}
                    onChange={(e) => setNewIndustryActive(e.target.checked)}
                    color="primary"
                  />
                  <IconButton color="primary" onClick={handleAddIndustry}>
                    <Iconify icon="solar:check-circle-bold" width={20} />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      setNewIndustryName(null);
                      setNewIndustryActive(true);
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
          disabled={isLoading || isSaving}
          sx={{ minWidth: 64 }}
        >
          {isSaving ? '처리 중...' : getButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
