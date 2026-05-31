import { Response } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest, PaginationQuery } from '../types';
import { AppError } from '../utils/AppError';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw AppError.unauthorized();

  const user = await userService.getProfile(req.user.id);
  sendSuccess(res, 'Profile fetched', user);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw AppError.unauthorized();

  const { name } = req.body as { name?: string };
  const user = await userService.updateProfile(req.user.id, { name });
  sendSuccess(res, 'Profile updated', user);
});

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query: PaginationQuery = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
  };

  const { users, meta } = await userService.listUsers(query);
  sendSuccess(res, 'Users fetched', users, 200, meta);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    throw AppError.badRequest('Cannot delete your own account via this endpoint');
  }

  await userService.deleteUser(id);
  sendSuccess(res, 'User deleted successfully');
});
