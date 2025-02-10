const model = require("../models/penaltyFeeModel.js");

module.exports.retrieveAllPenaltyRecords = (req, res, next) => {
    const userId = res.locals.user_id;

    model.retrieveAll(userId)
        .then(records => {
            if (records.length == 0) {
                return res.status(404).json({ message: "User has no record of penalty fees" })
            }
            return res.status(200).json({ records: records });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.retrieveSinglePenaltyRecord = (req, res, next) => {
    const userId = res.locals.user_id; 
    const penaltyId = parseInt(req.params.id, 10); 

    if (!penaltyId || isNaN(penaltyId)) {
        return res.status(400).json({ message: "Invalid or missing penalty fee ID" });
    }

    model.retrieveSingle(penaltyId, userId)
        .then(record => {
            if (!record) {
                return res.status(404).json({ message: "Penalty record not found for this user" });
            }
            return res.status(200).json({ record });
        })
        .catch(error => {
            console.error("Error retrieving penalty fee record:", error);
            return res.status(500).json({ error: "Failed to fetch penalty fee record" });
        });
};

module.exports.retrieveAllUnpaidPenaltyRecords = (req, res, next) => {
    const userId = res.locals.user_id; 

    model.retrieveAllUnpaid(userId)
        .then(records => {
            if (records.length === 0) {
                return res.status(404).json({ message: "No unpaid penalty records found for this user" });
            }
            return res.status(200).json({ records });
        })
        .catch(error => {
            console.error("Error retrieving unpaid penalty fee records:", error);
            return res.status(500).json({ error: "Failed to fetch unpaid penalty fee records" });
        });
};

module.exports.retrieveAllPaidPenaltyRecords = (req, res, next) => {
    const userId = res.locals.user_id; 

    model.retrieveAllPaid(userId)
        .then(records => {
            if (records.length === 0) {
                return res.status(404).json({ message: "No paid penalty records found for this user" });
            }
            return res.status(200).json({ records });
        })
        .catch(error => {
            console.error("Error retrieving unpaid penalty fee records:", error);
            return res.status(500).json({ error: "Failed to fetch unpaid penalty fee records" });
        });
};

module.exports.payPenaltyFees = (req, res, next) => {
    const userId = res.locals.user_id; 

    model.payAllUnpaidFees(userId)
        .then(updatedCount => {
            if (updatedCount === 0) {
                return res.status(404).json({ message: "No unpaid penalty records found to pay" });
            }
            return res.status(200).json({ message: `Successfully paid ${updatedCount} penalty fee(s)` });
        })
        .catch(error => {
            console.error("Error paying penalty fees:", error);
            return res.status(500).json({ error: "Failed to pay penalty fee records. Please try again later!" });
        });
};

module.exports.insertPenaltyRecord = (req, res, next) => {
    const userId = res.locals.user_id; 
    
};

