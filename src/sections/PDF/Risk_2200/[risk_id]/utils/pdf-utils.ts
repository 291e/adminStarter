import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ----------------------------------------------------------------------

/**
 * PDF 생성 함수
 * @param element - PDF로 변환할 HTML 요소
 * @param filename - 저장할 파일명
 * @param options - 옵션 (quality: 이미지 품질 0.1~1.0, scale: 해상도 배율 1~3)
 */
export async function generatePDF(
  element: HTMLElement,
  filename: string,
  options?: { quality?: number; scale?: number }
): Promise<void> {
  const { quality = 0.75, scale = 2 } = options || {};

  try {
    // PDF 생성 시 "서명 추가" 버튼 숨기기
    const signatureButtons = element.querySelectorAll('button');
    const hiddenButtons: HTMLElement[] = [];
    signatureButtons.forEach((button) => {
      const buttonText = button.textContent?.trim();
      if (buttonText === '서명 추가') {
        button.style.display = 'none';
        hiddenButtons.push(button);
      }
    });

    // 해상도 및 품질 조정 (scale: 2로 낮춤, 충분한 품질 유지)
    const canvas = await html2canvas(element, {
      scale, // 해상도 (기본값: 2, 3에서 낮춤)
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Canvas 유효성 검사
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas가 유효하지 않습니다.');
    }

    // JPEG 형식으로 변환하여 용량 대폭 감소 (PNG 대비 약 70~80% 감소)
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // 이미지 데이터 유효성 검사
    if (!imgData || imgData === 'data:,') {
      throw new Error('이미지 데이터를 생성할 수 없습니다.');
    }

    // PDF 생성 (압축 활성화)
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true, // PDF 압축 활성화
    });

    // A4 크기 (mm)
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // 여백 설정을 줄여서 더 큰 크기로 표시 (px to mm 변환: 1px ≈ 0.264583mm at 96 DPI)
    const marginTop = 60 * 0.264583; // 위 여백 60px (120px → 60px로 감소)
    const marginLeft = 42 * 0.264583; // 좌 여백 42px (84px → 42px로 감소)
    const marginRight = 42 * 0.264583; // 우 여백 42px (84px → 42px로 감소)

    // 사용 가능한 너비와 높이 계산
    const availableWidth = pageWidth - marginLeft - marginRight;
    // 원본 크기를 유지하기 위해 더 큰 스케일 적용
    const imgHeight = (canvas.height * availableWidth) / canvas.width;

    // 첫 페이지에 사용 가능한 높이 (위 여백 제외)
    const firstPageAvailableHeight = pageHeight - marginTop;

    // 첫 페이지에 이미지 추가 (JPEG 형식)
    pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, availableWidth, imgHeight);

    // 이미지가 첫 페이지를 넘어가는 경우 추가 페이지 생성
    let remainingHeight = imgHeight - firstPageAvailableHeight;
    let sourceYOffset = firstPageAvailableHeight; // 원본 이미지에서 잘라낼 시작 위치 (mm)

    while (remainingHeight > 0) {
      pdf.addPage();

      // 현재 페이지에 표시할 이미지 높이
      const pageImageHeight = Math.min(remainingHeight, pageHeight);

      // 원본 canvas에서 필요한 부분만 추출
      const sourceYInPixels = (sourceYOffset / imgHeight) * canvas.height;
      const sourceHeightInPixels = (pageImageHeight / imgHeight) * canvas.height;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeightInPixels;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        // 원본 이미지에서 필요한 부분만 복사
        tempCtx.drawImage(
          canvas,
          0,
          sourceYInPixels,
          canvas.width,
          sourceHeightInPixels,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );

        // JPEG 형식으로 변환하여 용량 감소
        const tempImgData = tempCanvas.toDataURL('image/jpeg', quality);
        pdf.addImage(tempImgData, 'JPEG', marginLeft, 0, availableWidth, pageImageHeight);
      }

      sourceYOffset += pageImageHeight;
      remainingHeight -= pageImageHeight;
    }

    pdf.save(filename);

    // PDF 생성 후 버튼 다시 표시
    hiddenButtons.forEach((button) => {
      button.style.display = '';
    });
  } catch (error) {
    console.error('PDF 생성 중 오류가 발생했습니다:', error);
    // 에러 발생 시에도 버튼 다시 표시
    const signatureButtons = element.querySelectorAll('button');
    signatureButtons.forEach((button) => {
      const buttonText = button.textContent?.trim();
      if (buttonText === '서명 추가') {
        button.style.display = '';
      }
    });
    throw error;
  }
}
