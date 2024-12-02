document.addEventListener("DOMContentLoaded", () => {
    const confirmDeleteAccountBtn = document.getElementById("confirmDeleteAccountBtn");

    // Attach the event listener to the delete button inside the modal
    confirmDeleteAccountBtn.addEventListener("click", async () => {
        try {
            // Show loading state or disable the button to prevent multiple clicks
            confirmDeleteAccountBtn.disabled = true;
            confirmDeleteAccountBtn.innerHTML = "Deleting...";

            // Send the request to the backend to delete the account
            const response = await fetch("/api/users/account", {
                method: "DELETE", // Assuming DELETE method is used in the backend
                headers: {
                    "Content-Type": "application/json",
                },
                // You may also need to send an authorization token if you're using JWT authentication
                // headers: {
                //     "Authorization": `Bearer ${yourAuthToken}`,
                //     "Content-Type": "application/json"
                // },
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully deleted the account
                alert(data.message || "Account deleted successfully.");
                // Optionally, redirect to a login page or log the user out
                window.location.href = "../../general/login.html"; // Redirect to login page or homepage
            } else {
                // Handle error from backend
                alert(data.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting your account. Please try again later.");
        } finally {
            // Reset the button to normal state
            confirmDeleteAccountBtn.disabled = false;
            confirmDeleteAccountBtn.innerHTML = "Delete Account";
        }
    });
});
