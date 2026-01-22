import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { getDiscountPrice } from '../utils/codeGenerator';
import { WrapperData, PaginationMeta, WrapperMetaData } from '../types/wrapper.type';
import { TransactionsRepository } from '../repositories/transactions.repo';
import { UserRepository } from '../repositories/user.repo';
import {
  CreateOrderRequest,
  CreateTransactionRequest,
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

    let data = null
    if (result) {
      const { transaction, product } = result
      data = {
        id: transaction.id,
        code: transaction.code,
        transactionDate: transaction.transactionDate,
        createdBy: transaction.createdBy,
        transactionType: transaction.transactionType,
        deliveryType: transaction.deliveryType,
        paymentType: transaction.paymentType,
        subtotal: transaction.subtotal,
        totalDiscount: transaction.totalDiscount,
        ppn: transaction.ppn,
        bill: transaction.bill,
        items: product.map((val) => ({
          productId: val.productId,
          qty: val.qty,
          discount: val.discount,
          subtotal: val.subtotal,
          notes: val.notes
        })) || []
      }
    }

    return wrapperData(data, null)
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

  async listTransaction(params: ListTransactionRequest): Promise<WrapperMetaData> {
    const limit = parseInt(params.size)
    const offset = (parseInt(params.page) - 1) * limit

    const result = await this.repo.getAllTransactions(
      limit,
      offset,
      params.search,
      params.date,
      params.paymentStatus
    )

    const meta: PaginationMeta = {
      total: result.total,
      limit,
      totalPages: result.total > 0 ? Math.ceil(result.total / limit) : 1,
      currentPage: Math.floor(offset / limit) + 1
    };

    const data = result.data.map((val) => ({
      id: val.id,
      code: val.code,
      transactionDate: val.transactionDate,
      customerName: val.customerName,
      paymentMethod: val.paymentMethod,
      bill: val.bill,
      tableNumber: val.tableNumber,
      createdAt: val.createdAt,
      paymentStatus: val.paymentStatus
    }))

    return { data, meta };
  }

  async detailTransaction(id: string): Promise<WrapperData> {
    const result = await this.repo.getTransactionById(id)
    if (!result) {
      return wrapperData(null, DataNotFound())
    }

    const { transaction, userData, product } = result
    const data = {
      id: transaction.id,
      code: transaction.code,
      transactionDate: transaction.transactionDate,
      createdBy: transaction.createdBy,
      transactionType: transaction.transactionType,
      customerName: transaction.customerName,
      deliveryType: transaction.deliveryType,
      tableNumber: transaction.tableNumber,
      paymentType: transaction.paymentType,
      paymentMethod: transaction.paymentMethod,
      paymentStatus: transaction.paymentStatus,
      subtotal: transaction.subtotal,
      totalDiscount: transaction.totalDiscount,
      ppn: transaction.ppn,
      bill: transaction.bill,
      payment: transaction.payment,
      createdAt: transaction.createdAt,
      user: {
        code: userData?.code,
        name: userData?.name
      },
      items: product.map((val) => ({
        id: val.products.id,
        name: val.products.name,
        price: val.products.normalPrice,
        discount: getDiscountPrice(
          val.products.discountType,
          val.products.normalPrice || 0,
          val.products.discount || 0
        ),
        note: val.transaction_products.notes,
        qty: val.transaction_products.qty,
        subtotal: val.transaction_products.subtotal
      }))
    }

    return wrapperData(data, null)
  }

  async createTransaction(user: GetOrderRequest, payload: CreateTransactionRequest): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id)
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'))
    }

    const result = await this.repo.createTransaction(user, payload)
    return wrapperData({ code: result.code }, null)
  }

  async updateTransaction(id: string, payload: UpdateTransactionRequest): Promise<WrapperData> {
    const checkId = await this.repo.getTransactionById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    const result = await this.repo.updateTransaction(id, payload)

    return wrapperData({ code: result.code }, null)
  }

  async deleteTransaction(id: string): Promise<WrapperData> {
    const checkId = await this.repo.getTransactionById(id)
    if (!checkId) {
      return wrapperData(null, DataNotFound())
    }

    const result = await this.repo.deleteTransaction(id)

    return wrapperData({ code: result.code }, null)
  }
}