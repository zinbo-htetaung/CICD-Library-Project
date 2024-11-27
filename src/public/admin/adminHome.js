document.addEventListener("DOMContentLoaded", function () {
    fetch('admin_navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
    })
});