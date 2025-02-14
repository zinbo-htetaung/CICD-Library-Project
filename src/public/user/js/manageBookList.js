document.addEventListener("DOMContentLoaded", () => {
    const wishlistTableBody = document.getElementById("wishlistTableBody");
    const ignorelistTableBody = document.getElementById("ignorelistTableBody");

    const userId = localStorage.getItem("user_id");

    // Function to display a no data message
    function displayNoDataMessage(tableBody, listType) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="alert alert-info">
                        No books in your ${listType} yet. 
                        Start exploring books to add to your ${listType}!
                    </div>
                </td>
            </tr>
        `;
    }

    // Function to fetch wishlist from backend
    async function fetchWishlist() {
        try {
            const response = await fetch(`/api/booklist/wishlist/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    displayNoDataMessage(wishlistTableBody, 'wishlist');
                } else {
                    throw new Error("Failed to fetch wishlist. Please try again later.");
                }
                return;
            }

            const responseData = await response.json();
            const data = responseData.books;
            if (data && data.length > 0) {
                appendBooksToTable(wishlistTableBody, data, 'wishlist');
            } else {
                displayNoDataMessage(wishlistTableBody, 'wishlist');
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            wishlistTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Error loading wishlist. Please try again later.
                    </td>
                </tr>
            `;
        }
    }

    // Function to fetch ignore list from backend
    async function fetchIgnoreList() {
        try {
            const response = await fetch(`/api/booklist/ignore/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    displayNoDataMessage(ignorelistTableBody, 'ignore list');
                } else {
                    throw new Error("Failed to fetch ignore list. Please try again later.");
                }
                return;
            }

            const responseData = await response.json();
            const data = responseData.books;
            if (data && data.length > 0) {
                appendBooksToTable(ignorelistTableBody, data, 'ignorelist');
            } else {
                displayNoDataMessage(ignorelistTableBody, 'ignore list');
            }
        } catch (error) {
            console.error("Error fetching ignore list:", error);
            ignorelistTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Error loading ignore list. Please try again later.
                    </td>
                </tr>
            `;
        }
    }

    // Function to append books into the table
    function appendBooksToTable(tableBody, books, listType) {
        tableBody.innerHTML = ""; // Clear existing table rows
        books.forEach((book) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="text-center">${book.bookId}</td>
                <td>${book.bookName}</td>
                <td>${book.author}</td>
                <td class="text-center">${new Date(book.addedAt).toLocaleDateString()}</td>
                <td class="text-center">
                    <button class="btn btn-danger border-1 border-black w-75" onclick="removeFrom${capitalize(listType)}(${book.bookId})">
                        Remove from ${capitalize(listType)}
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Expose functions to global scope
    window.removeFromWishlist = async function(bookId) {
        try {
            const response = await fetch(`/api/booklist/wishlist/${bookId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to remove book from wishlist");
            }
            alert("Book removed from wishlist");
            fetchWishlist(); // Refresh the table
        } catch (error) {
            console.error("Error removing book from wishlist:", error);
        }
    };

    window.removeFromIgnorelist = async function(bookId) {
        try {
            const response = await fetch(`/api/booklist/ignore/${bookId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to remove book from ignore list");
            }
            alert("Book removed from ignore list");
            fetchIgnoreList(); // Refresh the table
        } catch (error) {
            console.error("Error removing book from ignore list:", error);
        }
    };

    // Capitalize first letter of listType (e.g. 'wishlist' to 'Wishlist')
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initial fetch
    fetchWishlist();
    fetchIgnoreList();
});