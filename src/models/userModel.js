const pool = require('../database.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.checkExistence = (data, callback) => {
    const nameQuery = `SELECT * FROM users WHERE name = $1;`;
    const emailQuery = `SELECT * FROM users WHERE email = $1;`;

    const nameCheck = pool.query(nameQuery, [data.name]);
    const emailCheck = pool.query(emailQuery, [data.email]);

    Promise.all([nameCheck, emailCheck])
        .then((results) => {
            const formattedResults = [
                results[0].rows, // Result of name query
                results[1].rows  // Result of email query
            ];
            callback(null, formattedResults);
        })
        .catch((error) => {
            console.error("Error checking user and email:", error);
            callback(error);
        });
};

module.exports.insertSingle = (data, callback) => {
    const SQL_STATEMENT = `
    INSERT INTO users (name, email, password, address, dob, role) VALUES ($1, $2, $3, $4, $5, $6);
    `;
    const VALUES = [data.name, data.email, data.password, data.address, data.dob, "user" ];

    pool.query(SQL_STATEMENT, VALUES, callback);
}

module.exports.checkEmail = function checkEmail(email) {
    const SQL_STATEMENT = 'SELECT * FROM users WHERE email = $1';
    return pool.query(SQL_STATEMENT, [email]).then(result => {
        const rows = result.rows;
        return rows[0] || null; // Return the first row or null if no match
    });
};
module.exports.getProfileInfo = function getProfileInfo(userId) {
    return prisma.users.findUnique({
        where: {
            id: parseInt(userId, 10) 
        },
        include: {
            user_status: true   // join with user_status table
        }
    })
    .then(user => {
        if (!user) {
            throw new Error('User not found');
        }

        return {
            name: user.name,
            email: user.email,
            address: user.address,
            dob: user.dob,
            reputation: user.user_status?.reputation || null,
            current_book_count: user.user_status?.current_book_count || null,
            max_book_count: user.user_status?.max_book_count || null
        };
    });
};