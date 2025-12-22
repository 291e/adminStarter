import { useState, useEffect } from 'react';

import type { Dayjs } from 'dayjs';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useCreateEducationRecord } from '../hooks/use-education-report-api';
import { uploadFile } from 'src/services/system/system.service';
import type { CreateEducationRecordParams } from 'src/services/education-report/education-report.types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: EducationFormData) => void;
  memberIdx?: number; // 교육 기록을 추가할 멤버의 Index
  educationReportIdx?: number; // 교육 리포트 Index (단일 멤버용)
  educationReportIdxes?: number[]; // 교육 리포트 Index 배열 (여러 멤버용)
  selectedMemberNames?: string[]; // 선택된 멤버 이름 배열
};

export type EducationFormData = {
  educationType: 'mandatory' | 'regular';
  educationMethod: 'online' | 'offline';
  educationName: string;
  educationDate: Date | null;
  educationTime: string;
  evidenceFile?: File | null;
  participants: string[];
  notes: string;
};

export default function AddEducationModal({
  open,
  onClose,
  onSave,
  memberIdx,
  educationReportIdx,
  educationReportIdxes,
  selectedMemberNames = [],
}: Props) {
  const [formData, setFormData] = useState<EducationFormData>({
    educationType: 'mandatory',
    educationMethod: 'online',
    educationName: '',
    educationDate: null,
    educationTime: '',
    evidenceFile: null,
    participants: [],
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EducationFormData, string>>>({});
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const createEducationRecordMutation = useCreateEducationRecord();

  // 모달이 열릴 때 선택된 멤버 이름을 참석자에 자동 추가
  useEffect(() => {
    if (open && selectedMemberNames.length > 0) {
      // 중복 제거하여 참석자에 추가
      const uniqueNames = selectedMemberNames.filter(
        (name) => name.trim() && !formData.participants.includes(name.trim())
      );
      if (uniqueNames.length > 0) {
        handleChange('participants', [...formData.participants, ...uniqueNames]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedMemberNames]);

  const handleChange = (field: keyof EducationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRemoveParticipant = (name: string) => {
    handleChange(
      'participants',
      formData.participants.filter((p) => p !== name)
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange('evidenceFile', file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EducationFormData, string>> = {};

    if (!formData.educationName.trim()) {
      newErrors.educationName = '교육명을 입력해주세요';
    }
    if (!formData.educationDate) {
      newErrors.educationDate = '교육 일자를 선택해주세요';
    }
    if (!formData.educationTime.trim()) {
      newErrors.educationTime = '교육 시간을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // educationReportIdx 또는 educationReportIdxes가 없으면 에러
    const targetReportIdxes =
      educationReportIdxes || (educationReportIdx ? [educationReportIdx] : []);
    if (targetReportIdxes.length === 0) {
      setErrors({ educationName: '교육 리포트 정보를 찾을 수 없습니다.' });
      return;
    }

    try {
      // 파일이 있으면 먼저 업로드 (한 번만 업로드하고 모든 멤버에 동일한 파일 사용)
      let fileUrl: string | undefined;
      if (formData.evidenceFile) {
        if (import.meta.env.DEV) {
          console.log('📤 [AddEducationModal] 파일 업로드 시작', formData.evidenceFile.name);
        }
        const uploadResponse = await uploadFile({ files: [formData.evidenceFile] });

        // axios 인터셉터가 응답을 평탄화하므로 여러 형태 확인
        // 형태 1: fileUrls 배열
        if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
          fileUrl = (uploadResponse as any).fileUrls[0];
        }
        // 형태 2: files 배열에서 fileUrl 추출
        else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
          fileUrl = (uploadResponse as any).files[0]?.fileUrl;
        }
        // 형태 3: data.fileUrls
        else if (
          (uploadResponse as any)?.data?.fileUrls &&
          Array.isArray((uploadResponse as any).data.fileUrls)
        ) {
          fileUrl = (uploadResponse as any).data.fileUrls[0];
        }

        if (!fileUrl) {
          if (import.meta.env.DEV) {
            console.error('❌ [AddEducationModal] 파일 업로드 응답 구조:', uploadResponse);
          }
          throw new Error('파일 업로드에 실패했습니다.');
        }

        if (import.meta.env.DEV) {
          console.log('✅ [AddEducationModal] 파일 업로드 성공', fileUrl);
        }
      }

      // 공통 파라미터
      const baseParams: Omit<CreateEducationRecordParams, 'educationReportIdx'> = {
        method: (formData.educationMethod === 'online' ? '온라인' : '집체') as '온라인' | '집체',
        educationName: formData.educationName,
        educationTime: Number(formData.educationTime) || 0,
        educationDate: formData.educationDate
          ? dayjs(formData.educationDate).format('YYYY-MM-DD')
          : '',
        educationType: (formData.educationType === 'mandatory' ? 'MANDATORY' : 'REGULAR') as
          | 'MANDATORY'
          | 'REGULAR',
        ...(formData.evidenceFile?.name && { fileName: formData.evidenceFile.name }),
        ...(fileUrl && { fileUrl }),
        ...(formData.notes && { description: formData.notes }),
        ...(formData.notes && { memo: formData.notes }),
      };

      if (import.meta.env.DEV) {
        console.log('🔍 [AddEducationModal] 교육 기록 등록 요청', {
          count: targetReportIdxes.length,
          educationReportIdxes: targetReportIdxes,
          baseParams,
        });
      }

      // 선택된 모든 멤버에 대해 순차적으로 교육 기록 등록
      const results = await Promise.all(
        targetReportIdxes.map((reportIdx) =>
          createEducationRecordMutation.mutateAsync({
            ...baseParams,
            educationReportIdx: reportIdx,
          })
        )
      );

      if (import.meta.env.DEV) {
        console.log('✅ [AddEducationModal] 교육 기록 등록 성공', {
          count: results.length,
          results,
        });
      }

      onSave?.(formData);
      handleClose();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ [AddEducationModal] 교육 기록 등록 실패', error);
      }
      setErrors({
        educationName: `교육 기록 등록에 실패했습니다. (${targetReportIdxes.length}명 중 일부 실패)`,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      educationType: 'mandatory',
      educationMethod: 'online',
      educationName: '',
      educationDate: null,
      educationTime: '',
      evidenceFile: null,
      participants: [],
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          교육 추가
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 교육 구분 */}
          <Box>
            <FormLabel sx={{ mb: 1.5, display: 'block' }}>
              <Typography variant="subtitle2" sx={{ color: '#000' }}>
                교육 구분
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </Typography>
            </FormLabel>
            <RadioGroup
              row
              value={formData.educationType}
              onChange={(e) => handleChange('educationType', e.target.value)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="mandatory"
                control={<Radio />}
                label="의무교육"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                  m: 0,
                  flex: 1,
                }}
              />
              <FormControlLabel
                value="regular"
                control={<Radio />}
                label="정기교육"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                  m: 0,
                  flex: 1,
                }}
              />
            </RadioGroup>
          </Box>

          {/* 교육 방식 */}
          <Box>
            <FormLabel sx={{ mb: 1.5, display: 'block' }}>
              <Typography variant="subtitle2" sx={{ color: '#000' }}>
                교육 방식
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </Typography>
            </FormLabel>
            <RadioGroup
              row
              value={formData.educationMethod}
              onChange={(e) => handleChange('educationMethod', e.target.value)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="online"
                control={<Radio />}
                label="온라인"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                  m: 0,
                  flex: 1,
                }}
              />
              <FormControlLabel
                value="offline"
                control={<Radio />}
                label="집체"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                  m: 0,
                  flex: 1,
                }}
              />
            </RadioGroup>
          </Box>

          {/* 교육 내용 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              교육 내용
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="교육명"
                required
                fullWidth
                value={formData.educationName}
                onChange={(e) => handleChange('educationName', e.target.value)}
                error={!!errors.educationName}
                helperText={errors.educationName}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="교육 일자"
                  format="YYYY-MM-DD"
                  open={openDatePicker}
                  onOpen={() => setOpenDatePicker(true)}
                  onClose={() => setOpenDatePicker(false)}
                  value={formData.educationDate ? dayjs(formData.educationDate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    handleChange('educationDate', newValue ? newValue.toDate() : null);
                    setOpenDatePicker(false);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.educationDate,
                      helperText: errors.educationDate,
                      placeholder: '날짜 선택',
                      onClick: () => {
                        setOpenDatePicker(true);
                      },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          fontSize: 14,
                        },
                        '& input': {
                          cursor: 'pointer',
                        },
                        '& .MuiInputAdornment-root': {
                          display: formData.educationDate ? 'none' : 'flex',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <TextField
                label="교육 시간(분)"
                required
                fullWidth
                type="number"
                value={formData.educationTime}
                onChange={(e) => handleChange('educationTime', e.target.value)}
                error={!!errors.educationTime}
                helperText={errors.educationTime}
              />

              <Box>
                <TextField
                  label="증빙자료 (선택)"
                  fullWidth
                  value={formData.evidenceFile?.name || ''}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          color="primary"
                          component="label"
                          size="small"
                          sx={{ minWidth: 'auto', px: 1.5 }}
                        >
                          업로드하기
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                          />
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* 참석자 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              참석자
            </Typography>
            {formData.participants.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.participants.map((participant) => (
                  <Chip
                    key={participant}
                    label={participant}
                    onDelete={() => handleRemoveParticipant(participant)}
                    color="info"
                    variant="soft"
                    size="small"
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                선택된 참석자가 없습니다.
              </Typography>
            )}
          </Box>

          {/* 비고 */}
          <TextField
            label="비고"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          취소
        </Button>
        <Button onClick={handleSave} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
