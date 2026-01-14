import { ProductRepository } from '../repositories/product.repo';
import { ProductsCategoryRepository } from '../repositories/products_category.repo';
import { wrapperData } from '../utils/wrapper';
import { BadRequest, DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta } from '../types/wrapper.type';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductRequest
} from '../types/product.type';

export class ProductDomain {
  private repo: ProductRepository;
  private category: ProductsCategoryRepository;

  constructor() {
    this.repo = new ProductRepository();
    this.category = new ProductsCategoryRepository()
  }

  async getAllProducts(params: ListProductRequest): Promise<{ data: Product[], meta: PaginationMeta }> {
    const limit = parseInt(params.size)
    const offset = (parseInt(params.page) - 1) * limit

    const result = await this.repo.getAllProducts(limit, offset);

    const meta: PaginationMeta = {
      total: result.total,
      limit,
      totalPages: result.total > 0 ? Math.ceil(result.total / limit) : 1,
      currentPage: Math.floor(offset / limit) + 1
    };

    return { data: result.data, meta };
  }

  async getProductById(id: string): Promise<WrapperData> {
    const data = await this.repo.getProductById(id);
    if (!data) {
      return wrapperData(null, DataNotFound())
    }
    return wrapperData(data, null)
  }

  async createProduct(productData: CreateProductRequest): Promise<WrapperData> {
    // check name
    const checkName = await this.repo.getProductByName(productData.name.toLowerCase())
    if (checkName) {
      return wrapperData(null, BadRequest('Nama produk sudah digunakan'))
    }

    // check category
    const checkCategory = await this.category.getProductsCategoryById(productData.categoryId)
    if (!checkCategory) {
      return wrapperData(null, DataNotFound('Kategori tidak ditemukan'))
    }

    const result = await this.repo.createProduct(productData);

    return wrapperData(result, null)
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<WrapperData> {
    // check data id
    const checkId = await this.repo.getProductById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    // check name
    const checkName = await this.repo.getProductByName(updates.name)
    if (checkName && checkName.id !== id) {
      return wrapperData(null, BadRequest())
    }

    // check category
    const checkCategory = await this.category.getProductsCategoryById(updates.categoryId)
    if (!checkCategory) {
      return wrapperData(null, DataNotFound('Kategori tidak ditemukan'))
    }

    const result = await this.repo.updateProduct(id, updates);
    return wrapperData(result, null)
  }

  async deleteProduct(id: string): Promise<WrapperData> {
    // check data id
    const checkId = await this.repo.getProductById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    const result = await this.repo.deleteProduct(id);
    return wrapperData({ code: result?.code }, null)
  }
}