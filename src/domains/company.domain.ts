import { CompanyRepository } from '../repositories/company.repo';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../types/company.type';
import { wrapperData } from '../utils/wrapper';
import { DataNotFound } from '../utils/errors';
import { WrapperData, PaginationMeta } from '../types/wrapper.type';

export class CompanyDomain {
  private repo: CompanyRepository;

  constructor() {
    this.repo = new CompanyRepository();
  }

  async getAllCompanies(limit: number = 50, offset: number = 0): Promise<{ data: Company[], meta: PaginationMeta }> {
    const result = await this.repo.getAllCompanies(limit, offset);

    const totalPages = Math.ceil(result.total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const meta: PaginationMeta = {
      total: result.total,
      limit,
      totalPages,
      currentPage
    };

    return { data: result.data, meta };
  }

  async getCompanyById(id: string): Promise<WrapperData> {
    const data = await this.repo.getCompanyById(id);
    if (!data) {
      return wrapperData(null, DataNotFound())
    }
    return wrapperData(data, null)
  }

  async createCompany(companyData: CreateCompanyRequest): Promise<Company> {
    this.validateCreateCompany(companyData);
    return await this.repo.createCompany(companyData);
  }

  async updateCompany(id: string, updates: UpdateCompanyRequest): Promise<Company | null> {
    this.validateUpdateCompany(updates);
    return await this.repo.updateCompany(id, updates);
  }

  async deleteCompany(id: string): Promise<boolean> {
    return await this.repo.deleteCompany(id);
  }

  private validateCreateCompany(company: CreateCompanyRequest): void {
    if (!company.name || company.name.trim().length === 0) {
      throw new Error('Company name is required');
    }
  }

  private validateUpdateCompany(updates: UpdateCompanyRequest): void {
    if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
      throw new Error('Company name cannot be empty');
    }
  }
}