import { useEffect, useState, useRef } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';

import type { DocumentSettingItem, DocumentPeriod } from '../hooks/use-document-setting';
import SaveConfirmModal from 'src/sections/PDF/Risk_2200/components/SaveConfirmModal';

// ----------------------------------------------------------------------

const PERIOD_OPTIONS: (DocumentPeriod | '')[] = [
  '',
  '년',
  '반기',
  '분기',
  '월',
  '주',
  '일',
  '상시',
  '즉시',
];

const APPROVAL_STEP_OPTIONS: Array<'0' | '1' | '2' | '3'> = ['0', '1', '2', '3'];

export type DocumentEditFormData = {
  documentName: string;
  period: DocumentPeriod | '';
  approvalStep: '0' | '1' | '2' | '3';
  status: 'active' | 'inactive';
  guideFile: File | null;
  sampleFiles: File[]; // 새로 추가된 샘플 파일들
  existingSampleUrls: string[]; // 유지되는 기존 샘플 URL들
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: DocumentEditFormData) => void;
  initialData?: DocumentSettingItem | null;
};

const getFullFileUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

/**
 * 샘플 URL 문자열을 파싱하여 SampleItem 배열로 변환
 * 지원 형식:
 * 1. 단일 URL: "http://example.com/file.pdf"
 * 2. 콤마 구분 URL: "url1,url2,url3"
 * 3. JSON 배열: '["url1", "url2"]'
 */
function parseSampleUrls(
  sampleUrl: string | null | undefined
): Array<{ url: string; name: string }> {
  if (!sampleUrl) return [];

  // JSON 배열 형식 시도
  if (sampleUrl.startsWith('[')) {
    try {
      const parsed = JSON.parse(sampleUrl);
      if (Array.isArray(parsed)) {
        return parsed.map((url: string, index: number) => ({
          url,
          name: url.split('/').pop() || `샘플 ${index + 1}`,
        }));
      }
    } catch {
      // JSON 파싱 실패시 다른 형식 시도
    }
  }

  // 콤마 구분 형식 시도
  const urls = sampleUrl
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  return urls.map((url, index) => ({
    url,
    name: url.split('/').pop() || `샘플 ${index + 1}`,
  }));
}

export default function EditDocumentSettingModal({ open, onClose, onSave, initialData }: Props) {
  // 시스템인지 아이템인지 구분 (safetySystemItemIdx === 0이면 시스템)
  const isSystem = initialData?.safetySystemItemIdx === 0;

  const [formData, setFormData] = useState<DocumentEditFormData>({
    documentName: '',
    period: '',
    approvalStep: '0',
    status: 'active',
    guideFile: null,
    sampleFiles: [],
    existingSampleUrls: [],
  });

  const [errors, setErrors] = useState<Partial<Record<'period' | 'approvalStep', string>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDraggingGuide, setIsDraggingGuide] = useState(false);
  const [isDraggingSample, setIsDraggingSample] = useState(false);
  const [guidePreview, setGuidePreview] = useState<string | null>(null);
  const [samplePreviews, setSamplePreviews] = useState<Array<{ url: string; name: string }>>([]); // 여러 샘플 미리보기
  const guideFileInputRef = useRef<HTMLInputElement>(null);
  const sampleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        documentName: initialData.name,
        period: initialData.period ?? '',
        approvalStep: String(initialData.approvalStep ?? 0) as '0' | '1' | '2' | '3',
        status: initialData.isActive ? 'active' : 'inactive',
        guideFile: null,
        sampleFiles: [],
        existingSampleUrls: parseSampleUrls(initialData.sampleUrl).map((s) => s.url),
      });
      setErrors({});
      setGuidePreview(getFullFileUrl(initialData.guideUrl));
      // 기존 샘플 URL 파싱 (콤마 구분 또는 JSON 배열 지원)
      const existingSamples = parseSampleUrls(initialData.sampleUrl);
      setSamplePreviews(existingSamples);
    }
  }, [initialData, open]);

  // 파일 미리보기 생성
  useEffect(() => {
    if (formData.guideFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuidePreview(reader.result as string);
      };
      reader.readAsDataURL(formData.guideFile);
    }
  }, [formData.guideFile]);

  useEffect(() => {
    if (formData.sampleFiles.length > 0) {
      // 새로 추가된 파일들의 미리보기 생성
      const newPreviews: Array<{ url: string; name: string }> = [];
      formData.sampleFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({ url: reader.result as string, name: file.name });
          if (newPreviews.length === formData.sampleFiles.length) {
            // 현재 유지되고 있는 기존 샘플 URL들을 기반으로 미리보기 생성 (제거된 것은 포함되지 않음)
            const existingPreviews = formData.existingSampleUrls.map((url) => ({
              url,
              name: url.split('/').pop() || '샘플',
            }));
            setSamplePreviews([...existingPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, [formData.sampleFiles, formData.existingSampleUrls]);

  const handleChange = (field: keyof DocumentEditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value as DocumentEditFormData[typeof field] }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleToggleStatus = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked ? 'active' : 'inactive' }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<'period' | 'approvalStep', string>> = {};

    // 시스템인 경우 작성주기와 결재 단계 검증 생략
    if (!isSystem) {
      if (!formData.period) {
        nextErrors.period = '작성주기를 선택해주세요.';
      }

      // approvalStep은 0도 유효한 값이므로 검증 제거
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRequestSave = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    // 현재 samplePreviews에 남아있는 것들 중 서버 URL인 것들만 추출
    const currentExistingUrls = samplePreviews
      .filter((s) => !s.url.startsWith('blob:') && !s.url.startsWith('data:'))
      .map((s) => s.url);

    onSave({
      ...formData,
      existingSampleUrls: currentExistingUrls,
    });
    setConfirmOpen(false);
    handleClose();
  };

  const handleGuideFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setFormData((prev) => ({ ...prev, guideFile: file }));
  };

  const handleSampleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    // 여러 파일 추가 지원
    const newFiles = Array.from(files);
    setFormData((prev) => ({ ...prev, sampleFiles: [...prev.sampleFiles, ...newFiles] }));
  };

  const handleGuideDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGuide(false);
    handleGuideFileSelect(e.dataTransfer.files);
  };

  const handleGuideDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGuide(true);
  };

  const handleGuideDragLeave = () => {
    setIsDraggingGuide(false);
  };

  const handleSampleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSample(false);
    handleSampleFileSelect(e.dataTransfer.files);
  };

  const handleSampleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSample(true);
  };

  const handleSampleDragLeave = () => {
    setIsDraggingSample(false);
  };

  const handleGuideUploadClick = () => {
    guideFileInputRef.current?.click();
  };

  const handleSampleUploadClick = () => {
    sampleFileInputRef.current?.click();
  };

  const handleRemoveGuide = () => {
    setFormData((prev) => ({ ...prev, guideFile: null }));
    setGuidePreview(null);
    if (guideFileInputRef.current) {
      guideFileInputRef.current.value = '';
    }
  };

  const handleRemoveSample = (index: number) => {
    // 인덱스로 특정 샘플 제거
    const existingCount = formData.existingSampleUrls.length;

    if (index < existingCount) {
      // 서버에 저장된 샘플 제거 - existingSampleUrls에서도 제거
      const urlToRemove = formData.existingSampleUrls[index];
      setFormData((prev) => ({
        ...prev,
        existingSampleUrls: prev.existingSampleUrls.filter((url) => url !== urlToRemove),
      }));
      setSamplePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 새로 추가된 파일 제거
      const fileIndex = index - existingCount;
      setFormData((prev) => ({
        ...prev,
        sampleFiles: prev.sampleFiles.filter((_, i) => i !== fileIndex),
      }));
      setSamplePreviews((prev) => prev.filter((_, i) => i !== index));
    }

    if (sampleFileInputRef.current) {
      sampleFileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setFormData({
      documentName: '',
      period: '',
      approvalStep: '0',
      status: 'active',
      guideFile: null,
      sampleFiles: [],
      existingSampleUrls: [],
    });
    setErrors({});
    setGuidePreview(null);
    setSamplePreviews([]);
    setIsDraggingGuide(false);
    setIsDraggingSample(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, lineHeight: '28px', letterSpacing: 0 }}
          >
            문서 설정 수정
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

        {/* 등록일 / 수정일 정보 영역 */}
        <Box
          sx={{
            bgcolor: 'background.neutral',
            display: 'flex',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ width: 80, fontSize: 14, lineHeight: '22px', fontWeight: 600 }}
              >
                등록일
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: 14, lineHeight: '22px', color: 'text.primary' }}
              >
                {initialData ? `${initialData.createdDate} ${initialData.createdTime}` : '-'}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ width: 80, fontSize: 14, lineHeight: '22px', fontWeight: 600 }}
              >
                수정일
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: 14, lineHeight: '22px', color: 'text.primary' }}
              >
                {/* TODO: 실제 수정일 필드가 생기면 교체 */}-
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 3, pb: 3 }}>
            <TextField
              fullWidth
              label="문서명"
              value={formData.documentName}
              onChange={(e) => handleChange('documentName', e.target.value)}
            />

            {/* 아이템인 경우에만 작성주기와 결재 단계 표시 */}
            {!isSystem && (
              <>
                <FormControl fullWidth error={!!errors.period}>
                  <InputLabel id="document-period-label">작성주기</InputLabel>
                  <Select
                    labelId="document-period-label"
                    label="작성주기"
                    value={formData.period}
                    onChange={(e) => handleChange('period', e.target.value)}
                  >
                    {PERIOD_OPTIONS.map((option) => (
                      <MenuItem key={option || '비대상'} value={option}>
                        {option || '비대상'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.period && (
                    <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                      {errors.period}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth error={!!errors.approvalStep}>
                  <InputLabel id="approval-step-label">결재 단계</InputLabel>
                  <Select
                    labelId="approval-step-label"
                    label="결재 단계"
                    value={formData.approvalStep}
                    onChange={(e) => handleChange('approvalStep', e.target.value)}
                  >
                    {APPROVAL_STEP_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option === '0' ? '비대상' : option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.approvalStep && (
                    <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                      {errors.approvalStep}
                    </Typography>
                  )}
                </FormControl>
              </>
            )}

            {/* 가이드 업로드 영역 */}
            <Stack spacing={1.5}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
              >
                가이드
              </Typography>
              <input
                ref={guideFileInputRef}
                type="file"
                hidden
                onChange={(e) => handleGuideFileSelect(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
              <Box
                onDrop={handleGuideDrop}
                onDragOver={handleGuideDragOver}
                onDragLeave={handleGuideDragLeave}
                onClick={!guidePreview ? handleGuideUploadClick : undefined}
                sx={{
                  width: '100%',
                  minHeight: 200,
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: isDraggingGuide ? 'primary.main' : 'divider',
                  bgcolor: guidePreview ? 'grey.50' : 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 4,
                  py: 5,
                  textAlign: 'center',
                  cursor: guidePreview ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: guidePreview ? 'grey.50' : 'grey.200',
                    borderColor: guidePreview ? 'divider' : 'primary.main',
                  },
                }}
              >
                {guidePreview ? (
                  <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <Box
                      component="img"
                      src={guidePreview}
                      alt="가이드 미리보기"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                      {formData.guideFile
                        ? formData.guideFile.name
                        : initialData?.guideUrl?.split('/').pop() || '기존 가이드 파일'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveGuide();
                      }}
                      sx={{ mt: 1 }}
                    >
                      파일 제거
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <Iconify
                      icon="eva:cloud-upload-fill"
                      width={48}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary' }}
                    >
                      파일 업로드
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 14, color: 'text.secondary', lineHeight: '22px' }}
                    >
                      클릭하여 파일을 선택하거나 마우스로 드래그하여 옮겨주세요.
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>

            {/* 샘플 업로드 영역 (아이템인 경우에만 표시) */}
            {!isSystem && (
              <Stack spacing={1.5}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
                  >
                    샘플 ({samplePreviews.length}개)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSampleUploadClick}
                    startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
                  >
                    샘플 추가
                  </Button>
                </Box>
                <input
                  ref={sampleFileInputRef}
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => handleSampleFileSelect(e.target.files)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                />

                {/* 샘플 파일 목록 */}
                {samplePreviews.length > 0 ? (
                  <Stack spacing={1}>
                    {samplePreviews.map((sample, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            overflow: 'hidden',
                            flex: 1,
                          }}
                        >
                          <Iconify
                            icon="solar:file-bold-duotone"
                            width={24}
                            sx={{ color: 'primary.main', flexShrink: 0 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {sample.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSample(index)}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="solar:close-circle-bold" width={18} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box
                    onDrop={handleSampleDrop}
                    onDragOver={handleSampleDragOver}
                    onDragLeave={handleSampleDragLeave}
                    onClick={handleSampleUploadClick}
                    sx={{
                      width: '100%',
                      minHeight: 120,
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: isDraggingSample ? 'primary.main' : 'divider',
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 4,
                      py: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'grey.200',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <Iconify
                        icon="eva:cloud-upload-fill"
                        width={36}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
                      >
                        파일 업로드 (여러 개 선택 가능)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 12, color: 'text.secondary', lineHeight: '18px' }}
                      >
                        클릭하거나 드래그하여 파일을 추가하세요.
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === 'active'}
                  onChange={(e) => handleToggleStatus(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 400 }}>
                  활성
                </Typography>
              }
              sx={{ m: 0 }}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
                취소
              </Button>
              <Button variant="contained" onClick={handleRequestSave} sx={{ minWidth: 64 }}>
                저장
              </Button>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      <SaveConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
