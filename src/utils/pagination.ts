export interface PaginationParams {
  page?: number;
  limit?: number;
  pageSize?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPagination(params: PaginationParams = {}): PaginationResult {
  const page = Math.max(1, Number(params.page) || 1);
  const raw = Number(params.pageSize ?? params.limit) || 20;
  const limit = Math.min(100, Math.max(1, raw));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/** @deprecated Prefer toPaginated for frontend-compatible shape */
export function paginationMeta(
  total: number,
  page: number,
  limit: number
) {
  return {
    total,
    page,
    limit,
    pageSize: limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/** Flat paginated payload matching frontend `Paginated<T>`. */
export function toPaginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
