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

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

// ----------------------------------------------------------------------

export type HighRiskWorkItem = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedItem: HighRiskWorkItem | null) => void;
  industry?: string; // 업종: 제조업, 운수‧창고‧통신업, 임업, 건물 등의 종합관리사업, 위생 및 유사서비스업
};

// TODO: TanStack Query Hook(useQuery)으로 고위험작업 목록 조회
// 임시 목업 데이터
const mockHighRiskWorks: HighRiskWorkItem[] = [
  { id: '1', name: '기계⋅설비 정비, 수리, 교체, 청소 등 비정형 작업' },
  { id: '2', name: '크레인 취급 작업 (이동식크레인 포함)' },
  { id: '3', name: '차량계 하역운반, 건설기계 (지게차 등) 이용 작업' },
  { id: '4', name: '추락⋅전도 등 위험장소 통행, 이동' },
  { id: '5', name: '재료가공기계 작업(프레스, 절단기, 전단기, 분쇄⋅파쇄기, 공작기계 등)' },
  { id: '6', name: '용접, 절단 작업' },
  { id: '7', name: '기계⋅기구 및 설비 설치, 철거 작업' },
  { id: '8', name: '리프트(승강기) 점검, 수리작업' },
  { id: '9', name: '밀폐공간 작업' },
  { id: '10', name: '사다리 이용 통행 및 작업' },
  { id: '11', name: '위험물질 취급 작업' },
  { id: '12', name: '중량물 적재⋅이동 등 인력취급 작업 (크레인, 지게차 등 동력기계 미사용)' },
  { id: '13', name: '차량 적재물 상⋅하차 작업' },
  { id: '14', name: '수공구 이용 작업' },
  { id: '15', name: '도장 작업' },
  { id: '16', name: '콘크리트 타설, 양생 작업' },
  { id: '17', name: '고소작업대 이용 작업' },
  { id: '18', name: '전기점검, 정비, 조작관련 작업' },
  { id: '19', name: '고열설비 취급 작업' },
  { id: '20', name: '채석장 발파작업' },
  { id: '21', name: '기타 위험작업' },
];

export default function SelectHighRiskWorkModal({ open, onClose, onConfirm, industry }: Props) {
  const [selectedId, setSelectedId] = useState<string>('');

  // TODO: TanStack Query Hook(useQuery)으로 업종별 고위험작업 목록 조회
  // const { data: highRiskWorks } = useQuery({
  //   queryKey: ['highRiskWorks', industry],
  //   queryFn: () => getHighRiskWorks({ industry }),
  //   enabled: open && !!industry,
  // });

  // TODO: 업종별 필터링 로직 추가
  // if (industry) {
  //   return mockHighRiskWorks.filter((work) => work.industry === industry);
  // }
  const highRiskWorks = useMemo(() => mockHighRiskWorks, [industry]);

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
