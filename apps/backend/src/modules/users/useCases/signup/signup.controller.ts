import { BaseController } from '@/src/shared/infra/http/BaseController';
import { ValidationError } from '@erp/shared/src/domain/errors/ValidationError';
import type express from 'express';
import z from 'zod';

import { SignupErrors } from './signup.errors';
import { type SignupUseCase } from './signup.use-case';

export class SignupController extends BaseController {
  constructor(private readonly useCase: SignupUseCase) {
    super();
  }

  protected async executeImpl(req: express.Request, res: express.Response): Promise<unknown> {
    const dto = req.parseBody(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    );

    const result = await this.useCase.execute(dto);

    if (result.isErr()) {
      const error = result.error;

      switch (true) {
        case error instanceof SignupErrors.EmailAlreadyExists:
          return this.conflict(
            res,
            req.t('errors.users.signup.email-already-exists', { email: error.email }),
          );
        case error instanceof ValidationError:
          return this.fail(res, error.message);
        default:
          return this.fail(res, 'An unexpected error occurred.');
      }
    }

    return this.ok(res, null);
  }
}
