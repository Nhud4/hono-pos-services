import { Context } from 'hono';
import { SalesDomain } from '../domains/sales.domain';
import { successResponse, errorResponse } from '../utils/wrapper';
import { ListSalesSchema } from '../validators/sales.validator';

const domain = new SalesDomain();

export const getAllSalesHandler = async (c: Context) => {
  try {
    const params = c.get('payload') as ListSalesSchema;

    const { data, meta } = await domain.getAllSales(params);

    return c.json(successResponse(data, 'Sales retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error);
    return c.json(errorResponse('Failed to fetch sales', 500), 500);
  }
};
