import { Router } from "express";
import { login, logout, signup, renderSignUp, renderLogin } from "../controllers/users.controllers.js";
import passport from "../middleware/passport.js";

const router = Router();

router.get("/signup", renderSignUp);

router.post("/signup", signup);

router.get("/login", renderLogin);

router.post("/login", login);

router.get("/logout", logout);

export default router;
