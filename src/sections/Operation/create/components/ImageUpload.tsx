import { useState, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  images: File[];
  onChange: (images: File[]) => void;
};

export default function ImageUpload({ images, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // images prop 변경 시 미리보기 업데이트
  useEffect(() => {
    if (images.length === 0) {
      setMainPreview(null);
      setThumbnails([]);
      return;
    }

    // 모든 이미지의 미리보기 생성
    const previewPromises = images.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((previews) => {
      if (previews.length > 0) {
        setMainPreview(previews[0]);
        if (previews.length > 1) {
          setThumbnails(previews.slice(1));
        } else {
          setThumbnails([]);
        }
      }
    });
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
      // useEffect가 자동으로 미리보기를 업데이트함
    }
  };

  const handleRemoveThumbnail = (index: number) => {
    // 썸네일 인덱스는 메인 이미지 다음부터 시작 (인덱스 1부터)
    const actualIndex = index + 1;
    const newImages = images.filter((_, i) => i !== actualIndex);
    onChange(newImages);
    // useEffect가 자동으로 미리보기를 업데이트함
  };

  const handleRemoveAll = () => {
    onChange([]);
    setMainPreview(null);
    setThumbnails([]);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        이미지 업로드
      </Typography>

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
            </Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMain();
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
              교육 자료 업로드
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
            {thumbnails.map((thumbnail, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: 1.5,
                  overflow: 'hidden',
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
                  onClick={() => handleRemoveThumbnail(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    left: 40,
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
            ))}
          </Stack>

          {/* 액션 버튼 */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
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
        </Box>
      )}
    </Box>
  );
}
