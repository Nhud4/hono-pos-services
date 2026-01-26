import { eq, and, isNull } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { users } from '../../drizzle/schema';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/user.type';
import { generateCode } from '../utils/codeGenerator';

// Helper function to convert Drizzle result to our User type
function convertToUser(drizzleUser: any): User {
  return {
    id: drizzleUser.id.toString(),
    code: drizzleUser.code,
    name: drizzleUser.name,
    role: drizzleUser.role,
    username: drizzleUser.username,
    active: drizzleUser.active,
    lastLogin: drizzleUser.lastLogin?.toISOString(),
    companyId: drizzleUser.companyId,
  };
}

export class UserRepository {
  async getAllUsers(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: User[]; total: number }> {
    const db = createDb(localConfig.dbUrl);

    const [dataResult, totalResult] = await Promise.all([
      db
        .select()
        .from(users)
        .where(isNull(users.deletedAt))
        .orderBy(users.createdAt)
        .limit(limit)
        .offset(offset),
      db.$count(users, isNull(users.deletedAt)),
    ]);

    return {
      data: dataResult.map(convertToUser),
      total: totalResult,
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, parseInt(id)), isNull(users.deletedAt)));
    return result[0] ? convertToUser(result[0]) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));
    return result[0] ? convertToUser(result[0]) : null;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const db = createDb(localConfig.dbUrl);
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await db
      .insert(users)
      .values({
        code: generateCode('USR'),
        name: userData.name,
        role: userData.role,
        username: userData.username,
        password: hashedPassword,
        active: true,
        companyId: userData.companyId,
      })
      .returning();

    return convertToUser(result[0]);
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const db = createDb(localConfig.dbUrl);
    const updateData: any = { updatedAt: new Date() };

    if (updates.name) updateData.name = updates.name;
    if (updates.role) updateData.role = updates.role;
    if (updates.username) updateData.username = updates.username;
    if (updates.password) updateData.password = await bcrypt.hash(updates.password, 10);
    if (updates.active) updateData.active = updates.active === 'true' ? true : false;
    if (updates.companyId) updateData.companyId = updates.companyId;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return result[0] ? convertToUser(result[0]) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, parseInt(id)))
      .returning();
    return result.length > 0;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));
    if (!result[0] || !result[0].password) return null;

    const isValid = await bcrypt.compare(password, result[0].password);
    if (!isValid) return null;

    // Update lastLogin
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, result[0].id));

    return convertToUser(result[0]);
  }
}
