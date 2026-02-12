import { useMemo, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useCreateBoardComment } from 'src/sections/Board/hooks/use-board-api';
import type { InquiryRow } from './components/table';
import { resolveAdminImageUrlsInHtml, stripAdminImageOriginFromHtml } from 'src/utils/rich-text';
import IconButton from '@mui/material/IconButton';
import InquiryQuillToolbar, {
  inquiryQuillFormats,
  inquiryQuillModules,
} from './components/quill-toolbar';

// ----------------------------------------------------------------------

type Props = {
  onBack: () => void;
  inquiry: InquiryRow;
};

const toolbarId = 'inquiry-quill-toolbar-reply';

export default function InquiryReplyView({ onBack, inquiry }: Props) {
  // 기존 답변이 있으면 초기값으로 설정
  const existingAnswerContent = inquiry.commentInformation?.commentContent || inquiry.answer || '';
  const [answerContent, setAnswerContent] = useState(() =>
    stripAdminImageOriginFromHtml(existingAnswerContent)
  );
  const createCommentMutation = useCreateBoardComment();

  const renderedInquiryContent = useMemo(
    () => resolveAdminImageUrlsInHtml(inquiry.content ?? ''),
    [inquiry.content]
  );

  const renderedAnswerContent = useMemo(
    () => resolveAdminImageUrlsInHtml(answerContent),
    [answerContent]
  );

  const handleSubmit = async () => {
    if (!inquiry.postIdx) return;
    if (!answerContent.trim()) {
      return;
    }
    await createCommentMutation.mutateAsync({
      postIdx: inquiry.postIdx,
      commentContent: answerContent.trim(),
    });
    onBack();
  };

  // 날짜 포맷팅
  const inquiryDateStr =
    inquiry.inquiryAt && inquiry.inquiryAt !== '-'
      ? fDateTime(inquiry.inquiryAt, 'YYYY-MM-DD HH:mm:ss')
      : '-';
  // 답변일은 commentInformation.commentCreateAt 우선 사용
  const answerDateStr = inquiry.commentInformation?.commentCreateAt
    ? fDateTime(inquiry.commentInformation.commentCreateAt, 'YYYY-MM-DD HH:mm:ss')
    : inquiry.answeredAt
      ? fDateTime(inquiry.answeredAt, 'YYYY-MM-DD HH:mm:ss')
      : '-';

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* 헤더: 목록으로 */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={onBack} sx={{ p: 0 }}>
            <Iconify icon="eva:arrow-ios-back-fill" width={24} />
          </IconButton>
          <Typography variant="h4">목록으로</Typography>
        </Stack>

        <Stack spacing={3}>
          {/* 문의 내용 카드 - 2열 레이아웃 */}
          <Card sx={{ p: 0, boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Box sx={{ p: 0 }}>
              <Stack direction={{ xs: 'column', md: 'column' }}>
                {/* 오른쪽 열: 문의일, 답변일, 문의자 (하나로 묶임) */}
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      bgcolor: '#F4F6F8',
                      borderRadius: 1.5,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      p: 3,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={4}
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      {/* 왼쪽: 문의일, 답변일 */}
                      <Box sx={{ flex: 1 }}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}
                            >
                              문의일
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {inquiryDateStr !== '-' ? inquiryDateStr : '-'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}
                            >
                              답변일
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {answerDateStr !== '-' ? answerDateStr : '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* 오른쪽: 문의자 */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}
                        >
                          문의자
                        </Typography>
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {inquiry.inquirerName || '-'}
                            {inquiry.inquirerId && ` (${inquiry.inquirerId})`}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {inquiry.inquirerEmail || '-'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {inquiry.inquirerPhone || '-'}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Box>

                {/* 왼쪽 열: 카테고리, 제목, 내용 */}
                <Box sx={{ flex: 1, p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 100 }}
                      >
                        카테고리
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {inquiry.category || '-'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 100 }}
                      >
                        제목
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {inquiry.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 100 }}
                      >
                        내용
                      </Typography>
                      <Box
                        className="quill-rendered-content ql-editor"
                        sx={{ typography: 'body2' }}
                        dangerouslySetInnerHTML={{ __html: renderedInquiryContent }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Card>

          {/* 답변 작성 카드 */}
          <Card sx={{ p: 0, boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                답변 내용
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  mb: 3,
                  '& .quill': {
                    bgcolor: 'background.paper',
                    border: 'none',
                    '& .ql-container': {
                      border: 'none',
                      minHeight: 400,
                      typography: 'body1',
                      '& .ql-editor': {
                        minHeight: 400,
                      },
                    },
                  },
                  '& .ql-toolbar': {
                    border: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  },
                  '& .ql-formats': {
                    marginRight: '8px',
                  },
                }}
              >
                <InquiryQuillToolbar toolbarId={toolbarId} />
                <ReactQuill
                  theme="snow"
                  modules={inquiryQuillModules(toolbarId)}
                  formats={inquiryQuillFormats}
                  value={renderedAnswerContent}
                  onChange={(value) => setAnswerContent(stripAdminImageOriginFromHtml(value))}
                  placeholder="내용"
                />
              </Box>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={onBack}
                  sx={{
                    px: 3,
                    height: 40,
                    borderRadius: 1,
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  취소
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={createCommentMutation.isPending || !answerContent.trim()}
                  sx={{
                    px: 3,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: '#212B36',
                    '&:hover': { bgcolor: '#161C24' },
                    fontWeight: 600,
                  }}
                >
                  {createCommentMutation.isPending ? '등록 중...' : '답변 저장'}
                </Button>
              </Stack>
            </Box>
          </Card>
        </Stack>
      </Container>
    </DashboardContent>
  );
}
