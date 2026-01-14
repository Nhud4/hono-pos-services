import { Context } from 'hono';
import { ProductsCategoryDomain } from '../domains/products_category.domain';
import {
  CreateProductsCategorySchema,
  ProductsCategoryIdSchema,
  UpdateProductsCategorySchema,
  ListProductsCategorySchema
} from '../validators/products_category.validator';
import { successResponse, errorResponse } from '../utils/wrapper';

const domain = new ProductsCategoryDomain();

export const getAllProductsCategoriesHandler = async (c: Context) => {
  try {
    const params = c.get('payload') as ListProductsCategorySchema

    const { data, meta } = await domain.getAllProductsCategories(params);

    return c.json(successResponse(data, 'Products categories retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Failed to fetch products categories', 500), 500);
  }
};

export const getProductsCategoryByIdHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as ProductsCategoryIdSchema
    const { data, error } = await domain.getProductsCategoryById(id);
    if (error) return c.json(error, error.code);

    return c.json(successResponse(data, 'Products category retrieved successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const createProductsCategoryHandler = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateProductsCategorySchema

    const { data, error } = await domain.createProductsCategory(body);
    if (error) return c.json(error, error.code);

    return c.json(successResponse(data, 'Products category created successfully'), 201);
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 400), 400);
  }
};

export const updateProductsCategoryHandler = async (c: Context) => {
  try {
    const id = c.req.param('id')
    const body = c.get('payload') as UpdateProductsCategorySchema

    const { data, error } = await domain.updateProductsCategory(id, body);
    if (error) return c.json(error, error.code);

    return c.json(successResponse(data, 'Products category updated successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const deleteProductsCategoryHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as ProductsCategoryIdSchema

    const { data, error } = await domain.deleteProductsCategory(id);
    if (error) return c.json(error, error.code);

    return c.json(successResponse(data, 'Products category deleted successfully'));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Invalid ID or server error', 500), 500);
  }
};