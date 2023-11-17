import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
app.set('view engine', 'ejs');


const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"book",
    password:"Ruchi@12345",
    port:12345,
  })
  
  
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let books=[ ];

app.get("/",async(req,res)=>{
try{
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    books = result.rows;
    console.log(result.rows);

    res.render("index.ejs",{
        // listTitle:"Today",
        bookItems : books,
    });
}catch(err){
    console.log(err);
}
});

app.post("/add",async(req,res)=>{
    const {newTitle,newIsbn, newDescription,newRating} = req.body;
    console.log("Data to be inserted:", newTitle, newIsbn, newDescription,newRating);
    if (!newTitle) {
        return res.status(400).send("Title is required.");
    }
    const parsedRating = parseFloat(newRating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
        return res.status(400).send("Rating must be a number between 0 and 5.");
    }

try{
    await db.query("INSERT INTO books(title,isbn,description,rating) VALUES ($1,$2,$3,$4)",[newTitle,newIsbn,newDescription,newRating]);
    res.redirect("/");
}catch(err){
    console.log(err);
    res.status(500).send("Internal Server Error");
}
});

app.post("/delete", async (req, res) => {
    const isbnToDelete = req.body.isbn;

    try {
        await db.query("DELETE FROM books WHERE isbn = $1", [isbnToDelete]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  