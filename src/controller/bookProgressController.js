const { encode } = require("punycode");
const model = require("../models/bookProgressModel.js");

module.exports.retrieveAllBookProgress = (req, res) => {
    const userId = res.locals.user_id; 

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    model.retrieveAll(userId)
        .then((bookProgresses) => {
            if (!bookProgresses || bookProgresses.length === 0) {
                return res.status(404).json({ message: "No book progress records found for the user." });
            }
            res.status(200).json({ bookProgresses });
        })
        .catch((error) => {
            console.error("Error fetching book progress records:", error);
            res.status(500).json({ message: "Failed to retrieve book progress records." });
        });
};

module.exports.retrieveSingleBookProgress = (req, res) => {
    const bookProgressId = parseInt(req.params.id, 10);

    if (isNaN(bookProgressId)) {
        return res.status(400).json({ message: "Invalid book progress ID." });
    }

    model.retrieveSingle(bookProgressId)
        .then((bookProgress) => {
            if (!bookProgress) {
                return res.status(404).json({ message: "Book progress record not found." });
            }
            res.status(200).json({ bookProgress });
        })
        .catch((error) => {
            console.error("Error fetching book progress record:", error);
            res.status(500).json({ message: "Failed to retrieve the book progress record." });
        });
};

module.exports.checkOwner = (req, res, next) => {
    const bookProgressId = parseInt(req.params.id, 10);
    const userId = res.locals.user_id; 

    if (isNaN(bookProgressId)) {
        return res.status(400).json({ message: "Invalid book progress ID." });
    }

    model.checkOwnership(bookProgressId, userId)
        .then((isOwner) => {
            if (!isOwner) {
                return res.status(403).json({ message: "You do not have access to this book progress record." });
            }
            next(); 
        })
        .catch((error) => {
            console.error("Error checking ownership:", error);
            res.status(500).json({ message: "Failed to verify book progress ownership." });
        });
};

module.exports.checkExistence = (req, res, next) => {
    const bookProgressId = parseInt(req.params.id, 10);

    if (isNaN(bookProgressId)) {
        return res.status(400).json({ message: "Invalid book progress ID." });
    }

    model.checkExistence(bookProgressId)
        .then((result) => {
            if (!result) {
                return res.status(403).json({ message: "Book progress record does not exist." });
            }
            next(); 
        })
        .catch((error) => {
            console.error("Error checking ownership:", error);
            res.status(500).json({ message: "Failed to verify book progress existence." });
        });
};

module.exports.updateBookProgress = (req, res) => {
    const bookProgressId = parseInt(req.params.id, 10);
    const { progress } = req.body;

    if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Invalid progress value. Must be a number between 0 and 100." });
    }

    // check progress and set status
    let status = "Unread";
    if (progress > 0 && progress < 100) {
        status = "Reading";
    } else if (progress === 100) {
        status = "Completed";
    }

    model.updateProgress(bookProgressId, progress, status)
        .then(() => {
            res.status(200).json({ message: `Book progress now at: ${progress}` });
        })
        .catch((error) => {
            console.error("Error updating book progress:", error);
            res.status(500).json({ message: "Failed to update book progress." });
        });
};

module.exports.addBookProgress = (req, res) => {
    const rent_history_id = res.locals.rent_history_id;
    const book_id = res.locals.book_id;
    const userId = res.locals.user_id; 

    if (!rent_history_id || !book_id || !userId) {
        return res.status(400).json({ message: "Missing required fields: rent_history_id, book_id, or user_id." });
    }

    const data = {
        rent_history_id,
        book_id,
        user_id: userId,
        status: "Unread"
    };

    model.insertSingle(data)
        .then(() => model.getBookDetails(data.book_id)) 
        .then((updatedBook) => 
            {res.status(201).json({book: updatedBook });  
        })
        .catch((error) => {
            console.error("Error adding book progress:", error);
            res.status(500).json({ message: "Failed to add book progress." });
        });
};

module.exports.completeBookProgress = (req, res) => {
    const bookProgressId = parseInt(req.params.id, 10);
    const progress = 100;
    const status = "Completed";

    if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Invalid progress value. Must be a number between 0 and 100." });
    }

    model.updateProgress(bookProgressId, progress, status)
        .then(() => {
            res.status(200).json({ message: `Book status set to completed` });
        })
        .catch((error) => {
            console.error("Error updating book progress:", error);
            res.status(500).json({ message: "Failed to update book progress." });
        });
};

module.exports.resetBookProgress = (req, res) => {
    const bookProgressId = parseInt(req.params.id, 10);
    const progress = 0;
    const status = "Unread";

    if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Invalid progress value. Must be a number between 0 and 100." });
    }

    model.updateProgress(bookProgressId, progress, status)
        .then(() => {
            res.status(200).json({ message: `Book status set to unread` });
        })
        .catch((error) => {
            console.error("Error updating book progress:", error);
            res.status(500).json({ message: "Failed to update book progress." });
        });
};

module.exports.deleteBookProgress = (req, res, next) => {
    const rentHistoryId = res.locals.rent_history_id;
    const dueStatus = res.locals.returnResponse.due_status;

    if (!rentHistoryId) {
        console.error("Missing rent history ID.");
        return res.status(404).json({ message: "Rent history ID is required." });
    }

    model.deleteByRentHistoryId(rentHistoryId)
        .then(() => {
            console.log(`Book progress for rent_history_id ${rentHistoryId} deleted successfully.`);

            if (dueStatus == true) {
                next();
            } else
                return res.status(200).json(res.locals.returnResponse); // Return the original response if not due
        })
        .catch((error) => {
            console.error("Error deleting book progress:", error);
            res.status(200).json(res.locals.returnResponse); // Still return the original response even if deletion fails
        });
};

module.exports.checkCompleteProgress = (req, res, next) => {
    const bookProgressId = parseInt(req.params.id, 10);

    if (isNaN(bookProgressId)) {
        return res.status(400).json({ message: "Invalid book progress ID." });
    }

    model.retrieveSingle(bookProgressId)
        .then((bookProgress) => {
            if (!bookProgress) {
                return res.status(404).json({ message: "Book progress record not found." });
            }
            if (bookProgress.status != "Completed") {
                return res.status(403).json({ message: "Please read your book fully before you can share" });
            }
            return res.status(200).json({ bookProgress });
        })
        .catch((error) => {
            console.error("Error fetching book progress record:", error);
            res.status(500).json({ message: "Failed to retrieve the book progress record." });
        });
};

module.exports.shareProgressOnTwitter = (req, res) => {
    console.log(res.locals.bookProgress);
    const bookProgress = res.locals.bookProgress;
    const bookName = encodeURIComponent(bookProgress.book_name);
    const bookId = encodeURIComponent(bookProgress.id);
    const author = encodeURIComponent(bookProgress.author);
    const appName = encodeURIComponent("Vaselene Library");

    const shareUrl = `https://x.com/intent/tweet?text=I just completed reading "${bookName}" by ${author}! Check it out on ${appName}.&url=https://vaselene-library-bragatg9f4d6e3cu.southeastasia-01.azurewebsites.net/general/html/displaySingleBook.html?bookId=${bookId}`;
    res.redirect(shareUrl);
};

module.exports.shareProgressOnGamil = (req,res) => {
    const bookProgress = res.locals.bookProgress;
    const bookName = encodeURIComponent(bookProgress.book_name);
    const bookId = encodeURIComponent(bookProgress.id);
    const author = encodeURIComponent(bookProgress.author);
    const appName = encodeURIComponent("Vaselene Library");

    const body = encodeURIComponent(
      `I just completed reading "${bookName}" by ${author}! Check it out here ${appName} - https://vaselene-library-bragatg9f4d6e3cu.southeastasia-01.azurewebsites.net/general/html/displaySingleBook.html?bookId=${bookId}`
    );
    const subject = encodeURIComponent("I Finished a Great Book!");
    const shareUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${subject}&body=${body}`;
  
    res.redirect(shareUrl);
};
