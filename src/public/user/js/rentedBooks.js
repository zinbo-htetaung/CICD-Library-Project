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
        })

    // Load footer
    fetch('../../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/rentHistory/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                const errorData = await response.json();
                const currentlyRentedBooksSection = document.getElementById('currentlyRentedBooksSection');
                const dueTodayBooksSection = document.getElementById('dueTodayBooksSection');
                const overdueBooksSection = document.getElementById('overdueBooksSection');
                currentlyRentedBooksSection.innerHTML = `
                    <h3 class="text-start mb-3"><i class="bi bi-journal-bookmark-fill me-2"></i>Currently Rented Books</h3>
                    <div class="alert alert-danger text-center" role="alert" style="display: inline-block;">
                        ${errorData.message}
                    </div>
                `;
                dueTodayBooksSection.innerHTML = `
                    <h3 class="text-start mb-3"><i class="bi bi-hourglass-split me-2"></i>Books Due Today</h3>
                    <div class="alert alert-danger text-center" role="alert" style="display: inline-block;">
                        ${errorData.message}
                    </div>
                `;
                overdueBooksSection.innerHTML = `
                    <h3 class="text-start mb-3"><i class="bi bi-x-octagon-fill me-2"></i>Overdue Books</h3>
                    <div class="alert alert-danger text-center" role="alert" style="display: inline-block;">
                        ${errorData.message}
                    </div>
                `;
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
            return;
        }

        const data = await response.json();

        const currentDate = new Date();
        const currentlyRented = [];
        const dueToday = [];
        const overdue = [];

        // Separate books into three categories
        data.history.forEach(book => {
            const endDate = new Date(book.end_date);

            if (endDate.toDateString() === currentDate.toDateString()) {
                dueToday.push(book);
            } else if (endDate < currentDate) {
                overdue.push(book);
            } else {
                const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
                currentlyRented.push({ ...book, daysRemaining });
            }
        });

        // Render sections
        renderBooksSection("<i class='bi bi bi-journal-bookmark-fill me-2'></i>Currently Rented Books", currentlyRented, "daysRemaining", "currentlyRentedBooksSection");
        renderBooksSection("<i class='bi bi-hourglass-split me-2'></i>Books Due Today", dueToday, null, "dueTodayBooksSection", "warning", true);
        renderBooksSection("<i class='bi bi-x-octagon-fill me-2'></i>Overdue Books", overdue, null, "overdueBooksSection", "danger", true, true);
    } catch (error) {
        alert("Failed to load data. Please try again.");
    }
});

function renderBooksSection(title, books, showDaysKey, sectionId, badgeClass = null, showExtend = false, disableExtend = false) {
    const section = document.getElementById(sectionId);
    section.innerHTML = `<h3 class="text-start mb-3">${title}</h3>`; 

    if (books.length === 0) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger text-center d-inline-block';
        alert.role = 'alert';
        alert.innerText = `No books in this section.`;
        section.appendChild(alert);
        return;
    }

    const row = document.createElement('div');
    row.className = 'row'; 

    books.forEach(book => {
        const daysRemaining = showDaysKey && book[showDaysKey] ? `<p class="mb-2 text-danger">Days remaining:<strong> ${book[showDaysKey]} </strong></p>` : '';
        const badge = badgeClass
            ? `<span class="badge p-2 bg-${badgeClass} mb-2">${disableExtend ? 'Overdue' : 'Due Today'}</span>`
            : '';
        const extendButton = showExtend
            ? `<button class="btn btn-secondary me-2 extend-btn mb-2" data-history-id="${book.history_id}" ${disableExtend ? 'disabled' : ''}>Extend<i class="bi bi-clock ms-2"></i></button>`
            : '';
        const returnButton = `<button class="btn btn-primary return-btn" data-book-id="${book.id}">Return<i class="bi bi-arrow-return-right ms-2"></i></button>`;
    
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-4'; 
    
        col.innerHTML = `
          <div class="card shadow-sm h-100">
            <h4 class="card-header">${book.book_name}</h4>
            <img src="../../images/book_cover.webp" alt="Book Image" class="card-img-top">
            <div class="card-body">   
              <h5 class="card-subtitle mb-2 text-muted"><em>By : ${book.author}</em></h5>
              ${daysRemaining}
              ${badge}
              <div class="d-flex flex-wrap flex-md-row flex-column align-items-start mt-3">
                ${showExtend ? extendButton : ''}
                ${returnButton}
              </div>
            </div>
          </div>
        `;
    
        row.appendChild(col);
    });
    
    section.appendChild(row);
    
    // Attach event listeners via delegation
    section.addEventListener('click', async (event) => {
        const target = event.target;

        if (target.classList.contains('return-btn')) {
            const bookId = target.getAttribute('data-book-id');
            await returnBook(bookId);
        }

        if (target.classList.contains('extend-btn')) {
            const historyId = target.getAttribute('data-history-id');
            await extendBook(historyId);
        }
    });
}

async function returnBook(bookId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/books/return/${bookId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${result.message} - Due Fee ${result.dueFee}`);
            window.location.reload();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

async function extendBook(historyId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/rentHistory/extend/${historyId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${result.message}`);
            window.location.reload();
        } else {
            alert(`${result.message}`);
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}
