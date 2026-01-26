import { wrapperData } from '../utils/wrapper';
import { DataNotFound, BadRequest } from '../utils/errors';
import { WrapperData, PaginationMeta, WrapperMetaData } from '../types/wrapper.type';
import { TransactionsRepository } from '../repositories/transactions.repo';
import { UserRepository } from '../repositories/user.repo';
import { ProductRepository } from '../repositories/product.repo';
import {
  CreateOrderRequest,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  GetOrderRequest,
  ListTransactionRequest,
} from '../types/transactions.type';

export class TransactionDomain {
  private repo: TransactionsRepository;
  private user: UserRepository;
  private product: ProductRepository;

  constructor() {
    this.repo = new TransactionsRepository();
    this.user = new UserRepository();
    this.product = new ProductRepository();
  }

  async getOrder(user: GetOrderRequest): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id);
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'));
    }

    // get basket by user
    const result = await this.repo.getOrderByUser(user.id);

    let data = null;
    if (result) {
      const { transaction, product } = result;
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
        items:
          product.map((val) => ({
            productId: val.productId,
            qty: val.qty,
            discount: val.discount,
            subtotal: val.subtotal,
            notes: val.notes,
          })) || [],
      };
    }

    return wrapperData(data, null);
  }

  async createOrder(user: GetOrderRequest, payload: CreateOrderRequest): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id);
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'));
    }

    const result = await this.repo.createOrder(user, payload);
    return wrapperData(result, null);
  }

  async listTransaction(params: ListTransactionRequest): Promise<WrapperMetaData> {
    const limit = parseInt(params.size);
    const offset = limit > 0 ? (parseInt(params.page) - 1) * limit : 0;

    const { data, total } = await this.repo.getAllTransactions(
      limit,
      offset,
      params.search,
      params.date,
      params.paymentStatus
    );

    const meta: PaginationMeta = {
      page: Number(params.page),
      totalData: total,
      totalPage: total > 0 ? Math.ceil(total / limit) : 1,
      totalPerPage: limit,
    };

    const result = data.map(({ transactions, users }) => ({
      id: transactions?.id,
      code: transactions?.code,
      transactionDate: transactions?.transactionDate,
      customerName: transactions?.customerName,
      paymentMethod: transactions?.paymentMethod,
      bill: transactions?.bill,
      tableNumber: transactions?.tableNumber,
      createdAt: transactions?.createdAt,
      paymentStatus: transactions?.paymentStatus,
      user: {
        name: users?.name,
        role: users?.role,
      },
    }));

    return { data: result, meta };
  }

  async detailTransaction(id: string): Promise<WrapperData> {
    const result = await this.repo.getTransactionById(id);
    if (!result) {
      return wrapperData(null, DataNotFound());
    }

    const { transaction, userData, product } = result;
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
        name: userData?.name,
      },
      items: product.map(({ products: prd, transaction_products: trp }) => ({
        id: prd.id,
        name: prd.name,
        price: prd.normalPrice,
        discountPrice: prd.discountPrice,
        discount: prd.discount,
        note: trp.notes,
        qty: trp.qty,
        subtotal: trp.subtotal,
      })),
    };

    return wrapperData(data, null);
  }

  async createTransaction(
    user: GetOrderRequest,
    payload: CreateTransactionRequest
  ): Promise<WrapperData> {
    // check user
    const checkUser = await this.user.getUserById(user.id);
    if (!checkUser) {
      return wrapperData(null, DataNotFound('User not found'));
    }

    // validate product stock
    for (const item of payload.items) {
      const product = await this.product.getProductById(item.productId.toString());
      if (!product) {
        return wrapperData(null, DataNotFound(`Product with id ${item.productId} not found`));
      }
      const availableStock = product.products.stock ?? 0;
      if (item.qty > availableStock) {
        return wrapperData(
          null,
          BadRequest(
            `Insufficient stock for product ${product.products.name}. Available: ${availableStock}, Requested: ${item.qty}`
          )
        );
      }
    }

    const result = await this.repo.createTransaction(user, payload);
    return wrapperData({ code: result.code }, null);
  }

  async updateTransaction(id: string, payload: UpdateTransactionRequest): Promise<WrapperData> {
    const checkId = await this.repo.getTransactionById(id);
    if (!checkId) {
      return wrapperData(null, DataNotFound());
    }

    const result = await this.repo.updateTransaction(id, payload);

    return wrapperData({ code: result.code }, null);
  }

  async deleteTransaction(id: string): Promise<WrapperData> {
    const checkId = await this.repo.getTransactionById(id);
    if (!checkId) {
      return wrapperData(null, DataNotFound());
    }

    const result = await this.repo.deleteTransaction(id);

    return wrapperData({ code: result.code }, null);
  }
}
