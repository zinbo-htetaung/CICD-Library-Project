document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        console.error("User ID or token not found in localStorage.");
        return;
    }

    try {
        // ✅ Fetch Reputation Score
        await fetchReputationScore(userId, token);
    } catch (error) {
        console.error("Error initializing reputation:", error);
    }
});

async function fetchReputationScore(userId, token) {
    try {
        const response = await fetch(`/api/users/reputation/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        console.log("📢 Response Data:", JSON.stringify(data, null, 2)); // Pretty print JSON

        console.log("Data: " + data);
        console.log("Score: " + data.score);
        console.log("Level: " + data.level);
        updateReputationUI(data.score, data.level);
    } catch (error) {
        console.error("Error fetching reputation score:", error);
    }
}

function updateReputationUI(score, level) {
    const reputationLevel = document.getElementById("reputationLevel");
    const reputationBar = document.getElementById("reputationBar");

    reputationLevel.textContent = level;
    reputationBar.style.width = `${score}%`;
    reputationBar.textContent = `${score}%`;

    // ✅ Change bar color based on reputation level
    reputationBar.classList.remove("bg-success", "bg-warning", "bg-danger");
    if (level === "High") {
        reputationBar.classList.add("bg-success"); // Green
    } else if (level === "Medium") {
        reputationBar.classList.add("bg-warning"); // Yellow
    } else {
        reputationBar.classList.add("bg-danger"); // Red
    }
}

// payment
document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId) {
        console.error("User ID not found in localStorage.");
        return;
    }

    fetchUserPenaltyRecords(userId, token);
});

async function fetchUserPenaltyRecords(userId, token) {
    try {
        const response = await fetch(`http://localhost:3000/api/penaltyFees/unpaid`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn("No unpaid penalties found.");
                updatePenaltyUI([]);
                return;
            }
            throw new Error("Failed to fetch penalty records");
        }

        const { records } = await response.json();
        console.log("📢 Received Penalty Records:", records);
        updatePenaltyUI(records);
        // updatePenaltyUI([]);
    } catch (error) {
        console.error("Error fetching penalty records:", error);
    }
}

function updatePenaltyUI(penalties) {
    const penaltyTableContainer = document.getElementById("penaltyTableContainer");
    const penaltyTableBody = document.getElementById("penaltyTableBody");
    const totalPenaltyAmount = document.getElementById("totalPenaltyAmount");
    const noPenaltyMessage = document.getElementById("noPenaltyMessage");
    const payPenaltyBtn = document.getElementById("payPenaltyBtn");
    const penaltySummary = document.getElementById("penaltySummary");

    // Clear previous data
    penaltyTableBody.innerHTML = "";
    let totalAmount = 0;

    if (penalties.length === 0) {
        penaltyTableContainer.classList.add("d-none");
        penaltySummary.classList.add("d-none");
        noPenaltyMessage.classList.remove("d-none");
        totalPenaltyAmount.textContent = "$0.00";
        payPenaltyBtn.disabled = true;
    } else {
        penaltyTableContainer.classList.remove("d-none");
        penaltySummary.classList.remove("d-none");
        noPenaltyMessage.classList.add("d-none");

        penalties.forEach(penalty => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="text-center">${penalty.book_name}</td>
                <td class="text-center">${new Date(penalty.end_date).toLocaleDateString()}</td>
                <td class="text-center">${penalty.return_date ? new Date(penalty.return_date).toLocaleDateString() : "Not Returned"}</td>
                <td class="text-center">$${penalty.fees.toFixed(2)}</td>
            `;
            penaltyTableBody.appendChild(row);
            totalAmount += penalty.fees;
        });

        totalPenaltyAmount.textContent = `$${totalAmount.toFixed(2)}`;
        payPenaltyBtn.disabled = totalAmount === 0;
    }
}

// ✅ Ensure "No Fees to Pay" always shows when the accordion opens if no penalties exist
document.getElementById("headingPenalty").addEventListener("click", () => {
    const noPenaltyMessage = document.getElementById("noPenaltyMessage");
    if (document.getElementById("penaltyTableContainer").classList.contains("d-none")) {
        noPenaltyMessage.classList.remove("d-none");
    }
});

// Show the payment confirmation modal with the correct amount
document.getElementById("payPenaltyBtn").addEventListener("click", () => {
    const totalAmount = document.getElementById("totalPenaltyAmount").textContent;
    document.getElementById("confirmTotalAmount").textContent = totalAmount;
});

async function payPenaltyFees() {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        console.error("User ID or token not found in localStorage.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/penaltyFees/pay`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Payment failed. Please try again.");
        }

        // Close modal after successful payment
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmPaymentModal'));
        confirmModal.hide();

        // Payment success
        alert("Payment successful! Your penalties have been cleared.");
        updatePenaltyUI([]); // Clear UI
    } catch (error) {
        console.error("Error processing payment:", error);
        alert("Payment failed. Please check your connection and try again.");
    }
}