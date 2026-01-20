import { ProductRepository } from '../repositories/product.repo';
import { ProductsCategoryRepository } from '../repositories/products_category.repo';
import { wrapperData } from '../utils/wrapper';
import { BadRequest, DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta, WrapperMetaData } from '../types/wrapper.type';
import { getDiscountPrice } from '../utils/codeGenerator';
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

  async getAllProducts(params: ListProductRequest): Promise<WrapperMetaData> {
    const limit = parseInt(params.size)
    const offset = limit > 0 ? (parseInt(params.page) - 1) * limit : 0

    const { data, total } = await this.repo.getAllProducts(
      limit,
      offset,
      params.search,
      params.categoryId,
      params.allocation
    );

    const meta: PaginationMeta = {
      total: total,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 1,
      currentPage: limit > 0 ? Math.floor(offset / limit) + 1 : 1
    };

    const newData = data.map((val) => ({
      id: val.products.id,
      code: val.products.code,
      name: val.products.name,
      price: val.products.normalPrice,
      discount: getDiscountPrice(
        val.products.discountType,
        val.products.normalPrice || 0,
        val.products.discount || 0
      ),
      stock: val.products.stock,
      active: val.products.active,
      available: val.products.available,
      img: val.products.img,
      category: {
        id: val.products_category.id,
        name: val.products_category.name
      }
    }))

    return { data: newData, meta };
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

    let imgUrl = ''

    const result = await this.repo.createProduct({ ...productData, img: imgUrl });

    return wrapperData(result, null)
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<WrapperData> {
    this.validateUpdateProduct(updates);
    // check data id
    const checkId = await this.repo.getProductById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    // check name
    const checkName = await this.repo.getProductByName(updates.name.toLowerCase())
    if (checkName && checkName.id !== id) {
      return wrapperData(null, BadRequest('Nama produk sudah digunakan'))
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

  private validateUpdateProduct(updates: UpdateProductRequest): void {
    if (!updates.name || updates.name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (!updates.categoryId || updates.categoryId.trim().length === 0) {
      throw new Error('Category is required');
    }
  }
}