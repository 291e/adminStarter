import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ApprovalType = 'writer' | 'approver' | 'reviewer';

export type ApprovalSignature = {
  type: ApprovalType;
  name?: string;
  date?: string;
  signature?: string; // 서명 이미지 또는 base64
};

type Props = {
  signatures: ApprovalSignature[];
  onAddSignature: () => void;
  onRemoveSignature: (type: ApprovalType) => void;
  onSelectMember: (type: ApprovalType) => void;
  onRequestSignature: (type: ApprovalType) => void;
};

const COLUMN_ORDER: ApprovalType[] = ['writer', 'reviewer', 'approver'];
const TYPE_LABEL: Record<ApprovalType, string> = {
  writer: '작성',
  reviewer: '검토',
  approver: '승인',
};

export default function EditApprovalSection({
  signatures,
  onAddSignature,
  onRemoveSignature,
  onSelectMember,
  onRequestSignature,
}: Props) {
  const getSignature = (type: ApprovalType) => signatures.find((item) => item.type === type);

  const displayTypes = COLUMN_ORDER.filter((type) => !!getSignature(type));
  const columnCount = displayTypes.length;
  const canAddSignature = columnCount < COLUMN_ORDER.length;
  const tableWidth = 47 + columnCount * 98;
  const hasAllSteps = columnCount === 3;

  const renderHeaderLabel = (type: ApprovalType) => {
    if (columnCount === 1) {
      return TYPE_LABEL.approver;
    }
    return TYPE_LABEL[type];
  };

  const renderSignatureArea = (type: ApprovalType) => {
    const signature = getSignature(type);
    if (signature?.signature) {
      return (
        <Box
          component="button"
          type="button"
          onClick={() => onRequestSignature(type)}
          sx={{
            border: 0,
            p: 0,
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <Box
            component="img"
            src={signature.signature}
            alt={`${TYPE_LABEL[type]} 서명`}
            sx={{
              width: 90,
              height: 40,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>
      );
    }
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => onRequestSignature(type)}
        sx={{
          width: 90,
          height: 40,
          borderRadius: 1,
          fontSize: 14,
          fontWeight: 600,
          color: 'text.primary',
          borderColor: 'rgba(145,158,171,0.2)',
          '&:hover': { borderColor: 'text.primary' },
        }}
      >
        서명등록
      </Button>
    );
  };

  const renderInfoArea = (type: ApprovalType) => {
    const signature = getSignature(type);
    if (!signature?.name) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSelectMember(type)}
          sx={{
            width: 90,
            height: 30,
            borderRadius: 1,
            fontSize: 13,
            fontWeight: 600,
            color: 'text.primary',
            borderColor: 'rgba(145,158,171,0.2)',
            '&:hover': { borderColor: 'text.primary' },
          }}
        >
          대상자 선택
        </Button>
      );
    }

    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'rgba(145,158,171,0.2)',
          borderRadius: 1,
          px: 1.25,
          py: 0.25,
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '20px',
              color: 'text.primary',
            }}
          >
            {signature.name}
          </Typography>
          {signature.date && (
            <Typography
              sx={{
                fontSize: 12,
                lineHeight: '18px',
                color: 'text.secondary',
              }}
            >
              {signature.date}
            </Typography>
          )}
        </Box>
        {type !== 'writer' && (
          <IconButton
            size="small"
            onClick={() => onRemoveSignature(type)}
            sx={{
              p: 0.5,
            }}
          >
            <Iconify icon="mingcute:close-line" width={16} />
          </IconButton>
        )}
      </Box>
    );
  };

  const renderEmptyState = () => (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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
              rowSpan={3}
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
            <td style={{ width: 100, height: 32 }}>{TYPE_LABEL.writer}</td>
          </tr>
          <tr>
            <td style={{ width: 100, height: 68 }}>{renderSignatureArea('writer')}</td>
          </tr>
          <tr>
            <td style={{ width: 100, height: 58, fontWeight: 400 }}>{renderInfoArea('writer')}</td>
          </tr>
        </tbody>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={() => onSelectMember('writer')}
        sx={{
          bgcolor: '#2563eb',
          color: '#fff',
          minHeight: 30,
          fontSize: 13,
          fontWeight: 700,
          borderRadius: 1,
          px: 2,
        }}
      >
        대상자 선택
      </Button>
      {canAddSignature && (
        <Button
          variant="contained"
          size="small"
          onClick={onAddSignature}
          sx={{
            bgcolor: '#078dee',
            minHeight: 28,
            fontSize: 12,
            fontWeight: 500,
            px: 1.5,
            borderRadius: 0.5,
          }}
        >
          서명 추가
        </Button>
      )}
    </Box>
  );

  if (!columnCount) {
    return renderEmptyState();
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Box
        component="table"
        sx={{
          border: '2px solid',
          borderColor: 'text.primary',
          borderCollapse: 'collapse',
          width: tableWidth,
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
                height: hasAllSteps ? 170 : 158,
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
            {displayTypes.map((type) => (
              <td key={`header-${type}`} style={{ width: 98, height: 37 }}>
                {renderHeaderLabel(type)}
              </td>
            ))}
          </tr>
          <tr>
            {displayTypes.map((type) => (
              <td key={`signature-${type}`} style={{ width: 98, height: 73 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {renderSignatureArea(type)}
                </Box>
              </td>
            ))}
          </tr>
          <tr>
            {displayTypes.map((type) => (
              <td key={`info-${type}`} style={{ width: 98, height: 58, fontWeight: 400 }}>
                {renderInfoArea(type)}
              </td>
            ))}
          </tr>
        </tbody>
      </Box>
      {canAddSignature && (
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
            borderRadius: 0.5,
          }}
        >
          서명 추가
        </Button>
      )}
    </Box>
  );
}
