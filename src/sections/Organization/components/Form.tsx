import React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import { fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { Iconify } from 'src/components/iconify';

import type { OrganizationMember } from 'src/_mock/_organization';

type Props = {
  value?: OrganizationMember | null;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit?: (payload: Partial<OrganizationMember>) => void;
  onSearchAddress?: () => void;
  lastAccessIp?: string;
};

export default function OrganizationForm({
  value,
  mode,
  onCancel,
  onSubmit,
  onSearchAddress,
  lastAccessIp,
}: Props) {
  const [orgName, setOrgName] = React.useState<string>(value?.orgName ?? '');
  const [name, setName] = React.useState<string>(value?.name ?? '');
  const [phone, setPhone] = React.useState<string>(value?.phone ?? '');
  const [email, setEmail] = React.useState<string>(value?.email ?? '');
  const [address, setAddress] = React.useState<string>(value?.address ?? '');
  const [status, setStatus] = React.useState<'active' | 'inactive'>(value?.status ?? 'active');
  const [orgType, setOrgType] = React.useState<'' | '운영사' | '회원사'>('');

  const navigate = useNavigate();

  const isComplete =
    mode === 'create'
      ? Boolean(orgType && orgName && name && phone && email && address)
      : Boolean(orgName && name && phone && email && address);

  const handleSubmit = () => {
    onSubmit?.({ orgName, name, phone, email, address, status });
  };

  return (
    <Paper>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton aria-label="back" onClick={() => navigate('/dashboard/organization')}>
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
          <Typography variant="h4">{mode === 'create' ? '조직 등록' : '조직 정보 수정'}</Typography>
        </Stack>

        {mode === 'create' && (
          <Box sx={{ maxWidth: '50%' }}>
            <LabeledRow label="조직 구분">
              <FormControl fullWidth size="medium">
                <InputLabel id="org-type-label">조직 구분</InputLabel>
                <Select
                  labelId="org-type-label"
                  label="조직 구분"
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as any)}
                >
                  <MenuItem value="" disabled hidden>
                    선택
                  </MenuItem>
                  <MenuItem value="운영사">운영사</MenuItem>
                  <MenuItem value="회원사">회원사</MenuItem>
                </Select>
              </FormControl>
            </LabeledRow>
          </Box>
        )}

        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* 좌측 컬럼 */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* 조직 구분 (등록) / 등록일·IP·접속일 (수정) */}
            {mode === 'edit' && (
              <>
                <LabeledText
                  label="등록일"
                  value={
                    value?.registeredAt ? fDateTime(value.registeredAt, 'YYYY-MM-DD HH:mm:ss') : ''
                  }
                />
                <LabeledText label="최근 접속 IP" value={lastAccessIp ?? '-'} />
              </>
            )}

            <LabeledRow label="조직명">
              <TextField
                fullWidth
                placeholder="이편한 자동화기술"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </LabeledRow>
            <LabeledRow label="사업자 유형">
              <TextField fullWidth placeholder="법인" />
            </LabeledRow>
            <LabeledRow label="대표자명">
              <TextField
                fullWidth
                placeholder="김안전"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </LabeledRow>
            <LabeledRow label="사업자번호">
              <TextField fullWidth placeholder="122-56-55475" />
            </LabeledRow>
          </Grid>

          {/* 우측 컬럼 */}
          <Grid size={{ xs: 12, md: 6 }}>
            {mode === 'edit' && (
              <LabeledText
                label="접속일"
                value={
                  value?.lastAccessedAt
                    ? fDateTime(value.lastAccessedAt, 'YYYY-MM-DD HH:mm:ss')
                    : ''
                }
              />
            )}

            <LabeledRow label="대표번호">
              <TextField
                fullWidth
                placeholder="02-222-2222"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </LabeledRow>
            <LabeledRow label="업태">
              <TextField fullWidth placeholder="안전" />
            </LabeledRow>
            <LabeledRow label="종목">
              <TextField fullWidth placeholder="안전" />
            </LabeledRow>

            <LabeledRow label="사업장 주소">
              <Stack direction="row" spacing={1} sx={{ width: 1 }}>
                <TextField
                  fullWidth
                  placeholder="서울특별시 강남구 강남동 강남대로 342"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Button variant="contained" onClick={onSearchAddress}>
                  검색
                </Button>
              </Stack>
            </LabeledRow>
            <LabeledRow label=" ">
              <TextField fullWidth placeholder="강남 빌딩 2층" />
            </LabeledRow>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" disabled={!isComplete}>
            직원 등록
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === 'create' ? '저장' : '저장'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ----------------------------------------------------------------------

type RowProps = { label: string; children: React.ReactNode };

function LabeledRow({ label, children }: RowProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 48, mb: 1.5 }}>
      <Box sx={{ width: 100 }}>
        <Typography variant="subtitle2">{label}</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Stack>
  );
}

type TextProps = { label: string; value: string };

function LabeledText({ label, value }: TextProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 32, mb: 1 }}>
      <Box sx={{ width: 100 }}>
        <Typography variant="subtitle2">{label}</Typography>
      </Box>
      <Typography variant="body2" color="text.primary">
        {value || '-'}
      </Typography>
    </Stack>
  );
}
