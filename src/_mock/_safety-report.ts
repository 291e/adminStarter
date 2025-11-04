import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type SafetyReport = {
  id: string;
  order: number; // 순번
  publishedAt: string; // 공개일
  documentType: string; // 문서 유형
  documentName: string; // 문서명
  documentDate: string; // 문서 작성일
  viewCount: number; // 조회수
};

const documentTypes = ['정책/방침', '매뉴얼', '가이드라인', '안전규정', '교육자료'];

const documentNames = [
  '안전관리 정책서',
  '현장 안전 매뉴얼',
  '작업 안전 가이드라인',
  '비상대응 매뉴얼',
  '안전 교육 자료집',
];

// ----------------------------------------------------------------------

export function mockSafetyReports(count: number): SafetyReport[] {
  return Array.from({ length: count }, (_, index) => {
    const typeIndex = index % documentTypes.length;
    const nameIndex = index % documentNames.length;

    return {
      id: `safety-${index + 1}`,
      order: 1000 + index + 1,
      publishedAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      documentType: documentTypes[typeIndex],
      documentName: documentNames[nameIndex],
      documentDate: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      viewCount: Math.floor(Math.random() * 100) + 1,
    };
  });
}


