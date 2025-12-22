import { useState, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import type { Checklist } from 'src/services/checklist/checklist.types';

// ----------------------------------------------------------------------

export type HighRiskWorkItem = {
  id: string;
  name: string;
  checklistIdx?: number; // API에서 사용하는 체크리스트 ID
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedItem: HighRiskWorkItem | null) => void;
  industry?: string; // 업종: 제조업, 운수‧창고‧통신업, 임업, 건물 등의 종합관리사업, 위생 및 유사서비스업
  allChecklists?: Checklist[]; // 모든 체크리스트 데이터 (클라이언트 사이드 필터링용)
};

export default function SelectHighRiskWorkModal({
  open,
  onClose,
  onConfirm,
  industry,
  allChecklists,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>('');

  // 체크리스트에서 고위험작업 목록 추출 (클라이언트 사이드 필터링)
  const highRiskWorks = useMemo<HighRiskWorkItem[]>(() => {
    if (!allChecklists || !Array.isArray(allChecklists) || allChecklists.length === 0) {
      return [];
    }

    // 업종별 필터링 (클라이언트 사이드)
    let filteredChecklists = allChecklists;
    if (industry) {
      filteredChecklists = allChecklists.filter((checklist) => {
        // industryName 필드로 비교 (업종명으로 비교)
        const checklistIndustryName = checklist.industryName || checklist.industry;
        return checklistIndustryName === industry;
      });
    }

    // 활성화된 체크리스트만 필터링
    filteredChecklists = filteredChecklists.filter(
      (checklist) => checklist.status === 'ACTIVE' || checklist.status === 'active'
    );

    // 고위험작업 이름 기준으로 중복 제거 및 변환
    const uniqueWorks = new Map<string, HighRiskWorkItem>();
    filteredChecklists.forEach((checklist) => {
      if (checklist.highRiskWork && !uniqueWorks.has(checklist.highRiskWork)) {
        uniqueWorks.set(checklist.highRiskWork, {
          id: checklist.checklistIdx?.toString() || `work-${uniqueWorks.size + 1}`,
          name: checklist.highRiskWork,
          checklistIdx: checklist.checklistIdx,
        });
      }
    });

    return Array.from(uniqueWorks.values());
  }, [allChecklists, industry]);

  const isLoading = false; // 클라이언트 사이드 필터링이므로 로딩 없음
  const isError = false; // 클라이언트 사이드 필터링이므로 에러 없음

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedId(event.target.value);
  };

  const handleConfirm = () => {
    const selectedItem = highRiskWorks.find((work) => work.id === selectedId) || null;
    onConfirm(selectedItem);
    handleClose();
  };

  const handleClose = () => {
    setSelectedId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 20,
          fontWeight: 700,
          lineHeight: '30px',
          color: 'text.primary',
          pb: 3,
        }}
      >
        고위험작업 및 상황 선택하기
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            데이터를 불러오는 중 오류가 발생했습니다.
          </Alert>
        ) : highRiskWorks.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {industry
              ? `선택한 업종(${industry})에 해당하는 고위험작업이 없습니다.`
              : '업종을 선택해주세요.'}
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <RadioGroup value={selectedId} onChange={handleChange}>
              {highRiskWorks.map((work) => (
                <FormControlLabel
                  key={work.id}
                  value={work.id}
                  control={<Radio />}
                  label={
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: '22px',
                        color: 'text.primary',
                      }}
                    >
                      {work.name}
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
            </RadioGroup>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <DialogBtn variant="outlined" onClick={handleClose}>
          취소
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleConfirm} disabled={!selectedId}>
          확인
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
