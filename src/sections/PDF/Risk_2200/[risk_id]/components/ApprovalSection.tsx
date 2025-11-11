import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  onAddSignature?: () => void;
  is2100Series?: boolean; // 2100번대 문서 여부
  riskId?: string; // 문서 ID
};

export default function ApprovalSection({ onAddSignature, is2100Series = false, riskId }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 결재 정보 가져오기
  // const { data: approvalInfo } = useQuery({
  //   queryKey: ['risk2200ApprovalInfo', riskId],
  //   queryFn: () => getRisk2200ApprovalInfo(riskId!),
  //   enabled: !!riskId,
  // });
  // 2100번대는 피그마 디자인에 맞게 4개 컬럼 (결재, 작성, 검토, 승인)
  if (is2100Series) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          component="table"
          sx={{
            border: '2px solid',
            borderColor: 'text.primary',
            borderCollapse: 'collapse',
            width: 347,
            tableLayout: 'fixed',
            '& td': {
              border: '1px solid',
              borderColor: 'text.primary',
              padding: 0,
              verticalAlign: 'middle',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '24px',
            },
          }}
        >
          <tbody>
            <tr>
              <td
                rowSpan={3}
                style={{
                  width: 47,
                  height: 158,
                  borderRight: '1px solid',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '24px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  결
                  <br />재
                </Typography>
              </td>
              <td style={{ width: 100, height: 32, fontSize: 16, fontWeight: 600 }}>작성</td>
              <td style={{ width: 100, height: 32, fontSize: 16, fontWeight: 600 }}>검 토</td>
              <td style={{ width: 100, height: 32, fontSize: 16, fontWeight: 600 }}>승 인</td>
            </tr>
            <tr>
              <td style={{ width: 100, height: 68 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {/* 서명 이미지 또는 빈 공간 */}
                </Box>
              </td>
              <td style={{ width: 100, height: 68 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {/* 서명 이미지 또는 빈 공간 */}
                </Box>
              </td>
              <td style={{ width: 100, height: 68 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {/* 서명 이미지 또는 빈 공간 */}
                </Box>
              </td>
            </tr>
            <tr>
              <td style={{ width: 100, height: 58, fontSize: 16, fontWeight: 400 }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  {/* TODO: TanStack Query로 가져온 작성자 정보 표시 */}
                  {/* {approvalInfo?.writer?.name || '유승용'} */}
                  유승용
                  <br />
                  {/* {approvalInfo?.writer?.date || '2025-10-20'} */}
                  2025-10-20
                </Typography>
              </td>
              <td style={{ width: 100, height: 58, fontSize: 16, fontWeight: 400 }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  {/* TODO: TanStack Query로 가져온 검토자 정보 표시 */}
                  {/* {approvalInfo?.reviewer?.name || '양종일'} */}
                  양종일
                  <br />
                  {/* {approvalInfo?.reviewer?.date || '2025-10-25'} */}
                  2025-10-25
                </Typography>
              </td>
              <td style={{ width: 100, height: 58, fontSize: 16, fontWeight: 400 }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  {/* TODO: TanStack Query로 가져온 승인자 정보 표시 */}
                  {/* {approvalInfo?.approver?.name || '박찬배'} */}
                  박찬배
                  <br />
                  {/* {approvalInfo?.approver?.date || '2025-10-27'} */}
                  2025-10-27
                </Typography>
              </td>
            </tr>
          </tbody>
        </Box>
        {onAddSignature && (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              // TODO: TanStack Query Hook(useMutation)으로 서명 추가
              // const mutation = useMutation({
              //   mutationFn: (signatureData: Risk2200SignatureParams) => addRisk2200Signature(signatureData),
              //   onSuccess: () => {
              //     queryClient.invalidateQueries({ queryKey: ['risk2200ApprovalInfo'] });
              //   },
              // });
              // mutation.mutate({ riskId, signatureType: 'writer' });
              onAddSignature();
            }}
            sx={{
              bgcolor: '#078dee',
              minHeight: 28,
              fontSize: 12,
              fontWeight: 500,
              px: 1,
              py: 0.875,
              borderRadius: 0.5,
            }}
          >
            서명 추가
          </Button>
        )}
      </Box>
    );
  }

  // 기존 레이아웃 (2200번대 등)
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: 218 }}>
      <Box
        component="table"
        sx={{
          border: '2px solid',
          borderColor: 'text.primary',
          borderCollapse: 'collapse',
          width: 147,
          tableLayout: 'fixed',
          '& td': {
            border: '1px solid',
            borderColor: 'text.primary',
            padding: 0,
            verticalAlign: 'middle',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '24px',
          },
        }}
      >
        <tbody>
          <tr>
            <td
              rowSpan={2}
              style={{
                width: 47,
                height: 100,
                borderRight: '1px solid',
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '24px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                결
                <br />재
              </Typography>
            </td>
            <td
              style={{
                width: 100,
                height: 32,
              }}
            >
              승 인
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: 100,
                height: 68,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <TextField
                  size="small"
                  placeholder="추가"
                  value=""
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end">
                          <Iconify icon="mingcute:close-line" width={16} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 89,
                    '& .MuiOutlinedInput-root': {
                      height: 40,
                      fontSize: 14,
                    },
                  }}
                />
              </Box>
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: 47,
                height: 32,
                borderRight: '1px solid',
              }}
            >
              일자
            </td>
            <td
              style={{
                width: 100,
                height: 32,
                fontWeight: 400,
              }}
            >
              {/* TODO: TanStack Query로 가져온 결재 일자 표시 */}
              {/* {approvalInfo?.approvalDate || "'25. 5 .9"} */}
              &apos;25. 5 .9
            </td>
          </tr>
        </tbody>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          // TODO: TanStack Query Hook(useMutation)으로 서명 추가
          // const mutation = useMutation({
          //   mutationFn: (signatureData: Risk2200SignatureParams) => addRisk2200Signature(signatureData),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['risk2200ApprovalInfo'] });
          //   },
          // });
          // mutation.mutate({ riskId, signatureType: 'approver' });
          onAddSignature?.();
        }}
        sx={{
          bgcolor: '#078dee',
          minHeight: 28,
          fontSize: 12,
          fontWeight: 500,
          px: 1,
          py: 0.875,
          borderRadius: 0.5,
        }}
      >
        서명 추가
      </Button>
    </Box>
  );
}
