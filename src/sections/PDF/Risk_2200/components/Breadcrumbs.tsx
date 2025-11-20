import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  items: { label: string; href?: string }[];
  onCreate?: () => void;
  onViewSample?: () => void;
  is1200Series?: boolean; // 1200번대 문서 여부 (safetyIdx=1, itemNumber=2)
  is1500Series?: boolean; // 1500번대 문서 여부 (safetyIdx=1, itemNumber=5)
  is2400Series?: boolean; // 2400번대 문서 여부 (safetyIdx=2, itemNumber=4)
  onCreateIndustrialAccident?: () => void; // 산업재해 작성
  onCreateNearMiss?: () => void; // 아차사고 작성
  onRiskAssessmentSetting?: () => void; // 위험성 평가 설정
  onCreateTBM?: () => void; // TBM 일지 작성
  onCreateEducation?: () => void; // 연간 교육 계획 작성
};

export default function Risk_2200Breadcrumbs({
  items,
  onCreate,
  onViewSample,
  is1200Series = false,
  is1500Series = false,
  is2400Series = false,
  onCreateIndustrialAccident,
  onCreateNearMiss,
  onRiskAssessmentSetting,
  onCreateTBM,
  onCreateEducation,
}: Props) {
  return (
    <Stack
      sx={{ pt: { xs: 1, md: 2 } }}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Breadcrumbs>
          {items.map((item, idx) =>
            item.href ? (
              <Link key={idx} color="inherit" href={item.href} underline="hover">
                {item.label}
              </Link>
            ) : (
              <Typography key={idx} color="text.primary">
                {item.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {onViewSample && (
          <Button variant="contained" color="info" onClick={onViewSample}>
            샘플 보기
          </Button>
        )}
        {is1200Series ? (
          <>
            {onCreateIndustrialAccident && (
              <Button variant="contained" onClick={onCreateIndustrialAccident}>
                산업재해 작성
              </Button>
            )}
            {onCreateNearMiss && (
              <Button variant="contained" onClick={onCreateNearMiss}>
                아차사고 작성
              </Button>
            )}
          </>
        ) : is1500Series ? (
          <>
            {onRiskAssessmentSetting && (
              <Button variant="contained" color="info" onClick={onRiskAssessmentSetting}>
                위험성 평가 설정
              </Button>
            )}
            {onCreate && (
              <Button variant="contained" onClick={onCreate}>
                작성하기
              </Button>
            )}
          </>
        ) : is2400Series ? (
          <>
            {onCreateTBM && (
              <Button variant="contained" onClick={onCreateTBM}>
                TBM 일지 작성
              </Button>
            )}
            {onCreateEducation && (
              <Button variant="contained" onClick={onCreateEducation}>
                연간 교육 계획 작성
              </Button>
            )}
          </>
        ) : (
          onCreate && (
            <Button variant="contained" onClick={onCreate}>
              작성하기
            </Button>
          )
        )}
      </Stack>
    </Stack>
  );
}
