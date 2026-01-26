import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { company } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../types/company.type';

// Helper function to convert Drizzle result to our Company type
function convertToCompany(drizzleCompany: any): Company {
  return {
    id: drizzleCompany.id.toString(),
    name: drizzleCompany.name,
    address: drizzleCompany.address,
    phone: drizzleCompany.phone,
    img: drizzleCompany.img,
  };
}

export class CompanyRepository {
  async getAllCompanies(
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    data: Company[];
    total: number;
  }> {
    const db = createDb(localConfig.dbUrl);

    const [dataResult, totalResult] = await Promise.all([
      db.select().from(company).orderBy(company.createdAt).limit(limit).offset(offset),
      db.$count(company),
    ]);

    return {
      data: dataResult.map(convertToCompany),
      total: totalResult,
    };
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(company)
      .where(eq(company.id, parseInt(id)));
    return result[0] ? convertToCompany(result[0]) : null;
  }

  async createCompany(companyData: CreateCompanyRequest): Promise<Company> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .insert(company)
      .values({
        name: companyData.name,
        address: companyData.address,
        phone: companyData.phone,
        img: companyData.img,
      })
      .returning();
    return convertToCompany(result[0]);
  }

  async updateCompany(id: string, updates: UpdateCompanyRequest): Promise<Company | null> {
    const db = createDb(localConfig.dbUrl);
    const updateData: any = { updatedAt: new Date() };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.img !== undefined) updateData.img = updates.img;

    const result = await db
      .update(company)
      .set(updateData)
      .where(eq(company.id, parseInt(id)))
      .returning();

    return result[0] ? convertToCompany(result[0]) : null;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const db = createDb(localConfig.dbUrl);

    const result = await db.delete(company).where(eq(company.id, parseInt(id)));
    return true;
  }
}
