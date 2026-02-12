import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import type { BoardPost } from 'src/services/board/board.types';
import { fDateTime } from 'src/utils/format-time';
import { resolveAdminImageUrlsInHtml } from 'src/utils/rich-text';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

type Props = {
  onBack: () => void;
  post?: BoardPost | null;
  loading?: boolean;
};

const resolvePostFileUrl = (filePath?: string | null) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const base = (CONFIG.serverUrl || '').trim();
  if (!base) return filePath;

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${normalizedBase}${normalizedPath}`;
};

const normalizePostAttachments = (postFilePath?: BoardPost['postFilePath']) => {
  if (!postFilePath) return [] as Array<{ originalFileName: string; fileUrl: string }>;

  if (Array.isArray(postFilePath)) {
    return postFilePath
      .map((item) => ({
        originalFileName: item.originalFileName || item.fileUrl?.split('/').pop() || '',
        fileUrl: item.fileUrl,
      }))
      .filter((item) => !!item.fileUrl);
  }

  if (typeof postFilePath === 'string') {
    const trimmed = postFilePath.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              const fileUrl = item?.fileUrl ?? item?.url ?? item?.path;
              if (!fileUrl) return null;
              return {
                originalFileName:
                  item?.originalFileName ?? item?.fileName ?? fileUrl.split('/').pop() ?? '',
                fileUrl: resolvePostFileUrl(fileUrl),
              };
            })
            .filter(Boolean) as Array<{ originalFileName: string; fileUrl: string }>;
        }
      } catch {
        return [{ originalFileName: trimmed.split('/').pop() || trimmed, fileUrl: resolvePostFileUrl(trimmed) }];
      }
    }

    return [{ originalFileName: trimmed.split('/').pop() || trimmed, fileUrl: resolvePostFileUrl(trimmed) }];
  }

  return [];
};

export default function BoardDetailsView({ onBack, post, loading = false }: Props) {
  const renderedContent = useMemo(
    () => resolveAdminImageUrlsInHtml(post?.postContent || ''),
    [post?.postContent]
  );

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              width: 36,
              height: 36,
              minWidth: 36,
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
          <Card sx={{ p: 6, borderRadius: 2, boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                게시글을 불러오는 중입니다.
              </Typography>
            </Stack>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  if (!post) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <IconButton onClick={onBack} sx={{ p: 0 }}>
              <Iconify icon="eva:arrow-ios-back-fill" width={24} />
            </IconButton>
            <Typography variant="h4">목록으로</Typography>
          </Stack>
          <Card sx={{ p: 6, borderRadius: 2, boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="body1">게시글을 찾을 수 없습니다.</Typography>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  const title = post.postTitle || '-';
  const category = post.postCategoryTitle || post.categoryTitle || '-';
  const author = post.memberInformation?.memberName || post.memberName || post.adminName || '-';
  const createdAt = post.registrationDate || post.createAt || post.updateAt || '';
  const views = post.postViews ?? post.viewCount ?? 0;

  const attachments = normalizePostAttachments(post.postFilePath);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={onBack} sx={{ p: 0 }}>
            <Iconify icon="eva:arrow-ios-back-fill" width={24} />
          </IconButton>
          <Typography variant="h4">목록으로</Typography>
        </Stack>

        <Card sx={{ p: 0, borderRadius: 2, boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
          <Stack spacing={3} sx={{ p: 4 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                {category}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {title}
              </Typography>
              <Stack direction="row" spacing={2.5} sx={{ color: 'text.secondary' }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconify icon="solar:calendar-date-bold" width={16} />
                  <Typography variant="body2">
                    {createdAt ? fDateTime(createdAt, 'YYYY-MM-DD') : '-'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconify icon="solar:user-rounded-bold" width={16} />
                  <Typography variant="body2">{author}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconify icon="solar:eye-bold" width={16} />
                  <Typography variant="body2">{views}</Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box
              className="board-detail-content quill-rendered-content ql-editor"
              sx={{
                typography: 'body1',
                minHeight: 240,
                lineHeight: 1.9,
                color: 'text.primary',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                },
                '& p': {
                  m: 0,
                },
              }}
              dangerouslySetInnerHTML={{
                __html: renderedContent || '<p>내용이 없습니다.</p>',
              }}
            />

            {attachments.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:attach-2-fill" width={18} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    첨부파일
                  </Typography>
                </Stack>
                {attachments.map((attachment, index) => (
                  <Box
                    key={`${attachment.fileUrl}-${index}`}
                    component="a"
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: 'underline', color: 'text.primary' }}
                    >
                      {attachment.originalFileName || attachment.fileUrl}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </Card>
      </Container>
    </DashboardContent>
  );
}
