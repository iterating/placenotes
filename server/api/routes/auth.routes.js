import express from "express";
import * as authController from "../../controllers/auth.controllers.js";

const router = express.Router();

router.post('/refresh', authController.refreshToken);

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

export default router;
