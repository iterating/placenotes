import express from "express";
// Required for passport
import passport from "./middleware/passport.js";
import session from 'express-session';
import flash from "connect-flash";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000;
import db from "./db/conn.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from 'url';
import users from "./routes/users.js";
import notes from "./routes/notes.js";
import cors from 'cors';


const app = express();
// needs this for directory of ejs views to work
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: "*" }));
app.use(express.json());

// Make css available
app.use('/assets', express.static(path.join(__dirname, './views/assets')));
// Make components available


// View Engine
app.set("views", path.join(__dirname, './views'));
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
  res.send('Welcome to Placenotes. <a href="/users/login">Go to Login</a>');
});



app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

// take export default app into ./loaders
