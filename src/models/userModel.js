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

module.exports.insertUserStatus = (userId, callback) => {
    const SQL_STATEMENT = `
    INSERT INTO user_status (user_id, current_book_count, max_book_count)
    VALUES ($1, $2, $3);
    `;
    const VALUES = [userId, 0, 4];

    pool.query(SQL_STATEMENT, VALUES, callback);
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
    ON u.id = us.user_id;
    `;

    pool.query(SQL_STATEMENT, [], callback);
};

module.exports.updateProfileInfo=(data)=>{
    return prisma.users.update({
        where: {
            id: parseInt(data.user_id,10), 
        },
        data: {
            name: data.name,
            email: data.email,
            address: data.address
        }
    })
    .then(updateProfile  => {
        console.log("Updated book:", updateProfile);
        return updateProfile; 
    })
    .catch(error => {
        if (error.code === 'P2025') {
            throw new Error('User not found'); 
        }
        throw error; 
    });
}

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
        await prisma.users.deleteUnique({
            where: { id: user_id }, // Specify the unique identifier (user_id)
        });

        return { message: "User account deleted successfully" };
    } catch (error) {
        console.error(error);
        throw new Error(error.message || "Failed to delete user account");
    }
};
