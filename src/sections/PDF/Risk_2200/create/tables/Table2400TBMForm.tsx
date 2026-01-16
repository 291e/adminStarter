import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import type {
  Table2400TBMData,
  Table2400TBMEducationVideoRow,
  InvestigationTeamMember,
} from '../../types/table-data';
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
  onEducationVideoRowChange?: (
    index: number,
    field: keyof Table2400TBMEducationVideoRow,
    value: any
  ) => void;
  onEducationVideoAddRow?: () => void;
  onEducationVideoRowDelete?: (index: number) => void;
  onEducationVideoRowMove?: (from: number, to: number) => void;
  safetySystemDocumentIdx?: number;
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
  onEducationVideoAddRow,
  onEducationVideoRowDelete,
  safetySystemDocumentIdx,
}: Props) {
  const queryClient = useQueryClient();

  const [draggedInspectionIndex, setDraggedInspectionIndex] = useState<number | null>(null);

  // 모달 제어 상태
  const [participantModalRowIndex, setParticipantModalRowIndex] = useState<number | null>(null);
  const [educationVideoModalRowIndex, setEducationVideoModalRowIndex] = useState<number | null>(
    null
  );
  const [signatureModalRowIndex, setSignatureModalRowIndex] = useState<number | null>(null);

  // 점검내용 드래그 핸들러
  const handleInspectionDragStart = (index: number) => setDraggedInspectionIndex(index);

  const handleInspectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleInspectionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedInspectionIndex !== null && draggedInspectionIndex !== dropIndex)
      onInspectionRowMove(draggedInspectionIndex, dropIndex);
    setDraggedInspectionIndex(null);
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
      // 여러 명을 한 번에 등록할 수 있도록 API 호출
      const response = await createWorkerSignature(documentIdx, { workerList });
      return { response, rowIndex, documentIdx, workerList };
    },
    onSuccess: (result) => {
      const count = result.workerList.length;
      toast.success(`${count}명의 근로자 대상자가 등록되었습니다.`);

      // 응답에서 workerSignatureIdx 추출
      // API가 여러 명을 한 번에 등록할 때는 workerSignatureList 배열을 반환할 수 있음
      const responseAny = result.response as any;
      let workerSignatureIndices: number[] = [];
      
      if (Array.isArray(responseAny?.workerSignatureList)) {
        // 배열인 경우
        workerSignatureIndices = responseAny.workerSignatureList
          .map((item: any) => item.workerSignatureIdx || item.documentWorkerSignatureIdx)
          .filter((idx: any) => idx !== undefined && idx !== null);
      } else if (responseAny?.workerSignatureIdx) {
        // 단일인 경우
        workerSignatureIndices = [responseAny.workerSignatureIdx];
      } else if (Array.isArray(responseAny?.workerSignatureIdx)) {
        // workerSignatureIdx가 배열인 경우
        workerSignatureIndices = responseAny.workerSignatureIdx;
      }

      if (workerSignatureIndices.length > 0) {
        const newRows = [...data.educationVideoRows];
        const currentRow = newRows[result.rowIndex];
        const vodIdx = currentRow.vodIdx;

        // 같은 영상(vodIdx)을 가진 행들 중에서 대상자가 있고 workerSignatureIdx가 없는 행들 찾기
        let workerIndex = 0;
        for (let i = result.rowIndex; i < newRows.length && workerIndex < workerSignatureIndices.length; i++) {
          const row = newRows[i];
          if (
            row.vodIdx === vodIdx &&
            row.participant?.memberIdx &&
            !row.workerSignatureIdx
          ) {
            newRows[i] = {
              ...row,
              workerSignatureIdx: workerSignatureIndices[workerIndex],
            };
            workerIndex++;
          }
        }

        onDataChange({ ...data, educationVideoRows: newRows });
      }
      
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });
      queryClient.invalidateQueries({ queryKey: ['safety-system-item'] });
      // 문서 상세 정보 쿼리 무효화 (진행률 모달에서 사용)
      queryClient.invalidateQueries({ queryKey: ['safetySystemDocument', result.documentIdx] });
    },
  });

  const addWorkerSignatureMutation = useMutation({
    mutationFn: async ({
      documentIdx,
      workerSignatureIdx,
      signatureData,
    }: {
      documentIdx: number;
      workerSignatureIdx: number;
      signatureData: string;
    }) => {
      const base64Data = signatureData.includes(',') ? signatureData.split(',')[1] : signatureData;
      await addWorkerSignature(documentIdx, workerSignatureIdx, { signatureData: base64Data });
    },
    onSuccess: () => toast.success('서명이 등록되었습니다.'),
  });

  // 교육영상 선택 완료
  const handleEducationVideoConfirm = (video: {
    title: string;
    summary: string;
    vodIdx?: number;
  }) => {
    if (educationVideoModalRowIndex !== null) {
      const newRows = [...data.educationVideoRows];
      const currentRow = newRows[educationVideoModalRowIndex];
      
      // 영상이 변경되면 기존 대상자들의 서명 정보 초기화
      const isVideoChanged = currentRow.vodIdx !== video.vodIdx;
      
      newRows[educationVideoModalRowIndex] = {
        ...currentRow,
        educationVideo: video.title,
        vodIdx: video.vodIdx,
        // 영상이 변경되면 기존 서명 정보 초기화
        ...(isVideoChanged && {
          workerSignatureIdx: undefined,
          signature: '',
        }),
      };
      onEducationContentChange(video.summary);
      onDataChange({ ...data, educationVideoRows: newRows });
      setEducationVideoModalRowIndex(null);
    }
  };

  // 대상자(참여자) 선택 완료 - 여러 명 선택 가능
  const handleParticipantConfirm = (members: InvestigationTeamMember[]) => {
    if (participantModalRowIndex === null || members.length === 0) {
      setParticipantModalRowIndex(null);
      return;
    }

    const currentRow = data.educationVideoRows[participantModalRowIndex];
    
    // 교육영상이 선택되지 않았으면 경고
    if (!currentRow.vodIdx || !currentRow.educationVideo) {
      toast.error('먼저 교육영상을 선택해주세요.');
      setParticipantModalRowIndex(null);
      return;
    }

    // 기존 행의 대상자들을 제외하고 새로운 대상자들만 추가
    const existingMemberIndices = new Set(
      data.educationVideoRows
        .filter((row) => row.vodIdx === currentRow.vodIdx && row.participant?.memberIdx)
        .map((row) => row.participant!.memberIdx)
    );

    // 새로 추가할 대상자들 필터링 (중복 제거)
    const newMembers = members.filter(
      (member) => member.memberIdx && !existingMemberIndices.has(member.memberIdx)
    );

    if (newMembers.length === 0) {
      toast.warning('이미 추가된 대상자입니다.');
      setParticipantModalRowIndex(null);
      return;
    }

    // 기존 행 업데이트 (첫 번째 대상자로)
    const updatedRows = [...data.educationVideoRows];
    const isParticipantChanged =
      currentRow.participant?.memberIdx !== newMembers[0].memberIdx;

    updatedRows[participantModalRowIndex] = {
      ...currentRow,
      participant: newMembers[0],
      // 대상자가 변경되면 기존 서명 정보 초기화
      ...(isParticipantChanged && {
        workerSignatureIdx: undefined,
        signature: '',
      }),
    };

    // 나머지 대상자들을 새로운 행으로 추가
    const additionalRows = newMembers.slice(1).map((member) => ({
      participant: member,
      educationVideo: currentRow.educationVideo,
      vodIdx: currentRow.vodIdx,
      signature: '',
      workerSignatureIdx: undefined,
    }));

    const finalRows = [...updatedRows, ...additionalRows];
    onDataChange({ ...data, educationVideoRows: finalRows });

    // 문서가 이미 있고 영상 정보(vodIdx)가 있다면 대상자 등록 API 호출
    // 여러 명을 한 번에 등록 (API가 workerList 배열을 받을 수 있음)
    if (safetySystemDocumentIdx && currentRow.vodIdx) {
      const workerList = newMembers
        .filter((m) => m.memberIdx)
        .map((m) => ({
          targetMemberIdx: m.memberIdx!,
          vodIdx: currentRow.vodIdx!,
        }));

      if (workerList.length > 0) {
        // 여러 명을 한 번에 등록 (API가 배열을 받을 수 있음)
        createWorkerSignatureMutation.mutate({
          documentIdx: safetySystemDocumentIdx,
          workerList,
          rowIndex: participantModalRowIndex,
        });
      }
    }

    setParticipantModalRowIndex(null);
  };

  const handleSignatureConfirm = async (signatureDataUrl: string) => {
    if (signatureModalRowIndex === null || !safetySystemDocumentIdx) return;
    const row = data.educationVideoRows[signatureModalRowIndex];

    if (!row.workerSignatureIdx) {
      toast.error('근로자 서명 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      await addWorkerSignatureMutation.mutateAsync({
        documentIdx: safetySystemDocumentIdx,
        workerSignatureIdx: row.workerSignatureIdx,
        signatureData: signatureDataUrl,
      });

      const newRows = [...data.educationVideoRows];
      newRows[signatureModalRowIndex] = {
        ...newRows[signatureModalRowIndex],
        signature: signatureDataUrl,
      };
      onDataChange({ ...data, educationVideoRows: newRows });
      setSignatureModalRowIndex(null);
    } catch {
      /* error handled by mutation */
    }
  };

  // 행 추가
  const handleAddRow = () => {
    if (onEducationVideoAddRow) {
      onEducationVideoAddRow();
    } else {
      onDataChange({
        ...data,
        educationVideoRows: [
          ...data.educationVideoRows,
          { participant: null, educationVideo: '', signature: '' },
        ],
      });
    }
  };

  // 행 삭제
  const handleDeleteRow = (index: number) => {
    if (onEducationVideoRowDelete) {
      onEducationVideoRowDelete(index);
    } else {
      const newRows = data.educationVideoRows.filter((_, i) => i !== index);
      onDataChange({ ...data, educationVideoRows: newRows });
    }
  };

  // 동일한 영상(vodIdx)을 가진 행들을 그룹화하여 rowspan 계산
  const rowGroups = useMemo(() => {
    const groups: Array<{ startIndex: number; count: number; vodKey: number | string }> = [];
    let currentGroup: { startIndex: number; count: number; vodKey: number | string } | null = null;

    data.educationVideoRows.forEach((row, index) => {
      // vodIdx가 있으면 사용, 없으면 고유 키 생성
      const vodKey = row.vodIdx ?? `empty-${index}`;
      
      if (!currentGroup || currentGroup.vodKey !== vodKey) {
        // 새로운 그룹 시작
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          startIndex: index,
          count: 1,
          vodKey,
        };
      } else {
        // 같은 그룹에 추가
        currentGroup.count += 1;
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [data.educationVideoRows]);

  // 각 행이 그룹의 첫 번째 행인지 확인하는 함수
  const getRowGroupInfo = (index: number) => {
    const group = rowGroups.find(
      (g) => index >= g.startIndex && index < g.startIndex + g.count
    );
    return group
      ? {
          isFirstRow: index === group.startIndex,
          rowspan: group.count,
        }
      : { isFirstRow: false, rowspan: 1 };
  };

  const tableStyle = {
    width: '100%',
    border: '2px solid',
    borderColor: 'text.primary',
    borderCollapse: 'collapse',
    '& th, & td': {
      border: '1px solid',
      borderColor: 'text.primary',
      padding: '4px',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    '& th': {
      backgroundColor: 'grey.100',
      fontSize: 14,
      fontWeight: 600,
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 1. 점검내용 */}
      <Box sx={{ pb: 5, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ flex: 1 }}>점검내용</th>
              <th style={{ flex: 1 }}>결과</th>
              <th style={{ width: 80 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.inspectionRows.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleInspectionDragStart(index)}
                onDragOver={(e) => handleInspectionDragOver(e)}
                onDrop={(e) => handleInspectionDrop(e, index)}
                style={{ cursor: 'grab' }}
              >
                <td>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    value={row.inspectionContent}
                    onChange={(e) =>
                      onInspectionRowChange(index, 'inspectionContent', e.target.value)
                    }
                  />
                </td>
                <td>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    value={row.result}
                    onChange={(e) => onInspectionRowChange(index, 'result', e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => onInspectionRowDelete(index)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={onInspectionAddRow}
          >
            항목추가
          </Button>
        </Box>
      </Box>

      {/* 2. 교육내용 */}
      <Box sx={{ pb: 5, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th>교육내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={data.educationContent}
                  onChange={(e) => onEducationContentChange(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </Box>
      </Box>

      {/* 3. TBM 교육영상 및 대상자 */}
      <Box sx={{ pb: 5, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 48 }}>
              <th style={{ width: '25%' }}>교육영상</th>
              <th style={{ width: '25%' }}>대상자</th>
              <th style={{ width: '25%' }}>서명</th>
              <th style={{ width: '15%' }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.educationVideoRows.map((row, index) => {
              const groupInfo = getRowGroupInfo(index);

              return (
                <tr key={index}>
                  {groupInfo.isFirstRow ? (
                    <td rowSpan={groupInfo.rowspan}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEducationVideoModalRowIndex(index)}
                        sx={{
                          minWidth: 120,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                        }}
                      >
                        {row.educationVideo || '교육영상 선택'}
                      </Button>
                    </td>
                  ) : null}
                  <td>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setParticipantModalRowIndex(index)}
                      disabled={!row.vodIdx || !row.educationVideo}
                      sx={{
                        minWidth: 120,
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                      }}
                    >
                      {row.participant?.name || '대상자 선택'}
                    </Button>
                  </td>
                  <td>
                    {row.signature ? (
                      <Box component="img" src={row.signature} sx={{ maxHeight: 30 }} />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!safetySystemDocumentIdx || !row.vodIdx || !row.workerSignatureIdx}
                        onClick={() => setSignatureModalRowIndex(index)}
                      >
                        서명
                      </Button>
                    )}
                  </td>
                  <td>
                    <IconButton color="error" onClick={() => handleDeleteRow(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleAddRow}
          >
            행 추가
          </Button>
        </Box>
      </Box>

      {/* 모달들 */}
      <EducationVideoSelectModal
        open={educationVideoModalRowIndex !== null}
        onClose={() => setEducationVideoModalRowIndex(null)}
        onConfirm={handleEducationVideoConfirm}
      />
      <InvestigationTeamSelectModal
        open={participantModalRowIndex !== null}
        onClose={() => setParticipantModalRowIndex(null)}
        onConfirm={handleParticipantConfirm}
        is2400Series
        isSingleSelect={false}
      />
      <SignatureModal
        open={signatureModalRowIndex !== null}
        onClose={() => setSignatureModalRowIndex(null)}
        onConfirm={handleSignatureConfirm}
        targetLabel="근로자 서명"
      />
    </Box>
  );
}
