const model = require('../models/recommendationModel.js');

module.exports.getGenreBasedRecommendations = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id, 10);

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }

        const ignoredBookIds = res.locals.ignoredBookIds || [];

        const recommendations = await model.getGenreBasedRecommendations({ 
            userId,
            ignoredBookIds
        });
        
        const formattedRecommendations = recommendations.map(book => ({
            id: book.id,
            book_name: book.book_name,
            author: book.author,
            description: book.description,
            available_copies: book.available_copies,
            categories: book.book_category.map(bc => bc.category.category_name),
            average_rating: book.review.length 
                ? book.review.reduce((acc, rev) => acc + rev.rating, 0) / book.review.length 
                : 0
        }));

        res.json({ recommendations: formattedRecommendations });
    } catch (error) {
        console.error('Error in getGenreBasedRecommendations:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.getMonthlyPopularBooks = async (req, res) => {
    try {
        const ignoredBookIds = res.locals.ignoredBookIds || [];
        const userId = res.locals.user_id;

        const popularBooks = await model.getMonthlyPopularBooks({ 
            userId,
            ignoredBookIds
        });
        
        const formattedBooks = popularBooks.map(book => ({
            id: book.id,
            book_name: book.book_name,
            author: book.author,
            description: book.description,
            available_copies: book.available_copies,
            rent_count: book.rent_history.length,
            average_rating: book.review.length 
                ? book.review.reduce((acc, rev) => acc + rev.rating, 0) / book.review.length 
                : 0
        }));

        res.json({ recommendations: formattedBooks });
    } catch (error) {
        console.error('Error in getMonthlyPopularBooks:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.getAuthorRecommendations = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id, 10);

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }

        const ignoredBookIds = res.locals.ignoredBookIds || [];

        const recommendations = await model.getAuthorRecommendations({ 
            userId,
            ignoredBookIds
        });
        
        if (!recommendations) {
            return res.status(404).json({ 
                message: "No recommendations found. Try rating more books (4 stars or higher) by the same author!" 
            });
        }

        if (recommendations.length === 0) {
            return res.status(404).json({ 
                message: "You've already read all books by your favorite author!" 
            });
        }
        
        const formattedRecommendations = recommendations.map(book => ({
            id: book.id,
            book_name: book.book_name,
            author: book.author,
            description: book.description,
            available_copies: book.available_copies,
            average_rating: book.review.length 
                ? book.review.reduce((acc, rev) => acc + rev.rating, 0) / book.review.length 
                : 0
        }));

        res.json({ recommendations: formattedRecommendations });
    } catch (error) {
        console.error('Error in getAuthorRecommendations:', error);
        res.status(500).json({ error: error.message });
    }
};