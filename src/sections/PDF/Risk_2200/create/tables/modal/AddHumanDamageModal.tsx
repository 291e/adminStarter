import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import type { HumanDamage } from '../../../types/table-data';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (damage: HumanDamage) => void;
};

export default function AddHumanDamageModal({ open, onClose, onConfirm }: Props) {
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [injury, setInjury] = useState('');

  const handleConfirm = () => {
    if (department.trim() && name.trim() && position.trim() && injury.trim()) {
      onConfirm({
        department: department.trim(),
        name: name.trim(),
        position: position.trim(),
        injury: injury.trim(),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setDepartment('');
    setName('');
    setPosition('');
    setInjury('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 600,
          lineHeight: '28px',
          color: 'text.primary',
          pb: 3,
        }}
      >
        인적피해 항목 추가
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              소속
            </Typography>
            <TextField
              fullWidth
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="소속을 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 15,
                  lineHeight: '24px',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              성명
            </Typography>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성명을 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 15,
                  lineHeight: '24px',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              직급
            </Typography>
            <TextField
              fullWidth
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="직급을 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 15,
                  lineHeight: '24px',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              상해부위/부상
            </Typography>
            <TextField
              fullWidth
              value={injury}
              onChange={(e) => setInjury(e.target.value)}
              placeholder="상해부위/부상을 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 15,
                  lineHeight: '24px',
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <DialogBtn variant="outlined" onClick={handleClose}>
          취소
        </DialogBtn>
        <DialogBtn
          variant="contained"
          onClick={handleConfirm}
          disabled={!department.trim() || !name.trim() || !position.trim() || !injury.trim()}
        >
          추가하기
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
