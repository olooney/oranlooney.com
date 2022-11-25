searchTemplate = `
<div class="search-status">Returned {{results.length}} {{ "result" if results.length === 1 else "results" }}</div>
<section class="list home-list">
    {% for result in results %}
       <article class="article">
           <a href="{{result.href}}" class="article-titles">
           <h2 class="article-title">{{result.title}}</h2>
        </a>
        <ul class="article-meta">
            <li class="article-meta-date"><time>{{result.date}}</time></li>
        </ul>
        {% if result.thumbnail %}
            <a href="{{result.href}}"><img src="{{result.thumbnail}}" class="article-image"></a>
        {% endif %}
        <div class="article-content">
            ...{{result.snippet | safe}}...
        </div>
        <div class="article-readmore"><a href="{{result.href}}">Read more...</a></div>
        <div class="article-floatclear"></div>
      </article>
    {% endfor %}
</section>
`
nunjucks.configure({ autoescape: true });

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderSearchResults() {
    // quit early if the search field is not yet rendered or if the data is not yet loaded.
    if ( !window.searchData ) return;
    const searchString = $('#search-field').val();
    if ( !searchString ) return;

    // break the search string into RegExp-safe words
    const searchStrings = searchString.split(' ').map(word => word.trim()).filter(word => word.length).map(escapeRegex);

    // filter the available data down to matching results
    if ( !searchStrings.length ) { 
        results = [];
    } else {
        searchRegex = new RegExp( searchStrings.join( ".{1,100}" ), "i");
        results = window.searchData.filter(function(page) {
            if ( searchRegex.test(page.title) ) {
                page.snippet = page.content.substring(0, 365);
                return true;
            } else {
                match = searchRegex.exec(page.content);
                if ( match ) {
                    var snippet = page.content.substring(match.index - 10, match.index + 355);
                    for ( const word of searchStrings ) {
                        snippet = snippet.replace(new RegExp(word, 'i'), '<b>$&</b>');
                    }
                    page.snippet = snippet;
                }
                return !!match;
            }
        });
    }

    // replace the current search results
    outputHTML = nunjucks.renderString(searchTemplate, { results: results });
    $('#output').html(outputHTML);
}

// load the data asyncronously. Hopefully it will be loaded before the 
// user is finished typing, but if not, render the search results as soon
// as they're available.
$.get('/index.json', function(data) {
    window.searchData = data;
    renderSearchResults();
});

// when the document is available, set up a listener to re-render the search
// results every time the search field changes (on every keystroke, typically.)
$(function() { 
    $('#search-field').on("input", renderSearchResults)
    $('#search-field').focus();
});

