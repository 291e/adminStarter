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
  GetBoardPostDetailResult,
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

const normalizePostFilePath = (raw: any): string | Array<{ originalFileName: string; fileUrl: string }> | undefined => {
  if (!raw) return undefined;

  const normalizeArray = (value: any[]) =>
    value
      .map((item) => {
        const fileUrl = item?.fileUrl ?? item?.url ?? item?.path ?? item;
        const originalFileName =
          item?.originalFileName ??
          item?.fileName ??
          item?.name ??
          (typeof fileUrl === 'string' ? fileUrl.split('/').pop() : '');

        if (!fileUrl || typeof fileUrl !== 'string') return null;
        return {
          originalFileName: String(originalFileName || fileUrl.split('/').pop() || ''),
          fileUrl,
        };
      })
      .filter(Boolean) as Array<{ originalFileName: string; fileUrl: string }>;

  if (Array.isArray(raw)) {
    return normalizeArray(raw);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return normalizeArray(parsed);
      } catch {
        return raw;
      }
    }
    return raw;
  }

  if (typeof raw === 'object') {
    const normalized = normalizeArray([raw]);
    return normalized.length ? normalized : undefined;
  }

  return undefined;
};

const serializePostFilePath = (value: any) => {
  if (Array.isArray(value)) {
    return JSON.stringify(
      value.map((item) => ({
        originalFileName: item?.originalFileName ?? '',
        fileUrl: item?.fileUrl ?? item?.url ?? '',
      }))
    );
  }

  return value;
};

const normalizeBoardPost = (item: any, index: number): BoardPost => {
  const postIdx = item?.postIdx ?? item?.postId ?? item?.id ?? item?.postIDX ?? index;
  const registrationDate =
    item?.registrationDate ||
    item?.createAt ||
    item?.createdAt ||
    item?.postCreatedAt ||
    item?.updatedAt ||
    '';
  const memberInformation = item?.memberInformation ?? {};
  const memberRole =
    item?.memberRole ??
    item?.role ??
    item?.writerRole ??
    memberInformation?.memberRole ??
    memberInformation?.role;
  const normalizedMemberRole = typeof memberRole === 'string' ? memberRole.toUpperCase() : '';
  const authorIsSuperAdmin =
    item?.isSuperAdmin === true ||
    memberInformation?.isSuperAdmin === true ||
    normalizedMemberRole === 'SUPER_ADMIN';

  return {
    postIdx: typeof postIdx === 'number' ? postIdx : Number(postIdx) || index,
    postGubun: item?.postGubun ?? item?.postType ?? item?.gubun,
    postTarget1: item?.postTarget1 ?? item?.target1,
    postTarget2: item?.postTarget2 ?? item?.target2,
    postTitle: item?.postTitle ?? item?.title,
    postContent: item?.postContent ?? item?.content,
    postFilePath: normalizePostFilePath(item?.postFilePath ?? item?.filePath ?? item?.fileUrl),
    isPop: typeof item?.isPop === 'number' ? item.isPop : Number(item?.isPop) || 0,
    isPinned: typeof item?.isPinned === 'number' ? item.isPinned : Number(item?.isPinned) || 0,
    postStatus: item?.postStatus ?? item?.status,
    postCategoryIdx:
      item?.postCategoryIdx ?? item?.postCategoryId ?? item?.categoryIdx ?? item?.categoryId ?? null,
    postCategoryTitle:
      item?.postCategoryTitle ??
      item?.postCategoryName ??
      item?.categoryTitle ??
      item?.categoryName ??
      null,
    categoryIdx: item?.categoryIdx ?? item?.postCategoryIdx ?? null,
    categoryTitle: item?.categoryTitle ?? item?.postCategoryTitle ?? null,
    categoryType: item?.categoryType ?? item?.postCategoryType ?? null,
    postViews:
      typeof item?.postViews === 'number'
        ? item.postViews
        : typeof item?.viewCount === 'number'
          ? item.viewCount
          : typeof item?.views === 'number'
            ? item.views
            : Number(item?.postViews || item?.viewCount || item?.views) || 0,
    adminName:
      item?.adminName ??
      item?.author ??
      item?.writerName ??
      item?.createdByName ??
      memberInformation?.memberName,
    memberName:
      item?.memberName ??
      item?.memberNickname ??
      item?.writerMemberName ??
      memberInformation?.memberName,
    memberRole: typeof memberRole === 'string' ? memberRole : undefined,
    authorIsSuperAdmin,
    memberEmail: item?.memberEmail ?? item?.email ?? memberInformation?.memberEmail ?? null,
    memberId: item?.memberId ?? item?.memberID ?? memberInformation?.memberId ?? null,
    memberPhone:
      item?.memberPhone ?? item?.phone ?? item?.phoneNumber ?? memberInformation?.memberPhone ?? null,
    memberInformation:
      memberInformation && typeof memberInformation === 'object'
        ? {
            memberIdx: memberInformation?.memberIdx,
            memberId: memberInformation?.memberId,
            memberName: memberInformation?.memberName,
            memberRole: memberInformation?.memberRole ?? memberInformation?.role,
            isSuperAdmin: memberInformation?.isSuperAdmin === true,
            memberEmail: memberInformation?.memberEmail ?? null,
            memberPhone: memberInformation?.memberPhone ?? null,
            memberThumbnail: memberInformation?.memberThumbnail ?? null,
          }
        : undefined,
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
    commentInformation: item?.commentInformation ?? undefined,
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
  // 응답 구조: data.data 배열 또는 data.postCategoryList 등
  const list =
    data?.data ||
    data?.postCategoryList ||
    data?.list ||
    data?.categories ||
    (Array.isArray(data) ? data : []);
  return {
    categories: Array.isArray(list) ? list : [],
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
  // 응답 구조: data.data 배열 또는 data.postList 등
  const list =
    data?.data ||
    data?.postList ||
    data?.list ||
    data?.posts ||
    (Array.isArray(data) ? data : []);
  const totalCount = data?.totalCount ?? data?.total ?? (Array.isArray(list) ? list.length : 0);

  return {
    posts: Array.isArray(list) ? list.map((item: any, index: number) => normalizeBoardPost(item, index)) : [],
    totalCount: typeof totalCount === 'number' ? totalCount : Number(totalCount) || 0,
    header: data?.header,
  };
}

export async function getBoardPostDetail(postIdx: number): Promise<GetBoardPostDetailResult> {
  const response = await axiosInstance.get<any>(`${endpoints.board.posts}/${postIdx}`);
  const data = response.data as any;
  const rawPost = data?.data || data?.post || data;

  if (!rawPost || typeof rawPost !== 'object') {
    return { post: null, header: data?.header };
  }

  return {
    post: normalizeBoardPost(rawPost, 0),
    header: data?.header,
  };
}

export async function createBoardPost(
  params: CreateBoardPostParams
): Promise<CreateBoardPostResponse> {
  const payload = {
    ...params,
    ...(params.postFilePath !== undefined && {
      postFilePath: serializePostFilePath(params.postFilePath),
    }),
  };

  const response = await axiosInstance.post<CreateBoardPostResponse>(endpoints.board.posts, payload);
  return response.data;
}

export async function updateBoardPost(
  params: UpdateBoardPostParams
): Promise<UpdateBoardPostResponse> {
  const payload = {
    ...params,
    ...(params.postFilePath !== undefined && {
      postFilePath: serializePostFilePath(params.postFilePath),
    }),
  };

  const response = await axiosInstance.put<UpdateBoardPostResponse>(
    `${endpoints.board.posts}/${params.postIdx}`,
    payload
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
