document.addEventListener("DOMContentLoaded", async () => {
    // Load navbar and footer dynamically
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
        });

    // Form submission logic for sending emails
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        console.log(name, email, message);
        try {
            // Perform the POST request to send email
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Sending JSON data
                },
                body: JSON.stringify({ name, email, message }), // Stringify form data
            });

            if (response.ok) {
                // Show success message
                alert('Message sent successfully!');
                form.reset(); // Optionally clear the form after successful submission
            } else {
                // Extract error details from the server response
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error sending message. Please check your connection.');
        }
    });
});