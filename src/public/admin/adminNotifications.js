document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    await loadNavbarAndFooter();

});

// Load Navbar and Footer
async function loadNavbarAndFooter() {
    try {
        const navbarHTML = await fetchHTML('admin_navbar.html');
        document.getElementById('navbar-container').innerHTML = navbarHTML;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', logout);

        const footerHTML = await fetchHTML('../footer.html');
        document.getElementById('footer-container').innerHTML = footerHTML;
    } catch (error) {
        console.error('Error loading navbar or footer:', error);
    }
}

// Fetch HTML Helper
async function fetchHTML(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch HTML from ${url}`);
    return await response.text();
}

