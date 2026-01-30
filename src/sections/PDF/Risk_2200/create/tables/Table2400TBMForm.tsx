import { useState, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import axiosInstance from 'src/lib/axios';
import { endpoints } from 'src/lib/axios';

import type {
  Table2400TBMData,
  Table2400TBMEducationVideoRow,
  InvestigationTeamMember,
} from '../../types/table-data';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';
import EducationVideoSelectModal from './modal/EducationVideoSelectModal';
import SignatureModal from '../../edit/components/SignatureModal';
import { addWorkerSignature } from 'src/services/safety-system/safety-system.service';
import { uploadFile } from 'src/services/system/system.service';

// ----------------------------------------------------------------------

type Props = {
  data: Table2400TBMData;
  onDataChange: (data: Table2400TBMData | ((prev: Table2400TBMData) => Table2400TBMData)) => void;
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
  const [participantModalState, setParticipantModalState] = useState<{
    index: number;
    mode: 'replace' | 'append';
  } | null>(null);
  const [educationVideoModalRowIndex, setEducationVideoModalRowIndex] = useState<number | null>(
    null
  );
  const [signatureModalRowIndex, setSignatureModalRowIndex] = useState<number | null>(null);
  const [evidenceTargetRowIndex, setEvidenceTargetRowIndex] = useState<number | null>(null);
  const [evidenceUploadingIndex, setEvidenceUploadingIndex] = useState<number | null>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

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
      console.log('🔍 [근로자 서명 등록 API] 요청 시작:', {
        documentIdx,
        workerList,
        workerListCount: workerList.length,
        rowIndex,
        workerListDetails: workerList.map((w) => ({
          targetMemberIdx: w.targetMemberIdx,
          vodIdx: w.vodIdx,
        })),
      });

      // 여러 명을 한 번에 등록할 수 있도록 API 호출
      // createWorkerSignature는 workerSignatureIdx만 반환하므로, 전체 응답을 받기 위해 직접 호출
      const url = `${endpoints.safetySystem.documents}/${documentIdx}/worker-signatures`;
      const axiosResponse = await axiosInstance.post(url, { workerList });

      // axios 인터셉터가 평탄화하므로 response.data에 직접 접근
      const responseData = axiosResponse.data as any;

      console.log('✅ [근로자 서명 등록 API] 전체 응답:', {
        documentIdx,
        axiosResponse,
        responseData,
        workerSignatureList: responseData?.workerSignatureList,
        workerList,
      });

      return { response: responseData, rowIndex, documentIdx, workerList };
    },
    onSuccess: (result) => {
      const count = result.workerList.length;
      console.log('✅ [근로자 서명 등록 API] 성공:', {
        count,
        workerList: result.workerList,
        response: result.response,
        workerListDetails: result.workerList.map((w) => ({
          targetMemberIdx: w.targetMemberIdx,
          vodIdx: w.vodIdx,
        })),
      });
      toast.success(`${count}명의 근로자 대상자가 등록되었습니다.`);

      // 응답에서 workerSignatureIdx 추출
      // API가 여러 명을 한 번에 등록할 때는 workerSignatureList 배열을 반환할 수 있음
      const responseAny = result.response as any;
      let workerSignatureIndices: number[] = [];

      console.log('🔍 [근로자 서명 등록 API] 응답 파싱:', {
        responseAny,
        hasWorkerSignatureList: Array.isArray(responseAny?.workerSignatureList),
        hasWorkerSignatureIdx: !!responseAny?.workerSignatureIdx,
        workerSignatureIdxType: typeof responseAny?.workerSignatureIdx,
        workerSignatureList: responseAny?.workerSignatureList,
      });

      if (Array.isArray(responseAny?.workerSignatureList)) {
        // 배열인 경우 - documentWorkerSignatureIdx 또는 workerSignatureIdx 사용
        workerSignatureIndices = responseAny.workerSignatureList
          .map((item: any) => item.documentWorkerSignatureIdx || item.workerSignatureIdx)
          .filter((idx: any) => idx !== undefined && idx !== null);
        console.log('✅ [근로자 서명 등록 API] 배열 응답 파싱:', {
          workerSignatureIndices,
          count: workerSignatureIndices.length,
          workerSignatureListDetails: responseAny.workerSignatureList.map((item: any) => ({
            documentWorkerSignatureIdx: item.documentWorkerSignatureIdx,
            workerSignatureIdx: item.workerSignatureIdx,
            targetMemberIdx: item.targetMemberIdx,
            memberName: item.memberName,
          })),
        });
      } else if (responseAny?.workerSignatureIdx) {
        // 단일인 경우
        workerSignatureIndices = [responseAny.workerSignatureIdx];
        console.log('✅ [근로자 서명 등록 API] 단일 응답 파싱:', {
          workerSignatureIndices,
        });
      } else if (Array.isArray(responseAny?.workerSignatureIdx)) {
        // workerSignatureIdx가 배열인 경우
        workerSignatureIndices = responseAny.workerSignatureIdx;
        console.log('✅ [근로자 서명 등록 API] workerSignatureIdx 배열 파싱:', {
          workerSignatureIndices,
        });
      } else {
        console.warn('⚠️ [근로자 서명 등록 API] 응답에서 workerSignatureIdx를 찾을 수 없음:', {
          responseAny,
          responseKeys: Object.keys(responseAny || {}),
        });
      }

      if (workerSignatureIndices.length > 0) {
        // 최신 상태를 가져오기 위해 함수형 업데이트 사용
        // onDataChange가 함수를 받을 수 있도록 수정하거나,
        // 여기서는 직접 최신 data를 사용하도록 수정
        // 하지만 data는 클로저이므로, onDataChange를 통해 최신 상태를 받아야 함
        // 일단 현재 data를 사용하되, onDataChange 호출 시 최신 상태가 반영되도록 함

        // 현재 data의 최신 상태를 가져오기 위해 onDataChange에 함수를 전달할 수 없으므로,
        // 대신 queryClient를 통해 최신 상태를 가져오거나,
        // 또는 onDataChange를 수정하여 함수를 받을 수 있도록 해야 함
        // 임시 해결책: data를 직접 사용하되, onDataChange 호출 후에도 상태가 유지되도록 함

        const currentData = data; // 클로저의 data 사용
        const newRows = [...currentData.educationVideoRows];
        const workerList = result.workerList;

        console.log('🔍 [근로자 서명 등록 API] 행 업데이트 시작:', {
          rowIndex: result.rowIndex,
          workerSignatureIndices,
          workerList,
          currentRows: newRows.map((row, idx) => ({
            index: idx,
            participant: row.participant,
            participantMemberIdx: row.participant?.memberIdx,
            participantName: row.participant?.name,
            vodIdx: row.vodIdx,
            workerSignatureIdx: row.workerSignatureIdx,
          })),
        });

        // workerList와 workerSignatureIndices를 매칭하여 각 행에 올바른 workerSignatureIdx 할당
        // workerList의 순서와 workerSignatureList의 순서가 일치한다고 가정
        for (let i = 0; i < workerList.length && i < workerSignatureIndices.length; i++) {
          const worker = workerList[i];
          const workerSignatureIdx = workerSignatureIndices[i];

          // 해당 targetMemberIdx와 vodIdx를 가진 행 찾기
          const targetRowIndex = newRows.findIndex(
            (row) =>
              row.vodIdx === worker.vodIdx &&
              row.participant?.memberIdx === worker.targetMemberIdx &&
              !row.workerSignatureIdx
          );

          if (targetRowIndex !== -1) {
            console.log('✅ [근로자 서명 등록 API] 행 업데이트:', {
              targetRowIndex,
              participantMemberIdx: newRows[targetRowIndex].participant?.memberIdx,
              participantName: newRows[targetRowIndex].participant?.name,
              vodIdx: newRows[targetRowIndex].vodIdx,
              workerSignatureIdx,
              workerTargetMemberIdx: worker.targetMemberIdx,
            });
            newRows[targetRowIndex] = {
              ...newRows[targetRowIndex],
              workerSignatureIdx,
            };
          } else {
            console.warn('⚠️ [근로자 서명 등록 API] 매칭되는 행을 찾을 수 없음:', {
              worker,
              workerSignatureIdx,
              availableRows: newRows.map((row, idx) => ({
                index: idx,
                participantMemberIdx: row.participant?.memberIdx,
                participantName: row.participant?.name,
                vodIdx: row.vodIdx,
                workerSignatureIdx: row.workerSignatureIdx,
              })),
            });
          }
        }

        console.log('✅ [근로자 서명 등록 API] 최종 업데이트된 행:', {
          updatedRows: newRows.map((row, idx) => ({
            index: idx,
            participant: row.participant,
            participantMemberIdx: row.participant?.memberIdx,
            participantName: row.participant?.name,
            vodIdx: row.vodIdx,
            workerSignatureIdx: row.workerSignatureIdx,
          })),
        });

        // 최신 상태로 업데이트 (함수형 업데이트 사용하여 최신 상태 보장)
        onDataChange((prevData) => {
          console.log('🔍 [근로자 서명 등록 API] 함수형 업데이트 시작:', {
            prevData,
            prevRows: prevData.educationVideoRows.map((row, idx) => ({
              index: idx,
              participant: row.participant,
              participantMemberIdx: row.participant?.memberIdx,
              participantName: row.participant?.name,
              vodIdx: row.vodIdx,
              workerSignatureIdx: row.workerSignatureIdx,
            })),
            workerList,
            workerSignatureIndices,
          });

          const prevRows = [...prevData.educationVideoRows];
          const updatedRows = [...prevRows];

          // workerList와 workerSignatureIndices를 매칭하여 각 행에 올바른 workerSignatureIdx 할당
          for (let i = 0; i < workerList.length && i < workerSignatureIndices.length; i++) {
            const worker = workerList[i];
            const workerSignatureIdx = workerSignatureIndices[i];

            const targetRowIndex = updatedRows.findIndex(
              (row) =>
                row.vodIdx === worker.vodIdx &&
                row.participant?.memberIdx === worker.targetMemberIdx &&
                !row.workerSignatureIdx
            );

            if (targetRowIndex !== -1) {
              console.log('✅ [근로자 서명 등록 API] 함수형 업데이트 - 행 업데이트:', {
                targetRowIndex,
                participantMemberIdx: updatedRows[targetRowIndex].participant?.memberIdx,
                participantName: updatedRows[targetRowIndex].participant?.name,
                vodIdx: updatedRows[targetRowIndex].vodIdx,
                workerSignatureIdx,
                workerTargetMemberIdx: worker.targetMemberIdx,
              });
              updatedRows[targetRowIndex] = {
                ...updatedRows[targetRowIndex],
                workerSignatureIdx,
              };
            } else {
              console.warn(
                '⚠️ [근로자 서명 등록 API] 함수형 업데이트 - 매칭되는 행을 찾을 수 없음:',
                {
                  worker,
                  workerSignatureIdx,
                  availableRows: updatedRows.map((row, idx) => ({
                    index: idx,
                    participantMemberIdx: row.participant?.memberIdx,
                    participantName: row.participant?.name,
                    vodIdx: row.vodIdx,
                    workerSignatureIdx: row.workerSignatureIdx,
                  })),
                }
              );
            }
          }

          const finalData = { ...prevData, educationVideoRows: updatedRows };
          console.log('✅ [근로자 서명 등록 API] 함수형 업데이트 완료:', {
            finalData,
            finalRows: finalData.educationVideoRows.map((row, idx) => ({
              index: idx,
              participant: row.participant,
              participantMemberIdx: row.participant?.memberIdx,
              participantName: row.participant?.name,
              vodIdx: row.vodIdx,
              workerSignatureIdx: row.workerSignatureIdx,
            })),
          });

          return finalData;
        });
      } else {
        console.warn('⚠️ [근로자 서명 등록 API] workerSignatureIndices가 비어있음');
      }

      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });
      queryClient.invalidateQueries({ queryKey: ['safety-system-item'] });
      // 문서 상세 정보 쿼리 무효화는 하지 않음 (사용자가 수정한 상태를 덮어쓰지 않도록)
      // 진행률 모달은 필요시 refetchOnMount를 사용하여 최신 데이터를 가져옴
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
    educationType?: 'MANDATORY' | 'REGULAR';
  }) => {
    console.log('🔍 [교육영상 선택] 시작:', {
      educationVideoModalRowIndex,
      video,
      currentData: data.educationVideoRows,
    });

    if (educationVideoModalRowIndex !== null) {
      onDataChange((prev) => {
        const newRows = [...prev.educationVideoRows];
        const currentRow = newRows[educationVideoModalRowIndex];

        // 영상이 변경되면 기존 대상자들의 서명 정보 초기화
        const isVideoChanged = currentRow.vodIdx !== video.vodIdx;

        console.log('🔍 [교육영상 선택] 영상 변경 여부:', {
          isVideoChanged,
          oldVodIdx: currentRow.vodIdx,
          newVodIdx: video.vodIdx,
        });

        newRows[educationVideoModalRowIndex] = {
          ...currentRow,
          educationVideo: video.title,
          vodIdx: video.vodIdx,
          evidenceFileName: undefined,
          evidenceFileUrl: undefined,
          // 영상이 변경되면 기존 서명 정보 초기화
          ...(isVideoChanged && {
            workerSignatureIdx: undefined,
            signature: '',
          }),
        };

        console.log('🔍 [교육영상 선택] 업데이트된 행:', {
          rowIndex: educationVideoModalRowIndex,
          updatedRow: newRows[educationVideoModalRowIndex],
        });

        const summary = (video.summary || '').trim();
        const autoContent = summary || video.title?.trim();
        if (!autoContent) {
          return {
            ...prev,
            educationVideoRows: newRows,
            educationType: video.educationType || prev.educationType,
            educationMethod: prev.educationMethod ?? 'VIDEO',
          };
        }

        const currentContent = prev.educationContent?.trim() || '';
        const nextContent = currentContent.includes(autoContent)
          ? currentContent
          : currentContent
            ? `${currentContent}\n\n${autoContent}`
            : autoContent;

        return {
          ...prev,
          educationVideoRows: newRows,
          educationContent: nextContent,
          educationType: video.educationType || prev.educationType,
          educationMethod: prev.educationMethod ?? 'VIDEO',
        };
      });
      setEducationVideoModalRowIndex(null);
    }
  };

  const handleEducationMethodChange = (value: 'VIDEO' | 'IN_PERSON') => {
    onDataChange((prev) => {
      const clearedRows = prev.educationVideoRows.map((row) => ({
        ...row,
        ...(value === 'VIDEO'
          ? { evidenceFileName: undefined, evidenceFileUrl: undefined }
          : { educationVideo: '', vodIdx: undefined, workerSignatureIdx: undefined, signature: '' }),
      }));
      return {
        ...prev,
        educationMethod: value,
        educationVideoRows: clearedRows,
      };
    });
  };

  const handleEducationTypeChange = (value: 'MANDATORY' | 'REGULAR') => {
    onDataChange((prev) => ({ ...prev, educationType: value }));
  };

  const handleEvidenceSelectClick = (index: number) => {
    setEvidenceTargetRowIndex(index);
    evidenceFileInputRef.current?.click();
  };

  const handleEvidenceFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || evidenceTargetRowIndex === null) return;

    setEvidenceUploadingIndex(evidenceTargetRowIndex);
    try {
      const uploadResponse = await uploadFile({ files: [file] });
      let fileUrl: string | undefined;

      if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
        fileUrl = (uploadResponse as any).fileUrls[0];
      } else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
        fileUrl = (uploadResponse as any).files[0]?.fileUrl;
      } else if (
        (uploadResponse as any)?.data?.fileUrls &&
        Array.isArray((uploadResponse as any).data.fileUrls)
      ) {
        fileUrl = (uploadResponse as any).data.fileUrls[0];
      }

      if (!fileUrl) {
        toast.error('증빙자료 업로드에 실패했습니다.');
        return;
      }

      onDataChange((prev) => {
        const newRows = [...prev.educationVideoRows];
        const currentRow = newRows[evidenceTargetRowIndex];
        if (!currentRow) return prev;
        newRows[evidenceTargetRowIndex] = {
          ...currentRow,
          evidenceFileName: file.name,
          evidenceFileUrl: fileUrl,
        };
        return { ...prev, educationVideoRows: newRows };
      });
    } catch (error) {
      toast.error('증빙자료 업로드 중 오류가 발생했습니다.');
      if (import.meta.env.DEV) {
        console.error('❌ [Table2400TBMForm] 증빙자료 업로드 실패', error);
      }
    } finally {
      setEvidenceUploadingIndex(null);
      setEvidenceTargetRowIndex(null);
      if (evidenceFileInputRef.current) {
        evidenceFileInputRef.current.value = '';
      }
    }
  };

  // 대상자(참여자) 선택 완료 - 여러 명 선택 가능
  const handleParticipantConfirm = (members: InvestigationTeamMember[]) => {
    console.log('🔍 [대상자 선택] 시작:', {
      participantModalState,
      members,
      membersCount: members.length,
      currentData: data.educationVideoRows,
    });

    if (!participantModalState || members.length === 0) {
      console.log('⚠️ [대상자 선택] 조건 불만족:', {
        participantModalState,
        membersLength: members.length,
      });
      setParticipantModalState(null);
      return;
    }

    const currentRow = data.educationVideoRows[participantModalState.index];
    const isVideoMethod = (data.educationMethod ?? 'VIDEO') === 'VIDEO';
    console.log('🔍 [대상자 선택] 현재 행 정보:', {
      rowIndex: participantModalState.index,
      currentRow,
      vodIdx: currentRow.vodIdx,
      educationVideo: currentRow.educationVideo,
    });

    // 교육영상이 선택되지 않았으면 경고
    if (isVideoMethod && (!currentRow.vodIdx || !currentRow.educationVideo)) {
      console.warn('⚠️ [대상자 선택] 교육영상이 선택되지 않음');
      toast.error('먼저 교육영상을 선택해주세요.');
      setParticipantModalState(null);
      return;
    }

    const groupKey = isVideoMethod
      ? String(currentRow.vodIdx ?? 'no-vod')
      : currentRow.evidenceFileUrl || currentRow.evidenceFileName || `row-${participantModalState.index}`;

    // 기존 행의 대상자들을 제외하고 새로운 대상자들만 추가
    const existingMemberIndices = new Set(
      data.educationVideoRows
        .filter((row) => {
          const rowKey = isVideoMethod
            ? String(row.vodIdx ?? 'no-vod')
            : row.evidenceFileUrl || row.evidenceFileName || `row-${participantModalState.index}`;
          return rowKey === groupKey && row.participant?.memberIdx;
        })
        .map((row) => row.participant!.memberIdx)
    );

    console.log('🔍 [대상자 선택] 기존 대상자 확인:', {
      existingMemberIndices: Array.from(existingMemberIndices),
      sameVodRows: data.educationVideoRows.filter(
        (row) => row.vodIdx === currentRow.vodIdx && row.participant?.memberIdx
      ),
    });

    // 새로 추가할 대상자들 필터링 (중복 제거)
    const newMembers = members.filter(
      (member) => member.memberIdx && !existingMemberIndices.has(member.memberIdx)
    );

    console.log('🔍 [대상자 선택] 새로 추가할 대상자:', {
      newMembers,
      newMembersCount: newMembers.length,
      newMembersDetails: newMembers.map((m) => ({
        memberIdx: m.memberIdx,
        name: m.name,
        department: m.department,
      })),
    });

    if (newMembers.length === 0) {
      console.warn('⚠️ [대상자 선택] 이미 추가된 대상자');
      toast.warning('이미 추가된 대상자입니다.');
      setParticipantModalState(null);
      return;
    }

    const updatedRows = [...data.educationVideoRows];
    const appendOnly = participantModalState.mode === 'append';

    if (!appendOnly) {
      const isParticipantChanged = currentRow.participant?.memberIdx !== newMembers[0].memberIdx;
      updatedRows[participantModalState.index] = {
        ...currentRow,
        participant: newMembers[0],
        // 대상자가 변경되면 기존 서명 정보 초기화
        ...(isParticipantChanged && {
          workerSignatureIdx: undefined,
          signature: '',
        }),
      };
    }

    // 추가 대상자들을 새로운 행으로 추가
    const additionalRows = (appendOnly ? newMembers : newMembers.slice(1)).map((member) => ({
      participant: member,
      educationVideo: currentRow.educationVideo,
      vodIdx: currentRow.vodIdx,
      evidenceFileName: currentRow.evidenceFileName,
      evidenceFileUrl: currentRow.evidenceFileUrl,
      signature: '',
      workerSignatureIdx: undefined,
    }));

    const finalRows = [...updatedRows, ...additionalRows];

    console.log('🔍 [대상자 선택] 최종 행 데이터:', {
      finalRows,
      finalRowsCount: finalRows.length,
      finalRowsDetails: finalRows.map((row, idx) => ({
        index: idx,
        participant: row.participant,
        participantMemberIdx: row.participant?.memberIdx,
        participantName: row.participant?.name,
        vodIdx: row.vodIdx,
        educationVideo: row.educationVideo,
      })),
    });

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

      console.log('🔍 [대상자 선택] API 호출 준비:', {
        safetySystemDocumentIdx,
        workerList,
        workerListCount: workerList.length,
        workerListDetails: workerList.map((w) => ({
          targetMemberIdx: w.targetMemberIdx,
          vodIdx: w.vodIdx,
          participantName: newMembers.find((m) => m.memberIdx === w.targetMemberIdx)?.name,
        })),
      });

      if (workerList.length > 0) {
        // 여러 명을 한 번에 등록 (API가 배열을 받을 수 있음)
        createWorkerSignatureMutation.mutate({
          documentIdx: safetySystemDocumentIdx,
          workerList,
          rowIndex: participantModalState.index,
        });
      }
    } else {
      console.log('⚠️ [대상자 선택] API 호출 스킵:', {
        safetySystemDocumentIdx,
        vodIdx: currentRow.vodIdx,
      });
    }

    setParticipantModalState(null);
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
          {
            participant: null,
            educationVideo: '',
            signature: '',
            evidenceFileName: undefined,
            evidenceFileUrl: undefined,
          },
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

  const isInPerson = (data.educationMethod ?? 'VIDEO') === 'IN_PERSON';

  // 동일한 영상(vodIdx)을 가진 행들을 그룹화하여 rowspan 계산
  const rowGroups = useMemo(() => {
    const groups: Array<{ startIndex: number; count: number; vodKey: number | string }> = [];
    let currentGroup: { startIndex: number; count: number; vodKey: number | string } | null = null;

    data.educationVideoRows.forEach((row, index) => {
      const vodKey = isInPerson
        ? row.evidenceFileUrl || row.evidenceFileName || `empty-${index}`
        : row.vodIdx ?? `empty-${index}`;

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
    const group = rowGroups.find((g) => index >= g.startIndex && index < g.startIndex + g.count);
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
      {/* 0. 교육 방법 / 교육 구분 */}
      <Box sx={{ pb: 5, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>교육 방법</th>
              <th style={{ width: '50%' }}>교육 구분</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    row
                    value={data.educationMethod ?? 'VIDEO'}
                    onChange={(e) =>
                      handleEducationMethodChange(e.target.value as 'VIDEO' | 'IN_PERSON')
                    }
                    sx={{ justifyContent: 'center' }}
                  >
                    <FormControlLabel value="VIDEO" control={<Radio size="small" />} label="영상" />
                    <FormControlLabel
                      value="IN_PERSON"
                      control={<Radio size="small" />}
                      label="집체"
                    />
                  </RadioGroup>
                </FormControl>
              </td>
              <td>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    row
                    value={data.educationType ?? 'MANDATORY'}
                    onChange={(e) =>
                      handleEducationTypeChange(e.target.value as 'MANDATORY' | 'REGULAR')
                    }
                    sx={{ justifyContent: 'center' }}
                  >
                    <FormControlLabel
                      value="MANDATORY"
                      control={<Radio size="small" />}
                      label="의무 교육"
                    />
                    <FormControlLabel
                      value="REGULAR"
                      control={<Radio size="small" />}
                      label="정기 교육"
                    />
                  </RadioGroup>
                </FormControl>
              </td>
            </tr>
          </tbody>
        </Box>
      </Box>

      {/* 1. 점검내용 */}
      <Box sx={{ pb: 5, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr>
              <th style={{ flex: 1 }}>점검(작업)내용</th>
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
              <th style={{ width: '25%' }}>{isInPerson ? '증빙자료' : '교육영상'}</th>
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
                        onClick={() =>
                          isInPerson
                            ? handleEvidenceSelectClick(index)
                            : setEducationVideoModalRowIndex(index)
                        }
                        disabled={isInPerson && evidenceUploadingIndex === index}
                        sx={{
                          minWidth: 120,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                        }}
                      >
                        {isInPerson
                          ? row.evidenceFileName || '증빙자료 선택'
                          : row.educationVideo || '교육영상 선택'}
                      </Button>
                    </td>
                  ) : null}
                  <td>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setParticipantModalState({ index, mode: 'replace' })}
                        disabled={
                          isInPerson
                            ? false
                            : !row.vodIdx || !row.educationVideo
                        }
                        sx={{
                          minWidth: 120,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                        }}
                      >
                        {row.participant?.name || '대상자 선택'}
                      </Button>
                      {groupInfo.rowspan === 1 && row.participant?.name ? (
                        <IconButton
                          size="small"
                          onClick={() => setParticipantModalState({ index, mode: 'append' })}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <Iconify icon="solar:add-circle-bold" width={18} />
                        </IconButton>
                      ) : null}
                    </Stack>
                  </td>
                  <td>
                    {row.signature ? (
                      <Box component="img" src={row.signature} sx={{ maxHeight: 30 }} />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={
                          !safetySystemDocumentIdx || !row.vodIdx || !row.workerSignatureIdx
                        }
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

      <input
        ref={evidenceFileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleEvidenceFileChange}
      />

      {/* 모달들 */}
      <EducationVideoSelectModal
        open={educationVideoModalRowIndex !== null}
        onClose={() => setEducationVideoModalRowIndex(null)}
        onConfirm={handleEducationVideoConfirm}
      />
      <InvestigationTeamSelectModal
        open={participantModalState !== null}
        onClose={() => setParticipantModalState(null)}
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
