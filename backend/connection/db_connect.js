require("dotenv").config()

const mysql = require("mysql2/promise")

const db = mysql.createPool({
    user : process.env.DB_USER,
    host : process.env.DB_HOST,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT
});

const connect = async ()=>{
    try{
        await db.query("SELECT 1")
        console.log("db connected successfully")
    } catch(err){
        console.log(err)
    }
}

connect()

module.exports = db