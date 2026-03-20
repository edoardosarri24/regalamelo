import { Router } from 'express';
import { register, login, logout, refresh, verifyEmail } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { RegisterUserSchema, LoginUserSchema, VerifyEmailSchema } from '@gift-list/shared';

const router = Router();

router.post('/register', validateBody(RegisterUserSchema), register);
router.post('/verify-email', validateBody(VerifyEmailSchema), verifyEmail);
router.post('/login', validateBody(LoginUserSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);

// TODO: forgot-password, reset-password

export default router;
