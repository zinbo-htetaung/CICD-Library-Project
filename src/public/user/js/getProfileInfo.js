async function fetchProfileData() {
    try {
        const response = await fetch('/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            console.log(data);
            displayProfile(data);
        } else {
            const data = await response.json();
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        showAlert('An error occurred while fetching profile data. Please try again later.', 'danger');
    }
}

function displayProfile(data) {
    // Update text content of fields
    document.getElementById('profileName').textContent = data.profile.name;
    document.getElementById('profileEmail').textContent = data.profile.email;
    document.getElementById('profileAddress').textContent = data.profile.address;
    document.getElementById('rentedBookCount').textContent = data.profile.rented_book_count;

    // Pre-fill modal input fields
    document.getElementById('modalProfileName').value = data.profile.name;
    document.getElementById('modalProfileEmail').value = data.profile.email;
    document.getElementById('modalProfileAddress').value = data.profile.address;
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerText = message;
    document.body.prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000); // Remove alert after 5 seconds
}


// Run fetchProfileData as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
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

    fetchProfileData();
});
