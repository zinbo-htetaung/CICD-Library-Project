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
  - Review Books After Reading
  - Queue System
  - Penalty System (For Overdue Returnees)

- **Recommendation System**
  - Genre-based Recommendation
  - Popularity-based Recommendation
  - Author-based Recommendation
  - Wishlist
  - Ignore List

- **Book Progress**
  - Read and Track the progress in Real-time
  - Share the Books to Friends After Reading

 **Chat Bot**
  - Respond to Users for Simple and FAQs such as Open Hours
  - Refer Back to the Admin for More Detailed Questions

 **Chat with Admin**
  - Allow Users to Contact the Adminstrators for Detailed Inquiries
  - Allow Adminstrators to Answer and Talk with Users
  
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

- **Read and Track Progress for a Book:**
  - The books rented by the user can be found under the Book Progress Option.
  - They are caategorized into Unread Books, Currrently Reading and Completed Books.
  - For Books Under Unread Books and Currrently Reading, the user can click read books to start/continue reading the book. After they reached a certain amount of progress, it will be tracked and the next time the user read the book, the user can choose to start reading from that point.
  - The Reset Option is also given to the books under the last two sections for users who wish to reset their progress on said books. In a similar manner, the user may click Finish Reading for books in the first two sections to immediatelty move a book to Completed Book Section.
  - For Books in the Completed Book Section, the user may choose share the book link to their friends via Email or Twitter.

- **Renting Books:**  
  - Only logged-in users can rent books.  
  - Rented books are organized into three sections:  
    - **Currently Rented Books**  
    - **Due Today Books**  
    - **Overdue Books** (incurs a fine of $5 per overdue day).  
  - Users can extend the rental for books in the **Due Today Books** section. However, the book can only be extended for __3 more days__ only.
  - In addition to the fine, each time a user fails to return a book in time, their credit score will be reduced by 5 but it will be increaded by 5 if returned in time.
  - The Credit System Rules are enforced as follows:
    - If the credit score for a user has reached 80, the amount of books they can rent at a given time will be reduced to 4 from 5.
    - Similarly for 70 and below, it will be reduced to 3.
    - This will be calculated the same way until it reaches 40 where the book count reaches 0 and the admin may choose to ban the account for abusing the rental system excessively.

- **Review Books:**
  - Only logged-in users can review books. Non-members can, however, still view the reviews given to the books.
  - To give a review to a book, the following conditions must be satisfied:
    - **The user must have rented the book before. However, the user does not need to return the book to give a review.**
    - **The user must not have given a review to the book before. There can only be one review for a book by one user at any given time.**
    - **However, the user may update the review after changing his mind or delete their old review if they wish too and then, they will be allowed to give another review.**

- **Recommendation System:**
  - This is a member-only feature as it is designed to be a personalized experience based on a user's reading history.
  - There are three recommendation sections:
    - **Genre-Based Recommendation: It recommends unread books from the book category that the user has the amount of books read.**
    - **Popularity-Based Recommendation: It recommends books with the highest amount of rental books for the current month.**
    - **Author-Based Recommendation: It recommends unread books from the author that the user has the amount of books read from. However, the user must also have given at least two 4-star ratings to two books from said author in order for the system to make sure of their love of the author**
  - Wishlist and Ignore features are also added to accomodate this feature.
    - **Wishlist: Allow users to add a book to their wishlist while in the recommendation section. Designed to help users who found a book to be interesting but does not have time to save the book to rent and read later.**
    - **Ignore List: Allow users to add a book to their Ignore List while in the recommendation section. Designed to help users who found a book to be not suited to their taste to hide the book from appearing in the recommendation section in the future.**

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
