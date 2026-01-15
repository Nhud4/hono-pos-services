import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta } from '../types/wrapper.type';
import { TransactionsRepository } from '../repositories/transactions.repo';
import { UserRepository } from '../repositories/user.repo';
import {
  CreateOrderRequest,
  CreateTransactionRequest,
  OrderProduct,
  Transaction,
  UpdateTransactionRequest,
  GetOrderRequest,
  ListTransactionRequest
} from '../types/transactions.type';

export class TransactionDomain {
  private repo: TransactionsRepository
  private user: UserRepository

  constructor() {
    this.repo = new TransactionsRepository()
    this.user = new UserRepository()
  }

  async getOrder(user: GetOrderRequest): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id)
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'))
    }

    // get basket by user
    const result = await this.repo.getOrderByUser(user.id)

    return wrapperData(result, null)
  }

  async createOrder(user: GetOrderRequest, payload: CreateOrderRequest): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id)
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'))
    }

    const result = await this.repo.createOrder(user, payload)
    return wrapperData(result, null)
  }

  async listTransaction(params: ListTransactionRequest): Promise<{ data: Transaction[], meta: PaginationMeta }> {
    const limit = parseInt(params.size)
    const offset = (parseInt(params.page) - 1) * limit

    const result = await this.repo.getAllTransactions(limit, offset)

    const meta: PaginationMeta = {
      total: result.total,
      limit,
      totalPages: result.total > 0 ? Math.ceil(result.total / limit) : 1,
      currentPage: Math.floor(offset / limit) + 1
    };

    return { data: result.data, meta };
  }

  async detailTransaction(id: string): Promise<WrapperData> {
    const result = await this.repo.getTransactionById(id)
    if (!result) {
      return wrapperData(null, DataNotFound())
    }
    return wrapperData(result, null)
  }

  async createTransaction(user: GetOrderRequest, payload: CreateTransactionRequest): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id)
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'))
    }

    const result = await this.repo.createTransaction(user, payload)
    return wrapperData(result, null)
  }

  async updateTransaction(id: string, payload: UpdateTransactionRequest): Promise<WrapperData> {
    const checkId = await this.repo.getTransactionById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    const result = await this.repo.updateTransaction(id, payload)

    return wrapperData(result, null)
  }

  async deleteTransaction(id: string): Promise<WrapperData> {
    const checkId = await this.repo.getTransactionById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    const result = await this.repo.deleteTransaction(id)

    return wrapperData(result, null)
  }
}