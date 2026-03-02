
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

/** Find the first available Chromium / Chrome executable. */
function findChromePath() {
	const candidates = [
		process.env.PUPPETEER_EXECUTABLE_PATH,
		'/usr/bin/google-chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium',
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	].filter(Boolean);

	for (const p of candidates) {
		if (fs.existsSync(p)) return p;
	}
	return null;
}

/**
 * Renders the CV.ejs template to HTML, writes docs/CV.html,
 * then converts it to docs/CV.pdf via headless Chromium.
 *
 * @param {Object} cvConfig      - config/CV.json
 * @param {Object} projectConfig - config/Projects.json (post-processed)
 * @param {Object} siteConfig    - config/Site.json
 * @param {Object} iconsConfig   - config/Icons.json
 * @param {string} pathToRoot    - absolute path to repo root
 * @param {string} htmlOutputPath - absolute path to write CV.html
 * @param {string} pdfOutputPath  - absolute path to write CV.pdf
 */
async function GenerateCV(cvConfig, projectConfig, siteConfig, iconsConfig,
	pathToRoot, htmlOutputPath, pdfOutputPath) {

	// ---- 1. Render EJS template to HTML ----
	const templatePath = path.join(pathToRoot, 'raw_docs', 'CV.ejs');
	const template = fs.readFileSync(templatePath, 'utf8');

	const html = ejs.render(template, {
		CVConfig: cvConfig,
		Projects: projectConfig,
		Icons: iconsConfig,
		SiteConfig: siteConfig,
		CurrentDate: new Date().toISOString().slice(0, 10),
	}, { filename: templatePath });

	// ---- 2. Write HTML file ----
	fs.mkdirSync(path.dirname(htmlOutputPath), { recursive: true });
	fs.writeFileSync(htmlOutputPath, html, 'utf8');
	console.log('  CV HTML written to', htmlOutputPath);

	// ---- 3. Convert to PDF via headless Chromium ----
	const executablePath = findChromePath();
	if (!executablePath) {
		console.warn('  Warning: no Chromium/Chrome found – skipping PDF generation');
		return;
	}

	const browser = await puppeteer.launch({
		executablePath,
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
	});

	try {
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: 'networkidle0' });
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: { top: '0', right: '0', bottom: '0', left: '0' },
		});
		fs.writeFileSync(pdfOutputPath, pdfBuffer);
		console.log('  CV PDF written to', pdfOutputPath);
	} finally {
		await browser.close();
	}
}

exports.GenerateCV = GenerateCV;

