import { Context } from 'hono';
import { SalesDomain } from '../domains/sales.domain';
import { successResponse, errorResponse } from '../utils/wrapper';
import {
  ListSalesSchema,
  SummarySalesSchema,
  YearsSalesSchema,
} from '../validators/sales.validator';

const domain = new SalesDomain();

export const getAllSalesHandler = async (c: Context) => {
  try {
    const params = c.get('payload') as ListSalesSchema;

    const { data, meta } = await domain.listProductSales(params);

    return c.json(successResponse(data, 'Sales retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error);
    return c.json(errorResponse('Failed to fetch sales', 500), 500);
  }
};

export const summarySales = async (c: Context) => {
  try {
    const params = c.get('payload') as SummarySalesSchema;

    const data = await domain.getSummarySales(params);

    return c.json(successResponse(data, 'Sales retrieved successfully', 200));
  } catch (error) {
    console.log(error);
    return c.json(errorResponse('Failed to fetch sales', 500), 500);
  }
};

export const yearSales = async (c: Context) => {
  try {
    const params = c.get('payload') as YearsSalesSchema;

    const data = await domain.getYearsSales(params);

    return c.json(successResponse(data, 'Sales retrieved successfully', 200));
  } catch (error) {
    console.log(error);
    return c.json(errorResponse('Failed to fetch sales', 500), 500);
  }
};
