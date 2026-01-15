import { useState, useEffect, useRef, useMemo } from 'react';
import { CONFIG } from 'src/global-config';

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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import type { CategoryItem } from './CategorySettingsModal';
import type { LibraryReport } from 'src/services/library-report/library-report.types';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type EditContentFormData = {
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
  onSave: (data: EditContentFormData) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  categories: CategoryItem[];
  initialData?: LibraryReport | null;
};

export default function EditContentModal({
  open,
  onClose,
  onSave,
  onDelete,
  categories,
  initialData,
}: Props) {
  const [formData, setFormData] = useState<EditContentFormData>({
    category: '',
    title: '',
    videoFile: null,
    description: '',
    isActive: true,
  });

  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null); // 기존 파일명
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (
      url.startsWith('data:image/png;base64,data/admin/') ||
      url.startsWith('data:image/png;base64,/data/admin/')
    ) {
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) {
      return url;
    }
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  const normalizedThumbnailUrl = useMemo(
    () => getFullFileUrl(initialData?.thumbnailPath || initialData?.thumbnailUrl),
    [initialData?.thumbnailPath, initialData?.thumbnailUrl]
  );

  useEffect(() => {
    if (open && initialData) {
      // libraryReportCategoryInformation에서 카테고리 정보 가져오기
      const categoryName = initialData.libraryReportCategoryInformation?.name || '';
      setFormData({
        category: categoryName,
        title: initialData.title || '',
        videoFile: null,
        description: initialData.description || '',
        isActive: (initialData.status ?? 'active') === 'active',
        thumbnailDataUrl: null,
      });

      // 기존 파일 URL 및 파일명 설정
      const fileUrl = (initialData as any).videoUrl || (initialData as any).fileUrl || null;

      // 파일명 추출 (URL에서 또는 fileName 필드에서)
      let fileName = (initialData as any).fileName || null;
      if (!fileName && fileUrl) {
        // URL에서 파일명 추출
        const urlParts = fileUrl.split('/');
        fileName = urlParts[urlParts.length - 1];
        // 쿼리 파라미터 제거
        if (fileName.includes('?')) {
          fileName = fileName.split('?')[0];
        }
      }
      setExistingFileName(fileName);

      // 썸네일이 있고 유효한 경우에만 썸네일 표시
      if (normalizedThumbnailUrl && !normalizedThumbnailUrl.includes('data/admin/')) {
        setVideoPreview(normalizedThumbnailUrl);
      } else {
        setVideoPreview(null);
      }
    } else if (open) {
      setFormData({
        category: '',
        title: '',
        videoFile: null,
        description: '',
        isActive: true,
        thumbnailDataUrl: null,
      });
      setVideoPreview(null);
      setExistingFileName(null);
    }
    if (open) {
      setIsSaving(false);
      setErrorMessage('');
    }
  }, [open, initialData, normalizedThumbnailUrl]);

  const handleChange = (field: keyof EditContentFormData, value: any) => {
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

  const handleRemoveVideo = () => {
    handleChange('videoFile', null);
    handleChange('thumbnailDataUrl', null);
    setVideoPreview(null);
    setExistingFileName(null);
  };

  const handleSave = async () => {
    if (!formData.category.trim() || !formData.title.trim()) {
      setErrorMessage('카테고리와 제목을 모두 입력해주세요.');
      return;
    }
    setErrorMessage('');
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ [EditContentModal] 저장 실패', error);
      }
      const message =
        error instanceof Error
          ? error.message || '컨텐츠 저장 중 오류가 발생했습니다.'
          : '컨텐츠 저장 중 오류가 발생했습니다.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('❌ [EditContentModal] 삭제 실패', error);
      }
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
    setExistingFileName(null);
    setErrorMessage('');
    setIsSaving(false);
    onClose();
  };

  const registrationDate = initialData?.registrationDate || '';
  const modifiedDate = initialData?.registrationDate || '';

  const formattedRegistration = useMemo(() => {
    if (!registrationDate) {
      return null;
    }
    return `${fDateTime(registrationDate, 'YYYY-MM-DD')} ${fDateTime(registrationDate, 'HH:mm:ss')}`;
  }, [registrationDate]);

  const formattedModified = useMemo(() => {
    if (!modifiedDate) {
      return null;
    }
    return `${fDateTime(modifiedDate, 'YYYY-MM-DD')} ${fDateTime(modifiedDate, 'HH:mm:ss')}`;
  }, [modifiedDate]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          컨텐츠 수정
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

      {/* 등록일/수정일 정보 영역 */}
      <Box
        sx={{
          bgcolor: '#F4F6F8',
          px: 3,
          py: 2,
          display: 'flex',
          gap: 2,
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
              등록일
            </Typography>
            <Typography variant="body2">{formattedRegistration ?? '-'}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
              수정일
            </Typography>
            <Typography variant="body2">{formattedModified ?? '-'}</Typography>
          </Stack>
        </Stack>
      </Box>

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
              onClick={() =>
                !videoPreview && !existingFileName && videoFileInputRef.current?.click()
              }
              sx={{
                bgcolor: 'grey.50',
                border: '1px dashed',
                borderColor: isDraggingVideo ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: videoPreview || existingFileName ? 0 : 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: videoPreview || existingFileName ? 'default' : 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                minHeight: videoPreview ? 300 : existingFileName ? 120 : 'auto',
                aspectRatio: videoPreview ? '16/9' : 'auto',
                '&:hover': {
                  bgcolor: videoPreview || existingFileName ? 'grey.50' : 'grey.100',
                  borderColor: videoPreview || existingFileName ? 'divider' : 'primary.main',
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
              ) : existingFileName ? (
                // 기존 파일이 있지만 썸네일이 없는 경우 (MP4 등 비디오 파일)
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 3,
                      px: 2,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Iconify
                      icon={`solar:video-frame-bold` as any}
                      width={48}
                      sx={{ color: 'primary.main', mb: 1.5 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        maxWidth: '100%',
                      }}
                    >
                      {existingFileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      등록된 파일
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVideo();
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
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

          {/* 활성/비활성 스위치 */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                color="primary"
              />
            }
            label="활성"
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        {onDelete && (
          <Button onClick={handleDelete} sx={{ color: 'error.main', fontWeight: 700 }}>
            삭제
          </Button>
        )}
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={handleClose} disabled={isSaving}>
            취소
          </Button>
          <LoadingButton variant="contained" onClick={handleSave} loading={isSaving}>
            저장
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
