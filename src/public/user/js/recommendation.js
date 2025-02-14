class RecommendationSystem {
    constructor() {
        this.autoScrollIntervals = {};
        this.loadAllRecommendations();

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.three-dots-btn') && !e.target.closest('.dropdown-menu')) {
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }

    createRecommendationSection(type, title, subtitle) {
        return `
            <div class="recommendation-section" id="${type}-section">
                <div class="recommendation-layout">
                    <div class="recommendation-title">
                        <h2>${title}</h2>
                        <p class="recommendation-subtitle">${subtitle}</p>
                    </div>
                    <div class="recommendation-carousel">
                        <button class="nav-arrow prev" data-section="${type}" aria-label="Previous"></button>
                        <div class="books-carousel" id="${type}-recommendations">
                            <div class="books-row"></div>
                        </div>
                        <button class="nav-arrow next" data-section="${type}" aria-label="Next"></button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadAllRecommendations() {
        const wrapper = document.querySelector('.recommendation-wrapper');
        wrapper.innerHTML = ''; // Clear existing content

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            // First get the author recommendations to get the author name
            const authorData = await this.loadRecommendations('author');
            const favoriteAuthor = authorData && authorData.length > 0 ? authorData[0].author : null;

            // Get genre recommendations first to dynamically display the most-read genre
            const genreData = await this.loadRecommendations('genre');

            // Extract the most-read genre
            let mostReadGenre = 'Books';
            if (genreData && genreData.length > 0) {
                // Look for the first book's categories
                const categoriesSet = new Set();
                genreData.forEach(book => {
                    if (book.categories && book.categories.length > 0) {
                        book.categories.forEach(category => categoriesSet.add(category));
                    }
                });

                // Convert set to array and take the first category if available
                const categories = Array.from(categoriesSet);
                mostReadGenre = categories.length > 0 ? categories[0] : 'Books';
            }

            // Load all recommendation types
            const sections = [
                { type: 'genre', title: `Because You Love<br>${mostReadGenre} Books`, subtitle: 'More adventures await you' },
                { type: 'popular', title: 'Monthly<br>Popular Books', subtitle: 'What others are reading' },
                { type: 'author', title: favoriteAuthor ? `Because You Love<br>Books from<br><span class="author-name">${favoriteAuthor}</span>` : '', subtitle: 'More from your favorite author' }
            ];

            for (const section of sections) {
                // Skip the author section if no favorite author found
                if (section.type === 'author' && !favoriteAuthor) continue;

                const data = section.type === 'author' ? authorData : await this.loadRecommendations(section.type);

                if (data && data.length > 0) {
                    wrapper.innerHTML += this.createRecommendationSection(
                        section.type,
                        section.title,
                        section.subtitle
                    );
                    this.displayBooks(data, section.type);
                    this.initializeAutoScroll(section.type);
                }
            }

            this.initializeEventListeners();
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    }

    async loadRecommendations(type) {
        try {
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };

            const endpoints = {
                'genre': '/api/recommendation/genre-based',
                'popular': '/api/recommendation/monthly-popular',
                'author': '/api/recommendation/author-based'
            };

            const response = await fetch(endpoints[type], {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to load ${type} recommendations`);
            }

            const data = await response.json();
            return data.recommendations;
        } catch (error) {
            console.error(`Error loading ${type} recommendations:`, error);
            return null;
        }
    }

    initializeEventListeners() {
        // Handle navigation arrow clicks
        document.querySelectorAll('.nav-arrow').forEach(arrow => {
            arrow.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                const direction = e.target.classList.contains('prev') ? -1 : 1;
                e.stopPropagation();
                this.scrollRecommendations(section, direction);
                this.resetAutoScroll(section);
            });
        });

        // Handle hover events for auto-scroll pause
        document.querySelectorAll('.books-carousel').forEach(carousel => {
            carousel.addEventListener('mouseenter', () => {
                const section = carousel.id.split('-')[0];
                clearInterval(this.autoScrollIntervals[section]);
            });

            carousel.addEventListener('mouseleave', () => {
                const section = carousel.id.split('-')[0];
                this.initializeAutoScroll(section);
            });
        });

        // Close dropdown if clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.three-dots-btn') && !e.target.closest('.dropdown-menu')) {
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }

    resetAutoScroll(section) {
        clearInterval(this.autoScrollIntervals[section]);
        this.initializeAutoScroll(section);
    }

    scrollRecommendations(section, direction) {
        const carouselContainer = document.querySelector(`#${section}-recommendations`);
        const container = carouselContainer.querySelector('.books-row');
        const cards = Array.from(container.children);
        if (cards.length === 0) return;

        container.style.transition = 'transform 0.5s ease';
        container.style.left = '0';
        container.style.transform = 'none';

        const cardWidth = cards[0].offsetWidth + 24;
        const currentIndex = Math.floor(carouselContainer.scrollLeft / cardWidth);
        let nextIndex;

        if (direction === 1) {
            nextIndex = currentIndex + 1;
            if (nextIndex > cards.length - 3) nextIndex = 0;
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = cards.length - 3;
        }

        const scrollAmount = nextIndex * cardWidth;
        carouselContainer.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    initializeAutoScroll(section) {
        // Check if should have auto-scroll
        const container = document.querySelector(`#${section}-recommendations .books-row`);
        if (!container || container.children.length <= 3) {
            return;
        }

        // Clear existing interval
        if (this.autoScrollIntervals[section]) {
            clearInterval(this.autoScrollIntervals[section]);
        }

        // Set up new interval
        this.autoScrollIntervals[section] = setInterval(() => {
            const container = document.querySelector(`#${section}-recommendations`);
            if (container && !container.matches(':hover')) {
                // Remove centering styles before scrolling
                const booksRow = container.querySelector('.books-row');
                if (booksRow) {
                    booksRow.style.left = '0';
                    booksRow.style.transform = 'none';
                }
                this.scrollRecommendations(section, 1);
            }
        }, 4000);
    }

    displayBooks(books, section) {
        const container = document.querySelector(`#${section}-recommendations .books-row`);
        if (!container) return;

        container.innerHTML = '';

        books.forEach(book => {
            const bookCard = this.createBookCard(book);
            container.appendChild(bookCard);
        });

        const shouldCenter = books.length <= 3;
        if (shouldCenter) {
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
        } else {
            container.style.left = '0';
            container.style.transform = 'none';
        }

        this.toggleNavigationElements(section, shouldCenter);

        // **Fix: Attach event listeners after book elements are added**
        this.attachDropdownListeners();
    }

    attachDropdownListeners() {
        document.querySelectorAll('.three-dots-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                const dropdown = button.nextElementSibling;

                // Hide other active dropdowns before showing the clicked one
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    if (menu !== dropdown) menu.classList.remove('active');
                });

                // Toggle the dropdown
                dropdown.classList.toggle('active');
            });
        });

        document.querySelectorAll('.wishlist-btn').forEach(button => { 
            button.addEventListener('click', async (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                try { 
                    const response = await fetch(`/api/booklist/wishlist/${button.dataset.id}`, { 
                        method: 'POST', 
                        headers: { 
                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                        } 
                    }); 
        
                    // Parse the response JSON
                    const responseData = await response.json();
        
                    if (response.ok) { 
                        alert(responseData.message || 'Added to Wishlist!'); 
                        location.reload(); 
                    } else {
                        // Display error message from the server
                        alert(responseData.message || 'Failed to add to Wishlist');
                    }
                } catch (error) { 
                    console.error('Error:', error); 
                    alert('An unexpected error occurred'); 
                } 
            }); 
        });

        document.querySelectorAll('.ignore-btn').forEach(button => { 
            button.addEventListener('click', async (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                try { 
                    const response = await fetch(`/api/booklist/ignore/${button.dataset.id}`, { 
                        method: 'POST', 
                        headers: { 
                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                        } 
                    }); 
        
                    // Parse the response JSON
                    const responseData = await response.json();
        
                    if (response.ok) { 
                        alert(responseData.message || 'Added to Ignored List!'); 
                        location.reload(); 
                    } else {
                        // Display error message from the server
                        alert(responseData.message || 'Failed to add to Ignored List');
                    }
                } catch (error) { 
                    console.error('Error:', error); 
                    alert('An unexpected error occurred'); 
                } 
            }); 
        });
    }

    toggleNavigationElements(section, hide) {
        // Get the navigation arrows for this section
        const prevButton = document.querySelector(`#${section}-section .nav-arrow.prev`);
        const nextButton = document.querySelector(`#${section}-section .nav-arrow.next`);

        if (hide) {
            // Hide navigation arrows
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';

            // Disable auto-scroll
            if (this.autoScrollIntervals[section]) {
                clearInterval(this.autoScrollIntervals[section]);
                delete this.autoScrollIntervals[section];
            }
        } else {
            // Show navigation arrows
            if (prevButton) prevButton.style.display = 'flex';
            if (nextButton) nextButton.style.display = 'flex';

            // Initialize auto-scroll only if have more than 3 books
            this.initializeAutoScroll(section);
        }
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';

        const avgRating = book.average_rating ||
            (book.review && book.review.length
                ? book.review.reduce((acc, rev) => acc + rev.rating, 0) / book.review.length
                : 0);

        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm position-relative">
                <button class="three-dots-btn" type="button">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <div class="dropdown-menu">
                    <button class="menu-item wishlist-btn" data-id="${book.id}">
                        <i class="bi bi-bookmark-plus"></i> Add to Wishlist
                    </button>
                    <button class="menu-item ignore-btn" data-id="${book.id}">
                        <i class="bi bi-eye-slash"></i> Ignore Book
                    </button>
                </div>
                <a href="displaySingleBook.html?bookId=${book.id}" class="book-content">
                    <img src="../../images/book_cover.webp" alt="${book.book_name}" class="card-img-top book-cover">
                    <div class="card-body">
                        <h5 class="card-title book-title">${book.book_name}</h5>
                        <p class="card-text book-author">${book.author}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="book-rating">
                                <i class="bi bi-star-fill text-warning"></i> ${avgRating.toFixed(1)}
                            </div>
                            <span class="badge ${book.available_copies > 0 ? 'bg-success' : 'bg-danger'}">
                                ${book.available_copies > 0 ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                </a>
            </div>
        `;
        return card;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecommendationSystem();
});

document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.options-dropdown.show');
    dropdowns.forEach(dropdown => {
        if (!dropdown.parentElement.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
});