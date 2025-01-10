// Check if token exists in local storage
if (localStorage.getItem('token')) {
    if (localStorage.getItem('role') !== 'admin') { 
        alert("Access Not Granted!");
        window.location.href ='/user/html/home.html'  ; 
    }
} else {
    alert("Please log in to access these webpages");
    window.location.href = '/general/html/home.html';   
}

function logout() {
    localStorage.clear();
    alert("Logged out successfully!");
    window.location.href = '/general/html/login.html';
};
window.logout = logout;