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

window.addEventListener("pageshow", function () {
    var searchInput = document.getElementById("searchInput");
    searchInput.value = "";
});

// flashcards
(function () {
    // Progressive enhancement for the quotes page: the Markdown content remains
    // the source of truth for the quote database, and this script derives a
    // lightweight flashcard deck from the rendered quote paragraphs. Cards
    // alternate between attribution prompts and quote-completion prompts.
    const MAX_QUOTE_WORDS = 100;
    const FLIP_DURATION_MS = 420;
    const button = document.getElementById("flashcard-button");
    const mask = document.getElementById("flashcard-mask");
    const card = document.getElementById("flashcard");
    const front = document.getElementById("flashcard-front");
    const back = document.getElementById("flashcard-back");

    let quotes = [];
    let showingAnswer = false;
    let pointerStart = null;
    let nextPromptIsWhoSaid = true;

    // Normalize rendered text for matching, measuring, and prompt display.
    function cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    // Escape text that will be inserted into generated flashcard HTML.
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Find whitespace-delimited words while preserving positions for truncation.
    function wordMatches(text) {
        return Array.from(String(text).matchAll(/\S+/g));
    }

    // Pick the matching closing quote to keep truncated prompts typographically balanced.
    function closingQuoteFor(text) {
        const firstChar = cleanText(text).charAt(0);

        if (firstChar === "\u201c") {
            return "\u201d";
        }

        if (firstChar === "\u2018") {
            return "\u2019";
        }

        if (firstChar === "\"") {
            return "\"";
        }

        if (firstChar === "'") {
            return "'";
        }

        return "";
    }

    // Trim a quote to a fixed number of whitespace-delimited words.
    function ellipsizeWords(text, wordCount) {
        const cleaned = cleanText(text);
        const words = wordMatches(cleaned);

        if (words.length <= wordCount) {
            return cleaned;
        }

        const lastWord = words[wordCount - 1];
        const prompt = cleaned.slice(0, lastWord.index + lastWord[0].length)
            .trim()
            .replace(/[\p{P}\p{S}]+$/gu, "");

        return prompt + "…" + closingQuoteFor(cleaned);
    }

    // Count words using the same whitespace rule as prompt truncation.
    function countWords(text) {
        return wordMatches(text).length;
    }

    // Turn a hidden-author prompt into a question without mangling trailing quotes.
    function questionizePrompt(text) {
        const questionized = text.replace(/\.(["'\u201d\u2019]?\s*)$/, "?$1");
        return questionized === text ? text + "?" : questionized;
    }

    // Render one side of a flashcard from normalized quote data.
    function drawCardHtml(q, truncateQuote, hideAuthor, cardClass) {
        let quoteHtml;
        const iconClass = cardClass.includes("prompt") ?
            "fa-solid fa-question" :
            "fa-solid fa-exclamation";

        if (cardClass === "flashcard-who-said-answer") {
            quoteHtml = '<span class="flashcard-quote-body">' +
                escapeHtml(q.quote) +
                '</span><br><span class="flashcard-author-body">&mdash;' +
                escapeHtml(q.author) +
                '</span>';

        } else if (!truncateQuote && !hideAuthor) {
            quoteHtml = q.originalHtml;
        } else {
            let quoteText = truncateQuote ? ellipsizeWords(q.quote, 3) : q.quote;

            if (hideAuthor) {
                quoteText = questionizePrompt(quoteText);
            }

            quoteHtml = escapeHtml(quoteText);

            if (!hideAuthor) {
                quoteHtml += '<br>&mdash;' + escapeHtml(q.author);
            } else {
                quoteHtml = 'Who said, ' + quoteHtml +
                    '<br><span class="flashcard-author-placeholder">&mdash;' +
                    escapeHtml(q.author) +
                    '</span>';
            }
        }

        return '<div class="flashcard-card ' + cardClass + '">' +
            '<i class="flashcard-type-icon ' + iconClass + '" aria-hidden="true"></i>' +
            '<div class="flashcard-meta">' +
            escapeHtml(q.subject) +
            '</div>' +
            '<div class="flashcard-text">' +
            quoteHtml +
            '</div>' +
            '</div>';
    }

    // Find the nearest section headings that categorize a quote paragraph.
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

    // Exclude poetry from the generated flashcard deck.
    function isInPoemsSection(section) {
        return section.h2.toLowerCase() === "poems";
    }

    // Convert rendered quote HTML into normalized plain text.
    function htmlToText(html) {
        const template = document.createElement("template");
        template.innerHTML = html;
        return cleanText(template.content.textContent || "");
    }

    // Parse the quote body and attribution from the rendered Markdown separator.
    function parseQuote(str) {
        const parts = str.split("<br>—");

        if (parts.length !== 2) {
            throw new Error("Quote must contain exactly one '<br>—' separator.");
        }

        const quote = parts[0].trim();
        const author = parts[1].trim();

        if (!quote) {
            throw new Error("Quote text is empty.");
        }

        if (!author) {
            throw new Error("Author is empty.");
        }

        return [quote, author];
    }

    // Convert parse failures into skipped paragraphs instead of breaking the UI.
    function safely(fn) {
        return function (...args) {
            try {
                return fn.apply(this, args);
            } catch (err) {
                console.error(err?.message ?? String(err));
                return undefined;
            }
        };
    }

    // Build the flashcard data object for one rendered paragraph.
    function quoteDataFromParagraph(p) {
        const section = currentSectionFor(p);

        if (isInPoemsSection(section)) {
            return undefined;
        }

        const [quote, author] = parseQuote(p.innerHTML);
        const quoteText = htmlToText(quote);

        if (countWords(quoteText) > MAX_QUOTE_WORDS) {
            return undefined;
        }

        return {
            author: htmlToText(author),
            quote: quoteText,
            originalHtml: p.innerHTML,
            subject: [section.h2, section.h3].filter(Boolean).join(" / ")
        };
    }

    // Rebuild the in-memory deck from the current page content.
    function collectQuotes() {
        quotes = $("p").toArray()
            .filter(function (p) {
                return window.getComputedStyle(p).display !== "none";
            })
            .map(safely(quoteDataFromParagraph))
            .filter(Boolean);
    }

    // Keep weak attributions out of the author-guessing prompt type.
    function canAskWhoSaid(q) {
        const author = q.author.trim();
        return !author.endsWith("?") && !/anonymous|attributed/i.test(author);
    }

    // Select a random quote, optionally restricted to attribution-safe entries.
    function randomQuote(promptIsWhoSaid) {
        const eligibleQuotes = promptIsWhoSaid ? quotes.filter(canAskWhoSaid) : quotes;

        if (!eligibleQuotes.length) {
            return null;
        }

        return eligibleQuotes[Math.floor(Math.random() * eligibleQuotes.length)];
    }

    // Populate the front and back faces for the next card mode.
    function renderQuote(q, promptIsWhoSaid) {

        if (promptIsWhoSaid) {
            front.innerHTML = drawCardHtml(q, false, true, "flashcard-who-said-prompt");
            back.innerHTML = drawCardHtml(q, false, false, "flashcard-who-said-answer");

        } else {
            front.innerHTML = drawCardHtml(q, true, false, "flashcard-complete-prompt");
            back.innerHTML = drawCardHtml(q, false, false, "flashcard-complete-answer");
        }
    }

    // Advance to a random card, alternating between prompt styles.
    function nextCard() {
        if (!quotes.length) {
            collectQuotes();
        }

        if (!quotes.length) {
            front.innerHTML =
                '<div class="flashcard-text">No quotes found. Widen the quote filter to use flashcards.</div>';
            back.innerHTML = '';
            return;
        }

        const promptIsWhoSaid = nextPromptIsWhoSaid;
        const q = randomQuote(promptIsWhoSaid);
        nextPromptIsWhoSaid = !nextPromptIsWhoSaid;

        if (!q) {
            front.innerHTML =
                '<div class="flashcard-text">No eligible quotes found.</div>';
            back.innerHTML = '';
            return;
        }

        renderQuote(q, promptIsWhoSaid);
    }

    // Initialize and show the flashcard overlay.
    function openFlashcards() {
        collectQuotes();
        showingAnswer = false;
        nextPromptIsWhoSaid = true;
        card.classList.remove("is-flipped");
        nextCard();
        mask.classList.add("is-open");
        mask.setAttribute("aria-hidden", "false");
    }

    // Hide the overlay and reset transient card state.
    function closeFlashcards() {
        mask.classList.remove("is-open");
        mask.setAttribute("aria-hidden", "true");
        card.classList.remove("is-flipped");
        showingAnswer = false;
    }

    // Flip the current card, or advance after the answer has been shown.
    function flipOrAdvanceCard() {
        if (!showingAnswer) {
            card.classList.add("is-flipped");
            showingAnswer = true;
        } else {
            card.classList.remove("is-flipped");
            showingAnswer = false;

            setTimeout(function () {
                nextCard();
            }, FLIP_DURATION_MS / 5);
        }
    }

    // Avoid treating text selection as a card click.
    function hasSelectedText() {
        const selection = window.getSelection && window.getSelection();
        return selection && !selection.isCollapsed && selection.toString().trim() !== "";
    }

    button.addEventListener("click", openFlashcards);

    mask.addEventListener("click", function () {
        closeFlashcards();
    });

    card.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    card.addEventListener("pointerdown", function (event) {
        if (event.button !== 0) {
            pointerStart = null;
            return;
        }

        pointerStart = {
            x: event.clientX,
            y: event.clientY
        };
    });

    card.addEventListener("pointerup", function (event) {
        event.stopPropagation();

        if (event.button !== 0) {
            pointerStart = null;
            return;
        }

        if (!pointerStart) {
            return;
        }

        const distance = Math.hypot(
            event.clientX - pointerStart.x,
            event.clientY - pointerStart.y
        );

        pointerStart = null;

        if (distance > 5 || hasSelectedText()) {
            return;
        }

        flipOrAdvanceCard();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeFlashcards();
        }
    });
})();