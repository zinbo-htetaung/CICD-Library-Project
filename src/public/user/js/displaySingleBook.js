// function to get the book ID from the URL parameters
function getBookIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('bookId');

  // validate book id
  if (!bookId || isNaN(bookId) || parseInt(bookId) <= 0) {
    alert('Invalid book ID detected. Redirecting to previous page...');
    window.location.href = '../html/displayAllBooks.html';
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

    let availableCopiesStyle = book.available_copies === 0 ? "color: red;" : "";
    let queueInfo = "";
    let userId = localStorage.getItem("user_id");
    let userQueueId = null;

    if (book.available_copies === 0) {
      const queueData = await fetchQueueInfo(getBookIdFromURL());
      const userQueueEntry = queueData.queue.find(person => person.user_id == userId);
      userQueueId = userQueueEntry ? userQueueEntry.queue_id : null;
      
      queueInfo = `<div class="d-inline-flex align-items-center mb-2" data-bs-toggle="modal" data-bs-target="#queueModal" style="cursor: pointer;">
                      <p class="text-black font-bold fs-5 bg-white border border-danger border-3 rounded-circle d-flex justify-content-center align-items-center m-0" style="width: 30px; height: 30px;">
                        ${queueData.queue.length}
                      </p>
                      <p class="d-inline m-0 ms-2 text-decoration-underline">people in queue!</p>
                   </div>`;
      
      queueInfo += userQueueId
        ? `<p class='m-0'>Leave the queue now!</p><button type="button" class="btn btn-danger d-block" id="leaveQueueButton" data-queue-id="${userQueueId}">Leave Queue</button>`
        : `<p class="m-0">Join queue now before anyone else does!</p><button type="button" class="btn btn-primary d-block" id="joinQueueButton">Join Queue</button>`;
    }

    container.innerHTML = `
      <div class="card mb-4" id="bookDetailsCard">
        <div class="row g-0" id="innerBookDetails">
          <div class="col-md-8">
            <div class="card-body">
              <h2 class="card-title">${book.book_name}</h2>
              <h6 class="card-subtitle mb-2 text-muted">By: ${book.author}</h6><br>
              <p class="card-text"><strong>Description:</strong> ${book.description}</p>
              <p class="card-text"><strong>Total Copies:</strong> ${book.no_of_copies}</p>
              <p class="card-text" style="${availableCopiesStyle}"><strong>Available Copies:</strong> ${book.available_copies}${queueInfo}</p>
              <p class="card-text"><strong>Average Rating:</strong> ${averageRating}</p>
              <p class="card-text"><strong>Categories:</strong></p>
              <ul>${categoriesList}</ul>
            </div>
          </div>
          <div class="col-md-4 position-relative">
            <img src="../../images/book_cover.webp" class="img-fluid rounded-end" alt="Book Image">
            <div class="read-status-icon position-absolute top-0 end-0 p-2 m-1" id="iconContainer" title="${feedbackMessage}">
              ${statusIcon}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("joinQueueButton")?.addEventListener("click", async () => {
      await joinQueue(getBookIdFromURL());
    });
    
    document.getElementById("leaveQueueButton")?.addEventListener("click", async (event) => {
      const queueId = event.target.getAttribute("data-queue-id");
      if (queueId) {
        await leaveQueue(queueId);
      }
    });
  } catch (error) {
    console.error("Error displaying book details:", error);
  }
}

// Function to leave the queue using queue ID
async function leaveQueue(queueId) {
  try {
    const response = await fetch(`/api/queue`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ queueId })
    });
    if (response.ok) {
      alert('Successfully left the queue!');
      location.reload();
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to leave queue');
    }
  } catch (error) {
    console.error('Error leaving queue:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}




// Function to fetch queue information
async function fetchQueueInfo(bookId) {
  try {
    const response = await fetch(`/api/queue/${bookId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Queue data fetched successfully", data);
      return data;
    } else {
      console.error('Failed to fetch queue data');
      return { queue: [] };
    }
  } catch (error) {
    console.error('Error fetching queue data:', error);
    return { queue: [] };
  }
}


// Function to join the queue
async function joinQueue(bookId) {
  try {
    const response = await fetch(`/api/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ bookId })
    });
    if (response.ok) {
      alert('Successfully joined the queue!');
      location.reload();
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to join queue');
    }
  } catch (error) {
    console.error('Error joining queue:', error);
    alert('An unexpected error occurred. Please try again.');
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
  fetch('../html/user_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        })

  fetch('../../footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
    })

  const bookId = getBookIdFromURL();
  if (bookId) {
    fetchBookDetails(bookId);
  } else {
    alert('Invalid book ID detected. Redirecting to previous page...');
    window.location.href = '../html/displayAllBooks.html';
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

document.addEventListener("DOMContentLoaded", () => {
  const rentButton = document.getElementById("rentBook");
  const token = localStorage.getItem("token"); // Retrieve the user token from localStorage

  // Function to extract the book ID from the URL
  function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("bookId"); // Retrieve the "bookId" parameter from the URL
  }

  // Add click event listener to the "rentBook" button
  rentButton.addEventListener("click", async () => {
    try {
      const bookId = getBookIdFromURL(); // Fetch the book ID from the URL

      // Validate the presence of book ID and user token
      if (!bookId) {
        alert("Book ID is missing or invalid. Please check the URL and try again.");
        return;
      }

      if (!token) {
        alert("You are not logged in. Please log in to rent the book.");
        return;
      }

      // Make the API call to rent the book
      const response = await fetch("/api/books/rent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }), // Send the book ID as the payload
      });

      if (!response.ok) {
        const errorResponse = await response.json(); // Parse the error response
        throw new Error(errorResponse.error || "Failed to rent the book. Please try again.");
      }

      const result = await response.json();

      // Handle success response
      alert(`Book rented successfully! Rented Book: ${result.book.book_name || "N/A"}`);
      console.log("Rental Result:", result);
    } catch (error) {
      // Handle API errors or unexpected issues
      console.error("Error renting book:", error);
      alert(error.message || "An unexpected error occurred. Please try again.");
    }
  });
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

window.onload = function () {
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

document.addEventListener("DOMContentLoaded", async function () {
  const queueModal = document.getElementById("queueModal");

  queueModal.addEventListener("show.bs.modal", async function () {
    const bookId = getBookIdFromURL();
    const queueData = await fetchQueueInfo(bookId);
    const queueTableBody = document.getElementById("queueTableBody");

    queueTableBody.innerHTML = ""; // Clear previous data

    if (queueData.queue.length === 0) {
      queueTableBody.innerHTML = `<tr><td colspan="4" class="text-muted">No one in queue.</td></tr>`;
      return;
    }

    queueData.queue.forEach((person, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${person.user_name}</td>
          <td>${person.queue_number}</td>
          <td>${person.is_next ? '<span class="badge bg-success">Next</span>' : '<span class="badge bg-secondary">Waiting</span>'}</td>
        </tr>
      `;
      queueTableBody.insertAdjacentHTML("beforeend", row);
    });
  });
});
