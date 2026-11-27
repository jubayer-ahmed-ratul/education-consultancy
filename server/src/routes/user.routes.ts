import { Router } from 'express';
import { z } from 'zod';
import { createUserSchema, updateUserSchema, userListQuerySchema, uuidSchema } from '@zero-compile/shared';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';

const router = Router();
const idParamSchema = z.object({ id: uuidSchema });

router.use(requireAuth, requirePermission('users:manage'));

router.get('/', validateQuery(userListQuerySchema), userController.list);
router.post('/', validateBody(createUserSchema), userController.create);
router.put('/:id', validateParams(idParamSchema), validateBody(updateUserSchema), userController.update);
router.delete('/:id', validateParams(idParamSchema), userController.remove);

export { router as userRoutes };
