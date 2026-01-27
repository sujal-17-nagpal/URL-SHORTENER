require("dotenv").config()

const mysql = require("mysql2")

const db = mysql.createPool({
    user : process.env.DB_USER,
    host : process.env.DB_HOST,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT
});

db.query("Select 1",(err,result)=>{
    if(err){
        console.log("error connecting to db")
    } else {
        console.log("db connected successfully")
    }
})

module.exports = db