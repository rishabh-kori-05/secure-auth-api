import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { buildPaginationMeta, parsePaginationParams } from '../utils/pagination';
import { PaginationMeta, PaginationQuery, SafeUser } from '../types';

class UserService {
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await User.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    updates: { name?: string },
  ): Promise<SafeUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) throw AppError.notFound('User not found');

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  async listUsers(
    query: PaginationQuery,
  ): Promise<{ users: Record<string, unknown>[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePaginationParams(query.page, query.limit);

    const filter: Record<string, unknown> = {};

    if (query.search) {
      const regex = { $regex: query.search, $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const sortField = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw AppError.notFound('User not found');
  }
}

export const userService = new UserService();
