import type { Theme, SxProps } from '@mui/material/styles';
import { useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getTableDataByDocument,
  getItem,
  type SafetySystem,
  type SafetySystemItem,
} from 'src/_mock/_safety-system';

import DetailHeader from './components/Header';
import DocumentHeader from './components/DocumentHeader';
import { tableRegistry, type TableComponent } from './tables';
import FooterButtons from './components/FooterButtons';
import { generatePDF } from './utils/pdf-utils';
import { getRiskAssessmentTableData } from './data/table-data';
import type { DefaultTableRow } from './tables/Default';

// ----------------------------------------------------------------------

type Props = {
  riskId?: string;
  safetyId?: string;
  system?: SafetySystem;
  item?: SafetySystemItem;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function Risk_2200View({
  riskId,
  safetyId,
  system,
  item,
  title = 'Blank',
  description,
  sx,
}: Props) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(currentDate.getDate()).padStart(2, '0')} (${days[currentDate.getDay()]})`;

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    const filename = riskId
      ? `위험요인_제거·대체_및_통제_등록_${riskId}_${formattedDate.replace(/[\s:]/g, '_')}.pdf`
      : `위험요인_제거·대체_및_통제_등록_${formattedDate.replace(/[\s:]/g, '_')}.pdf`;
    await generatePDF(element, filename);
  };

  // 자동 PDF 다운로드 (URL 파라미터로 트리거)
  useEffect(() => {
    const autoDownload = searchParams.get('autoDownload');
    if (autoDownload === 'true' && pdfRef.current) {
      // 컴포넌트 렌더링 완료 대기
      const timer = setTimeout(() => {
        handleDownloadPDF().then(() => {
          // PDF 다운로드 후 URL에서 파라미터 제거 및 창 닫기
          searchParams.delete('autoDownload');
          setSearchParams(searchParams, { replace: true });
          // 새 창에서 열린 경우 창 닫기
          if (window.opener) {
            window.close();
          }
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
    // 조건이 맞지 않을 때는 cleanup function이 필요 없으므로 undefined 반환
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleBack = () => {
    // 이전 페이지로 정확히 복귀 (히스토리 기반)
    navigate(-1);
  };

  const handleSampleView = () => {
    console.log('샘플 보기');
  };

  // riskId에서 문서 정보 추출 (형식: safetyIdx-itemNumber-documentNumber)
  const extractedInfo = riskId
    ? (() => {
        const parts = riskId.split('-');
        if (parts.length >= 3) {
          return {
            safetyIdx: Number(parts[0]),
            itemNumber: Number(parts[1]),
            documentNumber: Number(parts[2]),
          };
        }
        return null;
      })()
    : null;

  const documentTableData = extractedInfo
    ? getTableDataByDocument(
        extractedInfo.safetyIdx,
        extractedInfo.itemNumber,
        extractedInfo.documentNumber
      )
    : null;

  // safetyIdx와 itemNumber 추출 (item/system이 없으면 riskId에서 추출)
  const safetyIdx = item?.safetyIdx || system?.safetyIdx || extractedInfo?.safetyIdx;
  const itemNumber = item?.itemNumber || extractedInfo?.itemNumber;

  // safetyIdx와 itemNumber에 따라 테이블 데이터 가져오기 (기본값용)
  const tableData = getRiskAssessmentTableData(safetyIdx, itemNumber);

  // 2100번대 문서 여부 확인 (safetyIdx=2, itemNumber=1)
  const is2100Series = safetyIdx === 2 && itemNumber === 1;
  // 1500번대 문서 여부 확인 (safetyIdx=1, itemNumber=5)
  const is1500Series = safetyIdx === 1 && itemNumber === 5;
  // 1400번대 문서 여부 확인 (safetyIdx=1, itemNumber=4)
  const is1400Series = safetyIdx === 1 && itemNumber === 4;
  // 1300번대 문서 여부 확인 (safetyIdx=1, itemNumber=3)
  const is1300Series = safetyIdx === 1 && itemNumber === 3;
  // 2300번대 문서 여부 확인 (safetyIdx=2, itemNumber=3)
  const is2300Series = safetyIdx === 2 && itemNumber === 3;
  // 2200번대 문서 여부 확인 (safetyIdx=2, itemNumber=2)
  const is2200Series = safetyIdx === 2 && itemNumber === 2;

  // item 정보가 없으면 추출된 정보로부터 가져오기
  const resolvedItem =
    item || (safetyIdx && itemNumber ? getItem(safetyIdx, itemNumber) : undefined);

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            alignItems: 'center',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <DetailHeader
          title={
            resolvedItem?.documentName || system?.systemName || '위험요인 제거·대체 및 통제 등록'
          }
          onBack={handleBack}
          onSampleView={handleSampleView}
        />

        {/* Main Card */}
        <Box
          ref={pdfRef}
          component="div"
          data-pdf-content
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          <DocumentHeader
            formattedDate={formattedDate}
            title={
              is2100Series
                ? '위험요인별 위험성 평가'
                : is1500Series
                  ? '위험장소 및 작업형태별 위험요인'
                  : is1400Series
                    ? '유해인자'
                    : is1300Series
                      ? '위험 기계·기구·설비'
                      : is2300Series
                        ? '감소 대책 수립·이행'
                        : is2200Series
                          ? '위험요인 제거·대체 및 통제 계획'
                          : undefined
            }
            approvalVariant={
              is2100Series ||
              is1500Series ||
              is1400Series ||
              is1300Series ||
              is2300Series ||
              is2200Series
                ? 'four'
                : 'default'
            }
          />

          {(() => {
            // 문서 테이블 데이터가 있으면 사용, 없으면 기본값
            if (is2100Series && documentTableData?.type === '2100') {
              const TableComp = tableRegistry['2-1-2100'] as any;
              return <TableComp data={documentTableData.data} />;
            }
            if (is1500Series && documentTableData?.type === '1500') {
              const TableComp = tableRegistry['1-5-1500'] as any;
              return <TableComp rows={documentTableData.rows} />;
            }
            if (is1400Series && documentTableData?.type === '1400') {
              const TableComp = tableRegistry['1-4-1400'] as any;
              return <TableComp data={documentTableData.data} />;
            }
            if (is1300Series && documentTableData?.type === '1300') {
              const TableComp = tableRegistry['1-3-1300'] as any;
              return <TableComp rows={documentTableData.rows} />;
            }
            if (is2300Series && documentTableData?.type === '2300') {
              const TableComp = tableRegistry['2-3-2300'] as any;
              return <TableComp rows={documentTableData.rows} />;
            }
            if (is2200Series && documentTableData?.type === '2200') {
              const TableComp = tableRegistry['2-2'] as any;
              return <TableComp data={documentTableData.rows} />;
            }

            // 기본값: 문서 데이터가 없거나 매칭되지 않는 경우
            if (is2100Series) {
              const TableComp = tableRegistry['2-1-2100'] as any;
              return <TableComp />;
            }
            if (is1500Series) {
              const TableComp = tableRegistry['1-5-1500'] as any;
              return <TableComp />;
            }
            if (is1400Series) {
              const TableComp = tableRegistry['1-4-1400'] as any;
              return <TableComp />;
            }
            if (is1300Series) {
              const TableComp = tableRegistry['1-3-1300'] as any;
              return <TableComp />;
            }
            if (is2300Series) {
              const TableComp = tableRegistry['2-3-2300'] as any;
              return <TableComp />;
            }
            if (is2200Series) {
              const TableComp = tableRegistry['2-2'] as TableComponent;
              return <TableComp data={tableData as DefaultTableRow[]} />;
            }

            const key = item ? `${item.safetyIdx}-${item.itemNumber}` : 'Default';
            const TableComp = (tableRegistry as any)[key] || tableRegistry.Default;
            return <TableComp data={tableData as any[]} />;
          })()}
        </Box>

        <FooterButtons onDownloadPDF={handleDownloadPDF} />
      </Box>
    </DashboardContent>
  );
}
