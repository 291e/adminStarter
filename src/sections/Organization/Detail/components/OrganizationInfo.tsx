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
import type { Member } from 'src/sections/Organization/types/member';
import type { Company } from 'src/_mock/_company';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

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
const DIVISION_OPTIONS = ['운영사', '회원사', '총판', '대리점', '딜러', '비회원'];

type Props = {
  organization: Company | undefined;
  organizationMembers: Member[];
  onInviteMember?: () => void;
  onEditOrganization?: () => void;
  onTabChange?: (tabValue: number) => void;
};

export default function OrganizationInfo({
  organization,
  organizationMembers,
  onInviteMember,
  onEditOrganization,
  onTabChange,
}: Props) {
  const [tabValue, setTabValue] = useState(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
    businessItem: '',
    address: '',
    detailAddress: '',
    manager: '',
    division: '',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    onTabChange?.(newValue);
  };

  // 조직 정보 초기화
  const orgData = useMemo(
    () =>
      organization || {
        companyIdx: 0,
        companyName: '이편한 자동화기술',
        companyType: '법인 사업자',
        businessNumber: '122-56-55475',
        representativeName: '김안전',
        representativePhone: '010-0123-4567',
        representativeEmail: 'safe@safeyou.kr',
        businessCategory: '제조업',
        businessItem: '안전보건',
        address: '대전광역시 유성구 복용동로 342',
        detailAddress: '필드빌딩 2층',
        manager: '김안전',
        division: '운영사',
        lastAccessIp: '168.126.222.111',
        createAt: '2025-10-23 16:55:45',
        lastAccessDate: '2025-10-23 16:55:45',
      },
    [organization]
  );

  // 조직 정보가 변경되면 formData 초기화
  useEffect(() => {
    setFormData({
      companyName: orgData.companyName || '',
      companyType: orgData.companyType || '',
      businessNumber: orgData.businessNumber || '',
      representativeName: orgData.representativeName || '',
      representativePhone: orgData.representativePhone || '',
      representativeEmail: orgData.representativeEmail || '',
      businessCategory: orgData.businessCategory || '',
      businessItem: orgData.businessItem || '',
      address: orgData.address || '',
      detailAddress: orgData.detailAddress || '',
      manager: orgData.manager || '',
      division: orgData.division || '',
    });
  }, [orgData]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 조직정보 수정 API 호출
    // const mutation = useMutation({
    //   mutationFn: (data: OrganizationFormData) => updateOrganization(organization?.companyIdx, data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['organization', organization?.companyIdx] });
    //     setIsEditMode(false);
    //     // 성공 토스트 메시지 표시
    //   },
    //   onError: (error) => {
    //     console.error('조직정보 수정 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // mutation.mutate(formData);
    setIsEditMode(false);
    onEditOrganization?.();
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

  // 첫 번째 멤버의 정보를 기본값으로 사용
  const firstMember = organizationMembers[0];
  const registrationDate = fDateTime(orgData.createAt, 'YYYY-MM-DD HH:mm:ss');
  const lastAccessDate = orgData.lastAccessDate
    ? fDateTime(orgData.lastAccessDate, 'YYYY-MM-DD HH:mm:ss')
    : firstMember?.lastSigninDate
      ? fDateTime(firstMember.lastSigninDate, 'YYYY-MM-DD HH:mm:ss')
      : '-';

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
                  최근 접속 IP
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                  {orgData.lastAccessIp || '-'}
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

                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minHeight: 96 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 100,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                      pt: 1.5,
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
                    value={formData.division}
                    onChange={(e) => handleChange('division', e.target.value)}
                    disabled={!isEditMode}
                    sx={{
                      fontSize: 15,
                      lineHeight: '24px',
                    }}
                  >
                    {DIVISION_OPTIONS.map((option) => (
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
                    담당자
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.manager}
                    onChange={(e) => handleChange('manager', e.target.value)}
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
                <DialogBtn variant="contained" onClick={handleSave}>
                  저장
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
        onSend={(data) => {
          // TODO: TanStack Query Hook(useMutation)으로 조직원 초대 API 호출
          // const mutation = useMutation({
          //   mutationFn: (data: InviteMemberFormData) => inviteMember(organization?.companyIdx, data),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['organization', organization?.companyIdx, 'members'] });
          //     // 성공 토스트 메시지 표시
          //   },
          //   onError: (error) => {
          //     console.error('조직원 초대 실패:', error);
          //     // 에러 토스트 메시지 표시
          //   },
          // });
          // mutation.mutate(data);
          console.log('조직원 초대:', data);
          onInviteMember?.();
        }}
        organizationName={orgData.companyName}
      />

      {tabValue === 1 && (
        <AccidentFreeWorkplace organizationId={organization?.companyIdx?.toString()} />
      )}

      {tabValue === 2 && (
        <SubscriptionService
          onUpgrade={(planId) => {
            // TODO: TanStack Query Hook(useMutation)으로 서비스 업그레이드
            // const mutation = useMutation({
            //   mutationFn: (planId: string) => upgradeSubscriptionService(organizationId, planId),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'subscription'] });
            //   },
            // });
            // mutation.mutate(planId);
            console.log('서비스 업그레이드:', planId);
          }}
          onCancel={() => {
            // TODO: TanStack Query Hook(useMutation)으로 서비스 취소
            // const mutation = useMutation({
            //   mutationFn: () => cancelSubscriptionService(organizationId),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'subscription'] });
            //   },
            // });
            // mutation.mutate();
            console.log('서비스 취소');
          }}
          onAddCard={() => {
            // TODO: 카드 추가 모달 열기 (모달 내부에서 TanStack Query Hook(useMutation) 사용)
            // const mutation = useMutation({
            //   mutationFn: (cardData: CardFormData) => addPaymentCard(organizationId, cardData),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'paymentCards'] });
            //   },
            // });
            console.log('카드 추가');
          }}
          onCardMenuClick={(cardId, action) => {
            // TODO: TanStack Query Hook(useMutation)으로 카드 액션 처리 (대표 카드 설정, 수정, 삭제)
            // const mutation = useMutation({
            //   mutationFn: () => {
            //     if (action === 'setPrimary') return setPrimaryCard(organizationId, cardId);
            //     if (action === 'edit') return updatePaymentCard(organizationId, cardId, cardData);
            //     if (action === 'delete') return deletePaymentCard(organizationId, cardId);
            //   },
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'paymentCards'] });
            //   },
            // });
            // mutation.mutate();
            console.log('카드 액션:', cardId, action);
          }}
        />
      )}
    </Box>
  );
}
