import { ProductRepository } from '../repositories/product.repo';
import { ProductsCategoryRepository } from '../repositories/products_category.repo';
import { wrapperData } from '../utils/wrapper';
import { BadRequest, DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta, WrapperMetaData } from '../types/wrapper.type';
import { uploadImage } from '../utils/imageUpload';
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
      page: Number(params.page),
      totalData: total,
      totalPage: total > 0 ? Math.ceil(total / limit) : 1,
      totalPerPage: limit,
    };

    const newData = data.map(({ products: prd, products_category: cat }) => ({
      id: prd.id,
      code: prd.code,
      name: prd.name,
      price: prd.normalPrice,
      discount: prd.discount,
      discountPrice: prd.discountPrice || 0,
      stock: prd.stock,
      active: prd.active,
      available: prd.available,
      img: prd.img,
      category: {
        id: cat.id,
        name: cat.name
      }
    }))

    return { data: newData, meta };
  }

  async getProductById(id: string): Promise<WrapperData> {
    const data = await this.repo.getProductById(id);
    if (!data) {
      return wrapperData(null, DataNotFound())
    }

    const newData = {
      ...data.products,
      category: {
        id: data.products_category.id,
        name: data.products_category.name
      }
    }

    return wrapperData(newData, null)
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

    const { img, ...rest } = productData;
    let imgUrl = ''
    if (img) {
      let imageBuffer: Buffer;
      if (typeof img === 'object' && img && 'arrayBuffer' in img) {
        imageBuffer = Buffer.from(await (img as File).arrayBuffer());
      } else if (typeof img === 'string') {
        imageBuffer = Buffer.from(img, 'base64');
      } else {
        throw new Error('Invalid image format');
      }
      imgUrl = await uploadImage(imageBuffer, 'product');
    }

    const result = await this.repo.createProduct({ ...rest, img: imgUrl });

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

    const { img, ...rest } = updates;
    let imgUrl = ''
    if (img) {
      let imageBuffer: Buffer;
      if (typeof img === 'object' && img && 'arrayBuffer' in img) {
        imageBuffer = Buffer.from(await (img as File).arrayBuffer());
      } else if (typeof img === 'string') {
        imageBuffer = Buffer.from(img, 'base64');
      } else {
        throw new Error('Invalid image format');
      }
      imgUrl = await uploadImage(imageBuffer, 'product');
    }

    const result = await this.repo.updateProduct(id, { ...rest, img: imgUrl });
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