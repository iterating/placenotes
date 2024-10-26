import { MongoClient } from "mongodb"
import 'dotenv/config'
const connectionString = process.env.ATLAS_URI

const client = new MongoClient(connectionString)

let conn;
try {
    conn = await client.connect()
    console.log("connected to mongoDB")
} catch (err) {
    console.log(err)
}
let db = await conn.db("placenotes")

export default db