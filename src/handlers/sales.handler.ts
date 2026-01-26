import { Context } from 'hono';
import { SalesDomain } from '../domains/sales.domain';
import { CreateSaleSchema, SaleIdSchema, UpdateSaleSchema } from '../validators/sales.validator';
import { successResponse, errorResponse } from '../utils/wrapper';

const domain = new SalesDomain();

export const getAllSalesHandler = async (c: Context) => {
  try {
    console.time('getAllSalesHandler');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const { data, meta } = await domain.getAllSales(limit, offset);
    console.timeEnd('getAllSalesHandler');
    return c.json(successResponse(data, 'Sales retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error);
    return c.json(errorResponse('Failed to fetch sales', 500), 500);
  }
};

export const getSaleByIdHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as SaleIdSchema;
    const { data, error } = await domain.getSaleById(id);
    if (error) {
      return c.json(error, error.code);
    }
    return c.json(successResponse(data, 'Sale retrieved successfully'));
  } catch (error: any) {
    console.log(error);
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const createSaleHandler = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateSaleSchema;
    const sale = await domain.createSale(body);
    return c.json(successResponse(sale, 'Sale created successfully'), 201);
  } catch (error: any) {
    console.log(error);
    return c.json(errorResponse(error.message, 400), 400);
  }
};

export const updateSaleHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const body = c.get('payload') as UpdateSaleSchema;
    const sale = await domain.updateSale(id, body);
    if (!sale) {
      return c.json(errorResponse('Sale not found', 404), 404);
    }
    return c.json(successResponse(sale, 'Sale updated successfully'));
  } catch (error: any) {
    console.log(error);
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const deleteSaleHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as SaleIdSchema;
    await domain.deleteSale(id);
    return c.json(successResponse(null, 'Sale deleted successfully'));
  } catch (error) {
    console.log(error);
    return c.json(errorResponse('Invalid ID or server error', 500), 500);
  }
};
