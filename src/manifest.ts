import { getLogger } from "@logtape/logtape";
import { VERSION_MANIFEST_URL } from "./static.ts";
import { ClientJson, clientJsonSchema } from "./types/json/client.ts";
import {
  ManifestVersion,
  VersionManifestJSON,
  versionManifestJSONSchema,
} from "./types/json/version_manifest.ts";
import { checkVesionJsonPresent } from "./utils.ts";

const LOGGER = getLogger(["minecraft-version-json", "manifest"]);

export async function downloadVersionManifest(): Promise<VersionManifestJSON> {
  const data = await fetch(VERSION_MANIFEST_URL);
  LOGGER.debug("Downloaded version manifest from '{url}': {status}", {
    url: VERSION_MANIFEST_URL,
    status: data.status,
  });
  if (data.ok) {
    const json = await data.json();
    const result = versionManifestJSONSchema.parse(json);
    LOGGER.debug("Parsed version manifest: {result}", { result });

    return Promise.resolve(result);
  }

  LOGGER.error("Failed to download version manifest from '{url}': {status}", {
    url: VERSION_MANIFEST_URL,
    status: data.status,
  });

  return Promise.reject(data);
}

export function returnValidVersions(
  data: VersionManifestJSON
): ManifestVersion[] {
  return data.versions.filter((v) => checkVesionJsonPresent(v.id, v.type));
}

export async function downloadClientManifest(url: string): Promise<ClientJson> {
  const data = await fetch(url);
  LOGGER.debug("Downloaded client manifest from '{url}': {status}", {
    url,
    status: data.status,
  });
  if (data.ok) {
    const json = await data.json();
    const result = clientJsonSchema.parse(json);
    LOGGER.debug("Parsed client manifest: {result}", { result });

    return Promise.resolve(result);
  }

  LOGGER.error("Failed to download client manifest from '{url}': {status}", {
    url,
    status: data.status,
  });

  return Promise.reject(data);
}
