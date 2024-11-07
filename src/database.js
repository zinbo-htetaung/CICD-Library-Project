const pg = require('pg');
// eslint-disable-next-line import/no-extraneous-dependencies
const pgCamelCase = require('pg-camelcase');

pgCamelCase.inject(pg)

const pool = new pg.Pool({
    user: process.env.test.DB_USER,
    password: process.env.test.DB_PASSWORD,
    host: process.env.test.DB_HOST,
    database: process.env.test.DB_DATABASE,
    max: process.env.test.DB_CONNECTION_LIMIT,
});

// Monkey patch .query(...) method to console log all queries before executing it
// For debugging purpose
const oldQuery = pool.query;
pool.query = function (...args) {
    const [sql, params] = args;
    console.log(`EXECUTING QUERY |`, sql, params);
    return oldQuery.apply(pool, args);
};

module.exports = pool;
