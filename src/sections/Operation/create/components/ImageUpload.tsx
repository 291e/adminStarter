import { useState, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  images: File[];
  onChange: (images: File[]) => void;
  existingImageUrls?: string[];
  onRemoveExistingUrl?: (url: string) => void;
};

export default function ImageUpload({
  images,
  onChange,
  existingImageUrls = [],
  onRemoveExistingUrl,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!images.length) {
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
    Promise.all(previewPromises).then((result) => setPreviews(result));
  }, [images]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newImages = [...images, ...imageFiles];
    onChange(newImages);
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

  const handleRemoveMain = () => {
    if (images.length > 0) {
      const newImages = images.slice(1);
      onChange(newImages);
    }
  };

  const handleRemoveThumbnail = (index: number) => {
    const actualIndex = index + 1;
    const newImages = images.filter((_, i) => i !== actualIndex);
    onChange(newImages);
  };

  const handleRemoveAll = () => {
    onChange([]);
    // 기존 이미지 URL도 모두 제거
    existingImageUrls.forEach((url) => {
      onRemoveExistingUrl?.(url);
    });
  };

  const handleSelectThumbnail = (index: number) => {
    const actualIndex = index + 1;
    if (actualIndex <= 0 || actualIndex >= images.length) return;
    const selected = images[actualIndex];
    const rest = images.filter((_, i) => i !== actualIndex);
    onChange([selected, ...rest]);
  };

  // 기존 이미지 URL과 새로 업로드한 이미지 프리뷰 결합
  const allImageUrls = [...existingImageUrls, ...previews];
  const thumbnails = allImageUrls.slice(1);
  const mainPreview = allImageUrls[0] ?? null;
  const hasImages = images.length > 0 || existingImageUrls.length > 0;

  return (
    <Box>
      {!hasImages && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          이미지 업로드
        </Typography>
      )}

      {/* 메인 업로드 영역 */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !mainPreview && fileInputRef.current?.click()}
        sx={{
          bgcolor: 'grey.50',
          border: '1px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 1,
          height: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: mainPreview ? 'default' : 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            bgcolor: mainPreview ? 'grey.50' : 'grey.100',
            borderColor: mainPreview ? 'divider' : 'primary.main',
          },
        }}
      >
        {mainPreview ? (
          <>
            <Box
              sx={{
                position: 'absolute',
                inset: 1,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <img
                src={mainPreview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <Chip
                label="대표 이미지"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  fontWeight: 700,
                }}
              />
            </Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                if (existingImageUrls.length > 0 && mainPreview === existingImageUrls[0]) {
                  // 기존 이미지 URL 제거
                  onRemoveExistingUrl?.(existingImageUrls[0]);
                } else {
                  // 새로 업로드한 이미지 제거
                  handleRemoveMain();
                }
              }}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(0, 0, 0, 0.48)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                },
              }}
            >
              <Iconify icon="mingcute:close-line" width={18} />
            </IconButton>
          </>
        ) : (
          <>
            <Box
              sx={{
                width: 200,
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Iconify icon="eva:cloud-upload-fill" width={80} sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              이미지 업로드
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              클릭하여 파일을 선택하거나 마우스로 드래그하여 옮겨주세요.
            </Typography>
          </>
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

      {/* 썸네일 영역 */}
      {thumbnails.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
            {thumbnails.map((thumbnail, index) => {
              const actualIndex = index + 1;
              const isExistingUrl =
                actualIndex <= existingImageUrls.length &&
                thumbnail === existingImageUrls[actualIndex - 1];

              return (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 84,
                    height: 84,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => {
                    if (!isExistingUrl) {
                      handleSelectThumbnail(index);
                    }
                  }}
                >
                  <img
                    src={thumbnail}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isExistingUrl) {
                        onRemoveExistingUrl?.(thumbnail);
                      } else {
                        handleRemoveThumbnail(index);
                      }
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 48,
                      bgcolor: 'rgba(0, 0, 0, 0.48)',
                      color: 'white',
                      width: 18,
                      height: 18,
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                  >
                    <Iconify icon="mingcute:close-line" width={14} />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {hasImages && (
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleRemoveAll}>
            모두 제거
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" width={20} />}
            onClick={() => fileInputRef.current?.click()}
          >
            업로드
          </Button>
        </Stack>
      )}
    </Box>
  );
}
