import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { Iconify } from 'src/components/iconify';
import { getChatAvatarUrl } from 'src/sections/Chat/utils/avatar';
import { resolveFileUrl } from 'src/sections/Chat/utils/file-url';

const reverseGeocodeCache = new Map<string, string>();
let reverseGeocodeDisabled = false;

type LocationMetadata = {
  latitude: number;
  longitude: number;
  address?: string;
};

type MessageMetadata = {
  type?:
    | 'rescue_request'
    | 'evacuation_signal'
    | 'evacuation'
    | 'risk_report'
    | 'accident_report'
    | 'video'
    | 'multi_image'
    | 'image'
    | 'file'
    | string;
  location?: LocationMetadata;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  address?: string;
  addressTranslations?: Record<string, string>;
};

type Props = {
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  avatarUrl?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  sharedDocumentIdx?: number;
  attachments?: string[] | null;
  metadata?: MessageMetadata;
  onFileClick?: (sharedDocumentIdx: number) => void;
};

// 이미지 URL 패턴 파싱 함수 (앱에서 보낸 [이미지]|URL 또는 사고 현장 보고 [이미지]|URL 형식)
function parseImageMessage(message: string): {
  isImage: boolean;
  imageUrl?: string;
  label?: string;
} {
  // 패턴 1: [이미지]|URL
  // 패턴 2: 사고 현장 보고 [이미지]|URL
  const imagePattern = /^(.*?)\s*\[이미지\]\|(.+)$/s;
  const match = message.match(imagePattern);

  if (match) {
    const label = match[1].replace(/\s+$/, '').trim();
    const imageUrl = match[2].trim();
    return { isImage: true, imageUrl, label: label || undefined };
  }

  return { isImage: false };
}

// 동영상 URL 패턴 파싱 함수 ([동영상]|URL 형식)
function parseVideoMessage(message: string): {
  isVideo: boolean;
  videoUrl?: string;
} {
  const videoPattern = /^(.*?)\s*\[동영상\]\|(.+)$/s;
  const match = message.match(videoPattern);

  if (match) {
    const videoUrl = match[2].trim();
    return { isVideo: true, videoUrl };
  }

  return { isVideo: false };
}

// URL이 이미지인지 확인
function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  // 쿼리 파라미터 제거하여 확장자 확인
  const urlPath = url.split('?')[0].toLowerCase();
  return imageExtensions.some((ext) => urlPath.endsWith(ext) || urlPath.includes(ext));
}

// URL이 동영상인지 확인
function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v', '.3gp'];
  // 쿼리 파라미터 제거하여 확장자 확인
  const urlPath = url.split('?')[0].toLowerCase();
  return videoExtensions.some((ext) => urlPath.endsWith(ext) || urlPath.includes(ext));
}

// 상대 경로 URL을 절대 경로로 변환 (서버 URL 기준)
function normalizeMediaUrl(url: string | undefined | null): string | null {
  return resolveFileUrl(url);
}

// 메타데이터 타입에 따른 레이블 반환
function getEmergencyTypeLabel(type?: string): string {
  switch (type) {
    case 'rescue_request':
      return '구조 요청';
    case 'evacuation_signal':
    case 'evacuation':
      return '대피 신호';
    case 'risk_report':
      return '위험 보고';
    default:
      return '긴급 신호';
  }
}

// OpenStreetMap 타일 URL 생성
// OSM 타일은 슬라이피 맵 타일 좌표 시스템 사용 (z/x/y)
function getStaticMapUrl(lat: number, lng: number, zoom: number = 15): string {
  // 위도/경도를 타일 좌표로 변환
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  // OpenStreetMap 공식 타일 서버 사용
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

export default function MessageBubble({
  sender,
  message,
  timestamp,
  isOwn,
  avatarUrl,
  messageType,
  sharedDocumentIdx,
  attachments,
  metadata,
  onFileClick,
}: Props) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(metadata?.location?.address || null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const normalizedAvatarUrl = getChatAvatarUrl(avatarUrl);

  const parsedSharedDocumentIdx =
    sharedDocumentIdx != null && !Number.isNaN(Number(sharedDocumentIdx))
      ? Number(sharedDocumentIdx)
      : null;
  const isSystemSharedDocumentNotice =
    messageType === 'SYSTEM' &&
    parsedSharedDocumentIdx !== null &&
    (message.includes('새 문서가 등록되었습니다') || message.includes('문서가 등록되었습니다'));
  const isSharedDocument =
    parsedSharedDocumentIdx !== null &&
    (messageType === 'FILE' || isSystemSharedDocumentNotice);
  const handleFileClick = () => {
    if (isSharedDocument && parsedSharedDocumentIdx && onFileClick) {
      onFileClick(parsedSharedDocumentIdx);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleVideoClick = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleMapClick = () => {
    setMapModalOpen(true);
  };

  const handleCloseMapModal = () => {
    setMapModalOpen(false);
  };

  // 역지오코딩으로 주소 가져오기
  useEffect(() => {
    const fetchAddress = async () => {
      if (!metadata?.location) return;
      if (metadata?.address) {
        if (metadata.address !== address) {
          setAddress(metadata.address);
        }
        return;
      }
      if (address) return;
      if (reverseGeocodeDisabled) {
        const { latitude, longitude } = metadata.location;
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        return;
      }

      const { latitude, longitude } = metadata.location;
      setIsLoadingAddress(true);

      try {
        const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
        const cached = reverseGeocodeCache.get(cacheKey);
        if (cached) {
          setAddress(cached);
          return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        // Nominatim (OpenStreetMap) 무료 API 사용
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error('Reverse geocoding failed');
        }

        const data = await response.json();

        if (data.display_name) {
          reverseGeocodeCache.set(cacheKey, data.display_name);
          setAddress(data.display_name);
        } else {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('역지오코딩 실패:', error);
        }
        reverseGeocodeDisabled = true;
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [metadata?.location, metadata?.address, address]);

  const isFileMessage = messageType === 'FILE';

  // 이미지 메시지 파싱 (앱에서 보낸 형식)
  const parsedImage = parseImageMessage(message);
  const parsedVideo = parseVideoMessage(message);
  const fileLabel = (metadata?.fileName || message || '첨부파일').trim();

  // metadata에서 동영상/이미지 확인 (RTDB 구조)
  const isVideoFromMetadata = metadata?.type === 'video' && metadata?.videoUrl;
  const isMultiImageFromMetadata =
    metadata?.type === 'multi_image' && metadata?.imageUrls && metadata.imageUrls.length > 0;
  const isSingleImageFromMetadata = metadata?.type === 'image' && metadata?.imageUrl;

  // 첨부파일 URL 정규화 (상대 경로 -> 절대 경로)
  const normalizedAttachments =
    attachments
      ?.map((url) => normalizeMediaUrl(url))
      .filter((url): url is string => url !== null) || [];

  // 미디어 첨부파일 필터링 (이미지와 동영상)
  const imageAttachments = normalizedAttachments.filter((url) => isImageUrl(url));
  const videoAttachments = normalizedAttachments.filter((url) => isVideoUrl(url));

  // metadata에서 온 이미지들 (multi_image) - 정규화 적용
  const metadataImageUrls =
    metadata?.imageUrls
      ?.map((url) => normalizeMediaUrl(url))
      .filter((url): url is string => url !== null) || [];
  // metadata에서 온 동영상 URL - 정규화 적용
  const metadataVideoUrl = normalizeMediaUrl(metadata?.videoUrl);
  const parsedVideoUrl = parsedVideo.videoUrl
    ? normalizeMediaUrl(parsedVideo.videoUrl)
    : null;
  const metadataFileUrl = normalizeMediaUrl(metadata?.fileUrl);
  const fileVideoUrl =
    metadataFileUrl &&
    (isVideoUrl(metadataFileUrl) || isVideoUrl(metadata?.fileName || ''))
      ? metadataFileUrl
      : null;
  // metadata에서 온 단일 이미지 URL - 정규화 적용
  const metadataSingleImageUrl = normalizeMediaUrl(metadata?.imageUrl);

  // 모든 이미지 모으기 (attachments + metadata.imageUrls + metadata.imageUrl)
  const allImageUrls: string[] = [
    ...imageAttachments,
    ...metadataImageUrls,
    ...(metadataSingleImageUrl ? [metadataSingleImageUrl] : []),
  ].filter((url, idx, arr) => arr.indexOf(url) === idx); // 중복 제거

  // 모든 동영상 모으기 (attachments + metadata.videoUrl)
  const allVideoUrls: string[] = [
    ...videoAttachments,
    ...(metadataVideoUrl ? [metadataVideoUrl] : []),
    ...(parsedVideoUrl ? [parsedVideoUrl] : []),
    ...(fileVideoUrl ? [fileVideoUrl] : []),
  ].filter((url, idx, arr) => arr.indexOf(url) === idx); // 중복 제거

  // 미디어 메시지 여부 (이미지 또는 동영상)
  const hasMediaAttachments =
    allImageUrls.length > 0 ||
    allVideoUrls.length > 0 ||
    isVideoFromMetadata ||
    isMultiImageFromMetadata ||
    isSingleImageFromMetadata;
  const isImageMessage = messageType === 'IMAGE' || parsedImage.isImage || hasMediaAttachments;

  // 첫 번째 이미지 URL 결정 (단일 이미지용) - 정규화 적용
  const parsedImageUrl = parsedImage.imageUrl ? normalizeMediaUrl(parsedImage.imageUrl) : null;
  const imageUrl = parsedImageUrl || (allImageUrls.length > 0 ? allImageUrls[0] : null);

  const emergencyType = (metadata?.type || '').toString();
  const isEmergencyCardType = ['rescue_request', 'evacuation_signal', 'accident_report'].includes(
    emergencyType
  );

  // 긴급 메시지 (위치 정보 포함)
  const isEmergencyWithLocation =
    Boolean(metadata?.location) && (messageType === 'EMERGENCY' || isEmergencyCardType);
  const emergencyTypeLabel = getEmergencyTypeLabel(emergencyType);

  // 이미지와 위치를 함께 가진 메시지 (사고 현장 보고)
  const isImageWithLocation = emergencyType === 'accident_report' && Boolean(metadata?.location);
  const accidentImageUrl =
    normalizeMediaUrl(metadata?.imageUrl) ||
    parsedImageUrl ||
    (allImageUrls.length > 0 ? allImageUrls[0] : null);

  // 동영상 렌더링 컴포넌트 (클릭하면 모달에서 재생)
  const renderVideoContent = (videoUrl: string) => (
    <Box
      onClick={() => handleVideoClick(videoUrl)}
      sx={{
        position: 'relative',
        maxWidth: 280,
        maxHeight: 200,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: 'black',
        '&:hover': {
          opacity: 0.9,
        },
      }}
    >
      <Box
        component="video"
        src={videoUrl}
        preload="metadata"
        sx={{
          maxWidth: 280,
          maxHeight: 200,
          objectFit: 'contain',
        }}
      />
      {/* 재생 버튼 오버레이 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={'mdi:play' as any} width={32} sx={{ color: 'white', ml: 0.5 }} />
      </Box>
    </Box>
  );

  // 파일 메시지 렌더링 컴포넌트
  const renderFileContent = () => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: 220 }}>
      <Iconify icon={'solar:file-bold' as any} width={20} sx={{ color: 'inherit' }} />
      <Typography
        variant="body2"
        sx={{
          fontSize: 14,
          lineHeight: '22px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'inherit',
        }}
      >
        {fileLabel || '첨부파일'}
      </Typography>
    </Stack>
  );

  // 이미지 메시지 렌더링 컴포넌트
  const renderImageContent = (imgUrl: string, label?: string) => (
    <Stack spacing={0.5}>
      {label && (
        <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
          {label}
        </Typography>
      )}
      <Box
        component="img"
        src={imgUrl}
        alt="채팅 이미지"
        onClick={() => handleImageClick(imgUrl)}
        sx={{
          maxWidth: 200,
          maxHeight: 200,
          borderRadius: 1,
          objectFit: 'cover',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.9,
          },
        }}
      />
    </Stack>
  );

  // 다중 첨부파일 (이미지/동영상) 렌더링 컴포넌트
  const renderMultipleAttachments = () => {
    if (allImageUrls.length === 0 && allVideoUrls.length === 0) return null;

    return (
      <Stack spacing={1}>
        {/* 이미지들 */}
        {allImageUrls.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {allImageUrls.map((imgUrl, idx) => (
              <Box
                key={`img-${idx}`}
                component="img"
                src={imgUrl}
                alt={`첨부 이미지 ${idx + 1}`}
                onClick={() => handleImageClick(imgUrl)}
                sx={{
                  width: allImageUrls.length === 1 ? 200 : 100,
                  height: allImageUrls.length === 1 ? 200 : 100,
                  borderRadius: 1,
                  objectFit: 'cover',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              />
            ))}
          </Stack>
        )}
        {/* 동영상들 */}
        {allVideoUrls.map((videoUrl, idx) => (
          <Box key={`video-${idx}`}>{renderVideoContent(videoUrl)}</Box>
        ))}
      </Stack>
    );
  };

  // 긴급 메시지 (지도 포함) 렌더링 컴포넌트
  const renderEmergencyContent = (location: LocationMetadata) => (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      {/* 지도 미리보기 */}
      <Box
        onClick={handleMapClick}
        sx={{
          position: 'relative',
          width: '100%',
          height: 120,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.9,
          },
        }}
      >
        {/* 정적 지도 이미지 */}
        {/* 지도 타일 */}
        <Box
          component="img"
          src={getStaticMapUrl(location.latitude, location.longitude)}
          alt="위치 지도"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            // 이미지 로드 실패 시 플레이스홀더 표시
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect fill="%23e0e0e0" width="300" height="150"/><text x="150" y="75" text-anchor="middle" fill="%23666" font-size="14">지도 로드 중...</text></svg>';
          }}
        />
        {/* 중앙 위치 마커 */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            color: 'error.main',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          <Iconify icon={'mdi:map-marker' as any} width={32} />
        </Box>
        {/* 긴급 타입 라벨 */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: ['evacuation_signal', 'evacuation'].includes(emergencyType)
              ? 'warning.main'
              : 'primary.main',
            color: 'white',
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {emergencyTypeLabel}
        </Box>
        {/* 확대 아이콘 */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255,255,255,0.8)',
            borderRadius: 0.5,
            p: 0.25,
          }}
        >
          <Iconify icon={'mingcute:fullscreen-line' as any} width={16} />
        </Box>
      </Box>
      {/* 주소 */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        {isLoadingAddress ? (
          <CircularProgress size={12} />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: 12,
              lineHeight: '18px',
              color: isOwn ? 'primary.contrastText' : 'text.primary',
            }}
          >
            {address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  // 사고 현장 보고 메시지 (이미지 + 지도 + 주소) 렌더링 컴포넌트
  const renderAccidentReportContent = (imgUrl: string, location: LocationMetadata) => (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      {/* 레이블 */}
      <Typography
        variant="body2"
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: isOwn ? 'primary.contrastText' : 'text.primary',
        }}
      >
        사고 현장 보고
      </Typography>

      {/* 이미지 */}
      <Box
        onClick={() => handleImageClick(imgUrl)}
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <Box
          component="img"
          src={imgUrl}
          alt="사고 현장 이미지"
          sx={{
            width: '100%',
            maxHeight: 150,
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* 지도 미리보기 */}
      <Box
        onClick={handleMapClick}
        sx={{
          position: 'relative',
          width: '100%',
          height: 80,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.9,
          },
        }}
      >
        <Box
          component="img"
          src={getStaticMapUrl(location.latitude, location.longitude)}
          alt="위치 지도"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80" viewBox="0 0 300 80"><rect fill="%23e0e0e0" width="300" height="80"/><text x="150" y="40" text-anchor="middle" fill="%23666" font-size="12">지도</text></svg>';
          }}
        />
        {/* 중앙 위치 마커 */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            color: 'error.main',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          <Iconify icon={'mdi:map-marker' as any} width={24} />
        </Box>
      </Box>

      {/* 주소 */}
      <Stack direction="row" spacing={0.5} alignItems="flex-start">
        {isLoadingAddress ? (
          <CircularProgress size={12} />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: 11,
              lineHeight: '16px',
              color: isOwn ? 'primary.contrastText' : 'text.secondary',
            }}
          >
            {address ||
              metadata?.address ||
              `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  // 지도 모달
  const renderMapModal = () => {
    if (!metadata?.location) return null;
    const { latitude, longitude } = metadata.location;

    return (
      <Dialog
        open={mapModalOpen}
        onClose={handleCloseMapModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={'mdi:map-marker' as any} width={24} color="error.main" />
            <Typography variant="h6">{emergencyTypeLabel} 위치</Typography>
          </Stack>
          <IconButton onClick={handleCloseMapModal}>
            <Iconify icon="mingcute:close-line" width={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {/* 지도 영역 - iframe으로 OpenStreetMap 표시 */}
          <Box
            sx={{
              width: '100%',
              height: 400,
              bgcolor: 'grey.200',
            }}
          >
            <iframe
              title="위치 지도"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}&layer=mapnik&marker=${latitude},${longitude}`}
            />
          </Box>
          {/* 주소 정보 */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                주소
              </Typography>
              <Typography variant="body1">
                {address || `위도: ${latitude}, 경도: ${longitude}`}
              </Typography>
              {/* 외부 지도에서 열기 버튼 */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Box
                  component="a"
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontSize: 13,
                    color: 'text.primary',
                    textDecoration: 'none',
                    '&:hover': {
                      bgcolor: 'grey.200',
                    },
                  }}
                >
                  <Iconify icon={'logos:google-maps' as any} width={16} />
                  Google Maps
                </Box>
                <Box
                  component="a"
                  href={`https://map.kakao.com/link/map/${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontSize: 13,
                    color: 'text.primary',
                    textDecoration: 'none',
                    '&:hover': {
                      bgcolor: 'grey.200',
                    },
                  }}
                >
                  <Iconify icon={'simple-icons:kakao' as any} width={16} />
                  카카오맵
                </Box>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  if (isOwn) {
    // 내 메시지
    return (
      <>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="flex-end">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {timestamp}
          </Typography>
          <Box
            sx={{
              maxWidth: '70%',
              px: isImageMessage || isEmergencyWithLocation || isImageWithLocation ? 0.5 : 1,
              py: isImageMessage || isEmergencyWithLocation || isImageWithLocation ? 0.5 : 1,
              borderRadius: '12px 0px 12px 12px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              ...(isSharedDocument && {
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }),
            }}
            onClick={isSharedDocument ? handleFileClick : undefined}
          >
            {isImageWithLocation && accidentImageUrl && metadata?.location ? (
              renderAccidentReportContent(accidentImageUrl, metadata.location)
            ) : isEmergencyWithLocation ? (
              renderEmergencyContent(metadata!.location!)
            ) : hasMediaAttachments ? (
              // 다중 미디어 첨부파일 (이미지/동영상)
              renderMultipleAttachments()
            ) : isImageMessage && imageUrl ? (
              renderImageContent(imageUrl, parsedImage.label)
            ) : isFileMessage ? (
              renderFileContent()
            ) : (
              <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                {message}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* 이미지 확대 모달 */}
        <Dialog
          open={imageModalOpen}
          onClose={handleCloseImageModal}
          maxWidth="lg"
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              maxHeight: '90vh',
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleCloseImageModal}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <Iconify icon="mingcute:close-line" width={24} />
            </IconButton>
            {selectedImage && (
              <Box
                component="img"
                src={selectedImage}
                alt="이미지 확대"
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        </Dialog>

        {/* 동영상 모달 */}
        <Dialog
          open={videoModalOpen}
          onClose={handleCloseVideoModal}
          maxWidth="lg"
          PaperProps={{
            sx: {
              bgcolor: 'black',
              boxShadow: 'none',
              maxHeight: '90vh',
              maxWidth: '90vw',
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleCloseVideoModal}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <Iconify icon="mingcute:close-line" width={24} />
            </IconButton>
            {selectedVideo && (
              <Box
                component="video"
                src={selectedVideo}
                controls
                autoPlay
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        </Dialog>

        {/* 지도 모달 */}
        {renderMapModal()}
      </>
    );
  }

  // 상대방 메시지
  return (
    <>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar src={normalizedAvatarUrl} sx={{ width: 40, height: 40 }}>
          <Iconify icon="solar:user-rounded-bold" width={24} />
        </Avatar>
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 400 }}>
            {sender}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="flex-end">
            <Box
              sx={{
                maxWidth: 280,
                px: isImageMessage || isEmergencyWithLocation || isImageWithLocation ? 0.5 : 1,
                py: isImageMessage || isEmergencyWithLocation || isImageWithLocation ? 0.5 : 1,
                borderRadius: '0px 12px 12px 12px',
                bgcolor: 'grey.200',
                color: 'text.primary',
                ...(isSharedDocument && {
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.300',
                  },
                }),
              }}
              onClick={isSharedDocument ? handleFileClick : undefined}
            >
              {isImageWithLocation && accidentImageUrl && metadata?.location ? (
                renderAccidentReportContent(accidentImageUrl, metadata.location)
              ) : isEmergencyWithLocation ? (
                renderEmergencyContent(metadata!.location!)
              ) : hasMediaAttachments ? (
                // 다중 미디어 첨부파일 (이미지/동영상)
                renderMultipleAttachments()
              ) : isImageMessage && imageUrl ? (
                renderImageContent(imageUrl, parsedImage.label)
              ) : isFileMessage ? (
                renderFileContent()
              ) : (
                <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
                  {message}
                </Typography>
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                lineHeight: 1.35,
              }}
            >
              {timestamp}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* 이미지 확대 모달 */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxHeight: '90vh',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <Iconify icon="mingcute:close-line" width={24} />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="이미지 확대"
              sx={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>

      {/* 동영상 모달 */}
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'black',
            boxShadow: 'none',
            maxHeight: '90vh',
            maxWidth: '90vw',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseVideoModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <Iconify icon="mingcute:close-line" width={24} />
          </IconButton>
          {selectedVideo && (
            <Box
              component="video"
              src={selectedVideo}
              controls
              autoPlay
              sx={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>

      {/* 지도 모달 */}
      {renderMapModal()}
    </>
  );
}
