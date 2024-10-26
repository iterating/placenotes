import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const PORT = process.env.PORT || 3000
import db from "./db/conn.js"

const app = express();
const router = express.Router()
app.use(express.json())

app.get("/", (req, res)=>{
    res.send('Welcome to Placenotes')
})

// app.get("/users", async (req, res)=>{
//     let users = await db.collection("placenotes")
//   res.json(users)
// })

// Global error handling
app.use((err, _req, res, next) => {
    res.status(500).send("Error")
})

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})