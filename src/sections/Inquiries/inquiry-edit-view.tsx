import { useMemo, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { DashboardContent } from 'src/layouts/dashboard';
import InquiryHeader from './components/header';
import {
  useBoardCategories,
  useDeleteBoardPosts,
  useUpdateBoardPost,
} from 'src/sections/Board/hooks/use-board-api';
import type { BoardCategory } from 'src/services/board/board.types';
import { resolveAdminImageUrlsInHtml, stripAdminImageOriginFromHtml } from 'src/utils/rich-text';
import InquiryQuillToolbar, {
  inquiryQuillFormats,
  inquiryQuillModules,
} from './components/quill-toolbar';

// ----------------------------------------------------------------------

type Props = {
  onBack: () => void;
  inquiry: {
    postIdx?: number;
    postCategoryIdx?: number;
    category: string;
    title: string;
    content: string;
  };
};

const toolbarId = 'inquiry-quill-toolbar-edit';

export default function InquiryEditView({ onBack, inquiry }: Props) {
  const [category, setCategory] = useState(
    inquiry.postCategoryIdx ? String(inquiry.postCategoryIdx) : ''
  );
  const [title, setTitle] = useState(inquiry.title);
  const [content, setContent] = useState(() => stripAdminImageOriginFromHtml(inquiry.content));
  const { data: categoryData } = useBoardCategories({ postCategoryType: '문의/답변' });
  const categories = categoryData?.categories || [];
  const updatePostMutation = useUpdateBoardPost();
  const deletePostMutation = useDeleteBoardPosts();

  const selectedCategoryIdx = useMemo(() => {
    if (!category) return undefined;
    return Number(category) || undefined;
  }, [category]);

  const renderedContent = useMemo(() => resolveAdminImageUrlsInHtml(content), [content]);

  const handleSubmit = async () => {
    if (!inquiry.postIdx) return;
    await updatePostMutation.mutateAsync({
      postIdx: inquiry.postIdx,
      postGubun: '문의/답변',
      postTitle: title.trim(),
      postContent: content.trim(),
      postStatus: 'ACTIVE',
      ...(selectedCategoryIdx && { postCategoryIdx: selectedCategoryIdx }),
    });
    onBack();
  };

  const handleDelete = async () => {
    if (!inquiry.postIdx) return;
    await deletePostMutation.mutateAsync({
      postGubun: '문의/답변',
      postIndexes: String(inquiry.postIdx),
    });
    onBack();
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <InquiryHeader title="문의하기" onBack={onBack} />

        <Card sx={{ p: 0, boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              문의 등록
            </Typography>
          </Box>

          <Stack spacing={3} sx={{ p: 3 }}>
            <Select
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              sx={{ maxWidth: 240, borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  카테고리 선택*
                </Typography>
              </MenuItem>
              {categories.map((item: BoardCategory) => (
                <MenuItem
                  key={item.postCategoryIdx ?? item.postCategoryTitle}
                  value={item.postCategoryIdx ? String(item.postCategoryIdx) : ''}
                >
                  {item.postCategoryTitle || '-'}
                </MenuItem>
              ))}
            </Select>

            <TextField
              fullWidth
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                내용
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  '& .quill': {
                    bgcolor: 'grey.50',
                    border: 'none',
                    '& .ql-container': {
                      border: 'none',
                      minHeight: 320,
                      typography: 'body1',
                    },
                  },
                  '& .ql-toolbar': {
                    border: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
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
                  value={renderedContent}
                  onChange={(value) => setContent(stripAdminImageOriginFromHtml(value))}
                />
              </Box>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Button
                variant="text"
                color="error"
                onClick={handleDelete}
                disabled={deletePostMutation.isPending}
                sx={{ fontWeight: 600, px: 0, '&:hover': { bgcolor: 'transparent', opacity: 0.8 } }}
              >
                삭제하기
              </Button>

              <Stack direction="row" spacing={1.5}>
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
                  disabled={updatePostMutation.isPending}
                  sx={{
                    px: 3,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: '#212B36',
                    '&:hover': { bgcolor: '#161C24' },
                    fontWeight: 600,
                  }}
                >
                  등록
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </DashboardContent>
  );
}
