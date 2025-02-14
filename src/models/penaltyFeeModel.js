const { user } = require('pg/lib/defaults');
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
            status : true,
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
                fees: record.fees,
                status : record.status
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
                fees: record.fees,
                status : record.status
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

module.exports.insertPenalty = ({ rentHistoryId, userId, penaltyFee }) => {
    return prisma.penalty_fees.create({
        data: {
            rent_history_id: rentHistoryId,
            user_id: userId,
            fees: penaltyFee,
            status: false, 
            paid_on: null 
        }
    })
    .then(record => {
        console.log(`Inserted penalty record:`, record);
        return record;
    })
    .catch(error => {
        console.error("Error inserting penalty record:", error);
        throw new Error("Failed to insert penalty record.");
    });
};

module.exports.getAllUsersPenaltyRecords = () => {
    return prisma.penalty_fees.findMany({
        select: {
            id: true,
            rent_history_id: true,
            fees: true,
            status: true,
            paid_on: true,
            users: {
                select: {
                    name: true 
                }
            },
            rent_history: {
                select: {
                    book: {
                        select: {
                            book_name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'asc' 
        }
    })
    .then(records => {
        return records.map(record => ({
            id: record.id,
            rent_history_id: record.rent_history_id,
            username: record.users.name,
            book_name: record.rent_history.book.book_name,
            fees: record.fees,
            status: record.status,
            paid_on: record.paid_on
        }));
    })
    .catch(error => {
        console.error("Error retrieving all penalty records:", error);
        throw new Error("Failed to retrieve all penalty records.");
    });
};

module.exports.getFilteredPenaltyRecords = ({ username, status, start_date, end_date }) => {
    const filters = {};

    if (username) {
        filters.users = {
            name: {
                equals: username,   // username match
                mode: "insensitive" // case-insensitive
            }
        };
    }

    if (status !== undefined) {
        filters.status = status;    // paid/unpaid status
    }

    if (start_date || end_date) {
        filters.paid_on = {};
        if (start_date) {
            filters.paid_on.gte = new Date(start_date);     // paid on or after start_date
        }
        if (end_date) {
            filters.paid_on.lte = new Date(end_date);   // paid on or before end_date
        }
    }

    return prisma.penalty_fees.findMany({
        where: filters,     // strict filters
        select: {
            id: true,
            rent_history_id: true,
            fees: true,
            status: true,
            paid_on: true,
            users: {
                select: {
                    name: true 
                }
            },
            rent_history: {
                select: {
                    book: {
                        select: {
                            book_name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'asc' 
        }
    })
    .then(records => {
        return records.map(record => ({
            id: record.id,
            rent_history_id: record.rent_history_id,
            username: record.users.name,    
            book_name: record.rent_history.book.book_name,
            fees: record.fees,
            status: record.status,
            paid_on: record.paid_on
        }));
    })
    .catch(error => {
        console.error("Error retrieving filtered penalty records:", error);
        throw new Error("Failed to retrieve filtered penalty records.");
    });
};







