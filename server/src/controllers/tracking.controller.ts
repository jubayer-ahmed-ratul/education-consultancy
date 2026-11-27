import type { NextFunction, Request, Response } from 'express';
import type { RequestRecoveryInput, TrackInquiryInput, VerifyRecoveryInput } from '@zero-compile/shared';
import { trackingService } from '../services/tracking.service';
import { sendSuccess } from '../utils/response';

export const trackingController = {
  async track(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as TrackInquiryInput;
      const result = await trackingService.trackApplication(input);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async requestRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as RequestRecoveryInput;
      const result = await trackingService.requestRecovery(email);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verifyRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body as VerifyRecoveryInput;
      const applications = await trackingService.verifyRecovery(email, code);
      sendSuccess(res, applications);
    } catch (err) {
      next(err);
    }
  },
};
