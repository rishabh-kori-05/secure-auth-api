import { PaginationMeta } from '../types';

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function parsePaginationParams(
  rawPage: unknown,
  rawLimit: unknown,
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(String(rawPage ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(rawLimit ?? '20'), 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
