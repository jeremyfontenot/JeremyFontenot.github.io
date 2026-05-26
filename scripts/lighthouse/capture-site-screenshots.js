const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const pages = [
  { name: "home", url: "https://jeremyfontenot.online/" },
  { name: "projects", url: "https://jeremyfontenot.online/projects.html" },
  { name: "proof", url: "https://jeremyfontenot.online/proof.html" },
  { name: "resume", url: "https://jeremyfontenot.online/resume.html" },
  { name: "contact", url: "https://jeremyfontenot.online/contact.html" }
];

const outputDir = path.join(process.cwd(), "artifacts", "screenshots", "current");
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  for (const target of pages) {
    console.log(`Capturing ${target.name}: ${target.url}`);
    await page.goto(target.url, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outputDir, `${target.name}.png`),
      fullPage: true
    });
  }

  await browser.close();
  console.log(`Screenshots written to ${outputDir}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
