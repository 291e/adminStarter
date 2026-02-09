import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getBoardCategories,
  saveBoardCategories,
  getBoardPosts,
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
  CreateBoardPostParams,
  UpdateBoardPostParams,
  UpdateBoardPostsBulkParams,
  DeleteBoardPostsParams,
  CreateBoardCommentParams,
  UpdateBoardCommentParams,
} from 'src/services/board/board.types';

// ----------------------------------------------------------------------

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

export function useCreateBoardPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBoardPostParams) => createBoardPost(params),
    onSuccess: () => {
      toast.success('게시글이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
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
    onSuccess: () => {
      toast.success('게시글이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
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
    onSuccess: () => {
      toast.success('게시글이 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
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
    onSuccess: () => {
      toast.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
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
    onSuccess: () => {
      toast.success('답변이 등록되었습니다.');
      // 게시글 목록 새로고침 (답변 상태 업데이트 반영)
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
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
