import express from "express";
import cors from "cors";
import BooksData from "./data/books.json";
import { Book } from "./lib/mongodb";
import mongoose from "mongoose";

if (process.env.RESET_DB) {
  const resetDataBase = async () => {
    await Book.deleteMany();
    BooksData.forEach((singlebook) => {
      const newBook = new Book(singlebook);
      newBook.save();
    });
  };
  resetDataBase();
}

const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello !");
});

app.get("/books", async (req, res) => {
  try {
    const { title, authors } = req.query;

    let filter = {};
    if (authors) {
      filter.authors = { $regex: new RegExp(authors, "i") };
    }
    if (title) {
      filter.title = { $regex: new RegExp(title, "i") };
    }

    const books = await Book.find(filter);
    res.status(200).json(books);
  } catch (error) {
    console.warn(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      // return stops the execution of the code
      return res.status(400).json({
        success: false,
        body: {
          message: "invalid id",
        },
      });
    }

    const singleBook = await Book.findById(req.params.id);

    if (singleBook) {
      return res.status(200).json({
        success: true,
        body: singleBook,
      });
    }

    return res.status(404).json({
      sucess: false,
      body: {
        message: "Could not find single book",
      },
    });
  } catch (error) {
    console.warn(error);
    return res.status(500).json({
      success: false,
      body: {
        message: "Internal server error",
      },
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
