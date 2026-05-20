#!/usr/bin/env node

/*
 * Local-only repository document sorter.
 *
 * This script copies reviewable repository artifacts into sorted-documents/
 * for manual cleanup review. It never edits, deletes, or moves original files.
 * sorted-documents/ is ignored by Git and must remain local-only.
 */

import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const sortedRoot = path.join(repoRoot, "sorted-documents");
const sourceMapPath = path.join(sortedRoot, "source-map.csv");

const categories = [
  "certifications",
  "resume-experience",
  "projects",
  "home-lab",
  "microsoft-365",
  "sharepoint",
  "powershell-scripts",
  "scripts-automation",
  "validation-reports",
  "screenshots-images",
  "architecture-diagrams",
  "json-yaml-configs",
  "html-documents",
  "markdown-documents",
  "text-notes",
  "archive-generated",
  "review-needed",
];

const includedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".md",
  ".html",
  ".htm",
  ".txt",
  ".csv",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".ps1",
  ".psm1",
  ".psd1",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".mjs",
  ".ts",
  ".css",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".aspx",
]);

const includeKeywords = [
  "sharepoint",
  "onedrive",
  "teams",
  "exchange",
  "m365",
  "microsoft-365",
  "entra",
  "intune",
  "powershell",
  "script",
  "automation",
  "validation",
  "audit",
  "report",
  "evidence",
  "proof",
  "certification",
  "resume",
  "experience",
  "project",
  "home-lab",
  "homelab",
  "architecture",
  "diagram",
  "screenshot",
  "rca",
  "troubleshooting",
  "deployment",
  "runbook",
];

const skippedDirectories = new Set([
  ".git",
  "node_modules",
  "sorted-documents",
  "proof-staging",
  "dist",
  "build",
  ".cache",
  ".tmp",
  "temp",
]);

const imageExtensions = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"]);
const configExtensions = new Set([".json", ".yaml", ".yml", ".xml"]);
const htmlExtensions = new Set([".html", ".htm", ".aspx"]);
const markdownExtensions = new Set([".md"]);
const textExtensions = new Set([".txt", ".csv"]);
const powershellExtensions = new Set([".ps1", ".psm1", ".psd1"]);
const automationExtensions = new Set([".bat", ".cmd", ".sh", ".js", ".mjs", ".ts"]);

function toRepoRelative(targetPath) {
  return path.relative(repoRoot, targetPath).replaceAll(path.sep, "/");
}

function hasIncludedKeyword(relativePath) {
  const lowerPath = relativePath.toLowerCase();
  return includeKeywords.some((keyword) => lowerPath.includes(keyword));
}

function shouldIncludeFile(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  return includedExtensions.has(extension) || hasIncludedKeyword(relativePath);
}

function isSkippedDirectory(entryName) {
  return skippedDirectories.has(entryName.toLowerCase());
}

async function listRepositoryFiles(rootPath) {
  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = [];
  const skipped = new Set();

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      if (isSkippedDirectory(entry.name)) {
        skipped.add(toRepoRelative(entryPath));
        continue;
      }

      const nested = await listRepositoryFiles(entryPath);
      nested.files.forEach((filePath) => files.push(filePath));
      nested.skipped.forEach((directoryPath) => skipped.add(directoryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return { files, skipped };
}

function safeKebabCase(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/[_\s.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function getSha256(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  return hash.digest("hex");
}

function includesAny(value, keywords) {
  const lowerValue = value.toLowerCase();
  return keywords.some((keyword) => lowerValue.includes(keyword));
}

function chooseCategory(relativePath) {
  const lowerPath = relativePath.toLowerCase();
  const extension = path.extname(lowerPath);

  if (includesAny(lowerPath, ["archive", "generated", "export", "converted"]) || lowerPath.includes("docs/automation/")) {
    return "archive-generated";
  }

  if (includesAny(lowerPath, ["sharepoint", ".aspx", "brandguide"])) {
    return "sharepoint";
  }

  if (includesAny(lowerPath, ["m365", "microsoft-365", "onedrive", "teams", "exchange", "entra", "intune"])) {
    return "microsoft-365";
  }

  if (powershellExtensions.has(extension)) {
    return "powershell-scripts";
  }

  if (includesAny(lowerPath, ["script", "automation", "deployment", "runbook"]) || automationExtensions.has(extension)) {
    return "scripts-automation";
  }

  if (includesAny(lowerPath, ["architecture", "topology", "diagram"]) && imageExtensions.has(extension)) {
    return "architecture-diagrams";
  }

  if (imageExtensions.has(extension)) {
    return "screenshots-images";
  }

  if (includesAny(lowerPath, ["validation", "audit", "report", "rca", "troubleshooting"])) {
    return "validation-reports";
  }

  if (includesAny(lowerPath, ["certification", "certifications", "credential"])) {
    return "certifications";
  }

  if (includesAny(lowerPath, ["resume", "experience"])) {
    return "resume-experience";
  }

  if (includesAny(lowerPath, ["home-lab", "homelab"])) {
    return "home-lab";
  }

  if (includesAny(lowerPath, ["project", "evidence", "proof"])) {
    return "projects";
  }

  if (configExtensions.has(extension)) {
    return "json-yaml-configs";
  }

  if (htmlExtensions.has(extension)) {
    return "html-documents";
  }

  if (markdownExtensions.has(extension)) {
    return "markdown-documents";
  }

  if (textExtensions.has(extension)) {
    return "text-notes";
  }

  return "review-needed";
}

async function prepareOutputFolders() {
  await rm(sortedRoot, { force: true, recursive: true });
  await mkdir(sortedRoot, { recursive: true });

  for (const category of categories) {
    await mkdir(path.join(sortedRoot, category), { recursive: true });
  }
}

function buildDestinationPath(sourcePath, category, sha256) {
  const parsedPath = path.parse(sourcePath);
  const safeName = safeKebabCase(parsedPath.name) || "document";
  const extension = parsedPath.ext.toLowerCase();
  const hashSuffix = sha256.slice(0, 10);

  return path.join(sortedRoot, category, `${safeName}-${hashSuffix}${extension}`);
}

async function sortRepositoryDocuments() {
  await prepareOutputFolders();

  const { files, skipped } = await listRepositoryFiles(repoRoot);
  const matchingFiles = files
    .map((filePath) => ({ filePath, relativePath: toRepoRelative(filePath) }))
    .filter(({ relativePath }) => shouldIncludeFile(relativePath));
  const sourceMap = [];
  const folderCounts = Object.fromEntries(categories.map((category) => [category, 0]));

  for (const item of matchingFiles) {
    const fileStats = await stat(item.filePath);
    const sha256 = await getSha256(item.filePath);
    const extension = path.extname(item.filePath).toLowerCase().replace(".", "");
    const category = chooseCategory(item.relativePath);
    const destinationPath = buildDestinationPath(item.filePath, category, sha256);

    await copyFile(item.filePath, destinationPath);
    folderCounts[category] += 1;

    sourceMap.push({
      originalPath: item.relativePath,
      copiedPath: toRepoRelative(destinationPath),
      category,
      extension,
      fileSize: fileStats.size,
      sha256,
    });
  }

  sourceMap.sort((left, right) => left.originalPath.localeCompare(right.originalPath));

  const csvHeader = ["originalPath", "copiedPath", "category", "extension", "fileSize", "sha256"];
  const csvRows = sourceMap.map((row) => csvHeader.map((field) => csvEscape(row[field])).join(","));
  await writeFile(sourceMapPath, `${csvHeader.join(",")}\n${csvRows.join("\n")}\n`, "utf8");

  console.log("Repository documents copied into local-only sorted-documents/.");
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files copied: ${sourceMap.length}`);
  console.log(`Skipped folders: ${[...skipped].sort().join(", ") || "none"}`);
  console.log("Folder counts:");
  for (const category of categories) {
    console.log(`- ${category}: ${folderCounts[category]}`);
  }
  console.log(`Source map: ${toRepoRelative(sourceMapPath)}`);
  console.log("Original files were not modified, deleted, or moved.");
}

await sortRepositoryDocuments();
