import { Context } from 'hono';
import { TransactionDomain } from '../domains/transaction.domain';
import { successResponse, errorResponse } from '../utils/wrapper';
import {
  CreateOrderSchema,
  CreateTransactionSchema,
  ListTransactionSchema,
  TransactionIdSchema,
  UpdateTransactionSchema
} from '../validators/transactions.validator';
import { GetOrderRequest } from '../types/transactions.type';

const domain = new TransactionDomain()

export const getOrder = async (c: Context) => {
  try {
    const user = c.get('user') as GetOrderRequest

    const { data, error } = await domain.getOrder(user)
    if (error) {
      return c.json(error, error.code);
    }

    return c.json(
      successResponse(data, 'Order retrieved successfully', 200),
      200
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
}

export const createOrder = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateOrderSchema
    const user = c.get('user') as GetOrderRequest

    const { data, error } = await domain.createOrder(user, body)
    if (error) {
      return c.json(error, error.code);
    }

    return c.json(
      successResponse(data, 'Order created successfully', 201),
      201
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
}

export const listTransaction = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateTransactionSchema

    return c.json(
      successResponse(body, 'Order created successfully', 201),
      201
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
}

export const detailTransaction = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateTransactionSchema

    return c.json(
      successResponse(body, 'Order created successfully', 201),
      201
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
}

export const createTransaction = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateTransactionSchema

    return c.json(
      successResponse(body, 'Order created successfully', 201),
      201
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
}

export const updateTransaction = async (c: Context) => {
  try {
    const body = c.get('payload') as UpdateTransactionSchema

    return c.json(
      successResponse(body, 'Order created successfully', 201),
      201
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
}

export const deleteTransaction = async (c: Context) => {
  try {
    const body = c.get('payload') as TransactionIdSchema

    return c.json(
      successResponse(body, 'Order created successfully', 201),
      201
    );
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Internal server error', 500), 500);
  }
} 