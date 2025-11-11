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

export type IndustryItem = {
  id: string;
  name: string;
  value: string; // 탭에서 사용하는 value (manufacturing, transport, etc.)
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (industries: IndustryItem[]) => void;
  initialIndustries?: IndustryItem[];
};

const DEFAULT_INDUSTRIES: IndustryItem[] = [
  { id: '1', name: '제조업', value: 'manufacturing', isActive: true },
  { id: '2', name: '운수·창고·통신업', value: 'transport', isActive: true },
  { id: '3', name: '임업', value: 'forestry', isActive: true },
  { id: '4', name: '건물 등의 종합관리사업', value: 'building', isActive: true },
  { id: '5', name: '위생 및 유사서비스업', value: 'sanitation', isActive: true },
];

export default function IndustrySettingsModal({
  open,
  onClose,
  onSave,
  initialIndustries = [],
}: Props) {
  const [industries, setIndustries] = useState<IndustryItem[]>(initialIndustries);
  const [newIndustryName, setNewIndustryName] = useState<string | null>(null);

  // 초기 데이터로 업종 목록 채우기
  useEffect(() => {
    if (open && initialIndustries.length > 0) {
      setIndustries(initialIndustries);
    } else if (open && initialIndustries.length === 0) {
      // TODO: TanStack Query Hook(useQuery)으로 업종 목록 가져오기
      // const { data } = useQuery({
      //   queryKey: ['industries'],
      //   queryFn: () => getIndustries(),
      // });
      // if (data) setIndustries(data);
      // 임시 기본 데이터
      setIndustries(DEFAULT_INDUSTRIES);
    }
  }, [open, initialIndustries]);

  const handleToggleActive = (id: string) => {
    setIndustries((prev) =>
      prev.map((industry) =>
        industry.id === id ? { ...industry, isActive: !industry.isActive } : industry
      )
    );
  };

  const handleShowAddField = () => {
    setNewIndustryName('');
  };

  const handleAddIndustry = () => {
    if (!newIndustryName || !newIndustryName.trim()) {
      return;
    }

    const newIndustry: IndustryItem = {
      id: `industry-${Date.now()}`,
      name: newIndustryName.trim(),
      value: `industry-${Date.now()}`, // TODO: TanStack Query Hook(useMutation)으로 업종 등록 시 서버에서 생성된 value 사용
      isActive: true,
    };

    setIndustries((prev) => [...prev, newIndustry]);
    setNewIndustryName(null);
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 업종 목록 저장 (view.tsx의 handleSaveIndustries에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveIndustries에서 수행됩니다.
    onSave(industries);
    handleClose();
  };

  const handleClose = () => {
    setNewIndustryName(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
        <Stack spacing={2} sx={{ mt: 1, pb: 3 }}>
          {industries.map((industry) => (
            <Box key={industry.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                value={industry.name}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    height: 54,
                    bgcolor: 'background.paper',
                  },
                }}
              />
              <Switch
                checked={industry.isActive}
                onChange={() => handleToggleActive(industry.id)}
                color="primary"
              />
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                sx={{
                  '& .MuiInputBase-root': {
                    height: 54,
                  },
                }}
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
