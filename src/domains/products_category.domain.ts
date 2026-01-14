import { ProductsCategoryRepository } from '../repositories/products_category.repo';
import { wrapperData } from '../utils/wrapper';
import { BadRequest, DataNotFound } from '../utils/errors';
import {
  WrapperData,
  PaginationMeta,
  WrapperMetaData,
} from '../types/wrapper.type';
import {
  ProductsCategory,
  CreateProductsCategoryRequest,
  UpdateProductsCategoryRequest,
  ListProductsCategoryRequest
} from '../types/products_category.type';

export class ProductsCategoryDomain {
  private repo: ProductsCategoryRepository;

  constructor() {
    this.repo = new ProductsCategoryRepository();
  }

  async getAllProductsCategories(params: ListProductsCategoryRequest): Promise<WrapperMetaData> {
    const limit = parseInt(params.size)
    const offset = (parseInt(params.page) - 1) * limit

    const result = await this.repo.getAllProductsCategories(limit, offset);

    const meta: PaginationMeta = {
      total: result.total,
      limit,
      totalPages: result.total > 0 ? Math.ceil(result.total / limit) : 1,
      currentPage: Math.floor(offset / limit) + 1
    };

    return { data: result.data, meta };
  }

  async getProductsCategoryById(id: string): Promise<WrapperData> {
    const data = await this.repo.getProductsCategoryById(id);
    if (!data) {
      return wrapperData(null, DataNotFound())
    }
    return wrapperData(data, null)
  }

  async createProductsCategory(categoryData: CreateProductsCategoryRequest): Promise<WrapperData> {
    // check category name
    const check = await this.repo.getProductsCategoryByName(categoryData.name.toLowerCase())
    if (check) {
      return wrapperData(null, BadRequest('Nama kategori sudah digunakan'))
    }

    const data = await this.repo.createProductsCategory(categoryData);
    return wrapperData(data, null)
  }

  async updateProductsCategory(id: string, updates: UpdateProductsCategoryRequest): Promise<WrapperData> {
    // check category id
    const checkId = await this.repo.getProductsCategoryById(id);
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    // check category name
    const checkName = await this.repo.getProductsCategoryByName(updates.name.toLowerCase())
    if (checkName) {
      return wrapperData(null, BadRequest('Nama kategori sudah digunakan'))
    }

    const data = await this.repo.updateProductsCategory(id, updates);
    return wrapperData(data, null)
  }

  async deleteProductsCategory(id: string): Promise<WrapperData> {
    const check = await this.repo.getProductsCategoryById(id);
    if (!check) {
      return wrapperData(null, DataNotFound())
    }

    const data = await this.repo.deleteProductsCategory(id);

    return wrapperData({ code: data?.code }, null)
  }
}