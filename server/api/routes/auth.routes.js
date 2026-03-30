import express from "express";
import * as authController from "../../controllers/auth.controllers.js";
import { loginLimiter, signupLimiter, refreshLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post('/refresh', refreshLimiter, authController.refreshToken);

router.post('/login', loginLimiter, authController.login);
router.post('/signup', signupLimiter, authController.signup);
router.get('/logout', authController.logout);

export default router;
