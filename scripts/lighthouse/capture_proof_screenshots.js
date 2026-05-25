const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const outDir = 'artifacts/screenshots';
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = 'http://localhost:8000/proof.html';

  const viewports = [
    { name: 'proof_desktop_fixed', width: 1440, height: 900 },
    { name: 'proof_tablet_fixed', width: 768, height: 1024 },
    { name: 'proof_mobile_fixed', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'networkidle' });
    const path = `${outDir}/${vp.name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log('Saved', path);
  }

  await browser.close();
})();
