import { SalesRepository } from '../repositories/sales.repo';
import { Sale, CreateSaleRequest, UpdateSaleRequest } from '../types/sales.type';
import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta, WrapperMetaData } from '../types/wrapper.type';
import {
  ListSalesSchema,
  SummarySalesSchema,
  YearsSalesSchema,
} from '../validators/sales.validator';

export class SalesDomain {
  private repo: SalesRepository;

  constructor() {
    this.repo = new SalesRepository();
  }

  calcGrowth(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    const calculate = ((current - previous) / previous) * 100;
    return calculate === 100 ? calculate : calculate.toFixed(2);
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

  async getSummarySales(param: SummarySalesSchema) {
    const month = param.month ? Number(param.month) : new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const currentSummary = await this.repo.getMonthlySummary(month, year, param.productId);

    const prevMonth = month === 1 ? 12 : month;
    const prevYear = month === 1 ? year - 1 : year;

    const prevSummary = await this.repo.getMonthlySummary(prevMonth, prevYear, param.productId);

    return {
      revenue: {
        total: Number(currentSummary.totalRevenue),
        growth: this.calcGrowth(
          Number(currentSummary.totalRevenue),
          Number(prevSummary.totalRevenue)
        ),
      },
      transaction: {
        total: Number(currentSummary.totalTransaction),
        growth: this.calcGrowth(
          Number(currentSummary.totalTransaction),
          Number(prevSummary.totalTransaction)
        ),
      },
    };
  }

  async getYearsSales(params: YearsSalesSchema) {
    const year = params.year ? Number(params.year) : new Date().getFullYear();

    const result = await this.repo.getYearlyRevenueChart(year);

    return result;
  }
}
