const model = require('../models/bookListModel');

module.exports.addToWishlist = async (req, res) => { 
    try { 
        const userId = parseInt(res.locals.user_id); 
        const bookId = parseInt(req.params.bookId); 
        
        if (!userId || !bookId) { 
            return res.status(400).json({ message: "Invalid user ID or book ID" }); 
        } 
        
        await model.addToWishlist({ userId, bookId }); 
        res.status(200).json({ message: "Book added to wishlist successfully" }); 
    } catch (error) { 
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'This book is already in the wishlist.' }); 
        } else { 
            console.error('Error in addToWishlist controller:', error); 
            res.status(500).json({ message: "Failed to add book to wishlist" }); 
        } 
    } 
}

module.exports.addToIgnoreList = async (req, res) => { 
    try { 
        const userId = parseInt(res.locals.user_id); 
        const bookId = parseInt(req.params.bookId); 
        
        if (!userId || !bookId) { 
            return res.status(400).json({ message: "Invalid user ID or book ID" }); 
        } 
        
        await model.addToIgnoreList({ userId, bookId }); 
        res.status(200).json({ message: "Book added to Ignore List successfully" }); 
    } catch (error) { 
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'This book is already in the Ignore List.' }); 
        } else { 
            console.error('Error in addToIgnoreList controller:', error); 
            res.status(500).json({ message: "Failed to add book to Ignore List" }); 
        } 
    } 
}

module.exports.getWishlist = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        if (!userId) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const books = await model.getWishlist(userId);
        res.status(200).json({ books });
    } catch (error) {
        console.error('Error in getWishlist controller:', error);
        res.status(500).json({ message: "Failed to fetch wishlist" });
    }
};

module.exports.getIgnoreList = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        if (!userId) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const books = await model.getIgnoreList(userId);
        res.status(200).json({ books });
    } catch (error) {
        console.error('Error in getIgnoreList controller:', error);
        res.status(500).json({ message: "Failed to fetch ignore list" });
    }
};

module.exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        const bookId = parseInt(req.params.bookId);

        if (!userId || !bookId) {
            return res.status(400).json({ message: "Invalid user ID or book ID" });
        }

        await model.removeFromWishlist({ userId, bookId });
        res.status(200).json({ message: "Book removed from wishlist successfully" });
    } catch (error) {
        console.error('Error in removeFromWishlist controller:', error);
        res.status(500).json({ message: "Failed to remove book from wishlist" });
    }
};

module.exports.removeFromIgnoreList = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        const bookId = parseInt(req.params.bookId);

        if (!userId || !bookId) {
            return res.status(400).json({ message: "Invalid user ID or book ID" });
        }

        await model.removeFromIgnoreList({ userId, bookId });
        res.status(200).json({ message: "Book removed from ignore list successfully" });
    } catch (error) {
        console.error('Error in removeFromIgnoreList controller:', error);
        res.status(500).json({ message: "Failed to remove book from ignore list" });
    }
};