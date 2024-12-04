document.addEventListener("DOMContentLoaded", async () => {

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
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message'); // Message placeholder

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Retrieve reCAPTCHA response
        const captchaResponse = grecaptcha.getResponse();

        // Check if CAPTCHA is completed
        if (!captchaResponse) {
            formMessage.style.display = 'block';
            formMessage.style.color = 'red';
            formMessage.innerHTML = '❌ CAPTCHA is required. Please verify you are not a robot.';
            return;
        }

        // Clear previous messages
        formMessage.innerHTML = '';

        try {
            // Perform the POST request to send email
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Sending JSON data
                },
                body: JSON.stringify({ name, email, message, 'g-recaptcha-response': captchaResponse }), // Include CAPTCHA response
            });

            if (response.ok) {
                // Show success message
                formMessage.style.display = 'block';
                formMessage.style.color = 'green';
                formMessage.innerHTML = '🎉 Your message has been sent successfully! We will get back to you shortly.';
                alert('🎉 Your message has been sent successfully! We will get back to you shortly.');
                form.reset(); // Clear form fields after successful submission
                grecaptcha.reset(); // Reset the reCAPTCHA widget
            } else {
                // Extract error details from the server response
                const errorData = await response.json();
                console.error('Server error:', errorData);

                // Show error message
                formMessage.style.display = 'block';
                formMessage.style.color = 'red';
                formMessage.innerHTML = `❌ Failed to send message. Error: ${errorData.error || 'Please try again.'}`;
            }
        } catch (error) {
            console.error('Network error:', error);

            // Show network error message
            formMessage.style.display = 'block';
            formMessage.style.color = 'red';
            formMessage.innerHTML = '❌ Network error. Please check your connection and try again.';
        }
    });
});