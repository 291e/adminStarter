import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { CONFIG } from 'src/global-config';

import type { Table1200NearMissRow } from '../../types/table-data';

// ----------------------------------------------------------------------

type Props = {
  row?: Table1200NearMissRow;
};

const defaultRow: Table1200NearMissRow = {
  workName: '포장 라인 설비 점검',
  grade: 'A',
  reporter: '김안전',
  reporterDepartment: '안전보건팀',
  workContent: '포장 라인 설비 상태 점검 및 케이블 정리 작업 진행',
  accidentContent: '바닥에 방치된 케이블에 발이 걸려 넘어질 뻔한 아차사고 발생',
  accidentRiskLevel: 'B',
  accidentCause: '케이블 정리 미흡 및 작업 동선 확인 부족',
  preventionMeasure: '케이블 덕트 설치, 작업 전 동선 점검 및 위험표지 설치',
  preventionRiskLevel: 'A',
  siteSituation: '포장 라인 중앙에 케이블이 복수 노출되어 있으며 통행 동선이 협소함.',
  siteImages: [],
};

const gradeGuideRows = [
  {
    grade: 'A',
    risk: '중대재해가 예상되는 경우',
    action: [
      '중단 여부와 관계없이 중대재해로 동일시',
      '조업 중단 후 사고조사 및 재발방지 대책 수립',
    ],
  },
  {
    grade: 'B',
    risk: '재해 사고 발생 징후 또는 신체·설비에 부상을 유발할 징조가 예측되는 경우',
    action: ['사고 발생 여부와 관계없이 동일시', '임시 조치를 포함해 즉시 개선 조치 시행'],
  },
  {
    grade: 'C',
    risk: '재해 사고 발생 가능성은 낮으나 설비·현장 상황상 예방 조치가 필요한 경우',
    action: ['일부 단위 작업은 가능하나, 교육 시행 등 예방 관리 조치 수행'],
  },
];

const noteMessages = [
  '*중상: 한 곳 이상의 치명적인 저림을 필요로 하는 부상이나, 신체를 부분적으로 상실하거나 그 기능을 장구적으로 상실한 경우',
  '**경상: 사망에 이르지 않은 부상',
];

export default function RiskTable_1_2_1200({ row = defaultRow }: Props) {
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
    padding: '12px',
    border: '1px solid #1c252e',
    textAlign: 'left',
    verticalAlign: 'middle',
  };

  const renderRiskColumn = (label: string, value: string) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
        {label}
      </Typography>
      <Box
        sx={{
          width: 'calc(100% + 24px)',
          height: '2px',
          bgcolor: '#1c252e',
          my: 0.5,
          marginLeft: '-12px',
          marginRight: '-12px',
        }}
      />
      <Typography sx={{ fontSize: 14, fontWeight: 400, textAlign: 'center' }}>{value}</Typography>
    </Box>
  );

  // 이미지 Base64 상태 관리
  const [base64Images, setBase64Images] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      if (!row.siteImages || row.siteImages.length === 0) return;

      const newBase64Images: Record<string, string> = {};

      await Promise.all(
        row.siteImages.map(async (imgUrl) => {
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

      setBase64Images((prev) => ({ ...prev, ...newBase64Images }));
    };

    loadImages();
  }, [row.siteImages]);

  const renderSiteImages = () => {
    if (!row.siteImages || row.siteImages.length === 0) {
      return (
        <Typography variant="body2" color="text.disabled">
          등록된 이미지가 없습니다.
        </Typography>
      );
    }

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {row.siteImages.map((imgUrl, index) => (
          <Box
            key={index}
            component="img"
            src={base64Images[imgUrl] || imgUrl}
            alt={`현장 사진 ${index + 1}`}
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
          <col style={{ width: 154 }} />
          <col />
          <col />
          <col />
          <col style={{ width: 160 }} />
          <col style={{ width: 160 }} />
        </colgroup>
        <tbody>
          <tr>
            <th style={headerCellStyle}>작업명</th>
            <td style={bodyCellStyle} colSpan={3}>
              {row.workName}
            </td>
            <th style={headerCellStyle}>등급</th>
            <td style={{ ...bodyCellStyle, textAlign: 'center' }} colSpan={1}>
              {row.grade}
            </td>
          </tr>
          <tr>
            <th style={headerCellStyle}>신고자</th>
            <td style={bodyCellStyle} colSpan={3}>
              <Typography sx={{ fontWeight: 600 }}>{row.reporter}</Typography>
            </td>
            <th style={headerCellStyle}>소속팀</th>
            <td style={{ ...bodyCellStyle, textAlign: 'center' }}>{row.reporterDepartment}</td>
          </tr>
          <tr>
            <th style={headerCellStyle}>작업내용</th>
            <td style={bodyCellStyle} colSpan={5}>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{row.workContent}</Typography>
            </td>
          </tr>
          <tr>
            <th style={headerCellStyle}>사고내용</th>
            <td style={bodyCellStyle} colSpan={4}>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{row.accidentContent}</Typography>
            </td>
            <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
              {renderRiskColumn('위험정도', row.accidentRiskLevel)}
            </td>
          </tr>
          <tr>
            <th style={headerCellStyle}>발생원인</th>
            <td style={bodyCellStyle} colSpan={5}>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{row.accidentCause}</Typography>
            </td>
          </tr>
          <tr>
            <th style={headerCellStyle}>예방대책(조치내용)</th>
            <td style={bodyCellStyle} colSpan={4}>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{row.preventionMeasure}</Typography>
            </td>
            <td
              style={{ ...bodyCellStyle, textAlign: 'center', borderBottom: '2px solid #1c252e' }}
            >
              {renderRiskColumn('위험정도', row.preventionRiskLevel)}
            </td>
          </tr>
          <tr>
            <th style={headerCellStyle}>
              작업현장 상황 설명
              <br />
              (사진, 도면)
            </th>
            <td style={bodyCellStyle} colSpan={5}>
              <Stack spacing={2}>
                <Typography sx={{ whiteSpace: 'pre-line' }}>{row.siteSituation}</Typography>
                {renderSiteImages()}
              </Stack>
            </td>
          </tr>
        </tbody>
      </Box>

      <Box
        component="table"
        sx={{
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderCollapse: 'collapse',
          mt: 4,
        }}
      >
        <thead>
          <tr>
            <th style={headerCellStyle}>등급</th>
            <th style={headerCellStyle}>위험정도</th>
            <th style={headerCellStyle}>조치</th>
          </tr>
        </thead>
        <tbody>
          {gradeGuideRows.map((guide) => (
            <tr key={guide.grade}>
              <td style={{ ...bodyCellStyle, textAlign: 'center' }}>{guide.grade}</td>
              <td style={bodyCellStyle}>{guide.risk}</td>
              <td style={bodyCellStyle}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {guide.action.map((action) => (
                    <li key={action} style={{ marginBottom: 4 }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>

      <Stack spacing={0.5} sx={{ mt: 2 }}>
        {noteMessages.map((message) => (
          <Typography key={message} variant="body2" color="text.secondary">
            {message}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
