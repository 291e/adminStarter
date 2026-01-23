import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import type { ChatAttachmentDto } from 'src/services/chat/chat.types';

type Props = {
  attachments: ChatAttachmentDto[];
  onFileClick?: (attachment: ChatAttachmentDto) => void;
};

export default function AttachmentList({ attachments, onFileClick }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    if (type === 'image') return 'solar:gallery-bold' as any;
    if (type === 'video') return 'solar:videocamera-bold' as any;
    if (type === 'pdf') return 'solar:file-text-bold' as any;
    return 'solar:document-text-bold' as any;
  };

  const getFileColor = (type: string) => {
    if (type === 'image') return '#22C55E';
    if (type === 'video') return '#8B5CF6';
    if (type === 'pdf') return '#EF4444';
    return '#3B82F6';
  };

  const handleItemClick = (file: ChatAttachmentDto) => {
    if (file.type === 'image' && file.url) {
      setSelectedImage(file.url);
    } else if (file.type === 'video' && file.url) {
      setSelectedVideo(file.url);
    } else if (file.url) {
      window.open(file.url, '_blank');
    } else if (onFileClick) {
      onFileClick(file);
    }
  };

  // 이미지, 동영상, 문서 분류
  const imageFiles = attachments.filter((att) => att.type === 'image');
  const videoFiles = attachments.filter((att) => att.type === 'video');
  const documentFiles = attachments.filter((att) => att.type !== 'image' && att.type !== 'video');

  return (
    <>
      <Box
        sx={{
          flex: isExpanded ? 1 : '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.25, minHeight: 48, bgcolor: '#F4F6F8' }}
        >
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            첨부 파일 ({attachments.length})
          </Typography>
          <IconButton
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          >
            <Iconify icon={'eva:arrow-ios-downward-fill' as any} width={16} />
          </IconButton>
        </Stack>
        {isExpanded && (
          <Scrollbar sx={{ flex: 1 }}>
            <Box sx={{ p: 2 }}>
              {/* 이미지 파일 섹션 */}
              {imageFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}
                  >
                    이미지 ({imageFiles.length})
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                    }}
                  >
                    {imageFiles.map((file) => (
                      <Box
                        key={file.id}
                        onClick={() => handleItemClick(file)}
                        sx={{
                          aspectRatio: '1',
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          bgcolor: 'grey.200',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {file.url ? (
                          <Box
                            component="img"
                            src={file.url}
                            alt={file.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Iconify icon={getFileIcon('image')} width={24} color="grey.500" />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* 동영상 파일 섹션 */}
              {videoFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}
                  >
                    동영상 ({videoFiles.length})
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                    }}
                  >
                    {videoFiles.map((file) => (
                      <Box
                        key={file.id}
                        onClick={() => handleItemClick(file)}
                        sx={{
                          aspectRatio: '1',
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          bgcolor: 'grey.800',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {file.url && (
                          <Box
                            component="video"
                            src={file.url}
                            preload="metadata"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                        {/* 재생 버튼 오버레이 */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify
                            icon={'mdi:play' as any}
                            width={20}
                            sx={{ color: 'white', ml: 0.3 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* 문서 파일 섹션 */}
              {documentFiles.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}
                  >
                    문서 ({documentFiles.length})
                  </Typography>
                  <List disablePadding>
                    {documentFiles.map((file) => (
                      <ListItem
                        key={file.id}
                        disablePadding
                        onClick={() => handleItemClick(file)}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          sx={{ width: '100%' }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              bgcolor: `${getFileColor(file.type)}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Iconify
                              icon={getFileIcon(file.type)}
                              width={20}
                              color={getFileColor(file.type)}
                            />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: 12,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {file.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: 10 }}
                            >
                              {file.createdAt ? fDate(file.createdAt, 'YYYY.MM.DD') : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* 첨부파일 없음 */}
              {attachments.length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    첨부 파일이 없습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </Scrollbar>
        )}
      </Box>

      {/* 이미지 확대 모달 */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
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
            onClick={() => setSelectedImage(null)}
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
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
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
            onClick={() => setSelectedVideo(null)}
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
    </>
  );
}
