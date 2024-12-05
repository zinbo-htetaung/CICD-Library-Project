document.addEventListener("DOMContentLoaded", () => {
    const updateButton = document.getElementById('updateButton');
    updateButton.addEventListener("click", async () => {
        await updateProfile();
    });
});

async function updateProfile() {
    // Get input values from the profile form
    const name = document.getElementById('modalProfileName').value.trim();
    const email = document.getElementById('modalProfileEmail').value.trim();
    const address = document.getElementById('modalProfileAddress').value.trim();

    // Validate inputs
    if (!name || !email || !address) {
        alert("All fields are required!");
        return;
    }

    try {
        // Call the backend API to update the profile
        const response = await fetch("/api/users/updateProfile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` // Pass token for authentication
            },
            body: JSON.stringify({ name, email, address }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update profile");
        }

        const result = await response.json();
        console.log("Profile updated:", result.message);

        alert("Profile updated successfully!");

        // Close the update modal
        const updateModal = bootstrap.Modal.getInstance(document.getElementById("updateModal"));
        updateModal.hide();

        // Call fetchProfileData to refresh the profile data after the update
        fetchProfileData();

    } catch (error) {
        console.error("Error updating profile:", error);
        alert(error.message || "An unexpected error occurred. Please try again.");
    }
}
