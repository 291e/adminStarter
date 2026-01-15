import { useState } from 'react';
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
      const response = await createWorkerSignature(documentIdx, { workerList });
      return { response, rowIndex };
    },
    onSuccess: (result) => {
      toast.success('근로자 대상자가 등록되었습니다.');

      if (result.response?.workerSignatureIdx) {
        const newRows = [...data.educationVideoRows];
        newRows[result.rowIndex] = {
          ...newRows[result.rowIndex],
          workerSignatureIdx: result.response.workerSignatureIdx,
        };
        onDataChange({ ...data, educationVideoRows: newRows });
      }
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
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
      newRows[educationVideoModalRowIndex] = {
        ...newRows[educationVideoModalRowIndex],
        educationVideo: video.title,
        vodIdx: video.vodIdx,
      };
      onEducationContentChange(video.summary);
      onDataChange({ ...data, educationVideoRows: newRows });
      setEducationVideoModalRowIndex(null);
    }
  };

  // 대상자(참여자) 선택 완료
  const handleParticipantConfirm = (members: InvestigationTeamMember[]) => {
    if (participantModalRowIndex !== null && members.length > 0) {
      const member = members[0]; // 한 행에 한 명만 배정
      const newRows = [...data.educationVideoRows];
      const currentRow = newRows[participantModalRowIndex];
      newRows[participantModalRowIndex] = {
        ...currentRow,
        participant: member,
      };
      onDataChange({ ...data, educationVideoRows: newRows });

      // 문서가 이미 있고 영상 정보(vodIdx)가 있다면 대상자 등록 API 호출
      if (safetySystemDocumentIdx && currentRow.vodIdx && member.memberIdx) {
        createWorkerSignatureMutation.mutate({
          documentIdx: safetySystemDocumentIdx,
          workerList: [{ targetMemberIdx: member.memberIdx, vodIdx: currentRow.vodIdx }],
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
              <th style={{ width: '25%' }}>대상자</th>
              <th style={{ width: '35%' }}>교육영상</th>
              <th style={{ width: '25%' }}>서명</th>
              <th style={{ width: '15%' }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.educationVideoRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setParticipantModalRowIndex(index)}
                  >
                    {row.participant?.name || '대상자 선택'}
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setEducationVideoModalRowIndex(index)}
                  >
                    {row.educationVideo || '교육영상 선택'}
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
            ))}
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
