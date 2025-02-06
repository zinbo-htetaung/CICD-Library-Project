document.addEventListener("DOMContentLoaded", () => {
    const submitProfilePicBtn = document.getElementById("submitProfilePicBtn");

    // Add event listener to the submit button
    submitProfilePicBtn.addEventListener("click", async () => {
        await submitProfilePic();
    });
});

let selectedProfilePic = null;

// Function to highlight the selected profile picture
function selectProfilePic(imageElement) {
    // Deselect all profile pictures
    const allImages = document.querySelectorAll(".profile-pic-option");
    allImages.forEach((img) => {
        img.classList.remove("border-primary"); // Remove active border
    });

    // Add the active border to the selected image
    imageElement.classList.add("border-primary");
    selectedProfilePic = imageElement.src; // Save the selected profile picture URL
}

// Function to handle submission of the selected profile picture
async function submitProfilePic() {
    try {
        if (!selectedProfilePic) {
            alert("Please select a profile picture before submitting.");
            return;
        }

        console.log("Selected Profile Picture URL:", selectedProfilePic);

        // Send the selected profile picture to the backend
        const response = await fetch("/api/users/updateProfilePicture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
            },
            body: JSON.stringify({ avatar: selectedProfilePic }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update profile picture:", errorData);
            alert(errorData.message || "Failed to update profile picture.");
            return;
        }

        const result = await response.json();
        console.log("Profile picture updated successfully:", result);

        // Update the profile picture displayed on the page
        const pfpImages = document.querySelectorAll(".pfpImg");
        pfpImages.forEach((img) => img.setAttribute("src", selectedProfilePic));

        // Notify the user of success
        alert( "Profile picture updated successfully!");

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("chgPfpPic"));
        if (modal) modal.hide();
    } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("An error occurred while updating your profile picture. Please try again.");
    }
}
