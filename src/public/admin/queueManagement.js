document.addEventListener("DOMContentLoaded", () => {
    fetch('admin_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error("Error loading navbar:", error));

    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    fetchAllQueueEntries(); // Load all queue entries on page load

    // Fetch all queue entries
    async function fetchAllQueueEntries() {
        try {
            const response = await fetch("/api/queue/admin/getAllQueues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                displayQueueEntries(data.queues);
            } else {
                console.error("Failed to fetch queue entries.");
                alert("Failed to load queue data. Please try again later.");
            }
        } catch (error) {
            console.error("Error fetching queue entries:", error);
            alert("An error occurred while fetching queue data.");
        }
    }

    // Fetch filtered queue entries
    async function fetchFilteredQueueEntries(filters) {
        try {
            const response = await fetch("/api/queue/admin/getAllQueues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(filters)
            });

            if (response.ok) {
                const data = await response.json();
                displayQueueEntries(data.queues);
            } else {
                if (response.status == 404) {
                    const tableBody = document.getElementById("queueTableBody");
                    tableBody.innerHTML = ""; // Clear existing rows
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="8" class="text-center">No queue entries available.</td>`;
                    tableBody.appendChild(noDataRow);
                    alert("No data found.");

                    return;

                } else {
                    console.error("Failed to fetch filtered queue data.");
                    alert("Failed to load filtered queue data. Please try again later.");
                }
            }
        } catch (error) {
            console.error("Error fetching filtered queue data:", error);
            alert("An error occurred while fetching filtered queue data.");
        }
    }

    // Display queue entries in the table
    function displayQueueEntries(queues) {
        const tableBody = document.getElementById("queueTableBody");
        tableBody.innerHTML = ""; // Clear existing rows
        console.log(queues);
        if (!queues || queues.length === 0) {
            console.log("no data");
            const noDataRow = document.createElement("tr");
            noDataRow.innerHTML = `<td colspan="8" class="text-center">No queue entries available.</td>`;
            tableBody.appendChild(noDataRow);
            return;
        }

        queues.forEach((queue) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="text-center">${queue.queue_id}</td>
                <td class="text-center">${queue.users.id}</td>
                <td class="text-center">${queue.users.name}</td>
                <td class="text-center">${queue.book.book_name}</td>
                <td class="text-center">${queue.status || 'Pending'}</td>
                <td class="text-center">${new Date(queue.timestamp).toLocaleDateString()}</td>
                <td class="d-flex justify-content-center gap-3">
                    <button class="btn btn-danger btn-sm delete-btn border-2 border-black" 
                        data-id="${queue.queue_id}" data-userId="${queue.users.id}">
                        Remove
                    </button>
                </td>
            `;
        
            tableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const queueId = event.target.getAttribute("data-id");
                const userId = event.target.getAttribute("data-userId");
                removeQueueEntry(queueId,userId);
            });
        });
    }

        // Remove a queue entry
        async function removeQueueEntry(queueId, userId) {
            if (!confirm(`Are you sure you want to remove Queue ID ${queueId} for User ID ${userId}?`)) return;
    
            try {
                const response = await fetch(`/api/queue/admin/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({  queueId, userId })
                });
    
                if (response.ok) {
                    alert("Queue entry removed successfully.");
                    fetchAllQueueEntries(); // Refresh the table
                } else {
                    console.error("Failed to remove queue entry.");
                    alert("Failed to remove the queue entry. Please try again.");
                }
            } catch (error) {
                console.error("Error removing queue entry:", error);
                alert("An error occurred while removing the queue entry.");
            }
        }


    

    // Handle filter search button click
    document.getElementById("filterSearchBtn").addEventListener("click", () => {
        const filters = {
            userName: document.getElementById("filterUserName").value,
            bookTitle: document.getElementById("filterBookTitle").value,
            status: document.getElementById("filterQueueStatus").value,
            sortOrder: document.getElementById("sortOrder").value
        };
        console.log(filters);

        fetchFilteredQueueEntries(filters);
    });
});
