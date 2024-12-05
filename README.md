# Library Book Rental Web Application

Welcome to our **VASELINE Library Book Rental Web Application**! This project provides a seamless platform for users to browse, rent, and manage books online.



## 📖 Overview

The Library Book Rental Web Application is designed to make book rental easy and accessible for users. It offers user-friendly interfaces, robust backend APIs, and secure authentication for a smooth experience.

---

## ✨ Features

- **User Authentication**
  - User registration and login system
  - Role-based access (e.g. User, Admin)

- **Book Management**
  - View available books
  - Add, update, and delete books (For administrators)

- **Rental Management**
  - Rent books
  - Return books
  - View rental history

- **Responsive Design**
  - Optimized for both desktop and mobile devices

- **Secure**
  - Data validation and protection against common security threats

---

## 🛠️ Technologies Used

### Frontend:
- **HTML, CSS, Bootstrap,  JavaScript**

### Backend:
- **Node.js** with **Express.js**

### Database:
- **PostgreSQL**

### Other:
- **JWT** for Authentication
- **MVC Architecture**
- **RESTful APIs**

---
## 🛠 How It Works

### **For Users (Members):**
- **Browse Books:**  
  - Users can freely explore the books available on the **Books** page.  
  - Tap on a book to view its details and read user reviews.

- **Renting Books:**  
  - Only logged-in users can rent books.  
  - Rented books are organized into three sections:  
    - **Currently Rented Books**  
    - **Due Today Books**  
    - **Overdue Books** (incurs a fine of $5 per overdue day).  
  - Users can extend the rental for books in the **Due Today Books** section. However, the book can only be extended for __3 more days__ only.

- **Book Requests:**  
  - Users can request specific books they want to see in the library.

- **Profile Management:**  
  - Update account details and passwords.  
  - View rental history.

### **For Admins:**
- **Book Management:**  
  - Add, update, or remove books in the library.

- **Book Requests:**  
  - Review and manage user-submitted book requests.

- **Rental Logs:**  
  - Access and analyze rental history logs.

- **User Management:**  
  - View and manage registered users.

- **App Insights:**  
  - Analyze application usage and generate insights.

---

### **User Simulation**
   - **Admin Account**
     - Email : admin@gmail.com   
     - Password : password
   - **User Account**
     - Email : john@gmail.com   
     - Password : password
---

---

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
