import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ----------------------------------------------------------------------

export async function generatePDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    // PNG signature 오류 방지를 위한 추가 옵션 (더 높은 해상도)
    const canvas = await html2canvas(element, {
      scale: 3, // 해상도 향상 (2 → 3)
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

    const imgData = canvas.toDataURL('image/png');

    // PNG 데이터 유효성 검사
    if (!imgData || imgData === 'data:,') {
      throw new Error('PNG 이미지 데이터를 생성할 수 없습니다.');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

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

    // 첫 페이지에 이미지 추가
    pdf.addImage(imgData, 'PNG', marginLeft, marginTop, availableWidth, imgHeight);

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

        const tempImgData = tempCanvas.toDataURL('image/png');
        pdf.addImage(tempImgData, 'PNG', marginLeft, 0, availableWidth, pageImageHeight);
      }

      sourceYOffset += pageImageHeight;
      remainingHeight -= pageImageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF 생성 중 오류가 발생했습니다:', error);
    throw error;
  }
}
