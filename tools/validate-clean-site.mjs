import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const port = 4173;
const base = `http://127.0.0.1:${port}`;
const screenshotDir = path.join(root, "artifacts", "screenshots", "clean-rebuild-20260531");

const pages = [
  "index.html",
  "projects.html",
  "proof.html",
  "dashboard.html",
  "resume.html",
  "contact.html",
  "evidence-library/index.html",
  "evidence/public/index.html",
  "case-studies/microsoft-365-lab-baseline.html",
  "case-studies/pfsense-network-segmentation.html",
  "case-studies/proxmox-home-lab.html",
  "case-studies/active-directory-infrastructure.html",
  "case-studies/powershell-automation.html"
];

const viewports = [
  { name: "mobile-390", width: 390, height: 900 },
  { name: "tablet-768", width: 768, height: 1000 },
  { name: "desktop-1440", width: 1440, height: 1100 }
];

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".ps1": "text/plain; charset=utf-8"
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const target = path.resolve(root, clean);
  if (!target.startsWith(root)) return null;
  return target;
}

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const target = safePath(new URL(req.url, base).pathname);
      if (!target || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "content-type": mime[path.extname(target).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(target).pipe(res);
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function validateLinks(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const localLinks = new Set();
  const mediaLinks = new Set();
  for (const pagePath of pages) {
    await page.goto(`${base}/${pagePath}`, { waitUntil: "load" });
    const links = await page.$$eval("a[href]", (anchors) => anchors.map((a) => a.href));
    for (const href of links) {
      if (href.startsWith("http://127.0.0.1:4173/")) localLinks.add(href);
    }
    const media = await page.$$eval("img", (imgs) => imgs.flatMap((img) => {
      const urls = [];
      if (img.currentSrc) urls.push(img.currentSrc);
      if (img.src) urls.push(img.src);
      const picture = img.closest("picture");
      if (picture) {
        for (const source of picture.querySelectorAll("source[srcset]")) {
          for (const part of source.getAttribute("srcset").split(",")) {
            const url = part.trim().split(/\s+/)[0];
            if (url) urls.push(new URL(url, document.baseURI).href);
          }
        }
      }
      return urls;
    }));
    for (const href of media) {
      if (href.startsWith("http://127.0.0.1:4173/")) mediaLinks.add(href);
    }
  }

  const failed = [];
  for (const href of new Set([...localLinks, ...mediaLinks])) {
    const response = await context.request.get(href);
    if (!response.ok()) failed.push(`${response.status()} ${href}`);
  }
  await context.close();
  if (failed.length) throw new Error(`Broken local links:\n${failed.join("\n")}`);
  return { links: localLinks.size, media: mediaLinks.size };
}

async function validatePage(browser, pagePath, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(`${base}/${pagePath}`, { waitUntil: "load" });
  if (!response?.ok()) throw new Error(`${pagePath} returned ${response?.status()}`);

  const report = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - width;
    const boxes = [...document.querySelectorAll(".card,.project-card,.proof-card,.cert-card,.case-card,.panel,.site-footer")].map((el) => {
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement?.getBoundingClientRect();
      return {
        selector: el.className,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        parentLeft: parent?.left ?? 0,
        parentRight: parent?.right ?? width
      };
    });
    const escaped = boxes.filter((box) => box.left < -1 || box.right > width + 1 || box.left < box.parentLeft - 1 || box.right > box.parentRight + 1);
    const badMedia = [...document.querySelectorAll("img,svg")].filter((el) => {
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement?.getBoundingClientRect();
      return rect.width > width + 1 || (parent && rect.width > parent.width + 1);
    }).map((el) => el.outerHTML.slice(0, 140));
    const missingAlt = [...document.images].filter((img) => !img.hasAttribute("alt")).map((img) => img.currentSrc || img.src);
    const unloaded = [...document.images].filter((img) => img.loading !== "lazy" && (!img.complete || img.naturalWidth === 0)).map((img) => img.currentSrc || img.src);
    const rowIssues = [];
    for (const grid of document.querySelectorAll(".card-grid,.project-grid,.proof-grid,.cert-grid,.case-grid,.metric-grid")) {
      const items = [...grid.children].filter((el) => !el.hidden);
      const rows = new Map();
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const key = Math.round(rect.top);
        if (!rows.has(key)) rows.set(key, []);
        rows.get(key).push(Math.round(rect.height));
      }
      for (const heights of rows.values()) {
        if (heights.length > 1 && Math.max(...heights) - Math.min(...heights) > 2) rowIssues.push(heights);
      }
    }
    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      main: Boolean(document.querySelector("#main")),
      skipTarget: document.querySelector(".skip-link")?.getAttribute("href") === "#main",
      overflow,
      escaped,
      badMedia,
      missingAlt,
      unloaded,
      rowIssues,
      footerOverflow: document.querySelector(".site-footer")?.getBoundingClientRect().right > width + 1
    };
  });

  if (report.h1Count !== 1) throw new Error(`${pagePath} ${viewport.name}: expected one h1, found ${report.h1Count}`);
  if (!report.main || !report.skipTarget) throw new Error(`${pagePath} ${viewport.name}: missing main or skip-link target`);
  if (report.overflow > 1) throw new Error(`${pagePath} ${viewport.name}: horizontal overflow ${report.overflow}`);
  if (report.escaped.length) throw new Error(`${pagePath} ${viewport.name}: elements escaped containers ${JSON.stringify(report.escaped.slice(0, 3))}`);
  if (report.badMedia.length) throw new Error(`${pagePath} ${viewport.name}: unconstrained media ${JSON.stringify(report.badMedia.slice(0, 3))}`);
  if (report.missingAlt.length) throw new Error(`${pagePath} ${viewport.name}: missing image alt`);
  if (report.unloaded.length) throw new Error(`${pagePath} ${viewport.name}: broken images ${report.unloaded.join(", ")}`);
  if (report.rowIssues.length) throw new Error(`${pagePath} ${viewport.name}: unequal grid row heights ${JSON.stringify(report.rowIssues.slice(0, 2))}`);
  if (report.footerOverflow) throw new Error(`${pagePath} ${viewport.name}: footer overflow`);
  if (errors.length) throw new Error(`${pagePath} ${viewport.name}: console errors ${errors.join("; ")}`);

  fs.mkdirSync(screenshotDir, { recursive: true });
  const shotName = `${pagePath.replaceAll("/", "-").replace(".html", "")}-${viewport.name}.png`;
  await page.screenshot({ path: path.join(screenshotDir, shotName), fullPage: true });
  await context.close();
  return shotName;
}

async function validateMobileNav(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/index.html`, { waitUntil: "load" });
  await page.getByRole("button", { name: "Menu" }).click();
  const open = await page.locator("#primary-menu").evaluate((el) => getComputedStyle(el).display !== "none" && el.classList.contains("is-open"));
  await page.keyboard.press("Escape");
  const closed = await page.locator("#primary-menu").evaluate((el) => !el.classList.contains("is-open"));
  await context.close();
  if (!open || !closed) throw new Error("Mobile navigation did not open and close correctly.");
}

async function validateResumeDownload(browser) {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(`${base}/resume.html`, { waitUntil: "load" });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download PDF Resume" }).click()
  ]);
  const suggested = download.suggestedFilename();
  await context.close();
  if (!suggested.toLowerCase().endsWith(".pdf")) throw new Error(`Resume download did not return a PDF: ${suggested}`);
}

const server = await serve();
const browser = await chromium.launch();
try {
  const screenshots = [];
  const linkReport = await validateLinks(browser);
  await validateMobileNav(browser);
  await validateResumeDownload(browser);
  for (const viewport of viewports) {
    for (const pagePath of pages) screenshots.push(await validatePage(browser, pagePath, viewport));
  }
  console.log(JSON.stringify({ ok: true, pages: pages.length, viewports: viewports.length, links: linkReport.links, media: linkReport.media, screenshots: screenshotDir }, null, 2));
} finally {
  await browser.close();
  server.close();
}
