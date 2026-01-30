import type { BaseResponseDto, BaseResponseHeader } from '../common';

// ----------------------------------------------------------------------

export type PostGubun = '공지사항' | 'FAQ' | '문의/답변';
export type PostStatus = 'ACTIVE' | 'INACTIVE';

export type BoardCategory = {
  postCategoryIdx?: number;
  postCategoryTitle?: string;
  postCategoryType?: PostGubun | string;
};

export type GetBoardCategoriesParams = {
  postCategoryType: PostGubun | string;
};

export type GetBoardCategoriesResponse = BaseResponseDto<{
  postCategoryList?: BoardCategory[];
  list?: BoardCategory[];
  categories?: BoardCategory[];
}>;

export type SaveBoardCategoriesParams = {
  postCategoryType: PostGubun | string;
  postCategoryList: Array<{
    postCategoryTitle: string;
    postCategoryIdx?: number;
  }>;
};

export type SaveBoardCategoriesResponse = BaseResponseDto;

export type BoardPost = {
  postIdx?: number;
  postGubun?: PostGubun | string;
  postTarget1?: string;
  postTarget2?: string;
  postTitle?: string;
  postContent?: string;
  postFilePath?: string;
  isPop?: number;
  isPinned?: number;
  postStatus?: PostStatus;
  postCategoryIdx?: number;
  postCategoryTitle?: string;
  postViews?: number;
  adminName?: string;
  memberName?: string;
  createAt?: string;
  updateAt?: string;
  registrationDate?: string;
  postAnswerStatus?: number;
  postAnswerContent?: string;
  postAnswerAt?: string;
};

export type GetBoardPostsParams = {
  postGubun?: PostGubun | string;
  filterPostCategoryIndexes?: string;
  filterPostIndexes?: string;
  filterAdminIndexes?: string;
  filterMemberIndexes?: string;
  filterParentIndexes?: string;
  filterPostStatuses?: string;
  filterPostAnswerStatuses?: string;
  searchingKey?: string;
  searchingVal?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page: number;
  pageSize: number;
};

export type GetBoardPostsResponse = BaseResponseDto<{
  postList?: BoardPost[];
  list?: BoardPost[];
  posts?: BoardPost[];
  totalCount?: number;
  total?: number;
  header?: BaseResponseHeader;
}>;

export type GetBoardPostsResult = {
  posts: BoardPost[];
  totalCount: number;
  header?: BaseResponseHeader;
};

export type GetBoardCategoriesResult = {
  categories: BoardCategory[];
  header?: BaseResponseHeader;
};

export type CreateBoardPostParams = {
  postGubun: PostGubun | string;
  postTarget1?: string;
  postTarget2?: string;
  postTitle: string;
  postContent?: string;
  postFilePath?: string;
  isPop?: number;
  isPinned?: number;
  postStatus?: PostStatus;
  postCategoryIdx?: number;
};

export type CreateBoardPostResponse = BaseResponseDto<BoardPost>;

export type UpdateBoardPostParams = CreateBoardPostParams & {
  postIdx: number;
};

export type UpdateBoardPostResponse = BaseResponseDto<BoardPost>;

export type UpdateBoardPostsBulkParams = {
  filterPostIndexes: string;
  postStatus?: PostStatus;
  isPop?: number;
  isPinned?: number;
};

export type UpdateBoardPostsBulkResponse = BaseResponseDto;

export type DeleteBoardPostsParams = {
  postGubun: PostGubun | string;
  postIndexes: string;
};

export type DeleteBoardPostsResponse = BaseResponseDto;

export type CreateBoardCommentParams = {
  commentContent?: string;
  commentFilePath?: string;
  postIdx: number;
};

export type CreateBoardCommentResponse = BaseResponseDto;

export type UpdateBoardCommentParams = {
  commentIdx: number;
  commentContent?: string;
  commentFilePath?: string;
};

export type UpdateBoardCommentResponse = BaseResponseDto;
