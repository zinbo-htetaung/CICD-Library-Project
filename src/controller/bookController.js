const { database } = require("pg/lib/defaults.js");
const model = require("../models/bookModel.js");


module.exports.retrieveAllBooks = (req, res, next) => {
    model.retrieveAll()
        .then(books => {
            res.json({ books: books });
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
            res.json({ books: books });
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
            res.json({ books: books });
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
            res.json({ books: books });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.rentBook = (req, res) => {
    const { bookId } = req.body;
    let userId = req.user?.id; // Tem use of let for testing only, without the process of login and logout

    // if (!userId) {
    //     return res.status(400).json({ message: "Need to be a member to rent a book" });
    // }
    // For testing with postman only if not the above commented line will be used
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
