export interface PaginatedResolveResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: number;
  hasPrevPage: boolean;
  prevPage: number;
  pagingCounter: number;
}
