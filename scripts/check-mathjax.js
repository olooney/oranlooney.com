const { chromium } = require("playwright");

const winHost = process.env.WIN_HOST;
if (!winHost) {
  console.error("WIN_HOST is not set.");
  process.exit(1);
}

const baseUrl = `http://${winHost}:8080`;
const sitemapUrl = `${baseUrl}/sitemap.xml`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getUrlsFromSitemap(page) {
  const response = await page.goto(sitemapUrl, { waitUntil: "networkidle" });

  if (!response || !response.ok()) {
    throw new Error(`Failed to load sitemap: ${sitemapUrl}`);
  }

  const xml = await page.locator("body").innerText();

  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)]
    .map(match => match[1].trim())
    .map(loc => {
      const path = new URL(loc).pathname;
      return new URL(path, baseUrl).href;
    });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let failures = 0;

  const urls = await getUrlsFromSitemap(page);

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Loaded ${urls.length} URLs from sitemap.`);

  for (const url of urls) {
    console.log(`\nChecking: ${url}`);

    await page.goto(url, { waitUntil: "networkidle" });

    const h1 = await page.locator("article h1").first().textContent()
      .catch(() => null);

    console.log(`  h1: ${(h1 || "[no article h1]").trim()}`);

    const hasMathJax = await page.evaluate(() => !!window.MathJax);
    console.log(`  MathJax present: ${hasMathJax}`);

    if (hasMathJax) {
      await page.evaluate(async () => {
        if (window.MathJax?.startup?.promise) {
          await window.MathJax.startup.promise;
        }

        if (window.MathJax?.typesetPromise) {
          await window.MathJax.typesetPromise();
        }
      });
    }

    // Extra settling time for async font/package loading.
    await sleep(500);

    const errors = await page.locator("mjx-merror").evaluateAll(nodes =>
      nodes.map(node => ({
        text: node.textContent,
        html: node.outerHTML
      }))
    );

    if (errors.length) {
      failures++;

      console.log(`  MathJax errors: ${errors.length}`);

      for (const err of errors) {
        console.log("  --- MathJax error text ---");
        console.log(err.text.trim());

        console.log("  --- MathJax error HTML ---");
        console.log(err.html);
      }
    } else {
      console.log("  MathJax errors: 0");
    }
  }

  await browser.close();

  console.log(`\nFailure count: ${failures}`);

  if (failures) {
    process.exit(1);
  }

  console.log("No MathJax errors found.");
})();
