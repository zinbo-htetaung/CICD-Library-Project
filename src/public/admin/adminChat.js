document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    setTimeout(() => {
        loadUsersList(token);
    }, 200); await loadNavbarAndFooter();
    const userId = new URLSearchParams(window.location.search).get("userId") || 1;
    await fetchUserInfo(userId, token);
    await fetchMessages(userId, token);

    // ✅ Start auto-refreshing chat
    startMessagePolling(userId, token);

    document.getElementById("replyForm").addEventListener("submit", (event) => sendReply(event, userId));
    document.getElementById("adminReply").addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // ✅ Prevents new line
            document.getElementById("replyForm").dispatchEvent(new Event("submit")); // ✅ Simulates send button click
        }
    });
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
        loadUsersList(token);
    }, 10000);
}
async function loadUsersList(token) {
    try {
        const response = await fetch(`/api/messages/users/latestMessages`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        let users = data.messages || [];
        console.log("API Response for Users:", users);

        // ✅ Sort users by latest message time (newest first)
        users.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        // ✅ Store users globally for search
        window.allUsers = users;

        renderUserList(users); // ✅ Call function to render list
        updateNotification(users); // ✅ Update notification badge

    } catch (error) {
        console.error("Error loading users:", error);
    }
}

function updateNotification(users) {
    const notifBadge = document.getElementById("notifBadge");

    // ✅ Count unread messages
    const unreadUsers = users.filter(user => user.unread).length;

    if (unreadUsers > 0) {
        notifBadge.style.display = "inline-block";
        notifBadge.textContent = unreadUsers;
    } else {
        notifBadge.style.display = "none";
    }
}

async function loadChat(userId) {
    const token = localStorage.getItem("token");

    // ✅ Mark messages as read
    await fetch(`/api/messages/markRead/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    window.location.href = `http://localhost:3000/admin/adminChat.html?userId=${userId}`;
}

function renderUserList(users) {
    const userListContainer = document.getElementById("userListContainer");
    userListContainer.innerHTML = ""; // Clear previous users

    users.forEach(user => {
        const userDiv = document.createElement("div");
        userDiv.classList.add("list-group-item", "user-list-item");
        if (user.unread) userDiv.classList.add("unread");


        const notificationDot = user.unread ? `<span class="noti-dot"></span>` : '';

        // ✅ Create Avatar (First Letter of Name)
        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("user-avatar");
        avatarDiv.textContent = user.name.charAt(0).toUpperCase();

        // ✅ Create User Info
        const userInfoDiv = document.createElement("div");
        userInfoDiv.classList.add("user-info-panel");
        userInfoDiv.innerHTML = `
            <strong>${user.name} ${notificationDot}</strong>
            <small class="timestamp mt-1">${user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleString() : ''}</small>
            <p class="last-message">${user.lastMessage.slice(0, 10)}...</p>
        `;

        // ✅ Append Avatar & User Info
        userDiv.appendChild(avatarDiv);
        userDiv.appendChild(userInfoDiv);

        userDiv.addEventListener("click", () => loadChat(user.id));
        userListContainer.appendChild(userDiv);
    });
}

document.getElementById("userSearch").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const filteredUsers = window.allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm)
    );
    renderUserList(filteredUsers); // ✅ Show filtered users
});

// ✅ Reset button to clear search
document.getElementById("resetSearch").addEventListener("click", function () {
    document.getElementById("userSearch").value = ""; // Clear input
    renderUserList(window.allUsers); // ✅ Show all users again
});