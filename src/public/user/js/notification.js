document.addEventListener("DOMContentLoaded", () => {
    console.log("🔔 Notification script loaded");

    //  Function to check if notification elements are fully rendered
    function checkElements() {
        const notificationBell = document.getElementById("notificationBell");
        const notificationDropdown = document.getElementById("notificationDropdown");
        const notificationList = document.getElementById("notificationList");
        const notificationCount = document.getElementById("notificationCount");

        if (!notificationBell || !notificationDropdown || !notificationList || !notificationCount) {
            console.warn("⚠️ Notification elements not found, retrying...");
            setTimeout(checkElements, 500); //  Retry after 500ms
            return;
        }

        console.log("✅ Notification elements loaded successfully");

        //  Toggle dropdown on bell click
        notificationBell.addEventListener("click", async (event) => {
            event.preventDefault(); // Prevents default anchor behavior
            console.log("🔔 Notification bell clicked");

            // Fetch notifications from the API
            await fetchNotifications();

            // Toggle dropdown visibility
            notificationDropdown.style.display =
                (notificationDropdown.style.display === "none" || !notificationDropdown.style.display)
                    ? "block"
                    : "none";
        });

        //  Close dropdown when clicking outside
        document.addEventListener("click", (event) => {
            if (!notificationBell.contains(event.target) && !notificationDropdown.contains(event.target)) {
                notificationDropdown.style.display = "none";
            }
        });

        //  Initial fetch notifications on page load
        fetchNotifications();
    }

    //  Function to fetch notifications from API
    async function fetchNotifications() {
        try {
            const token = localStorage.getItem("token"); // Ensure user is authenticated
            const userId = localStorage.getItem("user_id"); // Get user ID

            if (!token || !userId) {
                console.warn("⚠️ User not logged in, skipping notifications fetch.");
                return;
            }

            //  Construct API request with dynamic userId
            const response = await fetch(`/api/notifications/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch notifications.");

            const data = await response.json();
            displayNotifications(data.notifications);
        } catch (error) {
            console.error("⚠️ Error fetching notifications:", error);
            document.getElementById("notificationList").innerHTML = `<p class="text-center text-muted my-2">Failed to load notifications</p>`;
        }
    }

    //  Function to display notifications
    function displayNotifications(notifications) {
        const notificationList = document.getElementById("notificationList");
        const notificationCount = document.getElementById("notificationCount");

        notificationList.innerHTML = ""; // Clear existing list

        if (notifications.length === 0) {
            notificationList.innerHTML = `<p class="text-center text-muted my-2">No new notifications</p>`;
            notificationCount.classList.add("d-none");
        } else {
            notificationCount.textContent = notifications.length;
            notificationCount.classList.remove("d-none");

            notifications.forEach((notification) => {
                const item = document.createElement("a");
                item.href = "#"; // Change this to a relevant link
                item.className = "list-group-item list-group-item-action my-1 rounded ";
                item.style = "background-color: #dbe2ef;"; // Added background color

                item.innerHTML = `
                        <div class="d-flex w-100 justify-content-between">
                            <strong>${notification.title}</strong>
                            <small class="text-muted">${new Date(notification.created_at).toLocaleTimeString()}</small>
                        </div>
                        <p class="mt-2 mb-1 text-muted my-2">${notification.message}</p>
                    `;

                notificationList.appendChild(item);


                //  Mark notification as read on click
                item.addEventListener("click", async () => {
                    await markNotificationAsRead(notification.id);
                    item.classList.add("text-muted"); // Mark visually as read
                    notificationCount.textContent = Math.max(0, notificationCount.textContent - 1); // Reduce count
                    item.remove(); // Remove from list
                });

                notificationList.appendChild(item);
            });
        }
    }

    //  Function to mark a notification as read via API
    async function markNotificationAsRead(notificationId) {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("user_id"); // Get user ID

            if (!token || !userId) {
                console.warn("⚠️ User not logged in, skipping notifications fetch.");
                return;
            }

            await fetch(`/api/notifications/${userId}/mark-seen`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notificationId }),
            });
        } catch (error) {
            console.error("⚠️ Error marking notification as read:", error);
        }
    }

    //  Start checking for elements after page load
    setTimeout(checkElements, 500);
    setInterval(checkElements, 10000); //  Check every 1000ms


    setInterval(async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("user_id"); // Get user ID

            if (!token || !userId) {
                console.warn("⚠️ User not logged in, skipping notifications fetch.");
                return;
            }
            const response = await fetch(`/api/notifications/${userId}/check-rent-due`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            if (response.ok) {
                console.log("✅ Rent due check completed successfully.");
            } else {
                console.error("⚠️ Failed to check and notify due rentals.");
            }
        } catch (error) {
            console.error("⚠️ Error calling rent due notification API:", error);
        }
    }, 50000); // in real life , this funciton will run only once a day, but 10000ms is used for testing purposes
});
