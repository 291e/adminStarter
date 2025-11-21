import { useMemo, useState, useCallback, useEffect } from 'react';
import type { Dayjs } from 'dayjs';

import { useOrganizations } from './use-organization-api';
import type { Organization } from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

export type OrganizationFilters = {
  startDate: string | null;
  endDate: string | null;
  searchValue: string;
};

export type DivisionType =
  | 'all'
  | 'operator'
  | 'member'
  | 'distributor'
  | 'agency'
  | 'dealer'
  | 'nonmember';

export type UseOrganizationResult = {
  // 필터 상태
  tab: 'all' | 'active' | 'inactive';
  onChangeTab: (value: 'all' | 'active' | 'inactive') => void;
  division: DivisionType;
  onChangeDivision: (value: DivisionType) => void;
  filters: OrganizationFilters;
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchValue: (value: string) => void;
  searchField: 'all' | 'orgName' | 'manager';
  onChangeSearchField: (value: 'all' | 'orgName' | 'manager') => void;
  // 페이지네이션
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  // 데이터
  organizations: Organization[];
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
  total: number;
  isLoading: boolean;
  error: Error | null;
};

export function useOrganization(): UseOrganizationResult {
  // 필터 상태
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [division, setDivision] = useState<DivisionType>('all');
  const [filters, setFilters] = useState<OrganizationFilters>({
    startDate: null,
    endDate: null,
    searchValue: '',
  });
  const [searchField, setSearchField] = useState<'all' | 'orgName' | 'manager'>('all');
  // 페이지네이션 (API는 1-based)
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // API 파라미터 구성
  const apiParams = useMemo(() => {
    const params: any = {
      page,
      pageSize: rowsPerPage,
    };

    // 상태 필터
    if (tab === 'active') {
      params.status = 'active';
    } else if (tab === 'inactive') {
      params.status = 'inactive';
    }

    // 조직 구분 필터 (division을 companyType으로 변환)
    if (division !== 'all') {
      const divisionToCompanyType: Record<DivisionType, string> = {
        all: '',
        operator: 'OPERATOR',
        member: 'MEMBER',
        distributor: 'DISTRIBUTOR',
        agency: 'AGENCY',
        dealer: 'DEALER',
        nonmember: 'NON_MEMBER',
      };
      params.companyType = divisionToCompanyType[division];
    }

    // 날짜 필터
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    // 검색 필터
    if (filters.searchValue) {
      if (searchField === 'orgName') {
        params.searchKey = 'companyName';
        params.searchValue = filters.searchValue;
      } else if (searchField === 'manager') {
        params.searchKey = 'manager';
        params.searchValue = filters.searchValue;
      } else {
        // 전체 검색은 API에서 지원하지 않을 수 있으므로 companyName으로 처리
        params.searchKey = 'companyName';
        params.searchValue = filters.searchValue;
      }
    }

    return params;
  }, [tab, division, filters, searchField, page, rowsPerPage]);

  // API 호출
  const {
    data: organizationsData,
    isLoading,
    error: organizationsError,
  } = useOrganizations(apiParams);

  // 데이터 변환 (axios interceptor가 body를 flatten하므로 직접 접근)
  const organizations = useMemo(() => {
    if (!organizationsData?.header?.isSuccess) {
      if (import.meta.env.DEV && organizationsData) {
        console.warn('⚠️ Organizations: Invalid response structure', organizationsData);
      }
      return [];
    }
    // axios interceptor가 body를 flatten하므로 companyList는 최상위에 있음
    const orgs = (organizationsData as any).companyList;
    if (!Array.isArray(orgs)) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Organizations: companyList is not an array', organizationsData);
      }
      return [];
    }
    // isActive를 status로 변환만 수행 (필드명 매핑 제거)
    return orgs.map((org: any) => ({
      ...org,
      status: org.isActive === 1 ? 'active' : 'inactive',
    }));
  }, [organizationsData]);

  // 카운트 계산
  const counts = useMemo(() => {
    // axios interceptor가 body를 flatten하므로 totalCount는 최상위에 있음
    const total = (organizationsData as any)?.totalCount || organizations.length;
    const active = organizations.filter((org: Organization) => org.status === 'active').length;
    const inactive = organizations.filter((org: Organization) => org.status === 'inactive').length;
    return {
      all: total || active + inactive,
      active,
      inactive,
    };
  }, [organizations, organizationsData]);

  const total = (organizationsData as any)?.totalCount || organizations.length;

  // 디버깅
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('📊 Organizations Data:', organizationsData);
      console.log('📊 Organizations:', organizations);
      console.log('📊 Total:', total);
    }
  }, [organizationsData, organizations, total]);

  // 에러 처리
  useEffect(() => {
    if (organizationsError) {
      console.error('❌ Organizations API Error:', organizationsError);
    }
  }, [organizationsError]);

  // 핸들러들
  const onChangeTab = useCallback((newTab: 'all' | 'active' | 'inactive') => {
    setTab(newTab);
    setPage(1);
  }, []);

  const onChangeDivision = useCallback((newDivision: DivisionType) => {
    setDivision(newDivision);
    setPage(1);
  }, []);

  const onChangeStartDate = useCallback((date: Dayjs | null) => {
    setFilters((prev) => ({
      ...prev,
      startDate: date ? date.format('YYYY-MM-DD') : null,
    }));
    setPage(1);
  }, []);

  const onChangeEndDate = useCallback((date: Dayjs | null) => {
    setFilters((prev) => ({
      ...prev,
      endDate: date ? date.format('YYYY-MM-DD') : null,
    }));
    setPage(1);
  }, []);

  const onChangeSearchField = useCallback((field: 'all' | 'orgName' | 'manager') => {
    setSearchField(field);
    setPage(1);
  }, []);

  const onChangeSearchValue = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchValue: value }));
    setPage(1);
  }, []);

  const onChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  }, []);

  return {
    tab,
    onChangeTab,
    division,
    onChangeDivision,
    filters,
    onChangeStartDate,
    onChangeEndDate,
    onChangeSearchValue,
    searchField,
    onChangeSearchField,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    organizations,
    counts,
    total,
    isLoading,
    error: organizationsError as Error | null,
  };
}
