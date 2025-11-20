import { useState, useRef, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (images: File[]) => void;
  initialImages?: File[];
};

export default function ImageUploadModal({ open, onClose, onConfirm, initialImages = [] }: Props) {
  const [images, setImages] = useState<File[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // images 변경 시 미리보기 업데이트
  useEffect(() => {
    if (images.length === 0) {
      setPreviews([]);
      return;
    }

    const previewPromises = images.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((previewUrls) => {
      setPreviews(previewUrls);
    });
  }, [images]);

  // 모달이 열릴 때 초기 이미지 설정
  useEffect(() => {
    if (open) {
      setImages(initialImages);
    }
  }, [open, initialImages]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newImages = [...images, ...imageFiles];
    setImages(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleRemoveAll = () => {
    setImages([]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 이미지 업로드
    // const mutation = useMutation({
    //   mutationFn: (files: File[]) => uploadImages(files),
    //   onSuccess: (uploadedUrls) => {
    //     onConfirm(uploadedUrls);
    //     handleClose();
    //   },
    // });
    // mutation.mutate(images);
    onConfirm(images);
    handleClose();
  };

  const handleClose = () => {
    setImages(initialImages);
    setIsDragging(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 600,
          lineHeight: '28px',
          color: 'text.primary',
          pb: 3,
        }}
      >
        이미지 업로드
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 드래그 앤 드롭 영역 */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
            sx={{
              border: '1px dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              borderRadius: 2,
              bgcolor: isDragging ? 'action.hover' : 'grey.50',
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Iconify
              icon="eva:cloud-upload-fill"
              width={80}
              sx={{ color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
              이미지 업로드
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              클릭하여 파일을 선택하거나 마우스로 드래그하여 옮겨주세요.
            </Typography>
          </Box>

          {/* 이미지 미리보기 */}
          {previews.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button variant="outlined" size="small" onClick={handleRemoveAll}>
                  모두 제거
                </Button>
                <Button variant="contained" size="small" onClick={handleUploadClick}>
                  업로드
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {previews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0, 0, 0, 0.48)',
                        color: 'white',
                        width: 24,
                        height: 24,
                        p: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                        },
                      }}
                    >
                      <Iconify icon="mingcute:close-line" width={16} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <DialogBtn variant="outlined" onClick={handleClose}>
          닫기
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleConfirm}>
          확인
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}

