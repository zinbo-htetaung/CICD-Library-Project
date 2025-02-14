document.addEventListener("DOMContentLoaded", async function () {
    fetch('admin_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        });

    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    const token = localStorage.getItem('token');

    if (!token) {
        alert("Unauthorized access! Please log in.");
        window.location.href = "login.html";
        return;
    }

    fetchPenaltyRecords();

    document.getElementById("filterRecords").addEventListener("click", async function () {
        filterPenaltyRecords();
    });

    document.getElementById("resetFilters").addEventListener("click", function () {
        window.location.reload();
    });
});


async function fetchPenaltyRecords() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/penaltyFees/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch penalty records.");
        }

        updateTable(data.records);
    } catch (error) {
        displayNoRecords(error.message);
    }
}

async function filterPenaltyRecords() {
    const token = localStorage.getItem('token');

    const username = document.getElementById("username").value.trim();
    const status = document.getElementById("status").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const filters = {};
    if (username) { filters.username = username; }
    if (status !== "") { filters.status = status === "true"; }
    if (startDate) { filters.start_date = startDate; }
    if (endDate) {filters.end_date = endDate;}

    if (Object.keys(filters).length === 0) {
        alert("Please enter at least one filter criteria.");
        return;
    }

    try {
        const response = await fetch('/api/penaltyFees/filter', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch filtered records.");
        }

        updateTable(data.records);
    } catch (error) {
        displayNoRecords(error.message);
    }
}


function updateTable(records) {
    const tableBody = document.getElementById("penaltyRecordsTable");
    tableBody.innerHTML = "";   // clear existing table data

    if (records.length === 0) {
        displayNoRecords("No penalty records found.");
        return;
    }

    records.forEach((record, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td> 
            <td>${record.rent_history_id}</td>
            <td>${record.book_name}</td>
            <td>${record.username}</td>
            <td>$${record.fees.toFixed(2)}</td>
            <td><span class="fw-bold ${record.status ? 'text-success' : 'text-danger'}">${record.status ? 'Paid' : 'Unpaid'}</span></td>
            <td>${record.paid_on ? new Date(record.paid_on).toLocaleDateString() : 'N/A'}</td>
        `;

        tableBody.appendChild(row);
    });
}


function displayNoRecords(message) {
    const tableBody = document.getElementById("penaltyRecordsTable");
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-danger"><strong>${message}</strong></td>
        </tr>
    `;
}
