import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type DownloadFormat = 'pdf' | 'excel' | 'word' | 'ppt';

type Props = {
  open: boolean;
  documentName?: string;
  onClose: () => void;
  onSelect: (format: DownloadFormat) => void;
};

const FORMAT_OPTIONS: Array<{ format: DownloadFormat; label: string }> = [
  { format: 'pdf', label: 'PDF' },
  { format: 'excel', label: 'Excel' },
  { format: 'word', label: 'Word' },
  { format: 'ppt', label: 'PPT' },
];

export default function DownloadFormatModal({ open, documentName, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>다운로드 형식 선택</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {documentName ? `${documentName} 문서의` : '문서의'} 다운로드 형식을 선택해 주세요.
        </Typography>

        <Stack spacing={1}>
          {FORMAT_OPTIONS.map((option) => (
            <Button
              key={option.format}
              variant="outlined"
              onClick={() => onSelect(option.format)}
              sx={{ justifyContent: 'flex-start', fontWeight: 600 }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}
