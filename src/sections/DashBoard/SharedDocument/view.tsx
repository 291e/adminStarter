import { useState, useMemo } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import SharedDocumentBreadcrumbs from './components/Breadcrumbs';
import SharedDocumentTabs from './components/Tabs';
import SharedDocumentFilters from './components/Filters';
import SharedDocumentTable, { type SharedDocument } from './components/Table';
import SharedDocumentPagination from './components/Pagination';
import PrioritySettingsModal, { type PriorityItem } from './components/PrioritySettingsModal';
import { COLOR_VALUES } from './constants/colors';
import UploadDocumentModal, { type UploadDocumentFormData } from './components/UploadDocumentModal';
import ShareToChatModal from './components/ShareToChatModal';
import EditDocumentModal, { type EditDocumentFormData } from './components/EditDocumentModal';
import DeleteDocumentModal from './components/DeleteDocumentModal';
import { useSharedDocument } from './hooks/use-shared-document';
import { paths } from 'src/routes/paths';
import {
  useSharedDocuments,
  useCreateSharedDocument,
  useUpdateSharedDocument,
  useDeleteSharedDocument,
  useShareDocumentToChatRoom,
  usePrioritySettings,
  useCreatePrioritySetting,
  useUpdatePrioritySetting,
} from '../hooks/use-dashboard-api';
import type { PrioritySetting } from 'src/services/dashboard/dashboard.types';
import { useQueryClient } from '@tanstack/react-query';
import { uploadFile } from 'src/services/system/system.service';
import SharedDocumentDetailModal from 'src/sections/Chat/components/SharedDocumentDetailModal';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function SharedDocumentView({ title = '공유 문서함', description, sx }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 공유된 문서 목록 조회 (전체 데이터 가져오기 - 충분히 큰 pageSize로 모든 데이터 가져오기)
  const {
    data: sharedDocumentsData,
    isLoading: sharedDocumentsLoading,
    error: sharedDocumentsError,
  } = useSharedDocuments({
    page: 1,
    pageSize: 1000, // 충분히 큰 값으로 모든 데이터 가져오기
  });

  // 중요도 설정 목록 조회
  const { data: prioritySettingsData } = usePrioritySettings();

  // 중요도 설정 Mutation hooks
  const createPrioritySettingMutation = useCreatePrioritySetting();
  const updatePrioritySettingMutation = useUpdatePrioritySetting();

  // Mutation hooks
  const createDocumentMutation = useCreateSharedDocument();
  const updateDocumentMutation = useUpdateSharedDocument();
  const deleteDocumentMutation = useDeleteSharedDocument();
  const shareToChatMutation = useShareDocumentToChatRoom();

  // 공유된 문서 데이터 변환 (axios 인터셉터에서 평탄화됨)
  const sharedDocuments = useMemo(() => {
    if (
      !sharedDocumentsData?.header?.isSuccess ||
      !sharedDocumentsData?.sharedDocumentList ||
      !Array.isArray(sharedDocumentsData.sharedDocumentList)
    ) {
      if (import.meta.env.DEV && sharedDocumentsData) {
        console.warn('⚠️ SharedDocuments: Invalid response structure', sharedDocumentsData);
      }
      return [];
    }
    return sharedDocumentsData.sharedDocumentList;
  }, [sharedDocumentsData]);

  // 중요도 설정 목록 변환 (axios 인터셉터에서 평탄화됨)
  const prioritySettings = useMemo((): PrioritySetting[] => {
    // axios 인터셉터에서 평탄화: response.data = { prioritySettingList: [...], header: {...} }
    // 타입 단언 사용 (실제 응답 구조는 평탄화됨)
    const data = prioritySettingsData as any;
    if (
      !data?.header?.isSuccess ||
      !data?.prioritySettingList ||
      !Array.isArray(data.prioritySettingList)
    ) {
      return [];
    }
    return data.prioritySettingList as PrioritySetting[];
  }, [prioritySettingsData]);

  const logic = useSharedDocument(sharedDocuments, prioritySettings);
  const [prioritySettingsModalOpen, setPrioritySettingsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [shareToChatModalOpen, setShareToChatModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentDetailModalOpen, setDocumentDetailModalOpen] = useState(false);
  const [selectedDocumentIdx, setSelectedDocumentIdx] = useState<number | null>(null);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<SharedDocument | null>(
    null
  );
  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState<SharedDocument | null>(
    null
  );
  const [selectedDocumentForDelete, setSelectedDocumentForDelete] = useState<SharedDocument | null>(
    null
  );

  const handleDocumentClick = (row: SharedDocument) => {
    setSelectedDocumentIdx(row.sharedDocumentIdx);
    setDocumentDetailModalOpen(true);
  };

  const handleCloseDocumentDetailModal = () => {
    setDocumentDetailModalOpen(false);
    setSelectedDocumentIdx(null);
  };

  const handlePrioritySettings = () => {
    setPrioritySettingsModalOpen(true);
  };

  const handleSavePrioritySettings = async (priorities: PriorityItem[]) => {
    try {
      // 디버깅: 저장할 데이터 확인
      if (import.meta.env.DEV) {
        console.log('💾 저장할 중요도 설정:', priorities);
        console.log('📋 현재 중요도 설정 목록:', prioritySettings);
      }

      // 기존 중요도 설정 삭제 후 새로 생성하거나, 업데이트
      // TODO: 실제 비즈니스 로직에 맞게 수정 필요 (전체 삭제 후 재생성 vs 개별 업데이트)
      // 현재는 개별 업데이트/생성으로 처리
      await Promise.all(
        priorities.map(async (priority, index) => {
          // 기존 설정 찾기 (API는 priorityIdx 필드 사용)
          // priority.id는 모달에서 전달된 값 (priorityIdx를 문자열로 변환한 값 또는 새로 생성된 임시 id)
          const existingSetting = prioritySettings.find((s: PrioritySetting) => {
            const settingId = String(s.priorityIdx);
            return settingId === priority.id;
          });

          // color를 hex 코드로 변환 (API는 hex 코드를 받음)
          // COLOR_VALUES에서 hex 코드를 가져오고, 없으면 priority.color를 그대로 사용 (이미 hex 코드일 수 있음)
          const colorToSave = COLOR_VALUES[priority.color] || priority.color;

          // 디버깅: 색상 변환 확인
          if (import.meta.env.DEV) {
            console.log('🎨 색상 변환:', {
              priorityColor: priority.color,
              colorToSave,
              colorFromValues: COLOR_VALUES[priority.color],
              allColorValues: COLOR_VALUES,
            });
          }

          // labelType을 그대로 사용 (자유 문자열)
          const labelTypeToSave = priority.labelType || null;

          if (existingSetting) {
            // 기존 설정 업데이트
            const updateParams = {
              priorityIdx: existingSetting.priorityIdx,
              color: colorToSave, // hex 코드로 저장
              labelType: labelTypeToSave,
              isActive: priority.isActive ? 1 : 0,
              order: index,
            };

            if (import.meta.env.DEV) {
              console.log('🔄 중요도 설정 업데이트:', updateParams);
            }

            await updatePrioritySettingMutation.mutateAsync(updateParams);
          } else {
            // 새 설정 생성
            const createParams = {
              color: colorToSave, // hex 코드로 저장
              labelType: labelTypeToSave,
              isActive: priority.isActive ? 1 : 0,
              order: index,
            };

            if (import.meta.env.DEV) {
              console.log('➕ 중요도 설정 생성:', createParams);
            }

            await createPrioritySettingMutation.mutateAsync(createParams);
          }
        })
      );

      // 저장 완료 후 쿼리 무효화하여 최신 데이터 가져오기
      // prioritySettings와 sharedDocuments 모두 무효화 (priorityInformation이 업데이트되므로)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['prioritySettings'] }),
        queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] }),
      ]);

      // 쿼리 재조회를 명시적으로 트리거
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['prioritySettings'] }),
        queryClient.refetchQueries({ queryKey: ['sharedDocuments'] }),
      ]);

      if (import.meta.env.DEV) {
        console.log('✅ 중요도 설정 저장 완료 및 쿼리 갱신');
      }

      setPrioritySettingsModalOpen(false);
    } catch (error) {
      console.error('❌ 중요도 설정 저장 실패:', error);
      alert('중요도 설정 저장에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };

  const handleUpload = () => {
    setUploadModalOpen(true);
  };

  const handleSaveUpload = async (data: UploadDocumentFormData) => {
    try {
      if (!data.file) {
        console.error('❌ 파일이 선택되지 않았습니다.');
        return;
      }

      // 1. 파일을 먼저 /system/upload로 업로드
      console.log('📤 파일 업로드 시작:', data.file.name);
      const uploadResponse = await uploadFile({ files: [data.file] });

      // axios interceptor가 body를 flatten하므로 uploadResponse는 { fileUrls: string[], header: ... } 형태
      const fileUrls = (uploadResponse as unknown as { fileUrls: string[] }).fileUrls;
      if (!fileUrls || fileUrls.length === 0) {
        console.error('❌ 파일 업로드 실패: fileUrls가 없습니다.');
        return;
      }

      const fileUrl = fileUrls[0];
      console.log('✅ 파일 업로드 완료:', fileUrl);

      // priority를 API 형식에 맞게 변환 (모달에서 받은 priority는 priorityIdx를 문자열로 변환한 값)
      // prioritySettings에서 해당 ID를 찾아서 labelType 확인
      const selectedPrioritySetting = prioritySettings.find((s) => {
        const settingId = String(s.priorityIdx);
        return settingId === data.priority;
      });

      // labelType을 그대로 사용 (자유 문자열)
      const priorityInfo = selectedPrioritySetting
        ? {
            priority: selectedPrioritySetting.labelType || null, // null 허용
            priorityIdx: selectedPrioritySetting.priorityIdx,
          }
        : {
            priority: null,
            priorityIdx: undefined,
          };

      // 2. 업로드된 파일 정보로 문서 생성
      await createDocumentMutation.mutateAsync({
        documentName: data.documentName,
        documentWrittenAt: new Date().toISOString().split('T')[0], // 오늘 날짜
        referenceType: 'CUSTOM', // 기본값
        priority: priorityInfo.priority,
        priorityIdx: priorityInfo.priorityIdx,
        isPublic: data.isPublic ? 1 : 0,
        fileName: data.file.name,
        fileUrl,
        fileSize: data.file.size,
      });
      setUploadModalOpen(false);
    } catch (error) {
      console.error('❌ 문서 업로드 실패:', error);
    }
  };

  const handleShareToChat = (row: SharedDocument) => {
    setSelectedDocumentForShare(row);
    setShareToChatModalOpen(true);
  };

  const handleShareToChatConfirm = async (chatRoomIdxList: number[], documentId: string) => {
    try {
      await shareToChatMutation.mutateAsync({
        sharedDocumentIdx: Number(documentId),
        chatRoomIdxList,
      });
      setShareToChatModalOpen(false);
      setSelectedDocumentForShare(null);
      // 채팅방 목록 쿼리 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    } catch (error) {
      console.error('❌ 채팅방 공유 실패:', error);
    }
  };

  const handleEdit = (row: SharedDocument) => {
    setSelectedDocumentForEdit(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (data: EditDocumentFormData) => {
    if (!selectedDocumentForEdit) return;

    try {
      // priority를 API 형식에 맞게 변환
      // data.priority는 EditDocumentModal에서 전달된 prioritySetting의 priorityIdx를 문자열로 변환한 값
      const selectedPrioritySetting = prioritySettings.find((s) => {
        const settingId = String(s.priorityIdx);
        return settingId === data.priority;
      });

      // 디버깅: 수정 데이터 확인
      if (import.meta.env.DEV) {
        console.log('💾 문서 수정 데이터:', {
          sharedDocumentIdx: selectedDocumentForEdit.sharedDocumentIdx,
          formData: data,
          formDataPriority: data.priority,
          selectedPrioritySetting,
          prioritySettings: prioritySettings.map((s) => ({
            priorityIdx: s.priorityIdx,
            labelType: s.labelType,
          })),
        });
      }

      // labelType을 그대로 사용 (자유 문자열, null 허용)
      let priorityInfo: {
        priority: string | null;
        priorityIdx: number | undefined;
      };

      if (selectedPrioritySetting) {
        // 중요도 설정에서 찾은 경우
        priorityInfo = {
          priority: selectedPrioritySetting.labelType || null,
          priorityIdx: selectedPrioritySetting.priorityIdx,
        };
      } else {
        // 중요도 설정에서 찾지 못한 경우
        // selectedDocumentForEdit은 이미 null 체크 완료
        priorityInfo = {
          priority: selectedDocumentForEdit?.priorityInformation?.labelType || null,
          priorityIdx: selectedDocumentForEdit?.priorityIdx,
        };
      }

      const updateParams = {
        sharedDocumentIdx: selectedDocumentForEdit.sharedDocumentIdx,
        documentName: data.documentName,
        priority: priorityInfo.priority,
        priorityIdx: priorityInfo.priorityIdx,
        isPublic: data.isPublic ? 1 : 0,
      };

      if (import.meta.env.DEV) {
        console.log('🔄 문서 수정 API 호출:', {
          ...updateParams,
          priorityType: typeof updateParams.priority,
          priorityValue: updateParams.priority,
        });
      }

      await updateDocumentMutation.mutateAsync(updateParams);

      // 쿼리 무효화하여 최신 데이터 가져오기
      await queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });

      if (import.meta.env.DEV) {
        console.log('✅ 문서 수정 완료');
      }

      setEditModalOpen(false);
      setSelectedDocumentForEdit(null);
    } catch (error) {
      console.error('❌ 문서 수정 실패:', error);
      alert('문서 수정에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };

  const handleDelete = (row: SharedDocument) => {
    setSelectedDocumentForDelete(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocumentForDelete) return;

    try {
      await deleteDocumentMutation.mutateAsync({
        sharedDocumentIdx: selectedDocumentForDelete.sharedDocumentIdx,
      });
      setDeleteModalOpen(false);
      setSelectedDocumentForDelete(null);
    } catch (error) {
      console.error('❌ 문서 삭제 실패:', error);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> 공유 문서함</Typography>

      <SharedDocumentBreadcrumbs
        items={[
          { label: '대시보드', href: `/admin${paths.dashboard.root}` },
          { label: '공유 문서함' },
        ]}
        onPrioritySettings={handlePrioritySettings}
        onUpload={handleUpload}
      />

      {sharedDocumentsLoading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            데이터를 불러오는 중...
          </Typography>
        </Box>
      )}

      {sharedDocumentsError && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="error">
            데이터를 불러오는 중 오류가 발생했습니다.
          </Typography>
        </Box>
      )}

      {!sharedDocumentsLoading && !sharedDocumentsError && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.card,
            width: '100%',
            overflow: 'hidden',
            mt: 3,
          }}
        >
          <SharedDocumentTabs
            value={logic.filters.tab}
            onChange={logic.onChangeTab}
            countAll={logic.countAll}
            countPublic={logic.countPublic}
            countPrivate={logic.countPrivate}
          />

          <SharedDocumentFilters
            priority={logic.filters.priority}
            onChangePriority={logic.onChangePriority}
            startDate={logic.filters.startDate}
            onChangeStartDate={logic.onChangeStartDate}
            endDate={logic.filters.endDate}
            onChangeEndDate={logic.onChangeEndDate}
            searchValue={logic.filters.searchValue}
            onChangeSearchValue={logic.onChangeSearchValue}
            prioritySettings={prioritySettings}
          />

          <SharedDocumentTable
            rows={logic.filtered}
            prioritySettings={prioritySettings}
            page={logic.page}
            rowsPerPage={logic.rowsPerPage}
            onShareToChat={handleShareToChat}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleDocumentClick}
          />

          <SharedDocumentPagination
            dense={logic.dense}
            onChangeDense={logic.onChangeDense}
            rowsPerPage={logic.rowsPerPage}
            onChangeRowsPerPage={(newRowsPerPage) => {
              logic.onChangeRowsPerPage(newRowsPerPage);
            }}
            page={logic.page}
            total={logic.total}
            count={logic.filtered.length}
            onPageChange={(newPage) => {
              logic.onChangePage(newPage);
            }}
          />
        </Box>
      )}

      <PrioritySettingsModal
        open={prioritySettingsModalOpen}
        onClose={() => setPrioritySettingsModalOpen(false)}
        onSave={handleSavePrioritySettings}
        initialPriorities={prioritySettings
          .sort((a: PrioritySetting, b: PrioritySetting) => (a.order || 0) - (b.order || 0))
          .map((setting: PrioritySetting) => ({
            id: String(setting.priorityIdx), // API는 priorityIdx 필드 사용
            color:
              Object.keys(COLOR_VALUES).find(
                (key) => COLOR_VALUES[key].toLowerCase() === setting.color.toLowerCase()
              ) || 'red',
            labelType: setting.labelType || '',
            isActive: setting.isActive === 1,
          }))}
      />

      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSave={handleSaveUpload}
        priorities={prioritySettings
          .filter((setting: PrioritySetting) => setting.isActive === 1)
          .sort((a: PrioritySetting, b: PrioritySetting) => (a.order || 0) - (b.order || 0))
          .map((setting: PrioritySetting) => ({
            id: String(setting.priorityIdx),
            label: setting.labelType || '중요도',
            color: setting.color || '#000000',
            labelType: setting.labelType || undefined,
          }))}
      />

      {selectedDocumentForShare && (
        <ShareToChatModal
          open={shareToChatModalOpen}
          onClose={() => {
            setShareToChatModalOpen(false);
            setSelectedDocumentForShare(null);
          }}
          onShare={handleShareToChatConfirm}
          documentId={String(selectedDocumentForShare.sharedDocumentIdx)}
          documentName={selectedDocumentForShare.documentName}
        />
      )}

      {selectedDocumentForEdit && (
        <EditDocumentModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedDocumentForEdit(null);
          }}
          onSave={handleSaveEdit}
          document={selectedDocumentForEdit}
          priorities={prioritySettings
            .filter((setting: PrioritySetting) => setting.isActive === 1)
            .sort((a: PrioritySetting, b: PrioritySetting) => (a.order || 0) - (b.order || 0))
            .map((setting: PrioritySetting) => ({
              id: String(setting.priorityIdx),
              label: setting.labelType || '중요도',
              color: setting.color || '#000000',
              labelType: setting.labelType || undefined,
            }))}
        />
      )}

      {selectedDocumentForDelete && (
        <DeleteDocumentModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedDocumentForDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          document={selectedDocumentForDelete}
        />
      )}

      {/* 문서 상세 모달 */}
      {selectedDocumentIdx && (
        <SharedDocumentDetailModal
          open={documentDetailModalOpen}
          onClose={handleCloseDocumentDetailModal}
          sharedDocumentIdx={selectedDocumentIdx}
        />
      )}
    </DashboardContent>
  );
}
