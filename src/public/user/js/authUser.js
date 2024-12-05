// Check if token exists in local storage
if (localStorage.getItem('token')) {
    if (localStorage.getItem('role') !== 'user') {   
        alert("Access Not Granted!");
        window.location.href = '../../general/login.html'; 
    }
} else {
    alert("Please log in to access these webpages");
    window.location.href = '../../general/login.html';   
}

function logout() {
    localStorage.clear();
    alert("Logged out successfully!");
    window.location.href = '../../general/login.html';
};
window.logout = logout;