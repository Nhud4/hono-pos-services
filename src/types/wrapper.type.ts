import { ContentfulStatusCode } from "hono/utils/http-status";

export interface PaginationMeta {
  total: number;
  limit: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: ContentfulStatusCode;
  data: T | null;
  message: string;
  meta?: PaginationMeta;
}

export interface ErrorCustomType {
  message: string;
  code: ContentfulStatusCode;
}

export interface WrapperData<T = any> {
  data: T | null;
  error: ApiResponse | null
}

export interface WrapperMetaData<T = any> {
  data: T;
  meta: PaginationMeta
}