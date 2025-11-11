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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import type { CategoryItem } from './CategorySettingsModal';
import type { LibraryReport } from 'src/_mock/_library-report';

// ----------------------------------------------------------------------

export type EditContentFormData = {
  category: string;
  title: string;
  videoFile: File | null;
  subtitleFile: File | null;
  subtitleTitle: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: EditContentFormData) => void;
  onDelete?: () => void;
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
    subtitleFile: null,
    subtitleTitle: '',
    isActive: true,
  });

  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingSubtitle, setIsDraggingSubtitle] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const subtitleFileInputRef = useRef<HTMLInputElement>(null);

  // 활성화된 카테고리만 표시
  const activeCategories = categories.filter((cat) => cat.isActive);

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        category: initialData.category,
        title: initialData.title,
        videoFile: null,
        subtitleFile: null,
        subtitleTitle: initialData.hasSubtitles ? `${initialData.title}.smi` : '',
        isActive: initialData.status === 'active',
      });
      // TODO: TanStack Query Hook(useQuery)으로 비디오 파일 미리보기 URL 가져오기
      // const { data: videoUrl } = useQuery({
      //   queryKey: ['libraryContentVideo', initialData.id],
      //   queryFn: () => getLibraryContentVideoUrl(initialData.id),
      //   enabled: !!initialData.id,
      // });
      // setVideoPreview(videoUrl);
      setVideoPreview(null);
    } else if (open) {
      setFormData({
        category: '',
        title: '',
        videoFile: null,
        subtitleFile: null,
        subtitleTitle: '',
        isActive: true,
      });
      setVideoPreview(null);
    }
  }, [open, initialData]);

  const handleChange = (field: keyof EditContentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVideoFileSelect = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      handleChange('videoFile', file);
      // 미리보기 생성 (비디오 썸네일)
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubtitleFileSelect = (file: File) => {
    if (file && (file.type === 'text/vtt' || file.name.endsWith('.vtt') || file.name.endsWith('.srt'))) {
      handleChange('subtitleFile', file);
      if (!formData.subtitleTitle) {
        handleChange('subtitleTitle', file.name);
      }
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleVideoFileSelect(file);
    }
  };

  const handleSubtitleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSubtitle(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleSubtitleFileSelect(file);
    }
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };

  const handleSubtitleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSubtitle(true);
  };

  const handleVideoDragLeave = () => {
    setIsDraggingVideo(false);
  };

  const handleSubtitleDragLeave = () => {
    setIsDraggingSubtitle(false);
  };

  const handleRemoveVideo = () => {
    handleChange('videoFile', null);
    setVideoPreview(null);
  };

  const handleSave = () => {
    if (!formData.category || !formData.title) {
      // TODO: 에러 메시지 표시
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      category: '',
      title: '',
      videoFile: null,
      subtitleFile: null,
      subtitleTitle: '',
      isActive: true,
    });
    setVideoPreview(null);
    onClose();
  };

  const registrationDate = initialData?.registrationDate || '2025-10-23 16:55:23';
  // TODO: TanStack Query Hook(useQuery)으로 수정일 가져오기
  // const { data: contentDetail } = useQuery({
  //   queryKey: ['libraryContentDetail', initialData?.id],
  //   queryFn: () => getLibraryContentDetail(initialData!.id),
  //   enabled: !!initialData?.id,
  // });
  // const modifiedDate = contentDetail?.modifiedDate || '2025-10-23 16:55:23';
  const modifiedDate = '2025-10-23 16:55:23';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
          bgcolor: 'grey.50',
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
            <Typography variant="body2">{registrationDate}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
              수정일
            </Typography>
            <Typography variant="body2">{modifiedDate}</Typography>
          </Stack>
        </Stack>
      </Box>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 카테고리 선택 */}
          <FormControl fullWidth>
            <InputLabel id="category-label">카테고리</InputLabel>
            <Select
              labelId="category-label"
              label="카테고리"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {activeCategories.map((cat) => (
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
                p: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: videoPreview ? 'default' : 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
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
                      inset: 1,
                      borderRadius: 1,
                      overflow: 'hidden',
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

          {/* 자막 업로드 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              자막 업로드
            </Typography>
            <Box
              onDrop={handleSubtitleDrop}
              onDragOver={handleSubtitleDragOver}
              onDragLeave={handleSubtitleDragLeave}
              onClick={() => subtitleFileInputRef.current?.click()}
              sx={{
                bgcolor: 'grey.50',
                border: '1px dashed',
                borderColor: isDraggingSubtitle ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'grey.100',
                  borderColor: 'primary.main',
                },
              }}
            >
              <Iconify icon="eva:cloud-upload-fill" width={40} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.disabled">
                자막 업로드
              </Typography>
              {formData.subtitleFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                  {formData.subtitleFile.name}
                </Typography>
              )}
              <input
                ref={subtitleFileInputRef}
                type="file"
                accept=".vtt,.srt,text/vtt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleSubtitleFileSelect(file);
                  }
                }}
              />
            </Box>
          </Box>

          {/* 자막 제목 입력 */}
          <TextField
            fullWidth
            label="자막 제목"
            placeholder="자막 제목"
            value={formData.subtitleTitle}
            onChange={(e) => handleChange('subtitleTitle', e.target.value)}
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
          <Button variant="outlined" onClick={handleClose}>
            취소
          </Button>
          <Button variant="contained" onClick={handleSave}>
            저장
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

