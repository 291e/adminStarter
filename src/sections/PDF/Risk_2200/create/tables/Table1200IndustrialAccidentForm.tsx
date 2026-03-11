import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import { uploadFile } from 'src/services/system/system.service';
import type { RiskReport } from 'src/services/operation/operation.types';

import type {
  Table1200IndustrialAccidentRow,
  InvestigationTeamMember,
  HumanDamage,
} from '../../types/table-data';
import { resolveFileUrl } from '../../utils/file-url';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';
import ImageUploadModal from './modal/ImageUploadModal';
import RiskReportSelectModal from './modal/RiskReportSelectModal';

// ----------------------------------------------------------------------

// 빈도 옵션 (1-5)
const FREQ_OPTIONS = [1, 2, 3, 4, 5] as const;

// 심각도 옵션 (1-5)
const SEV_OPTIONS = [1, 2, 3, 4, 5] as const;

// 평가 옵션 (빈도 × 심각도 결과에 따른 평가)
const EVAL_OPTIONS = [
  '1 (낮음)',
  '2 (낮음)',
  '3 (낮음)',
  '4 (낮음)',
  '5 (낮음)',
  '6 (관리필요)',
  '8 (관리필요)',
  '9 (관리필요)',
  '10 (관리필요)',
  '12 (관리필요)',
  '15 (관리필요)',
  '16 (관리필요)',
  '20 (관리필요)',
  '25 (관리필요)',
] as const;

// ----------------------------------------------------------------------

type Props = {
  row: Table1200IndustrialAccidentRow;
  onRowChange: (field: keyof Table1200IndustrialAccidentRow, value: any) => void;
  onInvestigationTeamAdd: (member: InvestigationTeamMember) => void;
  onInvestigationTeamDelete: (index: number) => void;
  onInvestigationTeamMove: (fromIndex: number, toIndex: number) => void;
  onHumanDamageAdd: (damage: HumanDamage) => void;
  onHumanDamageDelete: (index: number) => void;
  onHumanDamageMove: (fromIndex: number, toIndex: number) => void;
};

export default function Table1200IndustrialAccidentForm({
  row,
  onRowChange,
  onInvestigationTeamAdd,
  onInvestigationTeamDelete,
  onInvestigationTeamMove,
  onHumanDamageAdd,
  onHumanDamageDelete,
  onHumanDamageMove,
}: Props) {
  const theme = useTheme();
  const [selectModalMode, setSelectModalMode] = useState<'investigation' | 'humanDamage' | null>(
    null
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedInvestigationIndex, setDraggedInvestigationIndex] = useState<number | null>(null);
  const [draggedHumanDamageIndex, setDraggedHumanDamageIndex] = useState<number | null>(null);
  const [dragOverInvestigationIndex, setDragOverInvestigationIndex] = useState<number | null>(null);
  const [dragOverHumanDamageIndex, setDragOverHumanDamageIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRiskReportModalOpen, setIsRiskReportModalOpen] = useState(false);

  const handleInvestigationDragStart = (index: number) => {
    setDraggedInvestigationIndex(index);
  };

  const handleInvestigationDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedInvestigationIndex !== null && draggedInvestigationIndex !== index) {
      setDragOverInvestigationIndex(index);
    }
  };

  const handleInvestigationDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedInvestigationIndex !== null && draggedInvestigationIndex !== dropIndex) {
      onInvestigationTeamMove(draggedInvestigationIndex, dropIndex);
    }
    setDraggedInvestigationIndex(null);
    setDragOverInvestigationIndex(null);
  };

  const handleHumanDamageDragStart = (index: number) => {
    setDraggedHumanDamageIndex(index);
  };

  const handleHumanDamageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedHumanDamageIndex !== null && draggedHumanDamageIndex !== index) {
      setDragOverHumanDamageIndex(index);
    }
  };

  const handleHumanDamageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedHumanDamageIndex !== null && draggedHumanDamageIndex !== dropIndex) {
      onHumanDamageMove(draggedHumanDamageIndex, dropIndex);
    }
    setDraggedHumanDamageIndex(null);
    setDragOverHumanDamageIndex(null);
  };

  // 공통 스타일
  const headerCellStyle: React.CSSProperties = {
    backgroundColor: '#f4f6f8',
    padding: '8px',
    border: '1px solid #1c252e',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #1c252e',
    textAlign: 'center',
    verticalAlign: 'middle',
  };

  const subHeaderCellStyle: React.CSSProperties = {
    backgroundColor: '#fafafa',
    padding: '8px',
    border: '1px solid #1c252e',
    borderTop: 'none',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
  };

  const displayedInvestigationTeam = row.investigationTeam;

  const innerCellStyle: React.CSSProperties = {
    border: '1px solid #dfe3e8',
  };

  const displayedHumanDamage = row.humanDamage;

  const handleAddImages = async (files?: FileList | File[]) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    try {
      // 이미지 업로드
      const uploadResponse = await uploadFile({ files: imageFiles });
      const uploadedFiles = (uploadResponse as any).files || [];
      const imageUrls = uploadedFiles.map((file: any) => file.fileUrl || file.url).filter(Boolean);

      if (imageUrls.length > 0) {
        onRowChange('investigationImages', [...row.investigationImages, ...imageUrls]);
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      // TODO: 에러 토스트 표시
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleAddImages(event.target.files || undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDropImages = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    handleAddImages(event.dataTransfer.files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = row.investigationImages.filter((_, i) => i !== index);
    onRowChange('investigationImages', nextImages);
  };

  const handleRemoveAllImages = () => {
    onRowChange('investigationImages', []);
  };

  const handleUploadButtonClick = () => {
    setIsUploadModalOpen(true);
  };

  // 빈도와 심각도가 변경되면 평가 계산 (사전 평가)
  const handleFreqOrSevChangeBefore = (
    field: 'possibility' | 'severity',
    value: number | string
  ) => {
    const currentFreq =
      field === 'possibility'
        ? typeof value === 'number'
          ? value
          : Number(value) || 0
        : typeof row.riskAssessmentBefore.possibility === 'number'
          ? row.riskAssessmentBefore.possibility
          : Number(row.riskAssessmentBefore.possibility) || 0;
    const currentSev =
      field === 'severity'
        ? typeof value === 'number'
          ? value
          : Number(value) || 0
        : typeof row.riskAssessmentBefore.severity === 'number'
          ? row.riskAssessmentBefore.severity
          : Number(row.riskAssessmentBefore.severity) || 0;

    const updatedAssessment = {
      ...row.riskAssessmentBefore,
      [field]: value,
    };

    if (
      typeof currentFreq === 'number' &&
      typeof currentSev === 'number' &&
      currentFreq > 0 &&
      currentSev > 0
    ) {
      const evalValue = currentFreq * currentSev;
      // 평가 옵션에서 해당 값 찾기
      const evalOption = EVAL_OPTIONS.find((opt) => {
        const num = parseInt(opt.split(' ')[0], 10);
        return num === evalValue;
      });
      if (evalOption) {
        updatedAssessment.risk = evalOption;
      } else {
        // 옵션에 없는 경우 직접 입력 형식으로
        updatedAssessment.risk = `${evalValue}`;
      }
    }

    onRowChange('riskAssessmentBefore', updatedAssessment);
  };

  // 빈도와 심각도가 변경되면 평가 계산 (사후 평가)
  const handleFreqOrSevChangeAfter = (
    field: 'possibility' | 'severity',
    value: number | string
  ) => {
    const currentFreq =
      field === 'possibility'
        ? typeof value === 'number'
          ? value
          : Number(value) || 0
        : typeof row.riskAssessmentAfter.possibility === 'number'
          ? row.riskAssessmentAfter.possibility
          : Number(row.riskAssessmentAfter.possibility) || 0;
    const currentSev =
      field === 'severity'
        ? typeof value === 'number'
          ? value
          : Number(value) || 0
        : typeof row.riskAssessmentAfter.severity === 'number'
          ? row.riskAssessmentAfter.severity
          : Number(row.riskAssessmentAfter.severity) || 0;

    const updatedAssessment = {
      ...row.riskAssessmentAfter,
      [field]: value,
    };

    if (
      typeof currentFreq === 'number' &&
      typeof currentSev === 'number' &&
      currentFreq > 0 &&
      currentSev > 0
    ) {
      const evalValue = currentFreq * currentSev;
      // 평가 옵션에서 해당 값 찾기
      const evalOption = EVAL_OPTIONS.find((opt) => {
        const num = parseInt(opt.split(' ')[0], 10);
        return num === evalValue;
      });
      if (evalOption) {
        updatedAssessment.risk = evalOption;
      } else {
        // 옵션에 없는 경우 직접 입력 형식으로
        updatedAssessment.risk = `${evalValue}`;
      }
    }

    onRowChange('riskAssessmentAfter', updatedAssessment);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadModalConfirm = async (images: File[]) => {
    try {
      // 이미지 업로드
      const uploadResponse = await uploadFile({ files: images });

      // axios 인터셉터가 응답을 평탄화하므로 여러 형태 확인
      let imageUrls: string[] = [];

      // 형태 1: fileUrls 배열
      if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
        imageUrls = (uploadResponse as any).fileUrls;
      }
      // 형태 2: files 배열에서 fileUrl 추출
      else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
        imageUrls = (uploadResponse as any).files
          .map((file: any) => file.fileUrl || file.url)
          .filter(Boolean);
      }
      // 형태 3: data.fileUrls
      else if (
        (uploadResponse as any)?.data?.fileUrls &&
        Array.isArray((uploadResponse as any).data.fileUrls)
      ) {
        imageUrls = (uploadResponse as any).data.fileUrls;
      }

      if (imageUrls.length === 0) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      onRowChange('investigationImages', imageUrls);
      setIsUploadModalOpen(false);
      toast.success(`${imageUrls.length}개의 이미지가 업로드되었습니다.`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '파일 업로드에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const handleRiskReportModalClose = () => {
    setIsRiskReportModalOpen(false);
  };

  const handleRiskReportSelect = (report: RiskReport) => {
    const reportDate = report.registeredAt ? dayjs(report.registeredAt) : null;
    const imageUrls =
      report.imageUrls && report.imageUrls.length > 0
        ? report.imageUrls
        : report.imageUrl
          ? [report.imageUrl]
          : [];

    onRowChange('accidentName', report.title || '');
    onRowChange('accidentDate', reportDate?.isValid() ? reportDate.format('YYYY-MM-DD') : '');
    onRowChange('accidentTime', reportDate?.isValid() ? reportDate.format('HH:mm') : '');
    onRowChange('accidentLocation', report.location || '');
    onRowChange('accidentContent', report.content || '');
    onRowChange('investigationImages', imageUrls);
    setIsRiskReportModalOpen(false);
  };

  useEffect(() => {
    // investigationImages는 이제 URL 문자열 배열
    if (row.investigationImages && row.investigationImages.length > 0) {
      setImagePreviewUrls(
        row.investigationImages.map((value) => resolveFileUrl(value) || value).filter(Boolean)
      );
    } else {
      setImagePreviewUrls([]);
    }
  }, [row.investigationImages]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <table
          style={{
            width: '100%',
            border: '2px solid #1c252e',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: '154px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            {/* 사고명, 사고 일시 */}
            <tr>
              <th
                style={{ ...headerCellStyle, width: '154px', cursor: 'pointer' }}
                onClick={() => setIsRiskReportModalOpen(true)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Iconify icon="eva:search-fill" width={24} />
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>사고명</Typography>
                </Box>
              </th>
              <td colSpan={4} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentName}
                  onChange={(e) => onRowChange('accidentName', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
              <th style={{ ...headerCellStyle, width: '160px' }}>사고 일시</th>
              <td style={{ ...bodyCellStyle, width: '160px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <DatePicker
                    value={row.accidentDate ? dayjs(row.accidentDate) : null}
                    onChange={(newValue: Dayjs | null) =>
                      onRowChange('accidentDate', newValue?.format('YYYY-MM-DD') || '')
                    }
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        label: '날짜',
                        placeholder: 'YYYY- MM- DD',
                      },
                    }}
                  />
                  <TimePicker
                    value={row.accidentTime ? dayjs(row.accidentTime, 'HH:mm') : null}
                    onChange={(newValue: Dayjs | null) =>
                      onRowChange('accidentTime', newValue?.format('HH:mm') || '')
                    }
                    format="HH:mm"
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        label: '시간',
                        placeholder: 'hh: mm',
                      },
                    }}
                  />
                </Box>
              </td>
            </tr>

            {/* 사고장소, 사고 형태 */}
            <tr>
              <th style={headerCellStyle}>사고장소</th>
              <td colSpan={4} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentLocation}
                  onChange={(e) => onRowChange('accidentLocation', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
              <th style={headerCellStyle}>사고 형태</th>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentType}
                  onChange={(e) => onRowChange('accidentType', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 사고조사반 */}
            <tr>
              <th
                style={{ ...headerCellStyle, cursor: 'pointer' }}
                onClick={() => setSelectModalMode('investigation')}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
                >
                  <Iconify icon="eva:search-fill" width={24} />
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>사고조사반</Typography>
                </Box>
              </th>
              <td colSpan={6} style={{ padding: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      backgroundColor: '#f4f6f8',
                      textAlign: 'right',
                      borderBottom: '1px solid',
                      borderColor: 'text.primary',
                      p: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        // 항상 새 항목추가 (플레이스홀더는 displayedInvestigationTeam에만 있고 실제 row.investigationTeam에는 없음)
                        onInvestigationTeamAdd({ department: '', name: '' });
                      }}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      항목추가
                    </Button>
                  </Box>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid #dfe3e8',
                      borderTop: 'none',
                    }}
                  >
                    <colgroup>
                      <col style={{ width: '50%' }} />
                      <col style={{ width: '50%' }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>소속팀</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>성명</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle, width: 30 }}>
                          이동
                        </th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle, width: 39 }}>
                          삭제
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedInvestigationTeam.map((member, index) => (
                        <tr
                          key={index}
                          onDragOver={(e) => handleInvestigationDragOver(e, index)}
                          onDrop={(e) => handleInvestigationDrop(e, index)}
                          style={{
                            opacity: draggedInvestigationIndex === index ? 0.5 : 1,
                            backgroundColor:
                              dragOverInvestigationIndex === index &&
                              draggedInvestigationIndex !== index
                                ? theme.vars.palette.action.hover
                                : 'transparent',
                          }}
                        >
                          <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                            <TextField
                              size="small"
                              value={member.department}
                              onChange={(e) => {
                                const newTeam = [...row.investigationTeam];
                                newTeam[index] = { ...member, department: e.target.value };
                                onRowChange('investigationTeam', newTeam);
                              }}
                              fullWidth
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: 15,
                                  height: 'auto',
                                  p: 1,
                                },
                              }}
                            />
                          </td>
                          <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                            <TextField
                              size="small"
                              value={member.name}
                              onChange={(e) => {
                                const newTeam = [...row.investigationTeam];
                                newTeam[index] = { ...member, name: e.target.value };
                                onRowChange('investigationTeam', newTeam);
                              }}
                              fullWidth
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: 15,
                                  height: 'auto',
                                  p: 1,
                                },
                              }}
                            />
                          </td>
                          <td
                            style={{
                              ...bodyCellStyle,
                              padding: 0,
                              ...innerCellStyle,
                              width: 30,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                              }}
                            >
                              <IconButton
                                size="small"
                                draggable
                                onDragStart={() => handleInvestigationDragStart(index)}
                                onDragEnd={() => {
                                  setDraggedInvestigationIndex(null);
                                  setDragOverInvestigationIndex(null);
                                }}
                                sx={{
                                  p: 0.625,
                                  cursor: 'grab',
                                  '&:active': {
                                    cursor: 'grabbing',
                                  },
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <Iconify icon="carbon:chevron-sort" width={20} />
                              </IconButton>
                            </Box>
                          </td>
                          <td
                            style={{
                              ...bodyCellStyle,
                              padding: 0,
                              ...innerCellStyle,
                              width: 39,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                              }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => onInvestigationTeamDelete(index)}
                                disabled={!member.department?.trim() && !member.name?.trim()}
                                sx={{
                                  minHeight: 30,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  px: 1,
                                  py: 0.5,
                                  width: 23,
                                  bgcolor:
                                    member.department?.trim() || member.name?.trim()
                                      ? 'error.main'
                                      : 'action.disabledBackground',
                                  color:
                                    member.department?.trim() || member.name?.trim()
                                      ? 'error.contrastText'
                                      : 'action.disabled',
                                  '&:hover': {
                                    bgcolor:
                                      member.department?.trim() || member.name?.trim()
                                        ? 'error.dark'
                                        : 'action.disabledBackground',
                                  },
                                }}
                              >
                                삭제
                              </Button>
                            </Box>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </td>
            </tr>

            {/* 인적피해 */}
            <tr>
              <th
                style={{ ...headerCellStyle, cursor: 'pointer' }}
                onClick={() => setSelectModalMode('humanDamage')}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
                >
                  <Iconify icon="eva:search-fill" width={24} />
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>인적피해</Typography>
                </Box>
              </th>
              <td colSpan={6} style={{ padding: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      backgroundColor: '#f4f6f8',
                      textAlign: 'right',
                      borderBottom: '1px solid',
                      borderTop: '1px solid',
                      borderColor: 'text.primary',
                      p: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        // 항상 새 항목추가 (플레이스홀더는 displayedHumanDamage에만 있고 실제 row.humanDamage에는 없음)
                        onHumanDamageAdd({ department: '', name: '', position: '', injury: '' });
                      }}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      항목추가
                    </Button>
                  </Box>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid #dfe3e8',
                      borderTop: 'none',
                    }}
                  >
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>소속팀</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>성명</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>직급</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>상해부위/부상</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle, width: 30 }}>
                          이동
                        </th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle, width: 39 }}>
                          삭제
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedHumanDamage.map((damage, index) => (
                        <tr
                          key={index}
                          onDragOver={(e) => handleHumanDamageDragOver(e, index)}
                          onDrop={(e) => handleHumanDamageDrop(e, index)}
                          style={{
                            opacity: draggedHumanDamageIndex === index ? 0.5 : 1,
                            backgroundColor:
                              dragOverHumanDamageIndex === index &&
                              draggedHumanDamageIndex !== index
                                ? theme.vars.palette.action.hover
                                : 'transparent',
                          }}
                        >
                          <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                            <TextField
                              size="small"
                              value={damage.department}
                              onChange={(e) => {
                                const newDamage = [...row.humanDamage];
                                newDamage[index] = {
                                  ...damage,
                                  department: e.target.value,
                                };
                                onRowChange('humanDamage', newDamage);
                              }}
                              fullWidth
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: 15,
                                  height: 'auto',
                                  p: 1,
                                },
                              }}
                            />
                          </td>
                          <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                            <TextField
                              size="small"
                              value={damage.name}
                              onChange={(e) => {
                                const newDamage = [...row.humanDamage];
                                newDamage[index] = { ...damage, name: e.target.value };
                                onRowChange('humanDamage', newDamage);
                              }}
                              fullWidth
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: 15,
                                  height: 'auto',
                                  p: 1,
                                },
                              }}
                            />
                          </td>
                          <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                            <TextField
                              size="small"
                              value={damage.position}
                              onChange={(e) => {
                                const newDamage = [...row.humanDamage];
                                newDamage[index] = { ...damage, position: e.target.value };
                                onRowChange('humanDamage', newDamage);
                              }}
                              fullWidth
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: 15,
                                  height: 'auto',
                                  p: 1,
                                },
                              }}
                            />
                          </td>
                          <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                            <TextField
                              size="small"
                              value={damage.injury}
                              onChange={(e) => {
                                const newDamage = [...row.humanDamage];
                                newDamage[index] = { ...damage, injury: e.target.value };
                                onRowChange('humanDamage', newDamage);
                              }}
                              fullWidth
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: 15,
                                  height: 'auto',
                                  p: 1,
                                },
                              }}
                            />
                          </td>
                          <td
                            style={{
                              ...bodyCellStyle,
                              padding: 0,
                              ...innerCellStyle,
                              width: 30,
                            }}
                          >
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                draggable
                                onDragStart={() => handleHumanDamageDragStart(index)}
                                onDragEnd={() => {
                                  setDraggedHumanDamageIndex(null);
                                  setDragOverHumanDamageIndex(null);
                                }}
                                sx={{
                                  p: 0.625,
                                  cursor: 'grab',
                                  '&:active': {
                                    cursor: 'grabbing',
                                  },
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <Iconify icon="carbon:chevron-sort" width={20} />
                              </IconButton>
                            </Box>
                          </td>
                          <td
                            style={{
                              ...bodyCellStyle,
                              padding: 0,
                              ...innerCellStyle,
                              width: 39,
                            }}
                          >
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => onHumanDamageDelete(index)}
                                disabled={
                                  !damage.department?.trim() &&
                                  !damage.name?.trim() &&
                                  !damage.position?.trim() &&
                                  !damage.injury?.trim()
                                }
                                sx={{
                                  minHeight: 30,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  px: 1,
                                  py: 0.5,
                                  width: 23,
                                  bgcolor:
                                    damage.department?.trim() ||
                                    damage.name?.trim() ||
                                    damage.position?.trim() ||
                                    damage.injury?.trim()
                                      ? 'error.main'
                                      : 'action.disabledBackground',
                                  color:
                                    damage.department?.trim() ||
                                    damage.name?.trim() ||
                                    damage.position?.trim() ||
                                    damage.injury?.trim()
                                      ? 'error.contrastText'
                                      : 'action.disabled',
                                  '&:hover': {
                                    bgcolor:
                                      damage.department?.trim() ||
                                      damage.name?.trim() ||
                                      damage.position?.trim() ||
                                      damage.injury?.trim()
                                        ? 'error.dark'
                                        : 'action.disabledBackground',
                                  },
                                }}
                              >
                                삭제
                              </Button>
                            </Box>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </td>
            </tr>

            {/* 물적피해 */}
            <tr>
              <th style={headerCellStyle}>물적피해</th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.materialDamage}
                  onChange={(e) => onRowChange('materialDamage', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 사고내용 + 위험성 평가(사전) */}
            <tr>
              <th rowSpan={3} style={headerCellStyle}>
                사고내용
              </th>
              <td rowSpan={3} colSpan={3} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentContent}
                  onChange={(e) => onRowChange('accidentContent', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
              <th rowSpan={3} style={headerCellStyle}>
                위험성 평가
              </th>
              <td style={subHeaderCellStyle}>빈도</td>
              <td style={bodyCellStyle}>
                <FormControl fullWidth size="small">
                  <Select
                    value={
                      typeof row.riskAssessmentBefore.possibility === 'number'
                        ? row.riskAssessmentBefore.possibility
                        : row.riskAssessmentBefore.possibility || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      handleFreqOrSevChangeBefore('possibility', value);
                    }}
                    displayEmpty
                    sx={{
                      fontSize: 15,
                      height: 'auto',
                      '& .MuiSelect-select': {
                        py: 1,
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 15 }}>
                      <em />
                    </MenuItem>
                    {FREQ_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: 15 }}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>심각도</td>
              <td style={bodyCellStyle}>
                <FormControl fullWidth size="small">
                  <Select
                    value={
                      typeof row.riskAssessmentBefore.severity === 'number'
                        ? row.riskAssessmentBefore.severity
                        : row.riskAssessmentBefore.severity || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      handleFreqOrSevChangeBefore('severity', value);
                    }}
                    displayEmpty
                    sx={{
                      fontSize: 15,
                      height: 'auto',
                      '& .MuiSelect-select': {
                        py: 1,
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 15 }}>
                      <em />
                    </MenuItem>
                    {SEV_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: 15 }}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>평가</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentBefore.risk}
                  onChange={(e) =>
                    onRowChange('riskAssessmentBefore', {
                      ...row.riskAssessmentBefore,
                      risk: e.target.value,
                    })
                  }
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 사고원인 */}
            <tr>
              <th style={headerCellStyle}>사고원인</th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentCause}
                  onChange={(e) => onRowChange('accidentCause', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 의사/외부 전문가 소견 */}
            <tr>
              <th style={headerCellStyle}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                  의사/외부
                  <br />
                  전문가 소견
                </Typography>
              </th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.doctorOpinion}
                  onChange={(e) => onRowChange('doctorOpinion', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 재발방지 대책 + 위험성 평가(사후) */}
            <tr>
              <th rowSpan={3} style={headerCellStyle}>
                재발방지 대책
              </th>
              <td rowSpan={3} colSpan={3} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.preventionMeasure}
                  onChange={(e) => onRowChange('preventionMeasure', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
              <th rowSpan={3} style={headerCellStyle}>
                위험성 평가
              </th>
              <td style={subHeaderCellStyle}>빈도</td>
              <td style={bodyCellStyle}>
                <FormControl fullWidth size="small">
                  <Select
                    value={
                      typeof row.riskAssessmentAfter.possibility === 'number'
                        ? row.riskAssessmentAfter.possibility
                        : row.riskAssessmentAfter.possibility || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      handleFreqOrSevChangeAfter('possibility', value);
                    }}
                    displayEmpty
                    sx={{
                      fontSize: 15,
                      height: 'auto',
                      '& .MuiSelect-select': {
                        py: 1,
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 15 }}>
                      <em />
                    </MenuItem>
                    {FREQ_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: 15 }}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>심각도</td>
              <td style={bodyCellStyle}>
                <FormControl fullWidth size="small">
                  <Select
                    value={
                      typeof row.riskAssessmentAfter.severity === 'number'
                        ? row.riskAssessmentAfter.severity
                        : row.riskAssessmentAfter.severity || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      handleFreqOrSevChangeAfter('severity', value);
                    }}
                    displayEmpty
                    sx={{
                      fontSize: 15,
                      height: 'auto',
                      '& .MuiSelect-select': {
                        py: 1,
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 15 }}>
                      <em />
                    </MenuItem>
                    {SEV_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: 15 }}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>평가</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentAfter.risk}
                  onChange={(e) =>
                    onRowChange('riskAssessmentAfter', {
                      ...row.riskAssessmentAfter,
                      risk: e.target.value,
                    })
                  }
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 기타내용 사고조사 내용 */}
            <tr>
              <th style={headerCellStyle}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                  기타내용
                  <br />
                  사고조사 내용
                </Typography>
              </th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.otherContent}
                  onChange={(e) => onRowChange('otherContent', e.target.value)}
                  fullWidth
                  multiline
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                      p: 1,
                    },
                  }}
                />
              </td>
            </tr>

            {/* 기타내용 사고조사 사진 */}
            <tr>
              <th style={headerCellStyle}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                  기타내용
                  <br />
                  사고조사 사진
                </Typography>
              </th>
              <td colSpan={6} style={bodyCellStyle}>
                <Stack spacing={2}>
                  {/* 사진이 없을 때만 드래그 앤 드롭 영역 표시 */}
                  {imagePreviewUrls.length === 0 && (
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDropImages}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      sx={{
                        border: '1px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'divider',
                        bgcolor: isDragActive ? 'primary.lighter' : 'grey.50',
                        borderRadius: 2,
                        px: { xs: 2, sm: 4 },
                        py: { xs: 4, sm: 6 },
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Iconify
                        icon="eva:cloud-upload-fill"
                        width={64}
                        sx={{ color: 'primary.main', mb: 2 }}
                      />
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        이미지 업로드
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        클릭하여 파일을 선택하거나 마우스로 드래그하여 옮겨주세요.
                      </Typography>
                    </Box>
                  )}

                  {/* 사진이 1개일 때: 드래그 앤 드롭 영역을 사진 미리보기로 대체 */}
                  {imagePreviewUrls.length === 1 && (
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDropImages}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                    >
                      <Box
                        component="img"
                        src={imagePreviewUrls[0]}
                        alt="사고조사 이미지"
                        sx={{
                          width: '100%',
                          height: '100%',
                          maxHeight: 300,
                          display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveImage(0);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                        }}
                      >
                        <Iconify icon="solar:close-circle-bold" width={16} />
                      </IconButton>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        sx={{ p: 1.5, bgcolor: 'background.paper' }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveAllImages();
                          }}
                        >
                          제거
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleUploadButtonClick();
                          }}
                        >
                          업로드
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* 사진이 2개 이상일 때: 그리드 형태로 표시 */}
                  {imagePreviewUrls.length > 1 && (
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {imagePreviewUrls.map((url, index) => (
                          <Box
                            key={url}
                            sx={{
                              width: 96,
                              height: 96,
                              borderRadius: 2,
                              overflow: 'hidden',
                              position: 'relative',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Box
                              component="img"
                              src={url}
                              alt={`사고조사 이미지 ${index + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveImage(index);
                              }}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'common.white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                              }}
                            >
                              <Iconify icon="solar:close-circle-bold" width={16} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={handleRemoveAllImages}
                          disabled={row.investigationImages.length === 0}
                        >
                          모두 제거
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          onClick={handleUploadButtonClick}
                        >
                          업로드
                        </Button>
                      </Stack>
                    </Stack>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />
                </Stack>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>

      {/* 모달들 */}
      <InvestigationTeamSelectModal
        open={selectModalMode !== null}
        onClose={() => setSelectModalMode(null)}
        isSingleSelect // 사고조사반, 인적피해 모두 1명만 선택 가능
        onConfirm={(members) => {
          if (selectModalMode === 'investigation') {
            members.forEach((member) => {
              // 비어있는 칸 찾기 (department와 name이 모두 비어있는 경우)
              const emptyIndex = row.investigationTeam.findIndex(
                (item) => !item.department?.trim() && !item.name?.trim()
              );
              if (emptyIndex >= 0) {
                // 비어있는 칸이 있으면 그 칸을 업데이트
                const updatedTeam = [...row.investigationTeam];
                updatedTeam[emptyIndex] = member;
                onRowChange('investigationTeam', updatedTeam);
              } else {
                // 비어있는 칸이 없으면 새로 추가
                onInvestigationTeamAdd(member);
              }
            });
          }
          if (selectModalMode === 'humanDamage') {
            members.forEach((member) => {
              const damage: HumanDamage = {
                department: member.department,
                name: member.name,
                position: '',
                injury: '',
              };
              // 비어있는 칸 찾기 (department, name, position, injury가 모두 비어있는 경우)
              const emptyIndex = row.humanDamage.findIndex(
                (item) =>
                  !item.department?.trim() &&
                  !item.name?.trim() &&
                  !item.position?.trim() &&
                  !item.injury?.trim()
              );
              if (emptyIndex >= 0) {
                // 비어있는 칸이 있으면 그 칸을 업데이트
                const updatedDamage = [...row.humanDamage];
                updatedDamage[emptyIndex] = damage;
                onRowChange('humanDamage', updatedDamage);
              } else {
                // 비어있는 칸이 없으면 새로 추가
                onHumanDamageAdd(damage);
              }
            });
          }
          setSelectModalMode(null);
        }}
      />
      <ImageUploadModal
        open={isUploadModalOpen}
        onClose={handleUploadModalClose}
        onConfirm={handleUploadModalConfirm}
        initialImages={[]}
      />
      <RiskReportSelectModal
        open={isRiskReportModalOpen}
        onClose={handleRiskReportModalClose}
        onSelect={handleRiskReportSelect}
      />
    </Box>
  );
}
