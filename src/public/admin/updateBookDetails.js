document.addEventListener('DOMContentLoaded', () => {
    // Load navbar
    fetch('admin_navbar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('navbar-container').innerHTML = data;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
          logoutButton.addEventListener('click', logout);
        }
      });

    fetch('../footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
    })
  
    // Get book ID from URL
    const bookId = getBookIdFromURL();
    if (bookId) {
      fetchBookDetails(bookId);
    }
  
    // Handle form submission
    document.getElementById('updateBookForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      updateBookDetails(bookId);
    });
  });
  
 // Function to get the book ID from the URL parameters
function getBookIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('bookId');
  
    // Validate book ID
    if (!bookId || isNaN(bookId) || parseInt(bookId) <= 0) {
      alert('Invalid book ID detected. Redirecting to the previous page...');
      window.location.href = 'displayAllBooks.html';
      return null;
    }
  
    return bookId;
  }
  
// Function to fetch book details and prefill the form
async function fetchBookDetails(bookId) {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        const book = await response.json();
        prefillForm(book.book);
      } else {
        const responseData = await response.json();
        alert(responseData.message);
        window.location.href = 'displayAllBooks.html';
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      alert('An error occurred while fetching book details.');
      window.location.href = 'displayAllBooks.html';
    }
  }
  
  // Function to prefill the form with existing book details
  function prefillForm(book) {
    document.getElementById('bookName').value = book.book_name;
    document.getElementById('author').value = book.author;
    document.getElementById('description').value = book.description;
    document.getElementById('copies').value = book.no_of_copies;
  }
  
  // Function to update book details
  async function updateBookDetails(bookId) {
    const token = localStorage.getItem('token');
  
    const updatedDetails = {
      book_name: document.getElementById('bookName').value,
      author: document.getElementById('author').value,
      description: document.getElementById('description').value,
      copies: parseInt(document.getElementById('copies').value, 10),
    };
  
    try {
      const response = await fetch(`/api/books/update/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDetails),
      });
  
      const responseData = await response.json();
      if (response.status === 200) {
        alert(responseData.message);
        window.location.href = 'displaySingleBook.html?bookId=' + bookId;
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      console.error('Error updating book details:', error);
      alert('An error occurred while updating the book.');
    }
}
  