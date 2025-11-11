import type { ReactNode } from 'react';

// ----------------------------------------------------------------------

export type RiskAssessmentTableRow = {
  risk: string | ReactNode;
  removal: string | ReactNode;
  engineering: string | ReactNode;
  administrative: string | ReactNode;
  ppe: string | ReactNode;
};

// safetyIdx와 itemNumber 조합에 따른 테이블 데이터 매핑
// key: `${safetyIdx}-${itemNumber}`
export const riskAssessmentTableData: Record<
  string,
  RiskAssessmentTableRow[]
> = {
  // 1-1. 위험요인 파악
  '1-1': [
    {
      risk: '건설현장 개구부',
      removal: '설계.시공 시개구부 최소화',
      engineering: '안전난간 설치',
      administrative: "'추락위험' 표지판 설치",
      ppe: '안전모/안전대착용',
    },
    {
      risk: '끼임 위험기계/기구',
      removal: '끼임 위험이 없는 자동화 기계 도입',
      engineering: '방호덮개 설치',
      administrative: "'Lock Out, Tag Out' 작업허가제 도입",
      ppe: '말려 들어갈 위험이 없는 작업복 착용',
    },
  ],
  // 1-2. 산업재해 및 아차사고
  '1-2': [
    {
      risk: '산업재해 발생',
      removal: '위험요인 사전 제거',
      engineering: '안전장치 설치',
      administrative: '안전보건 교육 실시',
      ppe: '보호구 착용',
    },
  ],
  // 1-3. 위험 기계·기구·설비
  '1-3': [
    {
      risk: '위험 기계·기구·설비',
      removal: '위험 설비 제거 또는 안전 설비로 교체',
      engineering: '안전장치 및 방호장치 설치',
      administrative: '작업 절차서 준수, 정기 점검',
      ppe: '안전모, 보안경, 작업장갑 착용',
    },
  ],
  // 2-1. 위험요인별 위험성 평가
  '2-1': [
    {
      risk: '위험요인별 위험성 평가',
      removal: '위험요인 제거 또는 대체',
      engineering: '공학적 통제 장치 설치',
      administrative: '위험성 평가 및 관리 절차 수립',
      ppe: '적절한 보호구 착용',
    },
  ],
  // 기본값 (가이드에서 시스템만 클릭한 경우 등)
  default: [
    {
      risk: '건설현장 개구부',
      removal: '설계.시공 시개구부 최소화',
      engineering: '안전난간 설치',
      administrative: "'추락위험' 표지판 설치",
      ppe: '안전모/안전대착용',
    },
    {
      risk: '끼임 위험기계/기구',
      removal: '끼임 위험이 없는 자동화 기계 도입',
      engineering: '방호덮개 설치',
      administrative: "'Lock Out, Tag Out' 작업허가제 도입",
      ppe: '말려 들어갈 위험이 없는 작업복 착용',
    },
    {
      risk: '유해화학물질',
      removal: (
        <>
          유해물질 제거 또는 저독성물질로 대체
          <br />
          *예:메탄올→에탄올
        </>
      ),
      engineering: '국소배기장치 설치, 누출방지조치 등',
      administrative: '작업절차서 준수, 작업환경 측정을 통한 노출관리',
      ppe: '방독마스크, 내화학장갑, 보안경 등 착용',
    },
    {
      risk: '인화성 가스',
      removal: (
        <>
          인화성 완화*
          <br />
          *예:아세틸렌→ LPG
        </>
      ),
      engineering:
        '전기설비 방폭 조치(점화원관리), 가스검지기/긴급차단장이 연동 설치 환기/배기장치 설치',
      administrative: '작업절차서 준서, 정비작업허가제 도입',
      ppe: (
        <>
          제전작업복 착용
          <br />
          가스검지기 휴대
          <br />
          방폭공구 사용
        </>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

/**
 * safetyIdx와 itemNumber에 따라 해당하는 테이블 데이터를 반환
 */
export function getRiskAssessmentTableData(
  safetyIdx?: number,
  itemNumber?: number
): RiskAssessmentTableRow[] {
  if (safetyIdx && itemNumber) {
    const key = `${safetyIdx}-${itemNumber}`;
    return riskAssessmentTableData[key] || riskAssessmentTableData.default;
  }
  return riskAssessmentTableData.default;
}








