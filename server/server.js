import express from "express";
import expressSession from 'express-session';
import flash from "connect-flash";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000;
import db from "./db/conn.js";
import loginRouter from "./api/routes/login.js";
import users from "./api/routes/users.js";
import notes from "./api/routes/notes.js";
import passport from "./api/middleware/passport.js";
import cors from 'cors';

const app = express();
app.use(flash());

app.use(express.json());
app.use(cors({ origin: "*" }));

// View engine

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

//Routes
app.use("/users", users);
app.use("/notes", notes);
app.use("", loginRouter);
app.get("/", (req, res) => {
  console.log('Welcome to Placenotes');
  res.send("Welcome to Placenotes");
});



app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

