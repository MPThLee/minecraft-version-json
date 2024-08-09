import { parse, greaterOrEqual } from "https://deno.land/std@0.224.0/semver/mod.ts";
import { getLogger } from "https://deno.land/std@0.224.0/log/mod.ts";
import { existsSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { VersionType } from "./types/json/base.ts";
import { STORE_DIR } from "./static.ts";

const LOGGER = getLogger();

const VER_1_14_0 = parse("1.14.0");
const VER_18w47b = parse("18.47.1");


export function snapshotToSemver(snapshotVersion: string): string {
  // 23w12a-blah
  const regex = new RegExp(/(\d{2})w(\d{2})([a-z])(?:-(\w+))?/);

  const result = snapshotVersion.match(regex);
  if (result === null) {
    return snapshotVersion;
  }

  const [_, _major, _minor, patch, extra = null] = result;
  const [major, minor] = [_major, _minor].map((v) => parseInt(v).toString());
  const numPatch = patch.charCodeAt(0) - 97;

  return `${major}.${minor}.${numPatch}` + (extra !== null ? `-${extra}` : "");
}

export function checkVesionJsonPresent(
  version: string,
  type: VersionType
): boolean {
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
      LOGGER.error(`Got error during compare version '18w47b' and '${version}' : ${error}`);
      throw error;
    }
  }

  if (version.indexOf(".") == version.lastIndexOf(".")) {
    const xs = version.split("-");
    version = xs[0] + ".0";
    if (xs.length > 1) {
      version = version + "-" + xs[1];
    }
  }

  // ?????
  if (version.includes("Pre-Release")) {
    // Only 1.14 variants.
    if (version.includes("1.14")) {
      version = version.replace("Pre-Release", "-pre").replaceAll(" ", "");
    }
  }

  // Failed to false
  try {
    const parsedVersion = parse(version);
    return greaterOrEqual(parsedVersion, VER_1_14_0);
  } catch (error) {
    // Use warning as this is optional.
    LOGGER.warn(`Got error during compare version '1.14.0' and '${version}' : ${error}`)
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
