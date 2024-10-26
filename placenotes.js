import express from "express";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000;
import db from "./db/conn.js";
import users from "./routes/users.js";
const app = express();

app.use(express());
app.use("/users", users);

app.get("/", (req, res) => {
  res.send("Welcome to Placenotes");
});

app.get("/user", async (req, res) => {
  try {
    let users = await db.collection("placenotes").find().toArray();
    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error getting users");
  }
});

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Error");
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
