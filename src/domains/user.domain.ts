import { UserRepository } from '../repositories/user.repo';
import { CompanyRepository } from '../repositories/company.repo';
import { wrapperData } from '../utils/wrapper';
import { BadRequest, DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta } from '../types/wrapper.type';
import { sign } from 'hono/jwt';
import localConfig from '../libs/config';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  ListUserRequest
} from '../types/user.type';

export class UserDomain {
  private repo: UserRepository;
  private companyRepo: CompanyRepository;

  constructor() {
    this.repo = new UserRepository();
    this.companyRepo = new CompanyRepository();
  }

  async getAllUsers(params: ListUserRequest): Promise<{ data: User[], meta: PaginationMeta }> {
    const limit = parseInt(params.size)
    const offset = (parseInt(params.page) - 1) * limit

    const result = await this.repo.getAllUsers(limit, offset);

    const meta: PaginationMeta = {
      total: result.total,
      limit,
      totalPages: result.total > 0 ? Math.ceil(result.total / limit) : 1,
      currentPage: Math.floor(offset / limit) + 1
    };

    return { data: result.data, meta };
  }

  async getUserById(id: string): Promise<WrapperData> {
    const data = await this.repo.getUserById(id);
    if (!data) {
      return wrapperData(null, DataNotFound())
    }

    return wrapperData(data, null)
  }

  async createUser(userData: CreateUserRequest): Promise<WrapperData> {
    this.validateCreateUser(userData);
    if (userData.companyId) {
      const companyId = userData.companyId.toString()
      const company = await this.companyRepo.getCompanyById(companyId)
      if (!company) {
        return wrapperData(null, DataNotFound())
      }
    }

    // check username
    const check = await this.repo.getUserByUsername(userData.username)
    if (check) {
      return wrapperData(null, BadRequest('Username telah digunakan'))
    }

    const result = await this.repo.createUser(userData);
    return wrapperData(result, null)
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    this.validateUpdateUser(updates);
    // check username uniqueness if updating username
    if (updates.username) {
      const existing = await this.repo.getUserByUsername(updates.username);
      if (existing && existing.id !== id) {
        throw new Error('Username already taken');
      }
    }
    return this.repo.updateUser(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repo.deleteUser(id);
  }

  async login(loginData: LoginRequest): Promise<LoginResponse | null> {
    const user = await this.repo.verifyPassword(
      loginData.username,
      loginData.password,
      loginData.role,
    );
    if (!user) return null;

    const now = Math.floor(Date.now() / 1000)
    const expSeconds = 60 * 60 * 24 // 1 hari

    const payload = {
      id: user.id,
      role: user.role,
      username: user.username,
      name: user.name,
      exp: now + expSeconds,
    };

    const token = await sign(payload, localConfig.jwt, 'HS256');

    return {
      user,
      token,
      expiredAt: new Date((now + expSeconds) * 1000).toISOString(),
    };
  }

  private validateCreateUser(user: CreateUserRequest): void {
    if (!user.name || user.name.trim().length === 0) {
      throw new Error('User name is required');
    }
    if (!user.role || user.role.trim().length === 0) {
      throw new Error('User role is required');
    }
    if (!user.username || user.username.trim().length === 0) {
      throw new Error('Username is required');
    }
    if (!user.password || user.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }

  private validateUpdateUser(updates: UpdateUserRequest): void {
    if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
      throw new Error('User name cannot be empty');
    }
    if (updates.role !== undefined && (!updates.role || updates.role.trim().length === 0)) {
      throw new Error('User role cannot be empty');
    }
    if (updates.username !== undefined && (!updates.username || updates.username.trim().length === 0)) {
      throw new Error('Username cannot be empty');
    }
    if (updates.password !== undefined && updates.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }
}