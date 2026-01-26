import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/company.handler';
import * as schema from '../validators/company.validator';

const router = new Hono();

router.get('/companies', basicAuth(), handler.getAllCompaniesHandler);
router.get(
  '/companies/:id',
  basicAuth(),
  validate('param', schema.companyIdSchema),
  handler.getCompanyByIdHandler
);
router.post(
  '/companies',
  basicAuth(),
  validate('body', schema.createCompanySchema),
  handler.createCompanyHandler
);
router.put(
  '/companies/:id',
  basicAuth(),
  validate('body', schema.updateCompanySchema),
  handler.updateCompanyHandler
);
router.delete(
  '/companies/:id',
  basicAuth(),
  validate('param', schema.companyIdSchema),
  handler.deleteCompanyHandler
);

export default router;
