document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // Load navbar and footer
    await loadNavbarAndFooter();

    // Fetch insights data
    const insightsData = await fetchInsights(token);

    // Log fetched data for debugging
    console.log('Fetched insights data:', insightsData);

    // Render charts and setup filters if data exists
    if (insightsData) {
        renderAllCharts(insightsData);
        setupTimeframeFilter(insightsData);
    }
});

// Load Navbar and Footer
async function loadNavbarAndFooter() {
    try {
        const navbarHTML = await fetchHTML('admin_navbar.html');
        document.getElementById('navbar-container').innerHTML = navbarHTML;

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', logout);

        const footerHTML = await fetchHTML('../footer.html');
        document.getElementById('footer-container').innerHTML = footerHTML;
    } catch (error) {
        console.error('Error loading navbar or footer:', error);
    }
}

// Fetch HTML Helper
async function fetchHTML(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch HTML from ${url}`);
    return await response.text();
}

// Fetch Insights Data
async function fetchInsights(token) {
    try {
        const response = await fetch('/api/insights', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error('Failed to fetch insights');
        return await response.json();
    } catch (error) {
        console.error('Error fetching insights:', error);
        return null;
    }
}

// Render All Charts
function renderAllCharts(data) {
    if (data.booksByCategory) renderPieChart(data.booksByCategory);
    if (data.topRentedBooks) renderBarChart(data.topRentedBooks);
    if (data.maxRentalsByUser) renderHorizontalBarChart(data.maxRentalsByUser);
}

// Setup Timeframe Filter for Line Chart
function setupTimeframeFilter(data) {
    const filterSelect = document.getElementById('timeframe-filter');
    const rentalsCtx = document.getElementById('monthlyRentalsChart').getContext('2d');
    const yearFilterContainer = document.getElementById('year-filter-container');

    if (!filterSelect || !data.monthlyRentals) return console.error('Timeframe filter or rentals data not found.');

    filterSelect.innerHTML = `
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
    `;

    filterSelect.addEventListener('change', (event) => {
        const timeframe = event.target.value;
        if (timeframe === 'monthly') {
            const availableYears = data.monthlyRentals.map((item) => item.year);
            setupYearFilter(availableYears, data.monthlyRentals, rentalsCtx);
        } else if (timeframe === 'yearly') {
            yearFilterContainer.innerHTML = ''; // Clear year filter for yearly view
            renderLineChart(rentalsCtx, formatYearlyData(data.monthlyRentals), 'Yearly Rentals');
        }
    });

    // Default: Show monthly data for the latest year
    const availableYears = data.monthlyRentals.map((item) => item.year);
    setupYearFilter(availableYears, data.monthlyRentals, rentalsCtx);
}

// Setup Year Filter
function setupYearFilter(years, monthlyRentals, ctx) {
    const yearFilterContainer = document.getElementById('year-filter-container');
    yearFilterContainer.innerHTML = `
        <label for="year-filter" class="form-label">Select Year:</label>
        <select id="year-filter" class="form-select w-auto">
            ${years.map((year) => `<option value="${year}">${year}</option>`).join('')}
        </select>
    `;

    const yearFilter = document.getElementById('year-filter');
    yearFilter.addEventListener('change', (event) => {
        const selectedYear = parseInt(event.target.value, 10);
        const yearData = monthlyRentals.find((item) => item.year === selectedYear);
        renderLineChart(ctx, formatMonthlyData(yearData), `Monthly Rentals (${selectedYear})`);
    });

    // Render chart for the latest year by default
    const latestYear = Math.max(...years);
    const latestYearData = monthlyRentals.find((item) => item.year === latestYear);
    renderLineChart(ctx, formatMonthlyData(latestYearData), `Monthly Rentals (${latestYear})`);
}

// Render Pie Chart for Books by Category
function renderPieChart(data) {
    const ctx = document.getElementById('booksByCategoryChart').getContext('2d');
    const categories = [...new Set(data.categories || [])];
    const counts = data.counts || [];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C0C0C0'];

    if (categories.length && counts.length) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: counts,
                    backgroundColor: colors.slice(0, categories.length),
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Books by Category' },
                },
            },
        });
    }
}

// Render Bar Chart for Top Rented Books
function renderBarChart(data) {
    const ctx = document.getElementById('topRentedBooksChart').getContext('2d');
    const labels = data.books || [];
    const counts = data.rentals || [];
    const backgroundColor = '#4BC0C0';

    if (labels.length && counts.length) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Rentals',
                    data: counts,
                    backgroundColor,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Top-Rented Books' },
                },
            },
        });
    }
}

// Render Horizontal Bar Chart for Max Rentals by Users
function renderHorizontalBarChart(data) {
    const ctx = document.getElementById('maxRentalsByUserChart').getContext('2d');
    const labels = data.users || [];
    const counts = data.rentals || [];
    const backgroundColor = '#FF6384';

    if (labels.length && counts.length) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Rentals',
                    data: counts,
                    backgroundColor,
                }],
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Users with Maximum Rentals' },
                },
            },
        });
    }
}

// Render Line Chart
let currentLineChart = null;
function renderLineChart(ctx, data, title) {
    if (currentLineChart) currentLineChart.destroy();
    currentLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: title,
                data: data.counts,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54,162,235,0.2)',
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: { display: true, text: title },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: (value) => Math.floor(value),
                    },
                },
            },
        },
    });
}

// Helper: Format Monthly Data
// Helper: Format Monthly Data
function formatMonthlyData(yearData) {
    if (!yearData || !yearData.months || !yearData.rentals) return { labels: [], counts: [] };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Initialize an array of 12 months with 0 rentals
    const monthlyRentals = Array(12).fill(0);

    // Populate the rentals for the months that have data
    yearData.months.forEach((month, index) => {
        monthlyRentals[month - 1] = yearData.rentals[index];
    });

    return {
        labels: monthNames, // Display all months
        counts: monthlyRentals, // Include zeros for months without rentals
    };
}

// Helper: Format Yearly Data
function formatYearlyData(data) {
    if (!data || !Array.isArray(data)) return { labels: [], counts: [] };

    const labels = data.map((item) => item.year.toString());
    const counts = data.map((item) => item.rentals.reduce((acc, count) => acc + count, 0));

    return { labels, counts };
}