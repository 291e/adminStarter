import { useState, useEffect, useRef } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import type { CategoryItem } from './CategorySettingsModal';

// ----------------------------------------------------------------------

export type VODUploadFormData = {
  category: string;
  title: string;
  videoFile: File | null;
  description: string;
  isActive: boolean;
  thumbnailDataUrl?: string | null; // 비디오에서 추출한 썸네일 (Data URL)
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: VODUploadFormData) => Promise<void> | void;
  categories: CategoryItem[];
};

export default function VODUploadModal({ open, onClose, onSave, categories }: Props) {
  const [formData, setFormData] = useState<VODUploadFormData>({
    category: '',
    title: '',
    videoFile: null,
    description: '',
    isActive: true,
    thumbnailDataUrl: null,
  });

  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        category: '',
        title: '',
        videoFile: null,
        description: '',
        isActive: true,
        thumbnailDataUrl: null,
      });
      setVideoPreview(null);
      setIsSaving(false);
      setErrorMessage('');
    }
  }, [open]);

  const handleChange = (field: keyof VODUploadFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVideoFileSelect = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      handleChange('videoFile', file);
      // 비디오에서 썸네일 추출
      extractVideoThumbnail(file);
    }
  };

  const extractVideoThumbnail = (file: File) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      // 비디오의 첫 프레임으로 썸네일 생성
      video.currentTime = 0.1; // 0.1초 지점의 프레임 사용
    };

    video.onseeked = () => {
      // 비디오 크기에 맞춰 캔버스 크기 설정
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 비디오 프레임을 캔버스에 그리기
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 캔버스를 이미지로 변환
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      setVideoPreview(thumbnailUrl);
      // 썸네일 Data URL을 formData에 저장
      handleChange('thumbnailDataUrl', thumbnailUrl);

      // 메모리 정리
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      // 에러 발생 시 기본 미리보기 사용
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      URL.revokeObjectURL(video.src);
    };
  };

  const handleRemoveVideo = () => {
    handleChange('videoFile', null);
    handleChange('thumbnailDataUrl', null);
    setVideoPreview(null);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleVideoFileSelect(file);
    }
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };

  const handleVideoDragLeave = () => {
    setIsDraggingVideo(false);
  };

  const handleSave = async () => {
    if (!formData.category.trim() || !formData.title.trim()) {
      setErrorMessage('카테고리와 제목을 모두 입력해주세요.');
      return;
    }
    if (!formData.videoFile) {
      setErrorMessage('비디오 파일을 업로드해주세요.');
      return;
    }
    setErrorMessage('');
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ [VODUploadModal] 업로드 실패', error);
      }
      const message =
        error instanceof Error
          ? error.message || 'VOD 업로드 중 오류가 발생했습니다.'
          : 'VOD 업로드 중 오류가 발생했습니다.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: '',
      title: '',
      videoFile: null,
      description: '',
      isActive: true,
      thumbnailDataUrl: null,
    });
    setVideoPreview(null);
    setErrorMessage('');
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          VOD 업로드
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

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errorMessage}
            </Alert>
          )}
          {/* 카테고리 선택 */}
          <FormControl fullWidth>
            <InputLabel id="category-label">카테고리</InputLabel>
            <Select
              labelId="category-label"
              label="카테고리"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 제목 입력 */}
          <TextField
            fullWidth
            label="제목"
            placeholder="제목"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />

          {/* 파일 업로드 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              파일 업로드
            </Typography>
            <Box
              onDrop={handleVideoDrop}
              onDragOver={handleVideoDragOver}
              onDragLeave={handleVideoDragLeave}
              onClick={() => !videoPreview && videoFileInputRef.current?.click()}
              sx={{
                bgcolor: 'grey.50',
                border: '1px dashed',
                borderColor: isDraggingVideo ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: videoPreview ? 0 : 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: videoPreview ? 'default' : 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                minHeight: videoPreview ? 300 : 'auto',
                aspectRatio: videoPreview ? '16/9' : 'auto',
                '&:hover': {
                  bgcolor: videoPreview ? 'grey.50' : 'grey.100',
                  borderColor: videoPreview ? 'divider' : 'primary.main',
                },
              }}
            >
              {videoPreview ? (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 1,
                      overflow: 'hidden',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <img
                      src={videoPreview}
                      alt="Video preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVideo();
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
                    <Iconify icon="solar:close-circle-bold" width={18} />
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
                    <Iconify
                      icon="eva:cloud-upload-fill"
                      width={80}
                      sx={{ color: 'primary.main' }}
                    />
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
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleVideoFileSelect(file);
                  }
                }}
              />
            </Box>
          </Box>

          {/* 내용 입력 */}
          <TextField
            fullWidth
            label="내용"
            placeholder="내용을 입력해주세요"
            multiline
            minRows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'grey.50',
              },
            }}
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isSaving}>
          취소
        </Button>
        <LoadingButton variant="contained" onClick={handleSave} loading={isSaving}>
          등록
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
