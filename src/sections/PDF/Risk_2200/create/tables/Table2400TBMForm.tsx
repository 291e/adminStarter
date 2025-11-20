import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
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

// TODO: TanStack Query Hook(useQuery)으로 교육영상 목록 가져오기
const MOCK_EDUCATION_VIDEOS = [
  '아크릴로니트릴_10분안전',
  '화학물질 안전관리',
  '개인보호구 착용법',
  '비상대응 절차',
] as const;

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

  // 교육영상 선택 모달 핸들러
  const handleOpenEducationVideoModal = (index: number) => {
    setEducationVideoModalIndex(index);
  };

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
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={MOCK_EDUCATION_VIDEOS}
                      value={row.educationVideo}
                      onInputChange={(_, newValue) => {
                        onEducationVideoRowChange(index, 'educationVideo', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: <>{params.InputProps.endAdornment}</>,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      )}
                    />
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEducationVideoModal(index)}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      교육영상 선택
                    </Button>
                  )}
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
