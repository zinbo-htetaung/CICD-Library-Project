// const pg = require('pg');
// // eslint-disable-next-line import/no-extraneous-dependencies
// const pgCamelCase = require('pg-camelcase');

// pgCamelCase.inject(pg)

// const pool = new pg.Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     database: process.env.DB_DATABASE,
//     max: process.env.DB_CONNECTION_LIMIT,
//     // ssl: {
//     //     rejectUnauthorized: false, // Required for Neon SSL connections
//     // },
// });

// // Monkey patch .query(...) method to console log all queries before executing it
// // For debugging purpose
// const oldQuery = pool.query;
// pool.query = function (...args) {
//     const [sql, params] = args;
//     console.log(`EXECUTING QUERY |`, sql, params);
//     return oldQuery.apply(pool, args);
// };

// module.exports = pool;

const pg = require('pg');
// eslint-disable-next-line import/no-extraneous-dependencies
const pgCamelCase = require('pg-camelcase');

// Automatically convert PostgreSQL snake_case to camelCase in results
pgCamelCase.inject(pg);

// Configure the pool to use DATABASE_URL
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL, // Use DATABASE_URL for connection
    ssl: {
        rejectUnauthorized: false, // Required for cloud databases like Neon
    },
});

// Monkey patch .query(...) method to console log all queries for debugging
const oldQuery = pool.query;
pool.query = function (...args) {
    const [sql, params] = args;
    console.log(`EXECUTING QUERY:`, sql, params || []);
    return oldQuery.apply(pool, args);
};

module.exports = pool;