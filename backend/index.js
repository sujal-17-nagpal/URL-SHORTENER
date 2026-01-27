const db = require("./connection/db_connect")

const {encode} = require("./lib/base62")

const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

app.listen(8000,()=>{
    console.log("listening on port 8000")
})

app.get("/",(req,res)=>{
    res.send("backend running fine")
})

app.post("/allocate",(req,res)=>{
    const sql_query = `
        SELECT * FROM ranges
        WHERE current < end
        ORDER BY rand()
        limit 1
    `;

    db.query(sql_query,(err,results)=>{
        if(err){
            console.log("error in select command")
            return res.json({message : err.message})
        }
        if(results.length === 0) {
            console.log("no availabe url")
            return res.json({message:"no available url"})
        }
        const result = results[0];
        const allocatedId = result.current;
        
        const update_query = `UPDATE ranges SET current = current+1 WHERE id = ?`

        db.query(update_query,[result.id],(err,response)=>{
            if(err){
                console.log("error in updating")
                return res.json({msg : "error in updating"})
            }
            const encodedString = encode(allocatedId)
            return res.json({allocatedId,encodedString})
        })
    })
})