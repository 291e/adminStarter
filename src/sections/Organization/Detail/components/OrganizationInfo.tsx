import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useState, useEffect, useMemo } from 'react';

import { fDateTime } from 'src/utils/format-time';
import type { Organization, CompanyType } from 'src/services/organization/organization.types';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useUpdateOrganization } from '../../hooks/use-organization-api';
import { useQueryClient } from '@tanstack/react-query';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';

import SubscriptionService from './SubscriptionService';
import AccidentFreeWorkplace from './AccidentFreeWorkplace';
import InviteMemberModal from './InviteMemberModal';

// 다음 주소 API 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
        }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}

// ----------------------------------------------------------------------

const BUSINESS_TYPE_OPTIONS = ['법인 사업자', '개인 사업자'];
const DIVISION_OPTIONS: Array<{ label: string; value: CompanyType }> = [
  { label: '운영사', value: 'OPERATOR' },
  { label: '회원사', value: 'MEMBER' },
  { label: '총판', value: 'DISTRIBUTOR' },
  { label: '대리점', value: 'AGENCY' },
  { label: '딜러', value: 'DEALER' },
  { label: '비회원', value: 'NON_MEMBER' },
];

// businessType을 숫자로 변환 (0: 법인 사업자, 1: 개인 사업자)
const businessTypeToNumber = (businessType: string): number | undefined => {
  if (!businessType) return undefined;
  if (businessType === '법인 사업자') {
    return 0;
  }
  if (businessType === '개인 사업자') {
    return 1;
  }
  // 이미 숫자 문자열인 경우
  const num = Number(businessType);
  return isNaN(num) ? undefined : num;
};

// 숫자를 businessType 문자열로 변환 (0: 법인 사업자, 1: 개인 사업자)
const numberToBusinessType = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? Number(value) : value;
  if (num === 0) return '법인 사업자';
  if (num === 1) return '개인 사업자';
  return '';
};

type Props = {
  organization: Organization;
  organizationId: number;
  onTabChange?: (tabValue: number) => void;
  companyMemberList?: any[]; // 조직 상세 API 응답의 companyMemberList (담당자 정보 조회용)
};

export default function OrganizationInfo({
  organization,
  organizationId,
  onTabChange,
  companyMemberList,
}: Props) {
  const queryClient = useQueryClient();
  const updateOrganizationMutation = useUpdateOrganization();
  const { data: myInfo } = useMyInfo();
  const [tabValue, setTabValue] = useState(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 슈퍼 어드민 여부 확인
  const isSuperAdmin = useMemo(() => myInfo?.isSuperAdmin === true, [myInfo]);

  // 다음 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
      if (existingScript && document.head.contains(existingScript)) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    businessNumber: '',
    representativeName: '',
    representativePhone: '',
    representativeEmail: '',
    businessCategory: '',
    businessType: '',
    businessItem: '',
    address: '',
    detailAddress: '',
    division: '',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    onTabChange?.(newValue);
  };

  // 조직 정보 초기화
  const orgData = useMemo(() => organization, [organization]);

  // 조직 정보가 변경되면 formData 초기화
  useEffect(() => {
    if (orgData) {
      const newFormData = {
        companyName: orgData.companyName || '',
        companyType: numberToBusinessType(orgData.businessType), // 사업자 유형 (법인 사업자, 개인 사업자)
        businessNumber: orgData.businessNumber || '',
        representativeName: orgData.representativeName || '',
        representativePhone: orgData.phone || '',
        representativeEmail: orgData.email || '',
        businessCategory: orgData.businessCategory || '',
        businessType: orgData.businessType ? String(orgData.businessType) : '', // 숫자 문자열로 저장 (변환용)
        businessItem: orgData.businessItem || '',
        address: orgData.address || '',
        detailAddress: orgData.addressDetail || '',
        division: orgData.companyType || '', // 구분 (OPERATOR, MEMBER 등)
      };

      setFormData(newFormData);
    }
  }, [orgData]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    try {
      // 수정 요청 파라미터 구성
      const updateParams: any = {
        companyIdx: organizationId,
        companyName: formData.companyName,
        businessNumber: formData.businessNumber || undefined,
        address: formData.address || undefined,
        phone: formData.representativePhone || undefined,
        email: formData.representativeEmail || undefined,
        representativeName: formData.representativeName || undefined,
        businessType: businessTypeToNumber(formData.businessType),
        businessCategory: formData.businessCategory || undefined,
        businessItem: formData.businessItem || undefined,
      };

      // 슈퍼 어드민인 경우에만 companyType 전송
      if (isSuperAdmin && formData.division) {
        updateParams.companyType = formData.division as CompanyType;
      }

      if (import.meta.env.DEV) {
        console.log('💾 [조직정보 수정 시작]', {
          organizationId,
          formData,
          updateParams,
          orgData,
        });
      }

      const result = await updateOrganizationMutation.mutateAsync(updateParams);

      if (import.meta.env.DEV) {
        console.log('✅ [조직정보 수정 성공]', {
          result,
          updateParams,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['organizationDetail', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsEditMode(false);

      if (import.meta.env.DEV) {
        console.log('✅ [조직정보 수정 완료 - 쿼리 무효화 완료]');
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ [조직정보 수정 실패]', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          organizationId,
          formData,
        });
      }
      console.error('❌ [조직정보 수정 실패]', error);
    }
  };

  const handleSearchAddress = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let addr = '';
        if (data.addressType === 'R') {
          // 도로명 주소
          addr = data.address;
        } else {
          // 지번 주소
          addr = data.address;
        }
        handleChange('address', addr);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const registrationDate = orgData.createAt
    ? fDateTime(orgData.createAt, 'YYYY-MM-DD HH:mm:ss')
    : '-';

  // 담당자 정보에서 접속일과 최근 접속 IP 가져오기
  const managerMemberIdx = (orgData as any).managerMemberIdx;
  const managerMember = companyMemberList?.find(
    (member: any) => member.memberIdx === managerMemberIdx
  );
  const lastAccessDate = managerMember?.lastSigninAt
    ? fDateTime(managerMember.lastSigninAt, 'YYYY-MM-DD HH:mm:ss')
    : '-';
  const lastAccessIP = managerMember?.lastSigninIP || managerMember?.ipAddress || '-';

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
        overflow: 'hidden',
      }}
    >
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
        <Tab label="조직 정보" />
        <Tab label="무재해 사업장" />
        <Tab label="구독 서비스" />
      </Tabs>

      {tabValue === 0 && (
        <Box bgcolor="grey.50" sx={{ p: 3 }}>
          <Stack spacing={1}>
            {/* 등록일 */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="subtitle2"
                sx={{
                  minWidth: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '22px',
                }}
              >
                등록일
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                {registrationDate}
              </Typography>
            </Stack>

            {/* 접속일 / 최근 접속 IP */}
            <Stack direction="row" spacing={10} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    minWidth: 100,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '22px',
                  }}
                >
                  접속일
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                  {lastAccessDate}
                </Typography>
              </Stack>
            </Stack>

            {/* 조직 정보 입력 필드들 */}
            <Stack direction="row" spacing={10} sx={{ mt: 3 }}>
              {/* 왼쪽 컬럼 */}
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    조직명
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    사업자 유형
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={formData.companyType}
                    onChange={(e) => handleChange('companyType', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      fontSize: 15,
                      lineHeight: '24px',
                    }}
                  >
                    {BUSINESS_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    대표자명
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.representativeName}
                    onChange={(e) => handleChange('representativeName', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    종목
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.businessItem}
                    onChange={(e) => handleChange('businessItem', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  sx={{ minHeight: 96, pt: 0.5 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                      pt: 1,
                    }}
                  >
                    사업장 주소
                  </Typography>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        disabled={!isEditMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: 15,
                            lineHeight: '24px',
                          },
                        }}
                      />
                      {isEditMode && (
                        <Button
                          variant="contained"
                          size="medium"
                          color="info"
                          onClick={handleSearchAddress}
                          sx={{
                            height: 40,
                          }}
                        >
                          검색
                        </Button>
                      )}
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.detailAddress}
                      onChange={(e) => handleChange('detailAddress', e.target.value)}
                      disabled={!isEditMode}
                      placeholder="상세주소"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: 15,
                          lineHeight: '24px',
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Stack>

              {/* 오른쪽 컬럼 */}
              <Stack spacing={1} sx={{ flex: 1 }}>
                {isSuperAdmin && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        minWidth: 100,
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: '22px',
                      }}
                    >
                      구분
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={formData.division || ''}
                      onChange={(e) => handleChange('division', e.target.value)}
                      disabled={!isEditMode}
                      sx={{
                        fontSize: 15,
                        lineHeight: '24px',
                      }}
                    >
                      {DIVISION_OPTIONS.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          disabled={option.value === 'OPERATOR'}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                )}

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    사업자 번호
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.businessNumber}
                    onChange={(e) => handleChange('businessNumber', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    업태
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.businessCategory}
                    onChange={(e) => handleChange('businessCategory', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    대표 전화번호
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.representativePhone}
                    onChange={(e) => handleChange('representativePhone', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 48 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                    }}
                  >
                    대표 이메일
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.representativeEmail}
                    onChange={(e) => handleChange('representativeEmail', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 15,
                        lineHeight: '24px',
                      },
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>

            {/* 버튼 */}
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
              <DialogBtn
                variant="outlined"
                onClick={() => setInviteModalOpen(true)}
                sx={{
                  bgcolor: '#2563e9',
                  color: '#ffffff',
                  borderColor: '#2563e9',
                  '&:hover': {
                    bgcolor: '#1e4ed8',
                    borderColor: '#1e4ed8',
                  },
                }}
              >
                조직원 초대
              </DialogBtn>
              {isEditMode ? (
                <DialogBtn
                  variant="contained"
                  onClick={handleSave}
                  disabled={updateOrganizationMutation.isPending}
                >
                  {updateOrganizationMutation.isPending ? '저장 중...' : '저장'}
                </DialogBtn>
              ) : (
                <DialogBtn variant="contained" onClick={handleEditClick}>
                  조직정보 수정
                </DialogBtn>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* 조직원 초대 모달 */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        companyIdx={organizationId}
        organizationName={orgData.companyName}
      />

      {tabValue === 1 && <AccidentFreeWorkplace organizationId={organizationId.toString()} />}

      {tabValue === 2 && <SubscriptionService organizationId={organizationId.toString()} />}
    </Box>
  );
}
