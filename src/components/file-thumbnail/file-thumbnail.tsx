import type { FileThumbnailProps } from './types';

import { mergeClasses } from 'minimal-shared/utils';

import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { fileThumbnailClasses } from './classes';
import { fileData, fileThumb, fileFormat } from './utils';
import { RemoveButton, DownloadButton } from './action-buttons';

// ----------------------------------------------------------------------

export function FileThumbnail({
  sx,
  file,
  tooltip,
  onRemove,
  imageView,
  slotProps,
  onDownload,
  className,
  ...other
}: FileThumbnailProps) {
  const { icon, removeBtn, downloadBtn, tooltip: tooltipProps } = slotProps ?? {};

  const { name, path } = fileData(file);

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (url.startsWith('data:image/png;base64,data/admin/') || url.startsWith('data:image/png;base64,/data/admin/')) {
      // base64 접두사를 제거하고 URL로 처리
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const filePath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${filePath}`;
    }
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if ((url.startsWith('data:image/') || url.startsWith('data:')) && !url.includes('data/admin/')) {
      return url;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    // data/admin/로 시작하는 경우도 처리
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const filePath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${filePath}`;
  };

  const previewUrl =
    typeof file === 'string' ? getFullFileUrl(file) || file : URL.createObjectURL(file);

  const format = fileFormat(path ?? previewUrl ?? '');

  const renderItem = () => (
    <ItemRoot className={mergeClasses([fileThumbnailClasses.root, className])} sx={sx} {...other}>
      {format === 'image' && imageView ? (
        <ItemImg src={previewUrl} className={fileThumbnailClasses.img} {...slotProps?.img} />
      ) : (
        <ItemIcon src={fileThumb(format)} className={fileThumbnailClasses.icon} {...icon} />
      )}

      {onRemove && (
        <RemoveButton
          onClick={onRemove}
          className={fileThumbnailClasses.removeBtn}
          {...removeBtn}
        />
      )}

      {onDownload && (
        <DownloadButton
          onClick={onDownload}
          className={fileThumbnailClasses.downloadBtn}
          {...downloadBtn}
        />
      )}
    </ItemRoot>
  );

  if (tooltip) {
    return (
      <Tooltip
        arrow
        title={name}
        {...tooltipProps}
        slotProps={{
          ...tooltipProps?.slotProps,
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: { offset: [0, -12] },
              },
            ],
            ...tooltipProps?.slotProps?.popper,
          },
        }}
      >
        {renderItem()}
      </Tooltip>
    );
  }

  return renderItem();
}

// ----------------------------------------------------------------------

const ItemRoot = styled('span')(({ theme }) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  alignItems: 'center',
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

const ItemIcon = styled('img')(() => ({
  width: '100%',
  height: '100%',
}));

const ItemImg = styled('img')(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
}));
