document.addEventListener("DOMContentLoaded", async () => {

    fetch('../html/user_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        })

    fetch('../../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message'); // Message placeholder

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Retrieve reCAPTCHA response
        const captchaResponse = grecaptcha.getResponse();

        // Check if CAPTCHA is completed
        if (!captchaResponse) {
            formMessage.style.display = 'block';
            formMessage.style.color = 'red';
            formMessage.innerHTML = '❌ CAPTCHA is required. Please verify you are not a robot.';
            return;
        }

        // Clear previous messages
        formMessage.innerHTML = '';

        try {
            // Perform the POST request to send email
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Sending JSON data
                },
                body: JSON.stringify({ name, email, message, 'g-recaptcha-response': captchaResponse }), // Include CAPTCHA response
            });

            if (response.ok) {
                // Show success message
                formMessage.style.display = 'block';
                formMessage.style.color = 'green';
                formMessage.innerHTML = '🎉 Your message has been sent successfully! We will get back to you shortly.';
                setTimeout(() => {
                    formMessage.innerHTML = '';
                }, 5000)
                alert('🎉 Your message has been sent successfully! We will get back to you shortly.');
                form.reset(); // Clear form fields after successful submission
                grecaptcha.reset(); // Reset the reCAPTCHA widget
            } else {
                // Extract error details from the server response
                const errorData = await response.json();
                console.error('Server error:', errorData);

                // Show error message
                formMessage.style.display = 'block';
                formMessage.style.color = 'red';
                formMessage.innerHTML = `❌ Failed to send message. Error: ${errorData.error || 'Please try again.'}`;
                setTimeout(() => {
                    formMessage.innerHTML = '';
                }, 5000)
            }
        } catch (error) {
            console.error('Network error:', error);

            // Show network error message
            formMessage.style.display = 'block';
            formMessage.style.color = 'red';
            formMessage.innerHTML = '❌ Network error. Please check your connection and try again.';
            setTimeout(() => {
                formMessage.innerHTML = '';
            }, 5000)
        }
    });
});

let searchInProgress = false;
let chatbotEnabled = false;
let hasGreeted = false;
let liveChatActive = false;

function sendGreetingMessage() {
    if (!hasGreeted) {
        displayMessage("Hello! How can I assist you today? 😊", "bot");
        hasGreeted = true;
    }
    displayResponseOptions();
}

function closeChatbot() {
    document.getElementById('chatbot-container').style.display = 'none';
}

document.getElementById('chatbot-send-btn').addEventListener('click', function () {
    sendChatbotMessage();
});

document.getElementById("chatbot-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); 
        sendChatbotMessage(); 
    }
});

function sendChatbotMessage() {
    let userInput = document.getElementById('chatbot-input').value.trim();
    if (!userInput) return;
    
    if (!liveChatActive) {
        displayMessage(userInput, 'user');
    }

    if (searchInProgress) {
        searchBooks(userInput);
    } else {
        let botResponse = generateBotResponse(userInput);
        setTimeout(() => {
            displayMessage(botResponse, 'bot');
            displayResponseOptions();
        }, 500);
    }

    document.getElementById('chatbot-input').value = ''; // ✅ Clear input after sending
}

function displayMessage(message, sender) {
    console.log(liveChatActive);
    if (!liveChatActive) {
        let messageContainer = document.createElement('div');
        messageContainer.classList.add('message');
        messageContainer.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        // Use innerHTML to allow HTML content (like <a> tag) to be rendered correctly
        messageContainer.innerHTML = message;

        document.getElementById('chatbot-messages').appendChild(messageContainer);
        document.getElementById('chatbot-messages').scrollTop = document.getElementById('chatbot-messages').scrollHeight;
    } else {
        let chatContainer = document.getElementById('chatbot-messages');

        // Get last message element
        let lastMessage = chatContainer.lastElementChild;

        // Prevent duplicate consecutive messages
        if (lastMessage && lastMessage.innerHTML.trim() === message.trim()) {
            return;
        }

        let messageContainer = document.createElement('div');
        messageContainer.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageContainer.innerHTML = message;
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function generateBotResponse(userInput) {
    let doc = nlp(userInput.toLowerCase());
    if (liveChatActive) {
        sendMessageToAdmin(userInput);
        return null;  // 🚀 Do not respond with normal chatbot messages
    } else {

        if (doc.has('hello') || doc.has('hi') || doc.has('hey')) return "Hello! How can I assist you today? 😊";
        if (doc.has('hours') || doc.has('open') || doc.has('close')) return "We are open from 9 AM to 6 PM every day!";
        if (doc.has('books') || doc.has('collection')) return 'We have a large collection of books! <a href="displayAllBooks.html" target="_blank">Explore here.</a>';
        if (doc.has('membership') || doc.has('register')) return "Sign up for membership on our website or visit the library with an ID.";
        if (doc.has('contact') || doc.has('agent') || doc.has('help')) {
            displayMessage("Live agent chat enabled. Connecting you to an admin...", "bot");

            // Wait for 2-3 seconds before calling enableLiveChat
            setTimeout(() => {
                enableLiveChat();
            }, Math.floor(Math.random() * 1000) + 2000);

            return "⏳ Retrieving chat history..."
        }
        if (doc.has('search') && !searchInProgress) {
            searchInProgress = true;
            return "Please type the name of the book you're searching for.";
        }

        return "I'm not sure how to respond to that. Try asking about our opening hours, books, or membership.";
    }
}

async function searchBooks(bookName) {
    try {
        const response = await fetch(`/api/books/name/${bookName}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
            const data = await response.json();
            if (data.books.length > 0) {
                data.books.forEach((book, index) => {
                    let bookMessage = `📖 (${index + 1}) ${book.book_name} by ${book.author}.  <a href="displaySingleBook.html?bookId=${book.id}" target="_blank">Click here to view details ^^</a>`;
                    displayMessage(bookMessage, 'bot');
                });
            } else {
                displayMessage("❌ No books found. Try searching again.", 'bot');
            }
        } else {
            displayMessage("❌ No books found. Try searching again.", 'bot');
        }
    } catch (error) {
        console.error('Error searching books:', error);
        displayMessage("❌ Unable to search at the moment. Try again later.", 'bot');
    }
    searchInProgress = false;
}
async function enableLiveChat() {
    chatbotEnabled = true;
    liveChatActive = true; // Enable live chat mode

    // Simulate a 2-3 second loading delay before fetching messages
    setTimeout(async () => {
        displayMessage("✅ Live chat enabled. You are now connected with an admin.", "bot");
        await startAdminChat();

        // Start fetching messages every 3 seconds
        startMessagePolling();

        // Start the session timeout countdown (3 minutes)
        startChatSessionTimer();
    }, Math.floor(Math.random() * 1000) + 2000);
}

async function startAdminChat() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        displayMessage("⚠️ Please log in to chat with an admin.", "bot");
        return;
    }

    try {
        const response = await fetch(`/api/messages/user/${userId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const messages = await response.json();
    } catch (error) {
        console.error("Error fetching messages:", error);
        displayMessage("⚠️ Unable to connect to admin chat. Please try again later.", "bot");
    }
}

async function startChatSessionTimer() {
    let remainingTime = 120; // 2 minutes (in seconds)
    let warningDisplayed = false; // Flag to track if the warning has been displayed

    // Update countdown every second
    let countdownInterval = setInterval(() => {
        remainingTime--;

        // Display a warning message when 20 seconds are left
        if (remainingTime === 20 && !warningDisplayed) {
            displayMessage("⚠️ This live chat session will end in 20 seconds.", "bot");
            warningDisplayed = true; // Ensure the message is shown only once
        }

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            endLiveChatSession();
        }
    }, 1000);
}

// ✅ Function to display admin & user messages properly in chatbot
function displayAdminMessages(messages) {
    if (!messages || messages.length === 0) {
        displayMessage("No recent messages from the admin.", "bot");
        return;
    }

    // Sort messages by createdAt timestamp
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    messages.forEach(msg => {
        let senderName = msg.sender === "admin" ? "👨‍💼 Admin" : "🧑‍💻 You";
        let formattedTime = formatTimestamp(msg.createdAt);

        let formattedMessage = `<strong>${senderName}</strong> <br> ${msg.message} <br><span style="font-size: 12px; color: gray;">${formattedTime}</span>`;

        // Display messages correctly in chat
        displayMessage(formattedMessage, msg.sender === "admin" ? "bot" : "user");
    });
}

async function sendMessageToAdmin(userInput) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        displayMessage("⚠️ Please log in to chat with an admin.", "bot");
        return;
    }

    try {
        const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, sender: "user", message: userInput }),
        });

        if (!response.ok) throw new Error("Message failed to send");

        // Fetch latest messages after sending
        fetchMessages(userId);
    } catch (error) {
        console.error("Error sending message:", error);
        displayMessage("⚠️ Failed to send message. Try again.", "bot");
    }
}

function endLiveChatSession() {
    chatbotEnabled = false;
    liveChatActive = false;

    // Stop polling messages
    clearInterval(pollingInterval);

    displayMessage("⏳ Live chat session has expired. Please press live agent to chat again.", "bot");

    setTimeout(() => {
        displayMessage("Hello! How can I assist you today? 😊", "bot");
        displayResponseOptions();
    }, 2000);
}

let pollingInterval; // Store the polling interval reference
let lastMessageTimestamp = null;

async function fetchMessages(userId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`/api/messages/user/${userId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const messages = await response.json();
        if (!messages.message || messages.message.length === 0) return;

        // Filter out old messages based on the last fetched timestamp
        let newMessages = messages.message.filter(msg => {
            let messageTime = new Date(msg.createdAt).getTime();
            return !lastMessageTimestamp || messageTime > lastMessageTimestamp;
        });

        if (newMessages.length > 0) {
            lastMessageTimestamp = new Date(newMessages[newMessages.length - 1].createdAt).getTime();
            displayAdminMessages(newMessages);
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Function to start polling messages every 3 seconds
function startMessagePolling() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    // Fetch messages initially
    fetchMessages(userId);

    // Poll new messages every 3 seconds (but only fetch new ones)
    pollingInterval = setInterval(() => {
        fetchMessages(userId);
    }, 3000);
}

// ✅ Function to format timestamps into readable format (e.g., "Feb 5, 2025 - 9:01 AM")
function formatTimestamp(timestamp) {
    let date = new Date(timestamp);
    return date.toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true
    });
}

// Function to display response options (buttons)
function displayResponseOptions() {
    let optionsContainer = document.createElement('div');
    optionsContainer.classList.add('bot-response-options');

    const options = [
        { label: 'Library Hours', value: 'hours' },
        { label: 'Book Collection', value: 'books' },
        { label: 'Membership', value: 'membership' },
        { label: 'Contact a Live Agent', value: 'agent' },
        { label: 'Search Book', value: 'search' }
    ];

    options.forEach(option => {
        let button = document.createElement('button');
        button.textContent = option.label;
        button.onclick = function () {
            displayMessage(option.label, 'user');
            let botResponse = generateBotResponse(option.value);
            setTimeout(function () {
                displayMessage(botResponse, 'bot');
            }, 500);
        };
        optionsContainer.appendChild(button);
    });

    document.getElementById('chatbot-options').innerHTML = ''; // Clear previous options
    document.getElementById('chatbot-options').appendChild(optionsContainer);
}

document.getElementById('chatbot-toggle-btn').addEventListener('click', function () {
    let chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.style.display = chatbotContainer.style.display === "none" ? "flex" : "none";
    if (!hasGreeted) sendGreetingMessage();
});