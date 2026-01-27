import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { hexToRgba } from 'src/utils/color';
import type { SharedDocument } from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

type Props = {
  rows: SharedDocument[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onViewAll?: () => void;
  onDocumentClick?: (document: SharedDocument) => void;
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; variant: 'soft' }
> = {
  URGENT: {
    label: '긴급',
    color: 'error.main',
    bgColor: 'rgba(255, 86, 48, 0.16)',
    variant: 'soft',
  },
  IMPORTANT: {
    label: '중요',
    color: 'warning.main',
    bgColor: 'rgba(255, 171, 0, 0.16)',
    variant: 'soft',
  },
  REFERENCE: {
    label: '참고',
    color: '#2563E9',
    bgColor: 'rgba(37, 99, 233, 0.1)',
    variant: 'soft',
  },
  // 기본값 (null 또는 알 수 없는 priority)
  DEFAULT: {
    label: '참고',
    color: '#2563E9',
    bgColor: 'rgba(37, 99, 233, 0.1)',
    variant: 'soft',
  },
};

type SortField = 'priority' | 'createAt' | null;
type SortOrder = 'asc' | 'desc';

export default function SharedDocumentsCard({
  rows,
  page: propPage,
  totalPages: propTotalPages,
  onPageChange: propOnPageChange,
  onViewAll,
  onDocumentClick,
}: Props) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('createAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [internalPage, setInternalPage] = useState(1);

  // 외부에서 page를 제공하면 사용, 아니면 내부 상태 사용
  const page = propPage ?? internalPage;
  const onPageChange = propOnPageChange ?? setInternalPage;

  // 페이지당 표시할 항목 수
  const rowsPerPage = 5;

  // 비공개 문서 필터링 및 정렬
  const filteredAndSortedRows = useMemo(() => {
    // 1. 비공개 문서 필터링 (isPublic이 1이 아닌 모든 경우 제외)
    // SharedDocumentsCard에서는 공개 문서만 표시
    // rows는 이미 publicSharedDocuments로 필터링되어 전달되지만, 안전을 위해 다시 필터링
    const publicRows = rows.filter((row) => row.isPublic === 1);

    // 디버깅: 데이터 확인
    if (import.meta.env.DEV) {
      console.log('📊 SharedDocumentsCard 데이터:', {
        totalRows: rows.length,
        publicRows: publicRows.length,
        currentPage: page,
        rowsPerPage,
      });
    }

    // 2. 정렬
    let sorted = publicRows;
    if (sortField) {
      sorted = [...publicRows].sort((a, b) => {
        if (sortField === 'createAt') {
          // 등록일 정렬
          const dateA = a.createAt ? new Date(a.createAt).getTime() : 0;
          const dateB = b.createAt ? new Date(b.createAt).getTime() : 0;
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
    }

    // 3. 페이지네이션 적용
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = sorted.slice(start, end);

    // 디버깅: 페이지네이션 결과 확인
    if (import.meta.env.DEV) {
      console.log('📄 페이지네이션 결과:', {
        sortedLength: sorted.length,
        start,
        end,
        paginatedLength: paginated.length,
        totalPages: Math.ceil(sorted.length / rowsPerPage),
      });
    }

    return paginated;
  }, [rows, sortField, sortOrder, page, rowsPerPage]);

  // 전체 페이지 수 계산
  const calculatedTotalPages = useMemo(() => {
    const publicRows = rows.filter((row) => row.isPublic === 1);
    const total = Math.ceil(publicRows.length / rowsPerPage);

    // 디버깅: 전체 페이지 수 확인
    if (import.meta.env.DEV) {
      console.log('📑 전체 페이지 수:', {
        publicRowsCount: publicRows.length,
        rowsPerPage,
        totalPages: total,
      });
    }

    return total;
  }, [rows, rowsPerPage]);

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드 클릭 시 정렬 순서 토글
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드 클릭 시 해당 필드로 정렬 (기본값: desc)
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 정렬 아이콘 표시 함수
  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      // 현재 정렬 중인 필드: 활성화된 화살표
      return sortOrder === 'asc' ? 'eva:arrow-upward-fill' : 'eva:arrow-downward-fill';
    }
    return null;
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 2.5 },
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.25, sm: 1.5 },
        flex: 1,
        width: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 0 },
          minHeight: { xs: 60, sm: 80 },
          pl: { xs: 0, sm: 1.5 },
          pr: { xs: 0, sm: 2 },
          py: { xs: 0, sm: 3 },
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}
        >
          공유된 문서
        </Typography>
        <Button
          variant="outlined"
          size="small"
          color="info"
          onClick={() => navigate(paths.dashboard.sharedDocument.root)}
          sx={{
            minHeight: { xs: 32, sm: 36 },
            fontSize: { xs: 12, sm: 14 },
            fontWeight: 700,
            px: { xs: 1, sm: 1.5 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          전체 보기
        </Button>
      </Box>

      {/* 테이블 */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        {/* 테이블 헤더 */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: 'grey.50',
            minHeight: { xs: 48, sm: 56 },
            borderTopLeftRadius: 1.5,
            borderTopRightRadius: 1.5,
          }}
        >
          <Box
            sx={{
              width: { xs: 90, sm: 100 },
              minWidth: { xs: 70, sm: 80 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              중요도
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 120,
              display: 'flex',
              alignItems: 'center',
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              문서명
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 100, sm: 120 },
              minWidth: { xs: 100, sm: 120 },
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              문서 작성일
            </Typography>
          </Box>
          <Box
            onClick={() => handleSort('createAt')}
            sx={{
              width: { xs: 100, sm: 120 },
              minWidth: { xs: 100, sm: 120 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              p: { xs: 1.5, sm: 2 },
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              등록일
            </Typography>
            {getSortIcon('createAt') ? (
              <Iconify
                icon={getSortIcon('createAt') as any}
                width={18}
                sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
              />
            ) : (
              <Iconify
                icon="eva:arrow-downward-fill"
                width={18}
                sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}
              />
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              minWidth: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1.5, sm: 2 },
            }}
          />
        </Box>

        {/* 테이블 바디 */}
        <Box
          sx={{
            minHeight: { xs: 48 * rowsPerPage, sm: 56 * rowsPerPage }, // 5개 행의 최소 높이 유지
          }}
        >
          {filteredAndSortedRows.map((row) => {
            // priorityInformation에서 직접 정보 가져오기
            const priorityInfo = row.priorityInformation;
            const priorityLabel = priorityInfo?.labelType || '';

            // priorityInformation이 있으면 해당 정보 사용, 없으면 기본값
            let priorityConfig: { label: string; color: string; bgColor: string; variant: 'soft' };
            if (priorityInfo && priorityInfo.color) {
              // priorityInformation에서 직접 색상 정보 사용
              const colorHex = priorityInfo.color;
              // HEX 색상을 rgba로 변환 (투명도 0.16)
              const bgColor = hexToRgba(colorHex, 0.16);

              priorityConfig = {
                label: priorityInfo.labelType || '중요도',
                color: colorHex,
                bgColor,
                variant: 'soft',
              };
            } else {
              // priorityInformation이 없는 경우 PRIORITY_CONFIG 사용
              priorityConfig = PRIORITY_CONFIG[priorityLabel] || PRIORITY_CONFIG.DEFAULT;
            }

            return (
              <Box
                key={row.sharedDocumentIdx}
                onClick={() => onDocumentClick?.(row)}
                sx={{
                  display: 'flex',
                  borderBottom: '1px dashed',
                  borderColor: 'divider',
                  cursor: onDocumentClick ? 'pointer' : 'default',
                  '&:hover': onDocumentClick
                    ? {
                        bgcolor: 'action.hover',
                      }
                    : {},
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 90, sm: 100 },
                    minWidth: { xs: 70, sm: 80 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: { xs: 48, sm: 56 },
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Chip
                    label={priorityConfig.label}
                    size="small"
                    sx={{
                      height: { xs: 22, sm: 24 },
                      fontSize: { xs: 11, sm: 12 },
                      fontWeight: 700,
                      bgcolor: priorityConfig.bgColor,
                      color: priorityConfig.color,
                      variant: priorityConfig.variant,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: { xs: 48, sm: 56 },
                    p: { xs: 1.5, sm: 2 },
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: { xs: 13, sm: 14 },
                    }}
                  >
                    {row.documentName}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      width: 20,
                      height: 20,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Iconify icon="carbon:chevron-right" width={16} />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    width: { xs: 100, sm: 120 },
                    minWidth: { xs: 100, sm: 120 },
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: { xs: 48, sm: 56 },
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                    {row.documentWrittenAt
                      ? new Date(row.documentWrittenAt).toLocaleDateString('ko-KR')
                      : ''}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: { xs: 100, sm: 120 },
                    minWidth: { xs: 100, sm: 120 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: { xs: 48, sm: 56 },
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                    {row.createAt ? new Date(row.createAt).toLocaleDateString('ko-KR') : ''}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 페이지네이션 */}
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, alignItems: 'center', pt: 2 }}
      >
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'rgba(37, 99, 233, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563E9' }}>
              {page}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mx: 0.5 }}>
            /
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2">{propTotalPages ?? calculatedTotalPages}</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onPageChange(page + 1)}
            disabled={page === (propTotalPages ?? calculatedTotalPages)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
