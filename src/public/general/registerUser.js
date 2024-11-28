    document.getElementById('registerForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const address = document.getElementById('address').value;
      const dob = document.getElementById('dob').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      try {
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password, address, dob })
        });

        const responseData = await response.json();

        if (response.status === 201) {
          alert(`${responseData.message} Please log into your account.`);
          window.location.href = 'login.html';
        } else {
          alert(responseData.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration. Please try again later.');
      }
    });

document.addEventListener('DOMContentLoaded', () => {
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
    })  
});