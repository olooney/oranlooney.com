// Copyright 2010 Oran Looney
Ext.onReady(function() {
	var hints = [
		"you can right click on most objects to interact with them?",
		"you can drag-and-drop files between folders?",
		"the DocViewer shows all the source code for this page?",
		"files with the .html extension are edited by the WYSIWYG HtmlEdit application?",
		"you can see the metadata for a file by right-clicking it and choosing About?",
		"the filesystem is a simplified but faithful model of the Unix filesystem?",
		"you can edit a file's name by double clicking on the filename?",
		"applications are completely decoupled and can even be loaded and registered after the page loads?"
	]
	var hintIndex = 0;
	
	function showNextHint() {
		if ( hintIndex < hints.length ) owl.os.log.aside(hints[hintIndex]);
		hintIndex++;
	}
	setTimeout(showNextHint, 2 * 1000);
	setInterval(showNextHint, 20 * 1000);
});
