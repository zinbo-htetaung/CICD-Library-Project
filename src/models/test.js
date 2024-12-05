const newDate = new Date();
const end_date = new Date("2024-12-05");

// Set time to 23:59
end_date.setHours(23, 59, 0, 0);
console.log("unFormatted End Date:", end_date);
// Format as a readable string
const formattedEndDate = end_date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
});

console.log("Formatted End Date:", formattedEndDate);