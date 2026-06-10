function filterQuotes() {
    var input = document.getElementById("searchInput");
    var searchTerms = input.value.toUpperCase().split(/\s+/);
    var quotes = document.getElementsByTagName("p");
    var headers = document.querySelectorAll("h2, h3");
    var noResults = document.getElementById("search-no-results");

    // Filter quotes
    Array.from(quotes).forEach(quote => {
        var quoteText = (quote.textContent || quote.innerText).toUpperCase();
        var allMatch = searchTerms.every(term => quoteText.includes(term));
        quote.style.display = allMatch ? "" : "none";
    });

     // Filter headers
    Array.from(headers).forEach(header => {
        var nextSibling = header.nextElementSibling;
        var hideHeader = true;
        if (header.tagName === "H2") {
            while (nextSibling && nextSibling.tagName !== "H2") {
                if (nextSibling.tagName === "H3") {
                    nextSibling = nextSibling.nextElementSibling;
                    continue;
                }
                if (nextSibling.style.display !== "none") {
                    hideHeader = false;
                    break;
                }
                nextSibling = nextSibling.nextElementSibling;
            }
        } else if (header.tagName === "H3") {
            while (nextSibling && nextSibling.tagName !== "H3" && nextSibling.tagName !== "H2") {
                if (nextSibling.style.display !== "none") {
                    hideHeader = false;
                    break;
                }
                nextSibling = nextSibling.nextElementSibling;
            }
        }
        header.style.display = hideHeader ? "none" : "";
    });

    // display the "no results" message as needed
    var anyVisible = Array.from(quotes).some(quote => quote.style.display !== "none");
    noResults.style.display = anyVisible ? "none" : "";
}

// flashcards
(function () {
    const button = document.getElementById("flashcard-button");
    const mask = document.getElementById("flashcard-mask");
    const card = document.getElementById("flashcard");
    const front = document.getElementById("flashcard-front");
    const back = document.getElementById("flashcard-back");

    let quotes = [];
    let showingAnswer = false;

    function cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function ellipsizeWords(text, wordCount) {
        const words = cleanText(text).split(/\s+/);
        return words.length > wordCount
            ? words.slice(0, wordCount).join(" ") + "..."
            : words.join(" ");
    }

    function currentSectionFor(p) {
        let h2 = "";
        let h3 = "";
        let node = p.previousElementSibling;

        while (node) {
            if (!h3 && node.tagName === "H3") {
                h3 = cleanText(node.textContent);
            }

            if (node.tagName === "H2") {
                h2 = cleanText(node.textContent);
                break;
            }

            node = node.previousElementSibling;
        }

        return { h2, h3 };
    }

    function isInPoemsSection(p) {
        return currentSectionFor(p).h2.toLowerCase() === "poems";
    }

    function parseQuote(p) {
        const section = currentSectionFor(p);

        // Preserve original line breaks for previews
        const rawText = (p.textContent || p.innerText || "").trim();

        if (!rawText || isInPoemsSection(p)) {
            return null;
        }

        let author = "";
        let quote = rawText;

        // Author: Quote
        let match = rawText.match(/^([^:]{2,80}):\s*(.+)$/s);

        if (match) {
            author = cleanText(match[1]);
            quote = match[2].trim();
        } else {
            // Quote — Author
            match = rawText.match(/^(.+?)\s+[—-]\s*([^—-]{2,80})$/s);

            if (match) {
                quote = match[1].trim();
                author = cleanText(match[2]);
            }
        }

        return {
            author: author || "Unknown",
            quote: quote,
            subject: [section.h2, section.h3].filter(Boolean).join(" - ")
        };
    }

    function collectQuotes() {
        quotes = Array.from(document.querySelectorAll("p"))
            .map(parseQuote)
            .filter(Boolean);
    }

    function renderQuote(q) {
        const mode = Math.random() < 0.5 ? "quote-first" : "author-first";

        if (mode === "quote-first") {
            // Show full quote, preserving embedded quotes from the source
            front.innerHTML =
                '<div class="flashcard-text">' +
                escapeHtml(q.quote) +
                '</div>';

            back.innerHTML =
                '<div class="flashcard-meta">' +
                escapeHtml(q.subject) +
                '</div>' +
                '<div class="flashcard-author">' +
                escapeHtml(q.author) +
                '</div>';

        } else {
            // Show author + section + first few words
            front.innerHTML =
                '<div class="flashcard-meta">' +
                escapeHtml(q.subject) +
                '</div>' +
                '<div class="flashcard-text">' +
                escapeHtml(q.author) +
                ': ' +
                escapeHtml(ellipsizeWords(q.quote, 3)) +
                '</div>';

            back.innerHTML =
                '<div class="flashcard-text">' +
                escapeHtml(q.quote) +
                '</div>';
        }
    }

    function nextCard() {
        if (!quotes.length) {
            collectQuotes();
        }

        if (!quotes.length) {
            front.innerHTML =
                '<div class="flashcard-text">No quotes found.</div>';
            back.innerHTML = '';
            return;
        }

        const q = quotes[Math.floor(Math.random() * quotes.length)];
        renderQuote(q);
    }

    function openFlashcards() {
        collectQuotes();
        showingAnswer = false;
        card.classList.remove("is-flipped");
        nextCard();
        mask.classList.add("is-open");
        mask.setAttribute("aria-hidden", "false");
    }

    function closeFlashcards() {
        mask.classList.remove("is-open");
        mask.setAttribute("aria-hidden", "true");
        card.classList.remove("is-flipped");
        showingAnswer = false;
    }

    button.addEventListener("click", openFlashcards);

    mask.addEventListener("click", function () {
        closeFlashcards();
    });

    card.addEventListener("click", function (event) {
        event.stopPropagation();

        if (!showingAnswer) {
            card.classList.add("is-flipped");
            showingAnswer = true;
        } else {
            card.classList.remove("is-flipped");
            showingAnswer = false;

            setTimeout(function () {
                nextCard();
            }, 210);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeFlashcards();
        }
    });
})();