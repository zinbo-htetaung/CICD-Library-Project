// Fetch profile data from the backend
async function fetchProfileData() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("Authentication token missing. Please log in again.", "danger");
            return;
        }

        const response = await fetch('/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            displayProfile(data);
        } else {
            const errorData = await response.json();
            showAlert(errorData.message || "Failed to fetch profile data.", "danger");
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        showAlert("An error occurred while fetching profile data. Please try again later.", "danger");
    }
}

// Display the fetched profile data in the DOM
function displayProfile(data) {
    const profile = data.profile;

    // Update visible profile fields
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profileAddress').textContent = profile.address;
    document.getElementById('rentedBookCount').textContent = profile.rented_book_count;

    // Update profile picture
    const pfpImages = document.getElementsByClassName('pfpImg');
    Array.from(pfpImages).forEach(img => img.setAttribute('src', profile.avatar));

    // Pre-fill the update modal with current profile values
    document.getElementById('modalProfileName').value = profile.name;
    document.getElementById('modalProfileEmail').value = profile.email;
    document.getElementById('modalProfileAddress').value = profile.address;
}

// Show alert messages
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000); // Alert disappears after 5 seconds
}

// Add the navbar and footer dynamically
document.addEventListener('DOMContentLoaded', async function () {
    // Load navbar
    try {
        const navbarResponse = await fetch('../html/user_navbar.html');
        if (navbarResponse.ok) {
            const navbarHTML = await navbarResponse.text();
            document.getElementById('navbar-container').innerHTML = navbarHTML;

            // Add logout functionality
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        } else {
            console.error("Failed to load navbar.");
        }
    } catch (error) {
        console.error("Error loading navbar:", error);
    }

    // Load footer
    try {
        const footerResponse = await fetch('../../footer.html');
        if (footerResponse.ok) {
            const footerHTML = await footerResponse.text();
            document.getElementById('footer-container').innerHTML = footerHTML;
        } else {
            console.error("Failed to load footer.");
        }
    } catch (error) {
        console.error("Error loading footer:", error);
    }

    // Fetch and display profile data
    fetchProfileData();
});
