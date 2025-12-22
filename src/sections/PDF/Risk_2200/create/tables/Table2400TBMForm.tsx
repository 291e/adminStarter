import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import type { Table2400TBMData, InvestigationTeamMember } from '../../types/table-data';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';
import EducationVideoSelectModal from './modal/EducationVideoSelectModal';
import SignatureModal from '../../edit/components/SignatureModal';
import {
  createWorkerSignature,
  addWorkerSignature,
} from 'src/services/safety-system/safety-system.service';

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
    field: 'participant' | 'educationVideo' | 'signature' | 'vodIdx' | 'workerSignatureIdx',
    value: InvestigationTeamMember | null | string | number | undefined
  ) => void;
  onEducationVideoRowDelete: (index: number) => void;
  onEducationVideoRowMove: (fromIndex: number, toIndex: number) => void;
  onEducationVideoAddRow: () => void;
  safetySystemDocumentIdx?: number; // 문서 Index (근로자 서명 API 호출용)
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
  safetySystemDocumentIdx,
}: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [draggedInspectionIndex, setDraggedInspectionIndex] = useState<number | null>(null);
  const [dragOverInspectionIndex, setDragOverInspectionIndex] = useState<number | null>(null);
  const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null);
  const [dragOverVideoIndex, setDragOverVideoIndex] = useState<number | null>(null);
  const [participantModalIndex, setParticipantModalIndex] = useState<number | null>(null);
  const [educationVideoModalIndex, setEducationVideoModalIndex] = useState<number | null>(null);
  const [signatureModalIndex, setSignatureModalIndex] = useState<number | null>(null);

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

  // 교육영상 선택 모달 핸들러
  const handleCloseEducationVideoModal = () => {
    setEducationVideoModalIndex(null);
  };

  // 근로자 대상자 등록 API Mutation
  const createWorkerSignatureMutation = useMutation({
    mutationFn: async ({
      documentIdx,
      workerList,
      rowIndex,
    }: {
      documentIdx: number;
      workerList: Array<{ targetMemberIdx: number; vodIdx?: number }>;
      rowIndex: number;
    }) => {
      if (import.meta.env.DEV) {
        console.log('🔵 [Table2400TBMForm] 근로자 대상자 등록 API 호출 시작:', {
          documentIdx,
          workerList,
          rowIndex,
          requestBody: { workerList },
        });
      }

      try {
        const response = await createWorkerSignature(documentIdx, { workerList });

        if (import.meta.env.DEV) {
          console.log('✅ [Table2400TBMForm] 근로자 대상자 등록 API 성공:', {
            documentIdx,
            response,
            workerSignatureIdx: response?.workerSignatureIdx,
          });
        }

        return { response, rowIndex };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ [Table2400TBMForm] 근로자 대상자 등록 API 실패:', {
            documentIdx,
            workerList,
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          });
        }
        throw error;
      }
    },
    onSuccess: (result) => {
      if (import.meta.env.DEV) {
        console.log('✅ [Table2400TBMForm] 근로자 대상자 등록 Mutation 성공:', {
          result,
          workerSignatureIdx: result.response?.workerSignatureIdx,
          rowIndex: result.rowIndex,
        });
      }

      toast.success('근로자 대상자가 등록되었습니다.');

      // workerSignatureIdx가 응답에 포함되어 있으면 저장
      if (result.response?.workerSignatureIdx) {
        onEducationVideoRowChange(
          result.rowIndex,
          'workerSignatureIdx',
          result.response.workerSignatureIdx
        );
      }

      // 알림 쿼리 무효화 (근로자 등록 후 알림 자동 발송됨)
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
    },
    onError: (error: Error) => {
      if (import.meta.env.DEV) {
        console.error('❌ [Table2400TBMForm] 근로자 대상자 등록 Mutation 실패:', {
          error,
          errorMessage: error.message,
          errorStack: error.stack,
        });
      }
      toast.error(`근로자 대상자 등록 실패: ${error.message}`);
    },
  });

  // 근로자 서명 등록 API Mutation
  const addWorkerSignatureMutation = useMutation({
    mutationFn: async ({
      documentIdx,
      workerSignatureIdx,
      signatureData,
      description,
    }: {
      documentIdx: number;
      workerSignatureIdx: number;
      signatureData: string;
      description?: string;
    }) => {
      // Base64 데이터 URL을 Base64 문자열로 변환
      const base64Data = signatureData.includes(',') ? signatureData.split(',')[1] : signatureData;
      await addWorkerSignature(documentIdx, workerSignatureIdx, {
        signatureData: base64Data,
        description,
      });
    },
    onSuccess: () => {
      toast.success('서명이 등록되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(`서명 등록 실패: ${error.message}`);
    },
  });

  const handleEducationVideoConfirm = (video: {
    title: string;
    summary: string;
    vodIdx?: number;
  }) => {
    if (educationVideoModalIndex !== null) {
      // 교육영상 제목 설정
      onEducationVideoRowChange(educationVideoModalIndex, 'educationVideo', video.title);
      // vodIdx 저장
      if (video.vodIdx) {
        onEducationVideoRowChange(educationVideoModalIndex, 'vodIdx', video.vodIdx);
      }
      // 교육내용에 요약 자동 입력
      onEducationContentChange(video.summary);

      // 문서가 이미 생성된 경우에만 별도로 근로자 대상자 등록 API 호출
      // 문서 생성 시에는 workerList를 함께 전송하므로 별도 호출 불필요
      const row = data.educationVideoRows[educationVideoModalIndex];
      if (import.meta.env.DEV) {
        console.log('🔍 [Table2400TBMForm] 교육영상 선택 완료:', {
          educationVideoModalIndex,
          safetySystemDocumentIdx,
          participant: row.participant,
          participantMemberIdx: row.participant?.memberIdx,
          videoVodIdx: video.vodIdx,
          note: safetySystemDocumentIdx
            ? '문서가 이미 생성되었으므로 별도로 근로자 등록 API 호출 가능'
            : '문서 생성 시 workerList와 함께 전송됩니다',
        });
      }

      // 문서가 이미 생성된 경우에만 별도로 근로자 대상자 등록 API 호출
      // (문서 생성 후 추가로 근로자를 등록하는 경우)
      if (safetySystemDocumentIdx && row.participant?.memberIdx && video.vodIdx) {
        if (import.meta.env.DEV) {
          console.log(
            '🚀 [Table2400TBMForm] 근로자 대상자 등록 API 호출 (문서 생성 후 추가 등록):',
            {
              documentIdx: safetySystemDocumentIdx,
              workerList: [
                {
                  targetMemberIdx: row.participant.memberIdx,
                  vodIdx: video.vodIdx,
                },
              ],
              rowIndex: educationVideoModalIndex,
            }
          );
        }

        createWorkerSignatureMutation.mutate({
          documentIdx: safetySystemDocumentIdx,
          workerList: [
            {
              targetMemberIdx: row.participant.memberIdx,
              vodIdx: video.vodIdx,
            },
          ],
          rowIndex: educationVideoModalIndex,
        });
      }
    }
    handleCloseEducationVideoModal();
  };

  // 대상자 선택 완료 핸들러 (근로자 대상자 등록 API 호출)
  const handleParticipantConfirm = (members: InvestigationTeamMember[]) => {
    if (participantModalIndex !== null && members.length > 0) {
      const currentRows = [...data.educationVideoRows];
      const currentRowTemplate = currentRows[participantModalIndex];

      // 1. 첫 번째 선택된 대상자는 현재 행에 업데이트
      const firstMember = members[0];
      currentRows[participantModalIndex] = {
        ...currentRowTemplate,
        participant: firstMember,
      };

      // 2. 추가 선택된 대상자들에 대해 새 행 생성 및 삽입
      if (members.length > 1) {
        const additionalRows = members.slice(1).map((member) => ({
          ...currentRowTemplate,
          participant: member,
          signature: '', // 새 행이므로 서명은 비움
          workerSignatureIdx: undefined, // API 호출 전이므로 비움
        }));
        currentRows.splice(participantModalIndex + 1, 0, ...additionalRows);
      }

      // 상위 상태 일괄 업데이트
      onDataChange({
        ...data,
        educationVideoRows: currentRows,
      });

      // 3. 문서가 이미 생성된 경우, 선택된 모든 대상자에 대해 근로자 대상자 등록 API 호출
      if (safetySystemDocumentIdx) {
        members.forEach((member, indexOffset) => {
          const targetRowIndex = participantModalIndex + indexOffset;
          // 해당 행의 vodIdx 확인 (템플릿에서 복사되었으므로 모두 같거나 이미 있을 것)
          const vodIdx = currentRowTemplate.vodIdx;

          if (member.memberIdx && vodIdx) {
            if (import.meta.env.DEV) {
              console.log(
                `🚀 [Table2400TBMForm] 근로자 등록 API 호출 (${indexOffset + 1}/${members.length}):`,
                {
                  documentIdx: safetySystemDocumentIdx,
                  memberIdx: member.memberIdx,
                  vodIdx,
                  rowIndex: targetRowIndex,
                }
              );
            }

            createWorkerSignatureMutation.mutate({
              documentIdx: safetySystemDocumentIdx,
              workerList: [
                {
                  targetMemberIdx: member.memberIdx,
                  vodIdx,
                },
              ],
              rowIndex: targetRowIndex,
            });
          }
        });
      }
    }
    handleCloseParticipantModal();
  };

  // 서명 모달 핸들러
  const handleOpenSignatureModal = (index: number) => {
    setSignatureModalIndex(index);
  };

  const handleCloseSignatureModal = () => {
    setSignatureModalIndex(null);
  };

  const handleSignatureConfirm = async (signatureDataUrl: string) => {
    if (signatureModalIndex === null || !safetySystemDocumentIdx) {
      return;
    }

    const row = data.educationVideoRows[signatureModalIndex];
    if (!row.workerSignatureIdx) {
      toast.error('근로자 서명 정보를 찾을 수 없습니다. 대상자와 교육영상을 먼저 선택해주세요.');
      handleCloseSignatureModal();
      return;
    }

    try {
      await addWorkerSignatureMutation.mutateAsync({
        documentIdx: safetySystemDocumentIdx,
        workerSignatureIdx: row.workerSignatureIdx,
        signatureData: signatureDataUrl,
      });

      // 서명 데이터 저장
      onEducationVideoRowChange(signatureModalIndex, 'signature', signatureDataUrl);
      handleCloseSignatureModal();
    } catch {
      // 에러는 mutation의 onError에서 처리됨
    }
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
              <th style={{ width: 30 }}>이동</th>
              <th style={{ width: 39 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.inspectionRows.map((row, index) => (
              <tr
                key={index}
                onDragOver={(e) => handleInspectionDragOver(e, index)}
                onDragLeave={handleInspectionDragLeave}
                onDrop={(e) => handleInspectionDrop(e, index)}
                style={{
                  opacity: draggedInspectionIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverInspectionIndex === index && draggedInspectionIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
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
                    multiline
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                        p: 1,
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
                    multiline
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                        p: 1,
                      },
                    }}
                  />
                </td>
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <IconButton
                      size="small"
                      draggable
                      onDragStart={() => handleInspectionDragStart(index)}
                      onDragEnd={handleInspectionDragEnd}
                      sx={{
                        p: 0.625,
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Iconify icon="custom:drag-dots-fill" width={20} />
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
                        width: 23,
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
            startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
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
                      p: 1,
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
              {safetySystemDocumentIdx && <th style={{ width: '25%' }}>서명</th>}
              <th style={{ width: 30 }}>이동</th>
              <th style={{ width: 39 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.educationVideoRows.map((row, index) => (
              <tr
                key={index}
                onDragOver={(e) => handleVideoDragOver(e, index)}
                onDragLeave={handleVideoDragLeave}
                onDrop={(e) => handleVideoDrop(e, index)}
                style={{
                  opacity: draggedVideoIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverVideoIndex === index && draggedVideoIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
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
                      color="primary"
                    >
                      대상자 선택
                    </Button>
                  )}
                </td>
                <td>
                  {row.educationVideo ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        value={row.educationVideo}
                        onClick={() => setEducationVideoModalIndex(index)}
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            fontSize: 14,
                            height: 30,
                            cursor: 'pointer',
                            '& fieldset': {
                              borderColor: 'grey.300',
                            },
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => onEducationVideoRowChange(index, 'educationVideo', '')}
                        sx={{}}
                      >
                        <Iconify icon="solar:close-circle-bold" width={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setEducationVideoModalIndex(index)}
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
                {safetySystemDocumentIdx && (
                  <td>
                    {row.signature ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenSignatureModal(index)}
                        sx={{
                          minHeight: 30,
                          fontSize: 13,
                          fontWeight: 700,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        서명보기
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenSignatureModal(index)}
                        disabled={!row.participant?.memberIdx || !row.vodIdx}
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
                    )}
                  </td>
                )}
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <IconButton
                      size="small"
                      draggable
                      onDragStart={() => handleVideoDragStart(index)}
                      onDragEnd={handleVideoDragEnd}
                      sx={{
                        p: 0.625,
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Iconify icon="custom:drag-dots-fill" width={20} />
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
                        width: 23,
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
            startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
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

      {/* 서명 모달 */}
      {data.educationVideoRows.map((row, index) => (
        <SignatureModal
          key={`signature-${index}`}
          open={signatureModalIndex === index}
          onClose={handleCloseSignatureModal}
          onConfirm={handleSignatureConfirm}
          targetLabel="근로자"
          initialSignature={row.signature || undefined}
        />
      ))}
    </Box>
  );
}
