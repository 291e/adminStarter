// ----------------------------------------------------------------------

export type LibraryReport = {
  id: string;
  order: number; // 순번
  registrationDate: string; // 등록일 (YYYY-MM-DD HH:mm:ss)
  organizationName: string; // 조직명
  category: string; // 카테고리
  title: string; // 제목
  playbackTime: string; // 재생시간 (HH:mm:ss)
  hasSubtitles: boolean; // 자막 여부
  status: 'active' | 'inactive'; // 상태
};

const organizationNames = ['이편한자동화기술'];

const categories = [
  'TBM 작업안전',
  '개인정보보호 교육',
  '화학물질 안전관리',
  '건설현장 안전보건',
  '전기안전 작업',
  '소방안전',
  '산업안전보건법',
  '위험물 안전관리',
  '개인보호구 착용',
  '안전작업 절차',
];

const titles = [
  '식품제조용 혼합기_10분작업안전',
  '아크릴로니트릴_10분작업안전',
  '6.개인정보보호교육',
  '화학물질 안전관리 교육',
  '건설현장 안전보건 교육',
  '전기안전 작업 교육',
  '소방안전 교육',
  '산업안전보건법 교육',
  '위험물 안전관리 교육',
  '개인보호구 착용 교육',
];

const playbackTimes = [
  '16:24:22',
  '10:30:00',
  '09:15:45',
  '12:45:30',
  '08:20:15',
  '15:10:00',
  '11:30:45',
  '13:25:20',
  '07:45:10',
  '14:50:30',
];

const dates = [
  '2025-09-30 16:45:35',
  '2025-09-29 14:30:20',
  '2025-09-28 11:20:15',
  '2025-09-27 09:15:30',
  '2025-09-26 16:45:00',
  '2025-09-25 13:30:45',
  '2025-09-24 10:20:30',
  '2025-09-23 15:45:15',
  '2025-09-22 12:30:00',
  '2025-09-21 09:15:45',
];

// ----------------------------------------------------------------------

export function mockLibraryReports(count: number): LibraryReport[] {
  return Array.from({ length: count }, (_, index) => {
    const categoryIndex = index % categories.length;
    const titleIndex = index % titles.length;
    const playbackTimeIndex = index % playbackTimes.length;
    const dateIndex = index % dates.length;
    const status: 'active' | 'inactive' = index % 10 < 8 ? 'active' : 'inactive'; // 80% 활성, 20% 비활성

    return {
      id: `library-${index + 1}`,
      order: count - index, // 역순으로 순번 부여
      registrationDate: dates[dateIndex],
      organizationName: organizationNames[0],
      category: categories[categoryIndex],
      title: titles[titleIndex],
      playbackTime: playbackTimes[playbackTimeIndex],
      hasSubtitles: index % 3 !== 0, // 일부만 자막 있음
      status,
    };
  });
}

