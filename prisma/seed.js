const prisma = require('../src/models/prismaClient');

const bcrypt = require('bcrypt');

const statuses = [
  { text: 'Pending' },
  { text: 'In Progress' },
  { text: 'Completed' },
  { text: 'On Hold' },
];

// Seed Persons
const persons = [
  { email: 'alice@example.com', name: 'Alice' }, // Task 1
  { email: 'bob@example.com', name: 'Bob' }, // Task 1
  { email: 'carol@example.com', name: 'Carol' }, // Task 2
  { email: 'dave@example.com', name: 'Dave' }, // Task 2
  { email: 'eve@example.com', name: 'Eve' },
  { email: 'frank@example.com', name: 'Frank' },
  { email: 'grace@example.com', name: 'Grace' },
  { email: 'heidi@example.com', name: 'Heidi' },
  { email: 'ivan@example.com', name: 'Ivan' },
  { email: 'judy@example.com', name: 'Judy' },
  { email: 'mallory@example.com', name: 'Mallory' },
  { email: 'oscar@example.com', name: 'Oscar' },
  { email: 'peggy@example.com', name: 'Peggy' },
  { email: 'trent@example.com', name: 'Trent' },
  { email: 'victor@example.com', name: 'Victor' },
  { email: 'walter@example.com', name: 'Walter' },
  { email: 'xavier@example.com', name: 'Xavier' },
  { email: 'yvonne@example.com', name: 'Yvonne' },
  { email: 'zara@example.com', name: 'Zara' },
  { email: 'leo@example.com', name: 'Leo' },
];

const categories = [
  { category_name: 'Fiction' },
  { category_name: 'Non-Fiction' },
  { category_name: 'Mystery' },
  { category_name: 'Fantasy' },
  { category_name: 'Science Fiction' },
  { category_name: 'Romance' },
  { category_name: 'Thriller' },
  { category_name: 'Historical Fiction' },
  { category_name: 'Biography' },
  { category_name: 'Self-Help' },
];

const books = [
  {
    book_name: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A novel about racial injustice in the Deep South.',
    no_of_copies: 10,
    available_copies: 10,
    categories: [1, 8], // Fiction, Historical Fiction
  },
  {
    book_name: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel about a totalitarian regime.',
    no_of_copies: 8,
    available_copies: 8,
    categories: [1, 5, 7], // Fiction, Science Fiction, Thriller
  },
  {
    book_name: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of the Jazz Age and the American Dream.',
    no_of_copies: 12,
    available_copies: 12,
    categories: [1, 8], // Fiction, Historical Fiction
  },
  {
    book_name: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A classic novel about love and societal expectations.',
    no_of_copies: 7,
    available_copies: 7,
    categories: [1, 6, 8], // Fiction, Romance, Historical Fiction
  },
  {
    book_name: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'An exploration of the history and impact of the human species.',
    no_of_copies: 5,
    available_copies: 5,
    categories: [2, 9], // Non-Fiction, Biography
  },
  {
    book_name: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'A novel about the infinite possibilities of life choices.',
    no_of_copies: 5,
    available_copies: 0, // Users must queue
    categories: [1, 6], // Fiction, Romance
  },
  {
    book_name: 'Atomic Habits',
    author: 'James Clear',
    description: 'A guide on how small habits lead to remarkable results.',
    no_of_copies: 5,
    available_copies: 0, // Users must queue
    categories: [2, 10], // Non-Fiction, Self-Help
  },
  {
    book_name: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction epic about politics, religion, and survival.',
    no_of_copies: 4,
    available_copies: 0, // Users must queue
    categories: [1, 5], // Fiction, Science Fiction
  },
  {
    book_name: 'The Silent Patient',
    author: 'Alex Michaelides',
    description: 'A psychological thriller about a woman’s mysterious silence.',
    no_of_copies: 6,
    available_copies: 0, // Users must queue
    categories: [1, 7], // Fiction, Thriller
  },
  {
    book_name: 'Educated',
    author: 'Tara Westover',
    description: 'A memoir about growing up without formal education.',
    no_of_copies: 3,
    available_copies: 0, // Users must queue
    categories: [2, 9], // Non-Fiction, Biography
  },
];

const users = [
  {
    name: 'john',
    email: 'john@gmail.com',
    password: 'password', // Plain text password, will be hashed
    address: '123 Main St, Springfield',
    dob: new Date('1990-01-01'),
    role: 'user',
  },
  {
    name: 'mary',
    email: 'mary@gmail.com',
    password: 'password', // Plain text password, will be hashed
    address: '1 Boon Lay',
    dob: new Date('2000-01-01'),
    role: 'user',
  },
  {
    name: 'bruce',
    email: 'bruce@gmail.com',
    password: 'password', // Plain text password, will be hashed
    address: '2 Canberra',
    dob: new Date('2004-04-04'),
    role: 'user',
  },
  {
    name: 'test',
    email: 'test@gmail.com',
    password: 'password', // Plain text password, will be hashed
    address: '5 Canberra',
    dob: new Date('2004-04-05'),
    role: 'user',
  },
  {
    name: 'admin',
    email: 'admin@gmail.com',
    password: 'password', // Plain text password, will be hashed
    address: '456 Elm St, Metropolis',
    dob: new Date('1985-08-10'),
    role: 'admin',
  },
];

const reviews = [
  { book_id: 1, user_id: 1, rating: 5, review_text: 'A masterpiece!', posted_on: new Date('2022-05-15') },
  { book_id: 2, user_id: 2, rating: 4, review_text: 'A great read, but a bit too dark for me.', posted_on: new Date('2022-03-22') },
  { book_id: 3, user_id: 3, rating: 4, review_text: 'An American classic.', posted_on: new Date('2021-09-10') },
  { book_id: 1, user_id: 2, rating: 3, review_text: 'Good, but a bit slow-paced in the middle.', posted_on: new Date('2022-07-12') },
  { book_id: 4, user_id: 3, rating: 5, review_text: 'Amazing storyline and unforgettable characters!', posted_on: new Date('2020-11-02') },
  { book_id: 5, user_id: 1, rating: 2, review_text: 'The plot was weak, didn’t connect with me.', posted_on: new Date('2021-05-18') },
  { book_id: 2, user_id: 1, rating: 4, review_text: 'A great and thought-provoking book.', posted_on: new Date('2022-04-01') },
  { book_id: 3, user_id: 2, rating: 5, review_text: 'One of the best books I have read in a while.', posted_on: new Date('2020-06-15') },
  { book_id: 4, user_id: 1, rating: 3, review_text: 'Interesting but not as gripping as I expected.', posted_on: new Date('2021-03-10') },
  { book_id: 5, user_id: 3, rating: 4, review_text: 'Very informative and well-written.', posted_on: new Date('2019-11-25') },
  { book_id: 1, user_id: 4, rating: 5, review_text: 'Life Changing Experience', posted_on: new Date('2018-11-25') },
];

// Seed Rent History
const rentHistory = [
  { book_id: 1, user_id: 1, start_date: new Date('2021-06-15'), end_date: new Date('2021-07-15'), return_date: new Date('2021-07-18'), due_status: true },
  { book_id: 2, user_id: 2, start_date: new Date('2020-03-10'), end_date: new Date('2020-04-10'), return_date: new Date('2020-04-08'), due_status: false },
  { book_id: 3, user_id: 3, start_date: new Date('2019-05-20'), end_date: new Date('2019-06-20'), return_date: new Date('2019-06-25'), due_status: true },
  { book_id: 4, user_id: 2, start_date: new Date('2021-08-01'), end_date: new Date('2021-09-01'), return_date: new Date('2021-09-05'), due_status: true },
  { book_id: 5, user_id: 3, start_date: new Date('2022-03-05'), end_date: new Date('2022-04-05'), return_date: new Date('2022-04-02'), due_status: false },
  { book_id: 1, user_id: 2, start_date: new Date('2021-11-15'), end_date: new Date('2021-12-15'), return_date: new Date('2021-12-12'), due_status: false },
  { book_id: 2, user_id: 3, start_date: new Date('2020-01-15'), end_date: new Date('2020-02-15'), return_date: new Date('2020-02-16'), due_status: true },
  { book_id: 3, user_id: 1, start_date: new Date('2021-06-20'), end_date: new Date('2021-07-20'), return_date: new Date('2021-07-18'), due_status: false },
  { book_id: 4, user_id: 1, start_date: new Date('2022-02-25'), end_date: new Date('2022-03-25'), return_date: new Date('2022-03-22'), due_status: false },
  { book_id: 5, user_id: 2, start_date: new Date('2022-01-01'), end_date: new Date('2022-02-01'), return_date: new Date('2022-01-30'), due_status: false },
  { book_id: 2, user_id: 1, start_date: new Date('2019-07-15'), end_date: new Date('2019-08-15'), return_date: new Date('2019-08-10'), due_status: false },
  { book_id: 4, user_id: 3, start_date: new Date('2020-05-01'), end_date: new Date('2020-06-01'), return_date: new Date('2020-06-05'), due_status: true },
  { book_id: 3, user_id: 2, start_date: new Date('2020-09-10'), end_date: new Date('2020-10-10'), return_date: new Date('2020-10-05'), due_status: false },
  { book_id: 1, user_id: 3, start_date: new Date('2021-03-15'), end_date: new Date('2021-04-15'), return_date: new Date('2021-04-12'), due_status: false },
  { book_id: 5, user_id: 1, start_date: new Date('2021-10-20'), end_date: new Date('2021-11-20'), return_date: new Date('2021-11-22'), due_status: true },
  { book_id: 2, user_id: 2, start_date: new Date('2022-04-05'), end_date: new Date('2022-05-05'), return_date: new Date('2022-05-03'), due_status: false },
  { book_id: 4, user_id: 3, start_date: new Date('2022-06-01'), end_date: new Date('2022-07-01'), return_date: new Date('2022-07-02'), due_status: true },
  { book_id: 3, user_id: 1, start_date: new Date('2022-08-10'), end_date: new Date('2022-09-10'), return_date: new Date('2022-09-12'), due_status: true },
  { book_id: 5, user_id: 2, start_date: new Date('2022-10-01'), end_date: new Date('2022-11-01'), return_date: new Date('2022-11-05'), due_status: true },
  { book_id: 1, user_id: 3, start_date: new Date('2023-01-05'), end_date: new Date('2023-02-05'), return_date: new Date('2023-02-02'), due_status: false },
  { book_id: 1, user_id: 4, start_date: new Date('2021-06-15'), end_date: new Date('2021-07-15'), return_date: new Date('2021-07-14'), due_status: false },
];

// Seed Book Requests
const bookRequests = [
  { user_id: 1, author: 'Harper Lee', book_name: 'To Kill a Mockingbird', requested_on: new Date('2022-05-10') },
  { user_id: 2, author: 'George Orwell', book_name: '1984', requested_on: new Date('2021-11-20') },
  { user_id: 3, author: 'F. Scott Fitzgerald', book_name: 'The Great Gatsby', requested_on: new Date('2020-06-15') },
  { user_id: 1, author: 'J.K. Rowling', book_name: 'Harry Potter and the Sorcerer\'s Stone', requested_on: new Date('2021-07-25') },
  { user_id: 2, author: 'Jane Austen', book_name: 'Pride and Prejudice', requested_on: new Date('2019-04-10') },
  { user_id: 3, author: 'Yuval Noah Harari', book_name: 'Sapiens', requested_on: new Date('2021-02-05') },
  { user_id: 1, author: 'J.R.R. Tolkien', book_name: 'The Hobbit', requested_on: new Date('2022-08-15') },
  { user_id: 2, author: 'J.R.R. Tolkien', book_name: 'The Lord of the Rings', requested_on: new Date('2021-05-30') },
  { user_id: 3, author: 'Dan Brown', book_name: 'The Da Vinci Code', requested_on: new Date('2020-03-12') },
  { user_id: 1, author: 'Stephen King', book_name: 'It', requested_on: new Date('2021-09-01') },
];

const messages = [
  { userId: 1, sender: 'user', message: 'Hello, I need help with borrowing a book.', createdAt: new Date('2023-12-01T10:00:00Z') },
  { userId: 1, sender: 'admin', message: 'Sure! What book are you looking for?', createdAt: new Date('2023-12-01T10:05:00Z') },
  { userId: 2, sender: 'user', message: 'Can I return a book after the due date?', createdAt: new Date('2023-12-02T15:30:00Z') },
  { userId: 2, sender: 'admin', message: 'Yes, but there might be a late fee.', createdAt: new Date('2023-12-02T15:35:00Z') },
  { userId: 3, sender: 'user', message: 'Do you have any recommendations for mystery books?', createdAt: new Date('2023-12-03T18:00:00Z') },
  { userId: 3, sender: 'admin', message: 'Yes! You might like "Gone Girl" or "Sherlock Holmes".', createdAt: new Date('2023-12-03T18:10:00Z') },
  { userId: 1, sender: 'user', message: 'How do I reset my password?', createdAt: new Date('2023-12-04T09:45:00Z') },
  { userId: 1, sender: 'admin', message: 'Go to settings and click on "Reset Password".', createdAt: new Date('2023-12-04T09:50:00Z') },
];

const queues = [
  // 📌 January 2024
  { id: 1, user_id: 1, book_id: 6, queue_number: 1, is_next: true, created_at: new Date('2024-01-05T10:00:00Z') },
  { id: 2, user_id: 2, book_id: 6, queue_number: 2, is_next: false, created_at: new Date('2024-01-07T10:00:00Z') },
  { id: 3, user_id: 3, book_id: 7, queue_number: 1, is_next: true, created_at: new Date('2024-01-10T10:00:00Z') },
  { id: 4, user_id: 4, book_id: 7, queue_number: 2, is_next: false, created_at: new Date('2024-01-15T10:00:00Z') },

  // 📌 February 2024
  { id: 5, user_id: 1, book_id: 8, queue_number: 1, is_next: true, created_at: new Date('2024-02-05T10:00:00Z') },
  { id: 6, user_id: 2, book_id: 8, queue_number: 2, is_next: false, created_at: new Date('2024-02-08T10:00:00Z') },
  { id: 7, user_id: 3, book_id: 9, queue_number: 1, is_next: true, created_at: new Date('2024-02-12T10:00:00Z') },
  { id: 8, user_id: 4, book_id: 9, queue_number: 2, is_next: false, created_at: new Date('2024-02-18T10:00:00Z') },

  // 📌 March 2024
  { id: 9, user_id: 1, book_id: 10, queue_number: 1, is_next: true, created_at: new Date('2024-03-02T10:00:00Z') },
  { id: 10, user_id: 2, book_id: 10, queue_number: 2, is_next: false, created_at: new Date('2024-03-08T10:00:00Z') },
  { id: 11, user_id: 3, book_id: 6, queue_number: 3, is_next: false, created_at: new Date('2024-03-15T10:00:00Z') },
  { id: 12, user_id: 4, book_id: 7, queue_number: 3, is_next: false, created_at: new Date('2024-03-20T10:00:00Z') },

  // 📌 April 2024
  { id: 13, user_id: 1, book_id: 8, queue_number: 3, is_next: false, created_at: new Date('2024-04-05T10:00:00Z') },
  { id: 14, user_id: 2, book_id: 9, queue_number: 3, is_next: false, created_at: new Date('2024-04-12T10:00:00Z') },
  { id: 15, user_id: 3, book_id: 10, queue_number: 3, is_next: false, created_at: new Date('2024-04-18T10:00:00Z') },

  // 📌 May 2024
  { id: 16, user_id: 1, book_id: 6, queue_number: 4, is_next: false, created_at: new Date('2024-05-05T10:00:00Z') },
  { id: 17, user_id: 2, book_id: 7, queue_number: 4, is_next: false, created_at: new Date('2024-05-10T10:00:00Z') },
  { id: 18, user_id: 3, book_id: 8, queue_number: 4, is_next: false, created_at: new Date('2024-05-15T10:00:00Z') },
  { id: 19, user_id: 4, book_id: 9, queue_number: 4, is_next: false, created_at: new Date('2024-05-20T10:00:00Z') },
];


const queueHistory = [
  // 📌 January 2024
  { id: 1, queue_id: 1, user_id: 1, book_id: 6, status: "Fulfilled", timestamp: new Date('2024-01-06T10:00:00Z') },
  { id: 2, queue_id: 2, user_id: 2, book_id: 6, status: "Pending", timestamp: new Date('2024-01-07T10:00:00Z') },
  { id: 3, queue_id: 3, user_id: 3, book_id: 7, status: "Fulfilled", timestamp: new Date('2024-01-12T10:00:00Z') },
  { id: 4, queue_id: 4, user_id: 4, book_id: 7, status: "Cancelled", timestamp: new Date('2024-01-15T10:00:00Z') },

  // 📌 February 2024
  { id: 5, queue_id: 5, user_id: 1, book_id: 8, status: "Pending", timestamp: new Date('2024-02-05T10:00:00Z') },
  { id: 6, queue_id: 6, user_id: 2, book_id: 8, status: "Pending", timestamp: new Date('2024-02-08T10:00:00Z') },
  { id: 7, queue_id: 7, user_id: 3, book_id: 9, status: "Fulfilled", timestamp: new Date('2024-02-14T10:00:00Z') },
  { id: 8, queue_id: 8, user_id: 4, book_id: 9, status: "Cancelled", timestamp: new Date('2024-02-18T10:00:00Z') },

  // 📌 March 2024
  { id: 9, queue_id: 9, user_id: 1, book_id: 10, status: "Pending", timestamp: new Date('2024-03-02T10:00:00Z') },
  { id: 10, queue_id: 10, user_id: 2, book_id: 10, status: "Pending", timestamp: new Date('2024-03-08T10:00:00Z') },
  { id: 11, queue_id: 11, user_id: 3, book_id: 6, status: "Cancelled", timestamp: new Date('2024-03-15T10:00:00Z') },
  { id: 12, queue_id: 12, user_id: 4, book_id: 7, status: "Fulfilled", timestamp: new Date('2024-03-20T10:00:00Z') },

  // 📌 April 2024
  { id: 13, queue_id: 13, user_id: 1, book_id: 8, status: "Pending", timestamp: new Date('2024-04-05T10:00:00Z') },
  { id: 14, queue_id: 14, user_id: 2, book_id: 9, status: "Cancelled", timestamp: new Date('2024-04-12T10:00:00Z') },
  { id: 15, queue_id: 15, user_id: 3, book_id: 10, status: "Pending", timestamp: new Date('2024-04-18T10:00:00Z') },

  // 📌 May 2024
  { id: 16, queue_id: 16, user_id: 1, book_id: 6, status: "Pending", timestamp: new Date('2024-05-05T10:00:00Z') },
  { id: 17, queue_id: 17, user_id: 2, book_id: 7, status: "Pending", timestamp: new Date('2024-05-10T10:00:00Z') },
  { id: 18, queue_id: 18, user_id: 3, book_id: 8, status: "Fulfilled", timestamp: new Date('2024-05-15T10:00:00Z') },
  { id: 19, queue_id: 19, user_id: 4, book_id: 9, status: "Cancelled", timestamp: new Date('2024-05-20T10:00:00Z') },
];



const penalty_fee_data = [
  { rent_history_id: 1, user_id: 1, fees: 15, status: false, paid_on: null },
  { rent_history_id: 18, user_id: 1, fees: 10, status: true, paid_on: new Date('2022-12-12')},
];

const userStatuses = [];

async function main() {

  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 10); // Hash password with 10 salt rounds
  }

  // Seed Statuses
  const insertedStatuses = await prisma.status.createManyAndReturn({
    data: statuses,
  });

  const insertedPersons = await prisma.person.createManyAndReturn({
    data: persons,
  });

  const insertedUsers = await prisma.users.createManyAndReturn({
    data: users,
  });

  // Insert Messages
  const insertedMessages = await prisma.message.createMany({
    data: messages,
  });
  
  const insertedTasks = await prisma.task.createManyAndReturn({
    data: [
      { name: 'Seed 1', statusId: insertedStatuses[0].id },
      { name: 'Seed 2', statusId: insertedStatuses[1].id },
    ],
  });

  await prisma.taskAssignment.createMany({
    data: [
      { personId: insertedPersons[0].id, taskId: insertedTasks[0].id },
      { personId: insertedPersons[1].id, taskId: insertedTasks[0].id },
      { personId: insertedPersons[2].id, taskId: insertedTasks[1].id },
      { personId: insertedPersons[3].id, taskId: insertedTasks[1].id },
    ],
  });

  const insertedCategories = await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,   // Avoid inserting duplicates if they already exist
  });

  const insertedBooks = [];
  for (const book of books) {
    const insertedBook = await prisma.book.create({
      data: {
        book_name: book.book_name,
        author: book.author,
        description: book.description,
        no_of_copies: book.no_of_copies,
        available_copies: book.available_copies,
      },
    });

    insertedBooks.push(insertedBook);

    // Insert Book-Category Links
    const bookCategories = book.categories.map(categoryId => ({
      book_id: insertedBook.id,
      category_id: categoryId,
    }));

    await prisma.book_category.createMany({
      data: bookCategories,
    });
  }

  // Map user_status data to the inserted user IDs
  insertedUsers.forEach(user => {
    userStatuses.push({
      user_id: user.id,
      reputation: 100,
      current_book_count: 0,
      max_book_count: 4,
    });
  });

  const insertedUserStatuses = await prisma.user_status.createMany({
    data: userStatuses,
  });

  const insertedReviews = await prisma.review.createMany({
    data: reviews,
  });

  // Insert Rent History
  const insertedRent_history = await prisma.rent_history.createMany({
    data: rentHistory,
  });

  const insertedPenalty_fees = await prisma.penalty_fees.createMany({
    data: penalty_fee_data,
  });

  // Insert Book Requests
  const insertedBook_request = await prisma.book_request.createMany({
    data: bookRequests,
  });

   // Insert Queue Data
  const insertedQueues = await prisma.queue.createMany({
    data: queues,
  });

  // Insert Queue History Data
  const insertedQueueHistory = await prisma.queueHistory.createMany({
    data: queueHistory,
  });
  console.log('Inserted reviews:', insertedReviews);
  console.log('Seed data inserted successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
