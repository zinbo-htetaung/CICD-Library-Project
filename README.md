#TO DO LIST
1. APP finish his job{
   add user-status value while registering
   add book category while adding books
   book quantity update in boook update route, data inputs should be optional
   OR
   front end default value
   shcema constraint modify book-book categroy
   
   }
2.Zin Bo{
   return seperate day-count value in return
}
3.TTY {
   rating limit
   optional: retreive review by user id
}

4.All{
   change category for books into array
}






# project-management-board

Starter project for ST0526 CICD

## Getting Started

1. Procure 2 Postgres Database (e.g. from Neon DB), one would be used for development and the other for test environment
2. Create 2 `.env` file named `.env.development` and `.env.test` both with the following content:

   ```
   DATABASE_URL=
   PORT=
   ```

   2.1 `DATABASE_URL`: Paste the connection string for development and test environment into the `.env` files respectively.
   2.2 Set PORT to `3000` for `.env.development` and `3001` for `.env.test`

3. Install dependencies: `npm install`
4. Setup database: `npm run migrate:reset`
5. Start server: `npm start`
6. Run end-2-end test: `npm test`
