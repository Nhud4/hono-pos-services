import { Context } from 'hono';
import { ProductDomain } from '../domains/product.domain';
import {
  CreateProductSchema,
  ProductIdSchema,
  UpdateProductSchema
} from '../validators/product.validator';
import { successResponse, errorResponse } from '../utils/wrapper';

const domain = new ProductDomain();

export const getAllProductsHandler = async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const { data, meta } = await domain.getAllProducts(limit, offset);
    return c.json(successResponse(data, 'Products retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Failed to fetch products', 500), 500);
  }
};

export const getProductByIdHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as ProductIdSchema
    const { data, error } = await domain.getProductById(id);
    if (error) {
      return c.json(error, error.code);
    }
    return c.json(successResponse(data, 'Product retrieved successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const createProductHandler = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateProductSchema
    const product = await domain.createProduct(body);
    return c.json(successResponse(product, 'Product created successfully'), 201);
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 400), 400);
  }
};

export const updateProductHandler = async (c: Context) => {
  try {
    const id = c.req.param('id')
    const body = c.get('payload') as UpdateProductSchema
    const product = await domain.updateProduct(id, body);
    if (!product) {
      return c.json(errorResponse('Product not found', 404), 404);
    }
    return c.json(successResponse(product, 'Product updated successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const deleteProductHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as ProductIdSchema
    await domain.deleteProduct(id);
    return c.json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Invalid ID or server error', 500), 500);
  }
};