document.addEventListener("DOMContentLoaded", function () {
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