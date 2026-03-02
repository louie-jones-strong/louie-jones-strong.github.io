
const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Generates a CV PDF from project configuration data.
 * @param {Object} projectConfig - The projects configuration (post-processed)
 * @param {Object} siteConfig - The site configuration
 * @param {Object} iconsConfig - The icons/skills configuration
 * @param {string} outputPath - Path to write the PDF to
 * @returns {Promise} Resolves when PDF has been written to disk
 */
function GenerateCV(projectConfig, siteConfig, iconsConfig, outputPath) {
	return new Promise((resolve, reject) => {
		const homeProject = projectConfig['Home'];

		const doc = new PDFDocument({
			size: 'A4',
			margin: 50,
			info: {
				Title: 'CV - ' + homeProject.Title,
				Author: homeProject.Title,
			}
		});

		const stream = fs.createWriteStream(outputPath);
		doc.pipe(stream);

		buildDocument(doc, projectConfig, siteConfig, iconsConfig);

		doc.end();
		stream.on('finish', resolve);
		stream.on('error', reject);
	});
}

function buildDocument(doc, projectConfig, siteConfig, iconsConfig) {
	const homeProject = projectConfig['Home'];
	const contactLinks = siteConfig.ContactLinks;

	const pageWidth = doc.page.width;
	const margin = 50;
	const contentWidth = pageWidth - margin * 2;

	// Colours
	const C_HEADING = '#1a1a2e';
	const C_ACCENT = '#1e6091';
	const C_TEXT = '#222222';
	const C_MUTED = '#555555';
	const C_LINE = '#cccccc';

	// Font sizes
	const FS_NAME = 24;
	const FS_SUBTITLE = 11;
	const FS_SECTION = 12;
	const FS_TITLE = 11;
	const FS_BODY = 10;
	const FS_SMALL = 9;

	function formatDate(dateStr) {
		if (!dateStr) return '';
		if (dateStr === 'Current') return 'Present';
		const date = new Date(dateStr);
		if (isNaN(date)) return dateStr;
		return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
	}

	function formatTimelineRange(timeline) {
		const start = formatDate(timeline.StartDate);
		const end = formatDate(timeline.EndDate);
		if (start && end) return start + ' \u2013 ' + end;
		if (start) return 'From ' + start;
		return '';
	}

	// Collect all keys that appear as a sub-project of some other project
	const allSubProjectKeys = new Set();
	for (const key of Object.keys(projectConfig)) {
		const project = projectConfig[key];
		if (Array.isArray(project.SubProjects)) {
			for (const sub of project.SubProjects) {
				allSubProjectKeys.add(sub);
			}
		}
	}

	// Work projects: tagged "Work", not a sub-project of another project
	const workProjects = Object.keys(projectConfig)
		.filter(key => {
			const project = projectConfig[key];
			const tags = (project.Tags || '').split(' ');
			return tags.includes('Work') && !allSubProjectKeys.has(key);
		})
		.map(key => ({ key, project: projectConfig[key] }))
		.sort((a, b) => {
			// Sort by most recent timeline start date, descending
			const timelines = p => p.project.Timelines;
			const lastStart = p =>
				timelines(p).length > 0
					? new Date(timelines(p)[timelines(p).length - 1].StartDate)
					: new Date(0);
			return lastStart(b) - lastStart(a);
		});

	// Education projects from Education's SubProjects, most recent first
	const educationEntry = projectConfig['Education'];
	const educationProjects = (educationEntry ? educationEntry.SubProjects : [])
		.map(key => ({ key, project: projectConfig[key] }))
		.reverse();

	// Skills with human-readable labels
	const skills = (homeProject.Skills || []).map(skillKey => {
		const icon = iconsConfig[skillKey];
		return icon ? icon.Label : skillKey;
	});

	// Personal projects from Home's SubProjects (non-hidden)
	const personalProjects = (homeProject.SubProjects || [])
		.map(key => ({ key, project: projectConfig[key] }))
		.filter(({ project }) => project && !project.Hide);

	// ---- Helper: render a row with left text and right-aligned date ----
	function rowWithDate(leftText, leftFont, leftSize, leftColor,
		rightText, rightFont, rightSize, rightColor) {
		const startY = doc.y;

		// Right text first (lineBreak:false so doc.y is not advanced)
		if (rightText) {
			doc.font(rightFont)
				.fontSize(rightSize)
				.fillColor(rightColor)
				.text(rightText, margin, startY, {
					width: contentWidth,
					align: 'right',
					lineBreak: false
				});
		}

		// Left text (lineBreak:true so doc.y advances to next line)
		const rightReservedWidth = rightText
			? doc.widthOfString(rightText, { font: rightFont, fontSize: rightSize }) + 8
			: 0;
		doc.font(leftFont)
			.fontSize(leftSize)
			.fillColor(leftColor)
			.text(leftText, margin, startY, { width: contentWidth - rightReservedWidth });
	}

	// ---- Helper: horizontal rule ----
	function rule(color, weight) {
		doc.moveTo(margin, doc.y)
			.lineTo(pageWidth - margin, doc.y)
			.lineWidth(weight)
			.strokeColor(color)
			.stroke();
	}

	// ---- Helper: section header ----
	function sectionHeader(title) {
		doc.moveDown(0.4);
		doc.font('Helvetica-Bold')
			.fontSize(FS_SECTION)
			.fillColor(C_ACCENT)
			.text(title.toUpperCase(), margin, doc.y);
		doc.moveDown(0.15);
		rule(C_LINE, 0.5);
		doc.moveDown(0.3);
	}

	// ==== HEADER ====

	// Name
	doc.font('Helvetica-Bold')
		.fontSize(FS_NAME)
		.fillColor(C_HEADING)
		.text(homeProject.Title, margin, doc.y);

	// Subtitle
	doc.font('Helvetica')
		.fontSize(FS_SUBTITLE)
		.fillColor(C_ACCENT)
		.text('Software Engineer', margin, doc.y);

	doc.moveDown(0.3);

	// Contact info row
	const contactParts = [];
	if (contactLinks.Email) contactParts.push(contactLinks.Email);
	if (contactLinks.LinkedIn) contactParts.push(contactLinks.LinkedIn.replace('https://www.', ''));
	if (contactLinks.GitHub) contactParts.push(contactLinks.GitHub.replace('https://', ''));
	if (siteConfig.HostURL) contactParts.push(siteConfig.HostURL.replace(/\/$/, ''));

	doc.font('Helvetica')
		.fontSize(FS_SMALL)
		.fillColor(C_MUTED)
		.text(contactParts.join('   |   '), margin, doc.y, { width: contentWidth });

	doc.moveDown(0.3);
	rule(C_ACCENT, 1.5);
	doc.moveDown(0.2);

	// Profile description
	doc.font('Helvetica')
		.fontSize(FS_BODY)
		.fillColor(C_TEXT)
		.text(homeProject.QuickDescription, margin, doc.y, { width: contentWidth });

	// ==== WORK EXPERIENCE ====
	sectionHeader('Work Experience');

	for (const { project } of workProjects) {
		// Determine overall date range
		const timelines = project.Timelines || [];
		let dateRange = '';
		if (timelines.length > 0) {
			const first = formatDate(timelines[0].StartDate);
			const last = formatDate(timelines[timelines.length - 1].EndDate);
			dateRange = first + ' \u2013 ' + last;
		} else if (project.StartDate) {
			dateRange = formatDate(project.StartDate) + ' \u2013 ' + formatDate(project.EndDate);
		}

		rowWithDate(
			project.Title,
			'Helvetica-Bold', FS_TITLE, C_HEADING,
			dateRange,
			'Helvetica', FS_SMALL, C_MUTED
		);

		// Show individual role timelines for multi-role positions
		if (timelines.length > 1) {
			const roleStr = timelines
				.filter(t => t.Name)
				.map(t => (t.Name + ': ' + formatTimelineRange(t)))
				.join('   |   ');
			if (roleStr) {
				doc.font('Helvetica-Oblique')
					.fontSize(FS_SMALL)
					.fillColor(C_MUTED)
					.text(roleStr, margin + 8, doc.y, { width: contentWidth - 8 });
			}
		}

		// Description
		doc.font('Helvetica')
			.fontSize(FS_BODY)
			.fillColor(C_TEXT)
			.text(project.QuickDescription, margin + 8, doc.y + 2, { width: contentWidth - 8 });

		if (project.Awards) {
			doc.font('Helvetica-Oblique')
				.fontSize(FS_SMALL)
				.fillColor(C_ACCENT)
				.text('Award: ' + project.Awards, margin + 8, doc.y + 1, { width: contentWidth - 8 });
		}

		doc.moveDown(0.5);
	}

	// ==== EDUCATION ====
	sectionHeader('Education');

	for (const { project } of educationProjects) {
		const timelines = project.Timelines || [];
		const dateRange = timelines.length > 0 ? formatTimelineRange(timelines[0]) : '';

		rowWithDate(
			project.Title,
			'Helvetica-Bold', FS_TITLE, C_HEADING,
			dateRange,
			'Helvetica', FS_SMALL, C_MUTED
		);

		if (project.Awards) {
			doc.font('Helvetica-Bold')
				.fontSize(FS_SMALL)
				.fillColor(C_ACCENT)
				.text(project.Awards, margin + 8, doc.y, { width: contentWidth - 8 });
		}

		doc.font('Helvetica')
			.fontSize(FS_BODY)
			.fillColor(C_TEXT)
			.text(project.QuickDescription, margin + 8, doc.y + 1, { width: contentWidth - 8 });

		doc.moveDown(0.4);
	}

	// ==== TECHNICAL SKILLS ====
	sectionHeader('Technical Skills');

	doc.font('Helvetica')
		.fontSize(FS_BODY)
		.fillColor(C_TEXT)
		.text(skills.join('  \u00b7  '), margin, doc.y, { width: contentWidth });

	// ==== KEY PROJECTS ====
	if (personalProjects.length > 0) {
		sectionHeader('Key Projects');

		const maxProjects = 6;
		for (const { project } of personalProjects.slice(0, maxProjects)) {
			const timelines = project.Timelines || [];
			const dateRange = timelines.length > 0 ? formatTimelineRange(timelines[0]) : '';

			rowWithDate(
				project.Title,
				'Helvetica-Bold', FS_TITLE, C_HEADING,
				dateRange,
				'Helvetica', FS_SMALL, C_MUTED
			);

			doc.font('Helvetica')
				.fontSize(FS_BODY)
				.fillColor(C_TEXT)
				.text(project.QuickDescription, margin + 8, doc.y + 1, { width: contentWidth - 8 });

			doc.moveDown(0.35);
		}
	}
}

exports.GenerateCV = GenerateCV;
