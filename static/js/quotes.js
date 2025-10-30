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
