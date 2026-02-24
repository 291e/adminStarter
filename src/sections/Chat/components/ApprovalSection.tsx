import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import SelectApprovalMemberModal from './SelectApprovalMemberModal';
import SignatureModal from 'src/sections/PDF/Risk_2200/edit/components/SignatureModal';
import { uploadFile } from 'src/services/system/system.service';

// ----------------------------------------------------------------------

export type ApprovalType = 'writer' | 'approver' | 'reviewer';

export type ApprovalSignature = {
  type: ApprovalType;
  name?: string;
  date?: string;
  signature?: string;
  memberIdx?: number;
  documentApprovalIdx?: number;
};

type Props = {
  signatures: ApprovalSignature[];
  approvalStep?: number;
  onUpdateSignature: (
    type: ApprovalType,
    memberIdx: number,
    signatureData?: string,
    documentApprovalIdx?: number
  ) => void;
  safetySystemDocumentIdx?: number;
};

const COLUMN_ORDER: ApprovalType[] = ['writer', 'reviewer', 'approver'];
const TYPE_LABEL: Record<ApprovalType, string> = {
  writer: '작성',
  reviewer: '검토',
  approver: '승인',
};

export default function ApprovalSection({
  signatures,
  approvalStep = 0,
  onUpdateSignature,
  safetySystemDocumentIdx,
}: Props) {
  const [selectedType, setSelectedType] = useState<ApprovalType | null>(null);
  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  if (approvalStep === 0 || signatures.length === 0) {
    return null;
  }

  const displayTypes = COLUMN_ORDER.filter((type) => signatures.some((sig) => sig.type === type));
  const columnCount = displayTypes.length;
  const tableWidth = 47 + columnCount * 98;
  const hasAllSteps = columnCount === 3;

  const renderHeaderLabel = (type: ApprovalType) => {
    if (columnCount === 1) {
      return TYPE_LABEL.approver;
    }
    return TYPE_LABEL[type];
  };

  const handleSelectMember = (type: ApprovalType) => {
    setSelectedType(type);
    setMemberSelectModalOpen(true);
  };

  const handleMemberSelected = (memberIdx: number, memberName: string) => {
    if (!selectedType) return;

    // 먼저 멤버 지정
    onUpdateSignature(selectedType, memberIdx);
    setMemberSelectModalOpen(false);

    // 그 다음 서명 모달 열기
    setSignatureModalOpen(true);
  };

  const handleSignatureConfirmed = async (signatureDataUrl: string) => {
    if (!selectedType) return;

    const signature = signatures.find((sig) => sig.type === selectedType);
    if (!signature?.memberIdx) {
      setSignatureModalOpen(false);
      setSelectedType(null);
      return;
    }

    try {
      // base64 데이터를 File 객체로 변환
      const base64Data = signatureDataUrl.includes(',')
        ? signatureDataUrl.split(',')[1]
        : signatureDataUrl.replace(/^data:image\/png;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const file = new File([blob], `signature_${selectedType}_${Date.now()}.png`, {
        type: 'image/png',
      });

      // 파일 업로드 API 호출
      const uploadResponse = await uploadFile({ files: [file] });
      // axios 인터셉터에서 평탄화되므로 직접 접근
      // 실제 응답 구조: { files: [{ fileUrl: string, ... }], header: {...} }
      const uploadedFiles = (uploadResponse as any).files || [];
      const signatureUrl = uploadedFiles[0]?.fileUrl || (uploadResponse as any).fileUrls?.[0];

      if (!signatureUrl) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      // 서명 등록 API 호출 (업로드된 URL 전송)
      onUpdateSignature(
        selectedType,
        signature.memberIdx,
        signatureUrl,
        signature.documentApprovalIdx
      );
    } catch (error) {
      console.error('서명 업로드 실패:', error);
      // 에러 발생 시에도 모달은 닫기
    } finally {
      setSignatureModalOpen(false);
      setSelectedType(null);
    }
  };

  const handleSignatureClick = (type: ApprovalType) => {
    const signature = signatures.find((sig) => sig.type === type);
    if (!signature?.name) {
      // 미지정이면 먼저 멤버 선택
      handleSelectMember(type);
    } else if (!signature?.signature) {
      // 미등록이면 서명 모달 열기
      setSelectedType(type);
      setSignatureModalOpen(true);
    }
  };

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const trimmedUrl = url.trim();
    if (!trimmedUrl || trimmedUrl === 'SIGNED') return null;
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
    // base64 문자열인 경우 (data URL이 없는 경우)
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

  const renderSignatureArea = (type: ApprovalType) => {
    const signature = signatures.find((sig) => sig.type === type);
    if (signature?.signature) {
      const imageUrl = getFullFileUrl(signature.signature);
      if (!imageUrl) return null;

      return (
        <Box
          component="img"
          src={imageUrl}
          alt={`${TYPE_LABEL[type]} 서명`}
          sx={{
            width: 90,
            height: 40,
            objectFit: 'contain',
            display: 'block',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={() => handleSignatureClick(type)}
        />
      );
    }
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleSignatureClick(type)}
        disabled={!signature?.name}
        sx={{
          width: 90,
          height: 40,
          borderRadius: 1,
          fontSize: 14,
          fontWeight: 600,
          color: signature?.name ? 'text.primary' : 'text.secondary',
          borderColor: 'rgba(145,158,171,0.2)',
          '&:hover': { borderColor: 'text.primary' },
          '&:disabled': {
            borderColor: 'rgba(145,158,171,0.2)',
            color: 'text.secondary',
          },
        }}
      >
        {signature?.name ? '서명등록' : '미등록'}
      </Button>
    );
  };

  const renderInfoArea = (type: ApprovalType) => {
    const signature = signatures.find((sig) => sig.type === type);
    if (!signature?.name) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelectMember(type)}
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
        sx={{
          border: '1px solid',
          borderColor: 'rgba(145,158,171,0.2)',
          borderRadius: 1,
          px: 1.25,
          py: 0.25,
          minHeight: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 90,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
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
              textAlign: 'center',
            }}
          >
            {signature.date}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <>
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
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>{renderInfoArea(type)}</Box>
              </td>
            ))}
          </tr>
        </tbody>
      </Box>

      {/* 멤버 선택 모달 */}
      {selectedType && (
        <SelectApprovalMemberModal
          open={memberSelectModalOpen}
          onClose={() => {
            setMemberSelectModalOpen(false);
            setSelectedType(null);
          }}
          onConfirm={handleMemberSelected}
          approvalType={selectedType}
        />
      )}

      {/* 서명 모달 */}
      {selectedType && (
        <SignatureModal
          open={signatureModalOpen}
          onClose={() => {
            setSignatureModalOpen(false);
            setSelectedType(null);
          }}
          onConfirm={handleSignatureConfirmed}
          targetLabel={selectedType ? TYPE_LABEL[selectedType] : '결재자'}
          initialSignature={
            selectedType
              ? signatures.find((sig) => sig.type === selectedType)?.signature
              : undefined
          }
        />
      )}
    </>
  );
}
