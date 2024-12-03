document.addEventListener("DOMContentLoaded", async function () {
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
      });
  
    // Fetch user data
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('/api/users/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        const responseData = await response.json();
        const users = responseData.users;
        displayUsers(users);
      } else if (response.status === 404) {
        const responseData = await response.json();
        showAlert('warning', responseData.message);
      } else {
        const responseData = await response.json();
        showAlert('danger', responseData.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('danger', 'An error occurred while fetching users. Please try again later.');
    }
  });
  
  // Function to display users in the table
  function displayUsers(users) {
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = ''; // Clear any existing rows
  
    users.forEach(user => {
      const row = document.createElement('tr');
  
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.reputation}</td>
        <td>${user.currentBookCount}</td>
        <td>${user.maxBookCount}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
  
      userTableBody.appendChild(row);
    });
  }
  
  // Function to display a Bootstrap alert
  function showAlert(type, message) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `
      <div class="alert alert-${type}" role="alert">${message}</div>
    `;
  }
  
  // Function to delete a user
  async function deleteUser(userId) {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to delete this user?')) return;
  
    try {
      const response = await fetch(`/api/users/ban/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
  
      const responseData = await response.json();
  
      if (response.status === 200) {
        showAlert('success', responseData.message);
        window.location.reload();
      } else {
        showAlert('danger', responseData.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('danger', 'An error occurred while banning the user.');
    }
  }