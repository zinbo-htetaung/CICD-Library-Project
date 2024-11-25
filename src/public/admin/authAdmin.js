// Check if token exists in local storage
if (localStorage.getItem('token')) {
    if (localStorage.getItem('role') !== 'admin') {   
        alert("Access Not Granted!");
        window.location.href = 'index.html'; 
    }
} else {
    window.location.href = 'index.html';   
}

function logout() {
    localStorage.clear();

    window.location.href = 'index.html';
}