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
  GetOrderRequest
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
}