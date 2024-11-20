const model = require("../models/bookModel.js");
module.exports.retrieveAllBooks = (req, res, next) => {
    model.retrieveAll()
        .then(books => {
            if (books.length == 0) {
                return res.status(404).json({ message: "No book found" })
            }
            return res.status(200).json({ books: books });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.searchBookByName = (req, res, next) => {
    if (!req.params.bookName) {
        return res.status(400).json({ message: "Book name to search is missing" });
    }
    const data = {
        bookName: req.params.bookName
    }
    model.searchByName(data)
        .then(books => {
            if (books.length == 0) {
                return res.status(404).json({ message: "No book found" })
            }
            return res.status(200).json({ books: books });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.searchBookByAuthor = (req, res, next) => {
    if (!req.params.authorName) {
        return res.status(400).json({ message: "Author name to search is missing" });
    }
    const data = {
        authorName: req.params.authorName
    }
    model.searchByAuthor(data)
        .then(books => {
            if (books.length == 0) {
                return res.status(404).json({ message: "No book found" })
            }
            return res.status(200).json({ books: books });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}


module.exports.searchBookByCategory = (req, res, next) => {
    if (!req.params.categoryName) {
        return res.status(400).json({ message: "Necessary data is missing" });
    }
    const data = {
        categoryName: req.params.categoryName
    }
    model.searchByCategory(data)
    .then(books => {
            if (books.length == 0) {
                return res.status(404).json({ message: "No book found" })
            }
            return res.status(200).json({ books: books });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.checkIfBookExists = (req, res, next) => {
    const { book_name, author } = req.body;

    if (!book_name || !author) {
        console.log("No book and author name")
        return res.status(400).json({ message: "Please provide both book name and author" });
    }

    model.checkBookExists(book_name, author)
        .then(existingBook => {
            if (existingBook) {
                console.log("Book already exists");
                return res.status(409).json({ message: "Book with the same name and author already exists" });
            }
            next();
        })
        .catch(error => {
            console.error("Error checking book existence:", error);
            return res.status(500).json({ error: "Server error" });
        });
};

module.exports.addBook = (req, res, next) => {
    const { book_name, author, description, copies, category_id } = req.body;

    if (!book_name || !author || !description || !copies || !category_id) {
        console.log("Missing required data for adding a new book");
        return res.status(400).json({ message: "Please provide all required input data for the new book" });
    }
    if (!Number.isInteger(copies)) {
        return res.status(400).json({ message: "Copies must be a valid integer" });
    }
    if (!Array.isArray(category_id) || category_id.length === 0) {
        return res.status(400).json({ message: "category_id must be a non-empty array of integers" });
    }

    for (const id of category_id) {
        if (!Number.isInteger(id) || id < 1 || id > 10) {
            return res.status(400).json({ message: `Invalid category_id value: ${id}. Must be an integer between 1 and 10 inclusive.` });
        }
    }

    const data = {
        book_name,
        author,
        description,
        copies
    };

    model.insertSingle(data)
        .then(book => {
            res.locals.book = book; 
            res.locals.category_id = category_id; 
            next(); 
        })
        .catch(error => {
            console.error("Error adding book:", error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.updateBook=(req,res,next)=>{
    if (!req.params.bookId || !req.body.book_name || !req.body.author || !req.body.description || !req.body.copies ) {
        console.log("Missing required data for updating book");
        return res.status(400).json({ message: "Please provide input data for new book" });
    }
    
    const data={
        id: req.params.bookId,
        book_name: req.body.book_name,
        author: req.body.author,
        description: req.body.description,
        copies: req.body.copies
    }
    
    model.updateSingle(data)
    .then(book=>{
        res.status(200).json({book: book});
    })
    .catch(error => {
        if (error.message === 'Book not found') {
            console.log("Book not found for ID:", data.id);
            return res.status(404).json({ message: "Book not found" });
        }
        console.error("Error updating book:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    });
}

module.exports.deleteBook = (req, res, next) => {
    const id = req.params.bookId;

    if (!id) {
        console.log("Missing book ID for deletion");
        return res.status(400).json({ message: "Book ID is required" });
    }

    model.deleteSingle(id)
        .then(() => {
            console.log(`Successfully deleted book`);
            res.status(200).json({ message: "Book successfully deleted" });
        })
        .catch(error => {
            if (error.message === 'Book not found') {
                console.log(`Book not found for ID: ${id}`);
                return res.status(404).json({ message: "Book not found" });
            }
            console.error("Error deleting book:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};

module.exports.retrieveSingleBook = (req, res, next) => {
    const id = req.params.bookId;

    if (!id) {
        console.log("Missing book ID for retrieval");
        return res.status(400).json({ message: "Book ID is required" });
    }

    model.retrieveSingle(id)
        .then(book => {
            res.status(200).json({ book: book });
        })
        .catch(error => {
            if (error.message === 'Book not found') {
                console.log(`Book not found for ID: ${id}`);
                return res.status(404).json({ message: "Book not found" });
            }
            console.error("Error retrieving book:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};

module.exports.rentBook = (req, res) => {
    const { bookId } = req.body;
    let userId = res.locals.user_id

    if (!bookId) {
        return res.status(400).json({ message: "Book ID is required" });
    }

    model.rentBook({ bookId, userId })
        .then((result) => {
            return res.status(200).json(result);
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.returnBook = (req, res) => {
    const { bookId } = req.body;
    let userId = res.locals.user_id
   

    if (!bookId) {
        return res.status(400).json({ message: "Book ID is required" });
    }
    // Call the returnBook function from the model
    model.returnBook({ bookId, userId })
        .then((result) => {
            return res.status(200).json(result);
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};
module.exports.attachCategories = (req, res) => {
    const { id: book_id } = res.locals.book; // Get book_id from the newly added book
    const { category_id } = res.locals; // Get validated category_id array

    model.attachCategoriesToBook(book_id, category_id)
        .then(() => {
            res.status(200).json({ message: "Book and categories successfully added" });
        })
        .catch(error => {
            console.error("Error attaching categories:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};
module.exports.updateBookCategories = (req, res) => {
    const { bookId } = req.params;
    const { category_id } = req.body;

    if (!bookId) {
        return res.status(400).json({ message: "Invalid or missing book ID" });
    }

    if (!Array.isArray(category_id) || category_id.length === 0) {
        return res.status(400).json({ message: "category_id must be a non-empty array of integers" });
    }

    for (const id of category_id) {
        if (!Number.isInteger(id) || id < 1 || id > 10) {
            return res.status(400).json({ message: `Invalid category_id value: ${id}. Must be an integer between 1 and 10 inclusive.` });
        }
    }

    model.updateCategories(parseInt(bookId, 10), category_id)
        .then(() => {
            res.status(200).json({ message: "Book categories successfully updated" });
        })
        .catch(error => {
            if (error.message === 'Book not found') {
                return res.status(404).json({ message: "Book not found" });
            }
            console.error("Error updating book categories:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};

