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

// Function to fetch reviews for the book
async function fetchReviews(bookId) {
  try {
    const response = await fetch(`/api/reviews/${bookId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayReviews(data.reviews);
    } else {
      console.error('Failed to fetch reviews');
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

// Function to fetch the average rating for a book using Promises
function fetchAverageRating(bookId) {
  return fetch(`/api/reviews/rating/${bookId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        console.error('Failed to fetch average rating');
        return 'N/A'; // Default value if fetch fails
      }
      return response.json();
    })
    .then(data => {
      return data.averageRating ? data.averageRating.toFixed(1) : 'N/A';
    })
    .catch(error => {
      console.error('Error fetching average rating:', error);
      return 'N/A'; // Default value in case of an error
    });
}

// Modified function to display book details
function displayBookDetails(book) {
  const container = document.getElementById('bookDetailsContainer');
  fetchAverageRating(getBookIdFromURL())
    .then(averageRating => {
      const categoriesList = book.categories
        .map((category) => `<li>${category}</li>`)
        .join('');

      container.innerHTML = `
              <div class="card">
                  <div class="card-body">
                      <h2 class="card-title">${book.book_name}</h2>
                      <h6 class="card-subtitle mb-2 text-muted">By: ${book.author}</h6><br>
                      <p class="card-text"><strong>Description:</strong> ${book.description}</p>
                      <p class="card-text"><strong>Total Copies:</strong> ${book.no_of_copies}</p>
                      <p class="card-text"><strong>Available Copies:</strong> ${book.available_copies}</p>
                      <p class="card-text"><strong>Average Rating:</strong> ${averageRating}</p>
                      <p class="card-text"><strong>Categories:</strong></p>
                      <ul>${categoriesList}</ul>
                  </div>
              </div>
          `;
    })
    .catch(error => {
      console.error('Error displaying book details:', error);
    });
}

// Function to display reviews in the modal
function displayReviews(reviews) {
  const reviewsContainer = document.getElementById('reviewsContainer');
  reviewsContainer.innerHTML = ''; // Clear existing content

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<p class="text-center">No reviews available for this book.</p>';
    return;
  }

  reviews.forEach(review => {
    const reviewCard = `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-circle me-2"></i>
              <strong>${review.review_owner || 'Anonymous'}</strong>
            </div>
            <span class="badge bg-primary">Rating Given: ${review.rating}</span>
          </div>
          <p class="mt-3">${review.review_text || 'No review text provided.'}</p>
          <small class="text-muted">Posted On: ${new Date(review.posted_on).toLocaleString()}</small>
        </div>
      </div>
    `;

    reviewsContainer.insertAdjacentHTML('beforeend', reviewCard);
  });
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
  fetch('navbar.html')
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

document.getElementById('displayReviews').addEventListener('click', () => {
  const bookId = getBookIdFromURL();
  fetchReviews(bookId);
});

document.getElementById('reviewForm').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form from submitting the traditional way
  const bookId = getBookIdFromURL();

  const rating = parseInt(document.getElementById('rating').value);
  const reviewText = document.getElementById('reviewText').value;

  // Clear any previous error messages
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = '';

  // Validate input
  if (isNaN(rating) || rating < 0 || rating > 5) {
    errorMessage.textContent = 'Please provide a valid rating between 0 and 5.';
    return;
  }

  if (!reviewText.trim()) {
    errorMessage.textContent = 'Please provide a review text.';
    return;
  }

  const token = localStorage.getItem('token');
  
  if(token == null || token == undefined) {
    errorMessage.textContent = 'Please login or create an account first to give a review.';
    return;
  }

  // Proceed with submitting the review
  const reviewData = { rating, reviewText };

  // Perform the review creation request
  fetch(`/api/reviews/${bookId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token'), 
    },
    body: JSON.stringify(reviewData),
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        // Display error message if there's an issue with submitting the review
        errorMessage.textContent = data.message;
      } else {
        // Successfully created review
        alert('Review submitted successfully!');
        document.getElementById('reviewForm').reset();
        $('#writeReviewModal').modal('hide');
      }
    })
    .catch(error => {
      // Handle any errors that occur during the fetch
      errorMessage.textContent = 'There was an error submitting your review. Please try again later.';
      console.error(error);
    });
});

window.onload = function() {
  const url = new URL(window.location.href);
  const hash = url.hash;

  // Check if the hash is '#writeReviewModal'
  if (hash === '#writeReviewModal') {
      // Assuming you're using Bootstrap modal
      const modal = document.getElementById('writeReviewModal');
      
      if (modal) {
          // Show the modal if it's hidden
          $(modal).modal('show');
      }
  }
};
