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
    const SQL_USER_INSERT = `
    INSERT INTO users (name, email, password, address, dob, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
    `;
    const SQL_USER_STATS_INSERT = `
    INSERT INTO user_status (user_id, reputation, current_book_count, max_book_count) VALUES ($1, $2, $3, $4);
    `;

    const USER_VALUES = [data.name, data.email, data.password, data.address, data.dob, "user"];

    // Use a single connection for the transaction
    pool.connect((err, client, release) => {
        if (err) {
            return callback(err);
        }

        console.log("Starting transaction...");

        // Begin transaction
        client.query('BEGIN', (beginErr) => {
            if (beginErr) {
                release();
                return callback(beginErr);
            }

            console.log("Inserting into users table...");

            // First insert into users table
            client.query(SQL_USER_INSERT, USER_VALUES, (userInsertErr, userResult) => {
                if (userInsertErr) {
                    console.error("Error inserting into users:", userInsertErr);
                    client.query('ROLLBACK', () => {
                        release();
                        callback(userInsertErr);
                    });
                    return;
                }

                const userId = userResult.rows[0].id;
                console.log("User inserted successfully with ID:", userId);

                const USER_STATS_VALUES = [userId, 100, 0, 5];

                console.log("Inserting into user_status table...");

                // Second insert into user_status table
                client.query(SQL_USER_STATS_INSERT, USER_STATS_VALUES, (statsInsertErr) => {
                    if (statsInsertErr) {
                        console.error("Error inserting into user_status:", statsInsertErr);
                        client.query('ROLLBACK', () => {
                            release();
                            callback(statsInsertErr);
                        });
                        return;
                    }

                    console.log("User status inserted successfully. Committing transaction...");

                    // Commit the transaction
                    client.query('COMMIT', (commitErr) => {
                        if (commitErr) {
                            console.error("Error committing transaction:", commitErr);
                            client.query('ROLLBACK', () => {
                                release();
                                callback(commitErr);
                            });
                            return;
                        }

                        console.log("Transaction committed successfully.");
                        release();
                        callback(null, { userId });
                    });
                });
            });
        });
    });
};

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

