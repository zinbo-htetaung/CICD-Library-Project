document.addEventListener("DOMContentLoaded", () => {
    fetch('admin_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error("Error loading navbar:", error));

    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    fetchMostQueuedBooks(5);
    fetchMostQueuedGenre();
    fetchQueueTrendsOverTime();

    // Redirect back to Queue Management
    document.getElementById("backToQueueBtn").addEventListener("click", () => {
        window.location.href = "queueManagement.html";
    });

    document.getElementById("fetchBooksBtn").addEventListener("click", () => {
        console.log("fetchBooksBtn clicked");
        const numBooks = parseInt(document.getElementById("numBooks").value) || 5;
        if (numBooks < 1 || numBooks > 5) {
            alert("Please enter a number between 1 and 5");
            return;
        };
        fetchMostQueuedBooks(numBooks);
    });

    // Fetch Most Queued Books
    async function fetchMostQueuedBooks(limit) {
        try {
            console.log("limit", limit);
            const response = await fetch(`/api/queue/admin/mostQueuedBook?limit=${limit}`);
            if (!response.ok) throw new Error("Failed to fetch most queued books.");

            const data = await response.json();
            console.log("data", data);
            console.log(data);
            displayMostQueuedBooks(data.mostQueuedBooks);
        } catch (error) {
            console.error("Error fetching most queued books:", error);
        }
    }

    // Fetch Most Queued Genre
    async function fetchMostQueuedGenre() {
        try {
            const response = await fetch("/api/queue/admin/mostQueuedGenre");
            if (!response.ok) throw new Error("Failed to fetch most queued genre.");

            const data = await response.json();
            displayMostQueuedGenre(data.mostQueuedGenre);
        } catch (error) {
            console.error("Error fetching most queued genre:", error);
        }
    }

    // Fetch Queue Trends Over Time
    async function fetchQueueTrendsOverTime() {
        try {
            const response = await fetch("/api/queue/admin/queueTrends?interval=month");
            if (!response.ok) throw new Error("Failed to fetch queue trends.");

            const data = await response.json();
            displayQueueTrendsOverTime(data.queueTrends);
        } catch (error) {
            console.error("Error fetching queue trends:", error);
        }
    }

    let mostQueuedBooksChart = null; // Store chart instance

    function displayMostQueuedBooks(books) {
        const labels = books.map(book => book.book_name);
        const counts = books.map(book => book.queue_count);

        // Destroy the existing chart instance if it exists
        if (mostQueuedBooksChart !== null) {
            mostQueuedBooksChart.destroy();
        }

        // Create a new chart
        mostQueuedBooksChart = new Chart(document.getElementById("mostQueuedBooksChart"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Queue Count",
                    data: counts,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Display Top 3 Books Below the Chart
        const topBooksList = document.getElementById("topBooksList");
        topBooksList.innerHTML = ""; // Clear existing content

        books.slice(0, 3).forEach((book, index) => {
            const medal = ["🥇", "🥈", "🥉"][index]; // Gold, Silver, Bronze
            const listItem = document.createElement("div");
            listItem.className = "list-group-item py-2";
            listItem.innerHTML = `
            <span class="fw-bold">${medal} ${book.book_name}</span>
            <p class="mb-0 text-muted d-inline mx-2 fw-bold">(Queue Count: ${book.queue_count})</p>
        `;
            topBooksList.appendChild(listItem);
        });
    }



    // Display Most Queued Genre in Chart
    function displayMostQueuedGenre(genres) {
        if (!Array.isArray(genres) || genres.length === 0) {
            console.warn("No genre data available.");
            document.getElementById("topGenresList").innerHTML = `<p class="text-center">No data available.</p>`;
            return;
        }

        const labels = genres.map(genre => genre.genre);
        const counts = genres.map(genre => genre.queue_count);
        const colors = [
            "rgba(255, 99, 132, 0.6)", "rgba(255, 205, 86, 0.6)", "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(201, 203, 207, 0.6)",
            "rgba(255, 159, 64, 0.6)", "rgba(144, 238, 144, 0.6)", "rgba(240, 128, 128, 0.6)", "rgba(173, 216, 230, 0.6)"
        ];

        // Update the Doughnut Chart for Most Queued Genre
        new Chart(document.getElementById("mostQueuedGenreChart"), {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    label: "Queue Count",
                    data: counts,
                    backgroundColor: colors.slice(0, genres.length),
                    borderColor: colors.map(color => color.replace("0.6", "1")), // Darker border
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });

        // Display Top 3 Most Queued Genres Below the Chart
        const topGenresList = document.getElementById("topGenresList");
        topGenresList.innerHTML = ""; // Clear existing content

        genres.slice(0, 3).forEach((genre, index) => {
            const medalIcons = ["🥇", "🥈", "🥉"]; // Gold, Silver, Bronze
            const medal = medalIcons[index]; // Assign the correct medal

            const listItem = document.createElement("div");
            listItem.className = "list-group-item py-2";
            listItem.innerHTML = `
                <span class="fw-bold">${medal} ${genre.genre}</span>
                <p class="mb-0 text-muted d-inline mx-2 fw-bold">(Queue Count: ${genre.queue_count})</p>
            `;
            topGenresList.appendChild(listItem);
            console.log(genre);
        });

    }



    // Display Queue Trends Over Time in Chart
    function displayQueueTrendsOverTime(trends) {
        if (!trends || trends.length === 0) {
            console.warn("No queue trend data available.");
            return;
        }
    
        const groupedData = {}; // Group by genre
        trends.forEach(trend => {
            const { genre, interval, queue_count } = trend;
            if (!groupedData[genre]) {
                groupedData[genre] = { labels: [], counts: [] };
            }
            groupedData[genre].labels.push(interval);
            groupedData[genre].counts.push(queue_count);
        });
    
        const distinctColors = [
            "rgba(255, 99, 132, 0.8)",   // Red
            "rgba(54, 162, 235, 0.8)",   // Blue
            "rgba(255, 206, 86, 0.8)",   // Yellow
            "rgba(75, 192, 192, 0.8)",   // Teal
            "rgba(153, 102, 255, 0.8)",  // Purple
            "rgba(255, 159, 64, 0.8)",   // Orange
            "rgba(201, 203, 207, 0.8)",  // Grey
            "rgba(0, 128, 0, 0.8)",      // Green
            "rgba(128, 0, 128, 0.8)",    // Dark Purple
            "rgba(220, 20, 60, 0.8)"     // Crimson
        ];
        
        const datasets = Object.keys(groupedData).map((genre, index) => ({
            label: genre,
            data: groupedData[genre].counts,
            backgroundColor: distinctColors[index % distinctColors.length], // Cycle through distinct colors
            borderColor: distinctColors[index % distinctColors.length].replace("0.8", "1"), // Darker border
            borderWidth: 2,
            tension: 0.3,
        }));
        
    
        new Chart(document.getElementById("queueTrendsChart"), {
            type: "line",
            data: {
                labels: [...new Set(trends.map(trend => trend.interval))], // Unique X-Axis Labels
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `Genre: ${datasets[tooltipItem.datasetIndex].label} | Count: ${tooltipItem.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
});
