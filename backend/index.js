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



app.post("/shorten",(req,res)=>{
    const {longURL} = req.body;

    if(!longURL){
        return res.status(400).json({message:"no url found"})
    }
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
        const shortCode = encode(allocatedId)
        const update_query = `UPDATE ranges SET current = current+1 WHERE id = ?`

        db.query(update_query,[result.id],(err,response)=>{
            if(err){
                console.log("error in updating")
                return res.json({msg : "error in updating"})
            }

            const insertIntoMap = `INSERT INTO url_maps (code,long_url)
                                    VALUES (?,?)`

            db.query(insertIntoMap,[shortCode,longURL],(error3)=>{
                if(error3){
                    console.log("error into inserting into url_map")
                    return res.status(400).json({message : "occur occured"})
                }
                return res.status(200).json({shortUrl : `http://localhost:8000/${shortCode}`})
            })

            
        })
    })
})

app.get("/:code",(req,res)=>{
    const {code} = req.params;

    const findQuery = `SELECT long_url FROM url_maps WHERE code = ?`;

    db.query(findQuery,[code],(err,result)=>{
        if(err){
            return res.status(400).json({message:"no short url found"})
        }
        if(result.length === 0){
            return res.status(400).json({message:"no short url found"});;
        }
        return res.redirect(result[0].long_url)
    })
})