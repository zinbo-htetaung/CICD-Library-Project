// function to get the book ID from the URL parameters
function getBookIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('bookId');
  
    // validate book id
    if (!bookId || isNaN(bookId) || parseInt(bookId) <= 0) {
      alert('Invalid book ID detected. Redirecting to previous page...');
      window.location.href = 'displayAllBooks.html';
    }
  
    return bookId;
  }
  
  // function to fetch book details
  async function fetchBookDetails(bookId) {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const container = document.getElementById('bookDetailsContainer');
      container.innerHTML = '';   // clear existing content first
  
      if (response.status === 200) {
        const book = await response.json();
        displayBookDetails(book.book);
      } else if (response.status === 404) {
        const responseData = await response.json();
        displayAlert(responseData.message);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      displayAlert('An error occurred while fetching the book details.');
    }
  }
  
  // function to display book details
  function displayBookDetails(book) {
    const container = document.getElementById('bookDetailsContainer');

    const categoriesList = book.categories
    .map(category => `<li>${category}</li>`)
    .join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${book.book_name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">By: ${book.author}</h6>
          <p class="card-text"><strong>Description:</strong> ${book.description}</p>
          <p class="card-text"><strong>Total Copies:</strong> ${book.no_of_copies}</p>
          <p class="card-text"><strong>Available Copies:</strong> ${book.available_copies}</p>
          <p class="card-text"><strong>Categories:</strong></p>
          <ul>${categoriesList}</ul>
        </div>
        <a href="updateBookDetails.html?bookId=${book.id}" class="btn btn-secondary me-2">Update Book Details</a>
        <a href="updateBookCategory.html?bookId=${book.id}" class="btn btn-secondary me-2">Update Book Category</a>
        <a href="deleteBook.html?bookId=${book.id}" class="btn btn-secondary">Delete Book</a>
      </div>
    `;
}
  
// Function to display Bootstrap alert
function displayAlert(message) {
const container = document.getElementById('bookDetailsContainer');
container.innerHTML = `
    <div class="alert alert-danger" role="alert">
    ${message}
    </div>
`;
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('admin_navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
    })

  const bookId = getBookIdFromURL();
  if (bookId) {
      fetchBookDetails(bookId);
  } else {
    alert('Invalid book ID detected. Redirecting to previous page...');
        window.location.href = 'displayAllBooks.html';
  }
});
  