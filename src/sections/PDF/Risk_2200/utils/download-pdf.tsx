import { createRoot } from 'react-dom/client';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SafetySystemItem, SafetySystemDocument } from 'src/services/safety-system/safety-system.types';
import { getSafetySystemItem } from 'src/services/safety-system/safety-system.service';
import { generatePDF } from '../[risk_id]/utils/pdf-utils';
import { Risk_2200View } from '../[risk_id]/view';
import { SettingsProvider, defaultSettings } from 'src/components/settings';
import { ThemeProvider } from 'src/theme';
import { AuthProvider } from 'src/auth/context/jwt';

/**
 * 문서 ID를 기반으로 PDF를 다운로드합니다.
 * 백그라운드에서 숨겨진 DOM 요소에 문서를 렌더링하고 PDF를 생성합니다.
 * @param documentId - safetySystemDocumentIdx (숫자 문자열)
 * @param safetyId - safetyIdx (문자열)
 * @param safetySystemItemIdx - safetySystemItemIdx (API로 문서 정보를 가져오기 위해 필요)
 */
export async function downloadDocumentPDF(
  documentId: string,
  safetyId: string,
  safetySystemItemIdx?: number
): Promise<void> {
  try {
    let item: SafetySystemItem | undefined;
    let documentName = '문서'; // 기본 문서명
    let documentList: SafetySystemDocument[] = [];

    if (safetySystemItemIdx) {
      // API로 아이템 정보 및 문서 목록 가져오기
      try {
        const response = await getSafetySystemItem(safetySystemItemIdx);
        const itemData =
          (response as any).item ||
          (response as any).body?.data?.item ||
          (response as any).body?.item;
        documentList =
          (response as any).documentList ||
          (response as any).body?.data?.documentList ||
          (response as any).body?.documentList ||
          [];

        if (itemData) {
          item = itemData as SafetySystemItem;
        }

        // 현재 문서 찾기
        const safetySystemDocumentIdx = Number(documentId);
        const currentDoc = documentList.find(
          (doc) => doc.safetySystemDocumentIdx === safetySystemDocumentIdx
        );
        if (currentDoc?.documentName) {
          documentName = currentDoc.documentName;
        }
      } catch (error) {
        console.error('아이템 정보 조회 실패:', error);
        // API 실패 시 item은 undefined로 두고 Risk_2200View에서 처리하도록 함
      }
    }

    // 숨겨진 컨테이너 생성 (화면 밖으로 이동, display: none 사용 안 함)
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1240px'; // 문서 너비
    container.style.height = 'auto';
    container.style.backgroundColor = '#ffffff';
    container.style.visibility = 'visible'; // html2canvas를 위해 visible 유지
    container.style.opacity = '1'; // opacity도 1로 유지
    document.body.appendChild(container);

    // QueryClient 생성 (PDF 다운로드용)
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5분
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    // React 컴포넌트 렌더링
    const root = createRoot(container);

    await new Promise<void>((resolve, reject) => {
      root.render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <AuthProvider>
                <SettingsProvider defaultSettings={defaultSettings}>
                  <ThemeProvider>
                    <Risk_2200View riskId={documentId} safetyId={safetyId} item={item} />
                  </ThemeProvider>
                </SettingsProvider>
              </AuthProvider>
            </MemoryRouter>
          </QueryClientProvider>
        </React.StrictMode>
      );

      // 컴포넌트 렌더링 완료 대기 (재시도 로직)
      const checkForElement = (attempts: number = 0) => {
        const pdfElement = container.querySelector('[data-pdf-content]') as HTMLElement;
        
        // 요소가 있고 내용이 있는지 확인 (로딩 중일 수 있음)
        const hasContent = pdfElement && pdfElement.children.length > 0;
        
        if (hasContent) {
          const currentDate = new Date();
          const days = ['일', '월', '화', '수', '목', '금', '토'];
          const formattedDate = `${currentDate.getFullYear()}.${String(
            currentDate.getMonth() + 1
          ).padStart(
            2,
            '0'
          )}.${String(currentDate.getDate()).padStart(2, '0')} (${days[currentDate.getDay()]})`;
          // 문서명을 사용하여 파일명 생성
          const filename = `${documentName}_${formattedDate.replace(/[\s:]/g, '_')}.pdf`;

          // 추가 대기 시간 (이미지 로딩 등)
          setTimeout(() => {
            generatePDF(pdfElement, filename)
              .then(() => {
                // 정리
                root.unmount();
                document.body.removeChild(container);
                resolve();
              })
              .catch((error) => {
                console.error('PDF 생성 실패:', error);
                root.unmount();
                document.body.removeChild(container);
                reject(error);
              });
          }, 1000);
        } else if (attempts < 30) {
          // 최대 30번까지 재시도 (총 15초 대기, API 호출 대기 시간 고려)
          setTimeout(() => checkForElement(attempts + 1), 500);
        } else {
          // 최대 재시도 횟수 초과
          console.error('PDF 생성 요소를 찾을 수 없습니다. 컨테이너 내용:', container.innerHTML.substring(0, 200));
          root.unmount();
          document.body.removeChild(container);
          reject(new Error('PDF 생성 요소를 찾을 수 없습니다.'));
        }
      };

      // 첫 번째 시도 (3초 후, API 호출 시간 고려)
      setTimeout(() => checkForElement(), 3000);
    });
  } catch (error) {
    console.error('PDF 다운로드 중 오류:', error);
    alert('PDF 다운로드 중 오류가 발생했습니다.');
    throw error;
  }
}
