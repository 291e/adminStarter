import { useState, useMemo, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useChecklists, useDisasterFactors } from 'src/sections/ChackList/hooks/use-checklist-api';

// ----------------------------------------------------------------------

export type DisasterFactorItem = {
  id: string;
  name: string;
  disasterFactorIdx?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: DisasterFactorItem[]) => void;
  highRiskWork?: string; // 선택된 고위험작업 및 상황
  industry?: string; // 업종: 제조업, 운수‧창고‧통신업, 임업, 건물 등의 종합관리사업, 위생 및 유사서비스업
};

export default function SelectDisasterFactorModal({
  open,
  onClose,
  onConfirm,
  highRiskWork,
  industry,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [checklistIdx, setChecklistIdx] = useState<number | null>(null);

  // 업종별 체크리스트 목록 조회 (고위험작업으로 체크리스트 찾기)
  const { data: checklistsData } = useChecklists({
    page: 1,
    pageSize: 1000,
    industry: industry || undefined,
    status: 'active',
  });

  // 고위험작업으로 체크리스트 ID 찾기
  useEffect(() => {
    if (
      !checklistsData?.checklistList ||
      !Array.isArray(checklistsData.checklistList) ||
      !highRiskWork
    ) {
      setChecklistIdx(null);
      return;
    }

    if (typeof checklistsData.checklistList[0] === 'string') {
      setChecklistIdx(null);
      return;
    }

    const checklists = checklistsData.checklistList as Array<{
      checklistIdx?: number;
      highRiskWork: string;
    }>;

    const foundChecklist = checklists.find(
      (checklist) => checklist.highRiskWork === highRiskWork && checklist.checklistIdx
    );

    setChecklistIdx(foundChecklist?.checklistIdx || null);
  }, [checklistsData, highRiskWork]);

  // 재해유발요인 목록 조회
  const {
    data: disasterFactorsData,
    isLoading,
    isError,
  } = useDisasterFactors({
    checklistIdx: checklistIdx || 0,
  });

  // 재해유발요인 데이터 변환
  const disasterFactors = useMemo<DisasterFactorItem[]>(() => {
    if (
      !disasterFactorsData?.disasterFactorList ||
      !Array.isArray(disasterFactorsData.disasterFactorList)
    ) {
      return [];
    }

    // string[]인 경우 필터링
    if (typeof disasterFactorsData.disasterFactorList[0] === 'string') {
      return [];
    }

    const factors = disasterFactorsData.disasterFactorList as Array<{
      disasterFactorIdx?: number;
      factorName: string;
      isActive?: number | boolean;
    }>;

    // 활성화된 항목만 필터링
    return factors
      .filter((factor) => {
        if (factor.isActive === undefined) return true;
        if (typeof factor.isActive === 'boolean') return factor.isActive;
        return factor.isActive === 1;
      })
      .map((factor) => ({
        id: factor.disasterFactorIdx?.toString() || `factor-${factor.factorName}`,
        name: factor.factorName,
        disasterFactorIdx: factor.disasterFactorIdx,
      }));
  }, [disasterFactorsData]);

  const handleToggle = (factorId: string) => {
    setSelectedIds((prev) =>
      prev.includes(factorId) ? prev.filter((id) => id !== factorId) : [...prev, factorId]
    );
  };

  const handleConfirm = () => {
    const selectedItems = disasterFactors.filter((factor) => selectedIds.includes(factor.id));
    onConfirm(selectedItems);
    handleClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          minWidth: 600,
          width: '90%',
          maxWidth: 800,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 20,
          fontWeight: 700,
          lineHeight: '30px',
          color: 'text.primary',
          pb: 1,
        }}
      >
        재해유발요인 선택하기 (중복 선택 가능)
      </DialogTitle>
      {highRiskWork && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 400,
              lineHeight: '24px',
              color: 'text.secondary',
            }}
          >
            {highRiskWork}
          </Typography>
        </Box>
      )}

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            데이터를 불러오는 중 오류가 발생했습니다.
          </Alert>
        ) : !highRiskWork ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            먼저 고위험작업을 선택해주세요.
          </Alert>
        ) : !checklistIdx ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            선택한 고위험작업에 해당하는 체크리스트를 찾을 수 없습니다.
          </Alert>
        ) : disasterFactors.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            선택한 고위험작업에 해당하는 재해유발요인이 없습니다.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {disasterFactors.map((factor) => (
              <FormControlLabel
                key={factor.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(factor.id)}
                    onChange={() => handleToggle(factor.id)}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: 'text.primary',
                    }}
                  >
                    {factor.name}
                  </Typography>
                }
                sx={{
                  alignItems: 'center',
                  py: 1,
                  '& .MuiFormControlLabel-label': {
                    flex: 1,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <DialogBtn variant="outlined" onClick={handleClose}>
          취소
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleConfirm} disabled={selectedIds.length === 0}>
          확인
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
