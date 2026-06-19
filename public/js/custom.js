console.log("\n  )\\___/(\n  (O v O)\n  ( ::: )\n  (/...\\)\n----m-m-----\n");

// Scrollspy TOC on right
document.addEventListener('DOMContentLoaded', function() {
	const toc = document.querySelector('aside.toc');
	if (!toc) return;

	const article = document.querySelector('article.article');
	if (!article) return;

	const showNestedTocLinks = toc.classList.contains('quotes-toc');
	const tocLinks = Array.from(toc.querySelectorAll('li > a[href^="#"]')).filter(function(link) {
		if (showNestedTocLinks) return true;
		let listItem = link.parentElement.parentElement.closest('li');
		while (listItem && toc.contains(listItem)) {
			if (listItem.querySelector(':scope > a')) return false;
			listItem = listItem.parentElement.closest('li');
		}
		return true;
	});
	const headingLinks = tocLinks
		.map(function(link) {
			if (link.hash === '#introduction') {
				return { link: link, heading: document.body, top: 0 };
			}
			const id = decodeURIComponent(link.hash.slice(1));
			const heading = document.getElementById(id);
			return heading ? { link: link, heading: heading } : null;
		})
		.filter(Boolean);

	if (!headingLinks.length) return;

	function setActiveLink(activeLink) {
		tocLinks.forEach(function(link) {
			link.classList.toggle('active', link === activeLink);
		});
	}

	headingLinks.forEach(function(item) {
		item.link.addEventListener('click', function(event) {
			event.preventDefault();
			setActiveLink(item.link);
			if (item.top === 0) {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				item.heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
			if (item.link.hash === '#introduction') {
				history.pushState(null, '', window.location.pathname + window.location.search);
			} else {
				history.pushState(null, '', item.link.hash);
			}
		});
	});

	function updateActiveLink() {
		if (showNestedTocLinks && window.scrollY === 0) {
			setActiveLink(headingLinks[0].link);
			return;
		}

		const scrollPosition = window.scrollY + window.innerHeight * 0.25;
		let active = headingLinks[0];

		headingLinks.forEach(function(item) {
			const headingTop = item.top ?? item.heading.offsetTop;
			if (headingTop <= scrollPosition) {
				active = item;
			}
		});

		setActiveLink(active.link);
	}

	let ticking = false;
	function requestActiveLinkUpdate() {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(function() {
			updateActiveLink();
			ticking = false;
		});
	}

	window.addEventListener('scroll', requestActiveLinkUpdate, { passive: true });
	window.addEventListener('resize', requestActiveLinkUpdate);
	updateActiveLink();
});

