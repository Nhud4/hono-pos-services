import { SalesRepository } from '../repositories/sales.repo';
import { Sale, CreateSaleRequest, UpdateSaleRequest } from '../types/sales.type';
import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta, WrapperMetaData } from '../types/wrapper.type';
import { ListSalesSchema } from '../validators/sales.validator';

export class SalesDomain {
  private repo: SalesRepository;

  constructor() {
    this.repo = new SalesRepository();
  }

  async listProductSales(params: ListSalesSchema): Promise<WrapperMetaData> {
    const limit = parseInt(params.size);
    const offset = limit > 0 ? (parseInt(params.page) - 1) * limit : 0;

    const { data, total } = await this.repo.getAllSales(
      limit,
      offset,
      params.productId,
      params.month
    );

    const meta: PaginationMeta = {
      page: Number(params.page),
      totalData: total,
      totalPage: total > 0 ? Math.ceil(total / limit) : 1,
      totalPerPage: limit,
    };

    return { data, meta };
  }
}
