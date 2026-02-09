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
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';
import type { CategoryItem } from './CategorySettingsModal';
import { useUploadVod, useVodStatus } from 'src/sections/VOD/hooks/use-vod-api';

// ----------------------------------------------------------------------

export type VODUploadFormData = {
  category: string;
  title: string;
  educationType: 'MANDATORY' | 'REGULAR';
  videoFile: File | null;
  description: string;
  isActive: boolean;
  thumbnailDataUrl?: string | null; // 비디오에서 추출한 썸네일 (Data URL)
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: VODUploadFormData, vodIdx?: number) => Promise<void> | void; // 선택적 (새 API 사용 시, vodIdx 전달)
  categories: CategoryItem[];
};

type UploadStep = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function VODUploadModal({ open, onClose, onSave, categories }: Props) {
  const [formData, setFormData] = useState<VODUploadFormData>({
    category: '',
    title: '',
    educationType: 'MANDATORY',
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
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [vodIdx, setVodIdx] = useState<number | null>(null);
  const formDataRef = useRef<VODUploadFormData>(formData);
  // onSave 호출 여부 추적 (무한 호출 방지)
  const onSaveCalledRef = useRef(false);
  // 프로그래스바 자동 포커싱을 위한 ref
  const progressBarRef = useRef<HTMLDivElement>(null);

  // VOD API 훅
  const uploadVodMutation = useUploadVod();
  // vodIdx가 있고 processing 상태이면 폴링 계속
  const isProcessing = uploadStep === 'processing' || uploadStep === 'uploading';
  const shouldEnablePolling = vodIdx !== null && isProcessing;
  const { data: vodStatus } = useVodStatus(vodIdx, {
    enabled: shouldEnablePolling,
    refetchInterval: (query) => {
      // enabled가 false면 폴링 중지
      if (!shouldEnablePolling) return false;
      // 데이터가 없으면 계속 폴링
      const data = query.state.data as any;
      if (!data) return 3000;
      // COMPLETED나 FAILED 상태면 폴링 중지
      const status = data.status;
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false;
      }
      // progress가 100이면 폴링 중지
      const progress = data.progress as number;
      if (progress >= 100) {
        return false;
      }
      // PROCESSING이나 PENDING 상태면 계속 폴링
      return 3000;
    },
  });
  // 디버깅용: 폴링 상태 확인
  const shouldPoll =
    shouldEnablePolling &&
    vodStatus &&
    (vodStatus as any).status !== 'COMPLETED' &&
    (vodStatus as any).status !== 'FAILED';

  // 디버깅: 폴링 상태 확인
  useEffect(() => {
    if (import.meta.env.DEV && vodIdx !== null) {
      console.log('🔍 [VODUploadModal] 폴링 상태:', {
        vodIdx,
        uploadStep,
        shouldPoll,
        hasVodStatus: !!vodStatus,
        progress: vodStatus ? (vodStatus as any).progress : null,
      });
    }
  }, [vodIdx, uploadStep, shouldPoll, vodStatus]);

  useEffect(() => {
    if (open) {
      const initialData: VODUploadFormData = {
        category: '',
        title: '',
        educationType: 'MANDATORY',
        videoFile: null,
        description: '',
        isActive: true,
        thumbnailDataUrl: null,
      };
      setFormData(initialData);
      formDataRef.current = initialData;
      setVideoPreview(null);
      setIsSaving(false);
      setErrorMessage('');
      setUploadStep('idle');
      setVodIdx(null);
      // 모달이 열릴 때 onSave 호출 플래그 리셋
      onSaveCalledRef.current = false;
    }
  }, [open]);

  // 업로드/처리 시작 시 프로그래스바로 자동 스크롤
  useEffect(() => {
    if ((uploadStep === 'uploading' || uploadStep === 'processing') && progressBarRef.current) {
      // 약간의 딜레이 후 스크롤 (DOM 업데이트 대기)
      setTimeout(() => {
        progressBarRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [uploadStep]);

  // VOD 처리 상태 모니터링 (axios interceptor가 응답을 평탄화하므로 직접 접근)
  useEffect(() => {
    if (!vodStatus || !vodIdx) return;

    // axios interceptor가 평탄화한 응답 구조: { vodIdx, status, processStep, progress, errorMessage, header }
    const statusData = vodStatus as any;
    const status = statusData.status as string;
    const progress = statusData.progress as number;

    if (import.meta.env.DEV) {
      console.log('📊 [VODUploadModal] 상태 업데이트:', {
        status,
        progress,
        processStep: statusData.processStep,
      });
    }

    if (status === 'COMPLETED') {
      // 이미 completed 상태이고 onSave가 호출되었다면 중복 호출 방지
      if (uploadStep === 'completed' && onSaveCalledRef.current) {
        return;
      }
      setUploadStep('completed');
      setIsSaving(false);
      // 처리 완료 시 onSave 호출 (vodIdx 전달) - 한 번만 호출
      if (onSave && !onSaveCalledRef.current) {
        onSaveCalledRef.current = true;
        // 최신 formData를 사용하기 위해 ref 사용
        try {
          const saveResult = onSave(formDataRef.current, vodIdx);
          // Promise인 경우에만 catch 처리
          if (saveResult instanceof Promise) {
            saveResult.catch((error: unknown) => {
              if (import.meta.env.DEV) {
                console.error('❌ [VODUploadModal] onSave 실패', error);
              }
              setUploadStep('error');
              setErrorMessage(
                error instanceof Error
                  ? error.message || '라이브러리 리포트 생성 중 오류가 발생했습니다.'
                  : '라이브러리 리포트 생성 중 오류가 발생했습니다.'
              );
            });
          }
        } catch (error: unknown) {
          // 동기 에러 처리
          if (import.meta.env.DEV) {
            console.error('❌ [VODUploadModal] onSave 실패', error);
          }
          setUploadStep('error');
          setErrorMessage(
            error instanceof Error
              ? error.message || '라이브러리 리포트 생성 중 오류가 발생했습니다.'
              : '라이브러리 리포트 생성 중 오류가 발생했습니다.'
          );
        }
      }
    } else if (status === 'FAILED') {
      setUploadStep('error');
      setErrorMessage(statusData.errorMessage || 'VOD 처리 중 오류가 발생했습니다.');
      setIsSaving(false);
    } else if (status === 'PROCESSING' || status === 'PENDING') {
      // processing 상태로 설정 (이미 processing이어도 상태는 유지하여 폴링 계속)
      setUploadStep('processing');
    }
  }, [vodStatus, vodIdx, onSave, uploadStep]);

  const handleChange = (field: keyof VODUploadFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      formDataRef.current = updated;
      return updated;
    });
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
    if (!formData.educationType) {
      setErrorMessage('교육 구분을 선택해주세요.');
      return;
    }
    if (!formData.videoFile) {
      setErrorMessage('비디오 파일을 업로드해주세요.');
      return;
    }
    setErrorMessage('');
    setIsSaving(true);
    setUploadStep('uploading');

    try {
      // 새 VOD API 사용
      const response = await uploadVodMutation.mutateAsync({
        video: formData.videoFile,
        educationType: formData.educationType,
      });

      // axios interceptor가 응답을 평탄화하므로 직접 접근
      const vodIdxValue = (response as any)?.vodIdx;
      if (vodIdxValue) {
        setVodIdx(vodIdxValue);
        setUploadStep('processing');
        // 처리 완료까지 대기 (useEffect에서 상태 모니터링)
        // 첫 번째 상태 조회를 위해 약간의 딜레이 후 폴링 시작
      } else {
        throw new Error('VOD 업로드 응답에 vodIdx가 없습니다.');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ [VODUploadModal] 업로드 실패', error);
      }
      setUploadStep('error');
      const message =
        error instanceof Error
          ? error.message || 'VOD 업로드 중 오류가 발생했습니다.'
          : 'VOD 업로드 중 오류가 발생했습니다.';
      setErrorMessage(message);
      setIsSaving(false);
    }
  };

  const handleCompletedClose = () => {
    setUploadStep('idle');
    setVodIdx(null);
    setIsSaving(false);
    onClose();
  };

  const handleClose = () => {
    if (uploadStep === 'uploading' || uploadStep === 'processing') {
      // 업로드/처리 중일 때는 닫기 방지 (백드롭 클릭·ESC·닫기 버튼 모두)
      return;
    }
    setFormData({
      category: '',
      title: '',
      educationType: 'MANDATORY',
      videoFile: null,
      description: '',
      isActive: true,
      thumbnailDataUrl: null,
    });
    setVideoPreview(null);
    setErrorMessage('');
    setIsSaving(false);
    setUploadStep('idle');
    setVodIdx(null);
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
          {/* 완료 화면 */}
          {uploadStep === 'completed' && (
            <Alert severity="success" sx={{ mb: 1 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  ✅ VOD 업로드 및 처리 완료!
                </Typography>
                <Typography variant="body2">
                  비디오가 성공적으로 업로드되었고 STT/번역 처리가 완료되었습니다.
                </Typography>
              </Stack>
            </Alert>
          )}

          {/* 에러 메시지 */}
          {errorMessage && uploadStep !== 'completed' && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errorMessage}
            </Alert>
          )}

          {/* 교육 구분 (새로운 디자인 적용) */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
              교육 구분
              <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                *
              </Box>
            </Typography>
            <Stack direction="row" spacing={2}>
              {[
                { value: 'MANDATORY', label: '의무교육' },
                { value: 'REGULAR', label: '정기교육' },
              ].map((type) => (
                <Box
                  key={type.value}
                  onClick={() =>
                    !isSaving && uploadStep === 'idle' && handleChange('educationType', type.value)
                  }
                  sx={{
                    flex: 1,
                    px: 3,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isSaving || uploadStep !== 'idle' ? 'default' : 'pointer',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: formData.educationType === type.value ? 'primary.main' : '#E5E8EB',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    opacity: isSaving || uploadStep !== 'idle' ? 0.6 : 1,
                    '&:hover': {
                      borderColor:
                        isSaving || uploadStep !== 'idle'
                          ? formData.educationType === type.value
                            ? 'primary.main'
                            : '#E5E8EB'
                          : formData.educationType === type.value
                            ? 'primary.main'
                            : 'text.disabled',
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {type.label}
                  </Typography>
                  <Checkbox
                    checked={formData.educationType === type.value}
                    icon={
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.5,
                          border: '1px solid #E5E8EB',
                        }}
                      />
                    }
                    checkedIcon={
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.5,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify icon="eva:checkmark-fill" width={14} sx={{ color: 'white' }} />
                      </Box>
                    }
                    sx={{ p: 0 }}
                    readOnly
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* 나머지 필드 (기존 스타일 유지) */}
          <Box
            sx={{
              opacity:
                uploadStep !== 'idle' && uploadStep !== 'error' && uploadStep !== 'completed'
                  ? 0.6
                  : 1,
              pointerEvents:
                uploadStep !== 'idle' && uploadStep !== 'error' && uploadStep !== 'completed'
                  ? 'none'
                  : 'auto',
            }}
          >
            <Stack spacing={3}>
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

              <TextField
                fullWidth
                label="제목"
                placeholder="제목"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />

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
          </Box>

          {/* 진행 상황 표시 */}
          {(uploadStep === 'uploading' || uploadStep === 'processing') && (
            <Box
              ref={progressBarRef}
              sx={{
                mt: 3,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {uploadStep === 'uploading' ? '비디오 업로드 중...' : '비디오 처리 중...'}
                  </Typography>
                  {uploadStep === 'processing' && vodStatus && (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {((vodStatus as any).progress as number) || 0}%
                    </Typography>
                  )}
                </Stack>
                {uploadStep === 'processing' && vodStatus ? (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={((vodStatus as any).progress as number) || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      단계: {((vodStatus as any).processStep as string) || '처리 중'}
                    </Typography>
                  </Box>
                ) : (
                  <LinearProgress
                    variant="indeterminate"
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                      },
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        {uploadStep === 'completed' ? (
          <Button variant="contained" onClick={handleCompletedClose} fullWidth>
            확인
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={isSaving || uploadStep === 'processing'}
            >
              취소
            </Button>
            <LoadingButton
              variant="contained"
              onClick={handleSave}
              loading={isSaving || uploadStep === 'processing'}
              disabled={uploadStep === 'processing'}
            >
              {uploadStep === 'uploading' ? '업로드 중...' : '등록'}
            </LoadingButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
