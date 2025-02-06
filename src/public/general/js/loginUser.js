document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.status === 200) {
      const responseData = await response.json();
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('name', responseData.name);
      localStorage.setItem('user_id', responseData.user_id);
      localStorage.setItem('role', responseData.role);
      alert('Login successful!');
      if (responseData.role == "admin") {
        window.location.href = "../../admin/adminHome.html";
      } else
        window.location.href = '../../user/html/home.html';
    } else if (response.status === 400) {
      const responseData = await response.json();
      alert(responseData.message);
    } else {
      alert('Login attempt failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while trying to log in.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  fetch('../html/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;
    })

  fetch('../../footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
    })
});