import { Context } from 'hono';
import { CompanyDomain } from '../domains/company.domain';
import {
  CreateCompanySchema,
  CompanyIdSchema,
  UpdateCompanySchema
} from '../validators/company.validator';
import { successResponse, errorResponse } from '../utils/wrapper';

const domain = new CompanyDomain();

export const getAllCompaniesHandler = async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = parseInt(c.req.query('offset') || '0');
    const { data, meta } = await domain.getAllCompanies(limit, offset);
    return c.json(successResponse(data, 'Companies retrieved successfully', 200, meta));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Failed to fetch companies', 500), 500);
  }
};

export const getCompanyByIdHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as CompanyIdSchema
    const { data, error } = await domain.getCompanyById(id);
    if (error) {
      return c.json(error, error.code);
    }
    return c.json(successResponse(data, 'Company retrieved successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const createCompanyHandler = async (c: Context) => {
  try {
    const body = c.get('payload') as CreateCompanySchema
    const company = await domain.createCompany(body);
    return c.json(successResponse(company, 'Company created successfully'), 201);
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 400), 400);
  }
};

export const updateCompanyHandler = async (c: Context) => {
  try {
    const id = c.req.param('id')
    const body = c.get('payload') as UpdateCompanySchema
    const company = await domain.updateCompany(id, body);
    if (!company) {
      return c.json(errorResponse('Company not found', 404), 404);
    }
    return c.json(successResponse(company, 'Company updated successfully'));
  } catch (error: any) {
    console.log(error)
    return c.json(errorResponse(error.message, 500), 500);
  }
};

export const deleteCompanyHandler = async (c: Context) => {
  try {
    const { id } = c.get('payload') as CompanyIdSchema
    await domain.deleteCompany(id);
    return c.json(successResponse(null, 'Company deleted successfully'));
  } catch (error) {
    console.log(error)
    return c.json(errorResponse('Invalid ID or server error', 500), 500);
  }
};