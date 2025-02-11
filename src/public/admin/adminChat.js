document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    await loadNavbarAndFooter();
    const userId = new URLSearchParams(window.location.search).get("userId") || 1;
    await fetchUserInfo(userId, token);
    await fetchMessages(userId, token);

    // ✅ Start auto-refreshing chat
    startMessagePolling(userId, token);

    document.getElementById("replyForm").addEventListener("submit", (event) => sendReply(event, userId));
});
// Load Navbar and Footer
async function loadNavbarAndFooter() {
    try {
        const navbarHTML = await fetchHTML('admin_navbar.html');
        document.getElementById('navbar-container').innerHTML = navbarHTML;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', logout);

        const footerHTML = await fetchHTML('../footer.html');
        document.getElementById('footer-container').innerHTML = footerHTML;
    } catch (error) {
        console.error('Error loading navbar or footer:', error);
    }
}

// Fetch HTML Helper
async function fetchHTML(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch HTML from ${url}`);
    return await response.text();
}

let lastMessageId = null; // Track last message to avoid duplicates
async function fetchMessages(userId, token) {
    try {
        const response = await fetch(`/api/messages/user/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const messages = await response.json();

        // ✅ Only display messages that are NEW
        const newMessages = messages.message.filter(msg => lastMessageId === null || msg.id > lastMessageId);
        if (newMessages.length > 0) {
            lastMessageId = newMessages[newMessages.length - 1].id; // Update last message ID
            displayMessages(newMessages);
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Send reply to backend
async function sendReply(event, userId) {
    event.preventDefault();
    const replyText = document.getElementById("adminReply").value.trim();

    if (replyText) {
        await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, sender: "admin", message: replyText }),
        });

        document.getElementById("adminReply").value = ""; // Clear input
        fetchMessages(userId); // Refresh chat
    }
}

async function displayMessages(messages) {
    const messageContainer = document.getElementById("messageContainer");

    messages.forEach(msg => {
        // ✅ Check if the message already exists before adding it
        if (!document.getElementById(`msg-${msg.id}`)) {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", msg.sender);
            messageDiv.id = `msg-${msg.id}`; // Unique ID to prevent duplicates
            messageDiv.innerHTML = `<span><b>${msg.sender === "user" ? "User" : "Admin"}:</b> ${msg.message}</span>`;
            messageContainer.appendChild(messageDiv);
        }
    });

    messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll to the latest message
}

// ✅ Fetch User Details with Authorization Token
async function fetchUserInfo(userId, token) {
    try {
        const response = await fetch(`/api/users/userId/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error("Failed to fetch user details");

        const user = await response.json();

        if (!user || user.error) {
            document.getElementById('userInfo').textContent = "User not found.";
            return;
        }

        // ✅ Update User Info Box
        document.getElementById('userInfo').innerHTML = `
            <strong>Chat with ${user.name}</strong> (ID: ${user.id}) <br>
            📧 Email: ${user.email} <br>
        `;
    } catch (error) {
        console.error("Error fetching user details:", error);
        document.getElementById('userInfo').textContent = "Error loading user details.";
    }
}

function startMessagePolling(userId, token) {
    fetchMessages(userId, token); // Fetch immediately

    setInterval(() => {
        fetchMessages(userId, token);
    }, 10000); // ✅ Only appends new messages, no flickering
}