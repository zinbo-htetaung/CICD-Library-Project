document.addEventListener("DOMContentLoaded", () => {
    console.log("🔔 Notification script loaded");

    // Function to check if elements are fully rendered
    function checkElements() {
        const notificationBell = document.getElementById("notificationBell");
        const notificationDropdown = document.getElementById("notificationDropdown");
        const notificationList = document.getElementById("notificationList");
        const notificationCount = document.getElementById("notificationCount");

        // ✅ Wait until all elements are available before running script
        if (!notificationBell || !notificationDropdown || !notificationList || !notificationCount) {
            console.warn("⚠️ Notification elements not found, retrying...");
            setTimeout(checkElements, 500); // ✅ Retry after 500ms
            return;
        }

        console.log("✅ Notification elements loaded successfully");

        // ✅ Toggle dropdown on bell click
        notificationBell.addEventListener("click", (event) => {
            event.preventDefault(); // Prevents default anchor behavior
            console.log("🔔 Notification bell clicked");

            // Toggle dropdown visibility
            notificationDropdown.style.display = 
                (notificationDropdown.style.display === "none" || !notificationDropdown.style.display) 
                ? "block" 
                : "none";
        });

        // ✅ Close dropdown when clicking outside
        document.addEventListener("click", (event) => {
            if (!notificationBell.contains(event.target) && !notificationDropdown.contains(event.target)) {
                notificationDropdown.style.display = "none";
            }
        });

        // ✅ Fetch notifications
        fetchNotifications();
    }

    // ✅ Function to fetch notifications (Mock API request, replace with real one)
    async function fetchNotifications() {
        try {
            // Simulated API response
            const notifications = [
                { id: 1, title: "New Book Added", message: "Check out our new books!", date: "2024-02-14T10:00:00Z" },
                { id: 2, title: "Return Reminder", message: "Your borrowed book is due soon!", date: "2024-02-15T12:30:00Z" }
            ];

            displayNotifications(notifications);
        } catch (error) {
            console.error("⚠️ Error fetching notifications:", error);
            document.getElementById("notificationList").innerHTML = `<p class="text-center text-muted">Failed to load notifications</p>`;
        }
    }

    // ✅ Function to display notifications
    function displayNotifications(notifications) {
        const notificationList = document.getElementById("notificationList");
        const notificationCount = document.getElementById("notificationCount");
        
        notificationList.innerHTML = ""; // Clear existing list

        if (notifications.length === 0) {
            notificationList.innerHTML = `<p class="text-center text-muted">No new notifications</p>`;
            notificationCount.classList.add("d-none");
        } else {
            notificationCount.textContent = notifications.length;
            notificationCount.classList.remove("d-none");

            notifications.forEach((notification) => {
                const item = document.createElement("a");
                item.href = "#"; // Change this to a relevant link
                item.className = "list-group-item list-group-item-action";
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <strong>${notification.title}</strong>
                        <small class="text-muted">${new Date(notification.date).toLocaleTimeString()}</small>
                    </div>
                    <p class="mb-1 text-muted">${notification.message}</p>
                `;

                item.addEventListener("click", () => {
                    item.classList.add("text-muted"); // Mark as read
                    notificationCount.textContent = Math.max(0, notificationCount.textContent - 1); // Reduce count
                });

                notificationList.appendChild(item);
            });
        }
    }

    // ✅ Start checking for elements after page load
    setTimeout(checkElements, 500);
});
