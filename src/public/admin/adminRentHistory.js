document.addEventListener("DOMContentLoaded", function () {
    fetch('admin_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        });
});

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const tableBody = document.getElementById("rent-history-table-body");
    const noRecordsMessage = document.getElementById("no-records-message");
    let rentHistoryData = []; // Store all fetched data

    async function fetchRentHistory() {
        try {
            // Fetch rent history from the server
            const response = await fetch("/api/rentHistory", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            rentHistoryData = result.history || []; // Save data for filtering
            console.log(rentHistoryData);

            if (response.ok) {
                populateTable(rentHistoryData);
            } else {
                alert(result.message || "Failed to fetch rent history.");
            }
        } catch (error) {
            console.error("Error fetching rent history:", error);
            alert("An error occurred while fetching rent history.");
        }
    }

    function populateTable(data) {
        tableBody.innerHTML = ""; // Clear existing rows

        if (data.length === 0) {
            noRecordsMessage.style.display = "block"; // Show "No records found" message
        } else {
            noRecordsMessage.style.display = "none"; // Hide the message if records exist
            data.forEach((entry, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.users?.name || "Unknown"}</td>
                    <td>${entry.users?.email || "Unknown"}</td>
                    <td>${entry.book_id}</td>
                    <td>${new Date(entry.start_date).toLocaleDateString()}</td>
                    <td>${new Date(entry.end_date).toLocaleDateString()}</td>
                    <td>${entry.return_date ? new Date(entry.return_date).toLocaleDateString() : "Not Returned"}</td>
                    <td>${entry.due_status ? "Overdue" : "On Time"}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    function applyFilters() {
        const filterName = document.getElementById("filterName").value.toLowerCase();
        const filterEmail = document.getElementById("filterEmail").value.toLowerCase();
        const filterBookId = document.getElementById("filterBookId").value;
        const filterDueStatus = document.getElementById("filterDueStatus").value;

        const filteredData = rentHistoryData.filter(entry => {
            const nameMatch = !filterName || (entry.users?.name || "").toLowerCase().includes(filterName);
            const emailMatch = !filterEmail || (entry.users?.email || "").toLowerCase().includes(filterEmail);
            const bookIdMatch = !filterBookId || entry.book_id.toString() === filterBookId;
            const dueStatusMatch = !filterDueStatus || (entry.due_status ? "Overdue" : "On Time") === filterDueStatus;

            return nameMatch && emailMatch && bookIdMatch && dueStatusMatch;
        });

        populateTable(filteredData);
    }

    document.getElementById("applyFilters").addEventListener("click", applyFilters);

    // Initial fetch
    fetchRentHistory();
});