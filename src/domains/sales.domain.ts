import { SalesRepository } from '../repositories/sales.repo';
import { Sale, CreateSaleRequest, UpdateSaleRequest } from '../types/sales.type';
import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta } from '../types/wrapper.type';

export class SalesDomain {
  private repo: SalesRepository;

  constructor() {
    this.repo = new SalesRepository();
  }

  async getAllSales(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Sale[]; meta: PaginationMeta }> {
    const result = await this.repo.getAllSales(limit, offset);
    const meta: PaginationMeta = {
      page: Math.floor(offset / limit) + 1,
      totalData: result.total,
      totalPage: result.total > 0 ? Math.ceil(result.total / limit) : 1,
      totalPerPage: limit,
    };
    return { data: result.data, meta };
  }

  async getSaleById(id: string): Promise<WrapperData> {
    const data = await this.repo.getSaleById(id);
    if (!data) {
      return wrapperData(null, DataNotFound());
    }
    return wrapperData(data, null);
  }

  async createSale(saleData: CreateSaleRequest): Promise<Sale> {
    this.validateCreateSale(saleData);
    return this.repo.createSale(saleData);
  }

  async updateSale(id: string, updates: UpdateSaleRequest): Promise<Sale | null> {
    this.validateUpdateSale(updates);
    return this.repo.updateSale(id, updates);
  }

  async deleteSale(id: string): Promise<boolean> {
    return this.repo.deleteSale(id);
  }

  private validateCreateSale(sale: CreateSaleRequest): void {
    if (sale.productId <= 0) {
      throw new Error('Product ID must be positive');
    }
    if (sale.sales < 0) {
      throw new Error('Sales must be non-negative');
    }
  }

  private validateUpdateSale(updates: UpdateSaleRequest): void {
    if (updates.productId !== undefined && updates.productId <= 0) {
      throw new Error('Product ID must be positive');
    }
    if (updates.sales !== undefined && updates.sales < 0) {
      throw new Error('Sales must be non-negative');
    }
  }
}
