const prisma = require('../src/models/prismaClient');

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
];

async function main() {
  // Seed Statuses

  const insertedStatuses = await prisma.status.createManyAndReturn({
    data: statuses,
  });

  const insertedPersons = await prisma.person.createManyAndReturn({
    data: persons,
  });

  console.log(insertedPersons, insertedStatuses);

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
