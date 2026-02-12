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

export type BoardCommentInformation = {
  commentIdx?: number;
  commentContent?: string;
  commentFilePath?: string;
  commentCreateAt?: string;
  memberIdx?: number;
  memberId?: string;
  memberName?: string;
  memberThumbnail?: string;
};

export type BoardMemberInformation = {
  memberIdx?: number;
  memberId?: string;
  memberName?: string;
  memberRole?: string;
  isSuperAdmin?: boolean;
  memberEmail?: string | null;
  memberPhone?: string | null;
  memberThumbnail?: string | null;
};

export type BoardPostFile = {
  originalFileName: string;
  fileUrl: string;
};

export type BoardPost = {
  postIdx?: number;
  postGubun?: PostGubun | string;
  postTarget1?: string;
  postTarget2?: string;
  postTitle?: string;
  postContent?: string;
  postFilePath?: string | BoardPostFile[];
  isPop?: number;
  isPinned?: number;
  postStatus?: PostStatus;
  postCategoryIdx?: number;
  postCategoryTitle?: string;
  categoryIdx?: number; // API 응답에서 오는 경우
  categoryTitle?: string; // API 응답에서 오는 경우
  categoryType?: string; // API 응답에서 오는 경우
  postViews?: number;
  viewCount?: number; // API 응답에서 오는 경우
  adminName?: string;
  memberName?: string;
  memberEmail?: string; // API 응답에서 오는 경우
  memberId?: string; // 회원 ID
  memberPhone?: string; // 전화번호
  memberRole?: string; // 작성자 역할
  authorIsSuperAdmin?: boolean; // 작성자 최고관리자 여부
  memberInformation?: BoardMemberInformation; // 작성자 정보
  createAt?: string;
  updateAt?: string;
  registrationDate?: string;
  postAnswerStatus?: number;
  postAnswerContent?: string;
  postAnswerAt?: string;
  commentInformation?: BoardCommentInformation; // 답변 정보
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

export type GetBoardPostDetailResult = {
  post: BoardPost | null;
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
  postFilePath?: string | BoardPostFile[];
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
