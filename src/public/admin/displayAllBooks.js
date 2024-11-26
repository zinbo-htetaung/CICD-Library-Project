async function fetchBooks() {
  fetch('admin_navbar.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('navbar-container').innerHTML = data;

      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
          logoutButton.addEventListener('click', logout);
      }
  })

    try {
      const response = await fetch('/api/books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const container = document.getElementById('bookCardsContainer');
      container.innerHTML = '';         // clear existing content first
  
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
      container.innerHTML = '';     // clear existing content first
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-danger';
      alertDiv.setAttribute('role', 'alert');
      alertDiv.innerText = 'An error occurred while fetching books. Please try again later.';
      container.appendChild(alertDiv);
    }
  }
  
  function displayBooks(books) {
    const container = document.getElementById('bookCardsContainer');
    container.innerHTML = '';       // clear existing content first
  
    books.forEach(book => {
      const card = document.createElement('div');
      card.className = 'col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-4';
  
      card.innerHTML = `
        <a href="displaySingleBook.html?bookId=${book.id}" class="card-link">
        <div class="card text-dark card-hover">
            <div class="card-header"><h4>${book.book_name}</h4></div>
            <img src="../images/book_image.jpg" class="card-img-top" alt="Book Image">
            <div class="card-body">
            <h5 class="card-title">By : ${book.author}</h5>
          </div>
        </div>
        </a>
      `;
  
      container.appendChild(card);
    });
  }

document.addEventListener('DOMContentLoaded', fetchBooks);
  