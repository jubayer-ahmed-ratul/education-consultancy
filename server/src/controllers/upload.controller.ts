import type { NextFunction, Request, Response } from 'express';
import type { UploadSignatureInput } from '@zero-compile/shared';
import { cloudinaryService } from '../services/cloudinary.service';
import { sendSuccess } from '../utils/response';

export const uploadController = {
  createSignature(req: Request, res: Response, next: NextFunction): void {
    try {
      const { purpose, mimeType } = req.body as UploadSignatureInput;
      const params = cloudinaryService.generateUploadSignature(purpose, mimeType);
      sendSuccess(res, params);
    } catch (err) {
      next(err);
    }
  },
};
