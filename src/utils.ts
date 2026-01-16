import { parse, greaterOrEqual } from "@std/semver";
import { getLogger } from "@logtape/logtape";
import { existsSync } from "@std/fs";
import { VersionType } from "./types/json/base.ts";
import { STORE_DIR } from "./static.ts";

const LOGGER = getLogger(["minecraft-version-json", "utils"]);

const VER_1_14_0 = parse("1.14.0");
const VER_18w47b = parse("18.47.1");

// New versioning starts from 2026 (year 26)
const NEW_VERSION_MIN_YEAR = 26;

/**
 * Check if a version uses the new 2026+ versioning format.
 * New format: YY.D.H for releases, YY.D-snapshot-N or YY.D.H-snapshot-N for snapshots
 * @param version The version string to check
 * @returns true if the version uses the new format
 */
export function isNewVersionFormat(version: string): boolean {
  // New format starts with 2-digit year >= 26
  // Examples: "26.1", "26.1.1", "26.1-snapshot-1", "26.1.1-snapshot-1"
  const match = version.match(/^(\d{2})\./);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  return year >= NEW_VERSION_MIN_YEAR;
}

/**
 * Convert old-style snapshot version (YYwNNx) to semver format.
 * @param snapshotVersion The snapshot version string (e.g., "23w12a")
 * @returns Semver-compatible string (e.g., "23.12.0")
 */
function oldSnapshotToSemver(snapshotVersion: string): string {
  // 23w12a-blah
  const regex = /(\d{2})w(\d{2})([a-z])(?:-(\w+))?/;

  const result = snapshotVersion.match(regex);
  if (result === null) {
    return snapshotVersion;
  }

  const [_, _major, _minor, patch, extra = null] = result;
  const [major, minor] = [_major, _minor].map((v) => parseInt(v).toString());
  const numPatch = patch.charCodeAt(0) - 97;

  return `${major}.${minor}.${numPatch}` + (extra !== null ? `-${extra}` : "");
}

/**
 * Normalize new-style version to semver format.
 * Handles any suffix: 26.1-snapshot-1, 26.1-pre1, 26.1-rc1, etc.
 * @param version The version string (e.g., "26.1-snapshot-1", "26.1", "26.1.1")
 * @returns Semver-compatible string (e.g., "26.1.0-snapshot-1", "26.1.0", "26.1.1")
 */
function newVersionToSemver(version: string): string {
  // Split base version from suffix (e.g., "26.1" and "snapshot-1")
  const [baseVersion, ...suffixParts] = version.split("-");
  const suffix = suffixParts.length > 0 ? `-${suffixParts.join("-")}` : "";

  // Ensure base version has 3 parts for semver
  const parts = baseVersion.split(".");
  if (parts.length === 2) {
    return `${baseVersion}.0${suffix}`;
  }
  return `${baseVersion}${suffix}`;
}

/**
 * Convert any snapshot version to semver format.
 * Handles both old-style (YYwNNx) and new-style (YY.D-*) formats.
 * @param snapshotVersion The snapshot version string
 * @returns Semver-compatible string
 */
export function snapshotToSemver(snapshotVersion: string): string {
  if (isNewVersionFormat(snapshotVersion)) {
    return newVersionToSemver(snapshotVersion);
  }
  return oldSnapshotToSemver(snapshotVersion);
}

/**
 * Check if a version has version.json embedded in the JAR.
 * This is available for versions >= 1.14.0 (releases) and >= 18w47b (snapshots).
 * All 2026+ versions (new format) are automatically valid.
 */
export function checkVersionJsonPresent(
  version: string,
  type: VersionType,
): boolean {
  // New 2026+ format versions always have version.json
  if (isNewVersionFormat(version)) {
    return true;
  }

  // Old-style snapshots: YYwNNx format (e.g., "23w12a")
  if (
    type === "snapshot" &&
    version.indexOf("w") > 0 &&
    version.indexOf("w") < 3
  ) {
    version = snapshotToSemver(version);
    try {
      const parsedVersion = parse(version);
      return greaterOrEqual(parsedVersion, VER_18w47b);
    } catch (error) {
      LOGGER.error(
        `Got error during compare version '18w47b' and '{version}' : {error}`,
        { version, error },
      );
      throw error;
    }
  }

  // Normalize version to semver (add .0 if needed)
  if (version.indexOf(".") == version.lastIndexOf(".")) {
    const xs = version.split("-");
    version = xs[0] + ".0";
    if (xs.length > 1) {
      version = version + "-" + xs[1];
    }
  }

  // Handle 1.14 Pre-Release format
  if (version.includes("Pre-Release")) {
    if (version.includes("1.14")) {
      version = version.replace("Pre-Release", "-pre").replaceAll(" ", "");
    }
  }

  try {
    const parsedVersion = parse(version);
    return greaterOrEqual(parsedVersion, VER_1_14_0);
  } catch (error) {
    LOGGER.warn(
      `Got error during compare version '1.14.0' and '{version}' : {error}`,
      { version, error },
    );
    return false;
  }
}

export function dirExistsOnStore(dir: string): boolean {
  return existsSync(`${STORE_DIR}/${dir}`);
}

export function checkVersionDataLocallyExist(version: string): boolean {
  return dirExistsOnStore(version);
}

export function checkStoreDirAndCreate(version: string) {
  if (!dirExistsOnStore(version)) {
    Deno.mkdirSync(`${STORE_DIR}/${version}`, { recursive: true });
  }
}
