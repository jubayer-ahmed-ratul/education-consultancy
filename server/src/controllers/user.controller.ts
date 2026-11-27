import type { NextFunction, Request, Response } from 'express';
import type { CreateUserInput, UpdateUserInput, UserRoleType } from '@zero-compile/shared';
import { userService } from '../services/user.service';
import { extractClientIp } from '../utils/ip';
import { sendSuccess } from '../utils/response';

export const userController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.validatedQuery as {
        page: number;
        limit: number;
        role?: UserRoleType;
        isActive?: boolean;
        search?: string;
      };
      const { users, meta } = await userService.list(query);
      sendSuccess(res, users, 200, meta);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateUserInput;
      const ipAddress = extractClientIp(req);
      const user = await userService.create(input, req.user!.id, ipAddress);
      sendSuccess(res, user, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const input = req.body as UpdateUserInput;
      const ipAddress = extractClientIp(req);
      const user = await userService.update(id, input, req.user!.id, ipAddress);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.validatedParams as { id: string };
      const ipAddress = extractClientIp(req);
      const result = await userService.removeOrDeactivate(id, req.user!.id, ipAddress);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
