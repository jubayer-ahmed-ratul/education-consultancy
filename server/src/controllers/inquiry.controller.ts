import type { NextFunction, Request, Response } from 'express';
import type {
  AddInquiryNoteInput,
  AssignInquiryInput,
  InquiryListQuery,
  PublicSubmitInquiryInput,
  UpdateInquiryStatusInput,
} from '@zero-compile/shared';
import { inquiryService } from '../services/inquiry.service';
import { extractClientIp } from '../utils/ip';
import { sendSuccess } from '../utils/response';

export const inquiryController = {
  async submitPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as PublicSubmitInquiryInput;
      const ipAddress = extractClientIp(req);
      const result = await inquiryService.submitPublic(input, ipAddress);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as InquiryListQuery;
      const { inquiries, meta } = await inquiryService.list(query);
      sendSuccess(res, inquiries, 200, meta);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const inquiry = await inquiryService.getById(id);
      sendSuccess(res, inquiry);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const { status } = req.body as UpdateInquiryStatusInput;
      const ipAddress = extractClientIp(req);
      const result = await inquiryService.updateStatus(
        id,
        status,
        { id: req.user!.id, role: req.user!.role },
        ipAddress
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const input = req.body as AddInquiryNoteInput;
      const ipAddress = extractClientIp(req);
      const note = await inquiryService.addNote(id, input, req.user!.id, ipAddress);
      sendSuccess(res, note, 201);
    } catch (err) {
      next(err);
    }
  },

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const { assignedTo } = req.body as AssignInquiryInput;
      const ipAddress = extractClientIp(req);
      const result = await inquiryService.assignCounselor(id, assignedTo, req.user!.id, ipAddress);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async addDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const doc = req.body as { fileName: string; fileType: string; storageKey: string };
      const ipAddress = extractClientIp(req);
      const created = await inquiryService.addDocument(id, doc, req.user!.id, ipAddress);
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  },

  async removeDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, docId } = req.validatedParams as { id: string; docId: string };
      const ipAddress = extractClientIp(req);
      const result = await inquiryService.removeDocument(id, docId, req.user!.id, ipAddress);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
