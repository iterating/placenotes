import express from "express";
import expressSession from 'express-session';
import flash from "connect-flash";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000;
import db from "./db/conn.js";
import ejs from "ejs";
import users from "./api/routes/users.js";
import notes from "./api/routes/notes.js";
import passport from "./api/middleware/passport.js";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url';



const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// View Engine
app.engine(".ejs", ejs.renderFile);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, './api/views'));

// Middleware
app.use(expressSession({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(flash());
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

//Routes
app.use("/users", users);
app.use("/notes", notes);
app.get("/", (req, res) => {
  console.log('Welcome to Placenotes');
  res.send("Welcome to Placenotes");
});



app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

