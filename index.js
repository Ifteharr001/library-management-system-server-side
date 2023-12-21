const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();

const { MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const port = process.env.PORT || 5000;

console.log(process.env.DB_PASS)
//middleware

app.use(cors());
app.use(express.json());





const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kwgfltq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const categoryCollection = client
      .db("libraryManagement")
      .collection("category");
    const bookCollection = client.db("libraryManagement").collection("book");
    const borrowCollection = client
      .db("libraryManagement")
      .collection("borrow");

    app.get("/borrow", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await borrowCollection.find(query).toArray();

      res.send(result);
    });

    app.post("/borrow", async (req, res) => {
      const borrows = req.body;
      console.log(borrows);
      const result = await borrowCollection.insertOne(borrows);
      res.send(result);
    });

    app.delete("/borrow/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await borrowCollection.deleteOne(query);
      res.send(result);
    });

    // category collection
    app.get("/category", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // book collection

    app.post("/books", async (req, res) => {
      const newBook = req.body;
      console.log(newBook);
      newBook.quantity = parseInt(newBook.quantity, 10);
      const result = await bookCollection.insertOne(newBook);
      res.send(result);
    });

    // updated quantity

    // In your server code (e.g., library-management-system-server-steel)
    app.put("/updateQuantity/:id", async (req, res) => {
      const bookId = req.params.id;
      const update = req.body.$inc;

      try {
        const updatedBook = await bookCollection.updateOne(
          { _id: new ObjectId(bookId) },
          { $inc: update }
        );

        if (updatedBook.matchedCount === 0) {
          return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Book quantity updated successfully" });
      } catch (error) {
        console.error("Error updating book quantity:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });

    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBooks = req.body;
       const quantity = parseInt(updatedBooks.quantity, 10);
      const books = {
        $set: {
          name: updatedBooks.name,
          authorName: updatedBooks.authorName,
          image: updatedBooks.image,
          bookCategory: updatedBooks.bookCategory,
          quantity: quantity,
          description: updatedBooks.description,
          rating: updatedBooks.rating,
        },
      };
      const result = await bookCollection.updateOne(filter, books, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('library server is running')
})

app.listen(port, () => {
    console.log(`library server is running on port${port}`)
})