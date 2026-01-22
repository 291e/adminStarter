import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import type { Table2400TBMData } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = { data?: Table2400TBMData };

const defaultData: Table2400TBMData = {
  inspectionRows: [
    { inspectionContent: '기계·가구·설비 이상 유무', result: '정상' },
    { inspectionContent: '기계·가구·설비 방호장치', result: '정상' },
    { inspectionContent: '근로자 건강 상태', result: '정상' },
    { inspectionContent: '개인보호구 착용 여부', result: '착용' },
    { inspectionContent: '작업절차 및 방법 숙지', result: '숙지' },
    { inspectionContent: '작업장 정리/정돈, 통보 확보', result: '완료' },
    { inspectionContent: '점검결과 조치사항', result: '조치 완료' },
  ],
  educationContent:
    '아크릴로니트릴의 특성과 위험성, 작업 시 주의사항, 개인보호구 착용법, 비상대응 절차 등에 대한 안전 교육 내용입니다.',
  educationVideoRows: [
    {
      participant: { name: '김안전', department: '생산 1팀' },
      educationVideo: '아크릴로니트릴_10분작업안전',
      signature: 'signature-placeholder',
    },
  ],
};

export default function RiskTable_2_4_2400_TBM({ data = defaultData }: Props) {
  // 점검내용 빈 행 필터링
  const filteredInspectionRows = data.inspectionRows.filter(
    (row) => row.inspectionContent?.trim() || row.result?.trim()
  );

  // 교육영상 빈 행 필터링 (참여자가 있거나 영상이 있는 경우)
  const filteredEducationVideoRows = data.educationVideoRows.filter(
    (row) => row.educationVideo?.trim() || row.participant
  );

  const [signatureImages, setSignatureImages] = useState<Record<string, string>>({});

  const getFullFileUrl = useCallback((url: string | null | undefined): string | null => {
    if (!url) return null;
    const trimmedUrl = url.trim();

    if (
      trimmedUrl.startsWith('data:image/png;base64,data/admin/') ||
      trimmedUrl.startsWith('data:image/png;base64,/data/admin/')
    ) {
      const cleanUrl = trimmedUrl.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    if (trimmedUrl.startsWith('data:image/') && !trimmedUrl.includes('data/admin/')) {
      return trimmedUrl;
    }

    const isLikelyBase64 =
      trimmedUrl.length > 80 &&
      !trimmedUrl.startsWith('data/admin/') &&
      !trimmedUrl.startsWith('/data/') &&
      !trimmedUrl.startsWith('/') &&
      /^[A-Za-z0-9+/=_-]+$/.test(trimmedUrl);

    if (isLikelyBase64) {
      return `data:image/png;base64,${trimmedUrl}`;
    }

    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `${baseUrl}${path}`;
  }, []);

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

  const signatureValues = useMemo(
    () =>
      filteredEducationVideoRows
        .map((row) => row.signature)
        .filter((value): value is string => !!value && value !== 'SIGNED'),
    [filteredEducationVideoRows]
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
    if (!signature || signature === 'SIGNED') return null;
    return signatureImages[signature] || getFullFileUrl(signature);
  };

  const tableStyle = {
    width: '100%',
    border: '2px solid',
    borderColor: 'text.primary',
    borderCollapse: 'collapse',
    '& th, & td': {
      border: '1px solid',
      borderColor: 'text.primary',
      padding: '4px',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    '& th': {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '22px',
    },
    '& td': {
      fontSize: 14,
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 점검내용 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ flex: 1 }}>점검내용</th>
              <th style={{ flex: 1 }}>결과</th>
            </tr>
          </thead>
          <tbody>
            {filteredInspectionRows.map((row, index) => (
              <tr key={index} style={{ height: 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.inspectionContent || ''}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>{row.result || ''}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {/* 교육내용 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            border: '2px solid',
            borderColor: 'text.primary',
            borderCollapse: 'collapse',
            '& th, & td': {
              border: '1px solid',
              borderColor: 'text.primary',
              padding: '4px',
              textAlign: 'center',
              verticalAlign: 'middle',
            },
            '& th': {
              backgroundColor: 'grey.100',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
            },
            '& td': {
              fontSize: 14,
            },
          }}
        >
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: '100%' }}>교육내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 144, textAlign: 'left', verticalAlign: 'top' }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {data.educationContent || ''}
                </Typography>
              </td>
            </tr>
          </tbody>
        </Box>
      </Box>

      {/* 교육영상 테이블 */}
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: '30%' }}>대상자</th>
              <th style={{ width: '40%' }}>교육영상</th>
              <th style={{ width: '30%' }}>서명</th>
            </tr>
          </thead>
          <tbody>
            {filteredEducationVideoRows.map((row, index) => (
              <tr key={index} style={{ height: 48 }}>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.participant?.name || ''}
                  </Typography>
                </td>
                <td>
                  <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                    {row.educationVideo || ''}
                  </Typography>
                </td>
                <td>
                  {getSignatureSrc(row.signature) ? (
                    <Box
                      component="img"
                      src={getSignatureSrc(row.signature) || ''}
                      alt="서명"
                      crossOrigin="anonymous"
                      sx={{ maxHeight: 30, maxWidth: 90, objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.signature ? '서명 완료' : ''}
                    </Typography>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}
