import { useState, useMemo, useEffect, useCallback } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import LibraryReportBreadcrumbs from './components/Breadcrumbs';
import LibraryReportTabs from './components/Tabs';
import LibraryReportFilters from './components/Filters';
import LibraryReportTable from './components/Table';
import LibraryReportPagination from './components/Pagination';
import CategorySettingsModal, { type CategoryItem } from './components/CategorySettingsModal';
import VODUploadModal, { type VODUploadFormData } from './components/VODUploadModal';
import EditContentModal, { type EditContentFormData } from './components/EditContentModal';
import { useLibraryReport } from './hooks/use-library-report';
import dayjs from 'dayjs';
import type {
  LibraryReport,
  SaveLibraryCategoryListParams,
  CreateLibraryReportParams,
  UpdateLibraryReportParams,
} from 'src/services/library-report/library-report.types';
import {
  useLibraryReports,
  useCategories,
  useSaveCategories,
  useUploadVOD,
  useUpdateContent,
  useDeleteContent,
} from './hooks/use-library-report-api';
import { uploadFile } from 'src/services/system/system.service';
import {
  getVodDetail,
  getVodDownloadUrl,
  getVodBatchDownloadUrl,
} from 'src/services/vod/vod.service';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function LibraryReportView({ title = '라이브러리', description, sx }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [vodUploadModalOpen, setVodUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<LibraryReport | null>(null);
  const saveCategoriesMutation = useSaveCategories();
  const uploadVodMutation = useUploadVOD();
  const updateContentMutation = useUpdateContent();
  const deleteContentMutation = useDeleteContent();

  const categoryQuery = useCategories();

  // 서버에서 필터링하지 않으므로 params 없이 전체 데이터 조회
  const reportsQuery = useLibraryReports();

  const mappedCategories = useMemo<CategoryItem[]>(() => {
    const apiCategories = categoryQuery.data?.categories ?? [];
    return apiCategories.map((category, index) => ({
      id: category.id || `category-${index + 1}`,
      name: category.name,
      isActive: category.isActive,
      libraryCategoryIdx: category.libraryCategoryIdx ?? null,
      order: category.order ?? index + 1,
      description: category.description ?? null,
    }));
  }, [categoryQuery.data]);

  useEffect(() => {
    if (mappedCategories.length) {
      setCategories(mappedCategories);
    }
  }, [mappedCategories]);

  // 훅에서 필터링 및 페이지네이션 처리
  const allRows = useMemo(() => reportsQuery.data?.libraryReports ?? [], [reportsQuery.data]);
  const logic = useLibraryReport(allRows);
  const { resetSelection, paginatedRows: rows, totalCount } = logic;

  useEffect(() => {
    resetSelection();
  }, [rows, resetSelection]);

  const handleSaveCategories = useCallback(
    async (items: CategoryItem[]) => {
      const payload: SaveLibraryCategoryListParams = {
        categoryList: items.map((item, index) => {
          // isActive를 명시적으로 boolean으로 확인 후 0 또는 1로 변환
          const isActiveValue = item.isActive === true ? 1 : 0;

          if (import.meta.env.DEV) {
            console.log('🔍 [handleSaveCategories] 카테고리 저장:', {
              name: item.name,
              isActive: item.isActive,
              isActiveValue,
            });
          }

          return {
            libraryCategoryIdx: item.libraryCategoryIdx ?? null,
            name: item.name,
            order: item.order ?? index + 1,
            description: item.description ?? null,
            isActive: isActiveValue,
          };
        }),
      };

      if (import.meta.env.DEV) {
        console.log('📤 [handleSaveCategories] 저장할 페이로드:', payload);
      }

      await saveCategoriesMutation.mutateAsync(payload);
      // 쿼리 무효화는 useSaveCategories 훅에서 처리됨
      // 카테고리 목록은 쿼리 무효화 후 자동으로 다시 가져와짐
    },
    [saveCategoriesMutation]
  );

  const handleUploadVod = useCallback(
    async (data: VODUploadFormData, vodIdx?: number) => {
      try {
        // 새 VOD API를 사용한 경우 (vodIdx가 제공됨)
        if (vodIdx !== undefined && vodIdx !== null) {
          if (import.meta.env.DEV) {
            console.log(
              '📺 [LibraryReportView] VOD 업로드 완료, 라이브러리 리포트 생성 시작:',
              vodIdx
            );
          }

          // VOD 상세 정보 조회
          const vodDetail = await getVodDetail(vodIdx);

          // axios interceptor가 응답을 평탄화하므로 직접 접근
          const vodData = vodDetail as any;
          const videoPath = vodData.videoPath;
          if (!videoPath) {
            throw new Error('VOD 상세 정보에 비디오 경로가 없습니다.');
          }

          // 라이브러리 리포트 생성
          const categoryItem = categories.find((cat) => cat.name === data.category);

          // 재생 시간 포맷팅 (초를 HH:MM:SS 형식으로 변환)
          let playbackTime = '00:00:00';
          if (vodData.durationSec) {
            const hours = Math.floor(vodData.durationSec / 3600);
            const minutes = Math.floor((vodData.durationSec % 3600) / 60);
            const seconds = Math.floor(vodData.durationSec % 60);
            playbackTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }

          const payload: CreateLibraryReportParams = {
            libraryCategoryIdx: categoryItem?.libraryCategoryIdx ?? undefined,
            title: data.title,
            organizationName: rows[0]?.organizationName ?? '이편한자동화기술',
            playbackTime,
            hasSubtitles: Object.keys(vodData.vttMap || {}).length > 0,
            visibilityType: 'organization',
            fileUrl: videoPath,
            thumbnailUrl: undefined, // VOD API에서 썸네일을 제공하지 않으면 undefined
            description: data.description || undefined,
          };

          await uploadVodMutation.mutateAsync(payload);
          if (import.meta.env.DEV) {
            console.log('✅ [LibraryReportView] 라이브러리 리포트 생성 성공', payload);
          }
          return;
        }

        // 기존 방식 (하위 호환성): 파일을 직접 업로드
        if (!data.videoFile) {
          throw new Error('비디오 파일을 선택해주세요.');
        }

        // 1. 비디오 파일을 먼저 업로드
        if (import.meta.env.DEV) {
          console.log('📤 [LibraryReportView] 비디오 파일 업로드 시작:', data.videoFile.name);
        }
        const uploadResponse = await uploadFile({ files: [data.videoFile] });

        // axios interceptor가 body를 flatten하므로 uploadResponse는 { fileUrls: string[], header: ... } 형태
        const fileUrls = (uploadResponse as unknown as { fileUrls: string[] }).fileUrls;
        if (!fileUrls || fileUrls.length === 0) {
          throw new Error('파일 업로드 실패: fileUrls가 없습니다.');
        }

        const fileUrl = fileUrls[0];
        if (import.meta.env.DEV) {
          console.log('✅ [LibraryReportView] 파일 업로드 완료:', fileUrl);
        }

        // 2. 썸네일 업로드 (비디오에서 추출한 썸네일이 있다면)
        let thumbnailUrl: string | undefined;
        if (data.thumbnailDataUrl) {
          try {
            // Data URL을 Blob으로 변환
            const response = await fetch(data.thumbnailDataUrl);
            const blob = await response.blob();
            const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });

            if (import.meta.env.DEV) {
              console.log('📤 [LibraryReportView] 썸네일 업로드 시작');
            }
            const thumbnailUploadResponse = await uploadFile({ files: [thumbnailFile] });
            const thumbnailFileUrls = (thumbnailUploadResponse as unknown as { fileUrls: string[] })
              .fileUrls;
            if (thumbnailFileUrls && thumbnailFileUrls.length > 0) {
              thumbnailUrl = thumbnailFileUrls[0];
              if (import.meta.env.DEV) {
                console.log('✅ [LibraryReportView] 썸네일 업로드 완료:', thumbnailUrl);
              }
            }
          } catch (error) {
            console.warn('⚠️ [LibraryReportView] 썸네일 업로드 실패 (무시하고 계속 진행)', error);
          }
        }

        // 3. 업로드된 파일 정보로 라이브러리 리포트 생성
        const categoryItem = categories.find((cat) => cat.name === data.category);
        const payload: CreateLibraryReportParams = {
          libraryCategoryIdx: categoryItem?.libraryCategoryIdx ?? undefined,
          title: data.title,
          organizationName: rows[0]?.organizationName ?? '이편한자동화기술',
          playbackTime: '00:00:00',
          hasSubtitles: false,
          visibilityType: 'organization',
          fileUrl,
          thumbnailUrl,
          description: data.description || undefined,
        };

        await uploadVodMutation.mutateAsync(payload);
        if (import.meta.env.DEV) {
          console.log('📺 [LibraryReportView] VOD 업로드 성공', payload);
        }
      } catch (error) {
        console.error('❌ [LibraryReportView] VOD 업로드 실패', error);
        throw error;
      }
    },
    [categories, rows, uploadVodMutation]
  );

  const handleUpdateContent = useCallback(
    async (form: EditContentFormData) => {
      if (!selectedRow) {
        return;
      }

      try {
        let fileUrl = selectedRow.fileUrl;
        let thumbnailUrl = selectedRow.thumbnailUrl;

        // 새 비디오 파일이 있으면 업로드
        if (form.videoFile) {
          if (import.meta.env.DEV) {
            console.log('📤 [LibraryReportView] 비디오 파일 업로드 시작:', form.videoFile.name);
          }
          const uploadResponse = await uploadFile({ files: [form.videoFile] });
          const fileUrls = (uploadResponse as unknown as { fileUrls: string[] }).fileUrls;
          if (fileUrls && fileUrls.length > 0) {
            fileUrl = fileUrls[0];
            if (import.meta.env.DEV) {
              console.log('✅ [LibraryReportView] 파일 업로드 완료:', fileUrl);
            }
          }
        }

        // 새 썸네일이 있으면 업로드
        if (form.thumbnailDataUrl) {
          try {
            const response = await fetch(form.thumbnailDataUrl);
            const blob = await response.blob();
            const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });

            if (import.meta.env.DEV) {
              console.log('📤 [LibraryReportView] 썸네일 업로드 시작');
            }
            const thumbnailUploadResponse = await uploadFile({ files: [thumbnailFile] });
            const thumbnailFileUrls = (thumbnailUploadResponse as unknown as { fileUrls: string[] })
              .fileUrls;
            if (thumbnailFileUrls && thumbnailFileUrls.length > 0) {
              thumbnailUrl = thumbnailFileUrls[0];
              if (import.meta.env.DEV) {
                console.log('✅ [LibraryReportView] 썸네일 업로드 완료:', thumbnailUrl);
              }
            }
          } catch (error) {
            console.warn('⚠️ [LibraryReportView] 썸네일 업로드 실패 (무시하고 계속 진행)', error);
          }
        }

        const categoryItem = categories.find((cat) => cat.name === form.category);
        const derivedCategoryIdx =
          categoryItem?.libraryCategoryIdx ?? selectedRow.libraryCategoryIdx ?? undefined;
        const payload: UpdateLibraryReportParams = {
          libraryReportIdx: selectedRow.libraryReportIdx ?? Number(selectedRow.id),
          libraryCategoryIdx: derivedCategoryIdx,
          title: form.title,
          description: form.description || undefined,
          isActive: form.isActive ? 1 : 0,
          organizationName: selectedRow.organizationName || undefined,
          playbackTime: selectedRow.playbackTime || undefined,
          hasSubtitles: selectedRow.hasSubtitles ? 1 : 0,
          visibilityType: (selectedRow.visibilityType as any) || undefined,
          fileUrl,
          thumbnailUrl,
          memo: selectedRow.memo || undefined,
        };

        await updateContentMutation.mutateAsync(payload);
        if (import.meta.env.DEV) {
          console.log('✏️ [LibraryReportView] 컨텐츠 수정 성공', payload);
        }
      } catch (error) {
        console.error('❌ [LibraryReportView] 컨텐츠 수정 실패', error);
        throw error;
      }
    },
    [categories, selectedRow, updateContentMutation]
  );

  const handleDeleteContent = useCallback(async () => {
    if (!selectedRow) {
      return;
    }
    try {
      await deleteContentMutation.mutateAsync({
        libraryReportIdx: selectedRow.libraryReportIdx ?? Number(selectedRow.id),
      });
      if (import.meta.env.DEV) {
        console.log('🗑️ [LibraryReportView] 컨텐츠 삭제 성공', selectedRow);
      }
    } catch (error) {
      console.error('❌ [LibraryReportView] 컨텐츠 삭제 실패', error);
      throw error;
    }
  }, [deleteContentMutation, selectedRow]);

  const handleDownloadSelected = useCallback(async () => {
    if (logic.selectedIds.length === 0) {
      toast.warning('다운로드할 파일을 선택해주세요.');
      return;
    }

    try {
      // 선택된 항목들의 데이터 가져오기
      const selectedRows = allRows.filter((row) => {
        const rowId = row.id ?? String(row.libraryReportIdx ?? '');
        return logic.selectedIds.includes(rowId);
      });

      if (selectedRows.length === 0) {
        toast.error('선택된 항목을 찾을 수 없습니다.');
        return;
      }

      // vodIdx 추출 및 검증
      const vodIdxes: number[] = [];
      const invalidRows: LibraryReport[] = [];

      for (const row of selectedRows) {
        const vodIdx = row.vodIdx;
        if (vodIdx) {
          vodIdxes.push(vodIdx);
        } else if (row.fileUrl) {
          // fileUrl이 있는 경우는 개별 처리 (기존 방식)
          invalidRows.push(row);
        } else {
          console.warn('⚠️ [LibraryReportView] vodIdx나 fileUrl이 없어서 다운로드 건너뜀:', row);
        }
      }

      // 여러 개 선택된 경우 배치 다운로드 사용
      if (vodIdxes.length > 1) {
        try {
          const batchDownloadUrl = getVodBatchDownloadUrl(vodIdxes);
          if (import.meta.env.DEV) {
            console.log('📥 [LibraryReportView] 배치 다운로드 URL:', batchDownloadUrl);
          }
          const token = sessionStorage.getItem('jwt_access_token');
          const response = await fetch(batchDownloadUrl, {
            headers: {
              Authorization: `Bearer ${token || ''}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            if (import.meta.env.DEV) {
              console.error('❌ [LibraryReportView] 배치 다운로드 응답 오류:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
              });
            }
            throw new Error(`배치 다운로드 실패: ${response.status} ${response.statusText}`);
          }

          const blob = await response.blob();

          // blob 크기 확인 (에러 응답인지 확인)
          if (import.meta.env.DEV) {
            console.log('📦 [LibraryReportView] 다운로드된 blob:', {
              size: blob.size,
              type: blob.type,
            });
          }

          if (blob.size < 1000) {
            // 작은 크기는 에러 응답일 가능성이 높음
            const text = await blob.text();
            if (import.meta.env.DEV) {
              console.error('❌ [LibraryReportView] 작은 blob 응답:', text);
            }
            try {
              const errorData = JSON.parse(text);
              const errorMessage =
                errorData?.header?.resultMessage ||
                errorData?.message ||
                errorData?.error ||
                '배치 다운로드에 실패했습니다. 파일이 비어있습니다.';
              // 서버 에러 메시지를 그대로 throw
              throw new Error(errorMessage);
            } catch (parseError) {
              // parseError가 이미 Error 객체인 경우 (위에서 throw한 경우)
              if (parseError instanceof Error) {
                throw parseError;
              }
              // JSON 파싱 실패인 경우
              throw new Error('배치 다운로드에 실패했습니다. 파일이 비어있습니다.');
            }
          }

          const fileName = `videos_${new Date().getTime()}.zip`;

          // ZIP 다운로드
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast.success(`${vodIdxes.length}개 파일이 ZIP으로 다운로드되었습니다.`);
        } catch (error) {
          console.error('❌ [LibraryReportView] 배치 다운로드 실패', error);
          const errorMessage =
            error instanceof Error ? error.message : '배치 다운로드에 실패했습니다.';
          toast.error(errorMessage);
        }
      } else if (vodIdxes.length === 1) {
        // 하나만 선택된 경우 개별 다운로드
        try {
          const downloadUrl = getVodDownloadUrl(vodIdxes[0]);
          if (import.meta.env.DEV) {
            console.log('📥 [LibraryReportView] 다운로드 URL:', downloadUrl);
          }
          const token = sessionStorage.getItem('jwt_access_token');
          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${token || ''}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            if (import.meta.env.DEV) {
              console.error('❌ [LibraryReportView] 다운로드 응답 오류:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
              });
            }
            throw new Error(`비디오 다운로드 실패: ${response.status} ${response.statusText}`);
          }

          const blob = await response.blob();

          // blob 크기 확인 (에러 응답인지 확인)
          if (import.meta.env.DEV) {
            console.log('📦 [LibraryReportView] 다운로드된 blob:', {
              size: blob.size,
              type: blob.type,
            });
          }

          if (blob.size < 1000) {
            // 작은 크기는 에러 응답일 가능성이 높음
            const text = await blob.text();
            if (import.meta.env.DEV) {
              console.error('❌ [LibraryReportView] 작은 blob 응답:', text);
            }
            try {
              const errorData = JSON.parse(text);
              const errorMessage =
                errorData?.header?.resultMessage ||
                errorData?.message ||
                errorData?.error ||
                '다운로드에 실패했습니다. 파일이 비어있습니다.';
              // 서버 에러 메시지를 그대로 throw
              throw new Error(errorMessage);
            } catch (parseError) {
              // parseError가 이미 Error 객체인 경우 (위에서 throw한 경우)
              if (parseError instanceof Error) {
                throw parseError;
              }
              // JSON 파싱 실패인 경우
              throw new Error('다운로드에 실패했습니다. 파일이 비어있습니다.');
            }
          }

          const row = selectedRows.find((r) => r.vodIdx === vodIdxes[0]);
          const fileName = (row?.title || `video_${vodIdxes[0]}`).replace(
            /[^a-zA-Z0-9가-힣\s]/g,
            '_'
          );

          // 다운로드
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast.success('파일 다운로드를 시작했습니다.');
        } catch (error) {
          console.error('❌ [LibraryReportView] 다운로드 실패', error);
          const errorMessage = error instanceof Error ? error.message : '다운로드에 실패했습니다.';
          toast.error(errorMessage);
        }
      }

      // fileUrl이 있는 항목들은 개별 처리 (기존 방식)
      for (const row of invalidRows) {
        try {
          const fileName = row.title || `video_${row.id}`;
          const a = document.createElement('a');
          a.href = row.fileUrl!;
          a.download = `${fileName}.mp4`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (error) {
          console.error(`❌ [LibraryReportView] ${row.title || row.id} 다운로드 실패:`, error);
          toast.error(`${row.title || row.id} 다운로드에 실패했습니다.`);
        }
      }
    } catch (error) {
      console.error('❌ [LibraryReportView] 다운로드 실패', error);
      toast.error('다운로드 중 오류가 발생했습니다.');
    }
  }, [logic.selectedIds, allRows]);

  const isLoading = reportsQuery.isLoading || categoryQuery.isLoading;
  const isError = reportsQuery.isError;

  const renderTableSection = () => {
    if (isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      );
    }

    if (isError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          라이브러리 데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      );
    }

    if (rows.length === 0) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          조회된 라이브러리 데이터가 없습니다.
        </Alert>
      );
    }

    return (
      <>
        <LibraryReportTable
          rows={rows}
          selectedIds={logic.selectedIds}
          onSelectAll={logic.onSelectAll}
          onSelectRow={logic.onSelectRow}
          onEdit={(row) => {
            setSelectedRow(row);
            setEditModalOpen(true);
          }}
        />

        <LibraryReportPagination
          count={totalCount}
          page={logic.page}
          rowsPerPage={logic.rowsPerPage}
          onChangePage={logic.onChangePage}
          onChangeRowsPerPage={logic.onChangeRowsPerPage}
          onDownload={handleDownloadSelected}
          selectedCount={logic.selectedIds.length}
        />
      </>
    );
  };

  const renderContent = () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <LibraryReportTabs
        value={logic.filters.tab}
        onChange={(tab) => {
          logic.onChangeTab(tab);
        }}
        counts={logic.counts}
      />

      <LibraryReportFilters
        categories={categories}
        category={logic.filters.category}
        onChangeCategory={(category) => {
          logic.onChangeCategory(category);
          // TODO: 카테고리 필터 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        startDate={logic.filters.startDate ? dayjs(logic.filters.startDate) : null}
        onChangeStartDate={(date) => {
          logic.onChangeStartDate(date);
          // TODO: 시작일 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        endDate={logic.filters.endDate ? dayjs(logic.filters.endDate) : null}
        onChangeEndDate={(date) => {
          logic.onChangeEndDate(date);
          // TODO: 종료일 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        searchFilter={logic.filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          logic.onChangeSearchFilter(filter);
          // TODO: 검색 필터 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
      />

      {renderTableSection()}
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <LibraryReportBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '현장 운영 관리', href: '/admin/dashboard/operation' },
          { label: title },
        ]}
        onCategorySettings={() => setCategoryModalOpen(true)}
        onVodUpload={() => setVodUploadModalOpen(true)}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <CategorySettingsModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategories}
        initialCategories={categories}
      />

      <VODUploadModal
        open={vodUploadModalOpen}
        onClose={() => setVodUploadModalOpen(false)}
        onSave={handleUploadVod}
        categories={categories}
      />

      <EditContentModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRow(null);
        }}
        onSave={handleUpdateContent}
        onDelete={handleDeleteContent}
        categories={categories}
        initialData={selectedRow}
      />
    </DashboardContent>
  );
}
