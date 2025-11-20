import { useState, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

// ----------------------------------------------------------------------

export type DisasterFactorItem = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: DisasterFactorItem[]) => void;
  highRiskWork?: string; // 선택된 고위험작업 및 상황
  industry?: string; // 업종: 제조업, 운수‧창고‧통신업, 임업, 건물 등의 종합관리사업, 위생 및 유사서비스업
};

// TODO: TanStack Query Hook(useQuery)으로 재해유발요인 목록 조회
// 임시 목업 데이터
const mockDisasterFactors: DisasterFactorItem[] = [
  { id: '1', name: '작업 중 기계⋅기구에 안전장치(방호장치 등) 미설치·미흡·무효화 8대 위험요인' },
  {
    id: '2',
    name: '정비, 수리, 교체 및 청소 등의 작업 시 설비 가동 정지 후 불시가동을 방지하기 위한 조치(기동장치에 잠금장치, 표지판) 미실시 8대 위험요인',
  },
  { id: '3', name: '정비, 수리, 교체 및 청소 등의 작업 시 설비⋅기계의 운전 정지 미실시' },
  { id: '4', name: '추락의 위험이 있는 장소에서 정비·수리 등의 작업 시 추락위험 방지조치 미실시' },
  { id: '5', name: '중량물, 설비 하부에서 작업 시 중량물 등의 미고정 등 깔림 위험 예방조치 미흡' },
  {
    id: '6',
    name: '밀폐공간 내 작업 시 산소결핍 또는 유해 가스에 의한 질식·중독 위험 예방조치 미실시 (적정공기: 산소농도 18~23.5%, 탄산가스농도 1.5%미만, 황화수소 10ppm미만 등)',
  },
  {
    id: '7',
    name: '가동 중인 설비 인근에서 작업 시 끼임, 부딪힘 등 위험 예방조치를 위한 충분한 작업 공간 확보 미실시',
  },
];

export default function SelectDisasterFactorModal({
  open,
  onClose,
  onConfirm,
  highRiskWork,
  industry,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // TODO: TanStack Query Hook(useQuery)으로 고위험작업별 재해유발요인 목록 조회
  // const { data: disasterFactors } = useQuery({
  //   queryKey: ['disasterFactors', highRiskWork, industry],
  //   queryFn: () => getDisasterFactors({ highRiskWork, industry }),
  //   enabled: open && !!highRiskWork,
  // });

  // TODO: 고위험작업별 필터링 로직 추가
  // if (highRiskWork) {
  //   return mockDisasterFactors.filter((factor) => factor.highRiskWork === highRiskWork);
  // }
  const disasterFactors = useMemo(() => mockDisasterFactors, [highRiskWork, industry]);

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
