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
};

export default function ApprovalSection({ onAddSignature, is2100Series = false }: Props) {
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
                  유승용
                  <br />
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
                  양종일
                  <br />
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
                  박찬배
                  <br />
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
            onClick={onAddSignature}
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
              &apos;25. 5 .9
            </td>
          </tr>
        </tbody>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={onAddSignature}
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
