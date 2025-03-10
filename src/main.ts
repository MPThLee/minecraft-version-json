import "./logger.ts";
import { getLogger } from "@logtape/logtape";
import { downloadVersionManifest, returnValidVersions } from "./manifest.ts";
import { dirExistsOnStore } from "./utils.ts";
import { extractData } from "./jar.ts";
import { TEMP_DIR } from "./static.ts";
import { trackPromises } from "./progress.ts";

const LOGGER = getLogger(["minecraft-version-json", "main"]);

async function main() {
  LOGGER.info(TEMP_DIR);
  LOGGER.info("Download Manifest..");
  const manifest = await downloadVersionManifest();

  // filter versions...
  let versions = returnValidVersions(manifest);

  // check dir exists on store
  versions = versions.filter((v) => !dirExistsOnStore(v.id));

  LOGGER.info("Start Download...");
  const promiseVersions = versions.map((v) => extractData(v.url, v.id));
  const result = await trackPromises(promiseVersions, {
    title: "Downloading",
  });

  if (result && result.some((r) => r.status === "rejected")) {
    LOGGER.error("Download Failed: {result}", { result });
    Deno.exit(1);
  }

  LOGGER.info("Download Complete: {result}", { result });
  Deno.exit(0);
}

main();
