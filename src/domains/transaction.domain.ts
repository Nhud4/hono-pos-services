import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta } from '../types/wrapper.type';
import { TransactionsRepository } from '../repositories/transactions.repo';
import {
  CreateTransactionRequest,
  Transaction,
  UpdateTransactionRequest
} from '../types/transactions.type';

export class TransactionDomain {
  private repo: TransactionsRepository

  constructor() {
    this.repo = new TransactionsRepository()
  }
}