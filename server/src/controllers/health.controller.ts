import type { NextFunction, Request, Response } from 'express';
import { healthService } from '../services/health.service';
import { sendSuccess } from '../utils/response';

export const healthController = {
  async check(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await healthService.checkDatabase();
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
