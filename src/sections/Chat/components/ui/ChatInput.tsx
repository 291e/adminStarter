import { useState, useRef } from 'react';

import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { uploadFile } from 'src/services/system/system.service';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (attachments?: string[]) => void;
  isEmergency?: boolean;
};

export default function ChatInput({ value = '', onChange, onSend, isEmergency = false }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 이미지 파일인 경우 미리보기 생성
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    let attachments: string[] | undefined;

    // 파일이 선택된 경우 먼저 업로드
    if (selectedFile) {
      try {
        setIsUploading(true);
        const uploadResponse = await uploadFile({ files: [selectedFile] });

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

        if (fileUrl) {
          attachments = [fileUrl];
        } else {
          console.error('파일 업로드에 실패했습니다.');
          setIsUploading(false);
          return;
        }
      } catch (error) {
        console.error('파일 업로드 실패:', error);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
        // 파일 초기화
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }

    // 메시지 전송 (파일 URL이 있으면 attachments로 전달)
    onSend?.(attachments);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 1.5, lg: 2 },
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, lg: 1 },
        bgcolor: isEmergency ? '#F26221' : 'white',
      }}
    >
      <IconButton
        size="small"
        sx={{
          bgcolor: isEmergency ? 'white' : 'grey.200',
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            bgcolor: isEmergency ? 'grey.200' : 'grey.300',
          },
        }}
        onClick={handleCameraClick}
        disabled={isUploading}
      >
        <Iconify icon={'mdi:camera' as any} width={24} />
      </IconButton>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
      <InputBase
        fullWidth
        placeholder="메시지를 입력하세요..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        sx={{
          bgcolor: isEmergency ? 'white' : 'grey.100',
          borderRadius: 9999,
          px: 2,
          py: 1.25, // 상하 padding 증가
          color: isEmergency ? 'text.primary' : 'text.primary',
          minHeight: 44, // 최소 높이 증가 (커서가 잘리지 않도록)
          display: 'flex',
          alignItems: 'center',
          '&::placeholder': {
            color: isEmergency ? 'text.disabled' : 'text.disabled',
            opacity: 1,
          },
          '& .MuiInputBase-input': {
            py: 0,
            lineHeight: 1.5, // line-height 명시적으로 설정
            minHeight: '1.5em', // 최소 높이 설정
            paddingLeft: '2px',
            paddingRight: '2px',
            '&::placeholder': {
              opacity: 1,
            },
          },
          '&:focus-within': {
            outline: 'none',
            '& .MuiInputBase-input': {
              caretColor: isEmergency ? 'text.primary' : 'text.primary',
              paddingLeft: '2px',
              paddingRight: '2px',
            },
          },
        }}
      />
      <IconButton
        size="small"
        sx={{
          transition: 'background-color 0.2s ease-in-out',
          bgcolor: isEmergency ? 'white' : 'grey.200',
          '&:hover': {
            bgcolor: isEmergency ? 'grey.200' : 'grey.300',
          },
        }}
        onClick={handleSend}
        disabled={isUploading}
      >
        <Iconify icon={'solar:plain-2-bold' as any} width={24} />
      </IconButton>
      {/* 파일 미리보기 */}
      {previewUrl && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            p: 1,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component="img"
            src={previewUrl}
            alt="미리보기"
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedFile?.name}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
              {(selectedFile?.size || 0) / 1024 < 1024
                ? `${((selectedFile?.size || 0) / 1024).toFixed(1)} KB`
                : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)} MB`}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={handleRemoveFile} disabled={isUploading}>
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
