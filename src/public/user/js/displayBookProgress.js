document.addEventListener("DOMContentLoaded", async () => {
    // Load navbar
    fetch('../html/user_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }
        })

    // Load footer
    fetch('../../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });


    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/api/bookProgress", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 404) {
                const unreadSection = document.getElementById(
                    "unreadBookSection"
                );
                unreadSection.innerHTML = `
                    <div class="alert alert-danger text-center">
                        Currently reading no books yet... Rent and start reading a book!
                    </div>
                `;
            } else {
                alert(`Error: ${errorData.message}`);
            }
            return;
        }

        const data = await response.json();
        const bookProgresses = data.bookProgresses;

        // Group books into sections
        const unread = bookProgresses.filter((book) => book.status === "Unread");
        const reading = bookProgresses.filter((book) => book.status === "Reading");
        const completed = bookProgresses.filter((book) => book.status === "Completed");

        renderBookProgressSection("Unread Books", unread, "unreadBookSection", false, true, false);
        renderBookProgressSection(
            "Currently Reading",
            reading,
            "readingBookSection",
            true,
            true,
            false
        );
        renderBookProgressSection(
            "Completed Books",
            completed,
            "completedBookSection",
            true,
            false,
            true
        );
    } catch (error) {
        console.error("Failed to fetch book progress data:", error);
        alert("An error occurred while loading book progress. Please try again.");
    }

});

function renderBookProgressSection(
    title,
    books,
    sectionId,
    showReset = false,
    showFinish = false,
    showShare = false
  ) {
    const section = document.getElementById(sectionId);

    section.innerHTML = `<h3 class="text-start mb-4">${title}</h3>`;
    // If no books in the current section
    if (books.length === 0) {
        section.innerHTML += `<div class="alert alert-warning text-center">No books in this section</div>`;
        return;
    }
    
    const row = document.createElement("div");
    row.className = "row gy-4";
  
    books.forEach((book) => {
      const progressBar = `
        <div class="progress" style="height: 10px;">
          <div 
            class="progress-bar progress-bar-striped bg-info" 
            role="progressbar" 
            style="width: ${book.progress}%;" 
            aria-valuenow="${book.progress}" 
            aria-valuemin="0" 
            aria-valuemax="100">
          </div>
        </div>`;
  
      const buttons = `
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-warning read-btn" data-id="${book.id}">
            Read
          </button>
          ${
            showReset
              ? `<button class="btn btn-danger reset-btn" data-id="${book.id}">
                  Reset
                </button>`
              : ""
          }
          ${
            showFinish
              ? `<button class="btn btn-primary finish-btn" data-id="${book.id}">
                  Finish Reading
                </button>`
              : ""
          }
          ${
            showShare
              ? `<div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      Share<i class="bi bi-share-fill ms-2"></i>
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                      <button class="dropdown-item btn btn-light share-btn" data-id="${book.id}"><i class="bi bi-envelope-paper-fill me-3"></i>Gmail</button>
                      <button class="dropdown-item btn btn-light share-btn" data-id="${book.id}"><i class="bi bi-twitter-x me-3"></i>X</button>
                    </div>
                </div>`
              : ""
          }
        </div>`;
  
      const col = document.createElement("div");
      col.className = "col-lg-6 col-md-6 col-12";
  
      col.innerHTML = `
        <div class="card shadow-sm">
          <div class="row g-0">
            <div class="col-4 bg-light d-flex align-items-center justify-content-center">
              <img src="../../images/book_cover.webp" class="img-fluid rounded-end" alt="Book Image" 
                style="max-height: 150px; object-fit: contain;">
            </div>

            <div class="col-8">
              <div class="card-body">
                <h5 class="card-title fw-bold">${book.book_name}</h5>
                <p class="card-text text-muted"><em>By : ${book.author}</em></p>
                ${progressBar}
                ${buttons}
              </div>
            </div>
          </div>
        </div>`;
  
      row.appendChild(col);
    });
  
    section.appendChild(row);

    section.addEventListener("click", async (event) => {
      const target = event.target;
  
      if (target.classList.contains("read-btn")) {
        const progressId = target.getAttribute("data-id");
        window.location.href = `book.html?progressId=${progressId}`;
      }
  
      if (target.classList.contains("finish-btn")) {
        const progressId = target.getAttribute("data-id");
        await updateBookProgress(progressId, "complete");
      }
  
      if (target.classList.contains("reset-btn")) {
        const progressId = target.getAttribute("data-id");
        await updateBookProgress(progressId, "reset");
      }

      if (target.classList.contains("share-btn")) {
        const progressId = target.getAttribute("data-id");
        const shareType = target.innerText.trim();
        await shareProgress(progressId, shareType);
      }
    });
}

async function updateBookProgress(id, action) {
  const token = localStorage.getItem("token");
  const endpoint =
      action === "complete"
      ? `/api/bookProgress/complete/${id}`
      : `/api/bookProgress/reset/${id}`;

  try {
      const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      },
      });

      const result = await response.json();

      if (response.ok) {
          alert(result.message);
          window.location.reload();
      } else {
          alert(result.message);
      }
  } catch (error) {
      alert("An error occurred. Please try again.");
      console.error(error);
  }
}

async function shareProgress(id, shareType) {
  const token = localStorage.getItem("token");
  var bookProgressObj;

  try {
      const response = await fetch(`/api/bookProgress/share/${id}`, {
      method: "GET",
      headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      },
      });

      const result = await response.json();

      if (response.ok) {
        bookProgressObj = result;
      } else {
          alert(result.message);
      }
  } catch (error) {
      alert("An error occurred. Please try again.");
      console.error(error);
  }

  // console.log(bookProgressObj);
  const bookName = bookProgressObj.bookProgress.book_name;
  const bookId = bookProgressObj.bookProgress.id;
  const author = bookProgressObj.bookProgress.author;
  const appName = "Vaselene Library";

  switch (shareType) {
    case("Gmail"):    
      const body = encodeURIComponent(
        `I just completed reading "${bookName}" by ${author}! Check it out here ${appName} - https://vaselene-library-bragatg9f4d6e3cu.southeastasia-01.azurewebsites.net/general/html/displaySingleBook.html?bookId=${bookId}`
      );
      const subject = encodeURIComponent("I Finished a Great Book!");
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${subject}&body=${body}`,
        "_blank"
      );
      break;

    case("X"):
      const tweetText = encodeURIComponent(
        `I just completed reading "${bookName}" by ${author}! Check it out on ${appName} - https://vaselene-library-bragatg9f4d6e3cu.southeastasia-01.azurewebsites.net/general/html/displaySingleBook.html?bookId=${bookId}`
      );

      window.open(
          `https://x.com/intent/tweet?text=${tweetText}`,
          "_blank"
      );
      break;
  }
};