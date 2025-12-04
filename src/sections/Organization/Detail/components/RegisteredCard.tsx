import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { Iconify } from 'src/components/iconify';
import type { RegisteredCard as ApiRegisteredCard } from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

type RegisteredCardProps = {
  card: ApiRegisteredCard;
  cardMenuAnchor: HTMLElement | null;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onCardAction: (companyCardIdx: number, action: string) => void;
  getCardIcon: (type: string) => string;
};

export function RegisteredCard({
  card,
  cardMenuAnchor,
  onMenuOpen,
  onMenuClose,
  onCardAction,
  getCardIcon,
}: RegisteredCardProps) {
  // 카드 타입 추론 (카드번호 앞자리로 판단)
  const getCardType = (cardNo: string): 'visa' | 'mastercard' | 'amex' | 'other' => {
    const firstDigit = cardNo.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    if (firstDigit === '3') return 'amex';
    return 'other';
  };

  const cardType = getCardType(card.cardNo);
  const cardIcon = getCardIcon(cardType);

  return (
    <Card
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        minWidth: 200,
        flex: '1 1 200px',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* 상단: 아이콘, 대표카드 뱃지, 액션 버튼 */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 0.5,
                  bgcolor: 'grey.100',
                }}
              >
                <Iconify icon={cardIcon as any} width={32} />
              </Box>
              {card.isDefaultCard === 1 && (
                <Chip label="대표 카드" size="small" color="info" variant="soft" />
              )}
            </Stack>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuOpen(e);
              }}
              sx={{
                color: 'text.secondary',
              }}
            >
              <Iconify icon="eva:more-vertical-fill" width={20} />
            </IconButton>
            <Menu
              anchorEl={cardMenuAnchor}
              open={Boolean(cardMenuAnchor)}
              onClose={onMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {card.isDefaultCard !== 1 && (
                <MenuItem onClick={() => onCardAction(card.companyCardIdx, 'setPrimary')}>
                  대표 카드로 설정
                </MenuItem>
              )}
              <MenuItem onClick={() => onCardAction(card.companyCardIdx, 'edit')}>수정</MenuItem>
              <Divider />
              <MenuItem
                onClick={() => onCardAction(card.companyCardIdx, 'delete')}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.lighter',
                  },
                }}
              >
                삭제
              </MenuItem>
            </Menu>
          </Stack>

          {/* 하단: 카드명 및 카드 번호 */}
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {card.cardName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {card.cardNo}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

