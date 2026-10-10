import { Router } from 'express';
import { validate } from '#src/middlewares/validate.js';
import { userController } from './user.controller.js';
import { listUsersSchema, createUserSchema, getUserByIdSchema, deleteUserSchema, updateUserSchema } from './user.schema.js';

const router = Router();

router.get('/v1/users/', validate(listUsersSchema), userController.getAllUsers);
router.get('/v1/users/:id', validate(getUserByIdSchema), userController.getUserById);
router.post('/v1/users/', validate(createUserSchema), userController.createUser);
router.delete('/v1/users/:id', validate(deleteUserSchema), userController.deleteUser);
router.patch('/v1/users/:id', validate(updateUserSchema), userController.updateUser);

export default router;
