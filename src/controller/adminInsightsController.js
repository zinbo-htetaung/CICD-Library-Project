const model = require("../models/adminInsightModel.js");

module.exports.getAllInsights = (req, res) => {
    model.retrieveAll()
        .then(insights => {
            if (!insights) {
                return res.status(404).json({ message: "No insights found" });
            }
            return res.status(200).json(insights);
        })
        .catch(error => {
            console.error('Error in controller:', error);
            return res.status(500).json({ error: error.message });
        });
};