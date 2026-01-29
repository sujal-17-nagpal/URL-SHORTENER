const db = require("./connection/db_connect");

const { encode } = require("./lib/base62");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.listen(8000, () => {
  console.log("listening on port 8000");
});

app.get("/", (req, res) => {
  res.send("backend running fine");
});

app.post("/shorten", async (req, res) => {
  try {
    const { longURL } = req.body;

    if (!longURL) {
      return res.status(404).json({ message: "url not found" });
    }

    const alreadyExist = `SELECT code FROM url_maps WHERE long_url = ?`;

    const [result] = await db.query(alreadyExist, [longURL]);

    if(result.length > 0){
        return res.json({
      shortUrl: `http://localhost:8000/${result[0].code}`,
      reused: true,
    });
    }

    

    const sql_query = `
        SELECT * FROM ranges
        WHERE current < end
        ORDER BY rand()
        limit 1
    `;

    const [ranges] = await db.query(sql_query);
    if (ranges.length === 0) {
      return res.status(404).json({ message: "no available shortCode" });
    }

    const allocatedId = ranges[0].current;
    const shortCode = encode(allocatedId);
    const update_query = `UPDATE ranges SET current = current+1 WHERE id = ?`;

    await db.query(update_query, [ranges[0].id]);

    await db.query("INSERT INTO url_maps (code,long_url) VALUES (?,?)", [
      shortCode,
      longURL,
    ]);

    return res.json({
      shortUrl: `http://localhost:8000/${shortCode}`,
      reused: false,
    });
  } catch (err) {
    console.log(err.message);
    return res.json({ message: err.message });
  }
});

app.get("/:code", async (req, res) => {
  try {
    const {code} = req.params;

    const [rows] = await db.query(
      "SELECT long_url FROM url_maps WHERE code = ?",
      [code],
    );

    if (rows.length === 0) {
      return res.status(404).send("short url not found");
    }

    return res.redirect(rows[0].long_url);
  } catch (err) {
    return res.status(500).send("server error");
  }
});
