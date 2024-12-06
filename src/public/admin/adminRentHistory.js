document.addEventListener("DOMContentLoaded", async () => {
    // Load navbar
    fetch('admin_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        })
        .catch(error => console.error("Error loading navbar:", error));

    // Load footer
    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error("Error loading footer:", error));

    // Initialize variables
    const token = localStorage.getItem("token");
    const tableBody = document.getElementById("rent-history-table-body");
    const noRecordsMessage = document.getElementById("no-records-message");
    let rentHistoryData = []; // Store fetched data for filtering
    const DUE_FEE_PER_DAY = 5; // Fee per day for overdue rentals

    // Fetch rent history
    // Fetch rent history with updated page
    async function fetchRentHistory() {
        try {
            const response = await fetch(`/api/rentHistory`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const result = await response.json();
            console.log(result);
            rentHistoryData = result.data || []; // Access `data` property correctly
            // Calculate due fees
            rentHistoryData.forEach(entry => {
                entry.due_fees = calculateDueFees(entry.end_date, entry.return_date, entry.due_status);
            });

            populateTable(rentHistoryData);
        } catch (error) {
            console.error("Error fetching rent history:", error);
            alert("An error occurred while fetching rent history.");
        }
    }

    // Function to calculate due fees
    function calculateDueFees(endDate, return_Date, dueStatus) {
        if (!dueStatus || !endDate) return 0; // No overdue fees if not overdue
        const end = (new Date(endDate)).setHours(0, 0, 0, 0);;
        const returnDate = (new Date(return_Date)).setHours(0, 0, 0, 0);;
        const returned = returnDate ? new Date(returnDate) : new Date();
        const overdueDays = Math.max(0, Math.ceil((returned - end) / (1000 * 60 * 60 * 24))); // Calculate overdue days
        return overdueDays * DUE_FEE_PER_DAY; // Total fees
    }
    // Populate table with data
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
                    <td>${entry.users?.address || "Unknown"}</td>
                    <td>${entry.users?.dob ? formatDate(entry.users.dob) : "N/A"}</td>
                    <td>${entry.book?.id || "Unknown"}</td>
                    <td>${entry.book?.book_name || "Unknown"}</td>
                    <td>${entry.book?.author || "Unknown"}</td>
                    <td>${entry.book?.description || "N/A"}</td>
                    <td>${entry.book?.no_of_copies || "N/A"}</td>
                    <td>${entry.book?.available_copies || "N/A"}</td>
                    <td>${formatDate(entry.start_date)}</td>
                    <td>${formatDate(entry.end_date)}</td>
                    <td>${entry.return_date ? formatDate(entry.return_date) : "Not Returned"}</td>
                    <td>${entry.due_status ? "Overdue" : "On Time"}</td>
                    <td>${entry.due_fees ? `$${entry.due_fees.toFixed(2)}` : "$0.00"}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // Helper to format dates
    function formatDate(dateString) {
        return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
    }

    // Apply filters to the rent history data
    function applyFilters() {
        const filterName = document.getElementById("filterName").value.toLowerCase();
        const filterEmail = document.getElementById("filterEmail").value.toLowerCase();
        const filterAddress = document.getElementById("filterAddress").value.toLowerCase();
        const filterDob = document.getElementById("filterDob").value;
        const filterBookId = document.getElementById("filterBookId").value.trim();
        const filterBookName = document.getElementById("filterBookName").value.toLowerCase();
        const filterAuthor = document.getElementById("filterAuthor").value.toLowerCase();
        const filterDescription = document.getElementById("filterDescription").value.toLowerCase();
        const filterStartDate = document.getElementById("filterStartDate").value;
        const filterEndDate = document.getElementById("filterEndDate").value;
        const filterReturnDate = document.getElementById("filterReturnDate").value;
        const filterDueStatus = document.getElementById("filterDueStatus").value.trim();
        const filterNoOfCopies = document.getElementById("noOfCopiesSlider").value;
        const filterAvailableCopies = document.getElementById("availableCopiesSlider").value;
        const filterilterDueFees = document.getElementById("dueFeesSlider").value;

        console.log(filterNoOfCopies);
        console.log(filterAvailableCopies);
        console.log(filterilterDueFees);

        // Filter logic
        const filteredData = rentHistoryData.filter(entry => {
            const nameMatch = !filterName || (entry.users?.name || "").toLowerCase().includes(filterName);
            const emailMatch = !filterEmail || (entry.users?.email || "").toLowerCase().includes(filterEmail);
            const addressMatch = !filterAddress || (entry.users?.address || "").toLowerCase().includes(filterAddress);
            const dobMatch = !filterDob || (entry.users?.dob && entry.users.dob.startsWith(filterDob));
            const bookIdMatch = !filterBookId || entry.book?.id.toString() === filterBookId;
            const bookNameMatch = !filterBookName || (entry.book?.book_name || "").toLowerCase().includes(filterBookName);
            const authorMatch = !filterAuthor || (entry.book?.author || "").toLowerCase().includes(filterAuthor);
            const descriptionMatch = !filterDescription || (entry.book?.description || "").toLowerCase().includes(filterDescription);
            const startDateMatch = !filterStartDate || (entry.start_date && entry.start_date.startsWith(filterStartDate));
            const endDateMatch = !filterEndDate || (entry.end_date && entry.end_date.startsWith(filterEndDate));
            const returnDateMatch = !filterReturnDate || (entry.return_date && entry.return_date.startsWith(filterReturnDate));
            const dueStatusMatch = !filterDueStatus || (entry.due_status ? "Overdue" : "On Time") === filterDueStatus;
            const calculatedDueFees = calculateDueFees(entry.end_date, entry.return_date, entry.due_status);
            const dueFeesMatch = calculatedDueFees <= filterilterDueFees;
            const noOfCopiesMatch = !filterNoOfCopies || (entry.book?.no_of_copies <= filterNoOfCopies);
            const availableCopiesMatch = !filterAvailableCopies || (entry.book?.available_copies <= filterAvailableCopies);

            return (
                nameMatch &&
                emailMatch &&
                addressMatch &&
                dobMatch &&
                bookIdMatch &&
                bookNameMatch &&
                authorMatch &&
                descriptionMatch &&
                startDateMatch &&
                endDateMatch &&
                returnDateMatch &&
                dueStatusMatch &&
                dueFeesMatch &&
                noOfCopiesMatch &&
                availableCopiesMatch
            );
        });

        populateTable(filteredData);
    }

    // Reset filters
    function resetFilters() {
        // Reset text inputs, dropdowns, and date inputs
        document.getElementById("filterName").value = "";
        document.getElementById("filterEmail").value = "";
        document.getElementById("filterAddress").value = "";
        document.getElementById("filterDob").value = "";
        document.getElementById("filterBookId").value = "";
        document.getElementById("filterBookName").value = "";
        document.getElementById("filterAuthor").value = "";
        document.getElementById("filterDescription").value = "";
        document.getElementById("filterStartDate").value = "";
        document.getElementById("filterEndDate").value = "";
        document.getElementById("filterReturnDate").value = "";
        document.getElementById("filterDueStatus").value = "";

        // Reset sliders (ensure these IDs exist in your HTML)
        const dueFeesSlider = document.getElementById("dueFeesSlider");
        const noOfCopiesSlider = document.getElementById("noOfCopiesSlider");
        const availableCopiesSlider = document.getElementById("availableCopiesSlider");

        if (dueFeesSlider) {
            dueFeesSlider.value = 250; // Reset to default value
            document.getElementById("dueFeesValue").textContent = "250";
        }
        if (noOfCopiesSlider) {
            noOfCopiesSlider.value = 50; // Reset to default value
            document.getElementById("noOfCopiesValue").textContent = "50";
        }
        if (availableCopiesSlider) {
            availableCopiesSlider.value = 50; // Reset to default value
            document.getElementById("availableCopiesValue").textContent = "50";
        }

        // Repopulate the table with all data
        populateTable(rentHistoryData);
    }

    // Add event listeners for filter buttons
    document.getElementById("applyFilters").addEventListener("click", applyFilters);
    document.getElementById("resetFilters").addEventListener("click", resetFilters);

    // Initial data fetch
    fetchRentHistory();
});