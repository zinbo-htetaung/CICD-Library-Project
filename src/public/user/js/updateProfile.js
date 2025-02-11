document.addEventListener("DOMContentLoaded", () => {
    const updateButton = document.getElementById('updateButton');
    updateButton.addEventListener("click", async () => {
        await updateProfile();
    });
});

async function updateProfile() {
    try {
        console.log("Starting updateProfile function...");

        // Fetch input values
        const name = document.getElementById('modalProfileName').value.trim();
        const email = document.getElementById('modalProfileEmail').value.trim();
        const address = document.getElementById('modalProfileAddress').value.trim();

        console.log("Fetched inputs:", { name, email, address });

        // Validate inputs
        if (!name || !email || !address) {
            alert("All fields are required!");
            console.error("Validation error: Missing fields");
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            alert("Invalid email format. Please correct it.");
            console.error("Validation error: Invalid email format");
            return;
        }

        const payload = JSON.stringify({ name, email, address });
        console.log("Payload prepared:", payload);

        // Timeout helper
        const timeout = (ms) =>
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));

        // API request with timeout
        console.log("Sending API request to update profile...");
        const response = await Promise.race([
            fetch("/api/users/updateProfile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
                },
                body: payload,
            }),
            timeout(15000), // Set a timeout of 15 seconds
        ]);

        // Handle response
        if (!response.ok) {
            let errorMessage = `Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error("Failed to parse error response:", parseError);
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Profile updated successfully:", result);

        // Notify the user
        alert(result.message || "Profile updated successfully!");

        // Close the modal
        console.log("Closing the update modal...");
        const updateModal = bootstrap.Modal.getInstance(document.getElementById("updateModal"));
        if (updateModal) {
            updateModal.hide();
        }

        // Refresh profile data
        console.log("Refreshing profile data...");
        await fetchProfileData();
        console.log("Profile data refreshed.");
    } catch (error) {
        console.error("Error during profile update:", error);
        alert(error.message || "An error occurred while updating your profile. Please try again.");
    } finally {
        console.log("updateProfile function completed.");
    }
}
