import { useCallback, useEffect, useRef, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import SignatureCanvas from 'react-signature-canvas';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
  targetLabel?: string;
  initialSignature?: string;
};

export default function SignatureModal({
  open,
  onClose,
  onConfirm,
  targetLabel = '결재자',
  initialSignature,
}: Props) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 840, height: 280 });
  const [isEmpty, setIsEmpty] = useState(true);

  const updateCanvasSize = useCallback(() => {
    if (!canvasContainerRef.current) {
      return;
    }
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width !== canvasSize.width || height !== canvasSize.height) {
      setCanvasSize({ width, height });
    }
  }, [canvasSize.height, canvasSize.width]);

  useEffect(() => {
    let observer: ResizeObserver | undefined;

    if (open) {
      updateCanvasSize();
      if (typeof ResizeObserver !== 'undefined' && canvasContainerRef.current) {
        observer = new ResizeObserver(() => updateCanvasSize());
        observer.observe(canvasContainerRef.current);
      }
    }

    return () => {
      observer?.disconnect();
    };
  }, [open, updateCanvasSize]);

  useEffect(() => {
    if (!open || !signatureRef.current || canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }
    if (initialSignature) {
      signatureRef.current.fromDataURL(initialSignature);
      setIsEmpty(false);
    } else {
      signatureRef.current.clear();
      setIsEmpty(true);
    }
  }, [open, initialSignature, canvasSize.width, canvasSize.height]);

  const handleClear = useCallback(() => {
    signatureRef.current?.clear();
    setIsEmpty(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!signatureRef.current || isEmpty) {
      return;
    }
    const canvas = signatureRef.current.getCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    onConfirm(dataUrl);
  }, [isEmpty, onConfirm]);

  const handleSignatureEnd = useCallback(() => {
    setIsEmpty(signatureRef.current?.isEmpty() ?? true);
  }, []);

  const handleClose = useCallback(() => {
    handleClear();
    onClose();
  }, [handleClear, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: '0px 40px 80px -8px rgba(0,0,0,0.24)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '28px',
            }}
          >
            서명
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ px: 3, pb: 2.5, pt: 2 }}>
          <Box
            ref={canvasContainerRef}
            sx={{
              border: '1px solid',
              borderColor: 'rgba(145,158,171,0.2)',
              borderRadius: 2,
              height: 280,
              position: 'relative',
              bgcolor: 'background.paper',
            }}
          >
            <SignatureCanvas
              key={`${canvasSize.width}-${canvasSize.height}`}
              ref={signatureRef}
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                style: { width: '100%', height: '100%' },
              }}
              penColor="#1c252e"
              onEnd={handleSignatureEnd}
            />
            {isEmpty && (
              <Typography
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dedede',
                  fontSize: 32,
                  fontWeight: 700,
                  pointerEvents: 'none',
                }}
              >
                서명을 그려주세요.
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="text"
              onClick={handleClear}
              sx={{
                fontWeight: 600,
                fontSize: 14,
                color: 'text.primary',
              }}
            >
              초기화
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                onClick={handleClose}
                sx={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.primary',
                }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={isEmpty}
                sx={{
                  bgcolor: '#1c252e',
                  '&:hover': { bgcolor: '#111720' },
                  fontWeight: 700,
                  fontSize: 14,
                  minWidth: 80,
                }}
              >
                확인
              </Button>
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              color: 'text.disabled',
            }}
          >
            {targetLabel} 서명을 입력해주세요.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
}
