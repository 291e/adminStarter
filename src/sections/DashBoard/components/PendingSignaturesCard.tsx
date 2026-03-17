import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import type { DocumentSignature } from 'src/services/dashboard/dashboard.types';
import { fDateTime } from 'src/utils/format-time';
import EmptyPendingSignatures from './EmptyPendingSignatures';

// ----------------------------------------------------------------------

type Props = {
  rows: DocumentSignature[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDocument?: (id: string, isSafetySystemDocumentIdx?: boolean) => void;
};

export default function PendingSignaturesCard({
  rows,
  page,
  totalPages,
  onPageChange,
  onViewDocument,
}: Props) {
  const hasRows = rows.length > 0;

  const resolveDocumentTarget = (row: DocumentSignature) => {
    let documentId: string | null = null;
    let isSafetySystemDocumentIdx = false;

    const sharedDocumentIdx = (row as any).sharedDocumentIdx;
    if (sharedDocumentIdx !== null && sharedDocumentIdx !== undefined) {
      documentId = String(sharedDocumentIdx);
      isSafetySystemDocumentIdx = false;
    } else if ((row as any).safetySystemDocumentInformation?.safetySystemDocumentIdx) {
      const safetySystemDocumentIdx = (row as any).safetySystemDocumentInformation
        .safetySystemDocumentIdx;
      documentId = String(safetySystemDocumentIdx);
      isSafetySystemDocumentIdx = true;
    } else if (row.id) {
      documentId = String(row.id);
      isSafetySystemDocumentIdx = false;
    }

    return { documentId, isSafetySystemDocumentIdx };
  };

  const handleViewDocument = (row: DocumentSignature) => {
    const { documentId, isSafetySystemDocumentIdx } = resolveDocumentTarget(row);
    if (documentId) {
      const idx = Number(documentId);
      if (!Number.isNaN(idx) && idx > 0) {
        onViewDocument?.(documentId, isSafetySystemDocumentIdx);
        return;
      }
      console.warn('⚠️ Invalid document ID:', documentId, row);
      return;
    }
    console.warn('⚠️ Document ID not found:', row);
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
        height: '100%',
        width: '100%',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
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
          서명 대기 문서
        </Typography>
      </Box>

      {/* 테이블 */}
      {hasRows ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          {rows.map((row, index) => {
            // 고유한 key 생성 (id가 없거나 중복될 수 있으므로 index도 포함)
            const rowKey = row.id || `document-${index}`;
            return (
              <Box
                key={rowKey}
                onClick={() => handleViewDocument(row)}
                sx={{
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'grey.100',
                  borderRadius: 1.5,
                  p: 1,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  cursor: onViewDocument ? 'pointer' : 'default',
                  '&:hover': onViewDocument
                    ? {
                        bgcolor: 'action.hover',
                      }
                    : {},
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    minHeight: 56,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontSize: { xs: 13, sm: 14 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                      maxWidth: 140,
                    }}
                  >
                    {row.documentName || row.documentId || '문서명 없음'}
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
                  <Typography
                    variant="body2"
                    sx={{ maxWidth: '100%', fontSize: { xs: 13, sm: 14 } }}
                  >
                    {row.targetMemberName}
                  </Typography>
                  <Box sx={{ width: { xs: '100%', sm: 100 } }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                      {row.requestedAt ? fDateTime(row.requestedAt, 'YYYY-MM-DD') : ''}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: { xs: 11, sm: 12 } }}
                    >
                      {row.requestedAt ? fDateTime(row.requestedAt, 'HH:mm:ss') : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <EmptyPendingSignatures sx={{ py: { xs: 3, sm: 4 } }} />
      )}

      {/* 페이지네이션 */}
      {hasRows && (
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
                opacity: page === 1 ? 0.48 : 1,
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
              <Typography variant="body2">{totalPages}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                opacity: page === totalPages ? 0.48 : 1,
              }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" width={20} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
