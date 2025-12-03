import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type ApprovalType = 'writer' | 'approver' | 'reviewer';

export type ApprovalSignature = {
  type: ApprovalType;
  name?: string;
  date?: string;
  signature?: string; // 서명 이미지 또는 base64
  memberIdx?: number; // 대상자 memberIdx (API 연동용)
  documentApprovalIdx?: number; // 결재 등록 ID (이미 등록된 경우)
};

type Props = {
  signatures: ApprovalSignature[];
  approvalStep?: number; // 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인
  onAddSignature: () => void;
  onRemoveSignature: (type: ApprovalType) => void;
  onSelectMember: (type: ApprovalType) => void;
  onRequestSignature: (type: ApprovalType) => void;
};

const TYPE_LABEL: Record<ApprovalType, string> = {
  writer: '작성',
  reviewer: '검토',
  approver: '승인',
};

export default function EditApprovalSection({
  signatures,
  approvalStep = 1,
  onAddSignature,
  onRemoveSignature,
  onSelectMember,
  onRequestSignature,
}: Props) {
  // approvalStep에 따라 표시할 타입 결정
  // approvalStep 1: 승인만
  // approvalStep 2: 작성 + 승인
  // approvalStep 3: 작성 + 검토 + 승인
  const displayTypes = useMemo(() => {
    const types: ApprovalType[] = [];
    if (approvalStep >= 2) {
      // 작성자 추가 (approvalStep 2 이상)
      types.push('writer');
    }
    if (approvalStep >= 3) {
      // 검토자 추가 (approvalStep 3)
      types.push('reviewer');
    }
    // 승인자 추가 (approvalStep 1 이상)
    if (approvalStep >= 1) {
      types.push('approver');
    }
    return types;
  }, [approvalStep]);

  const columnCount = displayTypes.length;
  // approvalStep에 따라 추가 가능한 서명 결정
  // approvalStep이 3이 아니면 무조건 서명 추가 버튼 표시
  // approvalStep이 3이면 모든 타입이 있을 때만 버튼 숨김
  const canAddSignature = useMemo(() => {
    if (approvalStep !== 3) {
      // approvalStep이 3이 아니면 무조건 표시
      return true;
    }
    // approvalStep이 3이면 모든 타입이 있는지 확인
    const getSignature = (type: ApprovalType) => signatures.find((item) => item.type === type);
    return !getSignature('writer') || !getSignature('reviewer') || !getSignature('approver');
  }, [signatures, approvalStep]);
  const tableWidth = 47 + columnCount * 98;
  const hasAllSteps = columnCount === 3;

  const renderHeaderLabel = (type: ApprovalType) => {
    if (columnCount === 1) {
      return TYPE_LABEL.approver;
    }
    return TYPE_LABEL[type];
  };

  const getSignature = (type: ApprovalType) => signatures.find((item) => item.type === type);

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (
      url.startsWith('data:image/png;base64,data/admin/') ||
      url.startsWith('data:image/png;base64,/data/admin/')
    ) {
      // base64 접두사를 제거하고 URL로 처리
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) {
      return url;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    // data/admin/로 시작하는 경우도 처리
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  const renderSignatureArea = (type: ApprovalType) => {
    const signature = getSignature(type);
    if (signature?.signature) {
      const imageUrl = getFullFileUrl(signature.signature);
      if (!imageUrl) return null;

      return (
        <Box
          component="button"
          type="button"
          onClick={() => onRequestSignature(type)}
          sx={{
            border: 0,
            p: 0,
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt={`${TYPE_LABEL[type]} 서명`}
            sx={{
              width: 90,
              height: 40,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>
      );
    }
    // 서명이 없을 때: 대상자가 선택되어 있으면 서명 등록, 없으면 대상자 선택
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          if (signature?.name) {
            // 대상자가 선택되어 있으면 서명 등록 모달 열기
            onRequestSignature(type);
          } else {
            // 대상자가 없으면 대상자 선택 모달 열기
            onSelectMember(type);
          }
        }}
        disabled={!!signature?.signature}
        sx={{
          width: 90,
          height: 40,
          borderRadius: 1,
          fontSize: 14,
          fontWeight: 600,
          color: signature?.name ? 'text.primary' : 'text.secondary',
          borderColor: 'rgba(145,158,171,0.2)',
          '&:hover': { borderColor: signature?.name ? 'text.primary' : 'rgba(145,158,171,0.2)' },
          '&:disabled': {
            borderColor: 'rgba(145,158,171,0.2)',
            color: 'text.secondary',
            cursor: 'not-allowed',
          },
        }}
      >
        {signature?.name ? '서명등록' : '대상자 선택'}
      </Button>
    );
  };

  const renderInfoArea = (type: ApprovalType) => {
    const signature = getSignature(type);
    if (!signature?.name) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSelectMember(type)}
          sx={{
            width: 90,
            height: 30,
            borderRadius: 1,
            fontSize: 13,
            fontWeight: 600,
            color: 'text.primary',
            borderColor: 'rgba(145,158,171,0.2)',
            '&:hover': { borderColor: 'text.primary' },
          }}
        >
          대상자 선택
        </Button>
      );
    }

    return (
      <Box
        component="button"
        type="button"
        onClick={() => onSelectMember(type)}
        disabled={!!signature?.signature}
        sx={{
          border: '1px solid',
          borderColor: 'rgba(145,158,171,0.2)',
          borderRadius: 1,
          px: 1.25,
          py: 0.25,
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          width: '100%',
          background: 'none',
          cursor: signature?.signature ? 'not-allowed' : 'pointer',
          '&:hover': {
            borderColor: signature?.signature ? 'rgba(145,158,171,0.2)' : 'text.primary',
          },
          '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.6,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '20px',
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            {signature.name}
          </Typography>
          {signature.date && (
            <Typography
              sx={{
                fontSize: 12,
                lineHeight: '18px',
                color: 'text.secondary',
              }}
            >
              {signature.date}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderEmptyState = () => (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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
              rowSpan={3}
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
            <td style={{ width: 100, height: 32 }}>{TYPE_LABEL.writer}</td>
          </tr>
          <tr>
            <td style={{ width: 100, height: 68 }}>{renderSignatureArea('writer')}</td>
          </tr>
          <tr>
            <td style={{ width: 100, height: 58, fontWeight: 400 }}>{renderInfoArea('writer')}</td>
          </tr>
        </tbody>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={() => onSelectMember('writer')}
        sx={{
          bgcolor: '#2563eb',
          color: '#fff',
          minHeight: 30,
          fontSize: 13,
          fontWeight: 700,
          borderRadius: 1,
          px: 2,
        }}
      >
        대상자 선택
      </Button>
      {canAddSignature && (
        <Button
          variant="contained"
          size="small"
          onClick={onAddSignature}
          sx={{
            bgcolor: '#078dee',
            minHeight: 28,
            fontSize: 12,
            fontWeight: 500,
            px: 1.5,
            borderRadius: 0.5,
          }}
        >
          서명 추가
        </Button>
      )}
    </Box>
  );

  if (!columnCount) {
    return renderEmptyState();
  }

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
                height: hasAllSteps ? 170 : 158,
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
            {displayTypes.map((type) => (
              <td key={`header-${type}`} style={{ width: 98, height: 37 }}>
                {renderHeaderLabel(type)}
              </td>
            ))}
          </tr>
          <tr>
            {displayTypes.map((type) => (
              <td key={`signature-${type}`} style={{ width: 98, height: 73 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {renderSignatureArea(type)}
                </Box>
              </td>
            ))}
          </tr>
          <tr>
            {displayTypes.map((type) => (
              <td key={`info-${type}`} style={{ width: 98, height: 58, fontWeight: 400 }}>
                {renderInfoArea(type)}
              </td>
            ))}
          </tr>
        </tbody>
      </Box>
      {canAddSignature && (
        <Button
          variant="contained"
          size="small"
          onClick={onAddSignature}
          sx={{
            bgcolor: '#078dee',
            minHeight: 28,
            fontSize: 12,
            fontWeight: 500,
            px: 1,
            borderRadius: 0.5,
          }}
        >
          서명 추가
        </Button>
      )}
    </Box>
  );
}
