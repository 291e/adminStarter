import { useMemo, useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import type { SafetySystemDocument } from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

type Props = {
  onAddSignature?: () => void;
  is2100Series?: boolean; // 2100번대 문서 여부
  riskId?: string; // 문서 ID
  currentDocument?: SafetySystemDocument; // 현재 문서 정보
};

export default function ApprovalSection({
  onAddSignature,
  is2100Series = false,
  riskId,
  currentDocument,
}: Props) {
  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const trimmedUrl = url.trim();
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (
      trimmedUrl.startsWith('data:image/png;base64,data/admin/') ||
      trimmedUrl.startsWith('data:image/png;base64,/data/admin/')
    ) {
      // base64 접두사를 제거하고 URL로 처리
      const cleanUrl = trimmedUrl.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if (trimmedUrl.startsWith('data:image/') && !trimmedUrl.includes('data/admin/')) {
      return trimmedUrl;
    }
    // base64 문자열인 경우 (data: 접두사 없이 base64만 있는 경우)
    const isLikelyBase64 =
      trimmedUrl.length > 80 &&
      !trimmedUrl.startsWith('data/admin/') &&
      !trimmedUrl.startsWith('/data/') &&
      !trimmedUrl.startsWith('/') &&
      /^[A-Za-z0-9+/=_-]+$/.test(trimmedUrl);
    if (isLikelyBase64) {
      return `data:image/png;base64,${trimmedUrl}`;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    // data/admin/로 시작하는 경우도 처리
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `${baseUrl}${path}`;
  };

  const [signatureImages, setSignatureImages] = useState<Record<string, string>>({});

  const loadSignatureImage = useCallback(
    async (signature: string): Promise<string> => {
      const normalized = getFullFileUrl(signature);
      if (!normalized) return signature;
      if (normalized.startsWith('data:image/')) return normalized;

      try {
        const response = await fetch(normalized, {
          mode: 'cors',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        return base64;
      } catch (error) {
        console.error('서명 이미지 로드 실패:', normalized, error);
        return normalized;
      }
    },
    [getFullFileUrl]
  );

  // approvalList에서 결재 정보 추출
  const approvalData = useMemo(() => {
    const approvalList =
      (currentDocument as any)?.approvalList || currentDocument?.signatureList || [];
    const approvalStep = currentDocument?.approvalStep || 0;

    const writer = approvalList.find((item: any) => item.approvalStep === 2);
    const reviewer = approvalList.find((item: any) => item.approvalStep === 3);
    const approver = approvalList.find((item: any) => item.approvalStep === 1);

    return {
      writer: writer
        ? {
            name: writer.memberName || '',
            date: writer.approvedAt
              ? dayjs(writer.approvedAt).format('YYYY-MM-DD')
              : writer.createAt
                ? dayjs(writer.createAt).format('YYYY-MM-DD')
                : '',
            signature: writer.signatureData,
          }
        : null,
      reviewer: reviewer
        ? {
            name: reviewer.memberName || '',
            date: reviewer.approvedAt
              ? dayjs(reviewer.approvedAt).format('YYYY-MM-DD')
              : reviewer.createAt
                ? dayjs(reviewer.createAt).format('YYYY-MM-DD')
                : '',
            signature: reviewer.signatureData,
          }
        : null,
      approver: approver
        ? {
            name: approver.memberName || '',
            date: approver.approvedAt
              ? dayjs(approver.approvedAt).format('YYYY-MM-DD')
              : approver.createAt
                ? dayjs(approver.createAt).format('YYYY-MM-DD')
                : '',
            signature: approver.signatureData,
          }
        : null,
      approvalStep,
    };
  }, [currentDocument]);

  const signatureValues = useMemo(
    () =>
      [approvalData.writer?.signature, approvalData.reviewer?.signature, approvalData.approver?.signature]
        .filter((value): value is string => !!value),
    [approvalData]
  );

  useEffect(() => {
    if (signatureValues.length === 0) return;

    let cancelled = false;

    const loadImages = async () => {
      const newImages: Record<string, string> = {};

      await Promise.all(
        signatureValues.map(async (signature) => {
          if (signatureImages[signature]) return;
          const base64 = await loadSignatureImage(signature);
          newImages[signature] = base64;
        })
      );

      if (!cancelled && Object.keys(newImages).length > 0) {
        setSignatureImages((prev) => ({ ...prev, ...newImages }));
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [signatureValues, signatureImages, loadSignatureImage]);

  const getSignatureSrc = (signature?: string | null) => {
    if (!signature) return null;
    return signatureImages[signature] || getFullFileUrl(signature);
  };

  // approvalStep에 따라 표시할 컬럼 결정 (Hooks는 조건부 return 전에 호출해야 함)
  const displayColumns = useMemo(() => {
    const columns: Array<'writer' | 'reviewer' | 'approver'> = [];
    if (approvalData.approvalStep >= 2) {
      columns.push('writer');
    }
    if (approvalData.approvalStep >= 3) {
      columns.push('reviewer');
    }
    if (approvalData.approvalStep >= 1) {
      columns.push('approver');
    }
    return columns;
  }, [approvalData.approvalStep]);

  const columnLabels: Record<'writer' | 'reviewer' | 'approver', string> = {
    writer: '작성',
    reviewer: '검토',
    approver: '승인',
  };

  // approvalStep이 0이면 결재 섹션 없음
  if (approvalData.approvalStep === 0) {
    return null;
  }

  // 2100번대는 피그마 디자인에 맞게 4개 컬럼 (결재, 작성, 검토, 승인)
  if (is2100Series) {
    const tableWidth = 47 + displayColumns.length * 100;
    const rowHeight = displayColumns.length === 3 ? 158 : displayColumns.length === 2 ? 126 : 94;
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          component="table"
          sx={{
            border: '2px solid',
            borderColor: 'text.primary',
            borderCollapse: 'collapse',
            width: tableWidth,
            tableLayout: 'fixed',
            '& td': {
              border: '1px solid',
              borderColor: 'text.primary',
              padding: 0,
              verticalAlign: 'middle',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '24px',
            },
          }}
        >
          <tbody>
            <tr>
              <td
                rowSpan={3}
                style={{
                  width: 47,
                  height: rowHeight,
                  borderRight: '1px solid',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '24px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  결
                  <br />재
                </Typography>
              </td>
              {displayColumns.map((col) => (
                <td
                  key={`header-${col}`}
                  style={{ width: 100, height: 32, fontSize: 16, fontWeight: 600 }}
                >
                  {columnLabels[col]}
                </td>
              ))}
            </tr>
            <tr>
              {displayColumns.map((col) => (
                <td key={`signature-${col}`} style={{ width: 100, height: 68 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    {approvalData[col]?.signature ? (
                      <Box
                        component="img"
                        src={getSignatureSrc(approvalData[col]?.signature) || ''}
                        alt={`${columnLabels[col]} 서명`}
                        sx={{
                          maxWidth: 90,
                          maxHeight: 40,
                          objectFit: 'contain',
                          filter: 'contrast(1.2) brightness(0.9)',
                          opacity: 1,
                        }}
                      />
                    ) : null}
                  </Box>
                </td>
              ))}
            </tr>
            <tr>
              {displayColumns.map((col) => (
                <td
                  key={`info-${col}`}
                  style={{ width: 100, height: 58, fontSize: 16, fontWeight: 400 }}
                >
                  <Typography
                    component="div"
                    sx={{
                      fontSize: 16,
                      fontWeight: 400,
                      lineHeight: '24px',
                      textAlign: 'center',
                    }}
                  >
                    {approvalData[col]?.name || ''}
                    {approvalData[col]?.signature && approvalData[col]?.date && (
                      <>
                        <br />
                        {approvalData[col].date}
                      </>
                    )}
                  </Typography>
                </td>
              ))}
            </tr>
          </tbody>
        </Box>
        {onAddSignature && (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              // TODO: TanStack Query Hook(useMutation)으로 서명 추가
              // const mutation = useMutation({
              //   mutationFn: (signatureData: Risk2200SignatureParams) => addRisk2200Signature(signatureData),
              //   onSuccess: () => {
              //     queryClient.invalidateQueries({ queryKey: ['risk2200ApprovalInfo'] });
              //   },
              // });
              // mutation.mutate({ riskId, signatureType: 'writer' });
              onAddSignature();
            }}
            sx={{
              bgcolor: '#078dee',
              minHeight: 28,
              fontSize: 12,
              fontWeight: 500,
              px: 1,
              py: 0.875,
              borderRadius: 0.5,
            }}
          >
            서명 추가
          </Button>
        )}
      </Box>
    );
  }

  // 기본 레이아웃 (2200번대 등) - approvalStep 1일 때만 사용 (승인만)
  // approvalStep 2나 3일 때는 2100번대 레이아웃처럼 표시
  if (approvalData.approvalStep === 1 && !is2100Series) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: 218 }}>
        <Box
          component="table"
          sx={{
            border: '2px solid',
            borderColor: 'text.primary',
            borderCollapse: 'collapse',
            width: 147,
            tableLayout: 'fixed',
            '& td': {
              border: '1px solid',
              borderColor: 'text.primary',
              padding: 0,
              verticalAlign: 'middle',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '24px',
            },
          }}
        >
          <tbody>
            <tr>
              <td
                rowSpan={2}
                style={{
                  width: 47,
                  height: 100,
                  borderRight: '1px solid',
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '24px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  결
                  <br />재
                </Typography>
              </td>
              <td
                style={{
                  width: 100,
                  height: 32,
                }}
              >
                승 인
              </td>
            </tr>
            <tr>
              <td
                style={{
                  width: 100,
                  height: 68,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {approvalData.approver?.signature ? (
                    <Box
                      component="img"
                      src={getSignatureSrc(approvalData.approver.signature) || ''}
                      alt="승인자 서명"
                      sx={{
                        maxWidth: 90,
                        maxHeight: 40,
                        objectFit: 'contain',
                        filter: 'contrast(1.2) brightness(0.9)',
                        opacity: 1,
                      }}
                    />
                  ) : null}
                </Box>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  width: 47,
                  height: 32,
                  borderRight: '1px solid',
                }}
              >
                일자
              </td>
              <td
                style={{
                  width: 100,
                  height: 32,
                  fontWeight: 400,
                }}
              >
                {approvalData.approver?.signature && approvalData.approver?.date
                  ? dayjs(approvalData.approver.date).format("'YY. M. D")
                  : ''}
              </td>
            </tr>
          </tbody>
        </Box>
        {onAddSignature && (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              onAddSignature();
            }}
            sx={{
              bgcolor: '#078dee',
              minHeight: 28,
              fontSize: 12,
              fontWeight: 500,
              px: 1,
              py: 0.875,
              borderRadius: 0.5,
            }}
          >
            서명 추가
          </Button>
        )}
      </Box>
    );
  }

  // approvalStep 2나 3일 때는 2100번대 레이아웃처럼 표시 (기본 레이아웃이 아닌 경우)
  const tableWidth = 47 + displayColumns.length * 100;
  const rowHeight = displayColumns.length === 3 ? 158 : displayColumns.length === 2 ? 126 : 94;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Box
        component="table"
        sx={{
          border: '2px solid',
          borderColor: 'text.primary',
          borderCollapse: 'collapse',
          width: tableWidth,
          tableLayout: 'fixed',
          '& td': {
            border: '1px solid',
            borderColor: 'text.primary',
            padding: 0,
            verticalAlign: 'middle',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '24px',
          },
        }}
      >
        <tbody>
          <tr>
            <td
              rowSpan={3}
              style={{
                width: 47,
                height: rowHeight,
                borderRight: '1px solid',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '24px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                결
                <br />재
              </Typography>
            </td>
            {displayColumns.map((col) => (
              <td
                key={`header-${col}`}
                style={{ width: 100, height: 32, fontSize: 16, fontWeight: 600 }}
              >
                {columnLabels[col]}
              </td>
            ))}
          </tr>
          <tr>
            {displayColumns.map((col) => (
              <td key={`signature-${col}`} style={{ width: 100, height: 68 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {approvalData[col]?.signature ? (
                    <Box
                      component="img"
                      src={getSignatureSrc(approvalData[col]?.signature) || ''}
                      alt={`${columnLabels[col]} 서명`}
                      sx={{
                        maxWidth: 90,
                        maxHeight: 40,
                        objectFit: 'contain',
                      }}
                    />
                  ) : null}
                </Box>
              </td>
            ))}
          </tr>
          <tr>
            {displayColumns.map((col) => (
              <td
                key={`info-${col}`}
                style={{ width: 100, height: 58, fontSize: 16, fontWeight: 400 }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  {approvalData[col]?.name || ''}
                  {approvalData[col]?.signature && approvalData[col]?.date && (
                    <>
                      <br />
                      {approvalData[col].date}
                    </>
                  )}
                </Typography>
              </td>
            ))}
          </tr>
        </tbody>
      </Box>
      {onAddSignature && (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            onAddSignature();
          }}
          sx={{
            bgcolor: '#078dee',
            minHeight: 28,
            fontSize: 12,
            fontWeight: 500,
            px: 1,
            py: 0.875,
            borderRadius: 0.5,
          }}
        >
          서명 추가
        </Button>
      )}
    </Box>
  );
}
