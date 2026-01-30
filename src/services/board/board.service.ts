import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  GetBoardCategoriesParams,
  GetBoardCategoriesResponse,
  GetBoardCategoriesResult,
  SaveBoardCategoriesParams,
  SaveBoardCategoriesResponse,
  GetBoardPostsParams,
  GetBoardPostsResponse,
  GetBoardPostsResult,
  CreateBoardPostParams,
  CreateBoardPostResponse,
  UpdateBoardPostParams,
  UpdateBoardPostResponse,
  UpdateBoardPostsBulkParams,
  UpdateBoardPostsBulkResponse,
  DeleteBoardPostsParams,
  DeleteBoardPostsResponse,
  CreateBoardCommentParams,
  CreateBoardCommentResponse,
  UpdateBoardCommentParams,
  UpdateBoardCommentResponse,
  BoardPost,
} from './board.types';

// ----------------------------------------------------------------------

const normalizeBoardPost = (item: any, index: number): BoardPost => {
  const postIdx = item?.postIdx ?? item?.postId ?? item?.id ?? item?.postIDX ?? index;
  const registrationDate =
    item?.registrationDate ||
    item?.createAt ||
    item?.createdAt ||
    item?.postCreatedAt ||
    item?.updatedAt ||
    '';

  return {
    postIdx: typeof postIdx === 'number' ? postIdx : Number(postIdx) || index,
    postGubun: item?.postGubun ?? item?.postType ?? item?.gubun,
    postTarget1: item?.postTarget1 ?? item?.target1,
    postTarget2: item?.postTarget2 ?? item?.target2,
    postTitle: item?.postTitle ?? item?.title,
    postContent: item?.postContent ?? item?.content,
    postFilePath: item?.postFilePath ?? item?.filePath ?? item?.fileUrl,
    isPop: typeof item?.isPop === 'number' ? item.isPop : Number(item?.isPop) || 0,
    isPinned: typeof item?.isPinned === 'number' ? item.isPinned : Number(item?.isPinned) || 0,
    postStatus: item?.postStatus ?? item?.status,
    postCategoryIdx:
      item?.postCategoryIdx ?? item?.postCategoryId ?? item?.categoryIdx ?? item?.categoryId,
    postCategoryTitle:
      item?.postCategoryTitle ??
      item?.postCategoryName ??
      item?.categoryTitle ??
      item?.categoryName,
    postViews:
      typeof item?.postViews === 'number'
        ? item.postViews
        : typeof item?.views === 'number'
          ? item.views
          : Number(item?.postViews || item?.views) || 0,
    adminName: item?.adminName ?? item?.author ?? item?.writerName ?? item?.createdByName,
    memberName: item?.memberName ?? item?.memberNickname ?? item?.writerMemberName,
    createAt: item?.createAt ?? item?.createdAt,
    updateAt: item?.updateAt ?? item?.updatedAt,
    registrationDate,
    postAnswerStatus:
      item?.postAnswerStatus ?? item?.answerStatus ?? item?.commentStatus ?? undefined,
    postAnswerContent:
      item?.postAnswerContent ??
      item?.answerContent ??
      item?.commentContent ??
      item?.answer ??
      undefined,
    postAnswerAt: item?.postAnswerAt ?? item?.answerAt ?? item?.commentAt ?? undefined,
  };
};

// ----------------------------------------------------------------------

export async function getBoardCategories(
  params: GetBoardCategoriesParams
): Promise<GetBoardCategoriesResult> {
  const response = await axiosInstance.get<GetBoardCategoriesResponse>(endpoints.board.categories, {
    params,
  });
  const data = response.data as any;
  const list = data?.postCategoryList || data?.list || data?.categories || [];
  return {
    categories: list,
    header: data?.header,
  };
}

export async function saveBoardCategories(
  params: SaveBoardCategoriesParams
): Promise<SaveBoardCategoriesResponse> {
  const response = await axiosInstance.post<SaveBoardCategoriesResponse>(
    endpoints.board.categories,
    params
  );
  return response.data;
}

export async function getBoardPosts(params: GetBoardPostsParams): Promise<GetBoardPostsResult> {
  const response = await axiosInstance.get<GetBoardPostsResponse>(endpoints.board.posts, {
    params,
  });

  const data = response.data as any;
  const list = data?.postList || data?.list || data?.posts || [];
  const totalCount = data?.totalCount ?? data?.total ?? list.length ?? 0;

  return {
    posts: list.map((item: any, index: number) => normalizeBoardPost(item, index)),
    totalCount: typeof totalCount === 'number' ? totalCount : Number(totalCount) || 0,
    header: data?.header,
  };
}

export async function createBoardPost(
  params: CreateBoardPostParams
): Promise<CreateBoardPostResponse> {
  const response = await axiosInstance.post<CreateBoardPostResponse>(endpoints.board.posts, params);
  return response.data;
}

export async function updateBoardPost(
  params: UpdateBoardPostParams
): Promise<UpdateBoardPostResponse> {
  const response = await axiosInstance.put<UpdateBoardPostResponse>(
    `${endpoints.board.posts}/${params.postIdx}`,
    params
  );
  return response.data;
}

export async function updateBoardPostsBulk(
  params: UpdateBoardPostsBulkParams
): Promise<UpdateBoardPostsBulkResponse> {
  const response = await axiosInstance.put<UpdateBoardPostsBulkResponse>(
    endpoints.board.posts,
    params
  );
  return response.data;
}

export async function deleteBoardPosts(
  params: DeleteBoardPostsParams
): Promise<DeleteBoardPostsResponse> {
  const response = await axiosInstance.delete<DeleteBoardPostsResponse>(endpoints.board.posts, {
    data: params,
  });
  return response.data;
}

export async function createBoardComment(
  params: CreateBoardCommentParams
): Promise<CreateBoardCommentResponse> {
  const response = await axiosInstance.post<CreateBoardCommentResponse>(
    endpoints.board.comments,
    params
  );
  return response.data;
}

export async function updateBoardComment(
  params: UpdateBoardCommentParams
): Promise<UpdateBoardCommentResponse> {
  const response = await axiosInstance.put<UpdateBoardCommentResponse>(
    `${endpoints.board.comments}/${params.commentIdx}`,
    params
  );
  return response.data;
}
