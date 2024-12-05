// Convert date strings into Date objects
const endDate = new Date("2024-12-04");
const endDate2 = new Date("2024-12-05");
const endDate3 = new Date("2024-12-06");
const today = new Date();

// Set the time to 23:59:00 for comparison
endDate.setHours(23, 59, 0, 0);
endDate2.setHours(23, 59, 0, 0);
endDate3.setHours(23, 59, 0, 0);
today.setHours(23, 59, 0, 0);

// Format the dates for display
const end_date = endDate.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
});
const end_date2 = endDate2.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
});
const end_date3 = endDate3.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
});
const today_date = today.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
});

// Compare the dates
const isDue = today > endDate;
const isDue2 = today > endDate2;
const isDue3 = today > endDate3;

console.log(isDue);   // true or false depending on today's date
console.log(isDue2);  // true or false depending on today's date
console.log(isDue3);  // true or false depending on today's date
console.log("Today:", today_date);
console.log("End Date 1:", end_date);
console.log("End Date 2:", end_date2);
console.log("End Date 3:", end_date3);