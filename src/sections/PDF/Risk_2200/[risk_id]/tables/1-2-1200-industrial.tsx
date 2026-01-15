import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';
import type { Table1200IndustrialAccidentRow } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = {
  row?: Table1200IndustrialAccidentRow;
};

const defaultRow: Table1200IndustrialAccidentRow = {
  accidentName: '프레스 작업 중 손가락 절단 사고',
  accidentDate: '2025-01-15',
  accidentTime: '14:30',
  accidentLocation: '1공장 프레스 라인',
  accidentType: '절단',
  investigationTeam: [
    { department: '안전보건팀', name: '김안전' },
    { department: '생산팀', name: '이현수' },
  ],
  humanDamage: [
    { department: '생산 1팀', name: '박근로', position: '작업자', injury: '왼손 검지 절단' },
  ],
  materialDamage: '프레스 방호장치 일부 손상',
  accidentContent: '프레스 작업 중 방호장치를 우회하여 작업하다가 손가락이 절단됨',
  riskAssessmentBefore: {
    possibility: '높음',
    severity: '중대',
    risk: '높음',
  },
  accidentCause: '방호장치 우회 작업, 안전교육 미흡',
  doctorOpinion: '수술 후 재활 치료 필요, 작업 복귀 불가',
  preventionMeasure: '방호장치 개선, 작업 절차서 재교육, 정기 안전점검 강화',
  riskAssessmentAfter: {
    possibility: '낮음',
    severity: '낮음',
    risk: '낮음',
  },
  otherContent: '사고 발생 즉시 응급조치 실시, 병원 이송 완료',
  investigationImages: [],
};

export default function RiskTable_1_2_1200_Industrial({ row = defaultRow }: Props) {
  const headerCellStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #1c252e',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #1c252e',
    textAlign: 'left',
    verticalAlign: 'middle',
  };

  const subHeaderCellStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #1c252e',
    borderTop: 'none',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
  };

  const innerCellStyle: React.CSSProperties = {
    border: '1px solid #dfe3e8',
  };

  // 사고조사반 빈 행 필터링
  const displayedInvestigationTeam = (row.investigationTeam || []).filter(
    (member) => member.department?.trim() || member.name?.trim()
  );

  // 인적피해 빈 행 필터링
  const displayedHumanDamage = (row.humanDamage || []).filter(
    (damage) =>
      damage.department?.trim() ||
      damage.name?.trim() ||
      damage.position?.trim() ||
      damage.injury?.trim()
  );

  // 이미지 Base64 상태 관리
  const [base64Images, setBase64Images] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      if (!row.investigationImages || row.investigationImages.length === 0) return;

      const newBase64Images: Record<string, string> = {};

      await Promise.all(
        row.investigationImages.map(async (imgUrl) => {
          try {
            // 이미 변환된 경우 건너뜀
            if (base64Images[imgUrl]) return;

            const fullUrl = imgUrl.startsWith('http')
              ? imgUrl
              : `${CONFIG.serverUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;

            const response = await fetch(fullUrl, {
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

            newBase64Images[imgUrl] = base64;
          } catch (error) {
            console.error('이미지 로드 실패:', imgUrl, error);
            // 실패 시 원본 URL 사용 (CORS 에러 가능성 있음)
            newBase64Images[imgUrl] = imgUrl;
          }
        })
      );

      setBase64Images((prev: Record<string, string>) => ({ ...prev, ...newBase64Images }));
    };

    loadImages();
  }, [row.investigationImages]);

  const renderInvestigationImages = () => {
    if (!row.investigationImages || row.investigationImages.length === 0) {
      return (
        <Typography variant="body2" color="text.disabled">
          등록된 이미지가 없습니다.
        </Typography>
      );
    }

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {row.investigationImages.map((imgUrl, index) => (
          <Box
            key={index}
            component="img"
            src={base64Images[imgUrl] || imgUrl}
            alt={`사고조사 사진 ${index + 1}`}
            crossOrigin="anonymous"
            sx={{
              width: 200,
              height: 150,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mt: 4 }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          border: '2px solid #1c252e',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          '& tbody tr': {
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          },
        }}
      >
        <colgroup>
          <col style={{ width: '154px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: 'auto' }} />
        </colgroup>
        <tbody>
          {/* 사고명, 사고 일시 */}
          <tr>
            <th style={{ ...headerCellStyle, width: '154px' }}>사고명</th>
            <td colSpan={4} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.accidentName}
              </Typography>
            </td>
            <th style={{ ...headerCellStyle, width: '160px' }}>사고 일시</th>
            <td style={{ ...bodyCellStyle, width: '160px' }}>
              <Typography sx={{ fontSize: 15 }}>
                {row.accidentDate} {row.accidentTime}
              </Typography>
            </td>
          </tr>

          {/* 사고장소, 사고 형태 */}
          <tr>
            <th style={headerCellStyle}>사고장소</th>
            <td colSpan={4} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.accidentLocation}
              </Typography>
            </td>
            <th style={headerCellStyle}>사고 형태</th>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15 }}>{row.accidentType}</Typography>
            </td>
          </tr>

          {/* 사고조사반 */}
          <tr>
            <th style={headerCellStyle}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
              >
                <Iconify icon="eva:search-fill" width={24} />
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>사고조사반</Typography>
              </Box>
            </th>
            <td colSpan={6} style={{ padding: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #dfe3e8',
                  }}
                >
                  <colgroup>
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '50%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>소속팀</th>
                      <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>성명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedInvestigationTeam.map((member, index) => (
                      <tr key={index}>
                        <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                          <Typography sx={{ fontSize: 15 }}>{member.department}</Typography>
                        </td>
                        <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                          <Typography sx={{ fontSize: 15 }}>{member.name}</Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </td>
          </tr>

          {/* 인적피해 */}
          <tr>
            <th style={headerCellStyle}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
              >
                <Iconify icon="eva:search-fill" width={24} />
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>인적피해</Typography>
              </Box>
            </th>
            <td colSpan={6} style={{ padding: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #dfe3e8',
                  }}
                >
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>소속팀</th>
                      <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>성명</th>
                      <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>직급</th>
                      <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>상해부위/부상</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedHumanDamage.map((damage, index) => (
                      <tr key={index}>
                        <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                          <Typography sx={{ fontSize: 15 }}>{damage.department}</Typography>
                        </td>
                        <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                          <Typography sx={{ fontSize: 15 }}>{damage.name}</Typography>
                        </td>
                        <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                          <Typography sx={{ fontSize: 15 }}>{damage.position}</Typography>
                        </td>
                        <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                          <Typography sx={{ fontSize: 15 }}>{damage.injury}</Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </td>
          </tr>

          {/* 물적피해 */}
          <tr>
            <th style={headerCellStyle}>물적피해</th>
            <td colSpan={6} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.materialDamage}
              </Typography>
            </td>
          </tr>

          {/* 사고내용 + 위험성 평가(사전) */}
          <tr>
            <th rowSpan={3} style={headerCellStyle}>
              사고내용
            </th>
            <td rowSpan={3} colSpan={3} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.accidentContent}
              </Typography>
            </td>
            <th rowSpan={3} style={headerCellStyle}>
              위험성 평가
            </th>
            <td style={subHeaderCellStyle}>가능성</td>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, textAlign: 'center' }}>
                {row.riskAssessmentBefore.possibility}
              </Typography>
            </td>
          </tr>
          <tr>
            <td style={subHeaderCellStyle}>중대성</td>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, textAlign: 'center' }}>
                {row.riskAssessmentBefore.severity}
              </Typography>
            </td>
          </tr>
          <tr>
            <td style={subHeaderCellStyle}>위험성</td>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, textAlign: 'center' }}>
                {row.riskAssessmentBefore.risk}
              </Typography>
            </td>
          </tr>

          {/* 사고원인 */}
          <tr>
            <th style={headerCellStyle}>사고원인</th>
            <td colSpan={6} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.accidentCause}
              </Typography>
            </td>
          </tr>

          {/* 의사/외부 전문가 소견 */}
          <tr>
            <th style={headerCellStyle}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                의사/외부
                <br />
                전문가 소견
              </Typography>
            </th>
            <td colSpan={6} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.doctorOpinion}
              </Typography>
            </td>
          </tr>

          {/* 재발방지 대책 + 위험성 평가(사후) */}
          <tr>
            <th rowSpan={3} style={headerCellStyle}>
              재발방지 대책
            </th>
            <td rowSpan={3} colSpan={3} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.preventionMeasure}
              </Typography>
            </td>
            <th rowSpan={3} style={headerCellStyle}>
              위험성 평가
            </th>
            <td style={subHeaderCellStyle}>가능성</td>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, textAlign: 'center' }}>
                {row.riskAssessmentAfter.possibility}
              </Typography>
            </td>
          </tr>
          <tr>
            <td style={subHeaderCellStyle}>중대성</td>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, textAlign: 'center' }}>
                {row.riskAssessmentAfter.severity}
              </Typography>
            </td>
          </tr>
          <tr>
            <td style={subHeaderCellStyle}>위험성</td>
            <td style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, textAlign: 'center' }}>
                {row.riskAssessmentAfter.risk}
              </Typography>
            </td>
          </tr>

          {/* 기타내용 사고조사 내용 */}
          <tr>
            <th style={headerCellStyle}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                기타내용
                <br />
                사고조사 내용
              </Typography>
            </th>
            <td colSpan={6} style={bodyCellStyle}>
              <Typography sx={{ fontSize: 15, whiteSpace: 'pre-line' }}>
                {row.otherContent}
              </Typography>
            </td>
          </tr>

          {/* 기타내용 사고조사 사진 */}
          <tr>
            <th style={headerCellStyle}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                기타내용
                <br />
                사고조사 사진
              </Typography>
            </th>
            <td colSpan={6} style={bodyCellStyle}>
              {renderInvestigationImages()}
            </td>
          </tr>
        </tbody>
      </Box>
    </Box>
  );
}
