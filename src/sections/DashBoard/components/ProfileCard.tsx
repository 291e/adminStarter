import { useRef, useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';
import { uploadFile } from 'src/services/system/system.service';
import { updateMyInfo } from 'src/services/member/member.service';

// ----------------------------------------------------------------------

// 역할 한글 맵핑 함수
const getRoleLabel = (role: string): string => {
  if (!role) return '';

  const roleUpper = role.toUpperCase();
  const roleMap: { [key: string]: string } = {
    OPERATOR_MANAGER: '조직 관리자',
    MANAGEMENT_SUPERVISOR: '관리 감독자',
    SAFETY_MANAGER: '안전보건 담당자',
    WORKER: '근로자',
    ADMIN: '조직 관리자',
    MEMBER: '근로자',
    // 소문자 키 (하위 호환성)
    operator_manager: '조직 관리자',
    management_supervisor: '관리 감독자',
    safety_manager: '안전보건 담당자',
    worker: '근로자',
    admin: '조직 관리자',
    member: '근로자',
  };

  return roleMap[roleUpper] || roleMap[role] || role;
};

type Props = {
  name: string;
  label: string;
  roles: string[];
  educationRate: number;
  memberThumbnail?: string;
  onViewDetail?: () => void;
  isSuperAdmin?: boolean;
};

export default function ProfileCard({
  name,
  label,
  roles,
  educationRate,
  memberThumbnail,
  onViewDetail,
  isSuperAdmin,
}: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 슈퍼어드민 여부 (truthy 값이면 슈퍼어드민)
  const isSuperAdminFlag = !!isSuperAdmin;

  // label을 한글로 변환 (슈퍼어드민이면 '최고관리자')
  const labelKorean = isSuperAdminFlag ? '최고관리자' : getRoleLabel(label);

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (
      url.startsWith('data:image/png;base64,data/admin/') ||
      url.startsWith('data:image/png;base64,/data/admin/')
    ) {
      // base64 접두사를 제거하고 URL로 처리
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) {
      return url;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    // data/admin/로 시작하는 경우도 처리
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  // 프로필 이미지 전체 URL
  const profileImageUrl = useMemo(() => getFullFileUrl(memberThumbnail), [memberThumbnail]);

  // 내 정보 수정 Mutation
  const updateMyInfoMutation = useMutation({
    mutationFn: (params: { memberThumbnail: string }) => updateMyInfo(params),
    onSuccess: () => {
      toast.success('프로필 사진이 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['myInfo'] });
      setIsUploading(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '프로필 사진 업데이트에 실패했습니다.';
      toast.error(errorMessage);
      setIsUploading(false);
    },
  });

  // 파일 선택 핸들러
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);

    try {
      // 파일 업로드
      const uploadResponse = await uploadFile({ files: [file] });

      // axios 인터셉터가 응답을 평탄화하므로 여러 형태 확인
      let fileUrl: string | undefined;

      // 형태 1: fileUrls 배열
      if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
        fileUrl = (uploadResponse as any).fileUrls[0];
      }
      // 형태 2: files 배열에서 fileUrl 추출
      else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
        fileUrl = (uploadResponse as any).files[0]?.fileUrl;
      }
      // 형태 3: data.fileUrls
      else if (
        (uploadResponse as any)?.data?.fileUrls &&
        Array.isArray((uploadResponse as any).data.fileUrls)
      ) {
        fileUrl = (uploadResponse as any).data.fileUrls[0];
      }

      if (!fileUrl) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      // 내 정보 수정 API 호출 - memberThumbnail만 포함
      await updateMyInfoMutation.mutateAsync({
        memberThumbnail: fileUrl,
      } as { memberThumbnail: string });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '파일 업로드에 실패했습니다.';
      toast.error(errorMessage);
      setIsUploading(false);
    } finally {
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 아바타 클릭 핸들러
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // IconButton 클릭 핸들러
  const handleIconButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 2.5 },
        pb: { xs: 2, sm: 2.5 },
        px: { xs: 2, sm: 2.5 },
        pt: { xs: 4, sm: 5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 3.5 },
        alignItems: { xs: 'center', sm: 'flex-start' },
        height: '100%',
        width: '100%',
      }}
    >
      {/* 프로필 아바타 */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Avatar
          src={profileImageUrl || undefined}
          onClick={handleAvatarClick}
          sx={{
            width: { xs: 80, sm: 96 },
            height: { xs: 80, sm: 96 },
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          {name[0]}
        </Avatar>
        <IconButton
          onClick={handleIconButtonClick}
          disabled={isUploading}
          sx={{
            position: 'absolute',
            left: { xs: 52, sm: 64 },
            top: { xs: 56, sm: 68 },
            bgcolor: 'text.primary',
            color: 'common.white',
            width: { xs: 24, sm: 28 },
            height: { xs: 24, sm: 28 },
            borderRadius: 1.75,
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'text.primary',
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          <Iconify icon="solar:pen-bold" width={16} />
        </IconButton>
      </Box>

      {/* 프로필 정보 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1.5 },
          width: '100%',
          alignItems: { xs: 'center', sm: 'stretch' },
        }}
      >
        {/* 이름 및 라벨 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 1.5 },
            alignItems: { xs: 'center', sm: 'center' },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {name}
          </Typography>
          <Chip
            label={labelKorean}
            size="small"
            sx={{
              height: 24,
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 700,
              bgcolor: 'grey.100',
              color: 'text.secondary',
            }}
          />
        </Box>

        {/* 역할 목록 */}
        <Box
          component="ul"
          sx={{
            m: 0,
            fontSize: { xs: 13, sm: 14 },
            color: 'text.secondary',
            lineHeight: '22px',
            textAlign: { xs: 'center', sm: 'left' },
            '& li': {
              mb: 0,
            },
          }}
        >
          {isSuperAdminFlag ? (
            <li>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: { xs: 13, sm: 14 } }}
              >
                최고관리자
              </Typography>
            </li>
          ) : (
            roles.map((role, index) => (
              <li key={index}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: { xs: 13, sm: 14 } }}
                >
                  {role}
                </Typography>
              </li>
            ))
          )}
        </Box>

        {/* 교육이수율 */}
        <Box
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            p: { xs: 1.25, sm: 1.5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 1.5 },
            width: '100%',
            minHeight: 86,
            maxWidth: 314,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>
              교육이수율
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              ({educationRate}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={educationRate}
            sx={{
              height: 8,
              borderRadius: '50px',
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                borderRadius: '50px',
                bgcolor: '#2563E9',
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={20} />}
            onClick={onViewDetail}
            sx={{
              alignSelf: { xs: 'stretch', sm: 'flex-end' },
              minHeight: 36,
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 700,
              borderColor: '#2563E9',
              color: '#2563E9',
              '&:hover': {
                borderColor: '#2563E9',
                bgcolor: 'rgba(37, 99, 233, 0.04)',
              },
            }}
          >
            상세보기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
