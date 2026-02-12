import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getBoardCategories,
  saveBoardCategories,
  getBoardPosts,
  getBoardPostDetail,
  createBoardPost,
  updateBoardPost,
  updateBoardPostsBulk,
  deleteBoardPosts,
  createBoardComment,
  updateBoardComment,
} from 'src/services/board/board.service';
import type {
  GetBoardCategoriesParams,
  GetBoardCategoriesResult,
  SaveBoardCategoriesParams,
  GetBoardPostsParams,
  GetBoardPostsResult,
  GetBoardPostDetailResult,
  CreateBoardPostParams,
  UpdateBoardPostParams,
  UpdateBoardPostsBulkParams,
  DeleteBoardPostsParams,
  CreateBoardCommentParams,
  UpdateBoardCommentParams,
} from 'src/services/board/board.types';

// ----------------------------------------------------------------------

const invalidateBoardQueries = async (queryClient: ReturnType<typeof useQueryClient>, postIdx?: number) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['boardPosts'] }),
    queryClient.invalidateQueries({ queryKey: ['boardPostDetail'] }),
    ...(postIdx ? [queryClient.invalidateQueries({ queryKey: ['boardPostDetail', postIdx] })] : []),
  ]);
};

export function useBoardCategories(params: GetBoardCategoriesParams) {
  return useQuery<GetBoardCategoriesResult>({
    queryKey: ['boardCategories', params.postCategoryType],
    queryFn: () => getBoardCategories(params),
  });
}

export function useSaveBoardCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveBoardCategoriesParams) => saveBoardCategories(params),
    onSuccess: (_, variables) => {
      toast.success('카테고리가 저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['boardCategories', variables.postCategoryType] });
    },
    onError: (error: any) => {
      toast.error(error?.message || '카테고리 저장에 실패했습니다.');
    },
  });
}

export function useBoardPosts(params: GetBoardPostsParams) {
  return useQuery<GetBoardPostsResult>({
    queryKey: ['boardPosts', params],
    queryFn: () => getBoardPosts(params),
  });
}

export function useBoardPostDetail(postIdx?: number, enabled: boolean = true) {
  return useQuery<GetBoardPostDetailResult>({
    queryKey: ['boardPostDetail', postIdx],
    queryFn: () => getBoardPostDetail(postIdx as number),
    enabled: enabled && !!postIdx,
  });
}

export function useCreateBoardPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBoardPostParams) => createBoardPost(params),
    onSuccess: async () => {
      toast.success('게시글이 등록되었습니다.');
      await invalidateBoardQueries(queryClient);
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 등록에 실패했습니다.');
    },
  });
}

export function useUpdateBoardPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateBoardPostParams) => updateBoardPost(params),
    onSuccess: async (_, variables) => {
      toast.success('게시글이 수정되었습니다.');
      await invalidateBoardQueries(queryClient, variables.postIdx);
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 수정에 실패했습니다.');
    },
  });
}

export function useUpdateBoardPostsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateBoardPostsBulkParams) => updateBoardPostsBulk(params),
    onSuccess: async () => {
      toast.success('게시글이 업데이트되었습니다.');
      await invalidateBoardQueries(queryClient);
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 업데이트에 실패했습니다.');
    },
  });
}

export function useDeleteBoardPosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteBoardPostsParams) => deleteBoardPosts(params),
    onSuccess: async () => {
      toast.success('게시글이 삭제되었습니다.');
      await invalidateBoardQueries(queryClient);
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 삭제에 실패했습니다.');
    },
  });
}

export function useCreateBoardComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBoardCommentParams) => createBoardComment(params),
    onSuccess: async (_, variables) => {
      toast.success('답변이 등록되었습니다.');
      await invalidateBoardQueries(queryClient, variables.postIdx);
    },
    onError: (error: any) => {
      toast.error(error?.message || '답변 등록에 실패했습니다.');
    },
  });
}

export function useUpdateBoardComment() {
  return useMutation({
    mutationFn: (params: UpdateBoardCommentParams) => updateBoardComment(params),
    onSuccess: () => toast.success('댓글이 수정되었습니다.'),
    onError: (error: any) => toast.error(error?.message || '댓글 수정에 실패했습니다.'),
  });
}
