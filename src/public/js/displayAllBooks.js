async function fetchBooks() {
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
      card.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
  
      card.innerHTML = `
        <div class="card">
            <div class="card-header"><h4>${book.book_name}</h4></div>
            <img src="./images/book_image.jpg" class="card-img-top" alt="Book Image">
            <div class="card-body">
            <h5 class="card-title">By: <strong>${book.author}</strong></h5>
            <a href="displaySingleBook.html?bookId=${book.id}" class="btn btn-primary">More</a>
          </div>
        </div>
      `;
  
      container.appendChild(card);
    });
  }

document.addEventListener('DOMContentLoaded', fetchBooks);
  