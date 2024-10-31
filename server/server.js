import express from "express";
import session from 'express-session';
import flash from "connect-flash";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000;
import db from "./db/conn.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from 'url';
import passport from "./api/middleware/passport.js";
import users from "./api/routes/users.js";
import notes from "./api/routes/notes.js";
import cors from 'cors';


const app = express();
// needs this for directory of ejs views to work
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: "*" }));
app.use(express.json());

// Make css available
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/components', express.static(path.join(__dirname, '../components')));


// View Engine
app.set("views", path.join(__dirname, './api/views'));
app.engine(".ejs", ejs.renderFile);
app.set("view engine", "ejs");


// Middleware
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Routes
app.use("/users", users);
app.use("/notes", notes);
app.get("/", (req, res) => {
  res.send("Welcome to Placenotes");
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});