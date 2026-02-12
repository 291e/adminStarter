import { useMemo } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { DashboardContent } from 'src/layouts/dashboard';
import InquiryHeader from './components/header';
import type { BoardCommentInformation } from 'src/services/board/board.types';
import { resolveAdminImageUrlsInHtml } from 'src/utils/rich-text';

// ----------------------------------------------------------------------

type Props = {
  onBack: () => void;
  inquiry: {
    category: string;
    title: string;
    content: string;
    answer?: string;
    commentInformation?: BoardCommentInformation; // 답변 정보
  };
};

export default function InquiryDetailsView({ onBack, inquiry }: Props) {
  const renderedInquiryContent = useMemo(
    () => resolveAdminImageUrlsInHtml(inquiry.content),
    [inquiry.content]
  );

  const renderedAnswerContent = useMemo(
    () =>
      resolveAdminImageUrlsInHtml(
        inquiry.commentInformation?.commentContent || inquiry.answer || '답변 대기 중입니다.'
      ),
    [inquiry.answer, inquiry.commentInformation?.commentContent]
  );

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <InquiryHeader title="답변보기" onBack={onBack} />

        <Stack spacing={3}>
          {/* 문의 내용 카드 */}
          <Card sx={{ p: 0, boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                문의 내용
              </Typography>
            </Box>

            <Stack spacing={3} sx={{ p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  카테고리
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: '#F8FAFB',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: '#E5E8EB',
                    width: 'fit-content',
                    minWidth: 200,
                  }}
                >
                  <Typography variant="body2">{inquiry.category}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  제목
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: '#F8FAFB',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: '#E5E8EB',
                  }}
                >
                  <Typography variant="body2">{inquiry.title}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  내용
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 2,
                    bgcolor: '#F8FAFB',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: '#E5E8EB',
                    minHeight: 120,
                  }}
                >
                  <Box
                    className="quill-rendered-content ql-editor"
                    sx={{ typography: 'body2' }}
                    dangerouslySetInnerHTML={{ __html: renderedInquiryContent }}
                  />
                </Box>
              </Box>
            </Stack>
          </Card>

          {/* 관리자 답변 카드 */}
          <Card sx={{ p: 0, boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                관리자 답변
              </Typography>
            </Box>

            <Stack spacing={3} sx={{ p: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  답변 내용
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 2.5,
                    bgcolor: '#F8FAFB',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: '#E5E8EB',
                    minHeight: 200,
                  }}
                >
                  <Box
                    className="quill-rendered-content ql-editor"
                    sx={{ typography: 'body2', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{
                      __html: renderedAnswerContent,
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </DashboardContent>
  );
}
