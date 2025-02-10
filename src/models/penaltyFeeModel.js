const prisma = require('./prismaClient');

module.exports.retrieveAll = (userId) => {
    return prisma.penalty_fees.findMany({
        where: {
            user_id: userId
        },
        select: {
            id : true, 
            rent_history_id: true,
            fees: true,
            rent_history: {
                select: {
                    book: {
                        select: {
                            book_name: true 
                        }
                    },
                    end_date: true,
                    return_date: true
                }
            }
        }
    })
    .then(records => {
        return records.map(record => {
            const endDate = new Date(record.rent_history.end_date);
            const returnDate = record.rent_history.return_date ? new Date(record.rent_history.return_date) : new Date();
            const daysOverdue = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));

            return {
                id: record.id,
                rent_history_id: record.rent_history_id,
                book_name: record.rent_history.book.book_name,
                end_date: record.rent_history.end_date,
                return_date: record.rent_history.return_date,
                days_overdue: daysOverdue,
                fees: record.fees
            };
        });
    })
    .catch(error => {
        console.error("Error retrieving penalty fee records:", error);
        throw new Error("Failed to fetch penalty fee records.");
    });
};

module.exports.retrieveSingle = (penaltyId, userId) => {
    return prisma.penalty_fees.findFirst({
        where: {
            id: penaltyId,
            user_id: userId 
        },
        select: {
            id: true,
            rent_history_id: true,
            fees: true,
            status: true,
            paid_on: true
        }
    })
    .then(record => {
        return record; 
    })
    .catch(error => {
        console.error("Error retrieving single penalty record:", error);
        throw new Error("Failed to fetch penalty fee record.");
    });
};

module.exports.retrieveAllUnpaid = (userId) => {
    return prisma.penalty_fees.findMany({
        where: {
            user_id: userId,
            status: false 
        },
        select: {
            id : true, 
            rent_history_id: true,
            fees: true,
            rent_history: {
                select: {
                    book: {
                        select: {
                            book_name: true 
                        }
                    },
                    end_date: true,
                    return_date: true
                }
            }
        }
    })
    .then(records => {
        return records.map(record => {
            const endDate = new Date(record.rent_history.end_date);
            const returnDate = record.rent_history.return_date ? new Date(record.rent_history.return_date) : new Date();
            const daysOverdue = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));

            return {
                id: record.id,
                rent_history_id: record.rent_history_id,
                book_name: record.rent_history.book.book_name,
                end_date: record.rent_history.end_date,
                return_date: record.rent_history.return_date,
                days_overdue: daysOverdue,
                fees: record.fees
            };
        });
    })
    .catch(error => {
        console.error("Error retrieving unpaid penalty records:", error);
        throw new Error("Failed to fetch unpaid penalty fee records.");
    });
};

module.exports.retrieveAllPaid = (userId) => {
    return prisma.penalty_fees.findMany({
        where: {
            user_id: userId,
            status: true 
        },
        select: {
            id : true, 
            rent_history_id: true,
            fees: true,
            rent_history: {
                select: {
                    book: {
                        select: {
                            book_name: true 
                        }
                    },
                    end_date: true,
                    return_date: true
                }
            }
        }
    })
    .then(records => {
        return records.map(record => {
            const endDate = new Date(record.rent_history.end_date);
            const returnDate = record.rent_history.return_date ? new Date(record.rent_history.return_date) : new Date();
            const daysOverdue = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));

            return {
                id : record.id,
                rent_history_id: record.rent_history_id,
                book_name: record.rent_history.book.book_name,
                end_date: record.rent_history.end_date,
                return_date: record.rent_history.return_date,
                days_overdue: daysOverdue,
                fees: record.fees
            };
        });
    })
    .catch(error => {
        console.error("Error retrieving paid penalty records:", error);
        throw new Error("Failed to fetch paid penalty fee records.");
    });
};

module.exports.payAllUnpaidFees = (userId) => {
    return prisma.penalty_fees.updateMany({
        where: {
            user_id: userId,
            status: false 
        },
        data: {
            status: true, 
            paid_on: new Date() 
        }
    })
    .then(result => {
        return result.count; 
    })
    .catch(error => {
        console.error("Error updating penalty fee records:", error);
        throw new Error("Failed to update penalty fee records.");
    });
};




