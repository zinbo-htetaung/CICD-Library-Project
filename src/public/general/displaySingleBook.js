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

// Function to check if the user has read the book
async function fetchReadStatus(bookId) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/api/reviews/checkReadStatus/${bookId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const readStatus = data.status;
      console.log(data);
      console.log(readStatus);
      return readStatus;
    } else {
      console.error('Failed to fetch read status');
    }
  } catch (error) {
    console.error('Error fetching read status:', error);
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

// Function to fetch filtered reviews for the book
async function fetchFilteredReviews() {
  const bookId = getBookIdFromURL();
  if (!bookId) return;

  const reviewType = document.getElementById('reviewType').value;
  const ratingFilter = document.getElementById('ratingFilter').value;
  const ratingOrder = document.getElementById('ratingOrder').value;
  const dateFilter = document.getElementById('dateFilter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  let userId = localStorage.getItem("user_id");

  if (!userId) {
    userId = 0;
  }

  // Set up query parameters
  const queryParams = new URLSearchParams({
    reviewType,
    rating: ratingFilter,
    ratingOrder,
    dateOrder: dateFilter,
    startDate,
    endDate,
    userId,
  });

  try {
    const response = await fetch(`/api/reviews/${bookId}/filter?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch filtered reviews: ${response.status}`);
    }

    const data = await response.json();
    displayReviews(data.reviews);
  } catch (error) {
    console.error('Error fetching filtered reviews:', error.message);
    displayAlert('Error fetching filtered reviews. Please try again later.');
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
async function displayBookDetails(book) {
  const container = document.getElementById('bookDetailsContainer');
  try {
    const averageRating = await fetchAverageRating(getBookIdFromURL());
    const categoriesList = book.categories
      .map((category) => `<li>${category}</li>`)
      .join('');

    const readStatus = await fetchReadStatus(getBookIdFromURL());

    console.log(readStatus);

    let statusIcon = '';
    let feedbackMessage = '';
    switch (readStatus) {
      case "not_read":
        statusIcon = '<i class="bi bi-book"></i>';
        feedbackMessage = "You have not rented or read this book before.";
        break;
      case "reading":
        statusIcon = '<i class="bi bi-book-half"></i>';
        feedbackMessage = "You are renting and reading this book.";
        break;
      case "read":
        statusIcon = '<i class="bi bi-book-fill"></i>';
        feedbackMessage = "You have rented and read this book before.";
        break;
      default:
        statusIcon = '<i class="bi bi-question-lg"></i>';
        feedbackMessage = "User is not logged in.";
    }

    container.innerHTML = `
      <div class="card mb-4" id ="bookDetailsCard">
        <div class="row g-0" id="innerBookDetails">
          <div class="col-md-8">
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
          <div class="col-md-4 position-relative">
            <img src="../images/book_cover.webp" class="img-fluid rounded-end" alt="Book Image">
            <div class="read-status-icon position-absolute top-0 end-0 p-2 m-1" id="iconContainer" title="${feedbackMessage}">
              ${statusIcon}
            </div>
          </div>
        </div>
      </div>
    `;

    const iconContainer = document.getElementById('iconContainer');
    iconContainer.addEventListener('mouseover', () => {
      const tooltip = document.createElement('div');
      tooltip.id = 'statusTooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px 10px';
      tooltip.style.borderRadius = '5px';
      tooltip.style.top = `${iconContainer.offsetTop - 30}px`;
      tooltip.style.left = `${iconContainer.offsetLeft}px`;
      tooltip.textContent = feedbackMessage;
      container.appendChild(tooltip);
    });

    iconContainer.addEventListener('mouseout', () => {
      const tooltip = document.getElementById('statusTooltip');
      if (tooltip) tooltip.remove();
    });

  } catch (error) {
    console.error("Error displaying book details:", error);
  }
}

// Function to display reviews in the modal
function displayReviews(reviews) {
  const reviewsContainer = document.getElementById('reviewsContainer');
  reviewsContainer.innerHTML = '';

  let currentUserId = localStorage.getItem("user_id");

  if (!currentUserId) {
    currentUserId = 0;
  }

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<p class="text-center">No reviews available for this book.</p>';
    return;
  }

  reviews.forEach(review => {
    const stars = generateStars(review.rating);

    const isCurrentUserReview = review.user_id == currentUserId;
    
    const reviewCard = `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-circle me-2"></i>
              <strong>${review.review_owner || 'Anonymous'}</strong>
            </div>
            <span class="badge" style="background-color: #6b98db; color: white;">Rating Given: ${stars}</span>
          </div>
          <p class="mt-3">${review.review_text || 'No review text provided.'}</p>
          <small class="text-muted">Posted On: ${new Date(review.posted_on).toLocaleString()}</small>
          ${isCurrentUserReview
        ? `<div class="d-flex justify-content-end mt-3">
                  <button class="btn btn-outline-primary btn-md me-2 update-review-btn" data-review-id="${review.id}">Edit</button>
                  <button class="btn btn-outline-danger btn-md delete-review-btn" data-review-id="${review.id}">Delete</button>
                </div>`
        : ''
      }
        </div>
      </div>
    `;

    reviewsContainer.insertAdjacentHTML('beforeend', reviewCard);
  });

  attachButtonHandlers();
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

// Helper function to generate star icons
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="bi bi-star-fill text-warning"></i>';
    } else {
      stars += '<i class="bi bi-star text-warning"></i>';
    }
  }
  return stars;
}

// Attach event handlers to buttons
function attachButtonHandlers() {
  // Update review button handler
  document.querySelectorAll('.update-review-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const reviewId = event.target.dataset.reviewId;
      const newRating = prompt("Enter new rating (1-5):");
      const newReviewText = prompt("Enter new review text:");

      if (newRating && newReviewText) {
        updateReview(reviewId, newRating, newReviewText);
      }
    });
  });

  // Delete review button handler
  document.querySelectorAll('.delete-review-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const reviewId = event.target.dataset.reviewId;

      if (confirm("Are you sure you want to delete this review?")) {
        deleteReview(reviewId);
      }
    });
  });
}

// Make a PUT request to update the review
function updateReview(reviewId, rating, reviewText) {
  fetch(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ rating, reviewText })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
        location.reload();
      }
    })
    .catch(error => console.error('Error updating review:', error));
}

// Make a DELETE request to delete the review
function deleteReview(reviewId) {
  fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
        location.reload();
      }
    })
    .catch(error => console.error('Error deleting review:', error));
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
  event.preventDefault();
  const bookId = getBookIdFromURL();

  const rating = parseInt(document.getElementById('rating').value);
  const reviewText = document.getElementById('reviewText').value;

  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = '';

  if (isNaN(rating) || rating < 0 || rating > 5) {
    errorMessage.textContent = 'Please provide a valid rating between 0 and 5.';
    return;
  }

  if (!reviewText.trim()) {
    errorMessage.textContent = 'Please provide a review text.';
    return;
  }

  const token = localStorage.getItem('token');

  if (token == null || token == undefined) {
    errorMessage.textContent = 'Please login or create an account first to give a review.';
    return;
  }
  const reviewData = { rating, reviewText };

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

 // Get today's date in YYYY-MM-DD format
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').setAttribute('max', today);
  document.getElementById('endDate').setAttribute('max', today);
});

// Update the min attribute of end date based on start date selection
document.getElementById('startDate').addEventListener('change', function () {
  const startDateValue = this.value;
  document.getElementById('endDate').setAttribute('min', startDateValue);
  if (startDateValue) {
    document.getElementById('endDate').value = '';
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const dateFilter = document.getElementById("dateFilter");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");

  const ratingFilter = document.getElementById("ratingFilter");
  const ratingOrder = document.getElementById("ratingOrder");

  const reviewType = document.getElementById("reviewType");

  const initializeFilterDefaults = () => {
    reviewType.value = "all";
    ratingFilter.value = "";
    ratingOrder.value = "";
    dateFilter.value = "";
    startDate.value = "";
    endDate.value = "";

    // const today = new Date().toISOString().split("T")[0];
    // startDate.setAttribute("max", today);
    // endDate.setAttribute("max", today);
  };

  // Functions to handle mutual exclusivity
  const handleDateFilterChange = () => {
    const dateSortSelected = dateFilter.value !== "";
    startDate.disabled = dateSortSelected;
    endDate.disabled = dateSortSelected;
    if (dateSortSelected) {
      startDate.value = "";
      endDate.value = "";
    }
  };

  const handleDateRangeChange = () => {
    const dateRangeSelected = startDate.value !== "" || endDate.value !== "";
    dateFilter.disabled = dateRangeSelected;
    if (dateRangeSelected) {
      dateFilter.value = "";
    }
  };

  const handleRatingFilterChange = () => {
    const ratingSortSelected = ratingOrder.value !== "";
    ratingFilter.disabled = ratingSortSelected;
    if (ratingSortSelected) {
      ratingFilter.value = "";
    }
  };

  const handleRatingSortChange = () => {
    const ratingFilterSelected = ratingFilter.value !== "";
    ratingOrder.disabled = ratingFilterSelected;
    if (ratingFilterSelected) {
      ratingOrder.value = "";
    }
  };

  // Attach event listeners for mutual exclusivity
  dateFilter.addEventListener("change", handleDateFilterChange);
  startDate.addEventListener("change", handleDateRangeChange);
  endDate.addEventListener("change", handleDateRangeChange);

  ratingOrder.addEventListener("change", handleRatingFilterChange);
  ratingFilter.addEventListener("change", handleRatingSortChange);

  // Initialize filter defaults when modal is shown
  const reviewsModal = document.getElementById("reviewsModal");
  reviewsModal.addEventListener("show.bs.modal", initializeFilterDefaults);

  // Attach an event listener to the "Apply Filters" button
  document.getElementById("applyFilters").addEventListener("click", (event) => {
    event.preventDefault();
    fetchFilteredReviews();
  });
});