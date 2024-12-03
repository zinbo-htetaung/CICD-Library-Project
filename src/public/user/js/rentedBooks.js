document.addEventListener("DOMContentLoaded", async () => {
    // Load navbar
    fetch('../html/user_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        });

    // Load footer
    fetch('../../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    const token = localStorage.getItem('token');

    // Fetch rented books data from the API
    try {
        const response = await fetch('/api/rentHistory/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include token in Authorization header
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to fetch rented books:", errorData.message);
            alert("Failed to retrieve rented books data. Please try again later.");
            return;
        }

        const data = await response.json();

        // Categorize books into sections
        const currentDate = new Date();
        const currentlyRented = [];
        const dueToday = [];
        const overdue = [];

        data.history.forEach(book => {
            const startDate = new Date(book.start_date);
            const endDate = new Date(book.end_date);

            if (endDate.toDateString() === currentDate.toDateString()) {
                dueToday.push(book);
            } else if (endDate < currentDate) {
                overdue.push(book);
            } else {
                // Calculate days remaining for currently rented books
                const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
                currentlyRented.push({ ...book, daysRemaining });
            }
        });

        // Render the sections
        renderBooksSection("Currently Rented Books", currentlyRented, "daysRemaining");
        renderBooksSection("Books Due Today", dueToday, null, "danger", true);
        renderBooksSection("Overdue Books", overdue, null, "danger", false, true);
    } catch (error) {
        console.error("Error fetching or processing rented books data:", error);
        alert("An error occurred while fetching rented books data. Please try again later.");
    }
});

// Function to render book cards into a section
function renderBooksSection(title, books, showDaysKey, badgeClass = null, showExtend = false, disableExtend = false) {
    const container = document.querySelector('.container');

    // Create section header
    const section = document.createElement('div');
    section.classList.add('mt-4');
    const header = document.createElement('h3');
    header.classList.add('mb-3');
    header.textContent = title;
    section.appendChild(header);

    // Create a row for the books
    const row = document.createElement('div');
    row.classList.add('row', 'g-4');

    books.forEach(book => {
        // Create a column for each book
        const col = document.createElement('div');
        col.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');

        // Create the card
        const card = document.createElement('div');
        card.classList.add('card', 'h-100', 'shadow-sm');

        // Add book details
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = book.book_name;

        const cardAuthor = document.createElement('p');
        cardAuthor.classList.add('card-text', 'mb-2');
        cardAuthor.textContent = `Author: ${book.author}`;

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardAuthor);

        // Show days remaining for currently rented books
        if (showDaysKey && book[showDaysKey]) {
            const daysRemainingText = document.createElement('p');
            daysRemainingText.classList.add('card-text', 'text-muted', 'mb-2');
            daysRemainingText.textContent = `Days remaining: ${book[showDaysKey]}`;
            cardBody.appendChild(daysRemainingText);
        }

        // Add a badge for due or overdue books
        if (badgeClass) {
            const badge = document.createElement('span');
            badge.classList.add('badge', `bg-${badgeClass}`, 'mb-2');
            badge.textContent = 'Due Today';
            if (disableExtend) badge.textContent = 'Overdue';
            cardBody.appendChild(badge);
        }

        // Add Extend button
        if (showExtend) {
            const extendButton = document.createElement('button');
            extendButton.classList.add('btn', 'btn-primary', 'mt-2');
            extendButton.textContent = 'Extend';
            if (disableExtend) {
                extendButton.disabled = true;
            }
            cardBody.appendChild(extendButton);
        }

        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
    });

    // Append row to the section
    section.appendChild(row);

    // Append section to the container
    container.appendChild(section);
}
