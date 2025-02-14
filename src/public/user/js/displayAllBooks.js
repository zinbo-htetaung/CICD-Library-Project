async function fetchBooks() {
  // Load the admin navbar
  fetch('../html/user_navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;

      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', logout);
      }
    });

    fetch('../../footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-container').innerHTML = data;
  })

  // Fetch all books by default
  try {
    const response = await fetch('/api/books', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const container = document.getElementById('bookCardsContainer');
    container.innerHTML = ''; // Clear existing content

    if (response.status === 200) {
      const responseData = await response.json();
      const books = responseData.books;
      displayBooks(books);
    } else if (response.status === 400) {
      const responseData = await response.json();
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-danger';
      alertDiv.setAttribute('role', 'alert');
      alertDiv.innerText = responseData.message;
      container.appendChild(alertDiv);
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    const container = document.getElementById('bookCardsContainer');
    container.innerHTML = ''; // Clear existing content
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerText = 'An error occurred while fetching books. Please try again later.';
    container.appendChild(alertDiv);
  }
}

// Display filtered books
async function filterBooks() {
  const filterTarget = document.getElementById('filterTarget').value;
  const filterKeyword = document.getElementById('filterKeyword').value.trim();

  if (!filterKeyword) {
    alert('Please enter a keyword to filter.');
    return;
  }

  try {
    const response = await fetch(`/api/books/${filterTarget}/${encodeURIComponent(filterKeyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const container = document.getElementById('bookCardsContainer');
    const filterMessage = document.getElementById('filterMessage');
    container.innerHTML = ''; // Clear existing content
    filterMessage.innerHTML = ''; // Clear existing filter message

    if (response.status === 200) {
      const responseData = await response.json();
      const books = responseData.books;

      // Display the filter message
      filterMessage.innerHTML = `<div class="alert alert-info">Showing results for "${filterKeyword}" (${filterTarget.replace('name', 'Name')})</div>`;
      displayBooks(books);
    } else if (response.status === 404) {
      const responseData = await response.json();
      filterMessage.innerHTML = `<div class="alert alert-danger" role="alert">${responseData.message}</div>`;
    }
  } catch (error) {
    console.error('Error fetching filtered books:', error);
    const filterMessage = document.getElementById('filterMessage');
    filterMessage.innerHTML = `<div class="alert alert-danger" role="alert">An error occurred while filtering books. Please try again later.</div>`;
  }
}

// Display books in cards
function displayBooks(books) {
  const container = document.getElementById('bookCardsContainer');
  container.innerHTML = ''; // Clear existing content

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-4';

    card.innerHTML = `
      <a href="displaySingleBook.html?bookId=${book.id}" class="card-link">
      <div class="card text-dark card-hover h-100">
          <div class="card-header"><h4>${book.book_name}</h4></div>
          <img src="../../images/book_cover.webp" class="card-img-top" alt="Book Image">
          <div class="card-body">
          <h5 class="card-title">By : ${book.author}</h5>
        </div>
      </div>
      </a>
    `;

    container.appendChild(card);
  });
}

// Add event listener to filter submit button
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();

  document.getElementById('filterSubmit').addEventListener('click', filterBooks);
});