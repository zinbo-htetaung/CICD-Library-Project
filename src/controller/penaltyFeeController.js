const model = require("../models/penaltyFeeModel.js");

module.exports.retrieveAllUserPenaltyRecords = (req, res, next) => {
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

    if (!penaltyId ) {
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
    const rentHistoryId = res.locals.rent_history_id;
    const returnResponse = res.locals.returnResponse;
    const daysOverdue = res.locals.returnResponse.daysOverdue;

    const penaltyFee = daysOverdue * 5;     // calculate overdue penalty fees

    model.insertPenalty({ rentHistoryId, userId, penaltyFee })
        .then(() => {
            return res.status(200).json(returnResponse); 
        })
        .catch(error => {
            console.error("Error inserting penalty record:", error);
            return res.status(500).json({ error: "Failed to insert penalty fee record." });
        });

};

module.exports.retrieveAllPenaltyRecords = (req, res, next) => {

    model.getAllUsersPenaltyRecords()
        .then(records => {
            if (records.length == 0) {
                return res.status(404).json({ message: "No penalty record history found" })
            }
            return res.status(200).json({ records: records });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.retrieveFilteredPenaltyRecords = (req, res, next) => {
    const { username, status, start_date, end_date } = req.body;

    // ensure at least one filter is applied
    if (!username && status === undefined && !start_date && !end_date) {
        return res.status(404).json({ message: "No filters applied" });
    }

    model.getFilteredPenaltyRecords({ username, status, start_date, end_date })
        .then(records => {
            if (records.length === 0) {
                return res.status(404).json({ message: "No penalty records found matching the filters" });
            }
            return res.status(200).json({ records: records });
        })
        .catch(error => {
            console.error("Error retrieving filtered penalty records:", error);
            return res.status(500).json({ error: error.message });
        });
};


