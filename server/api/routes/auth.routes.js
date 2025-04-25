import express from "express";
import * as authController from "../../controllers/auth.controllers.js";

const router = express.Router();

// Create a dedicated endpoint for token refresh
router.post('/refresh', authController.refreshToken);

// Add other auth-related routes if needed
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

export default router;
