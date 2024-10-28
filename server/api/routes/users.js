import express from "express"
import { allUsers, login, logout, signup, signupForm, loginForm } from "../controllers/users.controllers.js";
import User from "../models/users.js";

const router = express.Router();

//!! Remove for production //!!
router.get("/all", allUsers);

router.get("/signup", signupForm);
router.post("/signup", signup);

router.get("/login", loginForm);
router.post("/login", login);
//q4 reach 
// router.post("/login", accountSettings);

router.get("/logout", logout);

export default router;


