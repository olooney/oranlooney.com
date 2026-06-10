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

    function wordMatches(text) {
        return Array.from(String(text).matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu));
    }

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

    function ellipsizeWords(text, wordCount) {
        const cleaned = cleanText(text);
        const words = wordMatches(cleaned);

        if (words.length <= wordCount) {
            return cleaned;
        }

        const lastWord = words[wordCount - 1];
        const prompt = cleaned.slice(0, lastWord.index + lastWord[0].length).trim();

        return prompt + "..." + closingQuoteFor(cleaned);
    }

    function countWords(text) {
        return wordMatches(text).length;
    }

    function questionizePrompt(text) {
        const questionized = text.replace(/\.(["'\u201d\u2019]?\s*)$/, "?$1");
        return questionized === text ? text + "?" : questionized;
    }

    function drawCardHtml(q, truncateQuote, hideAuthor, cardClass) {
        let quoteHtml;

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
            '<div class="flashcard-meta">' +
            escapeHtml(q.subject) +
            '</div>' +
            '<div class="flashcard-text">' +
            quoteHtml +
            '</div>' +
            '</div>';
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
            match = rawText.match(/^(.+?)\s*—\s*([^—]{2,80})$/s);

            if (match) {
                quote = match[1].trim();
                author = cleanText(match[2]);
            }
        }

        if (countWords(quote) > MAX_QUOTE_WORDS) {
            return null;
        }

        return {
            author: author || "Unknown",
            quote: quote,
            originalHtml: p.innerHTML,
            subject: [section.h2, section.h3].filter(Boolean).join(" - ")
        };
    }

    function collectQuotes() {
        quotes = Array.from(document.querySelectorAll("p"))
            .map(parseQuote)
            .filter(Boolean);
    }

    function canAskWhoSaid(q) {
        const author = q.author.trim();
        return !author.endsWith("?") && !/anonymous|attributed/i.test(author);
    }

    function randomQuote(promptIsWhoSaid) {
        const eligibleQuotes = promptIsWhoSaid ? quotes.filter(canAskWhoSaid) : quotes;

        if (!eligibleQuotes.length) {
            return null;
        }

        return eligibleQuotes[Math.floor(Math.random() * eligibleQuotes.length)];
    }

    function renderQuote(q, promptIsWhoSaid) {

        if (promptIsWhoSaid) {
            front.innerHTML = drawCardHtml(q, false, true, "flashcard-who-said-prompt");
            back.innerHTML = drawCardHtml(q, false, false, "flashcard-who-said-answer");

        } else {
            front.innerHTML = drawCardHtml(q, true, false, "flashcard-complete-prompt");
            back.innerHTML = drawCardHtml(q, false, false, "flashcard-complete-answer");
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

    function openFlashcards() {
        collectQuotes();
        showingAnswer = false;
        nextPromptIsWhoSaid = true;
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