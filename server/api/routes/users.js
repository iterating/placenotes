import express from "express"
import { allUsers, login, logout, signup, renderSignUp, renderLogin } from "../controllers/users.controllers.js";
import User from "../models/users.js";

const router = express.Router();

router.get("/all", allUsers);

router.get("/signup", renderSignUp);

router.post("/signup", signup);

router.post("/login", login);

router.get("/login", renderLogin);


router.get("/logout", logout);

export default router;


