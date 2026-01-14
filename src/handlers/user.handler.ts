import { Context } from 'hono';
import { UserDomain } from '../domains/user.domain';
import {
  CreateUserSchema,
  UserIdSchema,
  UpdateUserSchema,
  LoginSchema,
  ListUserSchema
} from '../validators/user.validator';
import { successResponse, errorResponse } from '../utils/wrapper';

const domain = new UserDomain();

export const getAllUsersHandler = async (c: Context) => {
  try {
    const params = c.get('payload') as ListUserSchema

    const { data, meta } = await domain.getAllUsers(params);

    return c.json(successResponse(data, 'Users retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Failed to fetch users', 500), 500);
  }
};

export const getUserByIdHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as UserIdSchema

    const { data, error } = await domain.getUserById(id);
    if (error) {
      return c.json(error, error.code);
    }

    return c.json(successResponse(data, 'User retrieved successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const createUserHandler = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateUserSchema

    const { data, error } = await domain.createUser(body);
    if (error) {
      return c.json(error, error.code);
    }

    return c.json(successResponse(data, 'User created successfully'), 201);
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 400), 400);
  }
};

export const updateUserHandler = async (c: Context) => {
  try {
    const id = c.req.param('id')
    const body = c.get('payload') as UpdateUserSchema

    const user = await domain.updateUser(id, body);
    if (!user) {
      return c.json(errorResponse('User not found', 404), 404);
    }

    return c.json(successResponse(user, 'User updated successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const deleteUserHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as UserIdSchema

    await domain.deleteUser(id);

    return c.json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Invalid ID or server error', 500), 500);
  }
};

export const loginHandler = async (c: Context) => {
  try {
    const body = c.get('payload') as LoginSchema

    const result = await domain.login(body);
    if (!result) {
      return c.json(errorResponse('Invalid username or password', 401), 401);
    }

    return c.json(successResponse(result, 'Login successful'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const profileHandler = async (c: Context) => {
  try {
    const { id } = c.get('user') as UserIdSchema

    const { data, error } = await domain.getUserById(id);
    if (error) {
      return c.json(error, error.code);
    }

    return c.json(successResponse(data, 'User retrieved successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};