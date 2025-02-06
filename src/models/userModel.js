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
    INSERT INTO users (name, email, password, address, dob, role,avatar) VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING id;
    `;
    const SQL_USER_STATS_INSERT = `
    INSERT INTO user_status (user_id, reputation, current_book_count, max_book_count) VALUES ($1, $2, $3, $4);
    `;

    const USER_VALUES = [data.name, data.email, data.password, data.address, data.dob, "user",data.avatar];

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

                const USER_STATS_VALUES = [userId, 100, 0, 4];

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

module.exports.checkEmailToUpdate = async function checkEmail(email, userId) {
    const user = await prisma.users.findFirst({
        where: {
            email: email,
            NOT: {
                id: userId,
            },
        },
    });
    return user || null; // Return the user or null if no match
};

module.exports.checkNameToUpdate = async function checkEmail(name, userId) {
    const user = await prisma.users.findFirst({
        where: {
            name: name,
            NOT: {
                id: userId,
            },
        },
    });
    return user || null; // Return the user or null if no match
};



module.exports.getProfileInfo = async function getProfileInfo(userId) {
    try {
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(userId, 10)
            },
            include: {
                user_status: true, // join with user_status table
                rent_history: true // include rent history to count rented books
            }
        });
        if (!user) {
            throw new Error('User not found');
        }

        // Count the number of active rented books (i.e., books not yet returned)
        const rentedBookCount = await prisma.rent_history.count({
            where: {
                user_id: parseInt(userId, 10)
            }
        });

        return {
            name: user.name,
            email: user.email,
            address: user.address,
            dob: user.dob,
            avatar:user.avatar,
            reputation: user.user_status?.reputation || null,
            current_book_count: user.user_status?.current_book_count || null,
            max_book_count: user.user_status?.max_book_count || null,
            rented_book_count: rentedBookCount // Include the rented book count
        };
    } catch (error) {
        console.error('Error fetching profile info:', error);
        throw error;
    }
};


module.exports.getUserIdByEmail = (email, callback) => {
    const SQL_STATEMENT = `SELECT id FROM users WHERE email = $1;`;
    const VALUES = [email];

    pool.query(SQL_STATEMENT, VALUES, callback);
};

module.exports.getAllUsers = (callback) => {
    const SQL_STATEMENT = `
    SELECT u.id, u.name, u.email, u.role, us.reputation, us.current_book_count, us.max_book_count
    FROM users u LEFT JOIN user_status us
    ON u.id = us.user_id
    WHERE u.role <> 'admin';
    `;

    pool.query(SQL_STATEMENT, [], callback);
};

module.exports.updateProfileInfo = async (data) => {
    try {
        const updatedProfile = await prisma.users.update({
            where: {
                id: parseInt(data.user_id, 10),
            },
            data: {
                name: data.name,
                email: data.email,
                address: data.address,
            },
        });

        return updatedProfile; // Return the updated profile on success
    } catch (error) {
        if (error.code === 'P2025') {
            // Handle case when the user is not found
            throw new Error('User not found');
        }
        // Re-throw any other errors
        throw error;
    }
};


module.exports.getPassword = async (userId)=> {
    return prisma.users.findUnique({
        where: {
            id: parseInt(userId, 10) // Ensure the userId is an integer
        },
        select: {
            password: true // Only retrieve the password column
        }
    })
    .then(user => {
        if (!user) {
            throw new Error('User not found'); // Handle case where user does not exist
        }
        return user.password; // Return the password
    })
    .catch(error => {
        console.error("Error retrieving password:", error);
        throw error; // Re-throw error for higher-level handling
    });
};



module.exports.updatePassword = async (data) => {
    return prisma.users.update({
        where: {
            id: parseInt(data.user_id, 10), // Ensure the userId is an integer
        },
        data: {
            password: data.newPassword , // Update the password field
        },
    })
    .then((updatedUser) => {
        console.log("Password updated successfully for user ID:", updatedUser.id);
        return updatedUser; // Return the updated user info if needed
    })
    .catch((error) => {
        if (error.code === 'P2025') {
            throw new Error('User not found'); // Handle case where user does not exist
        }
        console.error("Error updating password:", error);
        throw error; // Re-throw error for higher-level handling
    });
};

// model.js or userModel.js

module.exports.deleteAccount = async (data) => {
    const { user_id } = data;

    try {
        // Try to delete the user account by the unique user_id
        const user = await prisma.users.findUnique({
            where: { id: user_id },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Delete all associated data before deleting the user (if required)
        await prisma.review.deleteMany({
            where: { user_id: user_id },
        });

        await prisma.rent_history.deleteMany({
            where: { user_id: user_id },
        });

        await prisma.book_request.deleteMany({
            where: { user_id: user_id },
        });

        // Now delete the user account using deleteUnique (which targets a unique field)
        await prisma.users.delete({
            where: { id: user_id }, // Specify the unique identifier (user_id)
        });

        return { message: "User account deleted successfully" };
    } catch (error) {
        console.error(error);
        throw new Error(error.message || "Failed to delete user account");
    }
};

module.exports.banUser = (userId) => {
    return prisma.users.delete({
            where: {
                id: userId,
            },
        })
        .catch((error) => {
            if (error.code === "P2025") {
                // User not found
                throw new Error("UserNotFound");
            }
            throw error; // Other errors
        });
};



module.exports.updateProfilePicture = async (data) => {
    const { user_id, avatar } = data;

    try {
        // Update the avatar for the specified user
        const updatedUser = await prisma.users.update({
            where: { id: user_id },
            data: { avatar: avatar },
        });

        // Return the updated user's profile
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
        };
    } catch (error) {
        // Check for "record not found" error (Prisma-specific error code)
        if (error.code === 'P2025') {
            throw new Error('User not found');
        }

        console.error('Error in updateProfilePicture model:', error);
        throw new Error('Database error');
    }
};

module.exports.getUserByID = async (userId) => {
    try {
        const user = await prisma.users.findMany({
            where: { id: parseInt(userId) }
        });

        return user; // ✅ Return user object (or null if not found)
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Database query failed"); // ❌ Avoid exposing raw DB errors
    }
};
