document.addEventListener("DOMContentLoaded", () => {
    const updateButton = document.querySelector(".btn.bg-warning");
    updateButton.addEventListener("click", () => {
        updateProfile();
    });
});

async function updateProfile() {
    // Get input values from the profile form
    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const address = document.getElementById("profileAddress").value.trim();

    // Validate inputs
    if (!name || !email || !address) {
        alert("All fields are required!");
        return;
    }

    try {
        // Call the backend API
        const response = await fetch("/api/users/updateProfile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}` // Pass token for authentication
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
    } catch (error) {
        console.error("Error updating profile:", error);
        alert(error.message || "An unexpected error occurred. Please try again.");
    } finally {
        // Always call getProfileInfo.js regardless of success or failure
        loadGetProfileInfoScript();
    }
}

function loadGetProfileInfoScript() {
    const script = document.createElement("script");
    script.src = "../js/getProfileInfo.js"; // Path to your `getProfileInfo.js`
    script.type = "text/javascript";
    document.body.appendChild(script);

    script.onload = () => console.log("getProfileInfo.js executed successfully");
    script.onerror = () => console.error("Failed to load getProfileInfo.js");
}
