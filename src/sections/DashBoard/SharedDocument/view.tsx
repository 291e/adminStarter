import { useMemo } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { mockSafetySystemDocuments } from 'src/_mock/_safety-system';

import { useState } from 'react';

import SharedDocumentBreadcrumbs from './components/Breadcrumbs';
import SharedDocumentTabs from './components/Tabs';
import SharedDocumentFilters from './components/Filters';
import SharedDocumentTable, { type SharedDocument } from './components/Table';
import SharedDocumentPagination from './components/Pagination';
import PrioritySettingsModal, { type PriorityItem } from './components/PrioritySettingsModal';
import UploadDocumentModal, { type UploadDocumentFormData } from './components/UploadDocumentModal';
import ShareToChatModal from './components/ShareToChatModal';
import EditDocumentModal, { type EditDocumentFormData } from './components/EditDocumentModal';
import DeleteDocumentModal from './components/DeleteDocumentModal';
import { useSharedDocument } from './hooks/use-shared-document';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

// 공유된 문서 변환 함수
function convertToSharedDocument(
  doc: (typeof mockSafetySystemDocuments)[0],
  index: number
): SharedDocument {
  const priorities: Array<'urgent' | 'important' | 'reference'> = [
    'urgent',
    'important',
    'reference',
  ];
  const statuses: Array<'public' | 'private'> = ['public', 'private'];

  // 문서 번호에 따라 일관된 priority와 status 할당
  const priority = priorities[index % priorities.length];
  const status = statuses[index % statuses.length];

  // registeredAt과 registeredTime을 합쳐서 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
  const registeredDate = `${doc.registeredAt} ${doc.registeredTime}`;

  return {
    id: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
    priority,
    documentName: doc.documentName,
    registeredDate,
    status,
  };
}

export function SharedDocumentView({ title = '공유 문서함', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 공유된 문서 목록 가져오기
  // const { data: sharedDocs, isLoading } = useQuery({
  //   queryKey: ['sharedDocuments', filters.tab, filters.priority, filters.startDate, filters.endDate, filters.searchValue, page, rowsPerPage],
  //   queryFn: () => fetchSharedDocuments({
  //     tab: filters.tab,
  //     priority: filters.priority,
  //     startDate: filters.startDate?.format('YYYY-MM-DD'),
  //     endDate: filters.endDate?.format('YYYY-MM-DD'),
  //     searchValue: filters.searchValue,
  //     page,
  //     rowsPerPage,
  //   }),
  // });

  // 공유된 문서: 목업 데이터 사용
  const sharedDocuments = useMemo(() => {
    const docs = mockSafetySystemDocuments.slice(0, 20);
    return docs.map(convertToSharedDocument);
  }, []);

  const logic = useSharedDocument(sharedDocuments);
  const [prioritySettingsModalOpen, setPrioritySettingsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [shareToChatModalOpen, setShareToChatModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<SharedDocument | null>(
    null
  );
  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState<SharedDocument | null>(
    null
  );
  const [selectedDocumentForDelete, setSelectedDocumentForDelete] = useState<SharedDocument | null>(
    null
  );

  const handlePrioritySettings = () => {
    setPrioritySettingsModalOpen(true);
  };

  const handleSavePrioritySettings = (priorities: PriorityItem[]) => {
    // TODO: TanStack Query Hook(useMutation)으로 중요도 설정 저장
    // const saveMutation = useMutation({
    //   mutationFn: () => savePrioritySettings(priorities),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['prioritySettings'] });
    //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //   },
    // });
    // saveMutation.mutate();
    console.log('중요도 설정 저장:', priorities);
  };

  const handleUpload = () => {
    setUploadModalOpen(true);
  };

  const handleSaveUpload = (data: UploadDocumentFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 업로드
    // const uploadMutation = useMutation({
    //   mutationFn: () => uploadSharedDocument(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //   },
    // });
    // uploadMutation.mutate();
    console.log('문서 업로드 저장:', data);
  };

  const handleShareToChat = (row: SharedDocument) => {
    setSelectedDocumentForShare(row);
    setShareToChatModalOpen(true);
  };

  const handleShareToChatConfirm = (roomId: string, documentId: string) => {
    // TODO: TanStack Query Hook(useMutation)으로 채팅방에 문서 공유
    // const shareMutation = useMutation({
    //   mutationFn: () => shareDocumentToChat(documentId, roomId),
    //   onSuccess: () => {
    //     // 채팅방으로 이동하거나 성공 메시지 표시
    //     // navigate(`/dashboard/chat/${roomId}`);
    //     queryClient.invalidateQueries({ queryKey: ['chatMessages', roomId] });
    //   },
    // });
    // shareMutation.mutate();
    console.log('채팅방 공유하기:', documentId, roomId);
  };

  const handleEdit = (row: SharedDocument) => {
    setSelectedDocumentForEdit(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (data: EditDocumentFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 수정
    // const updateMutation = useMutation({
    //   mutationFn: () => updateSharedDocument(selectedDocumentForEdit?.id, data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //     setEditModalOpen(false);
    //     setSelectedDocumentForEdit(null);
    //   },
    // });
    // updateMutation.mutate();
    console.log('문서 수정 저장:', data);
    setEditModalOpen(false);
    setSelectedDocumentForEdit(null);
  };

  const handleDelete = (row: SharedDocument) => {
    setSelectedDocumentForDelete(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 삭제
    // const deleteMutation = useMutation({
    //   mutationFn: () => deleteSharedDocument(selectedDocumentForDelete?.id),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //     setDeleteModalOpen(false);
    //     setSelectedDocumentForDelete(null);
    //   },
    // });
    // deleteMutation.mutate();
    console.log('문서 삭제:', selectedDocumentForDelete?.id);
    setDeleteModalOpen(false);
    setSelectedDocumentForDelete(null);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <SharedDocumentBreadcrumbs
        items={[{ label: '대시보드', href: '/dashboard' }, { label: '공유 문서함' }]}
        onPrioritySettings={handlePrioritySettings}
        onUpload={handleUpload}
      />

      {description && (
        <Typography
          sx={{
            mt: 1,
            mb: { xs: 2, sm: 3, md: 3.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {description}
        </Typography>
      )}

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
        />

        <SharedDocumentTable
          rows={logic.filtered}
          onShareToChat={handleShareToChat}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <SharedDocumentPagination
          dense={logic.dense}
          onChangeDense={logic.onChangeDense}
          rowsPerPage={logic.rowsPerPage}
          onChangeRowsPerPage={logic.onChangeRowsPerPage}
          page={logic.page}
          total={logic.total}
          count={logic.filtered.length}
          onPageChange={(page) => {
            logic.onChangePage(page);
            // TODO: 페이지 변경 시 TanStack Query로 공유 문서 목록 새로고침
            // queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
          }}
        />
      </Box>

      <PrioritySettingsModal
        open={prioritySettingsModalOpen}
        onClose={() => setPrioritySettingsModalOpen(false)}
        onSave={handleSavePrioritySettings}
      />

      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSave={handleSaveUpload}
        priorities={[
          { id: 'urgent', label: '긴급', color: 'red' },
          { id: 'important', label: '중요', color: 'yellow' },
          { id: 'reference', label: '참고', color: 'blue' },
        ]}
      />

      {selectedDocumentForShare && (
        <ShareToChatModal
          open={shareToChatModalOpen}
          onClose={() => {
            setShareToChatModalOpen(false);
            setSelectedDocumentForShare(null);
          }}
          onShare={handleShareToChatConfirm}
          documentId={selectedDocumentForShare.id}
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
          priorities={[
            { id: 'urgent', label: '긴급', color: 'red' },
            { id: 'important', label: '중요', color: 'yellow' },
            { id: 'reference', label: '참고', color: 'blue' },
          ]}
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
    </DashboardContent>
  );
}
