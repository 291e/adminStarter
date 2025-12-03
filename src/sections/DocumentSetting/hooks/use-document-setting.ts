import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';

import { getSafetySystemList } from 'src/services/safety-system/safety-system.service';
import type {
  SafetySystem,
  SafetySystemItem,
} from 'src/services/safety-system/safety-system.types';

// 문서 설정에서 사용하는 상태 타입
export type DocumentStatus = 'all' | 'active' | 'inactive';

export type DocumentPeriod =
  | ''
  | '비대상'
  | '년'
  | '반기'
  | '분기'
  | '월'
  | '주'
  | '일'
  | '상시'
  | '즉시';

export type DocumentSettingItem = {
  id: string;
  order: number;
  createdDate: string;
  createdTime: string;
  name: string;
  period: DocumentPeriod;
  hasGuide: boolean;
  hasSample: boolean;
  isActive: boolean;
  // API 연동용 원본 정보
  safetyIdx: number;
  safetySystemItemIdx: number;
  guideUrl?: string | null;
  sampleUrl?: string | null;
  approvalStep?: number; // 결재 단계 (0: 없음, 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인)
};

export type DocumentSettingFilter = {
  status: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  keyword: string;
};

function mapCycleToPeriod(writingCycle?: string): DocumentPeriod {
  if (!writingCycle) return '';
  const trimmed = writingCycle.trim();
  const mapping: Record<string, DocumentPeriod> = {
    년: '년',
    반기: '반기',
    분기: '분기',
    월: '월',
    주: '주',
    일: '일',
    상시: '상시',
    즉시: '즉시',
  };
  return mapping[trimmed] ?? '';
}

function mapSystemToDocumentItem(system: SafetySystem): DocumentSettingItem {
  // 시스템은 order를 0으로 설정하여 항목들보다 먼저 표시되도록 함
  // SafetySystem 타입에 isActive가 없을 수 있으므로 any로 캐스팅하여 접근
  const systemWithActive = system as SafetySystem & { isActive?: number };
  return {
    id: `system-${system.safetyIdx}`,
    order: 0,
    createdDate: '', // 시스템 레벨에는 등록일 정보가 없음
    createdTime: '',
    name: system.systemName || '',
    period: '', // 시스템 레벨에는 작성주기 정보가 없음
    hasGuide: !!system.guide,
    hasSample: !!system.sample,
    isActive: systemWithActive.isActive === 1,
    safetyIdx: system.safetyIdx,
    safetySystemItemIdx: 0, // 시스템 레벨이므로 0으로 설정
    guideUrl: system.guide ?? null,
    sampleUrl: system.sample ?? null,
  };
}

function mapItemToDocumentItem(system: SafetySystem, item: SafetySystemItem): DocumentSettingItem {
  const date = dayjs(item.lastWrittenAt);
  const createdDate = date.isValid() ? date.format('YYYY-MM-DD') : '';
  const createdTime = date.isValid() ? date.format('HH:mm:ss') : '';

  // SafetySystemItem에는 sample 필드가 없으므로 항상 false/null로 설정
  return {
    id: String(item.safetySystemItemIdx),
    order: item.itemNumber,
    createdDate,
    createdTime,
    name: item.itemName || item.documentName || '',
    period: mapCycleToPeriod(item.writingCycle),
    hasGuide: !!item.guide,
    hasSample: false, // SafetySystemItem에는 샘플이 없음
    isActive: item.isActive === 1,
    safetyIdx: system.safetyIdx,
    safetySystemItemIdx: item.safetySystemItemIdx,
    guideUrl: item.guide ?? null,
    sampleUrl: null, // SafetySystemItem에는 샘플이 없음
    approvalStep: item.approvalStep ?? 0, // 기본값 0
  };
}

export function useDocumentSetting() {
  const [filters, setFilters] = useState<DocumentSettingFilter>({
    status: 'all',
    startDate: null,
    endDate: null,
    keyword: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 시스템 목록 조회 (시스템 목록 조회 API 사용)
  const systemsQuery = useQuery({
    queryKey: ['safetySystemList'],
    queryFn: async () => {
      try {
        const response = await getSafetySystemList();

        // axios 인터셉터에서 body.data를 평탄화하므로
        // BaseResponseDto<{ systemList: SafetySystem[], totalCount: number }> 구조에서
        // 인터셉터를 거치면 { systemList: SafetySystem[], totalCount: number, header: ... } 형태가 됨
        const systemList =
          (response as any).systemList ||
          (response as any).body?.data?.systemList ||
          (response as any).body?.systemList ||
          [];

        return {
          systemList,
          totalCount: (response as any).totalCount ?? systemList.length,
        };
      } catch (error) {
        console.error('시스템 목록 조회 실패:', error);
        return { systemList: [], totalCount: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const allItems: DocumentSettingItem[] = useMemo(() => {
    const systemList = (systemsQuery.data?.systemList ?? []) as SafetySystem[];
    const items: DocumentSettingItem[] = [];

    systemList.forEach((system: SafetySystem) => {
      // 시스템 자체도 문서 항목으로 추가
      items.push(mapSystemToDocumentItem(system));

      // 시스템의 각 아이템도 문서 항목으로 추가
      const itemList = system.itemList || system.items || [];
      itemList.forEach((item: SafetySystemItem) => {
        items.push(mapItemToDocumentItem(system, item));
      });
    });

    // order와 safetyIdx로 정렬: 먼저 safetyIdx로 그룹화, 그 다음 order로 정렬
    return items.sort((a, b) => {
      if (a.safetyIdx !== b.safetyIdx) {
        return a.safetyIdx - b.safetyIdx;
      }
      return a.order - b.order;
    });
  }, [systemsQuery.data]);

  const filteredItems = useMemo(
    () =>
      allItems.filter((item) => {
        if (filters.status === 'active' && !item.isActive) return false;
        if (filters.status === 'inactive' && item.isActive) return false;

        if (filters.keyword) {
          const keywordLower = filters.keyword.toLowerCase();
          if (!item.name.toLowerCase().includes(keywordLower)) return false;
        }

        if (filters.startDate) {
          const startDateStr = filters.startDate.format('YYYY-MM-DD');
          if (item.createdDate < startDateStr) return false;
        }
        if (filters.endDate) {
          const endDateStr = filters.endDate.format('YYYY-MM-DD');
          if (item.createdDate > endDateStr) return false;
        }

        return true;
      }),
    [allItems, filters]
  );

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);

  const paginated = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  const handleChangeStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(0);
  };

  const handleChangeKeyword = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword }));
    setPage(0);
  };

  const handleChangeStartDate = (date: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, startDate: date }));
    setPage(0);
  };

  const handleChangeEndDate = (date: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, endDate: date }));
    setPage(0);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return {
    filters,
    page: currentPage,
    rowsPerPage,
    total,
    totalPages,
    paginated,
    isLoading: systemsQuery.isLoading,
    isError: systemsQuery.isError,
    onChangeStatus: handleChangeStatus,
    onChangeKeyword: handleChangeKeyword,
    onChangeStartDate: handleChangeStartDate,
    onChangeEndDate: handleChangeEndDate,
    onChangePage: handleChangePage,
    onChangeRowsPerPage: handleChangeRowsPerPage,
  };
}
