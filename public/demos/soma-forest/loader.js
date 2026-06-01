async function loadJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);

        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }

        // Parse and return the JSON data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading JSON from ${url}:`, error);
        throw error; // Propagate the error for the caller to handle
    }
}

export { loadJSON };

