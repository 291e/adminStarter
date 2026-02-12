import { useMemo, useRef, useState } from 'react';
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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';

import { DashboardContent } from 'src/layouts/dashboard';
import BoardHeader from './components/header';
import { useBoardCategories, useDeleteBoardPosts, useUpdateBoardPost } from './hooks/use-board-api';
import type { BoardCategory, BoardPost, BoardPostFile } from 'src/services/board/board.types';
import { resolveAdminImageUrlsInHtml, stripAdminImageOriginFromHtml } from 'src/utils/rich-text';
import InquiryQuillToolbar, {
  inquiryQuillFormats,
  inquiryQuillModules,
} from 'src/sections/Inquiries/components/quill-toolbar';
import { uploadFile } from 'src/services/system/system.service';
import { toast } from 'sonner';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  onBack: () => void;
  post: BoardPost;
};

const toolbarId = 'board-quill-toolbar-edit';

const normalizePostFiles = (postFilePath?: BoardPost['postFilePath']): BoardPostFile[] => {
  if (!postFilePath) return [];

  if (Array.isArray(postFilePath)) {
    return postFilePath
      .map((item) => {
        const fileUrl = item?.fileUrl;
        if (!fileUrl) return null;
        return {
          originalFileName: item.originalFileName || fileUrl.split('/').pop() || '',
          fileUrl,
        };
      })
      .filter(Boolean) as BoardPostFile[];
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
                fileUrl,
              };
            })
            .filter(Boolean) as BoardPostFile[];
        }
      } catch {
        return [
          {
            originalFileName: trimmed.split('/').pop() || trimmed,
            fileUrl: trimmed,
          },
        ];
      }
    }

    return [
      {
        originalFileName: trimmed.split('/').pop() || trimmed,
        fileUrl: trimmed,
      },
    ];
  }

  return [];
};

export default function BoardEditView({ onBack, post }: Props) {
  const quillRef = useRef<ReactQuill | null>(null);
  const [category, setCategory] = useState(
    post.postCategoryIdx ? String(post.postCategoryIdx) : ''
  );
  const [title, setTitle] = useState(post.postTitle ?? '');
  const [content, setContent] = useState(() =>
    stripAdminImageOriginFromHtml(post.postContent ?? '')
  );
  const [attachments, setAttachments] = useState<BoardPostFile[]>(() =>
    normalizePostFiles(post.postFilePath)
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isPopup, setIsPopup] = useState((post.isPop ?? 0) === 1);
  const [isTopFixed, setIsTopFixed] = useState((post.isPinned ?? 0) === 1);
  const [isActive, setIsActive] = useState(post.postStatus !== 'INACTIVE');

  const { data: categoryData } = useBoardCategories({ postCategoryType: '공지사항' });
  const categories = categoryData?.categories || [];
  const updatePostMutation = useUpdateBoardPost();
  const deletePostMutation = useDeleteBoardPosts();

  const selectedCategoryIdx = useMemo(() => {
    if (!category) return undefined;
    return Number(category) || undefined;
  }, [category]);

  const extractUploadedUrls = (uploadResponse: any): string[] => {
    if (Array.isArray((uploadResponse as any)?.fileUrls)) {
      return (uploadResponse as any).fileUrls.filter(Boolean);
    }
    if (Array.isArray((uploadResponse as any)?.files)) {
      return (uploadResponse as any).files
        .map((item: any) => item?.fileUrl || item?.url)
        .filter(Boolean);
    }
    if (Array.isArray((uploadResponse as any)?.data?.fileUrls)) {
      return (uploadResponse as any).data.fileUrls.filter(Boolean);
    }
    return [];
  };

  const handleInsertImage = async () => {
    if (isUploadingImage) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        setIsUploadingImage(true);
        const uploadResponse = await uploadFile({ files: [file] });
        const uploadedUrl = extractUploadedUrls(uploadResponse)[0];
        if (!uploadedUrl) {
          throw new Error('이미지 업로드 경로를 받지 못했습니다.');
        }

        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const range = editor.getSelection(true);
        const insertIndex = range ? range.index : editor.getLength();
        editor.insertEmbed(insertIndex, 'image', uploadedUrl, 'user');
        editor.setSelection(insertIndex + 1, 0, 'silent');
      } catch (error: any) {
        toast.error(error?.message || '이미지 업로드에 실패했습니다.');
      } finally {
        setIsUploadingImage(false);
      }
    };
    input.click();
  };

  const handleAttachFile = async () => {
    if (isUploadingAttachment) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      const files = input.files ? Array.from(input.files) : [];
      if (!files.length) return;

      try {
        setIsUploadingAttachment(true);
        const uploadResponse = await uploadFile({ files });
        const uploadedUrls = extractUploadedUrls(uploadResponse);
        if (!uploadedUrls.length) {
          throw new Error('첨부파일 업로드 경로를 받지 못했습니다.');
        }

        const nextAttachments = files
          .map((file, index) => {
            const fileUrl = uploadedUrls[index] ?? uploadedUrls[0];
            if (!fileUrl) return null;
            return { originalFileName: file.name, fileUrl };
          })
          .filter(Boolean) as BoardPostFile[];

        setAttachments((prev) => [...prev, ...nextAttachments]);
      } catch (error: any) {
        toast.error(error?.message || '첨부파일 업로드에 실패했습니다.');
      } finally {
        setIsUploadingAttachment(false);
      }
    };
    input.click();
  };

  const renderedContent = useMemo(() => resolveAdminImageUrlsInHtml(content), [content]);

  const handleSubmit = async () => {
    if (!post.postIdx) return;
    if (!title.trim()) return;

    await updatePostMutation.mutateAsync({
      postIdx: post.postIdx,
      postGubun: '공지사항',
      postTitle: title.trim(),
      postContent: content.trim(),
      postFilePath: attachments,
      postStatus: isActive ? 'ACTIVE' : 'INACTIVE',
      isPop: isPopup ? 1 : 0,
      isPinned: isTopFixed ? 1 : 0,
      ...(selectedCategoryIdx && { postCategoryIdx: selectedCategoryIdx }),
    });
    onBack();
  };

  const handleDelete = async () => {
    if (!post.postIdx) return;

    await deletePostMutation.mutateAsync({
      postGubun: '공지사항',
      postIndexes: String(post.postIdx),
    });
    onBack();
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <BoardHeader title="산업안전보건 게시판 수정" onBack={onBack} />

        <Card sx={{ p: 0, boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              게시글 수정
            </Typography>
          </Box>

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Select
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                displayEmpty
                sx={{ maxWidth: 240, borderRadius: 1.5 }}
              >
                <MenuItem value="" disabled>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    카테고리 선택
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

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch checked={isPopup} onChange={(_, checked) => setIsPopup(checked)} />
                  }
                  label="팝업"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTopFixed}
                      onChange={(_, checked) => setIsTopFixed(checked)}
                    />
                  }
                  label="상단 고정"
                />
                <FormControlLabel
                  control={
                    <Switch checked={isActive} onChange={(_, checked) => setIsActive(checked)} />
                  }
                  label={isActive ? '활성' : '비활성'}
                />
              </Stack>
            </Stack>

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
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleInsertImage}
                  disabled={isUploadingImage}
                  startIcon={<Iconify icon="solar:gallery-add-bold" width={18} />}
                >
                  {isUploadingImage ? '이미지 업로드 중...' : '사진 넣기'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAttachFile}
                  disabled={isUploadingAttachment}
                  startIcon={<Iconify icon="eva:attach-2-fill" width={18} />}
                >
                  {isUploadingAttachment ? '파일 업로드 중...' : '파일 첨부'}
                </Button>
              </Stack>

              {attachments.length > 0 && (
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {attachments.map((attachment, index) => (
                    <Stack
                      key={`${attachment.fileUrl}-${index}`}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        px: 1.5,
                        py: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Iconify icon="solar:file-text-bold" width={18} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {attachment.originalFileName || attachment.fileUrl}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, attachmentIndex) => attachmentIndex !== index)
                          )
                        }
                      >
                        <Iconify icon="solar:close-circle-bold" width={18} />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}

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
                  ref={quillRef}
                  theme="snow"
                  modules={inquiryQuillModules(toolbarId)}
                  formats={inquiryQuillFormats}
                  value={renderedContent}
                  onChange={(value) => setContent(stripAdminImageOriginFromHtml(value))}
                  placeholder="내용을 작성해 주세요."
                />
              </Box>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Button
                variant="text"
                color="error"
                onClick={handleDelete}
                disabled={deletePostMutation.isPending}
                sx={{ fontWeight: 600, px: 0, '&:hover': { bgcolor: 'transparent', opacity: 0.8 } }}
              >
                {deletePostMutation.isPending ? '삭제 중...' : '삭제하기'}
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
                  disabled={updatePostMutation.isPending || deletePostMutation.isPending || !title.trim()}
                  sx={{
                    px: 3,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: '#212B36',
                    '&:hover': { bgcolor: '#161C24' },
                    fontWeight: 600,
                  }}
                >
                  {updatePostMutation.isPending ? '수정 중...' : '수정'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </DashboardContent>
  );
}
