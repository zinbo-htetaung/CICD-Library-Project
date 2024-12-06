document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.querySelector("#chgPwButton");
    saveButton.addEventListener("click", async (event) => {
        event.preventDefault(); // Prevent default form submission
        console.log("hi")
        await changePassword();
    });
});

async function changePassword() {
    // Get input values from the password modal
    const oldPassword = document.querySelector("#chgPwModal input[name='oldPw']").value.trim();
    const newPassword = document.querySelector("#chgPwModal input[name='newPw']").value.trim();

    // Validate inputs
    if (!oldPassword || !newPassword) {
        alert("Both old and new passwords are required!");
        return;
    }

    if (newPassword.length < 6) {
        alert("New password must be at least 6 characters long!");
        return;
    }

    try {
        // Call the backend API
        const response = await fetch("/api/users/updatePassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`

            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update password");
        }

        const result = await response.json();
        console.log("Password updated:", result.message);

        alert("Password updated successfully!");
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("chgPwModal"));
        modal.hide();
    } catch (error) {
        console.error("Error updating password:", error);
        alert(error.message || "An unexpected error occurred. Please try again.");
    }
}
