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


module.exports.rentBook = (req, res) => {
    const { bookId } = req.body;
    let userId = req.user?.id; // Temporary using let for testing only

    // if (!userId) {
    //     return res.status(400).json({ message: "Need to be a member to rent a book" });
    // }

    // Temporary setting just for postman testing only. The above commented line will be used for actual use
    if (!userId) {
        userId = 1;
    }

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
    let userId = req.user?.id; // Temporary using let for testing only

    // if (!userId) {
    //     return res.status(400).json({ message: "Need to be a member to rent a book" });
    // }

    // Temporary setting just for postman testing only. The above commented line will be used for actual use
    if (!userId) {
        userId = 1;
    }

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

// module.exports.singleBookDetails=(req,res,next)=>{
//     const data={
//         book_id: localStorage.getItem('book_id')
//     }
//     model.singleBookDetails(data)
// }