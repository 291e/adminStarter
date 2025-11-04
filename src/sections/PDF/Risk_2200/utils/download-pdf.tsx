import { createRoot } from 'react-dom/client';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { getItem } from 'src/_mock/_safety-system';
import { generatePDF } from '../[risk_id]/utils/pdf-utils';
import { Risk_2200View } from '../[risk_id]/view';
import { SettingsProvider, defaultSettings } from 'src/components/settings';
import { ThemeProvider } from 'src/theme';
import { AuthProvider } from 'src/auth/context/jwt';

/**
 * 문서 ID를 기반으로 PDF를 다운로드합니다.
 * 백그라운드에서 숨겨진 DOM 요소에 문서를 렌더링하고 PDF를 생성합니다.
 */
export async function downloadDocumentPDF(documentId: string, safetyId: string): Promise<void> {
  try {
    // 문서 ID에서 정보 추출
    const parts = documentId.split('-');
    if (parts.length < 3) {
      throw new Error('잘못된 문서 ID 형식');
    }

    const safetyIdx = Number(parts[0]);
    const itemNumber = Number(parts[1]);
    const documentNumber = Number(parts[2]);

    // item 정보 가져오기
    const item = getItem(safetyIdx, itemNumber);

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

    // React 컴포넌트 렌더링
    const root = createRoot(container);

    await new Promise<void>((resolve, reject) => {
      root.render(
        <React.StrictMode>
          <MemoryRouter>
            <AuthProvider>
              <SettingsProvider defaultSettings={defaultSettings}>
                <ThemeProvider>
                  <Risk_2200View riskId={documentId} safetyId={safetyId} item={item} />
                </ThemeProvider>
              </SettingsProvider>
            </AuthProvider>
          </MemoryRouter>
        </React.StrictMode>
      );

      // 컴포넌트 렌더링 완료 대기 (재시도 로직)
      const checkForElement = (attempts: number = 0) => {
        const pdfElement = container.querySelector('[data-pdf-content]') as HTMLElement;
        if (pdfElement) {
          const currentDate = new Date();
          const days = ['일', '월', '화', '수', '목', '금', '토'];
          const formattedDate = `${currentDate.getFullYear()}.${String(
            currentDate.getMonth() + 1
          ).padStart(
            2,
            '0'
          )}.${String(currentDate.getDate()).padStart(2, '0')} (${days[currentDate.getDay()]})`;
          const filename = `위험요인_제거·대체_및_통제_등록_${documentId}_${formattedDate.replace(/[\s:]/g, '_')}.pdf`;

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
        } else if (attempts < 10) {
          // 최대 10번까지 재시도 (총 5초 대기)
          setTimeout(() => checkForElement(attempts + 1), 500);
        } else {
          // 최대 재시도 횟수 초과
          root.unmount();
          document.body.removeChild(container);
          reject(new Error('PDF 생성 요소를 찾을 수 없습니다.'));
        }
      };

      // 첫 번째 시도 (2초 후)
      setTimeout(() => checkForElement(), 2000);
    });
  } catch (error) {
    console.error('PDF 다운로드 중 오류:', error);
    alert('PDF 다운로드 중 오류가 발생했습니다.');
    throw error;
  }
}
