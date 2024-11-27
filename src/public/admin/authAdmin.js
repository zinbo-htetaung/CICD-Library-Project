// Check if token exists in local storage
if (localStorage.getItem('token')) {
    if (localStorage.getItem('role') !== 'admin') {   
        alert("Access Not Granted!");
        window.location.href = '../general/login.html'; 
    }
} else {
    window.location.href = '../general/login.html';   
}

function logout() {
    localStorage.clear();
    alert("Logged out successfully!");
    window.location.href = '../general/login.html';
};
window.logout = logout;