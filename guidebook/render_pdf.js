const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const htmlPath = path.join(__dirname, 'guidebook_participant_v2.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });

  // Wait for images to load (Google Drive CDN)
  await page.waitForTimeout(5000);

  const pdfPath = path.join(__dirname, 'guidebook_participant_landscape.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '15mm', right: '15mm' }
  });

  console.log('PDF generated: ' + pdfPath);
  await browser.close();
})();
