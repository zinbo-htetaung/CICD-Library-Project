# project-management-board

Starter project for ST0526 CICD

## Getting Started

1. Procure 2 Postgres Database (e.g. from Neon DB), one would be used for development and the other for test environment
2. Create 2 `.env` file named `.env.development` and `.env.test` both with the following content:

   ```
   DATABASE_URL=
   ```

   2.1 `DATABASE_URL`: Paste the connection string for development and test environment into the `.env` files respectively.

3. Install dependencies: `npm install`
4. Start server: `npm start`
5. Run end-2-end test: `npm test`
