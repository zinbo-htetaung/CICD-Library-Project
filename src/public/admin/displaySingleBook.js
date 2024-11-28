// Function to get the book ID from the URL parameters
function getBookIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('bookId');

  // Validate book ID
  if (!bookId || isNaN(bookId) || parseInt(bookId) <= 0) {
    alert('Invalid book ID detected. Redirecting to the previous page...');
    window.location.href = 'displayAllBooks.html';
  }

  return bookId;
}

// Function to fetch book details
async function fetchBookDetails(bookId) {
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const container = document.getElementById('bookDetailsContainer');
    container.innerHTML = ''; // Clear existing content

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

// Function to display book details
function displayBookDetails(book) {
  const container = document.getElementById('bookDetailsContainer');

  const categoriesPills = book.categories
  .map(category => `<span class="badge bg-primary badge-category">${category}</span>`)
  .join('');

  container.innerHTML = `
    <div class="row">
      <div class="col-md-4 text-center">
        <img src="../images/book_image.jpg" alt="Book Image" class="img-fluid book-image">
      </div>
      <div class="col-md-8">
        <h3>${book.book_name}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Description:</strong> ${book.description}</p>
        <p><strong>No. of Copies:</strong> ${book.no_of_copies}</p>
        <p><strong>Available Copies:</strong> ${book.available_copies}</p>
        <p><strong>Categories:</strong> ${categoriesPills}</p>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-4">
        <a href="updateBookDetails.html?bookId=${book.id}" class="btn btn-primary btn-block btn-block-custom w-100">Update Book Details</a>
      </div>
      <div class="col-4">
        <button class="btn btn-secondary btn-block btn-block-custom w-100" data-bs-toggle="modal" data-bs-target="#updateCategoriesModal">Update Book Categories</button>
      </div>
      <div class="col-4">
        <button class="btn btn-danger btn-block btn-block-custom w-100" id="deleteBookBtn">Delete Book</button>
      </div>
    </div>
  `;

  document.getElementById('deleteBookBtn').addEventListener('click', () => deleteBook(book.id));
}

// Function to display a Bootstrap alert
function displayAlert(message) {
  const container = document.getElementById('bookDetailsContainer');
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      ${message}
    </div>
  `;
}

// Function to update categories
async function updateBookCategories(bookId) {
  const token = localStorage.getItem('token');
  const selectedCategories = [];
  for (let i = 1; i <= 10; i++) {
    const checkbox = document.getElementById(`category${i}`);
    if (checkbox.checked) {
      selectedCategories.push(parseInt(checkbox.value));
    }
  }

  try {
    const response = await fetch(`/api/books/update/category/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category_id: selectedCategories }),
    });

    const responseData = await response.json();
    alert(responseData.message);
    if (response.status === 200) {
      location.reload();
    }
  } catch (error) {
    console.error('Error updating categories:', error);
    alert('An error occurred while updating categories.');
  }
}

// Function to delete a book
async function deleteBook(bookId) {
  const token = localStorage.getItem('token');
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const response = await fetch(`/api/books/delete/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    alert(responseData.message);
    if (response.status === 200) {
      window.location.href = 'displayAllBooks.html';
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('An error occurred while deleting the book.');
  }
}

// Load the page
document.addEventListener('DOMContentLoaded', () => {
  fetch('admin_navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
          logoutButton.addEventListener('click', logout);
        }
    })

  const bookId = getBookIdFromURL();
  if (bookId) {
    fetchBookDetails(bookId);

    document.getElementById('updateCategoriesForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      updateBookCategories(bookId);
      const modal = bootstrap.Modal.getInstance(document.getElementById('updateCategoriesModal'));
      modal.hide();
    });
  }
});
