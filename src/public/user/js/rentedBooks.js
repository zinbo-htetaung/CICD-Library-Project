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
    })

    const token = localStorage.getItem("token");
    const userId = 1; // Replace with dynamic user ID if needed

    const currentRentedTableBody = document.getElementById("current-rented-table-body");
    const noCurrentBooksMessage = document.getElementById("no-current-books-message");

    async function fetchRentHistory() {
        try {
            const response = await fetch(`/api/rentHistory/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            if (response.ok) {
                const rentHistoryData = result.history || [];
                console.log(rentHistoryData);

                // Separate current rentals and rental history
                const currentRentals = rentHistoryData.filter(
                    entry => !entry.return_date && new Date(entry.end_date) > new Date()
                );
                const rentalHistory = rentHistoryData.filter(
                    entry => entry.return_date || new Date(entry.end_date) <= new Date()
                );

                populateTableWithActions(currentRentedTableBody, currentRentals);
                populateTable(historyTableBody, rentalHistory, ["book.book_name", "start_date", "end_date", "return_date", "due_status"]);

                // Toggle messages based on data availability
                toggleNoRecordsMessage(noCurrentBooksMessage, currentRentals.length === 0);
                toggleNoRecordsMessage(noHistoryMessage, rentalHistory.length === 0);
            } else {
                alert(result.message || "Failed to fetch rent history.");
            }
        } catch (error) {
            console.error("Error fetching rent history:", error);
            alert("An error occurred while fetching rent history.");
        }
    }

    function populateTableWithActions(tableBody, data) {
        tableBody.innerHTML = ""; // Clear existing rows
        data.forEach((entry, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.book.book_name || "Unknown"}</td>
                <td>${formatValue(entry.start_date)}</td>
                <td>${formatValue(entry.end_date)}</td>
                <td>
 <button class="btn btn-return" data-id="${entry.id}" data-book-id="${entry.book.id}" 
                    onclick="returnBook(${entry.book.id})">Return Book</button>                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function populateTable(tableBody, data, columns) {
        tableBody.innerHTML = ""; // Clear existing rows
        data.forEach((entry, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                ${columns
                    .map(column => `<td>${formatValue(getNestedValue(entry, column))}</td>`)
                    .join("")}
            `;
            tableBody.appendChild(row);
        });
    }

    function getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    function formatValue(value) {
        // if (!value) return "Not Available";
        if (typeof value === "boolean") return value ? "Overdue" : "On Time";
        if (new Date(value) !== "Invalid Date" && !isNaN(new Date(value))) {
            return new Date(value).toLocaleDateString();
        }
        return value;
    }

    function toggleNoRecordsMessage(messageElement, show) {
        messageElement.style.display = show ? "block" : "none";
    }

    async function returnBook(rentId) {
        try {
            const response = await fetch(`/api/books/return/${rentId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                alert("Book returned successfully!");
                fetchRentHistory(); // Refresh the tables
            } else {
                const error = await response.json();
                alert(error.message || "Failed to return the book.");
            }
        } catch (error) {
            console.error("Error returning book:", error);
            alert("An error occurred while returning the book.");
        }
    }

    // Make returnBook globally accessible
    window.returnBook = returnBook;

    // Initial fetch
    fetchRentHistory();
});