#!/usr/bin/env node

/*
 * Proof staging is intentionally local-only.
 *
 * The proof-staging/ folder is ignored by Git because it may contain sorted,
 * filed, copied, inventoried, or staged proof documents used for local review.
 * Keep reusable automation in this script, and keep generated proof-staging
 * content out of commits.
 */

import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const sourceRoots = [
  path.join(repoRoot, "evidence", "public"),
  path.join(repoRoot, "evidence", "experience"),
];
const stagingRoot = path.join(repoRoot, "proof-staging");
const inventoryRoot = path.join(stagingRoot, "inventory");
const copiedRoot = path.join(stagingRoot, "active-proof");
const inventoryPath = path.join(inventoryRoot, "proof-inventory.json");
const readmePath = path.join(stagingRoot, "README.md");

const ignoredDirectoryNotice = [
  "# Proof Staging",
  "",
  "This folder is generated for local proof review only.",
  "",
  "It is intentionally ignored by Git. Do not commit sorted, filed, copied, inventoried, or staged proof documents from this folder.",
  "",
  "Run `node scripts/stage-proof-documents.mjs` to rebuild the local staging area from repository evidence sources.",
  "",
].join("\n");

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function listFiles(rootPath) {
  if (!(await pathExists(rootPath))) {
    return [];
  }

  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(rootPath, entry.name);

      if (entry.isDirectory()) {
        return listFiles(entryPath);
      }

      if (!entry.isFile()) {
        return [];
      }

      return [entryPath];
    }),
  );

  return files.flat();
}

function toRepoRelative(targetPath) {
  return path.relative(repoRoot, targetPath).replaceAll(path.sep, "/");
}

function getProofCategory(relativePath) {
  const extension = path.extname(relativePath).toLowerCase().replace(".", "");

  if (["md", "html", "txt", "log"].includes(extension)) {
    return "documentation";
  }

  if (["json", "yaml", "yml", "csv", "xml"].includes(extension)) {
    return "data";
  }

  if (["ps1", "patch"].includes(extension)) {
    return "automation";
  }

  if (["svg", "png", "jpg", "jpeg", "webp"].includes(extension)) {
    return "visuals";
  }

  return "other";
}

async function stageProofDocuments() {
  await rm(stagingRoot, { force: true, recursive: true });
  await mkdir(inventoryRoot, { recursive: true });
  await mkdir(copiedRoot, { recursive: true });

  const sourceFiles = (await Promise.all(sourceRoots.map(listFiles))).flat();
  const inventory = [];

  for (const sourcePath of sourceFiles) {
    const sourceRelative = toRepoRelative(sourcePath);
    const category = getProofCategory(sourceRelative);
    const destinationPath = path.join(copiedRoot, category, path.basename(sourcePath));
    const fileStats = await stat(sourcePath);

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);

    inventory.push({
      source: sourceRelative,
      staged: toRepoRelative(destinationPath),
      category,
      bytes: fileStats.size,
    });
  }

  inventory.sort((left, right) => left.source.localeCompare(right.source));

  await writeFile(readmePath, ignoredDirectoryNotice, "utf8");
  await writeFile(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

  console.log("Proof staging rebuilt as local-only content.");
  console.log(`Generated ${toRepoRelative(readmePath)}.`);
  console.log(`Inventoried ${inventory.length} proof document(s).`);
  console.log("proof-staging/ is ignored by Git; staged proof documents should not appear in git status.");
}

await stageProofDocuments();
