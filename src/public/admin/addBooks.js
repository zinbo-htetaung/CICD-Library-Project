document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);


  const bookName = urlParams.get("bookName");
  const author = urlParams.get("author");


  if (bookName) document.getElementById("bookName").value = decodeURIComponent(bookName);
  if (author) document.getElementById("author").value = decodeURIComponent(author);
    fetch('admin_navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    })

    fetch('../footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
    })

});

document.getElementById('addBookForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const token = localStorage.getItem('token');

    // Get form values
    const bookName = document.getElementById('bookName').value;
    const author = document.getElementById('author').value;
    const description = document.getElementById('description').value;
    const copies = document.getElementById('copies').value;
  
    // Get selected categories
    const selectedCategories = [];
    for (let i = 1; i <= 10; i++) {
      const checkbox = document.getElementById(`category${i}`);
      if (checkbox.checked) {
        selectedCategories.push(parseInt(checkbox.value));
      }
    }
  
    // Check if at least one category is selected
    if (selectedCategories.length === 0) {
      alert('Please select at least one category.');
      return;
    }
  
    // Create request body
    const requestBody = {
      book_name: bookName,
      author,
      description,
      copies: parseInt(copies),
      category_id: selectedCategories,
    };
  
    try {
      const response = await fetch('/api/books/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(requestBody),
      });
  
      const responseData = await response.json();
  
      if (response.status === 200) {
        alert(responseData.message);
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('An error occurred while adding the book.');
    }
  });
  