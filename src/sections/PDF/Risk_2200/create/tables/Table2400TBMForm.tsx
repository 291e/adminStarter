import { useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import { uploadFile } from 'src/services/system/system.service';

import type { Table2400TBMData, InvestigationTeamMember } from '../../types/table-data';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';
import EducationVideoSelectModal from './modal/EducationVideoSelectModal';

// ----------------------------------------------------------------------

type Props = {
  data: Table2400TBMData;
  onDataChange: (data: Table2400TBMData) => void;
  onInspectionRowChange: (
    index: number,
    field: 'inspectionContent' | 'result',
    value: string
  ) => void;
  onInspectionRowDelete: (index: number) => void;
  onInspectionRowMove: (fromIndex: number, toIndex: number) => void;
  onInspectionAddRow: () => void;
  onEducationContentChange: (value: string) => void;
  onEducationVideoRowChange: (
    index: number,
    field: 'participant' | 'educationVideo' | 'signature',
    value: InvestigationTeamMember | null | string
  ) => void;
  onEducationVideoRowDelete: (index: number) => void;
  onEducationVideoRowMove: (fromIndex: number, toIndex: number) => void;
  onEducationVideoAddRow: () => void;
};

export default function Table2400TBMForm({
  data,
  onDataChange,
  onInspectionRowChange,
  onInspectionRowDelete,
  onInspectionRowMove,
  onInspectionAddRow,
  onEducationContentChange,
  onEducationVideoRowChange,
  onEducationVideoRowDelete,
  onEducationVideoRowMove,
  onEducationVideoAddRow,
}: Props) {
  const theme = useTheme();
  const [draggedInspectionIndex, setDraggedInspectionIndex] = useState<number | null>(null);
  const [dragOverInspectionIndex, setDragOverInspectionIndex] = useState<number | null>(null);
  const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null);
  const [dragOverVideoIndex, setDragOverVideoIndex] = useState<number | null>(null);
  const [participantModalIndex, setParticipantModalIndex] = useState<number | null>(null);
  const [educationVideoModalIndex, setEducationVideoModalIndex] = useState<number | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 점검내용 테이블 드래그 핸들러
  const handleInspectionDragStart = (index: number) => {
    setDraggedInspectionIndex(index);
  };

  const handleInspectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedInspectionIndex !== null && draggedInspectionIndex !== index) {
      setDragOverInspectionIndex(index);
    }
  };

  const handleInspectionDragLeave = () => {
    setDragOverInspectionIndex(null);
  };

  const handleInspectionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedInspectionIndex !== null && draggedInspectionIndex !== dropIndex) {
      onInspectionRowMove(draggedInspectionIndex, dropIndex);
    }
    setDraggedInspectionIndex(null);
    setDragOverInspectionIndex(null);
  };

  const handleInspectionDragEnd = () => {
    setDraggedInspectionIndex(null);
    setDragOverInspectionIndex(null);
  };

  // 교육영상 테이블 드래그 핸들러
  const handleVideoDragStart = (index: number) => {
    setDraggedVideoIndex(index);
  };

  const handleVideoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedVideoIndex !== null && draggedVideoIndex !== index) {
      setDragOverVideoIndex(index);
    }
  };

  const handleVideoDragLeave = () => {
    setDragOverVideoIndex(null);
  };

  const handleVideoDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedVideoIndex !== null && draggedVideoIndex !== dropIndex) {
      onEducationVideoRowMove(draggedVideoIndex, dropIndex);
    }
    setDraggedVideoIndex(null);
    setDragOverVideoIndex(null);
  };

  const handleVideoDragEnd = () => {
    setDraggedVideoIndex(null);
    setDragOverVideoIndex(null);
  };

  // 대상자 선택 모달 핸들러
  const handleOpenParticipantModal = (index: number) => {
    setParticipantModalIndex(index);
  };

  const handleCloseParticipantModal = () => {
    setParticipantModalIndex(null);
  };

  const handleParticipantConfirm = (members: InvestigationTeamMember[]) => {
    if (participantModalIndex !== null) {
      const selected = members[0];
      if (selected) {
        onEducationVideoRowChange(participantModalIndex, 'participant', selected);
      }
    }
    handleCloseParticipantModal();
  };

  // 교육영상 선택 모달 핸들러 (동영상 업로드로 대체되었지만, 모달이 여전히 사용될 수 있으므로 유지)
  const handleCloseEducationVideoModal = () => {
    setEducationVideoModalIndex(null);
  };

  const handleEducationVideoConfirm = (video: { title: string; summary: string }) => {
    if (educationVideoModalIndex !== null) {
      // 교육영상 제목 설정
      onEducationVideoRowChange(educationVideoModalIndex, 'educationVideo', video.title);
      // 교육내용에 요약 자동 입력
      onEducationContentChange(video.summary);
    }
    handleCloseEducationVideoModal();
  };

  const tableStyle = {
    width: '100%',
    border: '2px solid',
    borderColor: 'text.primary',
    borderCollapse: 'collapse',
    '& th, & td': {
      border: '1px solid',
      borderColor: 'text.primary',
      padding: 0,
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    '& th': {
      backgroundColor: 'grey.100',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '22px',
    },
    '& td': {
      padding: '4px',
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 점검내용 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ flex: 1 }}>점검내용</th>
              <th style={{ flex: 1 }}>결과</th>
              <th style={{ width: 46 }}>이동</th>
              <th style={{ width: 55 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.inspectionRows.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleInspectionDragStart(index)}
                onDragOver={(e) => handleInspectionDragOver(e, index)}
                onDragLeave={handleInspectionDragLeave}
                onDrop={(e) => handleInspectionDrop(e, index)}
                onDragEnd={handleInspectionDragEnd}
                style={{
                  opacity: draggedInspectionIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverInspectionIndex === index && draggedInspectionIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
                  cursor: 'move',
                }}
              >
                <td>
                  <TextField
                    size="small"
                    value={row.inspectionContent}
                    onChange={(e) =>
                      onInspectionRowChange(index, 'inspectionContent', e.target.value)
                    }
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    value={row.result}
                    onChange={(e) => onInspectionRowChange(index, 'result', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={20} />
                    </IconButton>
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onInspectionRowDelete(index)}
                      sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                        '&:hover': {
                          bgcolor: 'error.dark',
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
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 3 }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={onInspectionAddRow}
            startIcon={<Iconify icon="mingcute:add-line" width={20} />}
            sx={{
              minHeight: 36,
              fontSize: 14,
              fontWeight: 700,
              px: 1.5,
              py: 0.75,
            }}
          >
            항목추가
          </Button>
        </Box>
      </Box>

      {/* 교육내용 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            border: '2px solid',
            borderColor: 'text.primary',
            borderCollapse: 'collapse',
            '& th, & td': {
              border: '1px solid',
              borderColor: 'text.primary',
              padding: 0,
              textAlign: 'center',
              verticalAlign: 'middle',
            },
            '& th': {
              backgroundColor: 'grey.100',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
            },
            '& td': {
              padding: '4px',
            },
          }}
        >
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: '100%' }}>교육내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <TextField
                  size="small"
                  value={data.educationContent}
                  onChange={(e) => onEducationContentChange(e.target.value)}
                  fullWidth
                  multiline
                  rows={6}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 14,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>
          </tbody>
        </Box>
      </Box>

      {/* 교육영상 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: '30%' }}>대상자</th>
              <th style={{ width: '35%' }}>교육영상</th>
              <th style={{ width: '25%' }}>서명</th>
              <th style={{ width: 46 }}>이동</th>
              <th style={{ width: 55 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.educationVideoRows.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleVideoDragStart(index)}
                onDragOver={(e) => handleVideoDragOver(e, index)}
                onDragLeave={handleVideoDragLeave}
                onDrop={(e) => handleVideoDrop(e, index)}
                onDragEnd={handleVideoDragEnd}
                style={{
                  opacity: draggedVideoIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverVideoIndex === index && draggedVideoIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
                  cursor: 'move',
                }}
              >
                <td>
                  {row.participant ? (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenParticipantModal(index)}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      {row.participant.name}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenParticipantModal(index)}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      대상자선택
                    </Button>
                  )}
                </td>
                <td>
                  {row.educationVideo ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontSize: 14,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.educationVideo}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => videoInputRef.current?.click()}
                        sx={{
                          minHeight: 30,
                          fontSize: 13,
                          fontWeight: 700,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        변경
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => videoInputRef.current?.click()}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      동영상 업로드
                    </Button>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        // 동영상 업로드
                        const uploadResponse = await uploadFile({ files: [file] });
                        const uploadedFiles = (uploadResponse as any).files || [];
                        const videoUrl = uploadedFiles[0]?.fileUrl || uploadedFiles[0]?.url;

                        if (videoUrl) {
                          onEducationVideoRowChange(index, 'educationVideo', videoUrl);
                        }
                      } catch (error) {
                        console.error('동영상 업로드 실패:', error);
                        // TODO: 에러 토스트 표시
                      }

                      // input 초기화
                      if (videoInputRef.current) {
                        videoInputRef.current.value = '';
                      }
                    }}
                  />
                </td>
                <td>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // TODO: 서명 추가 모달 또는 파일 업로드
                      onEducationVideoRowChange(index, 'signature', 'signature-placeholder');
                    }}
                    sx={{
                      minHeight: 30,
                      fontSize: 13,
                      fontWeight: 700,
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    추가 +
                  </Button>
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={20} />
                    </IconButton>
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onEducationVideoRowDelete(index)}
                      sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                        '&:hover': {
                          bgcolor: 'error.dark',
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
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 3 }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={onEducationVideoAddRow}
            startIcon={<Iconify icon="mingcute:add-line" width={20} />}
            sx={{
              minHeight: 36,
              fontSize: 14,
              fontWeight: 700,
              px: 1.5,
              py: 0.75,
            }}
          >
            항목추가
          </Button>
        </Box>
      </Box>

      {/* 대상자 선택 모달 */}
      {data.educationVideoRows.map((row, index) => (
        <InvestigationTeamSelectModal
          key={`participant-${index}`}
          open={participantModalIndex === index}
          onClose={handleCloseParticipantModal}
          onConfirm={handleParticipantConfirm}
          is2400Series
        />
      ))}

      {/* 교육영상 선택 모달 */}
      {data.educationVideoRows.map((row, index) => (
        <EducationVideoSelectModal
          key={`education-video-${index}`}
          open={educationVideoModalIndex === index}
          onClose={handleCloseEducationVideoModal}
          onConfirm={handleEducationVideoConfirm}
        />
      ))}
    </Box>
  );
}
