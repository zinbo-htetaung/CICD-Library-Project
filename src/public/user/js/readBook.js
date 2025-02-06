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
        });

    const urlParams = new URLSearchParams(window.location.search);
    const progressId = urlParams.get('progressId');

    if (!progressId || isNaN(progressId)) {     // validate the progress id first
        alert("Invalid or missing progress ID.");
        window.location.href = "displayBookProgress.html";
        return;
    }

    const token = localStorage.getItem('token');

    try {
        // Fetch book progress data from the backend
        const response = await fetch(`/api/bookProgress/${progressId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status == 403) {
            const errorData = await response.json();
            alert(`Access Denied: ${errorData.message}`);
            window.location.href = "displayBookProgress.html";
        } else if (response.status == 404) {
            const errorData = await response.json();
            alert(`${errorData.message}`);
            window.location.href = "displayBookProgress.html";
        } else if (response.ok) {
            const data = await response.json();
            console.log("Book progress data: ", data);

            const progress = data.bookProgress.progress;
            console.log("Progress:", progress);
            const pageHeight = document.body.scrollHeight;
            const scrollPosition = (progress / 100) * pageHeight;

            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth' // Smooth scrolling effect
            });
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
            window.location.href = "displayBookProgress.html";
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("An unexpected error occurred. Please try again later.");
        window.location.href = "displayBookProgress.html";
    }

    let lastProgressSent = -1;  // keep track of the last sent progress
    let debounceTimer;

    // Listen for scroll events
    window.addEventListener('scroll', async () => {
        const scrollTop = window.scrollY; 
        const pageHeight = document.body.scrollHeight - window.innerHeight; 
        const scrollPercentage = Math.round((scrollTop / pageHeight) * 100);

        // Trigger update every 20% interval
        if (scrollPercentage % 20 === 0 && scrollPercentage !== lastProgressSent) {
            lastProgressSent = scrollPercentage;    // Update last sent progress

            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/bookProgress/update/${progressId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ progress: scrollPercentage }),
                    });
    
                    const result = await response.json();
    
                    if (response.ok) {
                        console.log(result.message); 
                    } else {
                        alert(result.message); 
                        window.location.href = 'displayBookProgress.html'; 
                    }
                } catch (error) {
                    alert('An error occurred while updating progress.');
                    console.error(error);
                    window.location.href = 'displayBookProgress.html'; 
                }
            }, 5000);       // Wait for 5 seconds of inactivity before triggering the API 
        }
    });

});